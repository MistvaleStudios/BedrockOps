import { spawn } from 'bun';
import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import config from '../../config.json';
import { performUpdate } from '../services/updater';
import { applyMinecraftColours } from '../utils/colours';
import { formatLog, logErr, logOps } from '../utils/logger';

const LOG_REGEX = /^\[(.*?) (INFO|WARN|ERROR)\]\s*(.*)$/;
const PLAYER_REGEX = /^Player (connected|disconnected): (.+?), xuid:/;

const DEV_RESTART_DELAY = 5;
const ACTIVE_RESTART_DELAY = 300;
const WARNING_TIMES = [300, 120, 60, 30, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

function splitDuration(seconds: number): { value: number; unit: string } {
	const value = seconds >= 60 ? seconds / 60 : seconds;
	const unit = `${seconds >= 60 ? 'minute' : 'second'}${value === 1 ? '' : 's'}`;

	return { value, unit };
}

function formatDuration(seconds: number): string {
	const { value, unit } = splitDuration(seconds);

	return `${value} ${unit}`;
}

function formatCountdown(verb: string, seconds: number): string {
	const { value, unit } = splitDuration(seconds);
	const colour = seconds >= 300 ? '§a' : seconds >= 60 ? '§e' : '§c';
	const text = `§o§7[Console]: §f${verb} in §r§l${colour}${value}§r §o§f${unit}§r`;

	return `tellraw @a ${JSON.stringify({ rawtext: [{ text }] })}`;
}

export class ServerManager {
	private server: any = null;
	private serverName: string = 'Dedicated Server';
	private isRestarting: boolean = false;
	private isUpdating: boolean = false;
	private players: Set<string> = new Set();
	private pendingTimers: ReturnType<typeof setTimeout>[] = [];

	private loadServerName(): void {
		const propsPath = join(config.serverPath, 'server.properties');

		if (existsSync(propsPath)) {
			const props = readFileSync(propsPath, 'utf-8');
			const match = props.match(/^server-name=(.*)$/m);

			if (match) this.serverName = match[1]?.trim() as string;
		}
	}

	public start(): void {
		this.loadServerName();
		this.players.clear();

		this.server = spawn([config.executable], {
			cwd: config.serverPath,
			stdin: 'pipe',
			stdout: 'pipe',
		});

		console.log(chalk.green(`✅ BDS started with PID: ${this.server.pid}\n`));

		this.streamOutput(this.server);
		this.server.exited.then((code: number) => {
			this.handleExit(code);
		});
	}

	public sendCommand(cmd: string): void {
		if (this.server?.stdin) {
			this.server.stdin.write(Buffer.from(`${cmd}\n`, 'latin1'));
		}
	}

	public restart(reason: 'restart' | 'update' = 'restart', dev: boolean = false): void {
		if (!this.server?.stdin) return;

		if (this.isRestarting || this.isUpdating) {
			logOps('A restart is already scheduled.');
			return;
		}

		const delay = !dev && this.players.size > 0 ? ACTIVE_RESTART_DELAY : DEV_RESTART_DELAY;
		const verb = reason === 'update' ? 'Updating to the latest version' : 'Restarting';

		if (reason === 'update') {
			this.isUpdating = true;
			logOps(`Initiating update process in ${formatDuration(delay)} (${this.players.size} online)...`);
		} else {
			this.isRestarting = true;
			logOps(`Initiating graceful restart in ${formatDuration(delay)} (${this.players.size} online)...`);
		}

		for (const warnAt of WARNING_TIMES) {
			if (warnAt > delay) continue;

			this.pendingTimers.push(
				setTimeout(() => {
					this.sendCommand(formatCountdown(verb, warnAt));
				}, (delay - warnAt) * 1000),
			);
		}

		this.pendingTimers.push(
			setTimeout(() => {
				this.sendCommand('stop');
			}, delay * 1000),
		);
	}

	private clearPendingTimers(): void {
		for (const timer of this.pendingTimers) clearTimeout(timer);

		this.pendingTimers = [];
	}

	private async handleExit(code: number): Promise<void> {
		this.clearPendingTimers();

		if (this.isUpdating) {
			logOps('Process stopped. Starting update sequence...');

			this.isUpdating = false;

			await performUpdate();

			console.clear();

			this.start();
		} else if (this.isRestarting) {
			logOps('Process stopped. Rebooting now...');

			this.isRestarting = false;

			console.clear();

			this.start();
		} else if (code !== 0 && config.autoRestartOnCrash) {
			logErr(`Server crashed (Code ${code}). Auto-restarting in 3 seconds...`);

			setTimeout(() => {
				console.clear();

				this.start();
			}, 3000);
		} else {
			logOps('Server exited gracefully. Shutting down wrapper.');

			process.exit(0);
		}
	}

	private trackPlayers(message: string): void {
		const match = message.match(PLAYER_REGEX);

		if (!match) return;

		const name = match[2] as string;

		if (match[1] === 'connected') this.players.add(name);
		else this.players.delete(name);
	}

	private async streamOutput(currentServer: any): Promise<void> {
		const reader = currentServer.stdout.getReader();

		let buffer = '';
		let lastTime = '00:00:00';
		let lastLevel = chalk.green('INF');

		while (true) {
			const { done, value } = await reader.read();

			if (done) break;

			buffer += new TextDecoder().decode(value);

			const lines = buffer.split('\n');

			buffer = lines.pop() || '';

			for (const line of lines) {
				const cleanLine = line.trimEnd();

				if (!cleanLine) continue;

				const match = cleanLine.match(LOG_REGEX);

				if (match) {
					const [_, fullTimestamp, level, message] = match;

					lastTime = fullTimestamp?.split(' ')[1]?.slice(0, 8) || '00:00:00';

					if (level === 'WARN') lastLevel = chalk.yellow('WRN');
					else if (level === 'ERROR') lastLevel = chalk.red('ERR');
					else lastLevel = chalk.green('INF');
					if (message) {
						this.trackPlayers(message);
						console.log(formatLog(lastLevel, (l) => l, this.serverName, applyMinecraftColours(message)));
					}
				} else {
					console.log(formatLog(lastLevel, (l) => l, this.serverName, applyMinecraftColours(cleanLine)));
				}
			}
		}
	}
}

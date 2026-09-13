import { spawn } from 'bun';
import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import config from '../../config.json';
import { performUpdate } from '../services/updater';
import { applyMinecraftColours } from '../utils/colours';
import { formatLog, logErr, logOps } from '../utils/logger';

const LOG_REGEX = /^\[(.*?) (INFO|WARN|ERROR)\]\s*(.*)$/;

export class ServerManager {
	private server: any = null;
	private serverName: string = 'Dedicated Server';
	private isRestarting: boolean = false;
	private isUpdating: boolean = false;

	constructor() {
		this.loadServerName();
	}

	private loadServerName(): void {
		const propsPath = join(config.serverPath, 'server.properties');

		if (existsSync(propsPath)) {
			const props = readFileSync(propsPath, 'utf-8');
			const match = props.match(/^server-name=(.*)$/m);

			if (match) this.serverName = match[1]?.trim() as string;
		}
	}

	public start(): void {
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
			this.server.stdin.write(`${cmd}\n`);
		}
	}

	public restart(reason: 'restart' | 'update' = 'restart'): void {
		if (!this.server?.stdin) return;
		if (reason === 'update') {
			this.isUpdating = true;
			logOps('Initiating update process...');
			this.sendCommand('say Server is updating to the latest version in 5 seconds!');
		} else {
			this.isRestarting = true;
			logOps('Initiating graceful restart...');
			this.sendCommand('say Server is restarting in 5 seconds!');
		}

		setTimeout(() => {
			this.sendCommand('stop');
		}, 5000);
	}

	private async handleExit(code: number): Promise<void> {
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
						console.log(formatLog(lastLevel, (l) => l, this.serverName, applyMinecraftColours(message)));
					}
				} else {
					console.log(formatLog(lastLevel, (l) => l, this.serverName, applyMinecraftColours(cleanLine)));
				}
			}
		}
	}
}

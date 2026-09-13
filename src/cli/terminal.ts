import * as readline from 'readline';
import type { ServerManager } from '../server/manager';
import { applyMinecraftColours } from '../utils/colours';
import { logCmd, logOps } from '../utils/logger';

export function initializeCLI(manager: ServerManager): readline.Interface {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false,
	});

	rl.on('line', (input) => {
		readline.moveCursor(process.stdout, 0, -1);
		readline.clearLine(process.stdout, 0);

		const command = input.trim();

		if (!command) return;

		logCmd(applyMinecraftColours(command));

		if (command.startsWith('ops ')) {
			handleOpsCommand(command, manager);
		} else {
			manager.sendCommand(command);
		}
	});

	return rl;
}

function handleOpsCommand(command: string, manager: ServerManager): void {
	const args = command.split(' ').slice(1);
	const action = args[0];

	switch (action) {
		case 'help':
			logOps('Available commands: help, status, restart, update');
			break;

		case 'status':
			const memory = Math.round(process.memoryUsage().rss / 1024 / 1024);
			const uptime = Math.round(process.uptime());

			logOps(`Uptime: ${uptime}s | Wrapper RAM: ${memory}MB`);
			break;

		case 'restart':
			manager.restart('restart');
			break;

		case 'update':
			manager.restart('update');
			break;

		default:
			logOps("Unknown command. Type 'ops help' to see options.");
			break;
	}
}

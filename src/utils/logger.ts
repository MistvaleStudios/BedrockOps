import chalk from 'chalk';
import config from '../../config.json';

export function formatLog(tag: string, tagColor: (str: string) => string, name: string, message: string): string {
	const timeStr = config.logTimestamps ? chalk.gray(`${new Date().toLocaleTimeString('en-US', { hour12: false })} `) : '';
	const separator = chalk.gray('|');

	return `${timeStr}${tagColor(tag)} ${separator} ${chalk.cyan(name)} ${message}`;
}

export function logOps(message: string): void {
	console.log(formatLog('OPS', chalk.blue, 'BedrockOps', message));
}

export function logErr(message: string): void {
	console.log(formatLog('ERR', chalk.red, 'BedrockOps', message));
}

export function logCmd(message: string): void {
	console.log(formatLog('CMD', chalk.magenta, 'Console', message));
}

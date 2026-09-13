import chalk from 'chalk';
import { initializeCLI } from './cli/terminal';
import { ServerManager } from './server/manager';

console.log(chalk.magenta('🚀 Starting BedrockOps...'));

const serverManager = new ServerManager();

serverManager.start();

initializeCLI(serverManager);

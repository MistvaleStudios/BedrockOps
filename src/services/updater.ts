import AdmZip from 'adm-zip';
import chalk from 'chalk';
import { existsSync, renameSync, rmSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import config from '../../config.json';
import { logErr, logOps } from '../utils/logger';

const ITEMS_TO_PRESERVE = ['allowlist.json', 'behavior_packs', 'config', 'development_behavior_packs', 'development_resource_packs', 'permissions.json', 'resource_packs', 'server.properties', 'system_behavior_packs', 'system_resource_packs'];

export async function performUpdate(): Promise<boolean> {
	try {
		logOps('Checking Mojang for latest Bedrock Server version...');

		const res = await fetch('https://net-secondary.web.minecraft-services.net/api/v1.0/download/links', {
			headers: { 'User-Agent': 'BedrockOps/1.0' },
		});

		if (!res.ok) throw new Error(`Mojang API rejected the request: ${res.status}`);

		const data: any = await res.json();
		const windowsLink = data.result.links.find((l: any) => l.downloadType === 'serverBedrockWindows');

		if (!windowsLink?.downloadUrl) {
			throw new Error('Mojang API did not return a valid Windows download link.');
		}

		const downloadUrl: string = windowsLink.downloadUrl;
		const versionMatch = downloadUrl.match(/bedrock-server-([0-9\.]+)\.zip/i);
		const version = versionMatch ? versionMatch[1] : 'Unknown';

		logOps(`Found version: ${chalk.green(version)}. Downloading...`);

		const zipRes = await fetch(downloadUrl);
		const arrayBuffer = await zipRes.arrayBuffer();
		const zipPath = join(config.serverPath, 'update.zip');

		writeFileSync(zipPath, Buffer.from(arrayBuffer));

		logOps('Download complete. Extracting...');

		for (const item of ITEMS_TO_PRESERVE) {
			const fullPath = join(config.serverPath, item);

			if (existsSync(fullPath)) {
				renameSync(fullPath, `${fullPath}.backup`);
			}
		}

		const zip = new AdmZip(zipPath);

		zip.extractAllTo(config.serverPath, true);

		for (const item of ITEMS_TO_PRESERVE) {
			const backupPath = join(config.serverPath, `${item}.backup`);
			const currentPath = join(config.serverPath, item);

			if (existsSync(backupPath)) {
				if (existsSync(currentPath)) {
					const trashPath = join(config.serverPath, `${item}.trash`);

					if (existsSync(trashPath)) {
						try {
							rmSync(trashPath, { recursive: true, force: true });
						} catch (e) {}
					}

					renameSync(currentPath, trashPath);

					try {
						rmSync(trashPath, { recursive: true, force: true });
					} catch (e) {}
				}

				renameSync(backupPath, currentPath);
			}
		}

		try {
			unlinkSync(zipPath);
		} catch (e) {}

		const versionParsed = version?.match(/^1\.(\d+\.\d+)/);
		const displayVersion = versionParsed ? versionParsed[1] : version;

		writeFileSync(join(config.serverPath, 'version.txt'), displayVersion as string);

		logOps('Update applied successfully!');
		return true;
	} catch (error: any) {
		logErr(`Update failed: ${error.message}`);
		logOps('Initiating rollback to prevent server corruption...');

		for (const item of ITEMS_TO_PRESERVE) {
			const backupPath = join(config.serverPath, `${item}.backup`);
			const currentPath = join(config.serverPath, item);

			if (existsSync(backupPath)) {
				if (existsSync(currentPath)) {
					const trashPath = join(config.serverPath, `${item}.trash`);

					try {
						renameSync(currentPath, trashPath);
					} catch (e) {}
				}
				try {
					renameSync(backupPath, currentPath);
				} catch (e) {}
			}
		}

		return false;
	}
}

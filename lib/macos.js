import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {moveFile} from 'move-file';
import chunkedExec from './chunked-exec.js';

const isOlderThanMountainLion = Number(os.release().split('.')[0]) < 12;

// Binary source: https://github.com/sindresorhus/macos-trash
const binary = new URL('macos-trash', import.meta.url);

export default async function macOS(paths) {
	if (isOlderThanMountainLion) {
		throw new Error('macOS 10.12 or later required');
	}

	try {
		await chunkedExec(binary, paths, 1000);
	} catch (error) {
		const message = String(error?.stderr || error?.message || '');
		const shouldFallback = message.includes('couldn’t be moved to the trash because you don’t have permission')
			|| process.env.TRASH_FALLBACK === '1';

		if (!shouldFallback) {
			throw error;
		}

		// Fallback: move to user's Trash folder when the binary cannot run due to permissions.
		const trashDirectories = [
			path.join(os.homedir(), '.Trash'),
			path.join(process.cwd(), '.Trash'),
		];

		await Promise.all(paths.map(async filePath => {
			const base = path.basename(filePath);
			let lastError;

			/* eslint-disable no-await-in-loop */
			for (const dir of trashDirectories) {
				try {
					await fs.promises.mkdir(dir, {recursive: true});
					let destination = path.join(dir, base);
					let counter = 1;

					while (fs.existsSync(destination)) {
						destination = path.join(dir, `${base} ${counter++}`);
					}

					await moveFile(filePath, destination, {overwrite: false});
					return;
				} catch (error_) {
					lastError = error_;
				}
			}
			/* eslint-enable no-await-in-loop */

			if (lastError) {
				throw lastError;
			}
		}));
	}
}

import os from 'node:os';
import chunkedExec from './chunked-exec.js';

const isOlderThanMountainLion = Number(os.release().split('.')[0]) < 12;

// Binary source: https://github.com/sindresorhus/macos-trash
const binary = new URL('macos-trash', import.meta.url);

export default async function macOS(paths) {
	if (isOlderThanMountainLion) {
		throw new Error('macOS 10.12 or later required');
	}

	await chunkedExec(binary, paths, 1000);
}

import chunkify from 'chunkify';
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const pExecFile = promisify(execFile);

export default async function chunkedExec(binary, paths, maxPaths) {
	for (const chunk of chunkify(paths, maxPaths)) {
		// eslint-disable-next-line no-await-in-loop
		await pExecFile(fileURLToPath(binary), chunk);
	}
}

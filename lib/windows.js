import chunkedExec from './chunked-exec.js';

// Binary source: https://github.com/sindresorhus/recycle-bin
const binary = new URL('windows-trash.exe', import.meta.url);

export default async function windows(paths) {
	await chunkedExec(binary, paths, 200);
}

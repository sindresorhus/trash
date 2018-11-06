'use strict';
const {promisify} = require('util');
const os = require('os');
const path = require('path');
const {execFile} = require('child_process');
const escapeStringApplescript = require('escape-string-applescript');
const runApplescript = require('run-applescript');

const isOlderThanMountainLion = Number(os.release().split('.')[0]) < 12;
const pExecFile = promisify(execFile);

// Binary source: https://github.com/sindresorhus/macos-trash
const binary = path.join(__dirname, 'macos-trash');

const legacy = async paths => {
	const pathString = paths.map(x => `"${escapeStringApplescript(x)}"`).join(',');

	const script = `
set deleteList to {}
repeat with currentPath in {${pathString}}
set end of deleteList to POSIX file currentPath
end repeat
tell app "Finder" to delete deleteList
		`.trim();

	try {
		await runApplescript(script);
	} catch (error) {
		let newError = error;

		if (/10010/.test(newError.message)) {
			newError = new Error('Item doesn\'t exist');
		}

		throw newError;
	}
};

module.exports = async paths => {
	if (isOlderThanMountainLion) {
		await legacy(paths);
		return;
	}

	await pExecFile(binary, paths);
};

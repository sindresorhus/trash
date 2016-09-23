'use strict';
const os = require('os');
const path = require('path');
const execFile = require('child_process').execFile;
const escapeStringApplescript = require('escape-string-applescript');
const runApplescript = require('run-applescript');
const pify = require('pify');

const olderThanMountainLion = Number(os.release().split('.')[0]) < 12;

// binary source: https://github.com/sindresorhus/macos-trash
const bin = path.join(__dirname, 'macos-trash');

function legacy(paths) {
	const pathStr = paths.map(x => `"${escapeStringApplescript(x)}"`).join(',');
	const script = `
set deleteList to {}
repeat with currentPath in {${pathStr}}
set end of deleteList to POSIX file currentPath
end repeat
tell app "Finder" to delete deleteList
	`.trim();

	return runApplescript(script).catch(err => {
		if (/10010/.test(err.message)) {
			err = new Error('Item doesn\'t exist');
		}

		throw err;
	});
}

module.exports = paths => {
	if (olderThanMountainLion) {
		return legacy(paths);
	}

	return pify(execFile)(bin, paths);
};

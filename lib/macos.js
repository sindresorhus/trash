'use strict';
const {promisify} = require('util');
const os = require('os');
const path = require('path');
const {execFile} = require('child_process');

const isOlderThanMountainLion = Number(os.release().split('.')[0]) < 12;
const pExecFile = promisify(execFile);

// Binary source: https://github.com/sindresorhus/macos-trash
const binary = path.join(__dirname, 'macos-trash');

module.exports = async paths => {
	if (isOlderThanMountainLion) {
		throw new Error('macOS 10.12 or later required');
	}

	await pExecFile(binary, paths);
};

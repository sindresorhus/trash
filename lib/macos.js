'use strict';
const os = require('os');
const path = require('path');
const chunkedExec = require('./chunked-exec.js');

const isOlderThanMountainLion = Number(os.release().split('.')[0]) < 12;

// Binary source: https://github.com/sindresorhus/macos-trash
const binary = path.join(__dirname, 'macos-trash');

module.exports = async paths => {
	if (isOlderThanMountainLion) {
		throw new Error('macOS 10.12 or later required');
	}

	await chunkedExec(binary, paths, 1000);
};

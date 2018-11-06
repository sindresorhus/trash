'use strict';
const {promisify} = require('util');
const path = require('path');
const {execFile} = require('child_process');

const pExecFile = promisify(execFile);

// Binary source: https://github.com/sindresorhus/recycle-bin
const binary = path.join(__dirname, 'win-trash.exe');

module.exports = async paths => {
	await pExecFile(binary, paths);
};

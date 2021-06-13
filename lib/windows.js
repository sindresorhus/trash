'use strict';
const path = require('path');
const chunkedExec = require('./chunked-exec.js');

// Binary source: https://github.com/sindresorhus/recycle-bin
const binary = path.join(__dirname, 'windows-trash.exe');

module.exports = async paths => {
	await chunkedExec(binary, paths, 200);
};

'use strict';
const path = require('path');
const execFile = require('child_process').execFile;
const pify = require('pify');

// Binary source: https://github.com/sindresorhus/recycle-bin
const bin = path.join(__dirname, 'win-trash.exe');

module.exports = paths => pify(execFile)(bin, paths);

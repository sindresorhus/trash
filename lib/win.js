'use strict';
const path = require('path');
const execFile = require('child_process').execFile;
const pify = require('pify');

// Binary source: https://github.com/sindresorhus/recycle-bin
const bin = dir => path.join(dir, 'win-trash.exe');

module.exports = (paths, dir=__dirname) => pify(execFile)(bin(dir), paths);

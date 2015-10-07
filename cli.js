#!/usr/bin/env node
'use strict';
var updateNotifier = require('update-notifier');
var meow = require('meow');
var pathExists = require('path-exists');
var trash = require('./');

var cli = meow({
	help: [
		'Usage',
		'  $ trash <path> [<path> ...]',
		'',
		'Example',
		'  $ trash unicorn.png rainbow.png'
	]
}, {
	string: ['_']
});

updateNotifier({pkg: cli.pkg}).notify();

if (cli.input.length === 0) {
	console.error('You need to specify at least one path');
	process.exit(1);
}

var promises = cli.input.map(function (el) {
	return pathExists(el)
		.then(function (exists) {
			if (exists) {
				return el;
			}
		});
});

Promise.all(promises)
	.then(function (files) {
		return files.filter(function (file) {
			return file !== undefined;
		});
	})
	.then(trash);

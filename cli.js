#!/usr/bin/env node
'use strict';
var updateNotifier = require('update-notifier');
var meow = require('meow');
var pathExists = require('path-exists');
var Promise = require('pinkie-promise');
var trash = require('./');

var cli = meow([
	'Usage',
	'  $ trash <path> [<path> ...]',
	'',
	'Example',
	'  $ trash unicorn.png rainbow.png'
], {
	string: ['_']
});

updateNotifier({pkg: cli.pkg}).notify();

if (cli.input.length === 0) {
	console.error('You need to specify at least one path');
	process.exit(1);
}

Promise.all(cli.input.map(function (el) {
	return pathExists(el).then(function (exists) {
		return exists ? el : null;
	});
})).then(function (files) {
	return trash(files.filter(Boolean));
});

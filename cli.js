#!/usr/bin/env node
'use strict';
var updateNotifier = require('update-notifier');
var argv = require('minimist')(process.argv.slice(2), {string: ['_']});
var pkg = require('./package.json');
var trash = require('./');
var input = argv._;

function help() {
	console.log([
		pkg.description,
		'',
		'Usage',
		'  $ trash <path> [<path> ...]',
		'',
		'Example',
		'  $ trash unicorn.png rainbow.png'
	].join('\n'));
}

updateNotifier({
	packageName: pkg.name,
	packageVersion: pkg.version
}).notify();

if (argv.version) {
	console.log(pkg.version);
	return;
}

if (input.length === 0 || argv.help) {
	help();
	return;
}

trash(input, function (err) {
	if (err) {
		console.error(err.message);
		process.exit(1);
	}
});

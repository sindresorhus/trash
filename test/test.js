'use strict';
var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var pathExists = require('path-exists');
var trash = require('../');

process.chdir(__dirname);

it('should trash files', function (cb) {
	var weirdName = process.platform === 'darwin' ? 'weird\\\\name\\"\'' : 'fixture3';

	fs.writeFileSync('fixture', '');
	fs.writeFileSync('fixture2', '');
	fs.writeFileSync(weirdName, '');
	fs.writeFileSync('123');
	assert(pathExists.sync('fixture'));
	assert(pathExists.sync('fixture2'));
	assert(pathExists.sync(weirdName));
	assert(pathExists.sync('123'));

	trash([
		'fixture',
		'fixture2',
		weirdName,
		123
	], function (err) {
		assert(!err, err);
		assert(!pathExists.sync('fixture'));
		assert(!pathExists.sync('fixture2'));
		assert(!pathExists.sync(weirdName));
		assert(!pathExists.sync('123'));
		cb();
	});
});

it('should trash a dir', function (cb) {
	var d1f1 = path.join('fdir', 'fixture');
	var d1f2 = path.join('fdir', 'fixture2');
	var d2f1 = path.join('321', 'fixture');
	var d2f2 = path.join('321', 'fixture2');

	fs.mkdirSync('fdir');
	fs.writeFileSync(d1f1, '');
	fs.writeFileSync(d1f2, '');
	assert(pathExists.sync(d1f1));
	assert(pathExists.sync(d1f2));

	fs.mkdirSync('321');
	fs.writeFileSync(d2f1, '');
	fs.writeFileSync(d2f2, '');
	assert(pathExists.sync(d2f1));
	assert(pathExists.sync(d2f2));

	trash([
		'fdir',
		321
	], function (err) {
		assert(!err, err);
		assert(!pathExists.sync('fdir'));
		assert(!pathExists.sync(321));
		cb();
	});
});

it('should skip missing files', function (cb) {
	childProcess.execFile(path.join(__dirname, '../cli.js'), [
		'foobar',
		'unicorn'
	], function (err) {
		assert(!err, err);
		cb();
	});
});

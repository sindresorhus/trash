import fs from 'fs';
import path from 'path';
import {execFile} from 'child_process';
import test from 'ava';
import pathExists from'path-exists';
import fn from '../';

process.chdir(__dirname);

test('trash files', async t => {
	const weirdName = process.platform === 'darwin' ? 'weird\\\\name\\"\'' : 'fixture3';

	fs.writeFileSync('fixture', '');
	fs.writeFileSync('fixture2', '');
	fs.writeFileSync(weirdName, '');
	fs.writeFileSync('123');

	t.true(pathExists.sync('fixture'));
	t.true(pathExists.sync('fixture2'));
	t.true(pathExists.sync(weirdName));
	t.true(pathExists.sync('123'));

	await fn(['fixture', 'fixture2', weirdName, 123]);

	t.false(pathExists.sync('fixture'));
	t.false(pathExists.sync('fixture2'));
	t.false(pathExists.sync(weirdName));
	t.false(pathExists.sync('123'));
});

test('trash a dir', async t => {
	const d1f1 = path.join('fdir', 'fixture');
	const d1f2 = path.join('fdir', 'fixture2');
	const d2f1 = path.join('321', 'fixture');
	const d2f2 = path.join('321', 'fixture2');

	fs.mkdirSync('fdir');
	fs.writeFileSync(d1f1, '');
	fs.writeFileSync(d1f2, '');

	t.true(pathExists.sync(d1f1));
	t.true(pathExists.sync(d1f2));

	fs.mkdirSync('321');
	fs.writeFileSync(d2f1, '');
	fs.writeFileSync(d2f2, '');

	t.true(pathExists.sync(d2f1));
	t.true(pathExists.sync(d2f2));

	await fn(['fdir', 321]);

	t.false(pathExists.sync('fdir'));
	t.false(pathExists.sync(321));
});

test('skip missing files', t => {
	execFile(path.join(__dirname, '../cli.js'), [
		'foobar',
		'unicorn'
	], function (err) {
		t.ifError(err);
		t.end();
	})
});

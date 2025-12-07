import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import tempfile from 'tempfile';
import trash from './index.js';

const temporaryDirectory = tempfile();
fs.mkdirSync(temporaryDirectory);
process.chdir(temporaryDirectory);

test('files', async () => {
	const weirdName = process.platform === 'darwin' ? String.raw`weird\\name\"'` : 'fixture3';

	fs.writeFileSync('fixture', '');
	fs.writeFileSync('fixture2', '');
	fs.writeFileSync(weirdName, '');
	fs.writeFileSync('123', '');
	assert.ok(fs.existsSync('fixture'));
	assert.ok(fs.existsSync('fixture2'));
	assert.ok(fs.existsSync(weirdName));
	assert.ok(fs.existsSync('123'));

	await trash([
		'fixture',
		'fixture2',
		weirdName,
		123,
	]);

	assert.ok(!fs.existsSync('fixture'));
	assert.ok(!fs.existsSync('fixture2'));
	assert.ok(!fs.existsSync(weirdName));
	assert.ok(!fs.existsSync('123'));
});

test('glob', async () => {
	fs.writeFileSync('fixture.jpg', '');
	fs.writeFileSync('fixture.png', '');
	assert.ok(fs.existsSync('fixture.jpg'));
	assert.ok(fs.existsSync('fixture.png'));

	await trash([
		'*.jpg',
	]);

	assert.ok(!fs.existsSync('fixture.jpg'));
	assert.ok(fs.existsSync('fixture.png'));
});

test('no glob', async () => {
	if (process.platform !== 'win32') {
		fs.writeFileSync('fixture-noglob*.js', '');
	}

	fs.writeFileSync('fixture-noglob1.js', '');

	await trash(['fixture-noglob*.js'], {glob: false});

	assert.ok(!fs.existsSync('fixture-noglob*.js'));
	assert.ok(fs.existsSync('fixture-noglob1.js'));
});

test('string pattern', async () => {
	fs.writeFileSync('a', '');
	fs.writeFileSync('b', '');
	fs.writeFileSync('ab', '');
	assert.ok(fs.existsSync('a'));
	assert.ok(fs.existsSync('b'));
	assert.ok(fs.existsSync('ab'));

	await trash('ab');

	assert.ok(!fs.existsSync('ab'));
	assert.ok(fs.existsSync('a'));
	assert.ok(fs.existsSync('b'));
});

test('directories', async () => {
	const d1f1 = path.join('fdir', 'fixture');
	const d1f2 = path.join('fdir', 'fixture2');
	const d2f1 = path.join('321', 'fixture');
	const d2f2 = path.join('321', 'fixture2');

	fs.mkdirSync('fdir');
	fs.writeFileSync(d1f1, '');
	fs.writeFileSync(d1f2, '');
	assert.ok(fs.existsSync(d1f1));
	assert.ok(fs.existsSync(d1f2));

	fs.mkdirSync('321');
	fs.writeFileSync(d2f1, '');
	fs.writeFileSync(d2f2, '');
	assert.ok(fs.existsSync(d2f1));
	assert.ok(fs.existsSync(d2f2));

	await trash([
		'fdir',
		321,
	]);

	assert.ok(!fs.existsSync('fdir'));
	assert.ok(!fs.existsSync(321));
});

test('tons of files', async () => {
	const FILE_COUNT = 5000;
	const paths = [];
	for (let i = 0; i < FILE_COUNT; i++) {
		paths.push('file' + i);
		fs.writeFileSync('file' + i, '');
	}

	await trash(paths);

	for (let i = 0; i < FILE_COUNT; i++) {
		assert.ok(!fs.existsSync('file' + i));
	}
});

test('symlinks', async () => {
	fs.writeFileSync('aaa', '');
	fs.symlinkSync('aaa', 'bbb');
	fs.symlinkSync('ddd', 'ccc');

	assert.ok(fs.lstatSync('aaa'));
	assert.ok(fs.lstatSync('bbb'));
	assert.ok(fs.lstatSync('ccc'));

	await trash([
		'bbb',
		'ccc',
	]);

	assert.ok(fs.lstatSync('aaa'));
	assert.throws(() => fs.lstatSync('bbb'));
	assert.throws(() => fs.lstatSync('ccc'));
});

if (process.platform === 'linux') {
	test('create trashinfo', async () => {
		fs.writeFileSync('f2 ^', '');

		const info = `[Trash Info]\nPath=${path.resolve(encodeURI('f2 ^'))}`;
		const files = await trash(['f2 ^']);
		const infoFile = fs.readFileSync(files[0].info, 'utf8');

		assert.equal(infoFile.trim().indexOf(info.trim()), 0);
	});

	test('preserve file attributes', async () => {
		fs.writeFileSync('f3', '');

		const statSource = fs.statSync('f3');
		const files = await trash(['f3']);
		const statDestination = fs.statSync(files[0].path);

		assert.equal(statSource.mode, statDestination.mode);
		assert.equal(statSource.uid, statDestination.uid);
		assert.equal(statSource.gid, statDestination.gid);
		assert.equal(statSource.size, statDestination.size);
	});
}

test('non-existent files', async () => {
	assert.ok(!fs.existsSync('fixture-enoent'));
	await assert.doesNotReject(trash('fixture-enoent'));
});

test('glob with nested directories', async () => {
	const directory1 = 'foo';
	const file1 = path.join('foo', 'bar.txt');
	const file2 = path.join('foo', 'baz.txt');
	const directory2 = path.join('foo', 'bar');
	const directory3 = path.join('foo', 'baz');
	const file3 = path.join(directory1, 'foo.txt');
	const file4 = path.join(directory2, 'bar.txt');

	fs.mkdirSync(directory1);
	fs.mkdirSync(directory2);
	fs.mkdirSync(directory3);
	fs.writeFileSync(file1, '');
	fs.writeFileSync(file2, '');
	fs.writeFileSync(file3, '');
	fs.writeFileSync(file4, '');
	assert.ok(fs.existsSync(file1));
	assert.ok(fs.existsSync(file2));
	assert.ok(fs.existsSync(file3));
	assert.ok(fs.existsSync(file4));

	await trash(`${directory1}/**`, {glob: true});

	assert.ok(!fs.existsSync(directory1));
	assert.ok(!fs.existsSync(directory2));
	assert.ok(!fs.existsSync(directory3));
});

test('empty array', async () => {
	await assert.doesNotReject(trash([]));
});

test('mixed existing and non-existing files', async () => {
	fs.writeFileSync('exists1', '');
	fs.writeFileSync('exists2', '');
	assert.ok(fs.existsSync('exists1'));
	assert.ok(fs.existsSync('exists2'));
	assert.ok(!fs.existsSync('does-not-exist'));

	await trash(['exists1', 'does-not-exist', 'exists2']);

	assert.ok(!fs.existsSync('exists1'));
	assert.ok(!fs.existsSync('exists2'));
	assert.ok(!fs.existsSync('does-not-exist'));
});

test('single file path', async () => {
	fs.writeFileSync('single-file', '');
	assert.ok(fs.existsSync('single-file'));

	await trash('single-file');

	assert.ok(!fs.existsSync('single-file'));
});

test('empty directory', async () => {
	fs.mkdirSync('empty-dir');
	assert.ok(fs.existsSync('empty-dir'));

	await trash('empty-dir');

	assert.ok(!fs.existsSync('empty-dir'));
});

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import test from 'ava';
import tempfile from 'tempfile';
import trash from './index.js';

const temporaryDirectory = tempfile();
fs.mkdirSync(temporaryDirectory);
process.chdir(temporaryDirectory);

test('files', async t => {
	const weirdName = process.platform === 'darwin' ? 'weird\\\\name\\"\'' : 'fixture3';

	fs.writeFileSync('fixture', '');
	fs.writeFileSync('fixture2', '');
	fs.writeFileSync(weirdName, '');
	fs.writeFileSync('123', '');
	t.true(fs.existsSync('fixture'));
	t.true(fs.existsSync('fixture2'));
	t.true(fs.existsSync(weirdName));
	t.true(fs.existsSync('123'));

	await trash([
		'fixture',
		'fixture2',
		weirdName,
		123,
	]);

	t.false(fs.existsSync('fixture'));
	t.false(fs.existsSync('fixture2'));
	t.false(fs.existsSync(weirdName));
	t.false(fs.existsSync('123'));
});

test('glob', async t => {
	fs.writeFileSync('fixture.jpg', '');
	fs.writeFileSync('fixture.png', '');
	t.true(fs.existsSync('fixture.jpg'));
	t.true(fs.existsSync('fixture.png'));

	await trash([
		'*.jpg',
	]);

	t.false(fs.existsSync('fixture.jpg'));
	t.true(fs.existsSync('fixture.png'));
});

test('no glob', async t => {
	if (process.platform !== 'win32') {
		fs.writeFileSync('fixture-noglob*.js', '');
	}

	fs.writeFileSync('fixture-noglob1.js', '');

	await trash(['fixture-noglob*.js'], {glob: false});

	t.false(fs.existsSync('fixture-noglob*.js'));
	t.true(fs.existsSync('fixture-noglob1.js'));
});

test('string pattern', async t => {
	fs.writeFileSync('a', '');
	fs.writeFileSync('b', '');
	fs.writeFileSync('ab', '');
	t.true(fs.existsSync('a'));
	t.true(fs.existsSync('b'));
	t.true(fs.existsSync('ab'));

	await trash('ab');

	t.false(fs.existsSync('ab'));
	t.true(fs.existsSync('a'));
	t.true(fs.existsSync('b'));
});

test('directories', async t => {
	const d1f1 = path.join('fdir', 'fixture');
	const d1f2 = path.join('fdir', 'fixture2');
	const d2f1 = path.join('321', 'fixture');
	const d2f2 = path.join('321', 'fixture2');

	fs.mkdirSync('fdir');
	fs.writeFileSync(d1f1, '');
	fs.writeFileSync(d1f2, '');
	t.true(fs.existsSync(d1f1));
	t.true(fs.existsSync(d1f2));

	fs.mkdirSync('321');
	fs.writeFileSync(d2f1, '');
	fs.writeFileSync(d2f2, '');
	t.true(fs.existsSync(d2f1));
	t.true(fs.existsSync(d2f2));

	await trash([
		'fdir',
		321,
	]);

	t.false(fs.existsSync('fdir'));
	t.false(fs.existsSync(321));
});

test('tons of files', async t => {
	const FILE_COUNT = 5000;
	const paths = [];
	for (let i = 0; i < FILE_COUNT; i++) {
		paths.push('file' + i);
		fs.writeFileSync('file' + i, '');
	}

	await trash(paths);

	for (let i = 0; i < FILE_COUNT; i++) {
		t.false(fs.existsSync('file' + i));
	}
});

test('symlinks', async t => {
	fs.writeFileSync('aaa', '');
	fs.symlinkSync('aaa', 'bbb');
	fs.symlinkSync('ddd', 'ccc');

	t.truthy(fs.lstatSync('aaa'));
	t.truthy(fs.lstatSync('bbb'));
	t.truthy(fs.lstatSync('ccc'));

	await trash([
		'bbb',
		'ccc',
	]);

	t.truthy(fs.lstatSync('aaa'));
	t.throws(() => fs.lstatSync('bbb'));
	t.throws(() => fs.lstatSync('ccc'));
});

if (process.platform === 'linux') {
	test('create trashinfo', async t => {
		t.plan(1);

		fs.writeFileSync('f2', '');

		const info = `[Trash Info]\nPath=${path.resolve('f2')}`;
		const files = await trash(['f2']);
		const infoFile = fs.readFileSync(files[0].info, 'utf8');

		t.is(infoFile.trim().indexOf(info.trim()), 0);
	});

	test('preserve file attributes', async t => {
		t.plan(4);

		fs.writeFileSync('f3', '');

		const statSource = fs.statSync('f3');
		const files = await trash(['f3']);
		const statDestination = fs.statSync(files[0].path);

		t.is(statSource.mode, statDestination.mode);
		t.is(statSource.uid, statDestination.uid);
		t.is(statSource.gid, statDestination.gid);
		t.is(statSource.size, statDestination.size);
	});
}

test('non-existent files', async t => {
	t.false(fs.existsSync('fixture-enoent'));
	await t.notThrowsAsync(trash('fixture-enoent'));
});

test('glob with nested directories', async t => {
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
	t.true(fs.existsSync(file1));
	t.true(fs.existsSync(file2));
	t.true(fs.existsSync(file3));
	t.true(fs.existsSync(file4));

	await trash(`${directory1}/**`, {glob: true});

	t.false(fs.existsSync(directory1));
	t.false(fs.existsSync(directory2));
	t.false(fs.existsSync(directory3));
});

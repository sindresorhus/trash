import fs from 'fs';
import path from 'path';
import pathExists from 'path-exists';
import test from 'ava';
import tempfile from 'tempfile';
import m from './';

const tmpdir = tempfile();
fs.mkdirSync(tmpdir);
process.chdir(tmpdir);

test('files', async t => {
	const weirdName = process.platform === 'darwin' ? 'weird\\\\name\\"\'' : 'fixture3';

	fs.writeFileSync('fixture', '');
	fs.writeFileSync('fixture2', '');
	fs.writeFileSync(weirdName, '');
	fs.writeFileSync('123', '');
	t.true(pathExists.sync('fixture'));
	t.true(pathExists.sync('fixture2'));
	t.true(pathExists.sync(weirdName));
	t.true(pathExists.sync('123'));

	await m([
		'fixture',
		'fixture2',
		weirdName,
		123
	]);

	t.false(pathExists.sync('fixture'));
	t.false(pathExists.sync('fixture2'));
	t.false(pathExists.sync(weirdName));
	t.false(pathExists.sync('123'));
});

test('glob', async t => {
	fs.writeFileSync('fixture.jpg', '');
	fs.writeFileSync('fixture.png', '');
	t.true(pathExists.sync('fixture.jpg'));
	t.true(pathExists.sync('fixture.png'));

	await m([
		'*.jpg'
	]);

	t.false(pathExists.sync('fixture.jpg'));
	t.true(pathExists.sync('fixture.png'));
});

test('no glob', async t => {
	fs.writeFileSync('fixture-noglob*.js', '');
	fs.writeFileSync('fixture-noglob1.js', '');

	await m(['fixture-noglob*.js'], {glob: false});

	t.false(pathExists.sync('fixture-noglob*.js'));
	t.true(pathExists.sync('fixture-noglob1.js'));
});

test('string pattern', async t => {
	fs.writeFileSync('a', '');
	fs.writeFileSync('b', '');
	fs.writeFileSync('ab', '');
	t.true(pathExists.sync('a'));
	t.true(pathExists.sync('b'));
	t.true(pathExists.sync('ab'));

	await m(
		'ab'
	);

	t.false(pathExists.sync('ab'));
	t.true(pathExists.sync('a'));
	t.true(pathExists.sync('b'));
});

test('directories', async t => {
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

	await m([
		'fdir',
		321
	]);

	t.false(pathExists.sync('fdir'));
	t.false(pathExists.sync(321));
});

if (process.platform === 'linux') {
	test('create trashinfo', async t => {
		t.plan(1);

		fs.writeFileSync('f2', '');

		const info = `[Trash Info]\nPath=${path.resolve('f2')}`;
		const files = await m(['f2']);
		const infoFile = fs.readFileSync(files[0].info, 'utf8');

		t.is(infoFile.trim().indexOf(info.trim()), 0);
	});

	test('preserve file attributes', async t => {
		t.plan(4);

		fs.writeFileSync('f3', '');

		const statSrc = fs.statSync('f3');
		const files = await m(['f3']);
		const statDest = fs.statSync(files[0].path);

		t.is(statSrc.mode, statDest.mode);
		t.is(statSrc.uid, statDest.uid);
		t.is(statSrc.gid, statDest.gid);
		t.is(statSrc.size, statDest.size);
	});
}

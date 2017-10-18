import fs from 'fs';
import path from 'path';
import test from 'ava';
import tempfile from 'tempfile';
import m from '.';

const tmpdir = tempfile();
fs.mkdirSync(tmpdir);
process.chdir(tmpdir);

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

	await m([
		'fixture',
		'fixture2',
		weirdName,
		123
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

	await m([
		'*.jpg'
	]);

	t.false(fs.existsSync('fixture.jpg'));
	t.true(fs.existsSync('fixture.png'));
});

test('no glob', async t => {
	fs.writeFileSync('fixture-noglob*.js', '');
	fs.writeFileSync('fixture-noglob1.js', '');

	await m(['fixture-noglob*.js'], {glob: false});

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

	await m(
		'ab'
	);

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

	await m([
		'fdir',
		321
	]);

	t.false(fs.existsSync('fdir'));
	t.false(fs.existsSync(321));
});

test('symlinks', async t => {
	fs.writeFileSync('aaa', '');
	fs.symlinkSync('aaa', 'bbb');
	fs.symlinkSync('ddd', 'ccc');

	t.truthy(fs.lstatSync('aaa'));
	t.truthy(fs.lstatSync('bbb'));
	t.truthy(fs.lstatSync('ccc'));

	await m([
		'bbb',
		'ccc'
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

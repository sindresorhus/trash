# ![trash](media/logo.png)

> Move files and folders to the trash

Works on macOS (10.12+), Linux, and Windows (8+).

**Note:** The Linux implementation is not very good and not maintained. Help welcome. If no one steps up to help maintain it, I will eventually remove Linux support.

In contrast to [`fs.unlink`](https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback), [`del`](https://github.com/sindresorhus/del), and [`rimraf`](https://github.com/isaacs/rimraf) which permanently delete files, this only moves them to the trash, which is much safer and reversible.

## Install

```sh
npm install trash
```

## Usage

```js
import trash from 'trash';

await trash(['*.png', '!rainbow.png']);
```

## API

### trash(input, options?)

Returns a `Promise`.

#### input

Type: `string | string[]`

Accepts paths and [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns).

#### options

Type: `object`

##### glob

Type: `boolean`\
Default: `true`

Enable globbing when matching file paths.

## CLI

To install the [`trash`](https://github.com/sindresorhus/trash-cli) command, run:

```
$ npm install --global trash-cli
```

## Info

On macOS, [`macos-trash`](https://github.com/sindresorhus/macos-trash) is used.\
On Linux, the [XDG spec](https://standards.freedesktop.org/trash-spec/trashspec-1.0.html) is followed.\
On Windows, [`recycle-bin`](https://github.com/sindresorhus/recycle-bin) is used.

## FAQ

### But I can do the same thing with `mv`

Not really. The `mv` command isn't cross-platform and moving to trash is not just about moving the file to a "trash" directory. On all OSes you'll run into file conflicts. The user won't easily be able to restore the file. It won't work on an external drive. The trash directory location varies between Windows versions. For Linux, there's a whole [spec](https://standards.freedesktop.org/trash-spec/trashspec-1.0.html) you need to follow. On macOS, you'll lose the [Put back](https://mac-fusion.com/trash-tip-how-to-put-files-back-to-their-original-location/) feature.

## Related

- [trash-cli](https://github.com/sindresorhus/trash-cli) - CLI for this module
- [empty-trash](https://github.com/sindresorhus/empty-trash) - Empty the trash
- [del](https://github.com/sindresorhus/del) - Delete files and folders

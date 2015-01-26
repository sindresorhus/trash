# ![trash](https://cdn.rawgit.com/sindresorhus/trash/3aa70853f1efb58d0d2512e32d617d246c88953c/media/logo.svg)

> Cross-platform command-line app for moving files and directories to the trash  
> A safer alternative to [`rm`](http://en.wikipedia.org/wiki/Rm_(Unix))

[![Build Status](https://travis-ci.org/sindresorhus/trash.svg?branch=master)](https://travis-ci.org/sindresorhus/trash) ![](http://img.shields.io/badge/unicorn-approved-ff69b4.svg)

Works on OS X, Linux and Windows.

In contrast to `rm` which is [dangerous](http://docstore.mik.ua/orelly/unix3/upt/ch14_03.htm) and permanently delete files, this only moves them to the trash, which is much safer and reversible. You should not alias `rm` to `trash` however as that would break most scripts relying on `rm` behaviour. Rather use `trash` from the CLI and in your own scripts. I would also recommend reading my guide on [safeguarding `rm`](https://github.com/sindresorhus/guides/blob/master/how-not-to-rm-yourself.md#safeguard-rm).


## CLI

```sh
$ npm install --global trash
```

```sh
$ trash --help

  Usage
    trash [--force] <path> [<path> ...]

  Example
    trash unicorn.png rainbow.png
```

*Globbing support is left up to your shell, but `$ trash *.png` should expand to the above in most shells.*

The `--force` option makes it always succeed even on errors by exiting with code `1`:

```sh
$ trash --force build && BUILDSTUFF
```

This can be useful when used in platform agnostic scripts like [`npm` package.json scripts](https://docs.npmjs.com/misc/scripts), as eg. `trash build; BUILDSTUFF` doesn't work on Windows.


## API

```sh
$ npm install --save trash
```

```js
var trash = require('trash');

trash(['unicorn.png', 'rainbow.png'], function (err) {
	console.log('done');
});
```


## Info

On OS X [`osx-trash`](https://github.com/sindresorhus/osx-trash) is used.

On Linux [`xdg-trash`](https://github.com/kevva/xdg-trash) is used.

On Windows [`cmdutils`](http://www.maddogsw.com/cmdutils/) is used.


## Tip

Add `alias t=trash` to your `.zshrc`/`.bashrc` to reduce typing: `$ t unicorn.png`.


## FAQ

### But I can do the same thing with `mv`

Not really. The `mv` command isn't cross-platform and moving to trash is not just about moving the file to a "trash" directory. On all OSes you'll run into file conflicts. The user won't easily be able to restore the file. It won't work on an external drive. The trash directory location varies between Windows versions. For Linux there's a whole [spec](http://www.ramendik.ru/docs/trashspec.html) you need to follow. On OS X you'll loose the [Put back](http://mac-fusion.com/trash-tip-how-to-put-files-back-to-their-original-location/) feature.


## Related

See [`empty-trash`](https://github.com/sindresorhus/empty-trash) for emptying the trash.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)

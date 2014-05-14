# ![trash](https://cdn.rawgit.com/sindresorhus/trash/3aa70853f1efb58d0d2512e32d617d246c88953c/media/logo.svg)

> Cross-platform command-line app for moving files and directories to the trash - A safer alternative to [`rm`](http://en.wikipedia.org/wiki/Rm_(Unix))

[![Build Status](https://travis-ci.org/sindresorhus/trash.svg?branch=master)](https://travis-ci.org/sindresorhus/trash) ![](http://img.shields.io/badge/unicorn-approved-ff69b4.svg)

Works on OS X, Linux and Windows.


## CLI

```sh
$ npm install --global trash
```

```sh
$ trash --help

Usage
  $ trash <path> [<path> ...]

Example
  $ trash unicorn.png rainbow.png
```

*Globbing support is left up to your shell, but `$ trash *.png` should expand to the above in most shells.*


## API

```sh
$ npm install --save trash
```

```js
var trash = require('trash');

trash(['unicorn.png', 'rainbow.png'], function (err) {
	if (err) {
		throw err;
	}

	console.log('done');
});
```


## Info

On OS X AppleScript is used as it's the only way to support built-in features such as [Put back](http://mac-fusion.com/trash-tip-how-to-put-files-back-to-their-original-location/).

On Linux [trash-cli](https://github.com/andreafrancia/trash-cli) is used. Requires Python. [Help wanted on a Node version.](https://github.com/sindresorhus/trash/issues/1)

On Windows [cmdutils](http://www.maddogsw.com/cmdutils/) is used.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)

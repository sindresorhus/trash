'use strict';

if (process.platform === 'darwin') {
	module.exports = require('osx-trash');
} else if (process.platform === 'win32') {
	module.exports = require('win-trash');
} else {
	module.exports = require('xdg-trash');
}

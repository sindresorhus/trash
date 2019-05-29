declare namespace trash {
	interface Options {
		/**
		Enable globbing when matching file paths.

		@default true
		*/
		readonly glob?: boolean;
	}
}

/**
Move files and folders to the trash.

@param input - Accepts paths and [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns).

@example
```
import trash = require('trash');

(async () => {
	await trash(['*.png', '!rainbow.png']);
})();
```
*/
declare function trash(
	input: string | readonly string[],
	options?: trash.Options
): Promise<void>;

export = trash;

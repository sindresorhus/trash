declare namespace trash {
	interface Options {
		/**
		Enable globbing when matching file paths.

		@default true
		*/
		readonly glob?: boolean;
	}
}

declare const trash: {
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
	(input: string | string[], options?: trash.Options): Promise<void>;

	// TODO: Remove this for the next major release, refactor the whole definition to:
	// declare function trash(
	// 	input: string | string[],
	// 	options?: Options
	// ): Promise<void>;
	// export = trash;
	default: typeof trash;
};

export = trash;

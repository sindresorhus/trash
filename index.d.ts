export interface Options {
	/**
	Enable globbing when matching file paths.

	@default true
	*/
	readonly glob?: boolean;
}

/**
Move files and folders to the trash.

@param input - Accepts paths and [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns).

@example
```
import trash from 'trash';

await trash(['*.png', '!rainbow.png']);
```
*/
export default function trash(
	input: string | readonly string[],
	options?: Options
): Promise<void>;

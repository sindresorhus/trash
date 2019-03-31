import {expectType} from 'tsd';
import trash = require('.');

expectType<Promise<void>>(trash('/path/to/item1'));
expectType<Promise<void>>(trash(['/path/to/item1', '/path/to/item2']));
expectType<Promise<void>>(
	trash(['/path/to/item1', '/path/to/item2'], {glob: false})
);

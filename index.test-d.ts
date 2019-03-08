import {expectType} from 'tsd-check';
import trash from '.';

expectType<Promise<void>>(trash('/path/to/item1'));
expectType<Promise<void>>(trash(['/path/to/item1', '/path/to/item2']));
expectType<Promise<void>>(
	trash(['/path/to/item1', '/path/to/item2'], {glob: false})
);

const tape = require('tape');
const groupby = require('../../src/util/group-by');

tape('test section grouping', test => {
	let posts = [
		{ id: 1, section: 'a' },
		{ id: 2, section: 'b' },
		{ id: 3, section: 'a' }
	];

	test.deepEqual(
		groupby(posts, 'section'),
		[
			['a', [{ id: 1, section: 'a' }, { id: 3, section: 'a' }]],
			['b', [{ id: 2, section: 'b' }]]
		],
		'group by section'
	);

	test.deepEqual(
		groupby(posts, 'id'),
		[
			['1', [{ id: 1, section: 'a' }]],
			['2', [{ id: 2, section: 'b' }]],
			['3', [{ id: 3, section: 'a' }]]
		],
		'group by id'
	);

	test.end();
});

const tape = require('tape');
const { Hierarchy } = require('../../src/model/post');

tape('single post hierarchy', test => {
	test.deepEqual(Hierarchy({}), ['single', 'index'], 'empty object');

	test.deepEqual(
		Hierarchy({
			section: 'posts'
		}),
		['single-posts', 'single', 'index'],
		'post with section'
	);

	test.deepEqual(
		Hierarchy({
			section: 'posts',
			type: 'recipe'
		}),
		[
			'single-posts-recipe',
			'single-recipe',
			'single-posts',
			'single',
			'index'
		],
		'post with section and type'
	);

	test.end();
});

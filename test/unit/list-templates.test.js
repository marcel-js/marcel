const tape = require('tape');
const { Hierarchy } = require('../../src/model/list');

tape('single post hierarchy', test => {
	test.deepEqual(Hierarchy({}), ['list', 'index'], 'empty object');

	test.deepEqual(
		Hierarchy({
			taxonomy: 'tags'
		}),
		['list-tags-index', 'list-tags', 'list', 'index'],
		'tags index'
	);

	test.deepEqual(
		Hierarchy({
			taxonomy: 'tags',
			term: 'myterm'
		}),
		['list-tags-myterm', 'list-tags', 'list', 'index'],
		'tags term page'
	);

	test.deepEqual(
		Hierarchy({
			taxonomy: 'section',
			term: 'posts'
		}),
		['list-posts', 'list', 'index'],
		'section list'
	);

	test.end();
});

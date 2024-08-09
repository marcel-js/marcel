const tape = require('tape');
const strip = require('../../src/util/strip-filename-prefix');

tape('test filename stripping', test => {
	test.equal(strip('1-hello'), 'hello', 'basic');
	test.equal(strip('01-hello'), 'hello', 'zero-padded digits');
	test.equal(strip('01-01-hello'), 'hello', 'multiple digit segments');
	test.equal(strip('01--01---hello'), 'hello', 'multiple dashes');
	test.equal(strip('01-1hello'), 'hello', 'strip digit after last dash');
	test.equal(
		strip('01-d-01-hello'),
		'd-01-hello',
		'digits after non-digit segment'
	);
	test.equal(strip('2018-07-10-hello'), 'hello', 'prefixed by date');
	test.equal(
		strip('2018-07-10'),
		'',
		'date-only filename returns empty string'
	);

	test.end();
});

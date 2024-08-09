const getPath = require('./get-path');

module.exports = (posts = [], property) => {
	let groups = {};

	function add(term = '__undefined__', post) {
		if (!groups[term]) {
			groups[term] = [];
		}
		groups[term].push(post);
	}

	posts.forEach(post => {
		let term = getPath(post, property);
		if (Array.isArray(term)) {
			term.forEach(t => add(t, post));
		} else {
			add(term, post);
		}
	});

	return Object.entries(groups);
};

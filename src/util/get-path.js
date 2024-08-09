module.exports = (o, path) =>
	path
		.split('.')
		.reduce((res, prop) => (res !== undefined ? res[prop] : undefined), o);

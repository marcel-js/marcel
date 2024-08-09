const dayjs = require('dayjs');

module.exports = function(date, format) {
	return dayjs(date).format(format);
};

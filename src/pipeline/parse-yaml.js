const yaml = require('js-yaml');

module.exports = file => yaml.safeLoad(file.contents);

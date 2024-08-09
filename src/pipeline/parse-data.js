module.exports = async file => {
	file.data = await require(`./parse-${file.extname.slice(1)}`)(file);
	return file;
};

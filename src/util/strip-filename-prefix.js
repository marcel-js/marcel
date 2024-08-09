/*
	Strips any numeric prefix from a filename,
	to allow you to define an order to your markdown files
	by prefixing them with numbers.

	Things that get stripped:

	001-hello-world => hello-world
	01-10-2018-hello-world => hello-world
	500-days-of-summer => days-of-summer

	Note: In the last example, you can work around the incorrect stripping
	by defining a custom `slug` in the post's front-matter.
 */
module.exports = filename => filename.replace(/^(\d+\-*)+/, '');

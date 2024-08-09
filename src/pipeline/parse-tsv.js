const { tsvParse } = require('d3-dsv');
const strip_bom = require('strip-bom');

/*
	From here: https://github.com/d3/d3-dsv

	Byte-Order Marks
	----------------
	DSV files sometimes begin with a byte order mark (BOM); 
	saving a spreadsheet in CSV UTF-8 format from Microsoft Excel, 
	for example, will include a BOM. On the web this is not usually 
	a problem because the UTF-8 decode algorithm specified in the 
	Encoding standard removes the BOM. Node.js, on the other hand, 
	does not remove the BOM when decoding UTF-8.
*/

module.exports = file => tsvParse(strip_bom(file.contents));

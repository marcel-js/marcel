let { normalize } = require('path');

class List {
	constructor(attrs, options) {
		Object.assign(this, attrs);
		this.options = {
			...options
		};
	}

	/*
		This setup allows the user-supplied permalink
		function to return `false` to stop a List from rendering
		or not return anything to fall back to the default permalink.

		__permalink() does not have config.base prepended,
		we only use it to write the files on disk.
	 */
	get __permalink() {
		let custom = this.constructor.Permalink
			? this.constructor.Permalink(this)
			: undefined;
		return normalize(
			custom !== undefined
				? custom
				: this.constructor.DefaultPermalink(this)
		);
	}

	/*
		The public permalink
	 */
	get permalink() {
		return this.options.finalizer(this.__permalink);
	}

	get templates() {
		return this.constructor.DefaultHierarchy(this);
	}
}

/*
	Static properties
	-----------------
 */

/*
	The user-supplied permalink function 
	will be injected here.
 */
List.Permalink = undefined;

/*
	The default permalink function for List objects.
 */
List.DefaultPermalink = function(list) {
	let tax = list.taxonomy !== 'section' ? list.taxonomy : '';
	if (list.term !== '__undefined__') {
		return `/${tax}/${list.term}`;
	}
	return `/${tax}`;
};

/*
	The default template hierarchy for List objects,
	from most specific to least specific:

	- list-$taxonomy-$term.html
	- list-$taxonomy-index.html
	- list-$taxonomy.html
	- list.html
	- index.html
 */
List.DefaultHierarchy = list => {
	let templates = [];

	if (list.taxonomy) {
		if (list.taxonomy === 'section') {
			if (list.term !== '__undefined__') {
				templates.push(`list-${list.term}`);
			}
		} else {
			if (list.term !== undefined) {
				templates.push(`list-${list.taxonomy}-${list.term}`);
			} else {
				templates.push(`list-${list.taxonomy}-index`);
			}
			templates.push(`list-${list.taxonomy}`);
		}
	}

	return templates.concat([`list`, `index`]);
};

module.exports = List;

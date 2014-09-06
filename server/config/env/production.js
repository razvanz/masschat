'use strict';

module.exports = {
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost/masschat-prod',
	app: {
        title: 'MassChat',
        description: 'descr',
        keywords: ''
   },
	cssRoot: 'dist/',
	jsRoot: 'dist/',
	assets: {
		lib: {
			css: [],
			js: [
				'scripts/vendor.js'
			]
		},
		css: 'styles/app.css',
		js: 'scripts/app.js'
	}
};

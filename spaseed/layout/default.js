
/**
 * 默认layout
 */
define('spaseed/layout/default', function(require, exports, module) {
	var $ = require('$');
	var pageManager = require('pageManager');
	var util = require('util');

	var layout = {
		_tpl: {
			main: TEMPLATE.MAIN
		},
		render: function () {

		}
	};
	module.exports = layout;
});

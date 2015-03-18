
define('models/example', function(require, exports, module) {

	var model = require('model');

	//cgi配置
	var daoConfig = {
		'queryPage1': {
			url: '/xxx',
			method: 'get'
		},
		'queryPage2': {
			url: '/xxx',
			method: 'get'
		},
		'queryPage3': {
			url: '/xxx',
			method: 'get'
		}
	};

	//测试数据
	var testData = {
		'queryPage1': {
			"title": "Page 1",
			"description": "This is page 1"
		},
		'queryPage2': {
			"title": "Page 2",
			"description": "This is page 2"
		},
		'queryPage3': {
			"title": "Page 3",
			"description": "This is page 3"
		}
	}

	module.exports = new model(daoConfig, '', testData);
});

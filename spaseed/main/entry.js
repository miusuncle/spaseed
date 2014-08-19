
define('spaseed/main/entry', function(require, exports) {
	var $ = require('$');
	var evt = require('event');
	var util = require('util');
	var router = require('router');
	var pageManager = require('pageManager');

	//spaseed初始化
    var init = function (pageConfig) {

    	//初始化页面管理
		pageManager.init(pageConfig);

		//初始化路由
		router.init({
			'html5Mode': true,
			'pageManager': pageManager,
			'routes': {
				'/': 'loadRoot',
				'/*controller(/*action)(/*p1)(/*p2)(/*p3)(/*p4)': 'loadCommon'
			}
		});

		//全局点击
		evt.addCommonEvent('click', { 
			'nav': function () {
				var _this = this;
				router.navigate(util.getHref(_this));
			}
		});

	    //记录所有请求完毕
	    var win = window;
	    $(win).load(function () {
	   		win.isOnload = true;
	    });
		
    };

    exports.init = init;
});

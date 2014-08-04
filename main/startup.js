
define('main/startup', function(require, exports) {
	var $ = require('$');
	var evt = require('event');
	var util = require('util');
	var router = require('router');
	var pageManager = require('pagemanager');


	//应用入口函数
    var startup = function () {

		//初始化路由
		router.init({
			'html5Mode': true,
			'pageManager': pageManager,
			'routes': {
				'/': 'loadRoot',
				'/*controller(/*action)(/*p1)(/*p2)(/*p3)(/*p4)': 'loadView'
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

    exports.startup = startup;
});

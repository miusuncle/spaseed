define('config/dao_config', function(require, exports, module) {

	//cgi配置
	var daoConfig = {
		'xxx': {
			url: '/xxx',
			method: 'post'
		}
	};

	var host = '/cgi';
	if (host) {
		for (var i  in daoConfig) {
			var cur = daoConfig[i];
			if (cur && cur.url) {
				cur.url = host + cur.url;
			}
		};
	};

	var config = {};
	config.get = function (argv) {
		return daoConfig[argv];
	};

	module.exports = config;
});

define('config/manager', function(require, exports, module) {
	var dataManager = require('dataManager');
	var net = require('net');
	var config = require('daoConfig');

	//数据管理
	var manager = {

		queryPage1: function (data, cb, fail) {
			
			var _self = this,
				_cb = function (ret) {
					dataManager.commonCb(ret, cb, fail);
				};

			//获取服务端数据
			/*net.send(config.get('queryPage1'), {
				data: data,
				cb: _cb
			});*/
			
			cb({
				"title": "Page 1",
				"description": "This is page 1"
			})

		},

		queryPage2: function (data, cb, fail) {
			
			var _self = this,
				_cb = function (ret) {
					dataManager.commonCb(ret, cb, fail);
				};

			//获取服务端数据
			/*net.send(config.get('queryPage2'), {
				data: data,
				cb: _cb
			});*/
			
			cb({
				"title": "Page 2",
				"description": "This is page 2"
			})

		},

		queryPage3: function (data, cb, fail) {
			
			var _self = this,
				_cb = function (ret) {
					dataManager.commonCb(ret, cb, fail);
				};

			//获取服务端数据
			/*net.send(config.get('queryPage3'), {
				data: data,
				cb: _cb
			});*/
			
			cb({
				"title": "Page 3",
				"description": "This is page 3"
			})

		}

	};

	module.exports = manager;

});

define('config/page_config', function(require, exports, module) {
	var $ = require('$');

	//页面参数配置
	var pageConfig = {

		//首页模块名
		'root': 'page1'
	};

	module.exports = pageConfig;
});


define('main/startup', function(require, exports) {

	var pageConfig = require('config/page_config');

	var spaseedEntry = require('entry');

	//应用入口函数
    var startup = function () {

    	//spaseed初始化
		spaseedEntry.init(pageConfig);
		
    };

    exports.startup = startup;
});


define('modules/page1/page1', function (require, exports, module) {
    var $ = require('$');
    var pageManager = require('pageManager');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
    	main: '<h1 data-event="tt_click"><%=data.title%></h1><div><%=data.description%></div>'
    };

    var page1 = {

        title: 'page1',

        pageClass: '',

        render: function () {

            manager.queryPage1({}, function(data) {
            	pageManager.container.html(util.tmpl(_tpl.main, {
        			data: data
        		}));
            });

            this.bindEvent();
        },

        bindEvent: function () {

            evt.addCommonEvent('click', { 
                'tt_click': function () {
                    alert($(this).text())
                }
            });
        },

        destroy: function () {

        }
    };
        
    module.exports = page1;
});

define('modules/page2/page2', function (require, exports, module) {
    var $ = require('$');
    var pageManager = require('pageManager');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: '<h1><%=data.title%></h1><div><%=data.description%></div>'
    };

    var page2 = {

        title: 'page2',

        pageClass: '',

        render: function () {

            manager.queryPage2({}, function(data) {
                pageManager.container.html(util.tmpl(_tpl.main, {
                    data: data
                }));
            });

            this.bindEvent();
        },

        bindEvent: function () {
            
            evt.addCommonEvent('click', { 
                
            });
        },

        destroy: function () {

        }
    };
        
    module.exports = page2;
});

define('modules/page3/index/index', function (require, exports, module) {
    var $ = require('$');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: '<div>This is \'/page3/index\' content</div>'
    };

    var page3Index = {

        title: 'page3 index',

        pageClass: '',

        render: function () {

            $('#subcontainer').html(_tpl.main);

            this.bindEvent();
        },

        bindEvent: function () {

            evt.addCommonEvent('click', { 
                
            });
        },

        destroy: function () {

        }
    };
        
    module.exports = page3Index;
});

define('modules/page3/other/other', function (require, exports, module) {
    var $ = require('$');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: '<div>This is \'other\' page content</div>'
    };

    var page3Other = {

        title: 'page3 other',

        pageClass: '',

        render: function () {

            $('#subcontainer').html(_tpl.main);

            this.bindEvent();
        },

        bindEvent: function () {

            evt.addCommonEvent('click', { 
                
            });
        },

        destroy: function () {

        }
    };
        
    module.exports = page3Other;
});

define('modules/page3/page3', function (require, exports, module) {
    var $ = require('$');
    var pageManager = require('pageManager');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: '<h1><%=data.title%></h1><div><%=data.description%></div><ul class="menu submenu"><li><a href="/page3" data-event="nav">/page3/index</a></li><li><a href="/page3/other" data-event="nav">/page3/other</a></li></ul><div id="subcontainer" class="subcontainer"></div>'
    };

    var page3 = {

        render: function () {

            manager.queryPage3({}, function(data) {
                pageManager.container.html(util.tmpl(_tpl.main, {
                    data: data
                }));
            });

            this.bindEvent();
        },

        bindEvent: function () {
            
            evt.addCommonEvent('click', { 
                
            });
        },

        destroy: function () {

        }
    };
        
    module.exports = page3;
});
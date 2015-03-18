define('config/config', function(require, exports, module) {
	var $ = require('$');

	//参数配置
	var config = {

		//首页模块名
		'root': 'page1'
	};

	module.exports = config;
});


define('main/startup', function(require, exports) {

	var config = require('config/config');

	var spaseedEntry = require('entry');

	//应用入口函数
    var startup = function () {

    	//spaseed初始化
		spaseedEntry.init(config);
		
    };

    exports.startup = startup;
});


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


define('modules/page1/page1', function (require, exports, module) {
    var $ = require('$');
    var pageManager = require('pageManager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
    	main: '<h1 data-event="tt_click"><%=data.title%></h1><div><%=data.description%></div>'
    };

    var page1 = {

        title: 'page1',

        pageClass: '',

        model: require('models/example'),

        render: function () {

            this.model.request({
                name: 'queryPage1',
                success: function (data) {
                    pageManager.container.html(util.tmpl(_tpl.main, {
                        data: data
                    }));
                }
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
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: '<h1><%=data.title%></h1><div><%=data.description%></div>'
    };

    var page2 = {

        title: 'page2',

        pageClass: '',

        model: require('models/example'),

        render: function () {
            
            this.model.request({
                name: 'queryPage2',
                success: function (data) {
                    pageManager.container.html(util.tmpl(_tpl.main, {
                        data: data
                    }));
                }
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
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: '<h1><%=data.title%></h1><div><%=data.description%></div><ul class="menu submenu"><li><a href="/page3" data-event="nav">/page3/index</a></li><li><a href="/page3/other" data-event="nav">/page3/other</a></li></ul><div id="subcontainer" class="subcontainer"></div>'
    };

    var page3 = {

        model: require('models/example'),

        render: function () {
            
            this.model.request({
                name: 'queryPage3',
                success: function (data) {
                    pageManager.container.html(util.tmpl(_tpl.main, {
                        data: data
                    }));
                }
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
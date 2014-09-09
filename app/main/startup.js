
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


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

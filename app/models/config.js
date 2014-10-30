define('models/config', function(require, exports, module) {

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


define('spaseed/main/model', function(require, exports, module) {
	var net = require('net');
	var dataManager = require('dataManager');

	/**
     * model基类
     * @class model
     * @constructor
     * @param {Object} daoConfig CGI配置
     * @param {String} urlPrefix url前缀
     * @param {Object} testData  测试数据
     */
	var model = function (daoConfig, urlPrefix, testData) {
		if (urlPrefix) {
			for (var i  in daoConfig) {
				var cur = daoConfig[i];
				if (cur && cur.url) {
					cur.url = urlPrefix + cur.url;
				}
			};
		};
		this.daoConfig = daoConfig;
		this.testData = testData;
	};

	model.prototype = {
		getDao: function (name) {
			return this.daoConfig[name];
		},
		/**
		 * 请求CGI
		 * @method request
		 * @param {String}   options.name     CGI名称
		 * @param {Object}   options.data     参数
		 * @param {Function} options.success  成功回调
		 * @param {Function} options.fail     失败回调
		 * @param {Boolean}  options.global   是否触发ajaxStart, @default true
		 * @param {String}   options.cacheKey 缓存变量key
		 * @param {Boolean}  options.tipErr   是否提示错误, @default true
		 */
		request: function (options) {

			var name = options.name,
				data = options.data || {},
				success = options.success,
				fail = options.fail,
				global = options.global,
				cacheKey = options.cacheKey,
				tipErr = options.tipErr;

			var _self = this,
				_cb = function (ret) {
					dataManager.commonCb(ret, success, fail, cacheKey, tipErr);
				};

			if (this.testData && this.testData[name]) {
				success && success(this.testData[name])
			} else {
				net.send(this.getDao(name), {
					data: data,
					global: global,
					cb: _cb
				});
			}
		}
	}
	module.exports = model;
});

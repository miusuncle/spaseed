
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
		 * @param {String}   cgiName   CGI名称
		 * @param {Object}   data      参数
		 * @param {Function} cb        成功回调
		 * @param {Function} fail      失败回调
		 * @param {Boolean}  global    是否触发ajaxStart, @default true
		 * @param {String}   cacheKey  缓存变量key
		 * @param {Boolean}  tipErr    是否提示错误, @default true
		 * @author evanyuan
		 */
		request: function (cgiName, data, cb, fail, global, cacheKey, tipErr) {
			var _self = this,
				_cb = function (ret) {
					dataManager.commonCb(ret, cb, fail, cacheKey, tipErr);
				};

			if (this.testData && this.testData[cgiName]) {
				cb && cb(this.testData[cgiName])
			} else {
				net.send(this.getDao(cgiName), {
					data: data || {},
					global: global,
					cb: _cb
				});
			}
		}
	}
	module.exports = model;
});

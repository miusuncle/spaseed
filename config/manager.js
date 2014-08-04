define('config/manager', function(require, exports, module) {
	var net = require('net');
	var config = require('daoConfig');

	/**
	 * 数据管理
	 * @class manager
	 * @static
	 */
	var manager = {

		_errorHandler: function (ret) {
			//错误提示
			console.log(ret.msg || '连接服务器异常，请稍后再试');
		},

		commonCb: function (ret, cb, fail) {
			var _self = this,
				_code = ret.code;
			if (_code == 0) {
				cb && cb(ret.data);
			} else {
				_self._errorHandler(ret);
				fail && fail(ret);
			}
		},

		queryPage1: function (data, cb, fail) {
			
			var _self = this,
				_cb = function (ret) {
					_self.commonCb(ret, cb, fail);
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
					_self.commonCb(ret, cb, fail);
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
					_self.commonCb(ret, cb, fail);
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

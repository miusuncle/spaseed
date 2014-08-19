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

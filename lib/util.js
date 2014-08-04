
define('lib/util', function(require, exports, module) {
	var $ = require('$');
	window.console = window.console || {log:function(){}};

	/**
	 * 工具类
	 * @class util
	 * @static
	 */
	var util = {
		cookie: {
			/**
			 * 获取cookie
			 * @method get
			 * @param  {String} name 名称
			 * @return {String} 
			 */
			get: function (name) {
				var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)"),
					m = document.cookie.match(r);

				return !m ? "" : m[1];
			},
			/**
			 * 设置cookie
			 * @method set
			 * @param {String} name 名称
			 * @param {String} value 值
			 * @param {String} domain 域
			 * @param {String} path 路径
			 * @param {String} hour 过期时间(小时)
			 */
			set: function (name, value, domain, path, hour) {
				if (hour) {
					var expire = new Date();
					expire.setTime(expire.getTime() + 36E5 * hour);
				}
				document.cookie = name + "=" + value + "; " + (hour ? "expires=" + expire.toGMTString() + "; " : "") +
					(path ? "path=" + path + "; " : "path=/; ") + (domain ? "domain=" + domain + ";" : "domain=" + document.domain + ";");

				return true;
			},
			/**
			 * 删除cookie
			 * @method del
			 * @param {String} name 名称
			 * @param {String} domain 域
			 * @param {String} path 路径
			 */
			del: function(name, domain, path) {
				document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " +
					(path ? "path=" + path + "; " : "path=/; ") +
					(domain ? "domain=" + domain + ";" : "domain=" + document.domain + ";");
			}
		},

		/**
		 * html模板生成器, =号转义, -号原始输出
		 * @method tmpl
		 * @param  {String} str html 模板字符串
		 * @param  {Object} data 用于生成模板的数据对象
		 * @return {String} 返回 html 字符串
		 */
		tmpl: function(){
			var cache = {};
			function _getTmplStr(rawStr, mixinTmpl) {
				if(mixinTmpl) {
					for(var p in mixinTmpl) {
						var r = new RegExp('<%#' + p + '%>', 'g');
						rawStr = rawStr.replace(r, mixinTmpl[p]);
					}
				}
				return rawStr;
			}
			return function tmpl(str, data, opt) {
				opt = opt || {};
				var key = opt.key, mixinTmpl = opt.mixinTmpl, strIsKey = !/\W/.test(str);
				key = key || (strIsKey ? str : null);
				var fn = key ? cache[key] = cache[key] || tmpl(_getTmplStr(strIsKey ? document.getElementById(str).innerHTML : str, mixinTmpl)) :
				new Function("obj", "var _p_=[],print=function(){_p_.push.apply(_p_,arguments);};with(obj){_p_.push('" + str
					.replace(/[\r\t\n]/g, " ")
					.split("\\'").join("\\\\'")
					.split("'").join("\\'")
					.split("<%").join("\t")
					.replace(/\t-(.*?)%>/g, "',$1,'")
					.replace(/\t=(.*?)%>/g, "<escapehtml>',$1,'</escapehtml>")
					.split("\t").join("');")
					.split("%>").join("_p_.push('")
				+ "');}return _p_.join('').replace(new RegExp('<escapehtml>(.*?)</escapehtml>', 'g'), function($1,$2){"
				+ "return $2.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;')})");
				return data ? fn( data ) : fn;
			};
		}(),

		/**
		 * 将 URL 参数格式转化成对象
		 * @method paramsToObject
		 * @param  {String} [queryString] 要转换的 key-value 字符串，默认为 location.search
		 * @return {Object}
		 */
		paramsToObject: function (queryString) {
			var _result = {}, _pairs, _pair, _query, _key, _value;

			if (typeof(queryString) === 'object') { return queryString; }

			_query = queryString || window.location.search;
			_query = _query.replace('?', '');
			_pairs = _query.split('&');

			$(_pairs).each(function (i, keyVal) {
				_pair = keyVal.split('=');
				_key = _pair[0];
				_value = _pair.slice(1).join('=');
				_result[decodeURIComponent(_key)] = decodeURIComponent(_value);
			});

			return _result;
		},

		/**
		 * JSON对象转url字符串
		 * @method objectToParams
		 * @param  {Object} obj JSON对象
		 * @param  {Boolean} decodeUri url解码
		 * @return {String} url字符串
		 */
		objectToParams: function (obj, decodeUri) {
			var param = $.param(obj);
			if (decodeUri) {
				param = decodeURIComponent(param);
			}
			return param;
		},

		/**
		 * 是否移动手机
		 * @method isMobile
		 * @return {boolean} true|false
		 */
		isMobile: function () {
			return this.isAndroid() || this.isIOS();
		},

		/**
		 * 是否android
		 * @method isAndroid
		 * @return {boolean} true|false
		 */
		isAndroid: function () {
			return /android/i.test(window.navigator.userAgent);

		},

		/**
		 * 是否ios
		 * @method isIOS
		 * @return {boolean} true|false
		 */
		isIOS: function () {
			return /iPod|iPad|iPhone/i.test(window.navigator.userAgent)
		},

		/**
		 * 获取a标签href相对地址
		 * @method getHref
		 * @param  {Object} item dom节点
		 * @return {String} href
		 */
		getHref: function (item) {
			var href = item.getAttribute('href', 2);
			href = href.replace('http://' + location.host, '');
			return href;
		},

		/**
		 * 深度拷贝对象
		 * @method cloneObject
		 * @param  {Object} obj 任意对象
		 * @return {Object} 返回新的拷贝对象
		 */
		cloneObject: function (obj) {
			var o = obj.constructor === Array ? [] : {};
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					o[i] = typeof obj[i] === "object" ? this.cloneObject(obj[i]) : obj[i];
				}
			}
			return o;
		},

		/**
		 * 插入内部样式
		 * @method insertStyle
		 * @param  {string | Array} rules 样式
		 * @param  {string} id 样式节点Id
		 */
		insertStyle: function (rules, id) {
			var _insertStyle = function () {
				var doc = document,
					node = doc.createElement("style");
				node.type = 'text/css';
				id && (node.id = id);
				document.getElementsByTagName("head")[0].appendChild(node);
				if (rules) {
					if (typeof(rules) === 'object') {
						rules = rules.join('');
					}
					if (node.styleSheet) {
						node.styleSheet.cssText = rules;
					} else {
						node.appendChild(document.createTextNode(rules));
					}
				}
			};
			if (id) {
				!document.getElementById(id) && _insertStyle();
			} else {
				_insertStyle();
			}
		}
	};

	module.exports = util;
});

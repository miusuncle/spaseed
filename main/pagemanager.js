
define('main/pagemanager', function(require, exports, module) {
	var $ = require('$');
	var router = require('router');
	var util = require('util');

	//首页模块名
	var root = 'page1';

	//layout配置
	var layoutConfig = {
		'default': require('main/layout/default')
	};

	//css配置
	var cssConfig = {};

	//页面主容器
	var pageContainer = $('#container');

	//切换页面需要更改class的对象
	var pageClassWrap = pageContainer;

	//页面默认class, 切换页面需要保留的class
	var pageDefaultClass = '';

	//默认标题
	var defaultTitle = window.defaultTitle = 'spaseed';

	//导航容器
	var navContainer = [$('body')];

	//导航选中态class
	var navActiveClass = 'active';

	/** 
	 * 页面管理
	 * @class pagemanager
	 * @static
	 */
	var pageManager = {
		/**
		 * 加载首页
		 * @method loadRoot
		 */
		loadRoot: function () {
			this._loadView(root);
		},

		/**
		 * 统一加载视图方法
		 * @method loadView
		 */
		loadView: function () {
			var _self = this,
				arr = [].slice.call(arguments);

			//解析路径
			this._parseUrl(arr, function (controller, action, params) {
				//处理路由, 加载视图
				_self._loadView(controller, action, params);
			})
		},

		/**
		 * 解析路径,处理url参数
		 * @method _parseUrlParams
		 * @param {Array}    arr 路由匹配到的参数
		 * @param {Function} cb  回调函数
		 */
		_parseUrl: function (arr, cb) {
			var controller = null,
				action = null,
				params = [],
				urlPara = null,
				clearParaStr = function (str) {
					return str.split('?')[0];
				};

			//获取url参数
			if (location.search) {
				var searchArr = location.search.substring(1).split('&');
				urlPara = {};
				for (var i=0, item; item = searchArr[i]; i++) {
					var itemArr = item.split('=');
					urlPara[itemArr[0]] = itemArr[1];
				}
			}

			//获取controller
			if (/^\?/.test(arr[0])) {
				//匹配首页 /?from=xx 场景
				controller = root;
			} else { 
				//匹配其他页 如/xx?from=xx需清除url参数
				controller = clearParaStr(arr[0]);
			}

			//获取action与params
			if (arr.length > 1) {
				if (/^\?/.test(arr[1])) {
					//匹配 /xx/?from=xx 场景
					action = '';
				} else {
					action = clearParaStr(arr[1]);
					params = arr.slice(2);
					//如有路由参数, 数组最后一项需清除可能存在的url参数
					if (params.length) {
						var lstIdx = params.length-1,
							lstItemStr = params[lstIdx] = clearParaStr(params[lstIdx]);
						!lstItemStr && params.splice(lstIdx, 1);
					}
				}
			}

			//将url参数放入params
			urlPara && params.push(urlPara);

			cb(controller, action, params);
		},

		/**
		 * 统一路由处理函数
		 * @method _loadView
		 * @param {String} controller 
		 * @param {String} action 
		 * @param {Array} params 
		 */
		_loadView: function (controller, action, params) {
			var _self = this;

			if (_self.currentViewObj) {
				//全局销毁
				_self.globalDestroy();
				//销毁前一个
				var destroy = _self.currentViewObj.destroy;
                try {
				    destroy && destroy.call(_self.currentViewObj);
				    if (_self.currentCtrlObj) {
				    	var ctrlDestroy = _self.currentCtrlObj.destroy;
				    	ctrlDestroy && ctrlDestroy.call(_self.currentCtrlObj);
				    }
                } catch(e) {
                    window.console && console.error && console.error('View destroy failed ', e);
                }
                _self.currentCtrlObj = null;
				_self.currentViewObj = null;
			}

			params = params || [];

			//渲染公共模版
			_self.renderLayout(controller, action, params);

			//模块基础路径
			var basePath = 'modules/';

			//模块id按照如下规则组成
			var controllerId = basePath + controller + '/' + controller,
				actionId = basePath + controller + '/' + action + '/' + action,
				view = action || controller;

			var moduleArr = [];

			//检查是否存在controller模块
			if (seajs.hasDefined[controllerId]) {
				moduleArr.push(controllerId);
			} else {
				controllerId = '';
			}

			//检查是否存在action模块
			if (action) {
				if (!seajs.hasDefined[actionId]) {
					_self.render404();
					return
				}
				moduleArr.push(actionId);
			} else {
				// 未指明action，默认尝试查询index
				var indexUri = basePath + controller + '/index/index';
				if (seajs.hasDefined[indexUri]) {
					moduleArr.push(indexUri);
					action = 'index';
				} else {
					//未指明action，且controller也不曾定义
					if (!controllerId) {
						_self.render404();
						return
					}
				}
			}

			//需加载的css资源
			var cssReqUrl = _self.addCssReq(controller, action);

			//加载css
			cssReqUrl.length && require.async(cssReqUrl);	

			//获取页面模块对外接口
			require.async(moduleArr, function(cObj, aObj) {
				
				//controller未定义, 此时cObj属于一个action 
				if (!controllerId) {
					aObj = cObj;
				}

				//执行controller, 判断同contoller下的action切换, contoller不需要再重复执行
				if (controllerId && (!_self.fragment || _self.fragment.indexOf('/' + controller) < 0 || !action)) {
					_self.renderView(cObj, params);
				} 
				_self.fragment = router.fragment;

				//执行action
				if (action) {
					_self.renderView(aObj, params);
					_self.currentViewObj = aObj;
					controllerId && (_self.currentCtrlObj = cObj);
				} else {
					_self.currentViewObj = cObj;
				}

				//更改导航状态
		  		_self.changeNavStatus(view); 

		  		//设置页面标题
		  		_self.setTitle(cObj, aObj);
				
			});

		},


		/**
		 * 通过配置组装css请求
		 * (单页面模式会有先出dom后出样式的情况，不建议使用这种动态加载方式)
		 * @method addCssReq
		 * @param  {String} controller 
		 * @param  {String} action 
		 * @return {Array}  
		 */
		addCssReq: function (controller, action) {
			var controllerCssReq = cssConfig[controller],
				actionCssReq = cssConfig[controller + '_' + action],
				reqUrl = [],
				concatReqUrl = function (cssArr) {
                    for (var i = 0; i < cssArr.length; i++) {
                       //csspath可通过seajs的map参数配置映射
					   cssArr[i] && (reqUrl = reqUrl.concat('csspath/' + cssArr[i]));
                    }
				}; 

			controllerCssReq && concatReqUrl(controllerCssReq['cssFile']);	
			actionCssReq && concatReqUrl(actionCssReq['cssFile']);
			return reqUrl;
		},

		/**
		 * 渲染公共模版
		 * @method renderLayout
		 * @param {String} controller 
		 * @param {String} action 
		 * @param {Array} params 
		 */
		renderLayout: function (controller, action, params) {
			var _self = this,
				_render = function (layoutName) {
				if (_self.layout != layoutName) {
					layoutConfig[layoutName].render();
					_self.layout = layoutName;
				} 
			};
			//可通过controller参数使用其他layout
			/*switch (controller) {
				case 'xx':
					_render('xx');
					break;
				default:
					_render('default');
			}*/
			_render('default');
		},

		/**
		 * 渲染视图
		 * @method renderView
		 * @param {String} obj 模块对象
		 * @param {String} params 参数
		 */
		renderView: function (obj, params) {
			if (obj) {
				var defaultClass = pageDefaultClass;
				//页面模块通过属性pageClass来变更样式
				if (obj.pageClass) { 
					pageClassWrap.attr('class', defaultClass + ' ' + obj.pageClass);
				} else {
					if (pageClassWrap.attr('class') != defaultClass) {
						pageClassWrap.attr('class', defaultClass);
					}
				}
			}
            
			if (obj && obj.render) {
				obj.render.apply(obj, params);
			} else {
				this.render404();
			}
		},

		/**
		 * 渲染404
		 * @method render404
		 */
		render404: function () {
			var notFound = '<h2 id="tt404" style="text-align:center;padding-top:100px;font-size:20px;line-height:1.5;color:#999"> <p>404</p> 您访问的页面没有找到! </h2>';
			var container = pageContainer;
			container && container.html(notFound);
		},

		/**
		 * 设置页面标题
		 * @method setTitle
		 * @param {Object} cObj controller模块对象
		 * @param {Object} aObj action模块对象
		 */
		setTitle: function (cObj, aObj) {
			if (aObj && aObj.title) {
				document.title = aObj.title;
			} else if (cObj && cObj.title) {
				document.title = cObj.title;
			} else {
				if (document.title != defaultTitle) {
					document.title = defaultTitle;
				}
			}
		},

		/**
		 * 改变导航选中态
		 * @method changeNavStatus
		 * @param {String} view 当前视图
		 */
		changeNavStatus: function (view) {
			var _self = this,
				fragment = this.fragment;

			var changeNav = function (navcon, links) {
				navcon.find('.' + navActiveClass).removeClass(navActiveClass);
				for (var i = 0, item; item = links[i]; i++) {
			        var href = util.getHref(item);
			        
			        if ( (href === '/' && view === root) || (href !== '/' && fragment.indexOf(href) == 0) ) {
			          var itemParent = $(item).parent();
			          if (navcon.find('.' + navActiveClass).length) {
			          	(fragment === href) && itemParent.addClass(navActiveClass);
			          } else {
			          	itemParent.addClass(navActiveClass);
			          }
				      
			        }
			    }
			};

			for (var i=0, navcon; navcon = navContainer[i]; i++) {
				changeNav(navcon, navcon.find('a'));
			}
		},

		/**
		 * 页面切换时全局销毁
		 * @method globalDestroy
		 */
		globalDestroy: function () {
			
		},

		/**
		 * 重置fragment标记
		 * @method resetFragment
		 */
		resetFragment: function () {
			this.fragment = '';
		}

	};
	
	module.exports = pageManager;
});

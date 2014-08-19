
define('spaseed/main/pagemanager', function(require, exports, module) {
	var $ = require('$');
	var router = require('router');
	var util = require('util');
	var spaseedPageConfig = require('spaseed/config/page_config');

	/** 
	 * 页面管理
	 * @class pageManager
	 * @static
	 */
	var pageManager = {

		config: {},

		/**
		 * 初始化
		 * @param {Object} pageConfig 页面配置对象
		 * @method init
		 */
		init: function (pageConfig) {
			var config = this.config;
			pageConfig = pageConfig || {};
			$.extend(true, config, spaseedPageConfig, pageConfig);

			/**
			 * 页面包裹容器
			 * @property pageWrapper
			 * @type Object
			 */
			this.pageWrapper = $(config.pageWrapper);
		},	


		/**
		 * 加载首页
		 */
		loadRoot: function () {
			this.loadView(this.config.root);
		},

		/**
		 * 统一加载视图方法
		 */
		loadCommon: function () {
			var _self = this,
				arr = [].slice.call(arguments);

			//解析路径
			this.parseUrl(arr, function (controller, action, params) {
				//处理路由, 加载视图
				_self.loadView(controller, action, params);
			})
		},

		/**
		 * 解析路径,处理url参数
		 * @method parseUrl
		 * @param {Array}    arr 路由匹配到的参数
		 * @param {Function} cb  回调函数
		 */
		parseUrl: function (arr, cb) {
			var controller = null,
				action = null,
				params = [],
				urlPara = null,
				clearParaStr = function (str) {
					return str.split('?')[0];
				},
				locationSearch = /\?.*/.exec(location.href);

			//获取url参数
			if (locationSearch) {
				urlPara = util.paramsToObject(locationSearch[0]);
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
		 * @method loadView
		 * @param {String} controller 
		 * @param {String} action 
		 * @param {Array} params 
		 */
		loadView: function (controller, action, params) {
			var _self = this,
				config = this.config;

			//渲染前执行业务逻辑
			if (config.beforeRender) {
				if (config.beforeRender(controller, action, params) === false) {
					return
				}
			};

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
			this.renderLayout(controller, action, params);

			//存储主要jQuery dom对象

			/**
			 * 页面主容器
			 * @property container
			 * @type Object
			 */
			this.container = $(config.container);

			/**
			 * 切换页面需要更改class的容器
			 * @property classWrapper
			 * @type Object
			 */
			this.classWrapper = $(config.classWrapper);

			//模块基础路径
			var basePath = config.basePath;

			//模块id按照如下规则组成
			var controllerId = basePath + controller + '/' + controller,
				actionId = basePath + controller + '/' + action + '/' + action;

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
				if (config.changeNavStatus) {
					config.changeNavStatus(controller, action);
				} else {
					_self.changeNavStatus(controller, action);
				}

		  		//设置页面标题
		  		_self.setTitle(cObj, aObj); 
				
			});

		},


		/**
		 * 通过配置组装css请求
		 * (单页面模式会有先出dom后出样式的情况，不建议使用这种动态加载方式)
		 */
		addCssReq: function (controller, action) {
			var cssConfig = this.config.css,
				controllerCssReq = cssConfig[controller],
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
		 */
		renderLayout: function (controller, action, params) {
			var _self = this,
				config = _self.config,
				layoutConfig = config.layout,
				layout = 'default',
				_render = function (layoutName) {
					if (_self.layout != layoutName) {
						require.async(layoutConfig[layoutName]['module'], function (_layout) {
							_layout.render(config.sidebar);
						})
						_self.layout = layoutName;
					} 
				};

			loop: for (var key in layoutConfig) {
				var controllerArr = layoutConfig[key].controller || [];
				for (var i = 0, c; c = controllerArr[i]; i++) {
					if (controller === c) {
						layout = key;
						break loop;
					}
				}
			}
			_render(layout);
		},

		/**
		 * 渲染视图
		 */
		renderView: function (obj, params) {
			if (obj) {
				var config = this.config,
				 	defaultClass = config.defaultClass,
					classWrapper = this.classWrapper;

				//页面模块通过属性pageClass来变更样式
				if (obj.pageClass) { 
					classWrapper.attr('class', defaultClass + ' ' + obj.pageClass);
				} else {
					if (classWrapper.attr('class') !== defaultClass) {
						classWrapper.attr('class', defaultClass);
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
			var notFound = '<h2 id="tt404" style="text-align:center;padding-top:100px;font-size:20px;line-height:1.5;color:#999">'+
						   ' <p style="font-size:44px">404</p> 您访问的页面没有找到! </h2>';
			var container = this.container;
			container.html(notFound);
		},

		/**
		 * 设置页面标题
		 */
		setTitle: function (cObj, aObj) {
			if (aObj && aObj.title) {
				document.title = aObj.title;
			} else if (cObj && cObj.title) {
				document.title = cObj.title;
			} else {
				var defaultTitle = this.config.defaultTitle;
				if (document.title != defaultTitle) {
					document.title = defaultTitle;
				}
			}
		},

		/**
		 * 改变导航选中态
		 */
		changeNavStatus: function (controller, action) {
			var _self = this,
				fragment = this.fragment,
				config = this.config,
				root = config.root,
				navContainer = config.navContainer,
				navActiveClass = config.navActiveClass;

			var changeNav = function (navcon, links) {
				navcon.find('.' + navActiveClass).removeClass(navActiveClass);
				for (var i = 0, item; item = links[i]; i++) {
			        var href = util.getHref(item);
			        
			        if ( (href === '/' && controller === root) || (href !== '/' && fragment.indexOf(href) == 0) ) {
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
				navcon = $(navcon);
				changeNav(navcon, navcon.find('a'));
			}
		},

		/**
		 * 页面切换时全局销毁
		 */
		globalDestroy: function () {

		},

		/**
		 * 重置fragment标记(用于强制刷新controller)
		 * @method resetFragment
		 */
		resetFragment: function () {
			this.fragment = '';
		}

	};
	
	module.exports = pageManager;
});

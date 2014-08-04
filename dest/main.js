
/**
 * 默认layout
 */
define('main/layout/default', function(require, exports, module) {
	var $ = require('$');
	var util = require('util');

	var layout = {
		_tmpl: {
			main: ''
		},
		render: function () {
			
		}
	};
	module.exports = layout;
});


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


define('main/router', function(require, exports, module) {

  var docMode = document.documentMode;
  var oldIE = (/msie [\w.]+/.test(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
  var pushState = window.history.pushState;

  /**
   * 路由管理
   * @class router
   * @static
   */
  var router = {
    /**
     * 初始化
     * @method init
     */
    init: function (option) {

      this.option = {

        //是否使用html5 history API设置路由
        'html5Mode': true,

        //页面管理对象
        'pageManager': {},

        //路由映射对象
        'routes': {},

        //低端浏览器监听url变化的时间间隔
        'interval': 50,

        //低端浏览器如设置了domain, 需要传入
        'domain': ''

      };

      option = option || {};

      for (var p in option) {
        this.option[p] = option[p];
      }

      this.option['html5Mode'] = (pushState && this.option['html5Mode']);

      //支持debug模式(url加上debug后不改变页面切换逻辑,可有针对性做一些事情)
      this.debug = false;
      var locationHref = window.location.href;
      if (/\/debug_online/.test(locationHref)) {
        this.debug = '/debug_online';
      } else if (/\/debug/.test(locationHref)) {
        this.debug = '/debug';
      }

      var _self = this,

          evt = this.option['html5Mode'] ? 'popstate' : 'hashchange';

      var start = function () {

          var initPath = _self.getFragment() ? _self.getFragment() : '/';

          if (initPath === '/index.html') {
            initPath = '/';
          }

          //完整路径在hash环境打开则转化为锚点路径后跳转
          if (!_self.option['html5Mode'] && !/#(.*)$/.test(locationHref) && initPath !== '/') {
            location.replace('/#' + initPath);
            return;
          }

          _self.navigate(initPath, false, true);
      };

      if (oldIE) {

        //ie8以下创建iframe模拟hashchange
        var iframe = document.createElement('iframe');
        iframe.tabindex = '-1';
        if (this.option['domain']) {
          iframe.src = 'javascript:void(function(){document.open();'+
                       'document.domain = "' + this.option['domain'] + '";document.close();}());';
        } else {
          iframe.src = 'javascript:0';
        }
        iframe.style.display = 'none';

        var _iframeOnLoad = function () {
            iframe.onload = null;
            iframe.detachEvent('onload', _iframeOnLoad);
            start();
            _self.checkUrlInterval = setInterval(function () {
              _self.checkUrl();
            }, _self.option['interval']);
        };
        if (iframe.attachEvent) {
            iframe.attachEvent('onload', _iframeOnLoad);
        } else {
            iframe.onload = _iframeOnLoad;
        }

        document.body.appendChild(iframe);
        this.iframe = iframe.contentWindow;
       
      } else {

        //其他浏览器监听popstate或hashchange
        this.addEvent(window, evt, function () {
          _self.checkUrl();
        });

      }

      if (!this.iframe) {
        start();
      }
     
    },

    /**
     * 事件监听
     * @method addEvent
     */
    addEvent: function (elem, event, fn) {
      if (elem.addEventListener) {
        elem.addEventListener(event, fn, false);
      } else if (elem.attachEvent) { 
        elem.attachEvent("on" + event, fn);
      } else {
        elem[event] = fn;
      }
    },

    /**
     * 获取hash值
     * @method getHash
     * @param {Object} win 窗口对象
     * @return {String} hash值
     */
    getHash: function (win) {
      var match = (win || window).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    /**
     * 获取url片段
     * @method getFragment
     * @return {String} url片段
     */
    getFragment: function () {
      var fragment, 
          pathName = window.location.pathname + window.location.search;

      if (this.option['html5Mode']) {
        fragment = pathName;
        //如果锚点路径在html5Mode环境打开 
        if (fragment === '/' && this.getHash()) {    
          fragment = this.getHash();
        }
      } else {
        fragment = this.getHash();
        //如果完整路径在hash环境打开
        if (fragment === '' && pathName !== '/' && pathName !== '/index.html') { 
          fragment = pathName;
        }
      }
      return fragment;
    },

    /**
     * 监听url变化
     * @method checkUrl
     */
    checkUrl: function () {
      var current = this.getFragment();
      if (this.debug) {
        current = current.replace(this.debug, '');
      }
      if (this.iframe) {
        current = this.getHash(this.iframe);
      }
      if (current === this.fragment) {
        return
      }

      this.navigate(current, false, true);
    },

    /**
     * 去除前后#
     * @method stripHash
     * @param {String} url 
     */
    stripHash: function (url) {
      return url.replace(/^\#+|\#+$/g, '');
    },

    /**
     * 去除前后斜杠
     * @method stripSlash
     * @param {String} url 
     */
    stripSlash: function (url) {
      return url.replace(/^\/+|\/+$/g, '');
    },

    /**
     * 导航
     * @method navigate
     * @param {String}  url 地址
     * @param {Boolean} slient 不改变地址栏
     * @param {Boolean} replacement 替换浏览器的当前会话历史(h5模式时支持)
     */
    navigate: function (url, slient, replacement) {
      var _self = this;
      
      if (url !== '/') {
        url = _self.stripHash(url);
        url = _self.stripSlash(url);
        url = '/' + url; 
      }
      
      if (url !== _self.fragment && !slient) {//slient为true时，只路由不改变地址栏
        if (_self.debug) {
          url = url.replace(_self.debug, '');
          url = _self.debug + url;
        }
        if (_self.option['html5Mode']) {
          var _stateFun = replacement ? 'replaceState' : 'pushState';
          history[_stateFun]({}, document.title, url);
        } else {
          if (url !== '/' || _self.getFragment()) {
            location.hash = url; 
            _self.iframe && _self.historySet(url, _self.getHash(_self.iframe));
          } 
        }
      }

      if (_self.debug) {
        url = url.replace(_self.debug, '');
        !url && (url = '/');
      }
      _self.fragment = url;
      _self.loadUrl(url);

    },

    /**
     * 低端浏览器设置iframe历史
     * @method historySet
     * @param {String} hash 
     * @param {String} historyHash
     */
    historySet : function(hash, historyHash) {
        var iframeDoc = this.iframe.document;

        if (hash !== historyHash) {
          iframeDoc.open();
          if (this.option['domain']) {
            iframeDoc.write('<script>document.domain="' + this.option['domain'] + '"</script>');
          }
          iframeDoc.close();
          this.iframe.location.hash = hash;
        }
    },

    /**
     * 重定向
     * @method redirect
     * @param {String}  url 地址
     * @param {Boolean} slient 不改变地址栏
     * @param {Boolean} replacement 替换浏览器的当前会话历史(h5模式时支持)
     */
    redirect: function (url, slient, replacement) {
      this.navigate(url, slient, replacement);
    },

    /**
     * 路由匹配
     * @method matchRoute
     * @param  {String} rule 路由规则
     * @param  {String} url 地址
     * @return {Array}  参数数组
     */
    matchRoute: function (rule, url) {
      var optionalReg = /\((.*?)\)/g,
          paramReg = /(\(\?)?:\w+/g,
          astReg = /\*\w+/g,
          ruleToReg = function (rule) {
            rule = rule.replace(optionalReg, '(?:$1)?').replace(paramReg, '([^\/]+)').replace(astReg, '(.*?)');
            return new RegExp('^' + rule + '$');
          },
          route = ruleToReg(rule),
          result = route.exec(url),
          params = null;

      if (result) {
        var args = result.slice(1);
        params = [];
        for (var i = 0, p; p = args[i]; i++){      
           params.push(p ? decodeURIComponent(p) : ''); 
        }
      }
      return params;
    },

    /**
     * 加载页面
     * @method loadUrl
     * @param {String} url 地址
     */
    loadUrl: function (url) {
      var _self = this,
          routes = _self.option.routes,
          pm = _self.option.pageManager,
          action = null,
          params = null;

      for (var rule in routes) {
          //匹配到路由规则
          if (params = _self.matchRoute(rule, url)) {
            action = routes[rule];
            pm[action] && pm[action].apply(pm, params);
            break;
          }
      } 
    }
  };

  module.exports = router;

});


define('main/startup', function(require, exports) {
	var $ = require('$');
	var evt = require('event');
	var util = require('util');
	var router = require('router');
	var pageManager = require('pagemanager');


	//应用入口函数
    var startup = function () {

		//初始化路由
		router.init({
			'html5Mode': true,
			'pageManager': pageManager,
			'routes': {
				'/': 'loadRoot',
				'/*controller(/*action)(/*p1)(/*p2)(/*p3)(/*p4)': 'loadView'
			}
		});

		//全局点击
		evt.addCommonEvent('click', { 
			'nav': function () {
				var _this = this;
				router.navigate(util.getHref(_this));
			}
		});

	    //记录所有请求完毕
	    var win = window;
	    $(win).load(function () {
	   		win.isOnload = true;
	    });
		
    };

    exports.startup = startup;
});

define('config/dao_config', function(require, exports, module) {

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


define('modules/page1/page1', function (require, exports, module) {
    var $ = require('$');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
    	main: '<h1 data-event="tt_click"><%=data.title%></h1><div><%=data.description%></div>'
    };

    var page1 = {

        title: 'page1',

        pageClass: '',

        render: function () {

            manager.queryPage1({}, function(data) {
            	$('#container').html(util.tmpl(_tpl.main, {
        			data: data
        		}));
            });

            this.bindEvent();
        },

        bindEvent: function () {

            evt.addCommonEvent('click', { 
                'tt_click': function () {
                    alert($(this).text())
                }
            });
        },

        destroy: function () {

        }
    };
        
    module.exports = page1;
});

define('modules/page2/page2', function (require, exports, module) {
    var $ = require('$');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: '<h1><%=data.title%></h1><div><%=data.description%></div>'
    };

    var page2 = {

        title: 'page2',

        pageClass: '',

        render: function () {

            manager.queryPage2({}, function(data) {
                $('#container').html(util.tmpl(_tpl.main, {
                    data: data
                }));
            });

            this.bindEvent();
        },

        bindEvent: function () {
            
            evt.addCommonEvent('click', { 
                
            });
        },

        destroy: function () {

        }
    };
        
    module.exports = page2;
});

define('modules/page3/index/index', function (require, exports, module) {
    var $ = require('$');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: '<div>This is \'/page3/index\' content</div>'
    };

    var page3Index = {

        title: 'page3 index',

        pageClass: '',

        render: function () {

            $('#subcontainer').html(_tpl.main);

            this.bindEvent();
        },

        bindEvent: function () {

            evt.addCommonEvent('click', { 
                
            });
        },

        destroy: function () {

        }
    };
        
    module.exports = page3Index;
});

define('modules/page3/other/other', function (require, exports, module) {
    var $ = require('$');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: '<div>This is \'other\' page content</div>'
    };

    var page3Other = {

        title: 'page3 other',

        pageClass: '',

        render: function () {

            $('#subcontainer').html(_tpl.main);

            this.bindEvent();
        },

        bindEvent: function () {

            evt.addCommonEvent('click', { 
                
            });
        },

        destroy: function () {

        }
    };
        
    module.exports = page3Other;
});

define('modules/page3/page3', function (require, exports, module) {
    var $ = require('$');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: '<h1><%=data.title%></h1><div><%=data.description%></div><ul class="menu submenu"><li><a href="/page3" data-event="nav">/page3/index</a></li><li><a href="/page3/other" data-event="nav">/page3/other</a></li></ul><div id="subcontainer" class="subcontainer"></div>'
    };

    var page3 = {

        render: function () {

            manager.queryPage3({}, function(data) {
                $('#container').html(util.tmpl(_tpl.main, {
                    data: data
                }));
            });

            this.bindEvent();
        },

        bindEvent: function () {
            
            evt.addCommonEvent('click', { 
                
            });
        },

        destroy: function () {

        }
    };
        
    module.exports = page3;
});
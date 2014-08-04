
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

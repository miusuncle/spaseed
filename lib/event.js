
/**
 * 事件管理
 * @class event
 * @static
 */
define('lib/event', function(require, exports, module) {
	var util = require('util');

	//默认判断是否有事件的函数
	var _defalutJudgeFn = function(elem){
		return !!elem.getAttribute("data-event");
	};

	//默认获取事件key的函数
	var _defaultGetEventkeyFn = function(elem){
		return elem.getAttribute("data-event");
	};

	//添加事件监听
	var addEvent = function (elem, event, fn) {
		if (elem.addEventListener)  // W3C
			elem.addEventListener(event, fn, true);
		else if (elem.attachEvent) { // IE
			elem.attachEvent("on"+ event, fn);
		}
		else {
			elem[event] = fn;
		}
	};
	
	//获取元素中包含事件的第一个子元素
	var getWantTarget = function(evt, topElem, judgeFn){
		
		judgeFn = judgeFn || this.judgeFn || _defalutJudgeFn;
		
		var _targetE = evt.srcElement || evt.target;
		
		while( _targetE  ){
			
			if(judgeFn(_targetE)){
				return _targetE;
			}
			
			if( topElem == _targetE ){
				break;
			}
		
			_targetE = _targetE.parentNode;
		}
		return null;
	};

	/**
	 * 通用的绑定事件处理
	 * @method bindCommonEvent
	 * @param {Element} 要绑定事件的元素
	 * @param {String} 绑定的事件类型
	 * @param {Object} 事件处理的函数映射
	 * @param {Function} 取得事件对应的key的函数
	 */
	var bindCommonEvent = function (topElem, type, dealFnMap, getEventkeyFn) {
		
		if (type === 'click') {
			util.isMobile() && (type = 'tap');
		}
		
		getEventkeyFn =  getEventkeyFn || _defaultGetEventkeyFn;
		
		var judgeFn = function (elem) {
			return !!getEventkeyFn(elem);
		};

		var hdl = function(e){
			
			/**
			 * 支持直接绑定方法
			 */
			var _target = getWantTarget(e, topElem, judgeFn), _hit = false;
			
			if (_target) {
				var _event = getEventkeyFn(_target);
				var _returnValue;


				if(Object.prototype.toString.call(dealFnMap)==="[object Function]"){
					_returnValue = dealFnMap.call(_target,e,_event);
					_hit = true
				}
				else{
					if(dealFnMap[_event]){
						_returnValue = dealFnMap[_event].call(_target, e)
						_hit = true;
					}
				}
				if(_hit){
					if(!_returnValue){
						if(e.preventDefault)
			                e.preventDefault();
			            else
			                e.returnValue = false;
					}
				}
				
			}
			
		}

		if (type === 'tap') {
			(function(){
				var isTap = true;
				addEvent(topElem,'touchstart',function(){
					isTap = true;
				})
				addEvent(topElem,'touchmove',function(){
					isTap = false;
				})
				addEvent(topElem,'touchend',function(e){
					if (isTap) {
						hdl(e);
					}
				})
			})()
			
		} else {
			addEvent(topElem, type, hdl);
		}
		
	};

	var commonEvents = {};

	/**
	 * 为body添加事件代理
	 * @method addCommonEvent
	 * @param {type} 事件类型
	 * @param {dealFnMap} 事件处理的函数映射
	 */
	var addCommonEvent = function(type, dealFnMap) { 
		var evtTypeObj = commonEvents[type];
		if (!evtTypeObj) {
			evtTypeObj = commonEvents[type] = {};
		}
		for (var key in dealFnMap) {
			if (!evtTypeObj[key]) {
				var fnMap = {};
				fnMap[key] = dealFnMap[key];
				if (type == 'mouseenter' || type == 'mouseleave') {//为兼容性,使用jq方法接管
					$('body').on(type, '[data-event="'+key+'"]', fnMap[key]);
				} else {
					bindCommonEvent(document.body, type, fnMap);
				}
				evtTypeObj[key] = 1;
			}
		}	
	};

	//绑定代理事件，自定义代理对象
	exports.bindCommonEvent = bindCommonEvent;

	//统一绑定body的代理事件
	exports.addCommonEvent = addCommonEvent;


});
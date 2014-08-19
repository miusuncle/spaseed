define('spaseed/config/page_config', function(require, exports, module) {
	var $ = require('$');

	/** 
	 * 页面管理参数配置
	 * @class pageConfig
	 * @static
	 */
	var pageConfig = {

		/**
		 * 页面模块基础路径
		 * @property basePath
		 * @type String
		 * @default 'modules/'
		 */
		'basePath': 'modules/',

		/**
		 * 页面包裹选择器
		 * @property pageWrapper
		 * @type String
		 * @default '#pageWrapper'
		 */
		'pageWrapper': '#pageWrapper',

		/**
		 * 页面主容器选择器
		 * @property container
		 * @type String
		 * @default '#container'
		 */
		'container': '#container',

		/**
		 * 切换页面需要更改class的容器选择器
		 * @property classWrapper
		 * @type String
		 * @default '#container'
		 */
		'classWrapper': '#container',

		/**
		 * 切换页面需要保留的class
		 * @property defaultClass
		 * @type String
		 * @default ''
		 */
		'defaultClass': '',

		/**
		 * 默认标题
		 * @property defaultTitle
		 * @type String
		 * @default 'spaseed'
		 */
		'defaultTitle': 'spaseed',

		/**
		 * 导航容器选择器, 在各容器中遍历a标签, 执行选中态匹配
		 * @property navContainer
		 * @type Array
		 * @default ['body']
		 */
		'navContainer': ['body'],

		/**
		 * 导航选中class名
		 * @property navActiveClass
		 * @type String
		 * @default 'active'
		 */
		'navActiveClass': 'active',

		/**
		 * 渲染前执行方法
		 * @property beforeRender
		 * @type Function
		 * @default function (controller, action, params) {}
		 */
		'beforeRender': function (controller, action, params) {
		},

		/**
		 * 改变导航选中态
		 * @property changeNavStatus
		 * @type Function
		 * @default 通用方法
		 */
		'changeNavStatus': null,

		/**
		 * layout模版
		 * @property layout
		 * @type Object
		 * @default {
						'default': {
							'controller': [],
							'module': 'spaseed/layout/default'
						}
					}
		 */
		'layout': {
			'default': {
				'controller': [],
				'module': 'spaseed/layout/default'
			}
		},

		/**
		 * 首页模块名
		 * @property root
		 * @type String
		 * @default 'home'
		 */
		'root': 'home',

		/**
		 * css配置
		 * @property css
		 * @type Object
		 * @default {}
		 */
		'css': {}
	};

	module.exports = pageConfig;
});

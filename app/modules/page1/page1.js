
define('modules/page1/page1', function (require, exports, module) {
    var $ = require('$');
    var pageManager = require('pageManager');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
    	main: TEMPLATE.MAIN
    };

    var page1 = {

        title: 'page1',

        pageClass: '',

        render: function () {

            manager.queryPage1({}, function(data) {
            	pageManager.container.html(util.tmpl(_tpl.main, {
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
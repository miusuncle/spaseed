
define('modules/page3/index/index', function (require, exports, module) {
    var $ = require('$');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: TEMPLATE.MAIN
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
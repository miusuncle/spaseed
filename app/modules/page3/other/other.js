
define('modules/page3/other/other', function (require, exports, module) {
    var $ = require('$');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: TEMPLATE.MAIN
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

define('modules/page2/page2', function (require, exports, module) {
    var $ = require('$');
    var manager = require('manager');
    var util = require('util');
    var evt = require('event');

    var _tpl = {
        main: TEMPLATE.MAIN
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
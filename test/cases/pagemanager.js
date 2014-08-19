 

define('modules/test_single_ctrl/test_single_ctrl', function (require, exports, module) {
    var $ = require('$');
    var page = {
        render: function () {
            $('#container').html('test_single_ctrl');
        }
    };
    module.exports = page;
});

define('modules/test_ctrl/test_ctrl', function (require, exports, module) {
    var $ = require('$');
    var page = {
        render: function () {
            $('#container').html('<h1>test_ctrl</h1><div id="subcontainer"></div>');
        }
    };
    module.exports = page;
});

define('modules/test_ctrl/test_action/test_action', function (require, exports, module) {
    var $ = require('$');
    var page = {
        render: function () {
            $('#subcontainer').html('test_action');
        }
    };
    module.exports = page;
});

var argVar;
define('modules/test_ctrl/test_action2/test_action2', function (require, exports, module) {
    var $ = require('$');
    var page = {
        render: function () {
            argVar = arguments;
        }
    };
    module.exports = page;
});

define('modules/test_ctrl2/test_action/test_action', function (require, exports, module) {
    var $ = require('$');
    var page = {
        render: function () {
            $('#container').html('test_nocontrl_action');
        }
    };
    module.exports = page;
});


define('test/cases/pagemanager', function(require) {
    var $ = require('$'),
        pageManager = require('pageManager'),
        router = require('router');

    describe('pagemanager', function () {
        it('Should render single controller page correctly', function () {
            pageManager.loadCommon('test_single_ctrl');
            $('#container').text().should.equal('test_single_ctrl');
        });
        it('Should render complete controller action page correctly', function () {
            pageManager.loadCommon('test_ctrl','test_action');
            $('#container').find('h1').text().should.equal('test_ctrl');
            $('#container').find('#subcontainer').text().should.equal('test_action');
        });
        it('Should render no controller page correctly', function () {
            pageManager.loadCommon('test_ctrl2','test_action');
            $('#container').text().should.equal('test_nocontrl_action');
        });
        it('Should render url params page correctly', function () {
            router.navigate('test_ctrl/test_action2?r=123', false, true);
            pageManager.loadCommon('test_ctrl','test_action2?r=123');
            argVar[0].r.should.equal('123');
            router.navigate('test_ctrl/test_action2/111?r=1234', false, true);
            pageManager.loadCommon('test_ctrl','test_action2', '111?r=1234');
            argVar[0].should.equal('111');
            argVar[1].r.should.equal('1234');
        });
        it('Should render 404 page correctly', function () {
            pageManager.loadCommon('test_ctrl','aaa');
            $('#container').find('p').text().should.equal('404');
            $('#container').html('');
        });
    });

    setTimeout(function () {
        router.navigate('/', false, true);
    }, 100);

});

seajs.use('test/cases/pagemanager');

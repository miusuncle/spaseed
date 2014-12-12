 
define('test/cases/net', function(require) {
    var $ = require('$'),
        net = require('net');

    describe('net', function () {
        describe('send()', function () {
            this.timeout(5000);
            window.isOnload = 1;
            it('should have the correct callback', function (done) {
                net.send({
                    url: '/xxx',
                    method: 'get'
                }, {
                    cb: function (data) {
                        done();
                    }
                })
            })          
        });
    });

});

seajs.use('test/cases/net');

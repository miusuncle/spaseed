 
define('test/cases/util', function(require) {
    var $ = require('$'),
        util = require('util');

    describe('util', function () {
        describe('cookie{}', function () {
            describe('set(), get()', function () {
                it('Should set and get cookie correctly', function () {
                    if (document.domain) {
                        util.cookie.set('test', '111');
                        util.cookie.get('test').should.equal('111');
                    }
                }) 
            });
            describe('del()', function () {
                it('Should delete cookie correctly', function () {
                    util.cookie.del('test');
                    util.cookie.get('test').should.equal('');
                }) 
            })
        });

        describe('tmpl()', function () {
            it('Should return the html  correctly', function () {
                var htmlStr = util.tmpl('<h1><%=user%></h1>', {user:'evanyuan'});
                htmlStr.should.equal('<h1>evanyuan</h1>');
            }) 
            it('Should support mixed template', function () {
                var careerTmpl = '<div><%=career%></div>';
                var htmlStr = util.tmpl('<h1><%=user%></h1><%#careerTmpl%>', {user:'evanyuan', career: '前端工程师'}, {careerTmpl: careerTmpl});
                htmlStr.should.equal('<h1>evanyuan</h1><div>前端工程师</div>');
            }) 
            it('Should escaped correctly', function () {
                var careerTmpl = '<div><%=career%></div>';
                var htmlStr1 = util.tmpl('<h1><%=user%></h1><%#careerTmpl%>', {user:'<script>alert(1);</script>', career: '<script>alert(2);</script>'}, {careerTmpl: careerTmpl});
                htmlStr1.should.equal('<h1>&lt;script&gt;alert(1);&lt;/script&gt;</h1><div>&lt;script&gt;alert(2);&lt;/script&gt;</div>');
            
                var htmlStr2 = util.tmpl('<h1><%-user%></h1><%#careerTmpl%>', {user:'<script>alert(1);</script>', career: '<script>alert(2);</script>'}, {careerTmpl: careerTmpl});
                htmlStr2.should.equal('<h1><script>alert(1);</script></h1><div>&lt;script&gt;alert(2);&lt;/script&gt;</div>');
            }) 
        });

        describe('paramsToObject()', function () {
            it('Should return correctly', function () {
                var query = '?a=1&b=2';
                var object = util.paramsToObject(query);
                object.a.should.equal('1');
                object.b.should.equal('2');
            }) 
        });

        describe('cloneObject()', function () {
            it('Should return correctly', function () {
                var oArr = [{a:[1,2,3],b:2}, {a:3,b:4}];
                var nArr = util.cloneObject(oArr);
                nArr[0].a = [3,4,5];
                
                oArr[0].a[0].should.equal(1);
                nArr.should.have.length(2);
                nArr[0].a[0].should.equal(3);
            }) 
        });

        describe('insertStyle()', function () {
            it('Should execution correctly', function () {
                util.insertStyle('body{color:rgb(51, 51, 51)}', 'aaa');
                util.insertStyle('body{color:rgb(61, 61, 61)}', 'aaa');
                $('body').css('color').should.equal('rgb(51, 51, 51)');
                $('#aaa').length.should.equal(1);
            }) 
        });
        
    });

});

seajs.use('test/cases/util');

 
define('test/cases/router', function(require) {
    var $ = require('$'),
        router = require('router');

    describe('router', function () {
        var current = '';
        var args;

        router.init({
            'pageManager': {
                'fullpath': function () {
                    current = 'fullpath';
                    args = arguments;
                },
                'paramPath': function () {
                    current = 'paramPath';
                    args = arguments;
                },
                'optionalPath': function () {
                    current = 'optionalPath';
                    args = arguments;
                },
                'asteriskPath': function () {
                    current = 'asteriskPath';
                    args = arguments;
                },
                'loadViewPath': function () {
                    current = 'loadViewPath';
                    args = arguments;
                }
            },
            'routes': {
                '/aa/bb': 'fullpath',
                '/aa/:id': 'paramPath',
                '/bb(/cc)(/dd)': 'optionalPath',
                '/cc/*everypath': 'asteriskPath',
                '/*controller(/*action)(/*p1)(/*p2)(/*p3)(/*p4)': 'loadViewPath'
            }
        });

        it('Should match full path correctly', function () {
            router.navigate('/aa/bb?r=1', false, true);
            current.should.equal('fullpath');
        });
        it('Should match param path correctly', function () {
            router.navigate('/aa/123', false, true);
            current.should.equal('paramPath');
            args[0].should.equal('123');
        });
        it('Should match optional path correctly', function () {
            router.navigate('/bb/cc', false, true);
            current.should.equal('optionalPath');
        });
        it('Should match asterisk path correctly', function () {
            router.navigate('/cc/dd/ee/ff.js', false, true);
            current.should.equal('asteriskPath');
            args[0].should.equal('dd/ee/ff.js');
        });
        it('Should match global "loadView" path correctly', function () {
            router.navigate('/aa/bb/p1/p2?r=1', false, true);
            current.should.equal('loadViewPath');
            args[0].should.equal('aa');
            args[1].should.equal('bb');
            args[2].should.equal('p1');
            args[3].should.equal('p2');
            var query = typeof(args[4]);
            query.should.equal('object');
        });
    });

    setTimeout(function () {
        router.navigate('/', false, true);
    }, 100);

});

seajs.use('test/cases/router');

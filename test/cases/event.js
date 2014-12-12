 
define('test/cases/event', function(require) {
    var $ = require('$'),
        evt = require('event'),
        clickElement = function (el) {
            var ev = document.createEvent("MouseEvent");
            ev.initMouseEvent(
                "click",
                  true /* bubble */, true /* cancelable */,
                  window, null,
                  0, 0, 0, 0, /* coordinates */
                  false, false, false, false, /* modifier keys */
                  0 /*left*/, null
            );
            el.dispatchEvent(ev);
        };

    describe('event', function () {
        describe('bindCommonEvent()', function () {
            var $pel = $('<div/>'),
                $el_0 = $('<div data-event="test_common_event1"/>'),
                $el_1 = $('<div data-event="test_common_event2"/>');

            $pel.append($el_0).append($el_1);
            $('body').append($pel);

            evt.bindCommonEvent($pel[0], 'click', {
                test_common_event1: function () {
                    this.innerHTML = 'hello';
                },
                test_common_event2: function () {
                    this.innerHTML = 'world';
                }
            });

            clickElement($el_0[0]); 
            clickElement($el_1[0]); 

            it('should execution method correctly', function(){
              ($el_0.html()).should.equal('hello');
              ($el_1.html()).should.equal('world');
              $pel.remove();
            })
        });

        describe('addCommonEvent()', function () {
            var $el_0 = $('<div data-event="test_common_event1"/>'),
                $el_1 = $('<div data-event="test_common_event2"/>');

            $('body').append($el_0).append($el_1);

            evt.addCommonEvent('click', {
                test_common_event1: function () {
                    this.innerHTML = 'hello';
                },
                test_common_event2: function () {
                    this.innerHTML = 'world';
                }
            });

            evt.addCommonEvent('click', {
                test_common_event1: function () {
                    this.innerHTML = 'xxxx';
                }
            });

            clickElement($el_0[0]); 
            clickElement($el_1[0]); 

            it('should execution method correctly and prevent duplication', function(){
              ($el_0.html()).should.equal('hello');
              ($el_1.html()).should.equal('world');
              $el_0.remove();
              $el_1.remove();
            })
        });
    });

});

seajs.use('test/cases/event');

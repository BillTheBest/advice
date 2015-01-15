console.log('describing tests');
define(['chai', 'advice'], function(chai, Advice, Backbone) {

    console.log('actually describing tests');

    var expect = chai.expect;
    chai.should();

    describe('advice', function () {

        describe('inherit mixin through extend', function () {
            var mixin = function mixin() {
            };
            var mixin2 = function mixin2() {
            };
            var A = Backbone.View.extend({});
            it('should have mixin function', function () {
                A.should.have.property('mixin');
            });
            A.mixin(mixin);
            var a = new A();
            window.a = a;
            var B = A.extend();
            B.mixin(mixin2);
            var b = new B();
            it('should have only mixin', function () {
                A.hasMixin(mixin).should.be.true;
                A.hasMixin(mixin2).should.be.false;
                a.hasMixin(mixin).should.be.true;
                a.hasMixin(mixin2).should.be.false;
            });
            it('should have both mixins', function () {
                B.hasMixin(mixin).should.be.true;
                B.hasMixin(mixin2).should.be.true;
                b.hasMixin(mixin).should.be.true;
                b.hasMixin(mixin2).should.be.true;
            });
        });

        describe('should be able to override mixin options', function () {
            var mixin = function (options) {
                this.clobber('initialize', function () {
                    this.id = options.id;
                });
            };

            var View1 = Backbone.View.extend().mixin(mixin, {id: 1}).mixin([], {id: 2});

            var view1 = new View1();

            it('should override on the same constructor', function () {
                view1.id.should.equal(2);
            });

            it('should not override only on tha applied constructor', function () {
                var View2 = View1.extend().mixin([], {id: 3});
                var view2 = new View2();
                view1.id.should.equal(2);
                //                view2.id.should.equal(3);
            });
        });
    });
});
var _ = require('lodash');
var Advice = require('../advice');

describe('advice', function () {

    var after = {
        getNumber: function () {
            return this.number *= 2;
        },
        returnBar: function () {
            return 'bar';
        }
    };

    var objMixin = {
        setDefaults: {
            number: 1
        },
        before: {
            getNumber: function () {
                return this.number += 1;
            }
        },
        mixin: after,
        test: {
            test: true
        }
    };

    var fnMixin = function (options) {
        var temp = _.clone(objMixin);
        temp.clobber = {
            clobber: options.clobber
        };
        return temp;
    };

    describe('#addMixin', function () {
        var A = function () {
        };
        Advice.addAdvice(A);
        it('should have properties added from the mixin', function () {
            A.should.have.property('addMixin').and.be.a('function');
            A.should.have.property('mixin').and.be.a('function');
            A.should.have.property('addToObj').and.be.a('function');
            A.should.have.property('setDefaults').and.be.a('function');
            A.should.have.property('findVal').and.be.a('function');
            A.should.have.property('clobber').and.be.a('function');
            A.should.have.property('hasMixin').and.be.a('function');
        });
    });

    describe('create new object', function () {
        var A = function () {
        };
        Advice.addAdvice(A);
        a = new A();
        it('should have hasMixin function', function () {
            A.should.have.property('hasMixin').and.be.a('function');
        });
    });

    describe('#around', function () {
        var A = function () {
        };
        A.prototype = {
            number: 1,
            getNumber: function () {
                return this.number;
            }
        };
        Advice.addAdvice(A);
        A.around('getNumber', function (orig) {
            return orig() + 1;
        });
        var a = new A();
        it('should multiply number is returned', function () {
            a.getNumber().should.equal(2);
        });
    });

    describe('#before', function () {
        var A = function () {
        };
        A.prototype = {
            number: 1,
            getNumber: function () {
                return this.number;
            }
        };
        Advice.addAdvice(A);
        A.before('getNumber', objMixin.before.getNumber);
        var a = new A();
        var number = a.getNumber();
        it('should be applied before the number is returned', function () {
            number.should.equal(2);
        });
    });

    describe('#after', function () {
        var A = function () {
        };
        A.prototype = {
            val: 'foo',
            getValue: function () {
                return this.val;
            }
        };
        Advice.addAdvice(A);
        A.after('getValue', after.returnBar);
        var a = new A();
        it('should return the value returned by the last function applied as an after', function () {
            a.getValue().should.equal('bar');
        });
    });

    describe('#mixin simple', function () {
        var A = function () {
        };
        A.prototype = {
            getNumber: function () {
                return this.number;
            }
        };
        Advice.addAdvice(A);
        A.mixin(objMixin);

        var a = new A();

        it('should apply the mixins from the object', function () {
            a.getNumber().should.equal(4);
            a.test.test.should.equal(true);
        });
    });

    describe('#mixin advanced', function () {
        var B = function () {
        };
        B.prototype = {
            number: 2,
            clobber: false,
            getNumber: function () {
                return this.number;
            }
        };
        Advice.addAdvice(B);
        B.mixin(fnMixin, {
            clobber: true
        });

        var b = new B();

        it('should respect the default and options passed in', function () {
            b.clobber.should.be.true;
            b.getNumber().should.equal(6);
        });
    });

    describe('#mixin more than once', function () {
        var A = function () {
        };
        A.prototype = {
            number: 1,
            getNumber: function () {
                return this.number;
            }
        };
        Advice.addAdvice(A);
        var mixin = function () {
            this.before('getNumber', function () {
                this.number += 1;
            });
        };
        A.mixin([mixin, mixin]).mixin(mixin);
        var a = new A();
        it('should only applied once', function () {
            a.getNumber().should.equal(2);
        });
    });

    describe('#hasMixin', function () {
        var mixin = function () {
        };
        var mixin2 = function () {
        };
        var A = function () {
        };
        Advice.addAdvice(A);
        A.mixin(mixin);
        var a = new A();
        it('should have mixin applied to constructor', function () {
            A.hasMixin(mixin).should.be.true;
            A.hasMixin(mixin2).should.be.false;
        });
        it('should have mixin applied to instance', function () {
            a.hasMixin(mixin).should.be.true;
            a.hasMixin(mixin2).should.be.false;
        });
    });
});
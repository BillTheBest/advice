// ==========================================
// Copyright 2015 Dataminr
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// work derived from https://github.com/twitter/flight/blob/master/lib/advice.js
// ==========================================


(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['underscore.mutation'], function(_) {
            root.Advice = factory(root, _);
            return root.Advice;
        });
    } else {
        root.Advice = factory(root, root._);
    }
}(this, function(root, _) {

    /**
     * adds mixins to an object
     */
    var mixInto = function(mixins, options) {
        // used to saved applied mixins
        this.mixedIn = _.clone(this.mixedIn) || [];
        if (!this.__super__
            || this.mixedOptions == this.__super__.constructor.mixedOptions) {
            this.mixedOptions = _.clone(this.mixedOptions) || {};
        }
        _.extend(this.mixedOptions, options);
        // if only one passed in make it an array
        if (!_.isArray(mixins))
            mixins = [mixins];

        // if an array then run each mixin and save to mixedIn array
        mixins = _(mixins).map(function(mixin) {
            if(!Boolean(mixin)) console.error('Missing mixin at ', this.prototype.className, this.prototype);
            if (!_.isFunction(mixin)) return mixin;
            if (!_.contains(this.mixedIn, mixin)) {
                this.mixedIn.push(mixin);
                if(mixin) return mixin.call(this, this.mixedOptions);
            }
        }, this);

        // if we have an object (can be returned by functions) - use them
        _(mixins).each(function(mixin) {

            if (!mixin) return;

            mixin = _.clone(mixin);

            // call the reserved keywords
            _([
                'mixin',
                'around',
                'after',
                'before',
                'clobber',
                'addToObj',
                'setDefaults'
            ]).each(function(key) {
                if (mixin[key]) {
                    if (key == 'mixin')
                        this[key](mixin[key], this.mixedOptions);
                    else
                        this[key](mixin[key]);
                    delete mixin[key];
                }
            }, this);

            // on the remaining keywords, guess how to add them in
            _.each(_.keys(mixin), function(key) {

                // if it's a function then put it after
                if (_.isFunction(mixin[key])) {
                    this.after(key, mixin[key]);

                    // if it's an object then add it to any existing one
                } else if (_.isObject(mixin[key]) && !_.isArray(mixin[key])) {
                    var obj = {};
                    obj[key] = mixin[key];
                    this.addToObj(obj);

                    //else change the value
                } else {
                    this.clobber(key, mixin[key]);
                }
            }, this);
        }, this);

        // chaining
        return this;
    };
    var addMixin = function(mixin, options) {
        mixin.call(this, options);
        return this;
    };
    var hasMixin = function(mixin) {
        var mixins = this.mixedIn || this.constructor.mixedIn;
        return _.contains(mixins, mixin);
    };
    var Advice = {
        // calls the wrapped function with base functions as first argument
        around: function(base, wrapped) {
            return function() {
                var args = [].slice.call(arguments, 0);
                return wrapped.apply(this, [_.bind(base, this)].concat(args));
            };
        },

        // will call the new function before the old one with same arguments
        before: function(base, before) {
            return Advice.around(base, function() {
                var args = [].slice.call(arguments, 0),
                    orig = args.shift(),
                    beforeFn;

                beforeFn = (typeof before == 'function') ? before : before.obj[before.fnName];
                beforeFn.apply(this, args);
                return (orig).apply(this, args);
            });
        },

        // will call the new function after the old one with same arguments
        after: function(base, after) {
            return Advice.around(base, function() {
                var args = [].slice.call(arguments, 0),
                    orig = args.shift(),
                    afterFn;

                // this is a separate statement for debugging purposes.
                var res = (orig.unbound || orig).apply(this, args);

                afterFn = (typeof after == 'function') ? after : after.obj[after.fnName];
                var result = afterFn.apply(this, args);
                return result;
            });
        },

        /**
         * if it exists then overwrite
         */
        clobber: function(base, key, value) {
            var extBase = base;
            if (typeof extBase == 'function')
                extBase = base.prototype;
            if (_.isString(key)) {
                var temp = key;
                key = {};
                key[temp] = value;
            }
            _.extend(extBase, key);
            return base;
        },

        /**
         * will add values to an existing object (good for 'events')
         */
        addToObj: function(base, obj) {
            var extBase = base;
            if (typeof extBase == 'function')
                extBase = base.prototype;
            _.each(obj, function(val, key) {
                extBase[key] = _.extendWith(_.clone(Advice.findVal(extBase, key)) || {}, val);
            });
            return base;
        },

        /**
         * will set only if doesn't exist
         */
        setDefaults: function(base, obj) {
            var extBase = base;
            if (typeof extBase == 'function')
                extBase = base.prototype;
            _.each(obj, function(val, key) {
                if (!Advice.findVal(extBase, key))
                    extBase[key] = val;
            });
            return base;
        },

        /**
         * find a value in a prototype chain
         */
        findVal: function(obj, name) {
            while (!obj[name] && obj.prototype)
                obj = obj.prototype;
            return obj[name];
        },

        /**
         * adds advice functions to an object
         */
        addAdvice: function(obj) {
            // adds before, after and around
            ['before', 'after', 'around'].forEach(function(m) {
                obj[m] = function(method, fn) {

                    // if an object is passed in then split that in to individual calls
                    if (typeof method == 'object') {
                        _.each(_.keys(method), function(key) {
                            this[m](key, method[key]);
                        }, this);
                        return this;
                    }

                    // functions should go on a prototype if a constructor passed in
                    var base = this;
                    if (typeof base == 'function')
                        base = this.prototype;

                    // find original function in the prototype chain
                    var orig = Advice.findVal(base, method);

                    // use an identity function if none found
                    if (typeof orig != 'function') {
                        if (m != 'around') {
                            base[method] = fn;
                            return this
                        }
                        orig = _.identity;
                    }
                    base[method] = Advice[m](orig, fn);

                    // chaining
                    return this;
                };
            });

            var callWithThis = function(fn) {
                return fn.apply(this, [this].concat(_.toArray(arguments).slice(1)));
            };

            // add in other functions
            obj.addMixin = addMixin;
            obj.mixin = mixInto;
            obj.hasMixin = obj.prototype.hasMixin = hasMixin;
            obj.addToObj = _.partial(callWithThis, Advice.addToObj);
            obj.setDefaults = _.partial(callWithThis, Advice.setDefaults);
            obj.findVal = _.partial(callWithThis, Advice.findVal);
            obj.clobber = _.partial(callWithThis, Advice.clobber);

        }
    };
    return Advice;

}));
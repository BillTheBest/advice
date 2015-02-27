/**
 * @version 0.2
 *
 * @fileOverview Based on the Advice functional mixin library by Angus Croll. Adds functional mixins to an object.
 * Advice offers a number of ways to modify methods and properties on an object.  It makes it possible to reuse code and compose together functionality to create an object behavior.
 * Copyright 2015 Dataminr
 * Licensed under The MIT License
 * http://opensource.org/licenses/MIT
 * work derived from https://github.com/twitter/flight/blob/master/lib/advice.js

 *
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash'], function(_) {
            root.Advice = factory(root, _);
            return root.Advice;
        });
    } else if (typeof exports !== 'undefined') {
        var _ = require('lodash');
        module.exports = factory(root, _);
    } else {
        root.Advice = factory(root, root._);
    }
}(this, function(root, _) {

    /**
     * #### mixin
     * This is the 'mixin' function available
     * on an object with advice added to it.
     * Takes a mixin or array of mixins and options
     * Adds the given mixins to the to
     * on the target object.
     * @param mixins {function|array} Mixins to be added
     * @param options {object} (Optional) Options to the mixins
     * @returns {function}
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
        /**
         * #### around
         * calls the wrapped function with base function as first argument
         * on the target object.
         * @param base {function} Base Function
         * @param wrapped {function} Wrapped function
         * @returns {function}
         */
        around: function(base, wrapped) {
            return function() {
                var args = [].slice.call(arguments, 0);
                return wrapped.apply(this, [_.bind(base, this)].concat(args));
            };
        },

        /**
         * #### before
         * will call the new function before the old one with same arguments
         * on the target object.
         * @param base {function} Base Function
         * @param before {function} Function to be called before base fn
         * @returns {function}
         */
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

        /**
         * #### after
         * will call the new function after the old one with same arguments
         * on the target object.
         * @param base {function} Base Function
         * @param after {function} Function to be called after base fn
         * @returns {function}
         */
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
         * #### clobber
         * Extend an object with a key-value pair or another object.
         * on the target object.
         * @param base {object|function} Base Object
         * @param key {string|object} Either key to extend or an object to extend with
         * @param value {object} (Optional) value to associate with key in base
         * @returns {object|function}
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
         * #### addToObj
         * will extend all key-values in a base object,
         * given another objects key-values (good for 'events')
         * on the target object.
         * @param base {object|function} Base Object
         * @param obj {object} Object used to extend key-values of base
         * @returns {object|function}
         */
        addToObj: function(base, obj) {
            var extBase = base;
            if (typeof extBase == 'function')
                extBase = base.prototype;
            _.each(obj, function(val, key) {
                extBase[key] = _.extend(_.clone(Advice.findVal(extBase, key)) || {}, val);
            });
            return base;
        },

        /**
         * #### setDefaults
         * Acts like a guarded extend. Will only set the given key-values
         * on the base if they don't already exist
         * @param base {object} Base Object
         * @param obj {object} Object used to set key-values on base
         * @returns {object}
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
         * #### findVal
         *  find a value in a prototype chain
         * @param obj {function} Object to look in
         * @param name {object} name of the property to look for
         * @returns {*}
         */
        findVal: function(obj, name) {
            while (!obj[name] && obj.prototype)
                obj = obj.prototype;
            return obj[name];
        },

        /**
         * #### addAdvice
         * adds advice functions to an object
         * @param obj {object} Object to add advice methods to
         * @returns {undefined}
         */
        addAdvice: function(obj) {
            var addApi = function() {
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
            addApi(obj);
            addApi(obj.prototype);
        }
    };
    return Advice;

}));
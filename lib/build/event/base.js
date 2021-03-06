/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:08
*/
/*
combined modules:
event/base
event/base/utils
event/base/object
event/base/observer
event/base/observable
*/
/**
 * @ignore
 * scalable event framework for kissy (refer Dom3 Events)
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base', [
    './base/utils',
    './base/object',
    './base/observer',
    './base/observable'
], function (S, require) {
    var Utils = require('./base/utils');
    var Object = require('./base/object');
    var Observer = require('./base/observer');
    var Observable = require('./base/observable');    /**
     * The event utility provides functions to add and remove event listeners.
     * @class KISSY.Event
     * @singleton
     */
    /**
     * The event utility provides functions to add and remove event listeners.
     * @class KISSY.Event
     * @singleton
     */
    return {
        Utils: Utils,
        Object: Object,
        Observer: Observer,
        Observable: Observable
    };
});    /*
 yiminghe@gmail.com: 2012-10-24
 - 重构，新架构，自定义事件，Dom 事件分离

 yiminghe@gmail.com: 2011-12-15
 - 重构，粒度更细，新的架构

 2011-11-24
 - 自定义事件和 dom 事件操作彻底分离
 - TODO: group event from Dom3 Events

 2011-06-07
 - refer : http://www.w3.org/TR/2001/WD-Dom-Level-3-Events-20010823/events.html
 - 重构
 - eventHandler 一个元素一个而不是一个元素一个事件一个，节省内存
 - 减少闭包使用，prevent ie 内存泄露？
 - 增加 fire ，模拟冒泡处理 dom 事件
 */
/**
 * @ignore
 * utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/utils', ['util'], function (S, require) {
    var splitAndRun, getGroupsRe;
    require('util');
    function getTypedGroups(type) {
        if (type.indexOf('.') < 0) {
            return [
                type,
                ''
            ];
        }
        var m = type.match(/([^.]+)?(\..+)?$/), t = m[1], ret = [t], gs = m[2];
        if (gs) {
            gs = gs.split('.').sort();
            ret.push(gs.join('.'));
        } else {
            ret.push('');
        }
        return ret;
    }
    return {
        splitAndRun: splitAndRun = function (type, fn) {
            if (S.isArray(type)) {
                S.each(type, fn);
                return;
            }
            type = S.trim(type);
            if (type.indexOf(' ') === -1) {
                fn(type);
            } else {
                S.each(type.split(/\s+/), fn);
            }
        },
        normalizeParam: function (type, fn, context) {
            var cfg = fn || {};
            if (typeof fn === 'function') {
                cfg = {
                    fn: fn,
                    context: context
                };
            } else {
                // copy
                cfg = S.merge(cfg);
            }
            var typedGroups = getTypedGroups(type);
            type = typedGroups[0];
            cfg.groups = typedGroups[1];
            cfg.type = type;
            return cfg;
        },
        batchForType: function (fn, num) {
            var args = S.makeArray(arguments), types = args[2 + num];    // in case null
                                                                         // S.isObject([]) === false
            // in case null
            // S.isObject([]) === false
            if (types && S.isObject(types)) {
                S.each(types, function (value, type) {
                    var args2 = [].concat(args);
                    args2.splice(0, 2);
                    args2[num] = type;
                    args2[num + 1] = value;
                    fn.apply(null, args2);
                });
            } else {
                splitAndRun(types, function (type) {
                    var args2 = [].concat(args);
                    args2.splice(0, 2);
                    args2[num] = type;
                    fn.apply(null, args2);
                });
            }
        },
        fillGroupsForEvent: function (type, eventData) {
            var typedGroups = getTypedGroups(type), _ksGroups = typedGroups[1];
            if (_ksGroups) {
                _ksGroups = getGroupsRe(_ksGroups);
                eventData._ksGroups = _ksGroups;
            }
            eventData.type = typedGroups[0];
        },
        getGroupsRe: getGroupsRe = function (groups) {
            return new RegExp(groups.split('.').join('.*\\.') + '(?:\\.|$)');
        }
    };
});

/**
 * @ignore
 * base event object for custom and dom event.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/object', [], function (S) {
    var returnFalse = function () {
            return false;
        }, returnTrue = function () {
            return true;
        }, undef;    /**
     * @class KISSY.Event.Object
     * @private
     * KISSY 's base event object for custom and dom event.
     */
    /**
     * @class KISSY.Event.Object
     * @private
     * KISSY 's base event object for custom and dom event.
     */
    function EventObject() {
        var self = this;
        self.timeStamp = S.now();    /**
         * target
         * @property target
         * @member KISSY.Event.Object
         */
        /**
         * target
         * @property target
         * @member KISSY.Event.Object
         */
        self.target = undef;    /**
         * currentTarget
         * @property currentTarget
         * @member KISSY.Event.Object
         */
        /**
         * currentTarget
         * @property currentTarget
         * @member KISSY.Event.Object
         */
        self.currentTarget = undef;    /**
         * current event type
         * @property type
         * @type {String}
         * @member KISSY.Event.Object
         */
    }
    /**
         * current event type
         * @property type
         * @type {String}
         * @member KISSY.Event.Object
         */
    EventObject.prototype = {
        constructor: EventObject,
        /**
         * Flag for preventDefault that is modified during fire event. if it is true, the default behavior for this event will be executed.
         * @method
         * @member KISSY.Event.Object
         */
        isDefaultPrevented: returnFalse,
        /**
         * Flag for stopPropagation that is modified during fire event. true means to stop propagation to bubble targets.
         * @method
         * @member KISSY.Event.Object
         */
        isPropagationStopped: returnFalse,
        /**
         * Flag for stopImmediatePropagation that is modified during fire event. true means to stop propagation to bubble targets and other listener.
         * @method
         * @member KISSY.Event.Object
         */
        isImmediatePropagationStopped: returnFalse,
        /**
         * Prevents the event's default behavior
         * @member KISSY.Event.Object
         */
        preventDefault: function () {
            this.isDefaultPrevented = returnTrue;
        },
        /**
         * Stops the propagation to the next bubble target
         * @member KISSY.Event.Object
         */
        stopPropagation: function () {
            this.isPropagationStopped = returnTrue;
        },
        /**
         * Stops the propagation to the next bubble target and
         * prevents any additional listeners from being executed
         * on the current target.
         * @member KISSY.Event.Object
         */
        stopImmediatePropagation: function () {
            var self = this;
            self.isImmediatePropagationStopped = returnTrue;    // fixed 1.2
                                                                // call stopPropagation implicitly
            // fixed 1.2
            // call stopPropagation implicitly
            self.stopPropagation();
        },
        /**
         * Stops the event propagation and prevents the default
         * event behavior.
         * @param  {Boolean} [immediate] if true additional listeners on the current target will not be executed
         * @member KISSY.Event.Object
         */
        halt: function (immediate) {
            var self = this;
            if (immediate) {
                self.stopImmediatePropagation();
            } else {
                self.stopPropagation();
            }
            self.preventDefault();
        }
    };
    return EventObject;
});
/**
 * @ignore
 * observer for event.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/observer', [], function (S) {
    var undef;    /**
     * KISSY 's base observer for handle user-specified function
     * @private
     * @class KISSY.Event.Observer
     * @param {Object} cfg
     */
    /**
     * KISSY 's base observer for handle user-specified function
     * @private
     * @class KISSY.Event.Observer
     * @param {Object} cfg
     */
    function Observer(cfg) {
        S.mix(this, cfg);    /**
         * context in which observer's fn runs
         * @cfg {Object} context
         */
                             /**
         * current observer's user-defined function
         * @cfg {Function} fn
         */
                             /**
         * whether un-observer current observer once after running observer's user-defined function
         * @cfg {Boolean} once
         */
                             /**
         * groups separated by '.' which current observer belongs
         * @cfg {String} groups
         */
    }
    /**
         * context in which observer's fn runs
         * @cfg {Object} context
         */
    /**
         * current observer's user-defined function
         * @cfg {Function} fn
         */
    /**
         * whether un-observer current observer once after running observer's user-defined function
         * @cfg {Boolean} once
         */
    /**
         * groups separated by '.' which current observer belongs
         * @cfg {String} groups
         */
    Observer.prototype = {
        constructor: Observer,
        /**
         * whether current observer equals s2
         * @param {KISSY.Event.Observer} s2 another observer
         * @return {Boolean}
         */
        equals: function (s2) {
            var self = this;
            return !!S.reduce(self.keys, function (v, k) {
                return v && self[k] === s2[k];
            }, 1);
        },
        /**
         * simple run current observer's user-defined function
         * @param {KISSY.Event.Object} event
         * @param {KISSY.Event.Observable} ce
         * @return {*} return value of current observer's user-defined function
         */
        simpleNotify: function (event, ce) {
            var ret, self = this;
            ret = self.fn.call(self.context || ce.currentTarget, event, self.data);
            if (self.once) {
                //noinspection JSUnresolvedFunction
                ce.removeObserver(self);
            }
            return ret;
        },
        /**
         * current observer's notification.
         * @protected
         * @param {KISSY.Event.Object} event
         * @param {KISSY.Event.Observable} ce
         */
        notifyInternal: function (event, ce) {
            var ret = this.simpleNotify(event, ce);    // return false 等价 preventDefault + stopPropagation
            // return false 等价 preventDefault + stopPropagation
            if (ret === false) {
                event.halt();
            }
            return ret;
        },
        /**
         * run current observer's user-defined function
         * @param event
         * @param ce
         */
        notify: function (event, ce) {
            var self = this, _ksGroups = event._ksGroups;    // handler's group does not match specified groups (at fire step)
            // handler's group does not match specified groups (at fire step)
            if (_ksGroups && (!self.groups || !self.groups.match(_ksGroups))) {
                return undef;
            }
            return self.notifyInternal(event, ce);
        }
    };
    return Observer;
});
/**
 * @ignore
 * base custom event mechanism for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/observable', [], function (S) {
    /**
     * base custom event for registering and un-registering observer for specified event.
     * @class KISSY.Event.Observable
     * @private
     * @param {Object} cfg custom event's attribute
     */
    function Observable(cfg) {
        var self = this;
        self.currentTarget = null;
        S.mix(self, cfg);
        self.reset();    /**
         * current event type
         * @cfg {String} type
         */
    }
    /**
         * current event type
         * @cfg {String} type
         */
    Observable.prototype = {
        constructor: Observable,
        /**
         * whether current event has observers
         * @return {Boolean}
         */
        hasObserver: function () {
            return !!this.observers.length;
        },
        /**
         * reset current event's status
         */
        reset: function () {
            var self = this;
            self.observers = [];
        },
        /**
         * remove one observer from current event's observers
         * @param {KISSY.Event.Observer} observer
         */
        removeObserver: function (observer) {
            var self = this, i, observers = self.observers, len = observers.length;
            for (i = 0; i < len; i++) {
                if (observers[i] === observer) {
                    observers.splice(i, 1);
                    break;
                }
            }
            self.checkMemory();
        },
        /**
         * check memory after detach
         * @private
         */
        checkMemory: function () {
        },
        /**
         * Search for a specified observer within current event's observers
         * @param {KISSY.Event.Observer} observer
         * @return {Number} observer's index in observers
         */
        findObserver: function (observer) {
            var observers = this.observers, i;
            for (i = observers.length - 1; i >= 0; --i) {
                /*
                 If multiple identical EventListeners are registered on the same EventTarget
                 with the same parameters the duplicate instances are discarded.
                 They do not cause the EventListener to be called twice
                 and since they are discarded
                 they do not need to be removed with the removeEventListener method.
                 */
                if (observer.equals(observers[i])) {
                    return i;
                }
            }
            return -1;
        }
    };
    return Observable;
});

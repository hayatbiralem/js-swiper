(function(global){
    var JSSwiper = function(el, options){
        this.el = el;
        this.options = options || {};
        this.first = null;
        this.last = null;
        this.moved = 0;
        this.precision = 50;
        this.events = {
            swipeLeft: null,
            swipeRight: null,
            tap: null
        };
        this.type = 'none';

        if(this.options.vertical) {
            this.events.swipeUp = null;
            this.events.swipeDown = null;
        }

        this.bindEvents();
    };

    JSSwiper.prototype.bindEvents = function(){
        var _this = this;
        this.el.addEventListener('touchstart', function(event) {
            _this.first = event.touches[0] || false;
        }, false);

        this.el.addEventListener('touchmove', function(event) {
            _this.moved++;
        }, false);

        this.el.addEventListener('touchend', function(event) {
            _this.last = event.changedTouches[0] || false;
            if(!_this.first || !_this.last) {
                _this.reset();
                return;
            }
            if(_this.moved > 0) {
                if(_this.last.clientX - _this.first.clientX < -_this.precision) {
                    _this.type = 'swipeLeft';
                } else if(_this.last.clientX - _this.first.clientX > _this.precision) {
                    _this.type = 'swipeRight';
                } else if(_this.last.clientY - _this.first.clientY < -_this.precision) {
                    _this.type = 'swipeUp';
                } else if(_this.last.clientY - _this.first.clientY > _this.precision) {
                    _this.type = 'swipeDown';
                } else {
                    _this.type = 'tap';
                }
            } else {
                _this.type = 'tap';
            }

            if(_this.type in _this.events) {
                event.preventDefault();
                _this.callback(_this.type);
            }

            _this.reset();
        }, false);

    };

    JSSwiper.prototype.reset = function(){
        this.moved = 0;
        this.first = null;
        this.last = null;
    };

    JSSwiper.prototype.callback = function (eventName) {
        var eventKey = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
        if(typeof this.options[eventKey] === 'function') {
            this.options[eventKey].call(this);
        }

        var event = this.getCustomEvent(eventName);
        if(event) this.el.dispatchEvent(event);
    };

    JSSwiper.prototype.setCustomEvent = function (eventName) {
        this.events[eventName] = new CustomEvent(eventName, {
            detail: {
                jsSwiper: this
            },
            bubbles: true,
            cancelable: true
        });
    };

    JSSwiper.prototype.getCustomEvent = function (eventName) {
        // if(eventName in this.events) {
        if(eventName in this.events && this.events[eventName]) {
            this.events[eventName].detail.jsSwiper = this
        } else {
            this.setCustomEvent(eventName);
        }

        return this.events[eventName];
    };

    // Pollyfill for CustomEvent() Constructor - thanks to Internet Explorer
    // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Polyfill
    var CustomEvent = function (event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    };
    CustomEvent.prototype = global.CustomEvent ? global.CustomEvent.prototype : {};
    global.CustomEvent = CustomEvent;

    global.JSSwiper = JSSwiper;
})(this);
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var xtend = require('xtend');

module.exports = function(timeout) {
    return new Idle({ timeout: timeout });
};

// default settings
var defaults = {
    //start as soon as timer is set up
    start: true,
    // timer is enabled
    enabled: true,
    // amount of time before timer fires
    timeout: 30000,
    // what element to attach to
    element: document,
    // activity is one of these events
    events: 'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove'
};

var Idle = function(opt) {
    var self = this;

    self.opt = xtend(defaults, opt);
    self.element = self.opt.element;

    self.state = {
        idle: self.opt.idle,
        timeout: self.opt.timeout,
        enabled: self.opt.enabled,
        idle_fn: [],
        active_fn: []
    };

    // wrapper to pass state to toggleState
    self.state.state_fn = function() {
        toggleState(self.state);
    };

    if (self.opt.start) {
        self.start();
    }
};

var proto = Idle.prototype;

proto.start = function() {
    var self = this;
    var state = self.state;
    var element = self.element;

    function handler(ev) {
        // clear any current timouet
        clearTimeout(state.timer_id);

        if (!state.enabled) {
            return;
        }

        if (state.idle) {
            toggleState(state);
        }

        state.timer_id = setTimeout(state.state_fn, state.timeout);
    }

    // to remove later
    state.handler = handler;

    var events = this.opt.events.split(' ');
    for (var i=0 ; i<events.length ; ++i) {
        var event = events[i];
        attach(element, event, handler);
    }

    state.timer_id = setTimeout(self.state.state_fn, state.timeout);
};

// 'idle' | 'active'
proto.on = function(what, fn) {

    var self = this;
    var state = self.state;

    if (what === 'idle') {
        state.idle_fn.push(fn);
    }
    else {
        state.active_fn.push(fn);
    }
};

proto.getElapsed = function() {
    return ( +new Date() ) - this.state.olddate;
};

// Stops the idle timer. This removes appropriate event handlers
// and cancels any pending timeouts.
proto.stop = function() {
    var self = this;
    var state = this.state;
    var element = self.element;

    state.enabled = false;

    //clear any pending timeouts
    clearTimeout(state.timer_id);

    // detach handlers
    var events = this.opt.events.split(' ');
    for (var i=0 ; i<events.length ; ++i) {
        var event = events[i];
        detach(element, event, state.handler);
    }
};

/// private api

// Toggles the idle state and fires an appropriate event.
// borrowed from jquery-idletimer (see readme for link)
function toggleState(state) {
    // toggle the state
    state.idle = !state.idle;

    // reset timeout
    var elapsed = ( +new Date() ) - state.olddate;
    state.olddate = +new Date();

    // handle Chrome always triggering idle after js alert or comfirm popup
    if (state.idle && (elapsed < state.timeout)) {
        state.idle = false;
        clearTimeout(state.timer_id);
        if (state.enabled) {
            state.timer_id = setTimeout(state.state_fn, state.timeout);
        }
        return;
    }

    // fire event
    var event = state.idle ? 'idle' : 'active';

    var fns = (event === 'idle') ? state.idle_fn : state.active_fn;
    for (var i=0 ; i<fns.length ; ++i) {
        fns[i]();
    }
}

// TODO (shtylman) detect at startup to avoid if during runtime?
var attach = function(element, event, fn) {
    if (element.addEventListener) {
        element.addEventListener(event, fn, false);
    }
    else if (element.attachEvent) {
        element.attachEvent('on' + event, fn);
    }
};

var detach = function(element, event, fn) {
    if (element.removeEventListener) {
        element.removeEventListener(event, fn, false);
    }
    else if (element.detachEvent) {
        element.detachEvent('on' + event, fn);
    }
};


},{"xtend":2}],2:[function(require,module,exports){
var Keys = Object.keys || objectKeys

module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        if (!isObject(source)) {
            continue
        }

        var keys = Keys(source)

        for (var j = 0; j < keys.length; j++) {
            var name = keys[j]
            target[name] = source[name]
        }
    }

    return target
}

function objectKeys(obj) {
    var keys = []
    for (var k in obj) {
        keys.push(k)
    }
    return keys
}

function isObject(obj) {
    return obj !== null && typeof obj === "object"
}

},{}],3:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
var global = require('global')

/**
 * `requestAnimationFrame()`
 */

var request = global.requestAnimationFrame
  || global.webkitRequestAnimationFrame
  || global.mozRequestAnimationFrame
  || fallback

var prev = +new Date
function fallback (fn) {
  var curr = +new Date
  var ms = Math.max(0, 16 - (curr - prev))
  var req = setTimeout(fn, ms)
  return prev = curr, req
}

/**
 * `cancelAnimationFrame()`
 */

var cancel = global.cancelAnimationFrame
  || global.webkitCancelAnimationFrame
  || global.mozCancelAnimationFrame
  || clearTimeout

if (Function.prototype.bind) {
  request = request.bind(global)
  cancel = cancel.bind(global)
}

exports = module.exports = request
exports.cancel = cancel

},{"global":3}],5:[function(require,module,exports){
var raf = require('rafl')

function scroll (prop, element, to, options, callback) {
  var start = +new Date
  var from = element[prop]
  var cancelled = false

  var ease = inOutSine
  var duration = 350

  if (typeof options === 'function') {
    callback = options
  }
  else {
    options = options || {}
    ease = options.ease || ease
    duration = options.duration || duration
    callback = callback || function () {}
  }

  if (from === to) {
    return callback(
      new Error('Element already at target scroll position'),
      element[prop]
    )
  }

  function cancel () {
    cancelled = true
  }

  function animate (timestamp) {
    if (cancelled) {
      return callback(
        new Error('Scroll cancelled'),
        element[prop]
      )
    }

    var now = +new Date
    var time = Math.min(1, ((now - start) / duration))
    var eased = ease(time)

    element[prop] = (eased * (to - from)) + from

    time < 1 ?
      raf(animate) :
      callback(null, element[prop])
  }

  raf(animate)

  return cancel
}

function inOutSine (n) {
  return .5 * (1 - Math.cos(Math.PI * n));
}

module.exports = {
  top: function (element, to, options, callback) {
    return scroll('scrollTop', element, to, options, callback)
  },
  left: function (element, to, options, callback) {
    return scroll('scrollLeft', element, to, options, callback)
  }
}

},{"rafl":4}],6:[function(require,module,exports){
'use strict';

var _Utils = require('./core/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _monitor = require('./user/monitor');

var _monitor2 = _interopRequireDefault(_monitor);

var _video = require('./video/video');

var _video2 = _interopRequireDefault(_video);

var _view = require('./view/view');

var _view2 = _interopRequireDefault(_view);

var _switch = require('./switch/switch');

var _switch2 = _interopRequireDefault(_switch);

var _menu = require('./menu/menu');

var _menu2 = _interopRequireDefault(_menu);

var _href = require('./href/href');

var _href2 = _interopRequireDefault(_href);

var _proceed = require('./proceed/proceed');

var _proceed2 = _interopRequireDefault(_proceed);

var _text = require('./text/text');

var _text2 = _interopRequireDefault(_text);

var _meta = require('./text/meta');

var _meta2 = _interopRequireDefault(_meta);

var _mail = require('./mail/mail');

var _mail2 = _interopRequireDefault(_mail);

var _fullscreen = require('./controls/fullscreen');

var _fullscreen2 = _interopRequireDefault(_fullscreen);

var _open = require('./controls/open');

var _open2 = _interopRequireDefault(_open);

var _play = require('./controls/play');

var _play2 = _interopRequireDefault(_play);

var _sound = require('./controls/sound');

var _sound2 = _interopRequireDefault(_sound);

var _social = require('./controls/social');

var _social2 = _interopRequireDefault(_social);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var selectors = {
    "body": _meta2.default,
    "#main": _video2.default,
    "menu": _menu2.default,
    ".switch": _switch2.default,
    ".subscribe-form": _mail2.default,

    "[data-view]": _view2.default,
    "[data-href]": _href2.default,
    "[data-text]": _text2.default,
    "[data-play]": _play2.default,
    "[data-open]": _open2.default,
    "[data-sound]": _sound2.default,
    "[data-social]": _social2.default,
    "[data-proceed]": _proceed2.default,
    "[data-fullscreen]": _fullscreen2.default
};

//Small components


function bootstrap() {
    _Utils2.default.polyfill();

    if (_Utils2.default.ios()) document.body.classList.add('is-ios');

    for (var selector in selectors) {
        if (document.querySelector(selector)) {
            var elements = document.querySelectorAll(selector);

            for (var i = 0; i < elements.length; i++) {
                try {
                    new selectors[selector](elements[i]);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', bootstrap, false);

},{"./controls/fullscreen":9,"./controls/open":10,"./controls/play":11,"./controls/social":12,"./controls/sound":13,"./core/Utils":15,"./href/href":17,"./mail/mail":19,"./menu/menu":20,"./proceed/proceed":21,"./switch/switch":22,"./text/meta":23,"./text/text":24,"./user/monitor":26,"./video/video":30,"./view/view":31}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Utils = require('../core/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

var _browser = require('../utils/browser');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sound = createjs.Sound;
var Tween = createjs.Tween;
var Ease = createjs.Ease;

var CARDINAUX = ["NORTH", "EAST", "WEST", "SOUTH"];
var DIFF_LIMIT = .3;

var SoundManager = function () {
    function SoundManager() {
        var _this = this;

        _classCallCheck(this, SoundManager);

        this.volume = .8;
        this.firstLoad = true;
        this.loadIndex = 0;

        this.sounds = {
            manifest: [{ id: "NORTH", src: "http://cdn.lescardinaux.com/audio/north_direct.mp3" }, { id: "EAST", src: "http://cdn.lescardinaux.com/audio/east_direct.mp3" }, { id: "WEST", src: "http://cdn.lescardinaux.com/audio/west_direct.mp3" }, { id: "SOUTH", src: "http://cdn.lescardinaux.com/audio/south_direct.mp3" }, { id: "NORTH_BACK", src: "http://cdn.lescardinaux.com/audio/north_music.mp3" }, { id: "EAST_BACK", src: "http://cdn.lescardinaux.com/audio/east_music.mp3" }, { id: "WEST_BACK", src: "http://cdn.lescardinaux.com/audio/west_music.mp3" }, { id: "SOUTH_BACK", src: "http://cdn.lescardinaux.com/audio/south_music.mp3" }]
        };

        if (_Utils2.default.ios() || _Utils2.default.mobile()) {
            this.sounds = {
                manifest: [{ id: "NORTH", src: "http://cdn.lescardinaux.com/audio/mobile/north_direct.mp3" }, { id: "EAST", src: "http://cdn.lescardinaux.com/audio/mobile/east_direct.mp3" }, { id: "WEST", src: "http://cdn.lescardinaux.com/audio/mobile/west_direct.mp3" }, { id: "SOUTH", src: "http://cdn.lescardinaux.com/audio/mobile/south_direct.mp3" }]
            };
        }

        this.instances = [];

        Sound.volume = 1;

        //prepare the array of instances
        CARDINAUX.forEach(function (item, index) {
            return _this.instances[index] = [];
        });

        _Dispatcher2.default.on("sound:volume", this.handleVolumeChange.bind(this));
        _Dispatcher2.default.on("sound:mute", this.muteAll.bind(this));
        _Dispatcher2.default.on("sound:unmute", this.unmuteAll.bind(this));
    }

    _createClass(SoundManager, [{
        key: 'preload',
        value: function preload() {
            var _this2 = this;

            // PREPARE ELEMENTS
            return new Promise(function (resolve, reject) {
                if (_Utils2.default.safari()) {
                    setTimeout(function () {
                        _this2.preloadAll(resolve, reject);
                    }, 1500);
                } else {
                    _this2.preloadAll(resolve, reject);
                }
            });
        }
    }, {
        key: 'preloadAll',
        value: function preloadAll(resolve, reject) {
            var _this3 = this;

            this.startTime = new Date().getTime();

            var queue = new createjs.LoadQueue();
            queue.installPlugin(Sound);

            if (_Utils2.default.ios() || _Utils2.default.mobile()) queue.setMaxConnections(1);else queue.setMaxConnections(4);

            queue.on("fileload", function (target) {
                _this3.loadIndex++;
                _Dispatcher2.default.emit("sound:decoded", { progress: _this3.loadIndex / _this3.sounds.manifest.length });

                if (!_this3.firstLoad) return;

                _this3.endTime = new Date().getTime();
                _this3.timeToLoad = _this3.endTime - _this3.startTime;

                _Dispatcher2.default.emit("sound:baseVolume", _this3.volume);

                console.log("first audio file loadTime : " + _this3.timeToLoad / 1000);

                _this3.firstLoad = false;
            });

            queue.on("progress", function (data) {
                _Dispatcher2.default.emit("sound:progress", { progress: data.progress });
            });

            setTimeout(function () {
                _Dispatcher2.default.emit("speed", queue.progress);
            }, 500);

            queue.on("complete", resolve);
            queue.on("error", reject);

            queue.loadManifest(this.sounds.manifest);
        }
    }, {
        key: 'start',
        value: function start() {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                _this4.sounds.manifest.map(function (element) {
                    var instance = Sound.play(element.id);

                    instance.volume = _this4.volume; //Default volume

                    CARDINAUX.forEach(function (CARDINAL, index) {
                        if (element.id.indexOf(CARDINAL) === 0) {
                            _this4.instances[index].push(instance);
                        }
                    });
                });

                return resolve();
            });
        }
    }, {
        key: 'handleVolumeChange',
        value: function handleVolumeChange(data) {
            var _this5 = this;

            var activeVideo = localStorage.getItem("video:active");

            this.volume = data.volume;

            this.instances.forEach(function (audioTracks, index) {
                if (activeVideo && CARDINAUX.indexOf(activeVideo) === index) {
                    audioTracks.forEach(function (audioTrack) {
                        Tween.get(audioTrack).to({ volume: _this5.volume }, 100, Ease.linear);
                    });
                } else if (!activeVideo) {
                    audioTracks.forEach(function (audioTrack) {
                        Tween.get(audioTrack).to({ volume: _this5.volume }, 100, Ease.linear);
                    });
                }
            });
        }
    }, {
        key: 'mute',
        value: function mute(audioTracks) {
            if (!isNaN(audioTracks)) audioTracks = this.instances[audioTracks];

            this.alternateFade(audioTracks, true);
        }
    }, {
        key: 'muteAll',
        value: function muteAll() {
            var _this6 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            if (options && options.force) this.stayMute = true;

            this.instances.forEach(function (audioTracks, idx) {
                _this6.mute(audioTracks);
            });
        }
    }, {
        key: 'muteBackground',
        value: function muteBackground() {
            var _this7 = this;

            this.instances.forEach(function (audioTracks) {
                _this7.mute(audioTracks.filter(function (item) {
                    return ~item.src.indexOf("zic") || ~item.src.indexOf("music");
                }));
            });
        }
    }, {
        key: 'unmute',
        value: function unmute(audioTracks) {
            if (this.stayMute) return;

            if (!isNaN(audioTracks)) audioTracks = this.instances[audioTracks];

            var activeVideo = localStorage.getItem("video:active");

            //No other sounds on zoom mode
            if (activeVideo) {
                audioTracks = audioTracks.filter(function (item) {
                    return ~item.src.indexOf(activeVideo.toLowerCase());
                });
            }

            //No background on split screen
            if (!activeVideo && this.isOut && !this.inIntro) {
                audioTracks = audioTracks.filter(function (item) {
                    return item.src.indexOf("music") === -1;
                });
            }

            this.alternateFade(audioTracks, false);
        }
    }, {
        key: 'unmuteAll',
        value: function unmuteAll(options) {
            var _this8 = this;

            if (options && options.force) delete this.stayMute;

            if (this.stayMute) return;

            var activeVideo = localStorage.getItem("video:active");

            this.instances.forEach(function (audioTracks, index) {
                if (!activeVideo || activeVideo && CARDINAUX.indexOf(activeVideo) === index || _this8.canMute == false) {
                    _this8.unmute(audioTracks);
                }
            });
        }
    }, {
        key: 'pause',
        value: function pause(audioTracks) {
            if (!isNaN(audioTracks)) audioTracks = this.instances[audioTracks];

            audioTracks.forEach(function (audioTrack) {
                audioTrack.paused = true;
            });
        }
    }, {
        key: 'pauseAll',
        value: function pauseAll() {
            var _this9 = this;

            this.instances.forEach(function (audioTracks, idx) {
                _this9.pause(audioTracks);
            });
        }
    }, {
        key: 'resume',
        value: function resume(audioTracks, time) {
            if (!isNaN(audioTracks)) audioTracks = this.instances[audioTracks];

            audioTracks.forEach(function (audioTrack) {
                audioTrack.paused = false;
            });
        }
    }, {
        key: 'resumeAll',
        value: function resumeAll() {
            var _this10 = this;

            this.instances.forEach(function (audioTracks, idx) {
                _this10.resume(audioTracks);
            });
        }
    }, {
        key: 'play',
        value: function play(audioTracks) {
            var _this11 = this;

            if (!isNaN(audioTracks)) audioTracks = this.instances[audioTracks];

            audioTracks.forEach(function (audioTrack) {
                audioTrack.play({
                    volume: _this11.volume
                });
            });
        }
    }, {
        key: 'playAll',
        value: function playAll() {
            var _this12 = this;

            this.instances.forEach(function (audioTracks, idx) {
                _this12.play(audioTracks);
            });
        }
    }, {
        key: 'alternateFade',
        value: function alternateFade(audioTracks, pause) {
            var _this13 = this;

            // if(!audioTracks) return;

            if (!pause) {
                audioTracks.forEach(function (audioTrack) {
                    if (Tween.hasActiveTweens(audioTrack)) Tween.removeTweens(audioTrack);

                    Tween.get(audioTrack).to({ volume: _this13.volume }, 300, Ease.linear);
                });
            } else {
                audioTracks.forEach(function (audioTrack) {
                    if (Tween.hasActiveTweens(audioTrack)) Tween.removeTweens(audioTrack);

                    Tween.get(audioTrack).to({ volume: 0 }, 300, Ease.linear);
                });
            }
        }
    }, {
        key: 'currentTime',
        value: function currentTime(time) {
            if (time != undefined && time != null) {
                this.instances.forEach(function (audioTracks) {
                    audioTracks.forEach(function (audioTrack) {
                        audioTrack.position = time * 1000;
                    });
                });
            } else {
                return this.instances[0][0].position / 1000;
            }
        }
    }, {
        key: 'duration',
        value: function duration() {
            return this.instances[0][0].duration / 1000;
        }
    }, {
        key: 'sync',
        value: function sync(time) {
            var _this14 = this;

            var diff = this.currentTime() - time;

            if (_Utils2.default.safari() && !_browser.IS_MOBILE) return;

            if (diff < -DIFF_LIMIT || diff > DIFF_LIMIT) {
                this.instances.forEach(function (audioTracks) {
                    audioTracks.forEach(function (audioTrack) {
                        Tween.get(audioTrack).to({ volume: 0 }, 150, Ease.linear);
                    });
                });

                this.currentTime(time);

                if (this.timer) clearTimeout(this.timer);

                this.timer = setTimeout(function () {
                    _this14.unmuteAll();
                }, 500);
            }
        }
    }, {
        key: 'getState',
        value: function getState() {
            return this.instances.map(function (audioTracks, idx) {
                var res = {
                    name: CARDINAUX[idx]
                };

                audioTracks.forEach(function (audioTrack) {
                    if (~audioTrack.src.indexOf("zic") || ~audioTrack.src.indexOf("music")) res["music"] = audioTrack.volume;else res["voice"] = audioTrack.volume;
                });

                return res;
            });
        }
    }]);

    return SoundManager;
}();

exports.default = SoundManager;

},{"../core/Dispatcher":14,"../core/Utils":15,"../utils/browser":27}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dispatcher = require("../core/Dispatcher");

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

var _Utils = require("../core/Utils");

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CREDITS_TIME = 126;

var Controls = function () {
    function Controls(video) {
        _classCallCheck(this, Controls);

        this.video = video;

        this.element = document.querySelector('#controls');
        this.timeWrapper = this.element.querySelector('.action-time');
        this.timePassed = this.element.querySelector('.time-passed');
        this.timePreload = this.element.querySelector('.time-preload');
        this.timeRemaining = this.element.querySelector('.time-remaining');
        this.timeTotal = this.element.querySelector('.time-total');

        this.lastPercent = 0;

        this.chapters = [].concat(_toConsumableArray(this.element.querySelectorAll('.item-chapter')));

        this.attachEvents();
    }

    _createClass(Controls, [{
        key: "attachEvents",
        value: function attachEvents() {
            document.addEventListener('mousemove', this.handleOver.bind(this), false);

            this.video.element.addEventListener('loadeddata', this.dataLoaded.bind(this), false);
            this.video.element.addEventListener('timeupdate', this.clockUpdate.bind(this), false);
            this.video.element.addEventListener('progress', this.handleProgress.bind(this), false);

            this.timeWrapper.addEventListener('mousedown', this.downHandle.bind(this), false);
            this.timeWrapper.addEventListener('mousemove', this.moveHandle.bind(this), false);
            this.timeWrapper.addEventListener('mouseup', this.upHandle.bind(this), false);

            this.timeWrapper.addEventListener('touchstart', this.downHandle.bind(this), false);
            this.timeWrapper.addEventListener('touchmove', this.moveHandle.bind(this), false);
            this.timeWrapper.addEventListener('touchend', this.upHandle.bind(this), false);

            if (_Utils2.default.mobile()) {
                this.element.addEventListener('click', this.handleMobileOver.bind(this), false);
                this.element.addEventListener('mouseout', this.handleMobileOut.bind(this), false);
            }

            _Dispatcher2.default.on("video:start", this.startHandle.bind(this));
        }
    }, {
        key: "handleOver",
        value: function handleOver(event) {
            var height = document.documentElement.clientHeight;
            var y = event.pageY;

            var percent = y / height;

            if (percent >= .8) {
                this.element.classList.add('is-hover');
            } else if (percent < .8) {
                this.element.classList.remove('is-hover');
            }
        }
    }, {
        key: "handleMobileOver",
        value: function handleMobileOver() {
            setTimeout(function () {
                window.isOpen = true;
            }, 100);
        }
    }, {
        key: "handleMobileOut",
        value: function handleMobileOut(event) {
            var target = document.elementFromPoint(event.pageX, event.pageY);

            if (!this.element.contains(target) && target !== this.element) {
                window.isOpen = false;
            }
        }

        //only for tracking with GA

    }, {
        key: "handleProgress",
        value: function handleProgress() {
            if (!window.ga) return;

            var percent = 100 * (this.video.element.currentTime / (this.video.element.duration - CREDITS_TIME));

            if (isNaN(percent)) return;

            var closerPercent = Math.floor(percent / 10) * 10;

            if (closerPercent >= this.lastPercent + 10) {
                ga('send', 'event', 'video', 'progression lecture', closerPercent + "%");

                this.lastPercent = closerPercent;
            }
        }
    }, {
        key: "startHandle",
        value: function startHandle() {
            var _this = this;

            //If already hovered
            //if(getComputedStyle(this.element).getPropertyValue("opacity") == "1") return;

            this.element.classList.add('quick-show');
            window.isOpen = true;

            setTimeout(function () {
                _this.element.classList.remove('quick-show');
                window.isOpen = false;
            }, 4000);
        }
    }, {
        key: "dataLoaded",
        value: function dataLoaded() {
            this.timeTotal.innerHTML = this.formatTime(this.video.element.duration - CREDITS_TIME);
        }
    }, {
        key: "clockUpdate",
        value: function clockUpdate() {
            var _this2 = this;

            var per = this.video.element.currentTime / (this.video.element.duration - CREDITS_TIME);

            this.timeRemaining.innerHTML = this.formatTime(this.video.element.currentTime);

            this.chapters.forEach(function (chapter) {
                if (_this2.video.element.currentTime >= chapter.timecode) chapter.classList.add('is-passed');else chapter.classList.remove('is-passed');
            });

            this.render(per);
        }
    }, {
        key: "moveHandle",
        value: function moveHandle(event) {
            if (!this.isDown) return;

            requestAnimationFrame(move.bind(this));

            function move() {
                var width = this.timeWrapper.getBoundingClientRect().width;

                var x = (event.type === "touchmove" && event.touches[0] ? event.touches[0].screenX : event.pageX) - 15;
                var per = x / width;

                if (event.type === "touchmove") this.previousX = x;

                this.render(per);
            }
        }
    }, {
        key: "downHandle",
        value: function downHandle() {
            if (_Utils2.default.mobile() && !window.isOpen) return;

            this.isDown = true;
        }
    }, {
        key: "upHandle",
        value: function upHandle(event) {
            var _this3 = this;

            if (_Utils2.default.mobile() && !window.isOpen) return;

            var x = (event.type === "touchend" && this.previousX ? this.previousX : event.pageX) - 15;
            var width = this.timeWrapper.getBoundingClientRect().width;
            var per = x / width;
            var time = (this.video.element.duration - CREDITS_TIME) * per;

            if (!this.isMoving) {
                this.video.currentTime(time, { fromUser: true }).then(function () {
                    _this3.render(per);
                }).catch(function () {
                    _this3.render(0);
                });
            } else {
                this.video.soundManager.resumeAll();
            }

            this.isMoving = false;
            this.isDown = false;

            delete this.previousX;
        }

        //update view

    }, {
        key: "render",
        value: function render(per) {
            this.timePassed.style.width = per * 100 + "%";
        }
    }, {
        key: "formatTime",
        value: function formatTime(time) {
            var hours = Math.floor(time / 3600);
            var minutes = Math.floor((time - hours * 3600) / 60);
            var seconds = Math.floor(time - hours * 3600 - minutes * 60);

            if (minutes < 10) minutes = "0" + minutes;
            if (seconds < 10) seconds = "0" + seconds;

            return minutes + ":" + seconds;
        }
    }]);

    return Controls;
}();

exports.default = Controls;

},{"../core/Dispatcher":14,"../core/Utils":15}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by baest on 04/09/2016.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _Utils = require('../core/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FullScreen = function () {
    function FullScreen(element) {
        _classCallCheck(this, FullScreen);

        this.element = element;
        this.isFullScreen = false;

        this.attachEvents();
    }

    _createClass(FullScreen, [{
        key: 'attachEvents',
        value: function attachEvents() {
            this.element.addEventListener('click', this.toggleFullScreen.bind(this), false);
        }
    }, {
        key: 'toggleFullScreen',
        value: function toggleFullScreen() {
            if (!this.isFullScreen && !document.fullscreenElement && // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                // current working methods
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen(); // IE
                } else if (_Utils2.default.ios()) {
                    window.scrollTo(0, 1);
                }

                document.body.classList.add('is-fullscreen');

                if (_Utils2.default.safari() && !_Utils2.default.ios()) {
                    setTimeout(function () {
                        document.body.style.height = window.innerHeight + 'px';
                    }, 50);
                }

                this.isFullScreen = true;
            } else {
                if (document.cancelFullScreen) {
                    document.cancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.documentElement.msExitFullscreen) {
                    document.documentElement.msExitFullscreen(); // IE
                } else if (_Utils2.default.ie()) {
                    document.msExitFullscreen();
                }

                document.body.classList.remove('is-fullscreen');

                if (_Utils2.default.safari() && !_Utils2.default.ios()) {
                    setTimeout(function () {
                        document.body.removeAttribute('style');
                    }, 50);
                }

                this.isFullScreen = false;
            }
        }
    }]);

    return FullScreen;
}();

exports.default = FullScreen;

},{"../core/Utils":15}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Open = function () {
    function Open(element) {
        _classCallCheck(this, Open);

        this.element = element;
        this.selector = element.getAttribute('data-open');
        this.target = document.querySelector(this.selector);

        this.attachEvents();
    }

    _createClass(Open, [{
        key: 'attachEvents',
        value: function attachEvents() {
            this.element.addEventListener('click', this.openHandle.bind(this), false);
        }
    }, {
        key: 'openHandle',
        value: function openHandle() {
            this.target.classList.toggle('is-active');

            if (this.selector == 'menu') {
                _Dispatcher2.default.emit("video:do:pause");
            }
        }
    }]);

    return Open;
}();

exports.default = Open;

},{"../core/Dispatcher":14}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by baest on 04/09/2016.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _Dispatcher = require("../core/Dispatcher");

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

var _Utils = require("../core/Utils");

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Play = function () {
    function Play(element) {
        _classCallCheck(this, Play);

        this.element = element;

        this.attachEvents();
    }

    _createClass(Play, [{
        key: "attachEvents",
        value: function attachEvents() {
            this.element.addEventListener('click', this.toggle.bind(this), false);

            _Dispatcher2.default.on("video:play", this.playHandle.bind(this));
            _Dispatcher2.default.on("video:pause", this.pauseHandle.bind(this));
        }
    }, {
        key: "toggle",
        value: function toggle() {
            if (_Utils2.default.mobile() && !window.isOpen) return;

            _Dispatcher2.default.emit("video:toggle");
        }
    }, {
        key: "playHandle",
        value: function playHandle() {
            this.element.classList.remove('is-paused');
        }
    }, {
        key: "pauseHandle",
        value: function pauseHandle() {
            this.element.classList.add('is-paused');
        }
    }]);

    return Play;
}();

exports.default = Play;

},{"../core/Dispatcher":14,"../core/Utils":15}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

var _Utils = require('../core/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Social = function () {
    function Social(element) {
        _classCallCheck(this, Social);

        this.element = element;
        this.type = element.getAttribute('data-social');
        this.url = '';

        this.lang = localStorage.getItem('input:language') || 'fr';
        this.dictionary = null;
        this.options = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600';

        var pathname = window.location.pathname;

        if (pathname && (~pathname.indexOf('/fr') || ~pathname.indexOf('/en') || ~pathname.indexOf('/jp'))) {
            var langExtractor = /\/(en|fr|jp)/g.exec(pathname);
            this.lang = langExtractor[1] ? langExtractor[1] : ~navigator.language.indexOf("-") ? navigator.language.match(/^([a-z]+)-/)[1] : navigator.language;
        } else {
            if (~navigator.language.indexOf("-")) {
                var _langExtractor = navigator.language.match(/^([a-z]+)-/);

                this.lang = _langExtractor[1];
            } else {
                this.lang = navigator.language;
            }
        }

        this.attachEvents();
    }

    _createClass(Social, [{
        key: 'attachEvents',
        value: function attachEvents() {
            this.element.addEventListener('click', this.handleClick.bind(this), false);

            _Dispatcher2.default.on('dictionary', this.handleDictionary.bind(this));
            _Dispatcher2.default.on('input:language', this.handleLangChange.bind(this));
        }
    }, {
        key: 'handleClick',
        value: function handleClick() {
            console.log(this.url);

            window.open(this.url, '', this.options);
        }
    }, {
        key: 'handleLangChange',
        value: function handleLangChange(res) {
            this.lang = res.value;

            this.update();
        }
    }, {
        key: 'handleDictionary',
        value: function handleDictionary(dic) {
            var _this = this;

            if (this.dictionary) return;

            dic.forEach(function (item) {
                if (item.viewName == "social") {
                    _this.dictionary = item.translations;
                }
            });

            this.update();
        }
    }, {
        key: 'update',
        value: function update() {
            var _this2 = this;

            if (!this.lang || !this.dictionary) return;

            var text = void 0;

            if (_Utils2.default.ie() !== false) {
                this.dictionary.forEach(function (item) {
                    if (item.language === _this2.lang) {
                        text = item.texts[_this2.type];
                    }
                });
            } else {
                text = this.dictionary.find(function (item) {
                    return item.language == _this2.lang;
                }).texts[this.type];
            }

            text = encodeURI(text.trim());

            if (this.type == 'twitter') {
                this.url = 'https://twitter.com/intent/tweet?text=' + text + ';source=webclient';
            } else if (this.type == 'facebook') {
                this.url = 'https://www.facebook.com/sharer.php?u=' + window.location.href;
            }
        }
    }]);

    return Social;
}();

exports.default = Social;

},{"../core/Dispatcher":14,"../core/Utils":15}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

/**
 * Created by baest on 04/09/2016.
 */


var _Utils = require("../core/Utils");

var _Utils2 = _interopRequireDefault(_Utils);

var _Dispatcher = require("../core/Dispatcher");

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CARDINAUX = ["NORTH", "EAST", "WEST", "SOUTH"];

var SoundController = function () {
    function SoundController(element) {
        _classCallCheck(this, SoundController);

        this.element = element;
        this.icon = element.querySelector('.sound-icon');
        this.control = element.querySelector('.sound-control');
        this.controller = element.querySelector('.sound-controller');

        this.iconSizes = this.icon.getBoundingClientRect();

        this.sizes = this.control.getBoundingClientRect();
        this.width = this.sizes.width;
        this.mute = false;

        this.attachEvents();
    }

    _createClass(SoundController, [{
        key: "attachEvents",
        value: function attachEvents() {
            this.icon.addEventListener('click', this.toggleSound.bind(this), false);
            this.element.addEventListener('mousedown', this.downHandle.bind(this), false);
            this.element.addEventListener('mousemove', this.moveHandle.bind(this), false);
            this.element.addEventListener('mouseup', this.upHandle.bind(this), false);

            _Dispatcher2.default.on("sound:baseVolume", this.render.bind(this));
        }
    }, {
        key: "toggleSound",
        value: function toggleSound() {
            //Mute sound
            if (!this.mute) {
                _Dispatcher2.default.emit("sound:mute", { force: true });
                this.icon.classList.add('is-mute');
            }
            //Un-mute sound
            else {
                    _Dispatcher2.default.emit("sound:unmute", { force: true });
                    this.icon.classList.remove('is-mute');
                }

            this.mute = !this.mute;
        }
    }, {
        key: "downHandle",
        value: function downHandle() {
            if (_Utils2.default.mobile() && !window.isOpen) return;

            this.isDown = true;
        }
    }, {
        key: "moveHandle",
        value: function moveHandle(event) {
            if (!this.isDown || event.target && event.target.classList.contains('sound-icon')) return;

            var x = (event.type == "touchmove" && event.touches[0] ? event.touches[0].screenX : event.pageX) - this.sizes.left;
            var volume = x / this.width;

            if (volume > 1) volume = 1;
            if (volume < 0) volume = 0;

            this.render(volume);
        }
    }, {
        key: "upHandle",
        value: function upHandle(event) {
            if (event.target && event.target.classList.contains('sound-icon')) return;

            var x = (event.type == "touchmove" && event.touches[0] ? event.touches[0].screenX : event.pageX) - this.sizes.left;
            var volume = x / this.width;

            if (volume > 1) volume = 1;
            if (volume < 0) volume = 0;

            _Dispatcher2.default.emit('sound:volume', { volume: volume });

            this.render(volume);

            this.isDown = false;
        }
    }, {
        key: "render",
        value: function render(volume) {
            if (volume == 0) this.icon.classList.add('is-mute');else this.icon.classList.remove('is-mute');

            this.controller.style.width = 100 * volume + "%";
        }
    }]);

    return SoundController;
}();

exports.default = SoundController;

},{"../core/Dispatcher":14,"../core/Utils":15}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _eventEmitter = require("../core/eventEmitter");

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Dispatcher = function (_EventEmitter) {
    _inherits(Dispatcher, _EventEmitter);

    function Dispatcher() {
        _classCallCheck(this, Dispatcher);

        return _possibleConstructorReturn(this, (Dispatcher.__proto__ || Object.getPrototypeOf(Dispatcher)).call(this));
    }

    return Dispatcher;
}(_eventEmitter2.default);

exports.default = new Dispatcher();

},{"../core/eventEmitter":16}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Utils;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Utils = (_Utils = {

    ie: function ie() {
        var ua = window.navigator.userAgent;

        // IE 10
        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

        // IE 11
        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

        // Edge 12 (Spartan)
        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

        // Edge 13
        // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    },

    capitalizeFirstLetter: function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    ios: function ios() {
        if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
            // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
            var versionString = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);

            if (versionString === null) {
                versionString = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
            }

            var vExtract = [parseInt(versionString[1], 10), parseInt(versionString[2], 10), parseInt(versionString[3] || 0, 10)];

            return parseInt(vExtract[0], 10);
        }

        return false;
    }

}, _defineProperty(_Utils, 'ie', function ie() {
    var ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}), _defineProperty(_Utils, 'mobile', function mobile() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}), _defineProperty(_Utils, 'safari', function safari() {
    return navigator.userAgent.toLowerCase().indexOf('safari') != -1 && navigator.userAgent.toLowerCase().indexOf('chrome') == -1;
}), _defineProperty(_Utils, 'polyfill', function polyfill() {
    if (!Object.keys) {
        Object.keys = function (obj) {
            var keys = [];

            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    keys.push(i);
                }
            }

            return keys;
        };
    }
}), _Utils);

exports.default = Utils;

},{}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = function () {
    function EventEmitter() {
        _classCallCheck(this, EventEmitter);
    }

    _createClass(EventEmitter, [{
        key: "on",


        //Basic listener
        value: function on(name, callback, context) {
            if (!this.events) this.events = {};

            if (!this.events[name]) this.events[name] = [];

            this.events[name].push({
                callback: callback,
                context: context
            });

            //exec previous events set before handler added
            if (this.emitBeforeSetEvents && this.emitBeforeSetEvents[name] && this.emitBeforeSetEvents[name].length != 0) {
                this.emitBeforeSetEvents[name].forEach(function (beforeEventData) {
                    callback(beforeEventData);
                });
            }
        }

        //Basic trigger

    }, {
        key: "emit",
        value: function emit(name, data) {
            var _this = this;

            if (!this.events) return;

            if (!this.events[name]) {
                if (!this.emitBeforeSetEvents) this.emitBeforeSetEvents = {};
                if (!this.emitBeforeSetEvents[name]) this.emitBeforeSetEvents[name] = [];

                this.emitBeforeSetEvents[name].push(data);

                return;
            }

            this.events[name].forEach(function (eventHandler, index) {
                if (eventHandler.context) eventHandler.callback(data).bind(eventHandler.context);else eventHandler.callback(data);

                //If the event can only be trigger once
                if (eventHandler.unique) {
                    _this.events[name].splice(index, 1);
                }
            });
        }

        //Remove the event listener

    }, {
        key: "off",
        value: function off(name, callback) {
            var _this2 = this;

            if (!this.events || !this.events[name]) return;

            //Case remove all
            if (!name && !callback) {
                this.events = {};
            } else if (!callback) {
                this.events[name] = [];
            } else {
                this.events[name].forEach(function (eventHandler, index) {
                    if (eventHandler.callback.toString() == callback.toString()) _this2.events[name].splice(index, 1);
                });
            }
        }

        //Can be trigger only once

    }, {
        key: "once",
        value: function once(name, callback, context) {
            if (!this.events) this.events = {};

            if (!this.events[name]) this.events[name] = [];

            this.events[name].push({
                callback: callback,
                context: context,
                unique: true
            });
        }

        //Listen for all of the instances of one object

    }], [{
        key: "listen",
        value: function listen(name, callback, context) {
            if (!this.broadcastEvents) this.broadcastEvents = {};

            if (!this.broadcastEvents[name]) this.broadcastEvents[name] = [];

            this.broadcastEvents[name].push({
                callback: callback,
                context: context
            });
        }

        //Listen for all of the instances of one object

    }, {
        key: "listenOnce",
        value: function listenOnce(name, callback, context) {
            if (!this.broadcastEvents) this.broadcastEvents = {};

            if (!this.broadcastEvents[name]) this.broadcastEvents[name] = [];

            this.broadcastEvents[name].push({
                callback: callback,
                context: context,
                unique: true
            });
        }

        //Trigger event for all of the instances of one object

    }, {
        key: "broadcast",
        value: function broadcast(name, data) {
            var _this3 = this;

            if (!this.broadcastEvents || !this.broadcastEvents[name]) {
                return;
            }

            this.broadcastEvents[name].forEach(function (eventHandler, index) {
                if (eventHandler.context) eventHandler.callback(data).bind(eventHandler.context);else eventHandler.callback(data);

                //If the event can only be trigger once
                if (eventHandler.unique) {
                    _this3.broadcastEvents[name].splice(index, 1);
                }
            });
        }
    }, {
        key: "unset",
        value: function unset(name, callback) {
            var _this4 = this;

            if (!this.broadcastEvents || !this.broadcastEvents[name]) return;

            //Case remove all
            if (!name && !callback) {
                this.broadcastEvents = {};
            } else if (!callback) {
                this.broadcastEvents[name] = [];
            } else {
                this.broadcastEvents[name].forEach(function (eventHandler, index) {
                    if (eventHandler.callback.toString() == callback.toString()) _this4.broadcastEvents[name].splice(index, 1);
                });
            }
        }
    }]);

    return EventEmitter;
}();

exports.default = EventEmitter;

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by baest on 05/09/2016.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Href = function () {
    function Href(element) {
        _classCallCheck(this, Href);

        this.element = element;
        this.href = element.getAttribute('data-href');

        this.attachEvents();
    }

    _createClass(Href, [{
        key: 'attachEvents',
        value: function attachEvents() {
            this.element.addEventListener('click', this.handleClick.bind(this), false);
        }
    }, {
        key: 'handleClick',
        value: function handleClick() {
            if (document.querySelector('menu').classList.contains('is-active')) document.querySelector('menu').classList.remove('is-active');

            _Dispatcher2.default.emit('view:change', { href: this.href });
        }
    }]);

    return Href;
}();

exports.default = Href;

},{"../core/Dispatcher":14}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Loader = function () {
    function Loader() {
        _classCallCheck(this, Loader);

        this.element = document.querySelector('.loader');
    }

    _createClass(Loader, [{
        key: 'hide',
        value: function hide() {
            this.element.classList.add('is-hidden');
        }
    }, {
        key: 'show',
        value: function show() {
            this.element.classList.remove('is-hidden');
        }
    }, {
        key: 'active',
        value: function active() {
            return !this.element.classList.contains('is-hidden');
        }
    }]);

    return Loader;
}();

exports.default = Loader;

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mail = function () {
    function Mail(element) {
        _classCallCheck(this, Mail);

        this.element = element;
        this.action = this.element.getAttribute('action');
        this.email = this.element.querySelector('[name="EMAIL"]');
        this.input = this.element.querySelector('[tabindex="-1"]');

        this.dictionary = null;

        this.messageSuccess = this.element.querySelector('#mce-response');

        this.attachEvents();
    }

    _createClass(Mail, [{
        key: 'attachEvents',
        value: function attachEvents() {
            this.element.addEventListener('submit', this.handleSubmit.bind(this), false);
            this.messageSuccess.addEventListener('click', this.messageClickHandle.bind(this), false);

            _Dispatcher2.default.on('dictionary', this.handleDictionary.bind(this));
        }
    }, {
        key: 'handleDictionary',
        value: function handleDictionary(dictionary) {
            var _this = this;

            if (this.dictionary) return;

            dictionary.forEach(function (item) {
                if (item.viewName === "mail") {
                    _this.dictionary = item.translations;
                }
            });
        }
    }, {
        key: 'translateResponse',
        value: function translateResponse(message, code) {
            if (!this.dictionary) return message;

            var baseIndex = code && code === "success" ? "0" : null;
            var actualTexts = this.dictionary.find(function (language) {
                return language.language === Mail.getLanguage();
            });
            var messageLang = "en";

            this.dictionary.forEach(function (language) {
                if (!baseIndex) {
                    for (var index in language.texts) {
                        if (message.includes(language.texts[index])) {
                            baseIndex = index;
                            messageLang = language.language;
                        }
                    }
                }
            });

            if (actualTexts && actualTexts.texts && actualTexts.texts[baseIndex]) {
                if (messageLang === "en" && Mail.getLanguage() === "en" && actualTexts.texts[baseIndex] !== message) {
                    return message;
                }

                return actualTexts.texts[baseIndex];
            } else {
                return message;
            }
        }
    }, {
        key: 'handleSubmit',
        value: function handleSubmit(event) {
            event.preventDefault();

            //bot detection
            if (this.input && this.input.value.length > 0) {
                return;
            }

            var self = this;

            $.ajax({
                type: "get",
                url: this.action,
                data: { "EMAIL": this.email.value, language: Mail.getLanguage() },
                cache: false,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                headers: {
                    'Accept-Language': Mail.getLanguage()
                },
                error: function error(err) {
                    console.error(err);
                },
                success: function success(res) {
                    self.messageSuccess.classList.add('is-active');
                    self.messageSuccess.innerHTML = self.translateResponse(res.msg, res.result);

                    if (self.messageSuccess.querySelector('a')) {
                        self.messageSuccess.querySelector('a').setAttribute('target', '_blank');
                    }
                }
            });
        }
    }, {
        key: 'messageClickHandle',
        value: function messageClickHandle(event) {
            if (this.messageSuccess.contains(event.target) && event.target.nodeName === "A") return;

            this.messageSuccess.classList.remove('is-active');
        }
    }], [{
        key: 'getLanguage',
        value: function getLanguage() {
            var pathname = window.location.pathname;

            if (pathname && (~pathname.indexOf('/fr') || ~pathname.indexOf('/en') || ~pathname.indexOf('/jp'))) {
                var langExtractor = /\/(en|fr|jp)/g.exec(pathname);
                var lang = langExtractor[1] ? langExtractor[1] : null;

                return lang || (~navigator.language.indexOf("-") ? navigator.language.match(/^([a-z]+)-/)[1] : navigator.language);
            }

            return ~navigator.language.indexOf("-") ? navigator.language.match(/^([a-z]+)-/)[1] : navigator.language;
        }
    }]);

    return Mail;
}();

exports.default = Mail;

},{"../core/Dispatcher":14}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Menu = function () {
    function Menu(element) {
        _classCallCheck(this, Menu);

        this.element = element;
        this.list = element.querySelector('.menu-list');
        this.attachEvents();
    }

    _createClass(Menu, [{
        key: 'attachEvents',
        value: function attachEvents() {
            this.element.addEventListener('click', this.clickHandle.bind(this), false);
        }
    }, {
        key: 'clickHandle',
        value: function clickHandle(event) {
            var target = event.target;

            if (this.list.contains(target) && !target.classList.contains('item-close') || target == this.list) return;

            this.element.classList.remove('is-active');

            _Dispatcher2.default.emit("video:do:play");
        }
    }]);

    return Menu;
}();

exports.default = Menu;

},{"../core/Dispatcher":14}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by baest on 05/09/2016.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Proceed = function () {
    function Proceed(element) {
        _classCallCheck(this, Proceed);

        this.element = element;
        this.timecode = this.getTimecode();
        this.isReplay = element.classList.contains('replay');

        this.attachEvents();
    }

    _createClass(Proceed, [{
        key: 'attachEvents',
        value: function attachEvents() {
            this.element.addEventListener('click', this.clickHandle.bind(this), false);
        }
    }, {
        key: 'clickHandle',
        value: function clickHandle() {
            if (this.isReplay) _Dispatcher2.default.emit("video:setTime", { time: this.timecode, replay: true });else _Dispatcher2.default.emit("video:setTime", { time: this.timecode });
        }
    }, {
        key: 'getTimecode',
        value: function getTimecode() {
            var explodedTimecode = /([0-9]{1,2}):([0-9]{1,2})/g.exec(this.element.getAttribute('data-proceed'));

            if (!explodedTimecode[1] || !explodedTimecode[2]) return;

            var _explodedTimecode = _slicedToArray(explodedTimecode, 3);

            var original = _explodedTimecode[0];
            var minutes = _explodedTimecode[1];
            var seconds = _explodedTimecode[2];


            minutes = parseInt(minutes, 10);
            seconds = parseInt(seconds, 10);

            var timecode = minutes * 60 + seconds;

            this.element.timecode = timecode;

            return timecode;
        }
    }]);

    return Proceed;
}();

exports.default = Proceed;

},{"../core/Dispatcher":14}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by baest on 04/09/2016.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Switch = function () {
    function Switch(element) {
        var _this = this;

        _classCallCheck(this, Switch);

        this.element = element;
        this.name = element.querySelector('input').name;
        this.inputs = [].concat(_toConsumableArray(element.querySelectorAll('[name="' + this.name + '"]')));
        this.labels = [].concat(_toConsumableArray(element.querySelectorAll('label')));

        this.attachEvents();

        if (localStorage.getItem('input:' + this.name)) {
            this.setState(localStorage.getItem('input:' + this.name));
        }

        //External set state
        this.inputs.forEach(function (input) {
            input.setState = _this.setState.bind(_this);
        });
    }

    _createClass(Switch, [{
        key: 'attachEvents',
        value: function attachEvents() {
            var _this2 = this;

            this.inputs.forEach(function (input) {
                input.addEventListener('change', _this2.handleInput.bind(_this2), false);
            });
        }
    }, {
        key: 'setState',
        value: function setState(value) {
            var _this3 = this;

            this.inputs.forEach(function (input) {
                if (input.value == value) {
                    input.checked = true;
                    _this3.handleInput({ target: input, fromSave: true });
                }
            });
        }
    }, {
        key: 'handleInput',
        value: function handleInput(event) {
            var input = event.target;
            var value = input.value;

            this.labels.forEach(function (label) {
                if (label.getAttribute('for') == input.id) {
                    label.classList.add('is-active');
                } else {
                    label.classList.remove('is-active');
                }
            });

            if (!input.hasAttributes('data-prevent')) localStorage.setItem('input:' + this.name, value);

            //change url for the subtitles
            if (this.name === "language" && !event.fromSave && location.pathname != '/' + value) {
                history.pushState(value, null, '/' + value);

                document.querySelector('html').setAttribute('lang', value);

                if (window.ga) {
                    ga('send', 'pageview', '/' + value);
                }
            }

            var data = { value: value };

            if (event.fromSave) data.fromSave = true;

            _Dispatcher2.default.emit('input:' + this.name, data);
        }
    }]);

    return Switch;
}();

exports.default = Switch;

},{"../core/Dispatcher":14}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

var _Utils = require('../core/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Meta = function () {
    function Meta() {
        _classCallCheck(this, Meta);

        this.lang = localStorage.getItem('input:language') || 'fr';
        this.dictionary = null;

        var pathname = window.location.pathname;

        if (pathname && (~pathname.indexOf('/fr') || ~pathname.indexOf('/en') || ~pathname.indexOf('/jp'))) {
            var langExtractor = /\/(en|fr|jp)/g.exec(pathname);
            this.lang = langExtractor[1] ? langExtractor[1] : ~navigator.language.indexOf("-") ? navigator.language.match(/^([a-z]+)-/)[1] : navigator.language;
        } else {
            if (~navigator.language.indexOf("-")) {
                var _langExtractor = navigator.language.match(/^([a-z]+)-/);

                this.lang = _langExtractor[1];
            } else {
                this.lang = navigator.language;
            }
        }

        this.attachEvents();
    }

    _createClass(Meta, [{
        key: 'attachEvents',
        value: function attachEvents() {
            _Dispatcher2.default.on('dictionary', this.handleDictionary.bind(this));
            _Dispatcher2.default.on('input:language', this.handleLangChange.bind(this));
        }
    }, {
        key: 'handleLangChange',
        value: function handleLangChange(res) {
            this.lang = res.value;

            this.update();
        }
    }, {
        key: 'handleDictionary',
        value: function handleDictionary(dic) {
            var _this = this;

            if (this.dictionary) return;

            dic.forEach(function (item) {
                if (item.viewName == "metas") {
                    _this.dictionary = item.translations;
                }
            });

            this.update();
        }
    }, {
        key: 'update',
        value: function update() {
            var _this2 = this;

            if (!this.lang || !this.dictionary) return;

            if (_Utils2.default.ie() !== false) {
                this.dictionary.forEach(function (item) {
                    if (item.language === _this2.lang) {
                        _this2.title = item.texts.title;
                        _this2.description = item.texts.description;
                    }
                });
            } else {
                this.title = this.dictionary.find(function (item) {
                    return item.language === _this2.lang;
                }).texts.title;
                this.description = this.dictionary.find(function (item) {
                    return item.language === _this2.lang;
                }).texts.description;
            }

            if (this.title != document.title) {
                document.title = this.title;
                document.querySelector('meta[property="og:title"]').setAttribute('content', this.title);
                document.querySelector('meta[name="twitter:title"]').setAttribute('content', this.title);
            }

            if (document.querySelector('meta[name="description"]').getAttribute('content') != this.description) {
                document.querySelector('meta[name="description"]').setAttribute('content', this.description);
                document.querySelector('meta[name="twitter:description"]').setAttribute('content', this.description);
            }

            document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
        }
    }]);

    return Meta;
}();

exports.default = Meta;

},{"../core/Dispatcher":14,"../core/Utils":15}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dictionary = null;
var loadingDictionary = false;

var language = void 0;

var textsHandler = [];

var Text = function () {
    function Text(element) {
        _classCallCheck(this, Text);

        this.element = element;
        this.original = element.innerHTML.trim();
        this.translations = {};

        if (dictionary === null && loadingDictionary === false) {
            loadingDictionary = true;

            fetch('/assets/data/dictionary.json', {
                credentials: "include"
            }).then(function (res) {
                return res.json();
            }).then(function (res) {
                dictionary = res;

                _Dispatcher2.default.emit('dictionary', dictionary);

                textsHandler.forEach(function (callback) {
                    callback();
                });
            });
        }

        var extractData = /^(.*):([a-z0-9]+)$/.exec(this.element.getAttribute('data-text'));

        if (extractData && extractData[1] != undefined && extractData[2] != undefined) {
            this.viewName = extractData[1];
            this.index = extractData[2];
        } else {
            this.viewName = this.element.getAttribute('data-text');
        }

        textsHandler.push(this.handleDictionary.bind(this));

        _Dispatcher2.default.on("input:language", this.handleLanguageChange.bind(this));
    }

    /**
     * Use to get the different translations of the original
     */


    _createClass(Text, [{
        key: 'handleDictionary',
        value: function handleDictionary() {
            var _this = this;

            dictionary.forEach(function (dictionaryItem) {
                if (!dictionaryItem.viewName || dictionaryItem.viewName !== _this.viewName) return;

                dictionaryItem.translations.forEach(function (translation) {
                    if (!_this.index) {
                        _this.translations[translation.language] = translation.texts[_this.original];
                    } else {
                        _this.translations[translation.language] = translation.texts[_this.index];
                    }
                });
            });

            this.handleLanguageChange({ value: language });
        }
    }, {
        key: 'handleLanguageChange',
        value: function handleLanguageChange(data) {
            var lang = data.value;

            if (!this.translations[lang]) {
                this.element.innerHTML = this.original;
                return;
            }

            this.element.innerHTML = this.translations[lang];
        }
    }], [{
        key: 'getLanguage',
        value: function getLanguage() {
            var pathname = window.location.pathname;

            if (pathname && (~pathname.indexOf('/fr') || ~pathname.indexOf('/en') || ~pathname.indexOf('/jp'))) {
                var langExtractor = /\/(en|fr|jp)/g.exec(pathname);
                var lang = langExtractor[1] ? langExtractor[1] : null;

                return lang || (~navigator.language.indexOf("-") ? navigator.language.match(/^([a-z]+)-/)[1] : navigator.language);
            }

            return ~navigator.language.indexOf("-") ? navigator.language.match(/^([a-z]+)-/)[1] : navigator.language;
        }
    }]);

    return Text;
}();

language = Text.getLanguage();

exports.default = Text;

},{"../core/Dispatcher":14}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TracksGroup = [];

var Track = function () {
    function Track(video, language, dir, subtitles) {
        _classCallCheck(this, Track);

        this.video = video;
        this.subs = [];
        this.language = language;
        this.captionContainer = document.querySelector('.square[data-cardinal="' + dir + '"] .caption');

        var pathname = window.location.pathname;
        var lang = void 0;

        if (pathname && (~pathname.indexOf('/fr') || ~pathname.indexOf('/en') || ~pathname.indexOf('/jp'))) {
            var langExtractor = /\/(en|fr|jp)/g.exec(pathname);
            lang = langExtractor[1] ? langExtractor[1] : null;

            if (!lang) {
                this.isActive = language == navigator.language;
                return;
            }

            this.isActive = language == lang;
        } else {
            if (~navigator.language.indexOf("-")) {
                var _langExtractor = navigator.language.match(/^([a-z]+)-/);

                this.isActive = language == _langExtractor[1];
            } else {
                this.isActive = language == navigator.language;
            }
        }

        for (var i = 0; i < subtitles.length; i++) {
            if (!subtitles[i].payload) return;

            this.subs[i] = {
                index: i,
                text: subtitles[i].payload.length > 1 ? subtitles[i].payload.join("<br>") : subtitles[i].payload[0],
                start: subtitles[i].startTime,
                end: subtitles[i].endTime
            };
        }

        this.activeSubs = {};

        this.attachEvents();
    }

    _createClass(Track, [{
        key: 'attachEvents',
        value: function attachEvents() {
            if (this.isActive) {
                this.updateEvent = this.update.bind(this);
                this.video.addEventListener('timeupdate', this.updateEvent, false);
            }

            _Dispatcher2.default.on("input:subtitles", this.toggleSubtitles.bind(this));
            _Dispatcher2.default.on("input:language", this.changeSubtitlesLanguage.bind(this));
        }
    }, {
        key: 'update',
        value: function update() {
            //Get the captions
            for (var i = 0; i < this.subs.length; i++) {
                if (this.video.currentTime >= this.subs[i].start && this.video.currentTime < this.subs[i].end) {
                    this.activeSubs[i] = this.subs[i];
                } else if (this.video.currentTime >= this.subs[i].end && this.activeSubs[i]) {
                    delete this.activeSubs[i];
                }
            }

            //draw them
            var keys = Object.keys(this.activeSubs);
            var mainKey = keys[0];

            if (this.activeSubs[mainKey] && this.activeSubs[mainKey].text) this.captionContainer.innerHTML = this.activeSubs[mainKey].text;

            if (keys.length == 0) this.captionContainer.innerHTML = "";
        }
    }, {
        key: 'toggleSubtitles',
        value: function toggleSubtitles(data) {
            if (data.value == "off") this.captionContainer.classList.add('sub-off');else this.captionContainer.classList.remove('sub-off');
        }
    }, {
        key: 'changeSubtitlesLanguage',
        value: function changeSubtitlesLanguage(data) {
            if (!this.isActive && data.value == this.language) {
                this.isActive = true;
                this.updateEvent = this.update.bind(this);

                this.video.addEventListener('timeupdate', this.updateEvent, false);
            } else if (this.isActive && data.value != this.language) {
                this.video.removeEventListener('timeupdate', this.updateEvent);

                this.isActive = false;
                this.updateEvent = null;
                this.captionContainer.innerHTML = "";
            }
        }
    }], [{
        key: 'loadTracks',
        value: function loadTracks(video) {
            var preload = new createjs.LoadQueue(true);

            preload.on("fileload", function (res) {
                for (var key in res.result.items) {
                    TracksGroup.push(new Track(video, res.result.lang, key, res.result.items[key]));
                }
            });

            preload.loadFile("/assets/subtitles/francais.json");
            preload.loadFile("/assets/subtitles/anglais.json");
            preload.loadFile("/assets/subtitles/japonais.json");
        }
    }, {
        key: 'clear',
        value: function clear() {
            TracksGroup.forEach(function (track) {
                track.activeSubs = {};
                track.captionContainer.innerHTML = '';
            });
        }
    }]);

    return Track;
}();

exports.default = Track;

},{"../core/Dispatcher":14}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _away = require('away');

var _away2 = _interopRequireDefault(_away);

var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Monitor = function () {
    function Monitor() {
        _classCallCheck(this, Monitor);

        this.hasStart = false;
        this.timer = (0, _away2.default)(4 * 1000);

        this.attachEvent();
    }

    _createClass(Monitor, [{
        key: 'attachEvent',
        value: function attachEvent() {
            this.timer.on('idle', this.handleIdle.bind(this));
            this.timer.on('active', this.handleActive.bind(this));

            _Dispatcher2.default.on("video:start", this.handleVideo.bind(this));
        }
    }, {
        key: 'handleIdle',
        value: function handleIdle() {
            if (!this.hasStart) return;

            if (document.querySelector('menu').classList.contains('is-active')) return;
            if (~document.body.className.indexOf('on-view--')) return;

            document.body.classList.add('is-idle');

            _Dispatcher2.default.emit('user:idle');
        }
    }, {
        key: 'handleActive',
        value: function handleActive() {
            if (!this.hasStart) return;

            document.body.classList.remove('is-idle');

            _Dispatcher2.default.emit('user:active');
        }
    }, {
        key: 'handleVideo',
        value: function handleVideo() {
            this.hasStart = true;
        }
    }]);

    return Monitor;
}();

exports.default = new Monitor();

},{"../core/Dispatcher":14,"away":1}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function IE() {
    var ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

function IOS() {
    if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
        // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
        var versionString = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);

        if (versionString === null) {
            versionString = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
        }

        var vExtract = [parseInt(versionString[1], 10), parseInt(versionString[2], 10), parseInt(versionString[3] || 0, 10)];

        return parseInt(vExtract[0], 10);
    }

    return false;
}

var IS_FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

var IS_CHROME = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

var IS_SAFARI = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

var IS_WEBKIT = IS_CHROME || IS_SAFARI;

var IS_IPAD = /iPad/i.test(navigator.userAgent) || /iPhone OS 3_1_2/i.test(navigator.userAgent) || /iPhone OS 3_2_2/i.test(navigator.userAgent);

var IS_MOBILE = function IS_MOBILE() {
    return window.matchMedia("(max-width: 768px)").matches;
};

var IS_DESKTOP = function IS_DESKTOP() {
    return window.matchMedia("(min-width: 1280px)").matches;
};

var IS_SMALL = function IS_SMALL() {
    return window.matchMedia("(max-width: 400px)").matches;
};

var IS_TABLET = function IS_TABLET() {
    return window.matchMedia("(max-width: 980px)").matches;
};

var IS_PORTRAIT = function IS_PORTRAIT() {
    return window.matchMedia("(max-width: 768px) and (orientation: portrait)").matches;
};

var IS_LANDSCAPE = function IS_LANDSCAPE() {
    return window.matchMedia("(max-width: 768px) and (orientation: landscape)").matches;
};

var HAS_SMALL_HEIGHT = function HAS_SMALL_HEIGHT() {
    return window.matchMedia("(max-height: 600px)").matches;
};

exports.IE = IE;
exports.IOS = IOS;
exports.IS_FIREFOX = IS_FIREFOX;
exports.IS_CHROME = IS_CHROME;
exports.IS_SAFARI = IS_SAFARI;
exports.IS_WEBKIT = IS_WEBKIT;
exports.IS_IPAD = IS_IPAD;
exports.IS_MOBILE = IS_MOBILE;
exports.IS_TABLET = IS_TABLET;
exports.IS_PORTRAIT = IS_PORTRAIT;
exports.IS_LANDSCAPE = IS_LANDSCAPE;
exports.IS_SMALL = IS_SMALL;
exports.IS_DESKTOP = IS_DESKTOP;
exports.HAS_SMALL_HEIGHT = HAS_SMALL_HEIGHT;

},{}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.bufferedPercent = bufferedPercent;

var _timeRanges = require('./time-ranges.js');

/**
 * Compute how much your video has been buffered
 *
 * @param  {Object} Buffered object
 * @param  {Number} Total duration
 * @return {Number} Percent buffered of the total duration
 * @private
 * @function bufferedPercent
 */
function bufferedPercent(buffered, duration) {
    var bufferedDuration = 0;
    var start = void 0;
    var end = void 0;

    if (!duration) {
        return 0;
    }

    if (!buffered || !buffered.length) {
        buffered = (0, _timeRanges.createTimeRange)(0, 0);
    }

    for (var i = 0; i < buffered.length; i++) {
        start = buffered.start(i);
        end = buffered.end(i);

        // buffered end can be bigger than duration by a very small fraction
        if (end > duration) {
            end = duration;
        }

        bufferedDuration += end - start;
    }

    return bufferedDuration / duration;
}

},{"./time-ranges.js":29}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createTimeRanges = createTimeRanges;
function rangeCheck(fnName, index, maxIndex) {
    if (index < 0 || index > maxIndex) {
        throw new Error('Failed to execute \'' + fnName + '\' on \'TimeRanges\': The index provided (' + index + ') is greater than or equal to the maximum bound (' + maxIndex + ').');
    }
}

function getRange(fnName, valueIndex, ranges, rangeIndex) {
    if (rangeIndex === undefined) {
        console.warn('DEPRECATED: Function \'' + fnName + '\' on \'TimeRanges\' called without an index argument.');
        rangeIndex = 0;
    }
    rangeCheck(fnName, rangeIndex, ranges.length - 1);
    return ranges[rangeIndex][valueIndex];
}

function createTimeRangesObj(ranges) {
    if (ranges === undefined || ranges.length === 0) {
        return {
            length: 0,
            start: function start() {
                throw new Error('This TimeRanges object is empty');
            },
            end: function end() {
                throw new Error('This TimeRanges object is empty');
            }
        };
    }
    return {
        length: ranges.length,
        start: getRange.bind(null, 'start', 0, ranges),
        end: getRange.bind(null, 'end', 1, ranges)
    };
}

function createTimeRanges(start, end) {
    if (Array.isArray(start)) {
        return createTimeRangesObj(start);
    } else if (start === undefined || end === undefined) {
        return createTimeRangesObj();
    }
    return createTimeRangesObj([[start, end]]);
}

exports.createTimeRange = createTimeRanges;

},{}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SoundManger = require('../audio/SoundManger');

var _SoundManger2 = _interopRequireDefault(_SoundManger);

var _track = require('../track/track');

var _track2 = _interopRequireDefault(_track);

var _controls = require('../controls/controls');

var _controls2 = _interopRequireDefault(_controls);

var _loader = require('../loader/loader');

var _loader2 = _interopRequireDefault(_loader);

var _Dispatcher = require('../core/Dispatcher');

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

var _Utils = require('../core/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _buffer = require('../utils/buffer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CARDINAUX = ["NORTH", "EAST", "SOUTH", "WEST"];
var ARROWS = [37, 38, 39, 40];
var INTRO_TIME = 69;
var CREDITS_TIME = 570;
var BUFFER_TIME = 5000;
var VIDEOS = {
    "4K": "http://cdn.lescardinaux.com/videos/letsmakeitcount_4000.mp4",
    "HD": "http://cdn.lescardinaux.com/videos/letsmakeitcount_1920.mp4",
    "MD": "http://cdn.lescardinaux.com/videos/letsmakeitcount_1280.mp4",
    "SD": "http://cdn.lescardinaux.com/videos/letsmakeitcount_854.mp4"
};

var Video = function () {
    function Video(element) {
        _classCallCheck(this, Video);

        this.ready = false;

        this.element = element;
        this.wrapper = document.querySelector('#wrapper');
        this.squares = Array.from(document.querySelectorAll('.square'));
        this.rects = Array.from(document.querySelectorAll('.rect'));

        if (_Utils2.default.ios() && _Utils2.default.ios() < 10) {
            return;
        }

        _Dispatcher2.default.on("speed", this.changeSourceBasedOnConnection.bind(this));
        _Dispatcher2.default.on("input:quality", this.changeSourceBasedOnUser.bind(this));
        _Dispatcher2.default.on("video:setTime", this.currentTime.bind(this));

        localStorage.removeItem("video:active");
        localStorage.removeItem("replay");

        _track2.default.loadTracks(this.element);

        this.soundManager = new _SoundManger2.default();
        this.loader = new _loader2.default();
        this.controls = new _controls2.default(this);
        this.element.muted = true;

        this.StartIntro();

        this.soundManager.preload().then(function () {
            return _Dispatcher2.default.emit("sound:load");
        });

        this.attachEvents();
    }

    _createClass(Video, [{
        key: 'attachEvents',
        value: function attachEvents() {
            var _this = this;

            this.element.addEventListener('play', this.playHandle.bind(this), false);
            this.element.addEventListener('click', this.clickHandle.bind(this), false);
            this.element.addEventListener('canplay', this.canPlayHandle.bind(this));
            this.element.addEventListener('canplaythrough', this.canPlayThroughHandle.bind(this));
            this.element.addEventListener('waiting', this.handleWaiting.bind(this), false);

            this.wrapper.addEventListener('mouseleave', this.mouseOutHandle.bind(this), false);

            document.addEventListener('keydown', this.keyHandle.bind(this), false);

            this.squares.forEach(function (square) {
                square.addEventListener('click', _this.squareClickHandle.bind(_this), false);
                square.addEventListener('mouseover', _this.squareHoverHandle.bind(_this), false);
            });

            this.rects.forEach(function (rect) {
                rect.addEventListener('click', _this.rectClickHandle.bind(_this), false);
            });

            if (_Utils2.default.mobile()) _Dispatcher2.default.on("screen:orientation", this.screenChange.bind(this));

            _Dispatcher2.default.on("video:toggle", this.toggle.bind(this));
            _Dispatcher2.default.on("video:start", this.start.bind(this));

            _Dispatcher2.default.on("video:do:play", this.play.bind(this));
            _Dispatcher2.default.on("video:do:pause", this.pause.bind(this));
        }
    }, {
        key: 'playHandle',
        value: function playHandle() {
            this.loader.hide();
        }
    }, {
        key: 'clickHandle',
        value: function clickHandle() {
            this.element.classList.toggle('on-first');
        }
    }, {
        key: 'mouseOutHandle',
        value: function mouseOutHandle() {
            //lower the sound when all the videos are playing
            if (this.ready && !this.activeSquare && !this.inIntro && !this.soundChanged) {
                _Dispatcher2.default.emit("sound:volume", { volume: this.soundManager.volume - .1 });
                this.soundChanged = true;
            }

            if (!this.inIntro && !this.inCredits) this.soundManager.isOut = true;

            this.wrapper.classList.remove('is-hovering');

            if (!this.ready || this.activeSquare || this.element.paused || this.isWaiting) return;

            this.canHoverSquare();
            this.soundManager.unmuteAll();

            if (!this.inIntro && !this.inCredits) this.soundManager.muteBackground();
        }
    }, {
        key: 'squareHoverHandle',
        value: function squareHoverHandle(event) {
            var _this2 = this;

            if (!this.ready || this.activeSquare || this.backFromZoom || this.inIntro || this.isWaiting) return;

            this.soundManager.isOut = false;

            var square = event.target;

            while (!square.classList.contains('square')) {
                square = square.parentNode;
            }

            var index = parseInt(square.getAttribute('data-square'), 10);
            var cardinal = square.getAttribute('data-cardinal');

            this.squares.forEach(function (square, idx) {
                if (idx + 1 !== index) {
                    _this2.soundManager.mute(idx);
                } else {
                    _this2.soundManager.unmute(idx);
                }
            });

            if (this.soundChanged) {
                _Dispatcher2.default.emit("sound:volume", { volume: this.soundManager.volume + .1 });
                delete this.soundChanged;
            }

            if (event.type && event.type === "mouseover") {
                this.wrapper.classList.add('is-hovering');
            }
        }
    }, {
        key: 'squareClickHandle',
        value: function squareClickHandle(event) {
            var _this3 = this;

            if (this.activeSquare && !event.force || this.inIntro || !this.ready || this.isWaiting || event.target.classList.contains('rect')) return;

            this.activeSquare = event.target;

            while (!this.activeSquare.classList.contains('square')) {
                this.activeSquare = this.activeSquare.parentNode;
            }var index = parseInt(this.activeSquare.getAttribute('data-square'), 10);

            this.canHoverSquare();

            this.wrapper.classList.add('mode-zoom');
            this.element.className = 'on-' + index;

            this.squares.forEach(function (square, idx) {
                if (idx + 1 !== index) {
                    square.classList.add("is-hide");
                    square.classList.remove("is-active");
                    _this3.soundManager.mute(idx);
                } else {
                    var cardinal = square.getAttribute("data-cardinal");

                    localStorage.setItem("video:active", cardinal);

                    _this3.soundManager.unmute(idx);
                    square.classList.remove("is-hide");
                    square.classList.add("is-active");

                    if (window.ga) {
                        ga('send', 'event', 'video', 'clic zone', cardinal.toLowerCase());
                    }
                }
            });

            //Click to return to split
            setTimeout(function () {
                _this3.eventOnActiveSquare = _this3.activeClickHandle.bind(_this3);
                _this3.wrapper.onclick = _this3.eventOnActiveSquare;
            }, 100);
        }
    }, {
        key: 'rectClickHandle',
        value: function rectClickHandle(event) {
            //if(this.activeSquare || this.inIntro || !this.ready) return;

            var target = event.target;
            var square = target.parentNode;

            if (square.classList.contains('is-active')) {
                this.backToSplit(event);
            } else {
                this.squareClickHandle({ target: square });
            }
        }
    }, {
        key: 'activeClickHandle',
        value: function activeClickHandle(event) {
            this.backToSplit(event);
        }
    }, {
        key: 'screenChange',
        value: function screenChange(orientation) {
            if (orientation.newOrientation === "portrait") {
                this.pause();
            } else if (orientation.newOrientation === "landscape" && orientation.previousOrientation === "portrait") {
                this.play();
            }
        }
    }, {
        key: 'keyHandle',
        value: function keyHandle(e) {
            if (!e.target || !e.target.nodeName || e.target && e.target.nodeName !== "INPUT") e.preventDefault();

            //return
            if (e.keyCode === 8 || e.keyCode === 27) {
                this.backToSplit(e);
            }

            //space
            if (e.keyCode === 32) {
                if (!this.ready) return;

                if (this.element.paused) {
                    this.play(true);
                } else {
                    this.pause(true);
                }
            }

            if (~ARROWS.indexOf(e.keyCode)) {
                var cardinal = void 0;

                switch (e.keyCode) {
                    case 37:
                        cardinal = "WEST";break;
                    case 38:
                        cardinal = "NORTH";break;
                    case 39:
                        cardinal = "EAST";break;
                    case 40:
                        cardinal = "SOUTH";break;
                }

                this.squareClickHandle({ target: this.wrapper.querySelector('[data-cardinal="' + cardinal + '"]'), force: true });
            }
        }
    }, {
        key: 'canHoverSquare',
        value: function canHoverSquare() {
            delete this.backFromZoom;

            this.wrapper.classList.remove('prevent-hover');
            this.squares.forEach(function (square) {
                square.classList.remove('keep-focus');
            });

            if (this.outElement && (this.outElement.classList.contains('square') || this.outElement.classList.contains('caption'))) {
                if (!this.outElement.classList.contains('square')) this.outElement = this.outElement.parentNode;

                if (_Utils2.default.mobile()) {
                    this.soundManager.unmuteAll();
                } else {
                    this.squareHoverHandle({
                        target: this.outElement
                    });
                }
            }

            document.body.removeEventListener('mouseover', this.outEvent);
        }
    }, {
        key: 'backToSplit',
        value: function backToSplit(event) {
            var _this4 = this;

            this.backFromZoom = true;
            this.wrapper.classList.add('prevent-hover');

            var indexExtract = this.element.className.match('on-([0-9]{1})');

            if (indexExtract && indexExtract[1]) {
                var index = indexExtract[1];
                this.element.className = 'from-' + index;
            }

            setTimeout(this.canHoverSquare.bind(this), 1000);

            if (event) {
                this.outElement = document.elementFromPoint(event.pageX, event.pageY);
            }

            this.outEvent = function (event) {
                _this4.outElement = document.elementFromPoint(event.pageX, event.pageY);
            };

            document.body.addEventListener('mouseover', this.outEvent);

            this.wrapper.classList.remove('mode-zoom');
            localStorage.removeItem("video:active");

            setTimeout(function () {
                return _this4.element.className = '';
            }, 250);

            if (this.activeSquare) this.activeSquare.classList.add('keep-focus');

            this.wrapper.onclick = null;
            this.eventOnActiveSquare = null;

            this.squares.forEach(function (square, idx) {
                square.removeAttribute('style');
                square.classList.remove("is-hide");
                square.classList.remove("is-active");
            });

            this.activeSquare = null;

            if (_Utils2.default.mobile()) {
                _track2.default.clear();
            }
        }
    }, {
        key: 'StartIntro',
        value: function StartIntro(fromUser) {
            if (this.changingSource && !fromUser) return; //Not trigger with this when the user change the quality of the video

            this.inIntro = true;
            this.wrapper.classList.add('mode-intro');

            this.soundManager.canMute = false;
            this.soundManager.isOut = false;
            _track2.default.clear();

            if (this.eventOnActiveSquare) {
                this.wrapper.onclick = null; //', this.eventOnActiveSquare, false);
                this.eventOnActiveSquare = null;
            }

            //clear
            this.activeSquare = null;
            this.element.className = '';
            this.squares.forEach(function (square) {
                square.classList.remove('is-hide');
                square.classList.remove('is-active');
            });

            if (this.replay) {
                this.soundManager.inIntro = true;
                localStorage.removeItem("video:active");
                this.soundManager.unmuteAll();
            }
        }
    }, {
        key: 'EndIntro',
        value: function EndIntro() {
            this.inIntro = false;
            this.wrapper.classList.remove('mode-intro');

            this.soundManager.inIntro = false;
            this.soundManager.canMute = false;

            if (_Utils2.default.mobile()) {
                this.soundManager.unmuteAll();
            } else {
                this.soundManager.isOut = true;
                this.soundManager.muteBackground();
            }
        }
    }, {
        key: 'StartCredits',
        value: function StartCredits() {
            this.inCredits = true;
            document.body.classList.add('video--mode-credits');
            this.wrapper.classList.add('mode-credits');

            //clear
            localStorage.removeItem("video:active");
            this.soundManager.isOut = false;
            this.soundManager.unmuteAll();
        }
    }, {
        key: 'EndCredits',
        value: function EndCredits() {
            this.inCredits = false;
            this.isPaused = false;
            this.soundManager.isOut = true;
            document.body.classList.remove('video--mode-credits');
            this.wrapper.classList.remove('mode-credits');
            document.querySelector('.view--credits').classList.remove('view--active');
            document.body.classList.remove('on-view--credits');
        }
    }, {
        key: 'update',
        value: function update() {
            if (!this.ready) return;

            this.checkState();

            if (_Utils2.default.safari() || _Utils2.default.ios() || _Utils2.default.ie()) this.checkBuffer();

            if (!this.isPaused) {
                this.soundManager.sync(this.element.currentTime);
            }

            requestAnimationFrame(this.update.bind(this));
        }
    }, {
        key: 'checkState',
        value: function checkState(fromUser) {
            //End of the intro ?
            if (this.inIntro && this.element.currentTime >= INTRO_TIME) {
                this.EndIntro(fromUser);
            } else if (!this.inIntro && this.element.currentTime < INTRO_TIME) {
                this.StartIntro(fromUser);
            }

            //Credits
            if (this.inCredits && this.element.currentTime <= CREDITS_TIME) {
                this.EndCredits(fromUser);
            } else if (!this.inCredits && this.element.currentTime > CREDITS_TIME) {
                this.StartCredits(fromUser);
            }
        }
    }, {
        key: 'checkBuffer',
        value: function checkBuffer() {
            if (this.element.readyState === 4 && this.isWaiting) {
                this.isWaiting = false;
                this.isLoading = false;
            }
        }
    }, {
        key: 'handleWaiting',
        value: function handleWaiting() {
            var _this5 = this;

            var now = new Date().getTime();

            this.isWaiting = true;

            if (this.lastWaiting && now - this.lastWaiting > 5000) {
                this.forceWaiting = true;
            } else {
                this.forceWaiting = false;
            }

            this.lastWaiting = new Date().getTime();
            // this.wrapper.classList.add('is-waiting');

            this.loader.show();

            if (_Utils2.default.ie()) {
                setTimeout(function () {
                    _this5.loader.hide();
                }, 500);
            }
        }
    }, {
        key: 'fakeWaiting',
        value: function fakeWaiting() {
            this.loader.show();
        }
    }, {
        key: 'canPlayHandle',
        value: function canPlayHandle() {
            this.loader.hide();

            this.isWaiting = false;
        }
    }, {
        key: 'canPlayThroughHandle',
        value: function canPlayThroughHandle() {
            var _this6 = this;

            if (!this.ready && !this.isLoading && !this.isWaiting) return;

            console.log('superior: ' + this.videoQualityIsSuperior);
            console.log('force waiting: ' + this.forceWaiting);

            if (!this.videoQualityIsSuperior && !this.forceWaiting) {
                done.call(this);
            } else {
                this.pause();
                this.loader.show();
                this.isWaiting = true;

                //Wait max 10 secondes
                setTimeout(function () {
                    done.call(_this6);
                }, BUFFER_TIME);
            }

            function done() {
                this.loader.hide();

                if (this.isWaiting) {
                    this.soundManager.currentTime(this.element.currentTime);
                    delete this.isWaiting;
                    // this.wrapper.classList.remove('is-waiting');

                    if (this.inIntro) this.soundManager.unmuteAll({ force: true });else {
                        this.soundManager.unmuteAll();
                        if (!this.inIntro && !this.inCredits) this.soundManager.muteBackground();
                    }
                }

                if (!this.isPaused) this.play();
                this.isLoading = false;
            }
        }
    }, {
        key: 'currentTime',
        value: function currentTime(time) {
            var _this7 = this;

            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            if ((typeof time === 'undefined' ? 'undefined' : _typeof(time)) === 'object') {
                options = time;
                time = time.time;
            }

            return new Promise(function (resolve) {
                if (!_this7.ready || time < 0) return;

                if (!options.audioOnly) _this7.element.currentTime = time;

                _track2.default.clear();

                if (_this7.isPaused) _this7.fakeWaiting();

                if (options.replay) _this7.replay = true;

                //maybe need to remove the intro or credits layer
                if (options.fromUser || options.replay) _this7.checkState(true);

                if (_this7.isWaiting && !options.replay) return;

                if (options.videoOnly) _this7.soundManager.pauseAll();else {
                    _this7.isLoading = true;
                    _this7.isWaiting = true;
                    _this7.soundManager.muteAll();
                }

                if (options.replay) {
                    _this7.EndCredits();
                    _this7.backToSplit();
                    _this7.soundManager.unmuteAll({ force: true });
                    _this7.soundManager.playAll();
                }

                return resolve();
            });
        }
    }, {
        key: 'getBuffered',
        value: function getBuffered() {
            var range = 0;
            var buffer = this.element.buffered;
            var time = this.element.currentTime;

            if (time === 0 || !buffer || buffer.length === 0) return;

            while (!(buffer.start(range) <= time && time <= buffer.end(range))) {
                range += 1;
            }

            if (window.DEBUG) {
                var values = [];

                for (var i = 0; i < buffer.length; i++) {
                    values.push({ start: buffer.start(i), end: buffer.end(i) });
                }

                console.log({ time: time, range: range });
                console.table(values);
            }

            return buffer.end(range) - time;
        }
    }, {
        key: 'start',
        value: function start() {
            var _this8 = this;

            var readyEvent = function readyEvent() {
                _this8.soundManager.start().then(ready.bind(_this8));
            };

            if (this.element.readyState === 4) {
                this.soundManager.start().then(ready.bind(this));
            } else {
                this.element.play();
                this.element.addEventListener('canplay', readyEvent, false);
            }

            function ready() {
                this.element.removeEventListener('canplay', readyEvent, false);

                this.ready = true;
                this.element.play();

                this.update();
            }
        }
    }, {
        key: 'play',
        value: function play(fromUser) {
            if (!this.ready) return;

            if (fromUser) delete this.isPaused;

            this.element.play();
            this.soundManager.resumeAll();

            _Dispatcher2.default.emit("video:play");
        }
    }, {
        key: 'pause',
        value: function pause(fromUser) {
            if (!this.ready) return;

            if (fromUser) this.isPaused = true;

            this.element.pause();
            this.soundManager.pauseAll();

            _Dispatcher2.default.emit("video:pause");
        }
    }, {
        key: 'toggle',
        value: function toggle() {
            if (!this.ready) return;

            if (this.isPaused) this.play(true);else this.pause(true);
        }
    }, {
        key: 'changeSourceBasedOnConnection',
        value: function changeSourceBasedOnConnection() {
            var progress = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

            if (this.sourceForcedByUser) return;

            progress *= 100;

            var className = "is-";
            var message = "";

            console.log('progress after 500ms : ' + progress + '%');

            //Special case for iOS, or it's crash...
            if (_Utils2.default.ios() || _Utils2.default.mobile()) {
                this.element.src = VIDEOS["SD"];
                className += "sd";
                message = "SD";
            } else if (progress > 10) {
                this.element.src = VIDEOS["4K"];
                className += "4k";
                message = "4K";
            } else if (progress > 5) {
                this.element.src = VIDEOS["HD"];
                className += "hd";
                message = "HD";
            } else if (progress > 1) {
                this.element.src = VIDEOS["MD"];
                className += "md";
                message = "MD";
            } else {
                className += "sd";
                message = "SD";
            }

            this.assignedQuality = Object.keys(VIDEOS).indexOf(message);

            document.querySelector('input[name="quality"][value="' + message + '"]').setState(message);
            document.querySelector('label[for="quality-' + message.toLowerCase() + '"]').classList.add('is-active');

            message += " video loaded";

            console.log(message);

            this.wrapper.classList.add(className);
        }
    }, {
        key: 'changeSourceBasedOnUser',
        value: function changeSourceBasedOnUser(data) {
            var _this9 = this;

            var actualTime = 0;

            if (data.fromSave) {
                this.sourceForcedByUser = true;
            } else {
                this.pause();
                actualTime = this.element.currentTime;
            }

            this.changingSource = true;

            var quality = data.value.toUpperCase();
            var qualityIndex = Object.keys(VIDEOS).indexOf(quality);

            //Change source
            this.element.src = VIDEOS[quality];

            //If new source is supperior to the assigned one
            if (qualityIndex < this.assignedQuality) {
                this.videoQualityIsSuperior = true;
            } else {
                this.videoQualityIsSuperior = false;
            }

            var actualQuality = /is-([a-z0-9]{2})/.exec(this.wrapper.className);

            if (actualQuality && actualQuality[0]) {
                this.wrapper.className = this.wrapper.className.replace(actualQuality[0], 'is-' + data.value.toLowerCase());
            }

            this.element.addEventListener("loadedmetadata", function () {
                if (data.fromSave) return; //Cancel if set from user preference : the video isn't loaded yet

                _this9.currentTime(actualTime).then(function () {
                    _this9.soundManager.unmuteAll();
                    _this9.play();

                    delete _this9.changingSource;
                }).catch(function (err) {
                    _this9.element.addEventListener('canplaythrough', function () {
                        _this9.soundManager.unmuteAll();
                        _this9.play();

                        delete _this9.changingSource;
                    }, false);

                    if (err) console.error(err);
                });
            }, false);
        }
    }]);

    return Video;
}();

exports.default = Video;

},{"../audio/SoundManger":7,"../controls/controls":8,"../core/Dispatcher":14,"../core/Utils":15,"../loader/loader":18,"../track/track":25,"../utils/buffer":28}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by baest on 01/09/2016.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _Dispatcher = require("../core/Dispatcher");

var _Dispatcher2 = _interopRequireDefault(_Dispatcher);

var _Utils = require("../core/Utils");

var _Utils2 = _interopRequireDefault(_Utils);

var _scroll = require("scroll");

var _scroll2 = _interopRequireDefault(_scroll);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var View = function () {
    function View(element) {
        _classCallCheck(this, View);

        this.element = element;
        this.wrapper = document.querySelector('#views');
        this.name = element.getAttribute('data-view');

        this.attachEvents();
        this.viewDispatcher();
    }

    _createClass(View, [{
        key: "attachEvents",
        value: function attachEvents() {
            this.eventOnClick = this.clickHandle.bind(this);
            this.element.addEventListener('click', this.eventOnClick, false);

            _Dispatcher2.default.on("view:change", this.handleViewChange.bind(this), false);
        }
    }, {
        key: "handleViewChange",
        value: function handleViewChange(data) {
            if (data.href && data.href === this.name) {
                this.active();

                this.element.classList.add('from-menu');
                this.wrapper.classList.add('from-menu');
            }
        }
    }, {
        key: "clickHandle",
        value: function clickHandle(event) {
            if (event && event.target && event.target.hasAttribute('data-prevent')) return;

            this.inActive(true);
        }
    }, {
        key: "active",
        value: function active(force) {
            var _this = this;

            this.element.classList.add('view--active');
            document.body.classList.add("on-view--" + this.name);

            if (force) this.element.classList.add('view--forced');

            setTimeout(function () {
                _this.isActive = true;
            }, 100);
        }
    }, {
        key: "inActive",
        value: function inActive() {
            var _this2 = this;

            document.body.classList.remove("on-view--" + this.name);

            this.element.classList.remove('from-menu');
            this.wrapper.classList.remove('from-menu');

            if (this.hasLeavingTransition()) {
                (function () {
                    _this2.element.classList.add('view--leaving');

                    var eventTransition = function eventTransition(event) {
                        event.target.classList.remove('view--leaving');
                        event.target.removeEventListener('transitionend', eventTransition);
                    };

                    _this2.element.addEventListener('transitionend', eventTransition);
                })();
            }

            this.element.classList.remove('view--active');
            this.element.classList.remove('view--forced');

            this.isActive = false;
        }
    }, {
        key: "viewDispatcher",
        value: function viewDispatcher() {
            if (this["handleView" + _Utils2.default.capitalizeFirstLetter(this.name)]) this["handleView" + _Utils2.default.capitalizeFirstLetter(this.name)]();
        }
    }, {
        key: "goTo",
        value: function goTo(viewName) {
            var _this3 = this;

            var views = Array.from.apply(Array, _toConsumableArray(document.querySelectorAll('[data-view]')));

            views.forEach(function (view) {
                if (view.getAttribute('data-view') === viewName) {
                    view.classList.add('view--active');
                    document.body.classList.add("on-view--" + viewName);

                    if (_this3["setView" + _Utils2.default.capitalizeFirstLetter(_this3.name)]) _this3["setView" + _Utils2.default.capitalizeFirstLetter(_this3.name)]();
                } else if (view.getAttribute('data-view') !== 'orientation') {
                    view.classList.remove('view--active');
                }
            });
        }
    }, {
        key: "hasLeavingTransition",
        value: function hasLeavingTransition() {
            var _this4 = this;

            var res = false;

            var sheet = document.styleSheets[0];
            var rules = sheet.rules ? sheet.rules : sheet.cssRules ? sheet.cssRules : [];

            Array.from(rules).forEach(function (rule) {
                if (rule.selectorText && ~rule.selectorText.indexOf(".view--" + _this4.name + ".view--leaving")) {
                    res = true;
                }
            });

            return res;
        }
    }, {
        key: "handleViewIntro",
        value: function handleViewIntro() {
            var _this5 = this;

            if (!_Utils2.default.ios() || _Utils2.default.ios() && _Utils2.default.ios() >= 10) this.active();else return;

            var percentElement = this.element.querySelector(".load-percent");
            var loaderElement = document.querySelector('.loading');
            var loadPercent = 0;
            var decodePercent = 0;
            var loaded = false;

            this.element.removeEventListener('click', this.eventOnClick, false);

            var progressEvent = function progressEvent(data) {
                loadPercent = data.progress;

                var per = Math.round(Math.ceil(loadPercent * 100) / 100 * 100 * .6) + Math.round(decodePercent * 100 * .4);

                percentElement.innerHTML = per + "%";
            };

            var decodedEvent = function decodedEvent(data) {
                decodePercent = data.progress;

                var per = Math.round(Math.ceil(loadPercent * 100) / 100 * 100 * .6) + Math.round(decodePercent * 100 * .4);

                percentElement.innerHTML = per + "%";
            };

            var clickEvent = function clickEvent() {
                _Dispatcher2.default.emit("loader:end");

                _this5.element.classList.remove('is-loaded');
                loaderElement.parentNode.classList.remove('is-ready');
                loaderElement.removeEventListener('click', clickEvent, false);

                _this5.inActive(true);
                _Dispatcher2.default.emit("video:start");
            };

            _Dispatcher2.default.once("sound:load", function () {
                loaded = true;

                _Dispatcher2.default.off("sound:progress", progressEvent);
                _Dispatcher2.default.off("sound:decoded", decodedEvent);

                _this5.element.classList.add('is-loaded');
                loaderElement.parentNode.classList.add('is-ready');
                loaderElement.addEventListener('click', clickEvent, false);

                document.body.classList.remove('is-loading');
            });

            _Dispatcher2.default.on("sound:progress", progressEvent);
            _Dispatcher2.default.on("sound:decoded", decodedEvent);
        }
    }, {
        key: "handleViewTitle",
        value: function handleViewTitle() {
            var _this6 = this;

            this.element.removeEventListener('click', this.eventOnClick, false);

            _Dispatcher2.default.once("loader:end", function () {
                setTimeout(function () {
                    _this6.inActive();
                    _Dispatcher2.default.emit("video:start");
                }, 1500);
            });
        }
    }, {
        key: "handleViewCredits",
        value: function handleViewCredits() {
            var _this7 = this;

            var self = this;
            var video = document.querySelector('#main');
            var credits = this.element.querySelector('.credits');

            var observerConfig = { attributes: true, childList: false, characterData: false };

            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.attributeName === "class" && _this7.element.classList.contains('view--active')) {
                        doAScrollToBottom();
                    }
                });
            });

            observer.observe(this.element, observerConfig);

            video.addEventListener("timeupdate", function () {
                var time = video.currentTime;

                if (time >= 570) {
                    _this7.element.removeEventListener('click', _this7.eventOnClick, false);

                    _this7.active();

                    video.classList.add('mode-credits');
                } else {
                    video.classList.remove('mode-credits');

                    _this7.element.addEventListener('click', _this7.eventOnClick, false);

                    _this7.isActive = false;

                    cancelPrevent();
                }
            });

            function prevent() {
                credits.onwheel = function (event) {
                    return event.preventDefault();
                };
                credits.onmousewheel = function (event) {
                    return event.preventDefault();
                };
                credits.ontouchmove = function (event) {
                    return event.preventDefault();
                };
                credits.onkeydown = function (event) {
                    return event.preventDefault();
                };
            }

            function cancelPrevent() {
                credits.onwheel = null;
                credits.onmousewheel = null;
                credits.ontouchmove = null;
                credits.onkeydown = null;
            }

            function doAScrollToBottom() {
                if (self.isActive) return;

                credits.classList.remove('is-end');

                credits.scrollTop = 0;

                var cancel = _scroll2.default.top(credits, credits.scrollHeight - window.innerHeight, {
                    ease: createjs.Ease.linear,
                    duration: 30 * 1000
                }, function () {
                    credits.removeEventListener('wheel', cancel);
                    cancelPrevent();
                    credits.classList.add('is-end');
                });

                prevent();

                return cancel;
            }
        }
    }, {
        key: "handleViewIos",
        value: function handleViewIos() {
            if (_Utils2.default.ios() && _Utils2.default.ios() < 10) {
                this.active();
                this.element.removeEventListener("click", this.eventOnClick, false);
                document.querySelector('.loader').classList.add('is-hidden');
            }
        }
    }, {
        key: "handleViewOrientation",
        value: function handleViewOrientation() {
            var self = this;

            orientationHandler();
            window.addEventListener("orientationchange", orientationHandler, false);

            this.element.removeEventListener('click', this.eventOnClick, false);

            function orientationHandler() {
                var previousOrientation = self.orientation;
                var portrait = window.matchMedia("(orientation: portrait)").matches;
                var landscape = window.matchMedia("(orientation: landscape)").matches;

                if (portrait) {
                    self.orientation = "portrait";
                    _Dispatcher2.default.emit("screen:orientation", { newOrientation: "portrait", previousOrientation: previousOrientation });
                } else if (landscape) {
                    self.orientation = "landscape";
                    _Dispatcher2.default.emit("screen:orientation", { newOrientation: "landscape", previousOrientation: previousOrientation });
                }
            }
        }
    }]);

    return View;
}();

exports.default = View;

},{"../core/Dispatcher":14,"../core/Utils":15,"scroll":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXdheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hd2F5L25vZGVfbW9kdWxlcy94dGVuZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9nbG9iYWwvd2luZG93LmpzIiwibm9kZV9tb2R1bGVzL3JhZmwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc2Nyb2xsL2luZGV4LmpzIiwic3JjXFxhcHAuanMiLCJzcmNcXGF1ZGlvXFxTb3VuZE1hbmdlci5qcyIsInNyY1xcY29udHJvbHNcXGNvbnRyb2xzLmpzIiwic3JjXFxjb250cm9sc1xcZnVsbHNjcmVlbi5qcyIsInNyY1xcY29udHJvbHNcXG9wZW4uanMiLCJzcmNcXGNvbnRyb2xzXFxwbGF5LmpzIiwic3JjXFxjb250cm9sc1xcc29jaWFsLmpzIiwic3JjXFxjb250cm9sc1xcc291bmQuanMiLCJzcmNcXGNvcmVcXERpc3BhdGNoZXIuanMiLCJzcmNcXGNvcmVcXFV0aWxzLmpzIiwic3JjXFxjb3JlXFxldmVudEVtaXR0ZXIuanMiLCJzcmNcXGhyZWZcXGhyZWYuanMiLCJzcmNcXGxvYWRlclxcbG9hZGVyLmpzIiwic3JjXFxtYWlsXFxtYWlsLmpzIiwic3JjXFxtZW51XFxtZW51LmpzIiwic3JjXFxwcm9jZWVkXFxwcm9jZWVkLmpzIiwic3JjXFxzd2l0Y2hcXHN3aXRjaC5qcyIsInNyY1xcdGV4dFxcbWV0YS5qcyIsInNyY1xcdGV4dFxcdGV4dC5qcyIsInNyY1xcdHJhY2tcXHRyYWNrLmpzIiwic3JjXFx1c2VyXFxtb25pdG9yLmpzIiwic3JjXFx1dGlsc1xcYnJvd3Nlci5qcyIsInNyY1xcdXRpbHNcXGJ1ZmZlci5qcyIsInNyY1xcdXRpbHNcXHRpbWUtcmFuZ2VzLmpzIiwic3JjXFx2aWRlb1xcdmlkZW8uanMiLCJzcmNcXHZpZXdcXHZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkVBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFHQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNLFlBQVk7QUFDZCwwQkFEYztBQUVkLDRCQUZjO0FBR2QsMEJBSGM7QUFJZCwrQkFKYztBQUtkLHFDQUxj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LEdBQThCO0FBQzFCLG9CQUFJLHNCQUFzQixLQUFLLFdBQS9CO0FBQ0Esb0JBQUksV0FBWSxPQUFPLFVBQVAsQ0FBa0IseUJBQWxCLEVBQTZDLE9BQTdEO0FBQ0Esb0JBQUksWUFBWSxPQUFPLFVBQVAsQ0FBa0IsMEJBQWxCLEVBQThDLE9BQTlEOztBQUVBLG9CQUFHLFFBQUgsRUFBYTtBQUNULHlCQUFLLFdBQUwsR0FBbUIsVUFBbkI7QUFDQSx5Q0FBVyxJQUFYLENBQWdCLG9CQUFoQixFQUFzQyxFQUFFLGdCQUFnQixVQUFsQixFQUE4Qix3Q0FBOUIsRUFBdEM7QUFDSCxpQkFIRCxNQUlLLElBQUcsU0FBSCxFQUFjO0FBQ2YseUJBQUssV0FBTCxHQUFtQixXQUFuQjtBQUNBLHlDQUFXLElBQVgsQ0FBZ0Isb0JBQWhCLEVBQXNDLEVBQUUsZ0JBQWdCLFdBQWxCLEVBQStCLHdDQUEvQixFQUF0QztBQUNIO0FBQ0o7QUFDSjs7Ozs7O2tCQUlVLEkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0aW1lb3V0KSB7XG4gICAgcmV0dXJuIG5ldyBJZGxlKHsgdGltZW91dDogdGltZW91dCB9KTtcbn07XG5cbi8vIGRlZmF1bHQgc2V0dGluZ3NcbnZhciBkZWZhdWx0cyA9IHtcbiAgICAvL3N0YXJ0IGFzIHNvb24gYXMgdGltZXIgaXMgc2V0IHVwXG4gICAgc3RhcnQ6IHRydWUsXG4gICAgLy8gdGltZXIgaXMgZW5hYmxlZFxuICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgLy8gYW1vdW50IG9mIHRpbWUgYmVmb3JlIHRpbWVyIGZpcmVzXG4gICAgdGltZW91dDogMzAwMDAsXG4gICAgLy8gd2hhdCBlbGVtZW50IHRvIGF0dGFjaCB0b1xuICAgIGVsZW1lbnQ6IGRvY3VtZW50LFxuICAgIC8vIGFjdGl2aXR5IGlzIG9uZSBvZiB0aGVzZSBldmVudHNcbiAgICBldmVudHM6ICdtb3VzZW1vdmUga2V5ZG93biBET01Nb3VzZVNjcm9sbCBtb3VzZXdoZWVsIG1vdXNlZG93biB0b3VjaHN0YXJ0IHRvdWNobW92ZSdcbn07XG5cbnZhciBJZGxlID0gZnVuY3Rpb24ob3B0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5vcHQgPSB4dGVuZChkZWZhdWx0cywgb3B0KTtcbiAgICBzZWxmLmVsZW1lbnQgPSBzZWxmLm9wdC5lbGVtZW50O1xuXG4gICAgc2VsZi5zdGF0ZSA9IHtcbiAgICAgICAgaWRsZTogc2VsZi5vcHQuaWRsZSxcbiAgICAgICAgdGltZW91dDogc2VsZi5vcHQudGltZW91dCxcbiAgICAgICAgZW5hYmxlZDogc2VsZi5vcHQuZW5hYmxlZCxcbiAgICAgICAgaWRsZV9mbjogW10sXG4gICAgICAgIGFjdGl2ZV9mbjogW11cbiAgICB9O1xuXG4gICAgLy8gd3JhcHBlciB0byBwYXNzIHN0YXRlIHRvIHRvZ2dsZVN0YXRlXG4gICAgc2VsZi5zdGF0ZS5zdGF0ZV9mbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0b2dnbGVTdGF0ZShzZWxmLnN0YXRlKTtcbiAgICB9O1xuXG4gICAgaWYgKHNlbGYub3B0LnN0YXJ0KSB7XG4gICAgICAgIHNlbGYuc3RhcnQoKTtcbiAgICB9XG59O1xuXG52YXIgcHJvdG8gPSBJZGxlLnByb3RvdHlwZTtcblxucHJvdG8uc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHN0YXRlID0gc2VsZi5zdGF0ZTtcbiAgICB2YXIgZWxlbWVudCA9IHNlbGYuZWxlbWVudDtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZXIoZXYpIHtcbiAgICAgICAgLy8gY2xlYXIgYW55IGN1cnJlbnQgdGltb3VldFxuICAgICAgICBjbGVhclRpbWVvdXQoc3RhdGUudGltZXJfaWQpO1xuXG4gICAgICAgIGlmICghc3RhdGUuZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRlLmlkbGUpIHtcbiAgICAgICAgICAgIHRvZ2dsZVN0YXRlKHN0YXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLnRpbWVyX2lkID0gc2V0VGltZW91dChzdGF0ZS5zdGF0ZV9mbiwgc3RhdGUudGltZW91dCk7XG4gICAgfVxuXG4gICAgLy8gdG8gcmVtb3ZlIGxhdGVyXG4gICAgc3RhdGUuaGFuZGxlciA9IGhhbmRsZXI7XG5cbiAgICB2YXIgZXZlbnRzID0gdGhpcy5vcHQuZXZlbnRzLnNwbGl0KCcgJyk7XG4gICAgZm9yICh2YXIgaT0wIDsgaTxldmVudHMubGVuZ3RoIDsgKytpKSB7XG4gICAgICAgIHZhciBldmVudCA9IGV2ZW50c1tpXTtcbiAgICAgICAgYXR0YWNoKGVsZW1lbnQsIGV2ZW50LCBoYW5kbGVyKTtcbiAgICB9XG5cbiAgICBzdGF0ZS50aW1lcl9pZCA9IHNldFRpbWVvdXQoc2VsZi5zdGF0ZS5zdGF0ZV9mbiwgc3RhdGUudGltZW91dCk7XG59O1xuXG4vLyAnaWRsZScgfCAnYWN0aXZlJ1xucHJvdG8ub24gPSBmdW5jdGlvbih3aGF0LCBmbikge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBzdGF0ZSA9IHNlbGYuc3RhdGU7XG5cbiAgICBpZiAod2hhdCA9PT0gJ2lkbGUnKSB7XG4gICAgICAgIHN0YXRlLmlkbGVfZm4ucHVzaChmbik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzdGF0ZS5hY3RpdmVfZm4ucHVzaChmbik7XG4gICAgfVxufTtcblxucHJvdG8uZ2V0RWxhcHNlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoICtuZXcgRGF0ZSgpICkgLSB0aGlzLnN0YXRlLm9sZGRhdGU7XG59O1xuXG4vLyBTdG9wcyB0aGUgaWRsZSB0aW1lci4gVGhpcyByZW1vdmVzIGFwcHJvcHJpYXRlIGV2ZW50IGhhbmRsZXJzXG4vLyBhbmQgY2FuY2VscyBhbnkgcGVuZGluZyB0aW1lb3V0cy5cbnByb3RvLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICB2YXIgZWxlbWVudCA9IHNlbGYuZWxlbWVudDtcblxuICAgIHN0YXRlLmVuYWJsZWQgPSBmYWxzZTtcblxuICAgIC8vY2xlYXIgYW55IHBlbmRpbmcgdGltZW91dHNcbiAgICBjbGVhclRpbWVvdXQoc3RhdGUudGltZXJfaWQpO1xuXG4gICAgLy8gZGV0YWNoIGhhbmRsZXJzXG4gICAgdmFyIGV2ZW50cyA9IHRoaXMub3B0LmV2ZW50cy5zcGxpdCgnICcpO1xuICAgIGZvciAodmFyIGk9MCA7IGk8ZXZlbnRzLmxlbmd0aCA7ICsraSkge1xuICAgICAgICB2YXIgZXZlbnQgPSBldmVudHNbaV07XG4gICAgICAgIGRldGFjaChlbGVtZW50LCBldmVudCwgc3RhdGUuaGFuZGxlcik7XG4gICAgfVxufTtcblxuLy8vIHByaXZhdGUgYXBpXG5cbi8vIFRvZ2dsZXMgdGhlIGlkbGUgc3RhdGUgYW5kIGZpcmVzIGFuIGFwcHJvcHJpYXRlIGV2ZW50LlxuLy8gYm9ycm93ZWQgZnJvbSBqcXVlcnktaWRsZXRpbWVyIChzZWUgcmVhZG1lIGZvciBsaW5rKVxuZnVuY3Rpb24gdG9nZ2xlU3RhdGUoc3RhdGUpIHtcbiAgICAvLyB0b2dnbGUgdGhlIHN0YXRlXG4gICAgc3RhdGUuaWRsZSA9ICFzdGF0ZS5pZGxlO1xuXG4gICAgLy8gcmVzZXQgdGltZW91dFxuICAgIHZhciBlbGFwc2VkID0gKCArbmV3IERhdGUoKSApIC0gc3RhdGUub2xkZGF0ZTtcbiAgICBzdGF0ZS5vbGRkYXRlID0gK25ldyBEYXRlKCk7XG5cbiAgICAvLyBoYW5kbGUgQ2hyb21lIGFsd2F5cyB0cmlnZ2VyaW5nIGlkbGUgYWZ0ZXIganMgYWxlcnQgb3IgY29tZmlybSBwb3B1cFxuICAgIGlmIChzdGF0ZS5pZGxlICYmIChlbGFwc2VkIDwgc3RhdGUudGltZW91dCkpIHtcbiAgICAgICAgc3RhdGUuaWRsZSA9IGZhbHNlO1xuICAgICAgICBjbGVhclRpbWVvdXQoc3RhdGUudGltZXJfaWQpO1xuICAgICAgICBpZiAoc3RhdGUuZW5hYmxlZCkge1xuICAgICAgICAgICAgc3RhdGUudGltZXJfaWQgPSBzZXRUaW1lb3V0KHN0YXRlLnN0YXRlX2ZuLCBzdGF0ZS50aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZmlyZSBldmVudFxuICAgIHZhciBldmVudCA9IHN0YXRlLmlkbGUgPyAnaWRsZScgOiAnYWN0aXZlJztcblxuICAgIHZhciBmbnMgPSAoZXZlbnQgPT09ICdpZGxlJykgPyBzdGF0ZS5pZGxlX2ZuIDogc3RhdGUuYWN0aXZlX2ZuO1xuICAgIGZvciAodmFyIGk9MCA7IGk8Zm5zLmxlbmd0aCA7ICsraSkge1xuICAgICAgICBmbnNbaV0oKTtcbiAgICB9XG59XG5cbi8vIFRPRE8gKHNodHlsbWFuKSBkZXRlY3QgYXQgc3RhcnR1cCB0byBhdm9pZCBpZiBkdXJpbmcgcnVudGltZT9cbnZhciBhdHRhY2ggPSBmdW5jdGlvbihlbGVtZW50LCBldmVudCwgZm4pIHtcbiAgICBpZiAoZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZm4sIGZhbHNlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZWxlbWVudC5hdHRhY2hFdmVudCkge1xuICAgICAgICBlbGVtZW50LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudCwgZm4pO1xuICAgIH1cbn07XG5cbnZhciBkZXRhY2ggPSBmdW5jdGlvbihlbGVtZW50LCBldmVudCwgZm4pIHtcbiAgICBpZiAoZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZm4sIGZhbHNlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZWxlbWVudC5kZXRhY2hFdmVudCkge1xuICAgICAgICBlbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBldmVudCwgZm4pO1xuICAgIH1cbn07XG5cbiIsInZhciBLZXlzID0gT2JqZWN0LmtleXMgfHwgb2JqZWN0S2V5c1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4dGVuZFxuXG5mdW5jdGlvbiBleHRlbmQoKSB7XG4gICAgdmFyIHRhcmdldCA9IHt9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG5cbiAgICAgICAgaWYgKCFpc09iamVjdChzb3VyY2UpKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGtleXMgPSBLZXlzKHNvdXJjZSlcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0ga2V5c1tqXVxuICAgICAgICAgICAgdGFyZ2V0W25hbWVdID0gc291cmNlW25hbWVdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0XG59XG5cbmZ1bmN0aW9uIG9iamVjdEtleXMob2JqKSB7XG4gICAgdmFyIGtleXMgPSBbXVxuICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgIGtleXMucHVzaChrKVxuICAgIH1cbiAgICByZXR1cm4ga2V5c1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgICByZXR1cm4gb2JqICE9PSBudWxsICYmIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCJcbn1cbiIsImlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIG1vZHVsZS5leHBvcnRzID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7fTtcbn1cbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCdnbG9iYWwnKVxuXG4vKipcbiAqIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKWBcbiAqL1xuXG52YXIgcmVxdWVzdCA9IGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgZ2xvYmFsLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCBnbG9iYWwubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IGZhbGxiYWNrXG5cbnZhciBwcmV2ID0gK25ldyBEYXRlXG5mdW5jdGlvbiBmYWxsYmFjayAoZm4pIHtcbiAgdmFyIGN1cnIgPSArbmV3IERhdGVcbiAgdmFyIG1zID0gTWF0aC5tYXgoMCwgMTYgLSAoY3VyciAtIHByZXYpKVxuICB2YXIgcmVxID0gc2V0VGltZW91dChmbiwgbXMpXG4gIHJldHVybiBwcmV2ID0gY3VyciwgcmVxXG59XG5cbi8qKlxuICogYGNhbmNlbEFuaW1hdGlvbkZyYW1lKClgXG4gKi9cblxudmFyIGNhbmNlbCA9IGdsb2JhbC5jYW5jZWxBbmltYXRpb25GcmFtZVxuICB8fCBnbG9iYWwud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgZ2xvYmFsLm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lXG4gIHx8IGNsZWFyVGltZW91dFxuXG5pZiAoRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgcmVxdWVzdCA9IHJlcXVlc3QuYmluZChnbG9iYWwpXG4gIGNhbmNlbCA9IGNhbmNlbC5iaW5kKGdsb2JhbClcbn1cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWVzdFxuZXhwb3J0cy5jYW5jZWwgPSBjYW5jZWxcbiIsInZhciByYWYgPSByZXF1aXJlKCdyYWZsJylcblxuZnVuY3Rpb24gc2Nyb2xsIChwcm9wLCBlbGVtZW50LCB0bywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgdmFyIHN0YXJ0ID0gK25ldyBEYXRlXG4gIHZhciBmcm9tID0gZWxlbWVudFtwcm9wXVxuICB2YXIgY2FuY2VsbGVkID0gZmFsc2VcblxuICB2YXIgZWFzZSA9IGluT3V0U2luZVxuICB2YXIgZHVyYXRpb24gPSAzNTBcblxuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYWxsYmFjayA9IG9wdGlvbnNcbiAgfVxuICBlbHNlIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIGVhc2UgPSBvcHRpb25zLmVhc2UgfHwgZWFzZVxuICAgIGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiB8fCBkdXJhdGlvblxuICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge31cbiAgfVxuXG4gIGlmIChmcm9tID09PSB0bykge1xuICAgIHJldHVybiBjYWxsYmFjayhcbiAgICAgIG5ldyBFcnJvcignRWxlbWVudCBhbHJlYWR5IGF0IHRhcmdldCBzY3JvbGwgcG9zaXRpb24nKSxcbiAgICAgIGVsZW1lbnRbcHJvcF1cbiAgICApXG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwgKCkge1xuICAgIGNhbmNlbGxlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGFuaW1hdGUgKHRpbWVzdGFtcCkge1xuICAgIGlmIChjYW5jZWxsZWQpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhcbiAgICAgICAgbmV3IEVycm9yKCdTY3JvbGwgY2FuY2VsbGVkJyksXG4gICAgICAgIGVsZW1lbnRbcHJvcF1cbiAgICAgIClcbiAgICB9XG5cbiAgICB2YXIgbm93ID0gK25ldyBEYXRlXG4gICAgdmFyIHRpbWUgPSBNYXRoLm1pbigxLCAoKG5vdyAtIHN0YXJ0KSAvIGR1cmF0aW9uKSlcbiAgICB2YXIgZWFzZWQgPSBlYXNlKHRpbWUpXG5cbiAgICBlbGVtZW50W3Byb3BdID0gKGVhc2VkICogKHRvIC0gZnJvbSkpICsgZnJvbVxuXG4gICAgdGltZSA8IDEgP1xuICAgICAgcmFmKGFuaW1hdGUpIDpcbiAgICAgIGNhbGxiYWNrKG51bGwsIGVsZW1lbnRbcHJvcF0pXG4gIH1cblxuICByYWYoYW5pbWF0ZSlcblxuICByZXR1cm4gY2FuY2VsXG59XG5cbmZ1bmN0aW9uIGluT3V0U2luZSAobikge1xuICByZXR1cm4gLjUgKiAoMSAtIE1hdGguY29zKE1hdGguUEkgKiBuKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0b3A6IGZ1bmN0aW9uIChlbGVtZW50LCB0bywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gc2Nyb2xsKCdzY3JvbGxUb3AnLCBlbGVtZW50LCB0bywgb3B0aW9ucywgY2FsbGJhY2spXG4gIH0sXG4gIGxlZnQ6IGZ1bmN0aW9uIChlbGVtZW50LCB0bywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gc2Nyb2xsKCdzY3JvbGxMZWZ0JywgZWxlbWVudCwgdG8sIG9wdGlvbnMsIGNhbGxiYWNrKVxuICB9XG59XG4iLCJpbXBvcnQgVXRpbHMgICBmcm9tICcuL2NvcmUvVXRpbHMnO1xyXG5pbXBvcnQgTW9uaXRvciBmcm9tICcuL3VzZXIvbW9uaXRvcic7XHJcblxyXG5pbXBvcnQgVmlkZW8gICBmcm9tIFwiLi92aWRlby92aWRlb1wiO1xyXG5pbXBvcnQgVmlldyAgICBmcm9tIFwiLi92aWV3L3ZpZXdcIjtcclxuaW1wb3J0IFN3aXRjaCAgZnJvbSBcIi4vc3dpdGNoL3N3aXRjaFwiO1xyXG5pbXBvcnQgTWVudSAgICBmcm9tIFwiLi9tZW51L21lbnVcIjtcclxuaW1wb3J0IEhyZWYgICAgZnJvbSBcIi4vaHJlZi9ocmVmXCI7XHJcbmltcG9ydCBQcm9jZWVkIGZyb20gXCIuL3Byb2NlZWQvcHJvY2VlZFwiO1xyXG5pbXBvcnQgVGV4dCAgICBmcm9tIFwiLi90ZXh0L3RleHRcIjtcclxuaW1wb3J0IE1ldGEgICAgZnJvbSBcIi4vdGV4dC9tZXRhXCI7XHJcbmltcG9ydCBNYWlsICAgIGZyb20gXCIuL21haWwvbWFpbFwiO1xyXG5cclxuLy9TbWFsbCBjb21wb25lbnRzXHJcbmltcG9ydCBGdWxsU2NyZWVuICAgZnJvbSBcIi4vY29udHJvbHMvZnVsbHNjcmVlblwiO1xyXG5pbXBvcnQgT3BlbiAgICAgICAgIGZyb20gXCIuL2NvbnRyb2xzL29wZW5cIjtcclxuaW1wb3J0IFBsYXkgICAgICAgICBmcm9tIFwiLi9jb250cm9scy9wbGF5XCI7XHJcbmltcG9ydCBTb3VuZCAgICAgICAgZnJvbSBcIi4vY29udHJvbHMvc291bmRcIjtcclxuaW1wb3J0IFNvY2lhbCAgICAgICBmcm9tIFwiLi9jb250cm9scy9zb2NpYWxcIjtcclxuXHJcbmNvbnN0IHNlbGVjdG9ycyA9IHtcclxuICAgIFwiYm9keVwiOiBNZXRhLFxyXG4gICAgXCIjbWFpblwiOiAgIFZpZGVvLFxyXG4gICAgXCJtZW51XCI6ICAgIE1lbnUsXHJcbiAgICBcIi5zd2l0Y2hcIjogU3dpdGNoLFxyXG4gICAgXCIuc3Vic2NyaWJlLWZvcm1cIjogTWFpbCxcclxuXHJcbiAgICBcIltkYXRhLXZpZXddXCI6IFZpZXcsXHJcbiAgICBcIltkYXRhLWhyZWZdXCI6IEhyZWYsXHJcbiAgICBcIltkYXRhLXRleHRdXCI6IFRleHQsXHJcbiAgICBcIltkYXRhLXBsYXldXCI6IFBsYXksXHJcbiAgICBcIltkYXRhLW9wZW5dXCI6IE9wZW4sXHJcbiAgICBcIltkYXRhLXNvdW5kXVwiOiBTb3VuZCxcclxuICAgIFwiW2RhdGEtc29jaWFsXVwiOiBTb2NpYWwsXHJcbiAgICBcIltkYXRhLXByb2NlZWRdXCI6IFByb2NlZWQsXHJcbiAgICBcIltkYXRhLWZ1bGxzY3JlZW5dXCI6IEZ1bGxTY3JlZW5cclxufTtcclxuXHJcbmZ1bmN0aW9uIGJvb3RzdHJhcCgpIHtcclxuICAgIFV0aWxzLnBvbHlmaWxsKCk7XHJcblxyXG4gICAgaWYoVXRpbHMuaW9zKCkpIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnaXMtaW9zJyk7XHJcblxyXG4gICAgZm9yKGNvbnN0IHNlbGVjdG9yIGluIHNlbGVjdG9ycykge1xyXG4gICAgICAgIGlmKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKSB7XHJcbiAgICAgICAgICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG5cclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBzZWxlY3RvcnNbc2VsZWN0b3JdKGVsZW1lbnRzW2ldKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2goZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGJvb3RzdHJhcCwgZmFsc2UpOyIsImltcG9ydCBVdGlscyAgICAgICAgZnJvbSAnLi4vY29yZS9VdGlscyc7XHJcbmltcG9ydCBEaXNwYXRjaGVyICAgZnJvbSAnLi4vY29yZS9EaXNwYXRjaGVyJztcclxuXHJcbmltcG9ydCB7IElTX01PQklMRSB9IGZyb20gJy4uL3V0aWxzL2Jyb3dzZXInO1xyXG5cclxuY29uc3QgU291bmQgPSBjcmVhdGVqcy5Tb3VuZDtcclxuY29uc3QgVHdlZW4gPSBjcmVhdGVqcy5Ud2VlbjtcclxuY29uc3QgRWFzZSAgPSBjcmVhdGVqcy5FYXNlO1xyXG5cclxuY29uc3QgQ0FSRElOQVVYICA9IFtcIk5PUlRIXCIsIFwiRUFTVFwiLCBcIldFU1RcIiwgXCJTT1VUSFwiXTtcclxuY29uc3QgRElGRl9MSU1JVCA9IC4zO1xyXG5cclxuY2xhc3MgU291bmRNYW5hZ2VyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnZvbHVtZSAgICAgPSAuODtcclxuICAgICAgICB0aGlzLmZpcnN0TG9hZCAgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubG9hZEluZGV4ICA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuc291bmRzID0ge1xyXG4gICAgICAgICAgICBtYW5pZmVzdDogW1xyXG4gICAgICAgICAgICAgICAgeyBpZDogXCJOT1JUSFwiLCAgc3JjOiBcImh0dHA6Ly9jZG4ubGVzY2FyZGluYXV4LmNvbS9hdWRpby9ub3J0aF9kaXJlY3QubXAzXCIgfSxcclxuICAgICAgICAgICAgICAgIHsgaWQ6IFwiRUFTVFwiLCAgICBzcmM6IFwiaHR0cDovL2Nkbi5sZXNjYXJkaW5hdXguY29tL2F1ZGlvL2Vhc3RfZGlyZWN0Lm1wM1wiIH0sXHJcbiAgICAgICAgICAgICAgICB7IGlkOiBcIldFU1RcIiwgICBzcmM6IFwiaHR0cDovL2Nkbi5sZXNjYXJkaW5hdXguY29tL2F1ZGlvL3dlc3RfZGlyZWN0Lm1wM1wiIH0sXHJcbiAgICAgICAgICAgICAgICB7IGlkOiBcIlNPVVRIXCIsICBzcmM6IFwiaHR0cDovL2Nkbi5sZXNjYXJkaW5hdXguY29tL2F1ZGlvL3NvdXRoX2RpcmVjdC5tcDNcIiB9LFxyXG4gICAgICAgICAgICAgICAgeyBpZDogXCJOT1JUSF9CQUNLXCIsICBzcmM6IFwiaHR0cDovL2Nkbi5sZXNjYXJkaW5hdXguY29tL2F1ZGlvL25vcnRoX211c2ljLm1wM1wiIH0sXHJcbiAgICAgICAgICAgICAgICB7IGlkOiBcIkVBU1RfQkFDS1wiLCAgICBzcmM6IFwiaHR0cDovL2Nkbi5sZXNjYXJkaW5hdXguY29tL2F1ZGlvL2Vhc3RfbXVzaWMubXAzXCIgfSxcclxuICAgICAgICAgICAgICAgIHsgaWQ6IFwiV0VTVF9CQUNLXCIsICAgc3JjOiBcImh0dHA6Ly9jZG4ubGVzY2FyZGluYXV4LmNvbS9hdWRpby93ZXN0X211c2ljLm1wM1wiIH0sXHJcbiAgICAgICAgICAgICAgICB7IGlkOiBcIlNPVVRIX0JBQ0tcIiwgIHNyYzogXCJodHRwOi8vY2RuLmxlc2NhcmRpbmF1eC5jb20vYXVkaW8vc291dGhfbXVzaWMubXAzXCIgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYoVXRpbHMuaW9zKCkgfHwgVXRpbHMubW9iaWxlKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZHMgPSB7XHJcbiAgICAgICAgICAgICAgICBtYW5pZmVzdDogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgaWQ6IFwiTk9SVEhcIiwgIHNyYzogXCJodHRwOi8vY2RuLmxlc2NhcmRpbmF1eC5jb20vYXVkaW8vbW9iaWxlL25vcnRoX2RpcmVjdC5tcDNcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHsgaWQ6IFwiRUFTVFwiLCAgICBzcmM6IFwiaHR0cDovL2Nkbi5sZXNjYXJkaW5hdXguY29tL2F1ZGlvL21vYmlsZS9lYXN0X2RpcmVjdC5tcDNcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHsgaWQ6IFwiV0VTVFwiLCAgIHNyYzogXCJodHRwOi8vY2RuLmxlc2NhcmRpbmF1eC5jb20vYXVkaW8vbW9iaWxlL3dlc3RfZGlyZWN0Lm1wM1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgeyBpZDogXCJTT1VUSFwiLCAgc3JjOiBcImh0dHA6Ly9jZG4ubGVzY2FyZGluYXV4LmNvbS9hdWRpby9tb2JpbGUvc291dGhfZGlyZWN0Lm1wM1wiIH1cclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5zdGFuY2VzID0gW107XHJcblxyXG4gICAgICAgIFNvdW5kLnZvbHVtZSA9IDE7XHJcblxyXG4gICAgICAgIC8vcHJlcGFyZSB0aGUgYXJyYXkgb2YgaW5zdGFuY2VzXHJcbiAgICAgICAgQ0FSRElOQVVYLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB0aGlzLmluc3RhbmNlc1tpbmRleF0gPSBbXSk7XHJcblxyXG4gICAgICAgIERpc3BhdGNoZXIub24oXCJzb3VuZDp2b2x1bWVcIiwgdGhpcy5oYW5kbGVWb2x1bWVDaGFuZ2UuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgRGlzcGF0Y2hlci5vbihcInNvdW5kOm11dGVcIiwgICB0aGlzLm11dGVBbGwuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgRGlzcGF0Y2hlci5vbihcInNvdW5kOnVubXV0ZVwiLCB0aGlzLnVubXV0ZUFsbC5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcmVsb2FkKCkgeyAvLyBQUkVQQVJFIEVMRU1FTlRTXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgaWYoVXRpbHMuc2FmYXJpKCkpIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJlbG9hZEFsbChyZXNvbHZlLCByZWplY3QpO1xyXG4gICAgICAgICAgICAgICAgfSwgMTUwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByZWxvYWRBbGwocmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByZWxvYWRBbGwocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICAgICAgY29uc3QgcXVldWUgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgcXVldWUuaW5zdGFsbFBsdWdpbihTb3VuZCk7XHJcblxyXG4gICAgICAgIGlmKFV0aWxzLmlvcygpIHx8IFV0aWxzLm1vYmlsZSgpKSBxdWV1ZS5zZXRNYXhDb25uZWN0aW9ucygxKTtcclxuICAgICAgICBlbHNlIHF1ZXVlLnNldE1heENvbm5lY3Rpb25zKDQpO1xyXG5cclxuICAgICAgICBxdWV1ZS5vbihcImZpbGVsb2FkXCIsICh0YXJnZXQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkSW5kZXgrKztcclxuICAgICAgICAgICAgRGlzcGF0Y2hlci5lbWl0KFwic291bmQ6ZGVjb2RlZFwiLCB7IHByb2dyZXNzOiB0aGlzLmxvYWRJbmRleCAvIHRoaXMuc291bmRzLm1hbmlmZXN0Lmxlbmd0aCB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmZpcnN0TG9hZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbmRUaW1lICAgID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGltZVRvTG9hZCA9IHRoaXMuZW5kVGltZSAtIHRoaXMuc3RhcnRUaW1lO1xyXG5cclxuICAgICAgICAgICAgRGlzcGF0Y2hlci5lbWl0KFwic291bmQ6YmFzZVZvbHVtZVwiLCB0aGlzLnZvbHVtZSk7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpcnN0IGF1ZGlvIGZpbGUgbG9hZFRpbWUgOiBcIiArIHRoaXMudGltZVRvTG9hZCAvIDEwMDApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5maXJzdExvYWQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcXVldWUub24oXCJwcm9ncmVzc1wiLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICBEaXNwYXRjaGVyLmVtaXQoXCJzb3VuZDpwcm9ncmVzc1wiLCB7IHByb2dyZXNzOiBkYXRhLnByb2dyZXNzIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgRGlzcGF0Y2hlci5lbWl0KFwic3BlZWRcIiwgcXVldWUucHJvZ3Jlc3MpO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcblxyXG4gICAgICAgIHF1ZXVlLm9uKFwiY29tcGxldGVcIiwgcmVzb2x2ZSk7XHJcbiAgICAgICAgcXVldWUub24oXCJlcnJvclwiLCByZWplY3QpO1xyXG5cclxuICAgICAgICBxdWV1ZS5sb2FkTWFuaWZlc3QodGhpcy5zb3VuZHMubWFuaWZlc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmRzLm1hbmlmZXN0Lm1hcCgoZWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGluc3RhbmNlID0gU291bmQucGxheShlbGVtZW50LmlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS52b2x1bWUgPSB0aGlzLnZvbHVtZTsgLy9EZWZhdWx0IHZvbHVtZVxyXG5cclxuICAgICAgICAgICAgICAgIENBUkRJTkFVWC5mb3JFYWNoKChDQVJESU5BTCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZihlbGVtZW50LmlkLmluZGV4T2YoQ0FSRElOQUwpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VzW2luZGV4XS5wdXNoKGluc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVm9sdW1lQ2hhbmdlKGRhdGEpIHtcclxuICAgICAgICBsZXQgYWN0aXZlVmlkZW8gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInZpZGVvOmFjdGl2ZVwiKTtcclxuXHJcbiAgICAgICAgdGhpcy52b2x1bWUgPSBkYXRhLnZvbHVtZTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnN0YW5jZXMuZm9yRWFjaCgoYXVkaW9UcmFja3MsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGFjdGl2ZVZpZGVvICYmIENBUkRJTkFVWC5pbmRleE9mKGFjdGl2ZVZpZGVvKSA9PT0gaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIGF1ZGlvVHJhY2tzLmZvckVhY2goKGF1ZGlvVHJhY2spID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBUd2Vlbi5nZXQoYXVkaW9UcmFjaykudG8oeyB2b2x1bWU6IHRoaXMudm9sdW1lIH0sIDEwMCwgRWFzZS5saW5lYXIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZighYWN0aXZlVmlkZW8pIHtcclxuICAgICAgICAgICAgICAgIGF1ZGlvVHJhY2tzLmZvckVhY2goKGF1ZGlvVHJhY2spID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBUd2Vlbi5nZXQoYXVkaW9UcmFjaykudG8oeyB2b2x1bWU6IHRoaXMudm9sdW1lIH0sIDEwMCwgRWFzZS5saW5lYXIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBtdXRlKGF1ZGlvVHJhY2tzKSB7XHJcbiAgICAgICAgaWYoIWlzTmFOKGF1ZGlvVHJhY2tzKSkgYXVkaW9UcmFja3MgPSB0aGlzLmluc3RhbmNlc1thdWRpb1RyYWNrc107XHJcblxyXG4gICAgICAgIHRoaXMuYWx0ZXJuYXRlRmFkZShhdWRpb1RyYWNrcywgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgbXV0ZUFsbChvcHRpb25zID0ge30pIHtcclxuICAgICAgICBpZihvcHRpb25zICYmIG9wdGlvbnMuZm9yY2UpIHRoaXMuc3RheU11dGUgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmluc3RhbmNlcy5mb3JFYWNoKChhdWRpb1RyYWNrcywgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubXV0ZShhdWRpb1RyYWNrcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbXV0ZUJhY2tncm91bmQoKSB7XHJcbiAgICAgICAgdGhpcy5pbnN0YW5jZXMuZm9yRWFjaCgoYXVkaW9UcmFja3MpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tdXRlKGF1ZGlvVHJhY2tzLmZpbHRlcigoaXRlbSkgPT4gKH5pdGVtLnNyYy5pbmRleE9mKFwiemljXCIpIHx8IH5pdGVtLnNyYy5pbmRleE9mKFwibXVzaWNcIikpKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdW5tdXRlKGF1ZGlvVHJhY2tzKSB7XHJcbiAgICAgICAgaWYodGhpcy5zdGF5TXV0ZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZighaXNOYU4oYXVkaW9UcmFja3MpKSBhdWRpb1RyYWNrcyA9IHRoaXMuaW5zdGFuY2VzW2F1ZGlvVHJhY2tzXTtcclxuXHJcbiAgICAgICAgbGV0IGFjdGl2ZVZpZGVvID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ2aWRlbzphY3RpdmVcIik7XHJcblxyXG4gICAgICAgIC8vTm8gb3RoZXIgc291bmRzIG9uIHpvb20gbW9kZVxyXG4gICAgICAgIGlmKGFjdGl2ZVZpZGVvKSB7XHJcbiAgICAgICAgICAgIGF1ZGlvVHJhY2tzID0gYXVkaW9UcmFja3MuZmlsdGVyKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gfml0ZW0uc3JjLmluZGV4T2YoYWN0aXZlVmlkZW8udG9Mb3dlckNhc2UoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9ObyBiYWNrZ3JvdW5kIG9uIHNwbGl0IHNjcmVlblxyXG4gICAgICAgIGlmKCFhY3RpdmVWaWRlbyAmJiB0aGlzLmlzT3V0ICYmICF0aGlzLmluSW50cm8pIHtcclxuICAgICAgICAgICAgYXVkaW9UcmFja3MgPSBhdWRpb1RyYWNrcy5maWx0ZXIoKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLnNyYy5pbmRleE9mKFwibXVzaWNcIikgPT09IC0xO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWx0ZXJuYXRlRmFkZShhdWRpb1RyYWNrcywgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHVubXV0ZUFsbChvcHRpb25zKSB7XHJcbiAgICAgICAgaWYob3B0aW9ucyAmJiBvcHRpb25zLmZvcmNlKSBkZWxldGUgdGhpcy5zdGF5TXV0ZTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5zdGF5TXV0ZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgYWN0aXZlVmlkZW8gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInZpZGVvOmFjdGl2ZVwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnN0YW5jZXMuZm9yRWFjaCgoYXVkaW9UcmFja3MsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGlmKCFhY3RpdmVWaWRlbyB8fCAoYWN0aXZlVmlkZW8gJiYgQ0FSRElOQVVYLmluZGV4T2YoYWN0aXZlVmlkZW8pID09PSBpbmRleCkgfHwgdGhpcy5jYW5NdXRlID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVubXV0ZShhdWRpb1RyYWNrcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwYXVzZShhdWRpb1RyYWNrcykge1xyXG4gICAgICAgIGlmKCFpc05hTihhdWRpb1RyYWNrcykpIGF1ZGlvVHJhY2tzID0gdGhpcy5pbnN0YW5jZXNbYXVkaW9UcmFja3NdO1xyXG5cclxuICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKChhdWRpb1RyYWNrKSA9PiB7XHJcbiAgICAgICAgICAgIGF1ZGlvVHJhY2sucGF1c2VkID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwYXVzZUFsbCgpIHtcclxuICAgICAgICB0aGlzLmluc3RhbmNlcy5mb3JFYWNoKChhdWRpb1RyYWNrcywgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGF1c2UoYXVkaW9UcmFja3MpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc3VtZShhdWRpb1RyYWNrcywgdGltZSkge1xyXG4gICAgICAgIGlmKCFpc05hTihhdWRpb1RyYWNrcykpIGF1ZGlvVHJhY2tzID0gdGhpcy5pbnN0YW5jZXNbYXVkaW9UcmFja3NdO1xyXG5cclxuICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKChhdWRpb1RyYWNrKSA9PiB7XHJcbiAgICAgICAgICAgIGF1ZGlvVHJhY2sucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdW1lQWxsKCkge1xyXG4gICAgICAgIHRoaXMuaW5zdGFuY2VzLmZvckVhY2goKGF1ZGlvVHJhY2tzLCBpZHgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZXN1bWUoYXVkaW9UcmFja3MpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXkoYXVkaW9UcmFja3MpIHtcclxuICAgICAgICBpZighaXNOYU4oYXVkaW9UcmFja3MpKSBhdWRpb1RyYWNrcyA9IHRoaXMuaW5zdGFuY2VzW2F1ZGlvVHJhY2tzXTtcclxuXHJcbiAgICAgICAgYXVkaW9UcmFja3MuZm9yRWFjaCgoYXVkaW9UcmFjaykgPT4ge1xyXG4gICAgICAgICAgICBhdWRpb1RyYWNrLnBsYXkoe1xyXG4gICAgICAgICAgICAgICAgdm9sdW1lOiB0aGlzLnZvbHVtZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwbGF5QWxsKCkge1xyXG4gICAgICAgIHRoaXMuaW5zdGFuY2VzLmZvckVhY2goKGF1ZGlvVHJhY2tzLCBpZHgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5KGF1ZGlvVHJhY2tzKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhbHRlcm5hdGVGYWRlKGF1ZGlvVHJhY2tzLCBwYXVzZSkge1xyXG4gICAgICAgIC8vIGlmKCFhdWRpb1RyYWNrcykgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZighcGF1c2UpIHtcclxuICAgICAgICAgICAgYXVkaW9UcmFja3MuZm9yRWFjaCgoYXVkaW9UcmFjaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYoVHdlZW4uaGFzQWN0aXZlVHdlZW5zKGF1ZGlvVHJhY2spKSBUd2Vlbi5yZW1vdmVUd2VlbnMoYXVkaW9UcmFjayk7XHJcblxyXG4gICAgICAgICAgICAgICAgVHdlZW4uZ2V0KGF1ZGlvVHJhY2spLnRvKHsgdm9sdW1lOiB0aGlzLnZvbHVtZSB9LCAzMDAsIEVhc2UubGluZWFyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKChhdWRpb1RyYWNrKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZihUd2Vlbi5oYXNBY3RpdmVUd2VlbnMoYXVkaW9UcmFjaykpIFR3ZWVuLnJlbW92ZVR3ZWVucyhhdWRpb1RyYWNrKTtcclxuXHJcbiAgICAgICAgICAgICAgICBUd2Vlbi5nZXQoYXVkaW9UcmFjaykudG8oeyB2b2x1bWU6IDAgfSwgMzAwLCBFYXNlLmxpbmVhcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjdXJyZW50VGltZSh0aW1lKSB7XHJcbiAgICAgICAgaWYodGltZSAhPSB1bmRlZmluZWQgJiYgdGltZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VzLmZvckVhY2goKGF1ZGlvVHJhY2tzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKChhdWRpb1RyYWNrKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXVkaW9UcmFjay5wb3NpdGlvbiA9IHRpbWUgKiAxMDAwO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VzWzBdWzBdLnBvc2l0aW9uIC8gMTAwMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZHVyYXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zdGFuY2VzWzBdWzBdLmR1cmF0aW9uIC8gMTAwMDtcclxuICAgIH1cclxuXHJcbiAgICBzeW5jKHRpbWUpIHtcclxuICAgICAgICBsZXQgZGlmZiA9IHRoaXMuY3VycmVudFRpbWUoKSAtIHRpbWU7XHJcblxyXG4gICAgICAgIGlmKFV0aWxzLnNhZmFyaSgpICYmICFJU19NT0JJTEUpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoZGlmZiA8IC1ESUZGX0xJTUlUIHx8IGRpZmYgPiBESUZGX0xJTUlUKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VzLmZvckVhY2goKGF1ZGlvVHJhY2tzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKChhdWRpb1RyYWNrKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgVHdlZW4uZ2V0KGF1ZGlvVHJhY2spLnRvKHsgdm9sdW1lOiAwIH0sIDE1MCwgRWFzZS5saW5lYXIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZSh0aW1lKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMudGltZXIpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMudW5tdXRlQWxsKCk7XHJcbiAgICAgICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldFN0YXRlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlcy5tYXAoKGF1ZGlvVHJhY2tzLCBpZHgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHJlcyA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IENBUkRJTkFVWFtpZHhdXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKChhdWRpb1RyYWNrKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZigofmF1ZGlvVHJhY2suc3JjLmluZGV4T2YoXCJ6aWNcIikgfHwgfmF1ZGlvVHJhY2suc3JjLmluZGV4T2YoXCJtdXNpY1wiKSkpIHJlc1tcIm11c2ljXCJdID0gYXVkaW9UcmFjay52b2x1bWU7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHJlc1tcInZvaWNlXCJdID0gYXVkaW9UcmFjay52b2x1bWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU291bmRNYW5hZ2VyOyIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gXCIuLi9jb3JlL0Rpc3BhdGNoZXJcIjtcclxuaW1wb3J0IFV0aWxzICAgICAgZnJvbSBcIi4uL2NvcmUvVXRpbHNcIjtcclxuXHJcbmNvbnN0IENSRURJVFNfVElNRSA9IDEyNjtcclxuXHJcbmNsYXNzIENvbnRyb2xzIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih2aWRlbykge1xyXG4gICAgICAgIHRoaXMudmlkZW8gPSB2aWRlbztcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50ICAgICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbnRyb2xzJyk7XHJcbiAgICAgICAgdGhpcy50aW1lV3JhcHBlciAgID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hY3Rpb24tdGltZScpO1xyXG4gICAgICAgIHRoaXMudGltZVBhc3NlZCAgICA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcudGltZS1wYXNzZWQnKTtcclxuICAgICAgICB0aGlzLnRpbWVQcmVsb2FkICAgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLnRpbWUtcHJlbG9hZCcpO1xyXG4gICAgICAgIHRoaXMudGltZVJlbWFpbmluZyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcudGltZS1yZW1haW5pbmcnKTtcclxuICAgICAgICB0aGlzLnRpbWVUb3RhbCAgICAgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLnRpbWUtdG90YWwnKTtcclxuXHJcbiAgICAgICAgdGhpcy5sYXN0UGVyY2VudCAgID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jaGFwdGVycyAgICAgID0gWy4uLnRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuaXRlbS1jaGFwdGVyJyldO1xyXG5cclxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dGFjaEV2ZW50cygpIHtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLmhhbmRsZU92ZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG5cclxuICAgICAgICB0aGlzLnZpZGVvLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZGVkZGF0YScsIHRoaXMuZGF0YUxvYWRlZC5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy52aWRlby5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RpbWV1cGRhdGUnLCAgdGhpcy5jbG9ja1VwZGF0ZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy52aWRlby5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgdGhpcy5oYW5kbGVQcm9ncmVzcy5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50aW1lV3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLmRvd25IYW5kbGUuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgICAgIHRoaXMudGltZVdyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5tb3ZlSGFuZGxlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgICAgICB0aGlzLnRpbWVXcmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAgIHRoaXMudXBIYW5kbGUuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG5cclxuICAgICAgICB0aGlzLnRpbWVXcmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLmRvd25IYW5kbGUuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgICAgIHRoaXMudGltZVdyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5tb3ZlSGFuZGxlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgICAgICB0aGlzLnRpbWVXcmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgICB0aGlzLnVwSGFuZGxlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuXHJcbiAgICAgICAgaWYoVXRpbHMubW9iaWxlKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5oYW5kbGVNb2JpbGVPdmVyLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgdGhpcy5oYW5kbGVNb2JpbGVPdXQuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgRGlzcGF0Y2hlci5vbihcInZpZGVvOnN0YXJ0XCIsIHRoaXMuc3RhcnRIYW5kbGUuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlT3ZlcihldmVudCkge1xyXG4gICAgICAgIGNvbnN0IGhlaWdodCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgY29uc3QgeSAgICAgID0gZXZlbnQucGFnZVk7XHJcblxyXG4gICAgICAgIGNvbnN0IHBlcmNlbnQgPSB5IC8gaGVpZ2h0O1xyXG5cclxuICAgICAgICBpZihwZXJjZW50ID49IC44KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1ob3ZlcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHBlcmNlbnQgPCAuOCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtaG92ZXInKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlTW9iaWxlT3ZlcigpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgd2luZG93LmlzT3BlbiA9IHRydWU7XHJcbiAgICAgICAgfSwgMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVNb2JpbGVPdXQoZXZlbnQpIHtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSk7XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmVsZW1lbnQuY29udGFpbnModGFyZ2V0KSAmJiB0YXJnZXQgIT09IHRoaXMuZWxlbWVudCkge1xyXG4gICAgICAgICAgICB3aW5kb3cuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vb25seSBmb3IgdHJhY2tpbmcgd2l0aCBHQVxyXG4gICAgaGFuZGxlUHJvZ3Jlc3MoKSB7XHJcbiAgICAgICAgaWYoIXdpbmRvdy5nYSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBwZXJjZW50ID0gMTAwICogKHRoaXMudmlkZW8uZWxlbWVudC5jdXJyZW50VGltZSAvICh0aGlzLnZpZGVvLmVsZW1lbnQuZHVyYXRpb24gLSBDUkVESVRTX1RJTUUpKTtcclxuXHJcbiAgICAgICAgaWYoaXNOYU4ocGVyY2VudCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgY2xvc2VyUGVyY2VudCA9IE1hdGguZmxvb3IocGVyY2VudCAvIDEwKSAqIDEwO1xyXG5cclxuICAgICAgICBpZihjbG9zZXJQZXJjZW50ID49ICh0aGlzLmxhc3RQZXJjZW50ICsgMTApKSB7XHJcbiAgICAgICAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgJ3ZpZGVvJywgJ3Byb2dyZXNzaW9uIGxlY3R1cmUnLCBgJHtjbG9zZXJQZXJjZW50fSVgKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGFzdFBlcmNlbnQgPSBjbG9zZXJQZXJjZW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGFydEhhbmRsZSgpIHtcclxuICAgICAgICAvL0lmIGFscmVhZHkgaG92ZXJlZFxyXG4gICAgICAgIC8vaWYoZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsZW1lbnQpLmdldFByb3BlcnR5VmFsdWUoXCJvcGFjaXR5XCIpID09IFwiMVwiKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdxdWljay1zaG93Jyk7XHJcbiAgICAgICAgd2luZG93LmlzT3BlbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgncXVpY2stc2hvdycpO1xyXG4gICAgICAgICAgICB3aW5kb3cuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgfSwgNDAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgZGF0YUxvYWRlZCgpIHtcclxuICAgICAgICB0aGlzLnRpbWVUb3RhbC5pbm5lckhUTUwgPSB0aGlzLmZvcm1hdFRpbWUodGhpcy52aWRlby5lbGVtZW50LmR1cmF0aW9uIC0gQ1JFRElUU19USU1FKTtcclxuICAgIH1cclxuXHJcbiAgICBjbG9ja1VwZGF0ZSgpIHtcclxuICAgICAgICBsZXQgcGVyID0gdGhpcy52aWRlby5lbGVtZW50LmN1cnJlbnRUaW1lIC8gKHRoaXMudmlkZW8uZWxlbWVudC5kdXJhdGlvbiAtIENSRURJVFNfVElNRSk7XHJcblxyXG4gICAgICAgIHRoaXMudGltZVJlbWFpbmluZy5pbm5lckhUTUwgPSB0aGlzLmZvcm1hdFRpbWUodGhpcy52aWRlby5lbGVtZW50LmN1cnJlbnRUaW1lKTtcclxuXHJcbiAgICAgICAgdGhpcy5jaGFwdGVycy5mb3JFYWNoKChjaGFwdGVyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudmlkZW8uZWxlbWVudC5jdXJyZW50VGltZSA+PSBjaGFwdGVyLnRpbWVjb2RlKVxyXG4gICAgICAgICAgICAgICAgY2hhcHRlci5jbGFzc0xpc3QuYWRkKCdpcy1wYXNzZWQnKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgY2hhcHRlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wYXNzZWQnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXIocGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlSGFuZGxlKGV2ZW50KSB7XHJcbiAgICAgICAgaWYoIXRoaXMuaXNEb3duKSByZXR1cm47XHJcblxyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlLmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBtb3ZlKCkge1xyXG4gICAgICAgICAgICBsZXQgd2lkdGggPSB0aGlzLnRpbWVXcmFwcGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG5cclxuICAgICAgICAgICAgbGV0IHggICAgPSAoZXZlbnQudHlwZSA9PT0gXCJ0b3VjaG1vdmVcIiAmJiBldmVudC50b3VjaGVzWzBdID8gZXZlbnQudG91Y2hlc1swXS5zY3JlZW5YIDogZXZlbnQucGFnZVgpIC0gMTU7XHJcbiAgICAgICAgICAgIGxldCBwZXIgID0geCAvIHdpZHRoO1xyXG5cclxuICAgICAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gXCJ0b3VjaG1vdmVcIikgdGhpcy5wcmV2aW91c1ggPSB4O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZW5kZXIocGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bkhhbmRsZSgpIHtcclxuICAgICAgICBpZihVdGlscy5tb2JpbGUoKSAmJiAhd2luZG93LmlzT3BlbikgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdXBIYW5kbGUoZXZlbnQpIHtcclxuICAgICAgICBpZihVdGlscy5tb2JpbGUoKSAmJiAhd2luZG93LmlzT3BlbikgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgeCAgICAgPSAoZXZlbnQudHlwZSA9PT0gXCJ0b3VjaGVuZFwiICYmIHRoaXMucHJldmlvdXNYID8gdGhpcy5wcmV2aW91c1ggOiBldmVudC5wYWdlWCkgLSAxNTtcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLnRpbWVXcmFwcGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gICAgICAgIGxldCBwZXIgICA9IHggLyB3aWR0aDtcclxuICAgICAgICBsZXQgdGltZSAgPSAodGhpcy52aWRlby5lbGVtZW50LmR1cmF0aW9uIC0gQ1JFRElUU19USU1FKSAqIHBlcjtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuaXNNb3ZpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy52aWRlby5jdXJyZW50VGltZSh0aW1lLCB7IGZyb21Vc2VyOiB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXIocGVyKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKDApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnZpZGVvLnNvdW5kTWFuYWdlci5yZXN1bWVBbGwoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNNb3ZpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICBkZWxldGUgdGhpcy5wcmV2aW91c1g7XHJcbiAgICB9XHJcblxyXG4gICAgLy91cGRhdGUgdmlld1xyXG4gICAgcmVuZGVyKHBlcikge1xyXG4gICAgICAgIHRoaXMudGltZVBhc3NlZC5zdHlsZS53aWR0aCA9IGAkeyhwZXIgKiAxMDApfSVgO1xyXG4gICAgfVxyXG5cclxuICAgIGZvcm1hdFRpbWUodGltZSkge1xyXG4gICAgICAgIGxldCBob3VycyAgID0gTWF0aC5mbG9vcih0aW1lIC8gMzYwMCk7XHJcbiAgICAgICAgbGV0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKCh0aW1lIC0gKGhvdXJzICogMzYwMCkpIC8gNjApO1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gTWF0aC5mbG9vcih0aW1lIC0gKGhvdXJzICogMzYwMCkgLSAobWludXRlcyAqIDYwKSk7XHJcblxyXG4gICAgICAgIGlmIChtaW51dGVzIDwgMTApIG1pbnV0ZXMgPSBcIjBcIiArIG1pbnV0ZXM7XHJcbiAgICAgICAgaWYgKHNlY29uZHMgPCAxMCkgc2Vjb25kcyA9IFwiMFwiICsgc2Vjb25kcztcclxuXHJcbiAgICAgICAgcmV0dXJuIGAke21pbnV0ZXN9OiR7c2Vjb25kc31gO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29udHJvbHM7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgYmFlc3Qgb24gMDQvMDkvMjAxNi5cclxuICovXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi9jb3JlL1V0aWxzJztcclxuXHJcbmNsYXNzIEZ1bGxTY3JlZW4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgICAgICA9IGVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5pc0Z1bGxTY3JlZW4gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2hFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50b2dnbGVGdWxsU2NyZWVuLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICB0b2dnbGVGdWxsU2NyZWVuKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc0Z1bGxTY3JlZW4gJiYgIWRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50ICYmICAgIC8vIGFsdGVybmF0aXZlIHN0YW5kYXJkIG1ldGhvZFxyXG4gICAgICAgICAgICAhZG9jdW1lbnQubW96RnVsbFNjcmVlbkVsZW1lbnQgJiYgIWRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50ICYmICFkb2N1bWVudC5tc0Z1bGxzY3JlZW5FbGVtZW50KSB7ICAvLyBjdXJyZW50IHdvcmtpbmcgbWV0aG9kc1xyXG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuKSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubW96UmVxdWVzdEZ1bGxTY3JlZW4pIHtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tb3pSZXF1ZXN0RnVsbFNjcmVlbigpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbikge1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKEVsZW1lbnQuQUxMT1dfS0VZQk9BUkRfSU5QVVQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5tc1JlcXVlc3RGdWxsc2NyZWVuKSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubXNSZXF1ZXN0RnVsbHNjcmVlbigpOyAvLyBJRVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYoVXRpbHMuaW9zKCkpIHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAxKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdpcy1mdWxsc2NyZWVuJyk7XHJcblxyXG4gICAgICAgICAgICBpZihVdGlscy5zYWZhcmkoKSAmJiAhVXRpbHMuaW9zKCkpIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICAgICAgICAgIH0sIDUwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5pc0Z1bGxTY3JlZW4gPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5jYW5jZWxGdWxsU2NyZWVuKSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5jYW5jZWxGdWxsU2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQubW96Q2FuY2VsRnVsbFNjcmVlbikge1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQubW96Q2FuY2VsRnVsbFNjcmVlbigpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LndlYmtpdENhbmNlbEZ1bGxTY3JlZW4pIHtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LndlYmtpdENhbmNlbEZ1bGxTY3JlZW4oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubXNFeGl0RnVsbHNjcmVlbikge1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm1zRXhpdEZ1bGxzY3JlZW4oKTsgLy8gSUVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmKFV0aWxzLmllKCkpIHtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50Lm1zRXhpdEZ1bGxzY3JlZW4oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1mdWxsc2NyZWVuJyk7XHJcblxyXG4gICAgICAgICAgICBpZihVdGlscy5zYWZhcmkoKSAmJiAhVXRpbHMuaW9zKCkpIHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xyXG4gICAgICAgICAgICAgICAgfSwgNTApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzRnVsbFNjcmVlbiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZ1bGxTY3JlZW47IiwiaW1wb3J0IERpc3BhdGNoZXIgZnJvbSAnLi4vY29yZS9EaXNwYXRjaGVyJztcclxuXHJcbmNsYXNzIE9wZW4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgID0gZWxlbWVudDtcclxuICAgICAgICB0aGlzLnNlbGVjdG9yID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3BlbicpO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3IpO1xyXG5cclxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dGFjaEV2ZW50cygpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9wZW5IYW5kbGUuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW5IYW5kbGUoKSB7XHJcbiAgICAgICAgdGhpcy50YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuc2VsZWN0b3IgPT0gJ21lbnUnKSB7XHJcbiAgICAgICAgICAgIERpc3BhdGNoZXIuZW1pdChcInZpZGVvOmRvOnBhdXNlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE9wZW47IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgYmFlc3Qgb24gMDQvMDkvMjAxNi5cclxuICovXHJcbmltcG9ydCBEaXNwYXRjaGVyIGZyb20gXCIuLi9jb3JlL0Rpc3BhdGNoZXJcIjtcclxuaW1wb3J0IFV0aWxzICAgICAgZnJvbSBcIi4uL2NvcmUvVXRpbHNcIjtcclxuXHJcbmNsYXNzIFBsYXkge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG5cclxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dGFjaEV2ZW50cygpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIERpc3BhdGNoZXIub24oXCJ2aWRlbzpwbGF5XCIsICB0aGlzLnBsYXlIYW5kbGUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgRGlzcGF0Y2hlci5vbihcInZpZGVvOnBhdXNlXCIsIHRoaXMucGF1c2VIYW5kbGUuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdG9nZ2xlKCkge1xyXG4gICAgICAgIGlmKFV0aWxzLm1vYmlsZSgpICYmICF3aW5kb3cuaXNPcGVuKSByZXR1cm47XHJcblxyXG4gICAgICAgIERpc3BhdGNoZXIuZW1pdChcInZpZGVvOnRvZ2dsZVwiKTtcclxuICAgIH1cclxuXHJcbiAgICBwbGF5SGFuZGxlKCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wYXVzZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBwYXVzZUhhbmRsZSgpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcGF1c2VkJyk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQbGF5OyIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4uL2NvcmUvRGlzcGF0Y2hlcic7XHJcbmltcG9ydCBVdGlscyAgICAgIGZyb20gJy4uL2NvcmUvVXRpbHMnO1xyXG5cclxuY2xhc3MgU29jaWFsIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICB0aGlzLnR5cGUgICAgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1zb2NpYWwnKTtcclxuICAgICAgICB0aGlzLnVybCAgICAgPSAnJztcclxuXHJcbiAgICAgICAgdGhpcy5sYW5nICAgICAgID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oYGlucHV0Omxhbmd1YWdlYCkgfHwgJ2ZyJztcclxuICAgICAgICB0aGlzLmRpY3Rpb25hcnkgPSBudWxsO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyAgICA9ICdtZW51YmFyPW5vLHRvb2xiYXI9bm8scmVzaXphYmxlPXllcyxzY3JvbGxiYXJzPXllcyxoZWlnaHQ9MzAwLHdpZHRoPTYwMCc7XHJcblxyXG4gICAgICAgIGxldCBwYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuXHJcbiAgICAgICAgaWYocGF0aG5hbWUgJiYgKH5wYXRobmFtZS5pbmRleE9mKCcvZnInKSB8fCB+cGF0aG5hbWUuaW5kZXhPZignL2VuJykgfHwgfnBhdGhuYW1lLmluZGV4T2YoJy9qcCcpKSkge1xyXG4gICAgICAgICAgICBsZXQgbGFuZ0V4dHJhY3RvciA9IC9cXC8oZW58ZnJ8anApL2cuZXhlYyhwYXRobmFtZSk7XHJcbiAgICAgICAgICAgIHRoaXMubGFuZyAgICAgICAgID0gbGFuZ0V4dHJhY3RvclsxXSA/IGxhbmdFeHRyYWN0b3JbMV0gOiAofm5hdmlnYXRvci5sYW5ndWFnZS5pbmRleE9mKFwiLVwiKSA/IChuYXZpZ2F0b3IubGFuZ3VhZ2UubWF0Y2goL14oW2Etel0rKS0vKSlbMV0gOiBuYXZpZ2F0b3IubGFuZ3VhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYofm5hdmlnYXRvci5sYW5ndWFnZS5pbmRleE9mKFwiLVwiKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhbmdFeHRyYWN0b3IgPSBuYXZpZ2F0b3IubGFuZ3VhZ2UubWF0Y2goL14oW2Etel0rKS0vKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhbmcgPSBsYW5nRXh0cmFjdG9yWzFdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYW5nID0gbmF2aWdhdG9yLmxhbmd1YWdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dGFjaEV2ZW50cygpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcyksIGZhbHNlKTtcclxuXHJcbiAgICAgICAgRGlzcGF0Y2hlci5vbignZGljdGlvbmFyeScsIHRoaXMuaGFuZGxlRGljdGlvbmFyeS5iaW5kKHRoaXMpKTtcclxuICAgICAgICBEaXNwYXRjaGVyLm9uKGBpbnB1dDpsYW5ndWFnZWAsIHRoaXMuaGFuZGxlTGFuZ0NoYW5nZS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVDbGljaygpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnVybCk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5vcGVuKHRoaXMudXJsLCAnJywgdGhpcy5vcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVMYW5nQ2hhbmdlKHJlcykge1xyXG4gICAgICAgIHRoaXMubGFuZyA9IHJlcy52YWx1ZTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVEaWN0aW9uYXJ5KGRpYykge1xyXG4gICAgICAgIGlmKHRoaXMuZGljdGlvbmFyeSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBkaWMuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBpZihpdGVtLnZpZXdOYW1lID09IFwic29jaWFsXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGljdGlvbmFyeSA9IGl0ZW0udHJhbnNsYXRpb25zO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIGlmKCF0aGlzLmxhbmcgfHwgIXRoaXMuZGljdGlvbmFyeSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgdGV4dDtcclxuXHJcbiAgICAgICAgaWYoVXRpbHMuaWUoKSAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKGl0ZW0ubGFuZ3VhZ2UgPT09IHRoaXMubGFuZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgPSBpdGVtLnRleHRzW3RoaXMudHlwZV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGV4dCA9ICh0aGlzLmRpY3Rpb25hcnkuZmluZChpdGVtID0+IGl0ZW0ubGFuZ3VhZ2UgPT0gdGhpcy5sYW5nKSkudGV4dHNbdGhpcy50eXBlXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRleHQgPSBlbmNvZGVVUkkodGV4dC50cmltKCkpO1xyXG5cclxuICAgICAgICBpZih0aGlzLnR5cGUgPT0gJ3R3aXR0ZXInKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXJsID0gYGh0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9JHt0ZXh0fTtzb3VyY2U9d2ViY2xpZW50YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0aGlzLnR5cGUgPT0gJ2ZhY2Vib29rJykge1xyXG4gICAgICAgICAgICB0aGlzLnVybCA9IGBodHRwczovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyLnBocD91PSR7d2luZG93LmxvY2F0aW9uLmhyZWZ9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTb2NpYWw7IiwiaW1wb3J0IFV0aWxzIGZyb20gJy4uL2NvcmUvVXRpbHMnO1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZWQgYnkgYmFlc3Qgb24gMDQvMDkvMjAxNi5cclxuICovXHJcbmltcG9ydCBEaXNwYXRjaGVyIGZyb20gXCIuLi9jb3JlL0Rpc3BhdGNoZXJcIjtcclxuXHJcbmNvbnN0IENBUkRJTkFVWCA9IFtcIk5PUlRIXCIsIFwiRUFTVFwiLCBcIldFU1RcIiwgXCJTT1VUSFwiXTtcclxuXHJcbmNsYXNzIFNvdW5kQ29udHJvbGxlciB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCAgICA9IGVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5pY29uICAgICAgID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc291bmQtaWNvbicpO1xyXG4gICAgICAgIHRoaXMuY29udHJvbCAgICA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNvdW5kLWNvbnRyb2wnKTtcclxuICAgICAgICB0aGlzLmNvbnRyb2xsZXIgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zb3VuZC1jb250cm9sbGVyJyk7XHJcblxyXG4gICAgICAgIHRoaXMuaWNvblNpemVzICA9IHRoaXMuaWNvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zaXplcyA9IHRoaXMuY29udHJvbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICB0aGlzLndpZHRoID0gdGhpcy5zaXplcy53aWR0aDtcclxuICAgICAgICB0aGlzLm11dGUgID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXR0YWNoRXZlbnRzKCkge1xyXG4gICAgICAgIHRoaXMuaWNvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICAgICAgICB0aGlzLnRvZ2dsZVNvdW5kLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5kb3duSGFuZGxlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5tb3ZlSGFuZGxlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsICAgdGhpcy51cEhhbmRsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIERpc3BhdGNoZXIub24oXCJzb3VuZDpiYXNlVm9sdW1lXCIsIHRoaXMucmVuZGVyLmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZVNvdW5kKCkge1xyXG4gICAgICAgIC8vTXV0ZSBzb3VuZFxyXG4gICAgICAgIGlmKCF0aGlzLm11dGUpIHtcclxuICAgICAgICAgICAgRGlzcGF0Y2hlci5lbWl0KFwic291bmQ6bXV0ZVwiLCB7IGZvcmNlOiB0cnVlIH0pO1xyXG4gICAgICAgICAgICB0aGlzLmljb24uY2xhc3NMaXN0LmFkZCgnaXMtbXV0ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL1VuLW11dGUgc291bmRcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgRGlzcGF0Y2hlci5lbWl0KFwic291bmQ6dW5tdXRlXCIsIHsgZm9yY2U6IHRydWUgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuaWNvbi5jbGFzc0xpc3QucmVtb3ZlKCdpcy1tdXRlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm11dGUgPSAhdGhpcy5tdXRlO1xyXG4gICAgfVxyXG5cclxuICAgIGRvd25IYW5kbGUoKSB7XHJcbiAgICAgICAgaWYoVXRpbHMubW9iaWxlKCkgJiYgIXdpbmRvdy5pc09wZW4pIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVIYW5kbGUoZXZlbnQpIHtcclxuICAgICAgICBpZighdGhpcy5pc0Rvd24gfHwgKGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzb3VuZC1pY29uJykpKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCB4ICAgICAgID0gKGV2ZW50LnR5cGUgPT0gXCJ0b3VjaG1vdmVcIiAmJiBldmVudC50b3VjaGVzWzBdID8gZXZlbnQudG91Y2hlc1swXS5zY3JlZW5YIDogZXZlbnQucGFnZVgpIC0gdGhpcy5zaXplcy5sZWZ0O1xyXG4gICAgICAgIGxldCB2b2x1bWUgID0geCAvIHRoaXMud2lkdGg7XHJcblxyXG4gICAgICAgIGlmKHZvbHVtZSA+IDEpIHZvbHVtZSA9IDE7XHJcbiAgICAgICAgaWYodm9sdW1lIDwgMCkgdm9sdW1lID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXIodm9sdW1lKTtcclxuICAgIH1cclxuXHJcbiAgICB1cEhhbmRsZShldmVudCkge1xyXG4gICAgICAgIGlmKGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzb3VuZC1pY29uJykpIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IHggICAgICA9IChldmVudC50eXBlID09IFwidG91Y2htb3ZlXCIgJiYgZXZlbnQudG91Y2hlc1swXSA/IGV2ZW50LnRvdWNoZXNbMF0uc2NyZWVuWCA6IGV2ZW50LnBhZ2VYKSAtIHRoaXMuc2l6ZXMubGVmdDtcclxuICAgICAgICBsZXQgdm9sdW1lID0geCAvIHRoaXMud2lkdGg7XHJcblxyXG4gICAgICAgIGlmKHZvbHVtZSA+IDEpIHZvbHVtZSA9IDE7XHJcbiAgICAgICAgaWYodm9sdW1lIDwgMCkgdm9sdW1lID0gMDtcclxuXHJcbiAgICAgICAgRGlzcGF0Y2hlci5lbWl0KCdzb3VuZDp2b2x1bWUnLCB7IHZvbHVtZSB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXIodm9sdW1lKTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIodm9sdW1lKSB7XHJcbiAgICAgICAgaWYodm9sdW1lID09IDApXHJcbiAgICAgICAgICAgIHRoaXMuaWNvbi5jbGFzc0xpc3QuYWRkKCdpcy1tdXRlJyk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aGlzLmljb24uY2xhc3NMaXN0LnJlbW92ZSgnaXMtbXV0ZScpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRyb2xsZXIuc3R5bGUud2lkdGggPSBgJHsoMTAwICogdm9sdW1lKX0lYDtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNvdW5kQ29udHJvbGxlcjsiLCJpbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gXCIuLi9jb3JlL2V2ZW50RW1pdHRlclwiO1xyXG5cclxuY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IG5ldyBEaXNwYXRjaGVyKCk7IiwidmFyIFV0aWxzID0ge1xyXG5cclxuICAgIGllOiAoKSA9PiB7XHJcbiAgICAgICAgdmFyIHVhID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQ7XHJcblxyXG4gICAgICAgIC8vIElFIDEwXHJcbiAgICAgICAgLy8gdWEgPSAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjI7IFRyaWRlbnQvNi4wKSc7XHJcblxyXG4gICAgICAgIC8vIElFIDExXHJcbiAgICAgICAgLy8gdWEgPSAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgNi4zOyBUcmlkZW50LzcuMDsgcnY6MTEuMCkgbGlrZSBHZWNrbyc7XHJcblxyXG4gICAgICAgIC8vIEVkZ2UgMTIgKFNwYXJ0YW4pXHJcbiAgICAgICAgLy8gdWEgPSAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV09XNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8zOS4wLjIxNzEuNzEgU2FmYXJpLzUzNy4zNiBFZGdlLzEyLjAnO1xyXG5cclxuICAgICAgICAvLyBFZGdlIDEzXHJcbiAgICAgICAgLy8gdWEgPSAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQ2LjAuMjQ4Ni4wIFNhZmFyaS81MzcuMzYgRWRnZS8xMy4xMDU4Nic7XHJcblxyXG4gICAgICAgIHZhciBtc2llID0gdWEuaW5kZXhPZignTVNJRSAnKTtcclxuICAgICAgICBpZiAobXNpZSA+IDApIHtcclxuICAgICAgICAgICAgLy8gSUUgMTAgb3Igb2xkZXIgPT4gcmV0dXJuIHZlcnNpb24gbnVtYmVyXHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh1YS5zdWJzdHJpbmcobXNpZSArIDUsIHVhLmluZGV4T2YoJy4nLCBtc2llKSksIDEwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB0cmlkZW50ID0gdWEuaW5kZXhPZignVHJpZGVudC8nKTtcclxuICAgICAgICBpZiAodHJpZGVudCA+IDApIHtcclxuICAgICAgICAgICAgLy8gSUUgMTEgPT4gcmV0dXJuIHZlcnNpb24gbnVtYmVyXHJcbiAgICAgICAgICAgIHZhciBydiA9IHVhLmluZGV4T2YoJ3J2OicpO1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQodWEuc3Vic3RyaW5nKHJ2ICsgMywgdWEuaW5kZXhPZignLicsIHJ2KSksIDEwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBlZGdlID0gdWEuaW5kZXhPZignRWRnZS8nKTtcclxuICAgICAgICBpZiAoZWRnZSA+IDApIHtcclxuICAgICAgICAgICAgLy8gRWRnZSAoSUUgMTIrKSA9PiByZXR1cm4gdmVyc2lvbiBudW1iZXJcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHVhLnN1YnN0cmluZyhlZGdlICsgNSwgdWEuaW5kZXhPZignLicsIGVkZ2UpKSwgMTApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gb3RoZXIgYnJvd3NlclxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgY2FwaXRhbGl6ZUZpcnN0TGV0dGVyOiAoc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKTtcclxuICAgIH0sXHJcblxyXG4gICAgaW9zOiAoKSA9PiB7XHJcbiAgICAgICAgaWYgKC9pUChob25lfG9kfGFkKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkge1xyXG4gICAgICAgICAgICAvLyBzdXBwb3J0cyBpT1MgMi4wIGFuZCBsYXRlcjogPGh0dHA6Ly9iaXQubHkvVEpqczFWPlxyXG4gICAgICAgICAgICBsZXQgdmVyc2lvblN0cmluZyA9IChuYXZpZ2F0b3IuYXBwVmVyc2lvbikubWF0Y2goL09TIChcXGQrKV8oXFxkKylfPyhcXGQrKT8vKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHZlcnNpb25TdHJpbmcgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHZlcnNpb25TdHJpbmcgPSAobmF2aWdhdG9yLnVzZXJBZ2VudCkubWF0Y2goL09TIChcXGQrKV8oXFxkKylfPyhcXGQrKT8vKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHZFeHRyYWN0ID0gW3BhcnNlSW50KHZlcnNpb25TdHJpbmdbMV0sIDEwKSwgcGFyc2VJbnQodmVyc2lvblN0cmluZ1syXSwgMTApLCBwYXJzZUludCh2ZXJzaW9uU3RyaW5nWzNdIHx8IDAsIDEwKV07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQodkV4dHJhY3RbMF0sIDEwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXRlY3QgSUVcclxuICAgICAqIHJldHVybnMgdmVyc2lvbiBvZiBJRSBvciBmYWxzZSwgaWYgYnJvd3NlciBpcyBub3QgSW50ZXJuZXQgRXhwbG9yZXJcclxuICAgICAqL1xyXG4gICAgaWUoKSB7XHJcbiAgICAgICAgdmFyIHVhID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQ7XHJcblxyXG4gICAgICAgIC8vIFRlc3QgdmFsdWVzOyBVbmNvbW1lbnQgdG8gY2hlY2sgcmVzdWx0IOKAplxyXG5cclxuICAgICAgICAvLyBJRSAxMFxyXG4gICAgICAgIC8vIHVhID0gJ01vemlsbGEvNS4wIChjb21wYXRpYmxlOyBNU0lFIDEwLjA7IFdpbmRvd3MgTlQgNi4yOyBUcmlkZW50LzYuMCknO1xyXG5cclxuICAgICAgICAvLyBJRSAxMVxyXG4gICAgICAgIC8vIHVhID0gJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMzsgVHJpZGVudC83LjA7IHJ2OjExLjApIGxpa2UgR2Vja28nO1xyXG5cclxuICAgICAgICAvLyBFZGdlIDEyIChTcGFydGFuKVxyXG4gICAgICAgIC8vIHVhID0gJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdPVzY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMzkuMC4yMTcxLjcxIFNhZmFyaS81MzcuMzYgRWRnZS8xMi4wJztcclxuXHJcbiAgICAgICAgLy8gRWRnZSAxM1xyXG4gICAgICAgIC8vIHVhID0gJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS80Ni4wLjI0ODYuMCBTYWZhcmkvNTM3LjM2IEVkZ2UvMTMuMTA1ODYnO1xyXG5cclxuICAgICAgICB2YXIgbXNpZSA9IHVhLmluZGV4T2YoJ01TSUUgJyk7XHJcbiAgICAgICAgaWYgKG1zaWUgPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIElFIDEwIG9yIG9sZGVyID0+IHJldHVybiB2ZXJzaW9uIG51bWJlclxyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQodWEuc3Vic3RyaW5nKG1zaWUgKyA1LCB1YS5pbmRleE9mKCcuJywgbXNpZSkpLCAxMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgdHJpZGVudCA9IHVhLmluZGV4T2YoJ1RyaWRlbnQvJyk7XHJcbiAgICAgICAgaWYgKHRyaWRlbnQgPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIElFIDExID0+IHJldHVybiB2ZXJzaW9uIG51bWJlclxyXG4gICAgICAgICAgICB2YXIgcnYgPSB1YS5pbmRleE9mKCdydjonKTtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHVhLnN1YnN0cmluZyhydiArIDMsIHVhLmluZGV4T2YoJy4nLCBydikpLCAxMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZWRnZSA9IHVhLmluZGV4T2YoJ0VkZ2UvJyk7XHJcbiAgICAgICAgaWYgKGVkZ2UgPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIEVkZ2UgKElFIDEyKykgPT4gcmV0dXJuIHZlcnNpb24gbnVtYmVyXHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh1YS5zdWJzdHJpbmcoZWRnZSArIDUsIHVhLmluZGV4T2YoJy4nLCBlZGdlKSksIDEwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG90aGVyIGJyb3dzZXJcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIG1vYmlsZTogKCkgPT4ge1xyXG4gICAgICAgIGxldCBjaGVjayA9IGZhbHNlO1xyXG4gICAgICAgIChmdW5jdGlvbihhKXtpZigvKGFuZHJvaWR8YmJcXGQrfG1lZWdvKS4rbW9iaWxlfGF2YW50Z298YmFkYVxcL3xibGFja2JlcnJ5fGJsYXplcnxjb21wYWx8ZWxhaW5lfGZlbm5lY3xoaXB0b3B8aWVtb2JpbGV8aXAoaG9uZXxvZCl8aXJpc3xraW5kbGV8bGdlIHxtYWVtb3xtaWRwfG1tcHxtb2JpbGUuK2ZpcmVmb3h8bmV0ZnJvbnR8b3BlcmEgbShvYnxpbilpfHBhbG0oIG9zKT98cGhvbmV8cChpeGl8cmUpXFwvfHBsdWNrZXJ8cG9ja2V0fHBzcHxzZXJpZXMoNHw2KTB8c3ltYmlhbnx0cmVvfHVwXFwuKGJyb3dzZXJ8bGluayl8dm9kYWZvbmV8d2FwfHdpbmRvd3MgY2V8eGRhfHhpaW5vL2kudGVzdChhKXx8LzEyMDd8NjMxMHw2NTkwfDNnc298NHRocHw1MFsxLTZdaXw3NzBzfDgwMnN8YSB3YXxhYmFjfGFjKGVyfG9vfHNcXC0pfGFpKGtvfHJuKXxhbChhdnxjYXxjbyl8YW1vaXxhbihleHxueXx5dyl8YXB0dXxhcihjaHxnbyl8YXModGV8dXMpfGF0dHd8YXUoZGl8XFwtbXxyIHxzICl8YXZhbnxiZShja3xsbHxucSl8YmkobGJ8cmQpfGJsKGFjfGF6KXxicihlfHYpd3xidW1ifGJ3XFwtKG58dSl8YzU1XFwvfGNhcGl8Y2N3YXxjZG1cXC18Y2VsbHxjaHRtfGNsZGN8Y21kXFwtfGNvKG1wfG5kKXxjcmF3fGRhKGl0fGxsfG5nKXxkYnRlfGRjXFwtc3xkZXZpfGRpY2F8ZG1vYnxkbyhjfHApb3xkcygxMnxcXC1kKXxlbCg0OXxhaSl8ZW0obDJ8dWwpfGVyKGljfGswKXxlc2w4fGV6KFs0LTddMHxvc3x3YXx6ZSl8ZmV0Y3xmbHkoXFwtfF8pfGcxIHV8ZzU2MHxnZW5lfGdmXFwtNXxnXFwtbW98Z28oXFwud3xvZCl8Z3IoYWR8dW4pfGhhaWV8aGNpdHxoZFxcLShtfHB8dCl8aGVpXFwtfGhpKHB0fHRhKXxocCggaXxpcCl8aHNcXC1jfGh0KGMoXFwtfCB8X3xhfGd8cHxzfHQpfHRwKXxodShhd3x0Yyl8aVxcLSgyMHxnb3xtYSl8aTIzMHxpYWMoIHxcXC18XFwvKXxpYnJvfGlkZWF8aWcwMXxpa29tfGltMWt8aW5ub3xpcGFxfGlyaXN8amEodHx2KWF8amJyb3xqZW11fGppZ3N8a2RkaXxrZWppfGtndCggfFxcLyl8a2xvbnxrcHQgfGt3Y1xcLXxreW8oY3xrKXxsZShub3x4aSl8bGcoIGd8XFwvKGt8bHx1KXw1MHw1NHxcXC1bYS13XSl8bGlid3xseW54fG0xXFwtd3xtM2dhfG01MFxcL3xtYSh0ZXx1aXx4byl8bWMoMDF8MjF8Y2EpfG1cXC1jcnxtZShyY3xyaSl8bWkobzh8b2F8dHMpfG1tZWZ8bW8oMDF8MDJ8Yml8ZGV8ZG98dChcXC18IHxvfHYpfHp6KXxtdCg1MHxwMXx2ICl8bXdicHxteXdhfG4xMFswLTJdfG4yMFsyLTNdfG4zMCgwfDIpfG41MCgwfDJ8NSl8bjcoMCgwfDEpfDEwKXxuZSgoY3xtKVxcLXxvbnx0Znx3Znx3Z3x3dCl8bm9rKDZ8aSl8bnpwaHxvMmltfG9wKHRpfHd2KXxvcmFufG93ZzF8cDgwMHxwYW4oYXxkfHQpfHBkeGd8cGcoMTN8XFwtKFsxLThdfGMpKXxwaGlsfHBpcmV8cGwoYXl8dWMpfHBuXFwtMnxwbyhja3xydHxzZSl8cHJveHxwc2lvfHB0XFwtZ3xxYVxcLWF8cWMoMDd8MTJ8MjF8MzJ8NjB8XFwtWzItN118aVxcLSl8cXRla3xyMzgwfHI2MDB8cmFrc3xyaW05fHJvKHZlfHpvKXxzNTVcXC98c2EoZ2V8bWF8bW18bXN8bnl8dmEpfHNjKDAxfGhcXC18b298cFxcLSl8c2RrXFwvfHNlKGMoXFwtfDB8MSl8NDd8bWN8bmR8cmkpfHNnaFxcLXxzaGFyfHNpZShcXC18bSl8c2tcXC0wfHNsKDQ1fGlkKXxzbShhbHxhcnxiM3xpdHx0NSl8c28oZnR8bnkpfHNwKDAxfGhcXC18dlxcLXx2ICl8c3koMDF8bWIpfHQyKDE4fDUwKXx0NigwMHwxMHwxOCl8dGEoZ3R8bGspfHRjbFxcLXx0ZGdcXC18dGVsKGl8bSl8dGltXFwtfHRcXC1tb3x0byhwbHxzaCl8dHMoNzB8bVxcLXxtM3xtNSl8dHhcXC05fHVwKFxcLmJ8ZzF8c2kpfHV0c3R8djQwMHx2NzUwfHZlcml8dmkocmd8dGUpfHZrKDQwfDVbMC0zXXxcXC12KXx2bTQwfHZvZGF8dnVsY3x2eCg1Mnw1M3w2MHw2MXw3MHw4MHw4MXw4M3w4NXw5OCl8dzNjKFxcLXwgKXx3ZWJjfHdoaXR8d2koZyB8bmN8bncpfHdtbGJ8d29udXx4NzAwfHlhc1xcLXx5b3VyfHpldG98enRlXFwtL2kudGVzdChhLnN1YnN0cigwLDQpKSkgY2hlY2sgPSB0cnVlO30pKG5hdmlnYXRvci51c2VyQWdlbnR8fG5hdmlnYXRvci52ZW5kb3J8fHdpbmRvdy5vcGVyYSk7XHJcbiAgICAgICAgcmV0dXJuIGNoZWNrO1xyXG4gICAgfSxcclxuXHJcbiAgICBzYWZhcmk6ICgpID0+IHtcclxuICAgICAgICByZXR1cm4gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ3NhZmFyaScpICE9IC0xICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdjaHJvbWUnKSA9PSAtMTtcclxuICAgIH0sXHJcblxyXG4gICAgcG9seWZpbGwoKSB7XHJcbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cykge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGtleXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5cztcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVXRpbHM7IiwiY2xhc3MgRXZlbnRFbWl0dGVyIHtcclxuXHJcbiAgICAvL0Jhc2ljIGxpc3RlbmVyXHJcbiAgICBvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xyXG4gICAgICAgIGlmKCF0aGlzLmV2ZW50cylcclxuICAgICAgICAgICAgdGhpcy5ldmVudHMgPSB7fTtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuZXZlbnRzW25hbWVdKVxyXG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXSA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXS5wdXNoKHtcclxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vZXhlYyBwcmV2aW91cyBldmVudHMgc2V0IGJlZm9yZSBoYW5kbGVyIGFkZGVkXHJcbiAgICAgICAgaWYodGhpcy5lbWl0QmVmb3JlU2V0RXZlbnRzICYmIHRoaXMuZW1pdEJlZm9yZVNldEV2ZW50c1tuYW1lXSAmJiB0aGlzLmVtaXRCZWZvcmVTZXRFdmVudHNbbmFtZV0ubGVuZ3RoICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5lbWl0QmVmb3JlU2V0RXZlbnRzW25hbWVdLmZvckVhY2goKGJlZm9yZUV2ZW50RGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soYmVmb3JlRXZlbnREYXRhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vQmFzaWMgdHJpZ2dlclxyXG4gICAgZW1pdChuYW1lLCBkYXRhKSB7XHJcbiAgICAgICAgaWYoIXRoaXMuZXZlbnRzKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmV2ZW50c1tuYW1lXSkge1xyXG4gICAgICAgICAgICBpZighdGhpcy5lbWl0QmVmb3JlU2V0RXZlbnRzKSB0aGlzLmVtaXRCZWZvcmVTZXRFdmVudHMgPSB7fTtcclxuICAgICAgICAgICAgaWYoIXRoaXMuZW1pdEJlZm9yZVNldEV2ZW50c1tuYW1lXSkgdGhpcy5lbWl0QmVmb3JlU2V0RXZlbnRzW25hbWVdID0gW107XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVtaXRCZWZvcmVTZXRFdmVudHNbbmFtZV0ucHVzaChkYXRhKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdLmZvckVhY2goKGV2ZW50SGFuZGxlciwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgaWYoZXZlbnRIYW5kbGVyLmNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICBldmVudEhhbmRsZXIuY2FsbGJhY2soZGF0YSkuYmluZChldmVudEhhbmRsZXIuY29udGV4dCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGV2ZW50SGFuZGxlci5jYWxsYmFjayhkYXRhKTtcclxuXHJcbiAgICAgICAgICAgIC8vSWYgdGhlIGV2ZW50IGNhbiBvbmx5IGJlIHRyaWdnZXIgb25jZVxyXG4gICAgICAgICAgICBpZihldmVudEhhbmRsZXIudW5pcXVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9SZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXHJcbiAgICBvZmYobmFtZSwgY2FsbGJhY2spIHtcclxuICAgICAgICBpZighdGhpcy5ldmVudHMgfHwgIXRoaXMuZXZlbnRzW25hbWVdKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vQ2FzZSByZW1vdmUgYWxsXHJcbiAgICAgICAgaWYoIW5hbWUgJiYgIWNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYoIWNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzW25hbWVdID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXS5mb3JFYWNoKChldmVudEhhbmRsZXIsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZihldmVudEhhbmRsZXIuY2FsbGJhY2sudG9TdHJpbmcoKSA9PSBjYWxsYmFjay50b1N0cmluZygpKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzW25hbWVdLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL0NhbiBiZSB0cmlnZ2VyIG9ubHkgb25jZVxyXG4gICAgb25jZShuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xyXG4gICAgICAgIGlmKCF0aGlzLmV2ZW50cylcclxuICAgICAgICAgICAgdGhpcy5ldmVudHMgPSB7fTtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuZXZlbnRzW25hbWVdKVxyXG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXSA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXS5wdXNoKHtcclxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxyXG4gICAgICAgICAgICB1bmlxdWU6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvL0xpc3RlbiBmb3IgYWxsIG9mIHRoZSBpbnN0YW5jZXMgb2Ygb25lIG9iamVjdFxyXG4gICAgc3RhdGljIGxpc3RlbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xyXG4gICAgICAgIGlmKCF0aGlzLmJyb2FkY2FzdEV2ZW50cylcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3RFdmVudHMgPSB7fTtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuYnJvYWRjYXN0RXZlbnRzW25hbWVdKVxyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdEV2ZW50c1tuYW1lXSA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdEV2ZW50c1tuYW1lXS5wdXNoKHtcclxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9MaXN0ZW4gZm9yIGFsbCBvZiB0aGUgaW5zdGFuY2VzIG9mIG9uZSBvYmplY3RcclxuICAgIHN0YXRpYyBsaXN0ZW5PbmNlKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XHJcbiAgICAgICAgaWYoIXRoaXMuYnJvYWRjYXN0RXZlbnRzKVxyXG4gICAgICAgICAgICB0aGlzLmJyb2FkY2FzdEV2ZW50cyA9IHt9O1xyXG5cclxuICAgICAgICBpZighdGhpcy5icm9hZGNhc3RFdmVudHNbbmFtZV0pXHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0RXZlbnRzW25hbWVdID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuYnJvYWRjYXN0RXZlbnRzW25hbWVdLnB1c2goe1xyXG4gICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXHJcbiAgICAgICAgICAgIHVuaXF1ZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vVHJpZ2dlciBldmVudCBmb3IgYWxsIG9mIHRoZSBpbnN0YW5jZXMgb2Ygb25lIG9iamVjdFxyXG4gICAgc3RhdGljIGJyb2FkY2FzdChuYW1lLCBkYXRhKSB7XHJcbiAgICAgICAgaWYoIXRoaXMuYnJvYWRjYXN0RXZlbnRzIHx8ICF0aGlzLmJyb2FkY2FzdEV2ZW50c1tuYW1lXSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmJyb2FkY2FzdEV2ZW50c1tuYW1lXS5mb3JFYWNoKChldmVudEhhbmRsZXIsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGV2ZW50SGFuZGxlci5jb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgZXZlbnRIYW5kbGVyLmNhbGxiYWNrKGRhdGEpLmJpbmQoZXZlbnRIYW5kbGVyLmNvbnRleHQpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBldmVudEhhbmRsZXIuY2FsbGJhY2soZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAvL0lmIHRoZSBldmVudCBjYW4gb25seSBiZSB0cmlnZ2VyIG9uY2VcclxuICAgICAgICAgICAgaWYoZXZlbnRIYW5kbGVyLnVuaXF1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5icm9hZGNhc3RFdmVudHNbbmFtZV0uc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB1bnNldChuYW1lLCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmKCF0aGlzLmJyb2FkY2FzdEV2ZW50cyB8fCAhdGhpcy5icm9hZGNhc3RFdmVudHNbbmFtZV0pIHJldHVybjtcclxuXHJcbiAgICAgICAgLy9DYXNlIHJlbW92ZSBhbGxcclxuICAgICAgICBpZighbmFtZSAmJiAhY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3RFdmVudHMgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZighY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdGhpcy5icm9hZGNhc3RFdmVudHNbbmFtZV0gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvYWRjYXN0RXZlbnRzW25hbWVdLmZvckVhY2goKGV2ZW50SGFuZGxlciwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKGV2ZW50SGFuZGxlci5jYWxsYmFjay50b1N0cmluZygpID09IGNhbGxiYWNrLnRvU3RyaW5nKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5icm9hZGNhc3RFdmVudHNbbmFtZV0uc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRXZlbnRFbWl0dGVyOyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGJhZXN0IG9uIDA1LzA5LzIwMTYuXHJcbiAqL1xyXG5pbXBvcnQgRGlzcGF0Y2hlciBmcm9tIFwiLi4vY29yZS9EaXNwYXRjaGVyXCI7XHJcblxyXG5jbGFzcyBIcmVmIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICB0aGlzLmhyZWYgICAgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1ocmVmJyk7XHJcblxyXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXR0YWNoRXZlbnRzKCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKSwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUNsaWNrKCkge1xyXG4gICAgICAgIGlmKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21lbnUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKVxyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZW51JykuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgICAgIERpc3BhdGNoZXIuZW1pdCgndmlldzpjaGFuZ2UnLCB7IGhyZWY6IHRoaXMuaHJlZiB9KTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEhyZWY7IiwiY2xhc3MgTG9hZGVyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9hZGVyJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLWhpZGRlbicpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1oaWRkZW4nKTtcclxuICAgIH1cclxuXHJcbiAgICBhY3RpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1oaWRkZW4nKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IExvYWRlcjsiLCJpbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuLi9jb3JlL0Rpc3BhdGNoZXInXHJcblxyXG5jbGFzcyBNYWlsIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICB0aGlzLmFjdGlvbiAgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhY3Rpb24nKTtcclxuICAgICAgICB0aGlzLmVtYWlsICAgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignW25hbWU9XCJFTUFJTFwiXScpO1xyXG4gICAgICAgIHRoaXMuaW5wdXQgICA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbdGFiaW5kZXg9XCItMVwiXScpO1xyXG5cclxuICAgICAgICB0aGlzLmRpY3Rpb25hcnkgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLm1lc3NhZ2VTdWNjZXNzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtY2UtcmVzcG9uc2UnKTtcclxuXHJcbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2hFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIHRoaXMuaGFuZGxlU3VibWl0LmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VTdWNjZXNzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5tZXNzYWdlQ2xpY2tIYW5kbGUuYmluZCh0aGlzKSwgZmFsc2UpO1xyXG5cclxuICAgICAgICBEaXNwYXRjaGVyLm9uKCdkaWN0aW9uYXJ5JywgdGhpcy5oYW5kbGVEaWN0aW9uYXJ5LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZURpY3Rpb25hcnkoZGljdGlvbmFyeSkge1xyXG4gICAgICAgIGlmKHRoaXMuZGljdGlvbmFyeSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBkaWN0aW9uYXJ5LmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgaWYoaXRlbS52aWV3TmFtZSA9PT0gXCJtYWlsXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGljdGlvbmFyeSA9IGl0ZW0udHJhbnNsYXRpb25zO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdHJhbnNsYXRlUmVzcG9uc2UobWVzc2FnZSwgY29kZSkge1xyXG4gICAgICAgIGlmKCF0aGlzLmRpY3Rpb25hcnkpIHJldHVybiBtZXNzYWdlO1xyXG5cclxuICAgICAgICBsZXQgYmFzZUluZGV4ICAgPSBjb2RlICYmIGNvZGUgPT09IFwic3VjY2Vzc1wiID8gXCIwXCIgOiBudWxsO1xyXG4gICAgICAgIGxldCBhY3R1YWxUZXh0cyA9IHRoaXMuZGljdGlvbmFyeS5maW5kKGxhbmd1YWdlID0+IGxhbmd1YWdlLmxhbmd1YWdlID09PSBNYWlsLmdldExhbmd1YWdlKCkpO1xyXG4gICAgICAgIGxldCBtZXNzYWdlTGFuZyA9IFwiZW5cIjtcclxuXHJcbiAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LmZvckVhY2gobGFuZ3VhZ2UgPT4ge1xyXG4gICAgICAgICAgIGlmKCFiYXNlSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgZm9yKGxldCBpbmRleCBpbiBsYW5ndWFnZS50ZXh0cykge1xyXG4gICAgICAgICAgICAgICAgICAgaWYobWVzc2FnZS5pbmNsdWRlcyhsYW5ndWFnZS50ZXh0c1tpbmRleF0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VJbmRleCAgID0gaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VMYW5nID0gbGFuZ3VhZ2UubGFuZ3VhZ2U7XHJcbiAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmKGFjdHVhbFRleHRzICYmIGFjdHVhbFRleHRzLnRleHRzICYmIGFjdHVhbFRleHRzLnRleHRzW2Jhc2VJbmRleF0pIHtcclxuICAgICAgICAgICAgaWYobWVzc2FnZUxhbmcgPT09IFwiZW5cIiAmJiBNYWlsLmdldExhbmd1YWdlKCkgPT09IFwiZW5cIiAmJiBhY3R1YWxUZXh0cy50ZXh0c1tiYXNlSW5kZXhdICE9PSBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGFjdHVhbFRleHRzLnRleHRzW2Jhc2VJbmRleF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlU3VibWl0KGV2ZW50KSB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgLy9ib3QgZGV0ZWN0aW9uXHJcbiAgICAgICAgaWYodGhpcy5pbnB1dCAmJiB0aGlzLmlucHV0LnZhbHVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiZ2V0XCIsXHJcbiAgICAgICAgICAgIHVybDogdGhpcy5hY3Rpb24sXHJcbiAgICAgICAgICAgIGRhdGE6IHsgXCJFTUFJTFwiOiB0aGlzLmVtYWlsLnZhbHVlLCBsYW5ndWFnZTogTWFpbC5nZXRMYW5ndWFnZSgpIH0sXHJcbiAgICAgICAgICAgIGNhY2hlOiBmYWxzZSxcclxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JyxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0FjY2VwdC1MYW5ndWFnZSc6IE1haWwuZ2V0TGFuZ3VhZ2UoKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcihlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdWNjZXNzKHJlcykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5tZXNzYWdlU3VjY2Vzcy5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIHNlbGYubWVzc2FnZVN1Y2Nlc3MuaW5uZXJIVE1MID0gc2VsZi50cmFuc2xhdGVSZXNwb25zZShyZXMubXNnLCByZXMucmVzdWx0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihzZWxmLm1lc3NhZ2VTdWNjZXNzLnF1ZXJ5U2VsZWN0b3IoJ2EnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYubWVzc2FnZVN1Y2Nlc3MucXVlcnlTZWxlY3RvcignYScpLnNldEF0dHJpYnV0ZSgndGFyZ2V0JywgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbWVzc2FnZUNsaWNrSGFuZGxlKGV2ZW50KSB7XHJcbiAgICAgICAgaWYodGhpcy5tZXNzYWdlU3VjY2Vzcy5jb250YWlucyhldmVudC50YXJnZXQpICYmIGV2ZW50LnRhcmdldC5ub2RlTmFtZSA9PT0gXCJBXCIpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5tZXNzYWdlU3VjY2Vzcy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0TGFuZ3VhZ2UoKSB7XHJcbiAgICAgICAgbGV0IHBhdGhuYW1lID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG5cclxuICAgICAgICBpZihwYXRobmFtZSAmJiAofnBhdGhuYW1lLmluZGV4T2YoJy9mcicpIHx8IH5wYXRobmFtZS5pbmRleE9mKCcvZW4nKSB8fCB+cGF0aG5hbWUuaW5kZXhPZignL2pwJykpKSB7XHJcbiAgICAgICAgICAgIGxldCBsYW5nRXh0cmFjdG9yID0gL1xcLyhlbnxmcnxqcCkvZy5leGVjKHBhdGhuYW1lKTtcclxuICAgICAgICAgICAgbGV0IGxhbmcgICAgICAgICAgPSBsYW5nRXh0cmFjdG9yWzFdID8gbGFuZ0V4dHJhY3RvclsxXSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbGFuZyB8fCAofm5hdmlnYXRvci5sYW5ndWFnZS5pbmRleE9mKFwiLVwiKSA/IChuYXZpZ2F0b3IubGFuZ3VhZ2UubWF0Y2goL14oW2Etel0rKS0vKSlbMV0gOiBuYXZpZ2F0b3IubGFuZ3VhZ2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICh+bmF2aWdhdG9yLmxhbmd1YWdlLmluZGV4T2YoXCItXCIpID8gKG5hdmlnYXRvci5sYW5ndWFnZS5tYXRjaCgvXihbYS16XSspLS8pKVsxXSA6IG5hdmlnYXRvci5sYW5ndWFnZSk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYWlsOyIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4uL2NvcmUvRGlzcGF0Y2hlcic7XG5cbmNsYXNzIE1lbnUge1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLmxpc3QgICAgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZW51LWxpc3QnKTtcbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudHMoKTtcbiAgICB9XG5cbiAgICBhdHRhY2hFdmVudHMoKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuY2xpY2tIYW5kbGUuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIH1cblxuICAgIGNsaWNrSGFuZGxlKGV2ZW50KSB7XG4gICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgICAgaWYoKHRoaXMubGlzdC5jb250YWlucyh0YXJnZXQpICYmICF0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdpdGVtLWNsb3NlJykpIHx8IHRhcmdldCA9PSB0aGlzLmxpc3QpIHJldHVybjtcblxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG5cbiAgICAgICAgRGlzcGF0Y2hlci5lbWl0KFwidmlkZW86ZG86cGxheVwiKTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVudTsiLCIvKipcclxuICogQ3JlYXRlZCBieSBiYWVzdCBvbiAwNS8wOS8yMDE2LlxyXG4gKi9cclxuaW1wb3J0IERpc3BhdGNoZXIgZnJvbSBcIi4uL2NvcmUvRGlzcGF0Y2hlclwiO1xyXG5cclxuY2xhc3MgUHJvY2VlZCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCAgPSBlbGVtZW50O1xyXG4gICAgICAgIHRoaXMudGltZWNvZGUgPSB0aGlzLmdldFRpbWVjb2RlKCk7XHJcbiAgICAgICAgdGhpcy5pc1JlcGxheSA9IGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdyZXBsYXknKTtcclxuXHJcbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2hFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbGlja0hhbmRsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpY2tIYW5kbGUoKSB7XHJcbiAgICAgICAgaWYodGhpcy5pc1JlcGxheSlcclxuICAgICAgICAgICAgRGlzcGF0Y2hlci5lbWl0KFwidmlkZW86c2V0VGltZVwiLCB7IHRpbWU6IHRoaXMudGltZWNvZGUsIHJlcGxheTogdHJ1ZSB9KTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIERpc3BhdGNoZXIuZW1pdChcInZpZGVvOnNldFRpbWVcIiwgeyB0aW1lOiB0aGlzLnRpbWVjb2RlIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFRpbWVjb2RlKCkge1xyXG4gICAgICAgIGxldCBleHBsb2RlZFRpbWVjb2RlID0gLyhbMC05XXsxLDJ9KTooWzAtOV17MSwyfSkvZy5leGVjKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvY2VlZCcpKTtcclxuXHJcbiAgICAgICAgaWYoIWV4cGxvZGVkVGltZWNvZGVbMV0gfHwgIWV4cGxvZGVkVGltZWNvZGVbMl0pIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IFtvcmlnaW5hbCwgbWludXRlcywgc2Vjb25kc10gPSBleHBsb2RlZFRpbWVjb2RlO1xyXG5cclxuICAgICAgICBtaW51dGVzID0gcGFyc2VJbnQobWludXRlcywgMTApO1xyXG4gICAgICAgIHNlY29uZHMgPSBwYXJzZUludChzZWNvbmRzLCAxMCk7XHJcblxyXG4gICAgICAgIGxldCB0aW1lY29kZSA9IChtaW51dGVzICogNjApICsgc2Vjb25kcztcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnRpbWVjb2RlID0gdGltZWNvZGU7XHJcblxyXG4gICAgICAgIHJldHVybiB0aW1lY29kZTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFByb2NlZWQ7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgYmFlc3Qgb24gMDQvMDkvMjAxNi5cclxuICovXHJcbmltcG9ydCBEaXNwYXRjaGVyIGZyb20gXCIuLi9jb3JlL0Rpc3BhdGNoZXJcIjtcclxuXHJcbmNsYXNzIFN3aXRjaCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCAgICA9IGVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5uYW1lICAgICAgID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpLm5hbWU7XHJcbiAgICAgICAgdGhpcy5pbnB1dHMgICAgID0gWy4uLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChgW25hbWU9XCIke3RoaXMubmFtZX1cIl1gKV07XHJcbiAgICAgICAgdGhpcy5sYWJlbHMgICAgID0gWy4uLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGFiZWwnKV07XHJcblxyXG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnRzKCk7XHJcblxyXG4gICAgICAgIGlmKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGBpbnB1dDoke3RoaXMubmFtZX1gKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGBpbnB1dDoke3RoaXMubmFtZX1gKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL0V4dGVybmFsIHNldCBzdGF0ZVxyXG4gICAgICAgIHRoaXMuaW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgIGlucHV0LnNldFN0YXRlID0gdGhpcy5zZXRTdGF0ZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dGFjaEV2ZW50cygpIHtcclxuICAgICAgICB0aGlzLmlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xyXG4gICAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLmhhbmRsZUlucHV0LmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRTdGF0ZSh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuaW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGlucHV0LnZhbHVlID09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5jaGVja2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlSW5wdXQoeyB0YXJnZXQ6IGlucHV0LCBmcm9tU2F2ZTogdHJ1ZSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlSW5wdXQoZXZlbnQpIHtcclxuICAgICAgICBsZXQgaW5wdXQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gaW5wdXQudmFsdWU7XHJcblxyXG4gICAgICAgIHRoaXMubGFiZWxzLmZvckVhY2goKGxhYmVsKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGxhYmVsLmdldEF0dHJpYnV0ZSgnZm9yJykgPT0gaW5wdXQuaWQpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYoIWlucHV0Lmhhc0F0dHJpYnV0ZXMoJ2RhdGEtcHJldmVudCcpKVxyXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgaW5wdXQ6JHt0aGlzLm5hbWV9YCwgdmFsdWUpO1xyXG5cclxuICAgICAgICAvL2NoYW5nZSB1cmwgZm9yIHRoZSBzdWJ0aXRsZXNcclxuICAgICAgICBpZih0aGlzLm5hbWUgPT09IFwibGFuZ3VhZ2VcIiAmJiAhZXZlbnQuZnJvbVNhdmUgJiYgbG9jYXRpb24ucGF0aG5hbWUgIT0gYC8ke3ZhbHVlfWApIHtcclxuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUodmFsdWUsIG51bGwsIGAvJHt2YWx1ZX1gKTtcclxuXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKS5zZXRBdHRyaWJ1dGUoJ2xhbmcnLCB2YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICBpZih3aW5kb3cuZ2EpIHtcclxuICAgICAgICAgICAgICAgIGdhKCdzZW5kJywgJ3BhZ2V2aWV3JywgYC8ke3ZhbHVlfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IHsgdmFsdWUgfTtcclxuXHJcbiAgICAgICAgaWYoZXZlbnQuZnJvbVNhdmUpIGRhdGEuZnJvbVNhdmUgPSB0cnVlO1xyXG5cclxuICAgICAgICBEaXNwYXRjaGVyLmVtaXQoYGlucHV0OiR7dGhpcy5uYW1lfWAsIGRhdGEpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTd2l0Y2g7IiwiaW1wb3J0IERpc3BhdGNoZXIgZnJvbSAnLi4vY29yZS9EaXNwYXRjaGVyJztcclxuaW1wb3J0IFV0aWxzICAgICAgZnJvbSAnLi4vY29yZS9VdGlscyc7XHJcblxyXG5jbGFzcyBNZXRhIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmxhbmcgICAgICAgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgaW5wdXQ6bGFuZ3VhZ2VgKSB8fCAnZnInO1xyXG4gICAgICAgIHRoaXMuZGljdGlvbmFyeSA9IG51bGw7XHJcblxyXG4gICAgICAgIGxldCBwYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuXHJcbiAgICAgICAgaWYocGF0aG5hbWUgJiYgKH5wYXRobmFtZS5pbmRleE9mKCcvZnInKSB8fCB+cGF0aG5hbWUuaW5kZXhPZignL2VuJykgfHwgfnBhdGhuYW1lLmluZGV4T2YoJy9qcCcpKSkge1xyXG4gICAgICAgICAgICBsZXQgbGFuZ0V4dHJhY3RvciA9IC9cXC8oZW58ZnJ8anApL2cuZXhlYyhwYXRobmFtZSk7XHJcbiAgICAgICAgICAgIHRoaXMubGFuZyAgICAgICAgID0gbGFuZ0V4dHJhY3RvclsxXSA/IGxhbmdFeHRyYWN0b3JbMV0gOiAofm5hdmlnYXRvci5sYW5ndWFnZS5pbmRleE9mKFwiLVwiKSA/IChuYXZpZ2F0b3IubGFuZ3VhZ2UubWF0Y2goL14oW2Etel0rKS0vKSlbMV0gOiBuYXZpZ2F0b3IubGFuZ3VhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYofm5hdmlnYXRvci5sYW5ndWFnZS5pbmRleE9mKFwiLVwiKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhbmdFeHRyYWN0b3IgPSBuYXZpZ2F0b3IubGFuZ3VhZ2UubWF0Y2goL14oW2Etel0rKS0vKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhbmcgPSBsYW5nRXh0cmFjdG9yWzFdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYW5nID0gbmF2aWdhdG9yLmxhbmd1YWdlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dGFjaEV2ZW50cygpIHtcclxuICAgICAgICBEaXNwYXRjaGVyLm9uKCdkaWN0aW9uYXJ5JywgdGhpcy5oYW5kbGVEaWN0aW9uYXJ5LmJpbmQodGhpcykpO1xyXG4gICAgICAgIERpc3BhdGNoZXIub24oYGlucHV0Omxhbmd1YWdlYCwgdGhpcy5oYW5kbGVMYW5nQ2hhbmdlLmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUxhbmdDaGFuZ2UocmVzKSB7XHJcbiAgICAgICAgdGhpcy5sYW5nID0gcmVzLnZhbHVlO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZURpY3Rpb25hcnkoZGljKSB7XHJcbiAgICAgICAgaWYodGhpcy5kaWN0aW9uYXJ5KSByZXR1cm47XHJcblxyXG4gICAgICAgIGRpYy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGl0ZW0udmlld05hbWUgPT0gXCJtZXRhc1wiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkgPSBpdGVtLnRyYW5zbGF0aW9ucztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBpZighdGhpcy5sYW5nIHx8ICF0aGlzLmRpY3Rpb25hcnkpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoVXRpbHMuaWUoKSAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKGl0ZW0ubGFuZ3VhZ2UgPT09IHRoaXMubGFuZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGl0bGUgICAgICAgPSBpdGVtLnRleHRzLnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBpdGVtLnRleHRzLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudGl0bGUgICAgICAgPSAodGhpcy5kaWN0aW9uYXJ5LmZpbmQoaXRlbSA9PiBpdGVtLmxhbmd1YWdlID09PSB0aGlzLmxhbmcpKS50ZXh0cy50aXRsZTtcclxuICAgICAgICAgICAgdGhpcy5kZXNjcmlwdGlvbiA9ICh0aGlzLmRpY3Rpb25hcnkuZmluZChpdGVtID0+IGl0ZW0ubGFuZ3VhZ2UgPT09IHRoaXMubGFuZykpLnRleHRzLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy50aXRsZSAhPSBkb2N1bWVudC50aXRsZSkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IHRoaXMudGl0bGU7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbcHJvcGVydHk9XCJvZzp0aXRsZVwiXScpLnNldEF0dHJpYnV0ZSgnY29udGVudCcsIHRoaXMudGl0bGUpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJ0d2l0dGVyOnRpdGxlXCJdJykuc2V0QXR0cmlidXRlKCdjb250ZW50JywgdGhpcy50aXRsZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJkZXNjcmlwdGlvblwiXScpLmdldEF0dHJpYnV0ZSgnY29udGVudCcpICE9IHRoaXMuZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPVwiZGVzY3JpcHRpb25cIl0nKS5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnQnLCB0aGlzLmRlc2NyaXB0aW9uKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPVwidHdpdHRlcjpkZXNjcmlwdGlvblwiXScpLnNldEF0dHJpYnV0ZSgnY29udGVudCcsIHRoaXMuZGVzY3JpcHRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtwcm9wZXJ0eT1cIm9nOnVybFwiXScpLnNldEF0dHJpYnV0ZSgnY29udGVudCcsIHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1ldGE7IiwiaW1wb3J0IERpc3BhdGNoZXIgZnJvbSAnLi4vY29yZS9EaXNwYXRjaGVyJztcclxuXHJcbmxldCBkaWN0aW9uYXJ5ICAgICAgICAgID0gbnVsbDtcclxubGV0IGxvYWRpbmdEaWN0aW9uYXJ5ICAgPSBmYWxzZTtcclxuXHJcbmxldCBsYW5ndWFnZTtcclxuXHJcbmxldCB0ZXh0c0hhbmRsZXIgPSBbXTtcclxuXHJcbmNsYXNzIFRleHQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgICAgICA9IGVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbCAgICAgPSBlbGVtZW50LmlubmVySFRNTC50cmltKCk7XHJcbiAgICAgICAgdGhpcy50cmFuc2xhdGlvbnMgPSB7fTtcclxuXHJcbiAgICAgICAgaWYoZGljdGlvbmFyeSA9PT0gbnVsbCAmJiBsb2FkaW5nRGljdGlvbmFyeSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgbG9hZGluZ0RpY3Rpb25hcnkgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgZmV0Y2goJy9hc3NldHMvZGF0YS9kaWN0aW9uYXJ5Lmpzb24nLCB7XHJcbiAgICAgICAgICAgICAgICBjcmVkZW50aWFsczogXCJpbmNsdWRlXCJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKHJlcyA9PiByZXMuanNvbigpKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpY3Rpb25hcnkgPSByZXM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIERpc3BhdGNoZXIuZW1pdCgnZGljdGlvbmFyeScsIGRpY3Rpb25hcnkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0ZXh0c0hhbmRsZXIuZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGV4dHJhY3REYXRhID0gL14oLiopOihbYS16MC05XSspJC8uZXhlYyh0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXRleHQnKSk7XHJcblxyXG4gICAgICAgIGlmKGV4dHJhY3REYXRhICYmIGV4dHJhY3REYXRhWzFdICE9IHVuZGVmaW5lZCAmJiBleHRyYWN0RGF0YVsyXSAhPSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy52aWV3TmFtZSA9IGV4dHJhY3REYXRhWzFdO1xyXG4gICAgICAgICAgICB0aGlzLmluZGV4ICAgID0gZXh0cmFjdERhdGFbMl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdOYW1lID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS10ZXh0Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0ZXh0c0hhbmRsZXIucHVzaCh0aGlzLmhhbmRsZURpY3Rpb25hcnkuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIERpc3BhdGNoZXIub24oXCJpbnB1dDpsYW5ndWFnZVwiLCB0aGlzLmhhbmRsZUxhbmd1YWdlQ2hhbmdlLmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlIHRvIGdldCB0aGUgZGlmZmVyZW50IHRyYW5zbGF0aW9ucyBvZiB0aGUgb3JpZ2luYWxcclxuICAgICAqL1xyXG4gICAgaGFuZGxlRGljdGlvbmFyeSgpIHtcclxuICAgICAgICBkaWN0aW9uYXJ5LmZvckVhY2goKGRpY3Rpb25hcnlJdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKCFkaWN0aW9uYXJ5SXRlbS52aWV3TmFtZSB8fCBkaWN0aW9uYXJ5SXRlbS52aWV3TmFtZSAhPT0gdGhpcy52aWV3TmFtZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgZGljdGlvbmFyeUl0ZW0udHJhbnNsYXRpb25zLmZvckVhY2goKHRyYW5zbGF0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZighdGhpcy5pbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRpb25zW3RyYW5zbGF0aW9uLmxhbmd1YWdlXSA9IHRyYW5zbGF0aW9uLnRleHRzW3RoaXMub3JpZ2luYWxdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGlvbnNbdHJhbnNsYXRpb24ubGFuZ3VhZ2VdID0gdHJhbnNsYXRpb24udGV4dHNbdGhpcy5pbmRleF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmhhbmRsZUxhbmd1YWdlQ2hhbmdlKHsgdmFsdWU6IGxhbmd1YWdlIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUxhbmd1YWdlQ2hhbmdlKGRhdGEpIHtcclxuICAgICAgICBsZXQgbGFuZyA9IGRhdGEudmFsdWU7XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLnRyYW5zbGF0aW9uc1tsYW5nXSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gdGhpcy5vcmlnaW5hbDtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmlubmVySFRNTCA9IHRoaXMudHJhbnNsYXRpb25zW2xhbmddO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRMYW5ndWFnZSgpIHtcclxuICAgICAgICBsZXQgcGF0aG5hbWUgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XHJcblxyXG4gICAgICAgIGlmKHBhdGhuYW1lICYmICh+cGF0aG5hbWUuaW5kZXhPZignL2ZyJykgfHwgfnBhdGhuYW1lLmluZGV4T2YoJy9lbicpIHx8IH5wYXRobmFtZS5pbmRleE9mKCcvanAnKSkpIHtcclxuICAgICAgICAgICAgbGV0IGxhbmdFeHRyYWN0b3IgPSAvXFwvKGVufGZyfGpwKS9nLmV4ZWMocGF0aG5hbWUpO1xyXG4gICAgICAgICAgICBsZXQgbGFuZyAgICAgICAgICA9IGxhbmdFeHRyYWN0b3JbMV0gPyBsYW5nRXh0cmFjdG9yWzFdIDogbnVsbDtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBsYW5nIHx8ICh+bmF2aWdhdG9yLmxhbmd1YWdlLmluZGV4T2YoXCItXCIpID8gKG5hdmlnYXRvci5sYW5ndWFnZS5tYXRjaCgvXihbYS16XSspLS8pKVsxXSA6IG5hdmlnYXRvci5sYW5ndWFnZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gKH5uYXZpZ2F0b3IubGFuZ3VhZ2UuaW5kZXhPZihcIi1cIikgPyAobmF2aWdhdG9yLmxhbmd1YWdlLm1hdGNoKC9eKFthLXpdKyktLykpWzFdIDogbmF2aWdhdG9yLmxhbmd1YWdlKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmxhbmd1YWdlID0gVGV4dC5nZXRMYW5ndWFnZSgpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGV4dDsiLCJpbXBvcnQgRGlzcGF0Y2hlciBmcm9tIFwiLi4vY29yZS9EaXNwYXRjaGVyXCI7XHJcblxyXG5sZXQgVHJhY2tzR3JvdXAgPSBbXTtcclxuXHJcbmNsYXNzIFRyYWNrIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih2aWRlbywgbGFuZ3VhZ2UsIGRpciwgc3VidGl0bGVzKSB7XHJcbiAgICAgICAgdGhpcy52aWRlbyAgICA9IHZpZGVvO1xyXG4gICAgICAgIHRoaXMuc3VicyAgICAgPSBbXTtcclxuICAgICAgICB0aGlzLmxhbmd1YWdlID0gbGFuZ3VhZ2U7XHJcbiAgICAgICAgdGhpcy5jYXB0aW9uQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnNxdWFyZVtkYXRhLWNhcmRpbmFsPVwiJHtkaXJ9XCJdIC5jYXB0aW9uYCk7XHJcblxyXG4gICAgICAgIGxldCBwYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgICAgICBsZXQgbGFuZztcclxuXHJcbiAgICAgICAgaWYocGF0aG5hbWUgJiYgKH5wYXRobmFtZS5pbmRleE9mKCcvZnInKSB8fCB+cGF0aG5hbWUuaW5kZXhPZignL2VuJykgfHwgfnBhdGhuYW1lLmluZGV4T2YoJy9qcCcpKSkge1xyXG4gICAgICAgICAgICBsZXQgbGFuZ0V4dHJhY3RvciA9IC9cXC8oZW58ZnJ8anApL2cuZXhlYyhwYXRobmFtZSk7XHJcbiAgICAgICAgICAgICAgICBsYW5nICAgICAgICAgID0gbGFuZ0V4dHJhY3RvclsxXSA/IGxhbmdFeHRyYWN0b3JbMV0gOiBudWxsO1xyXG5cclxuICAgICAgICAgICAgaWYoIWxhbmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNBY3RpdmUgPSBsYW5ndWFnZSA9PSBuYXZpZ2F0b3IubGFuZ3VhZ2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNBY3RpdmUgPSBsYW5ndWFnZSA9PSBsYW5nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYofm5hdmlnYXRvci5sYW5ndWFnZS5pbmRleE9mKFwiLVwiKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhbmdFeHRyYWN0b3IgPSBuYXZpZ2F0b3IubGFuZ3VhZ2UubWF0Y2goL14oW2Etel0rKS0vKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzQWN0aXZlID0gbGFuZ3VhZ2UgPT0gbGFuZ0V4dHJhY3RvclsxXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNBY3RpdmUgPSBsYW5ndWFnZSA9PSBuYXZpZ2F0b3IubGFuZ3VhZ2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzdWJ0aXRsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYoIXN1YnRpdGxlc1tpXS5wYXlsb2FkKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB0aGlzLnN1YnNbaV0gPSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcclxuICAgICAgICAgICAgICAgIHRleHQ6ICBzdWJ0aXRsZXNbaV0ucGF5bG9hZC5sZW5ndGggPiAxID8gc3VidGl0bGVzW2ldLnBheWxvYWQuam9pbihcIjxicj5cIikgOiBzdWJ0aXRsZXNbaV0ucGF5bG9hZFswXSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBzdWJ0aXRsZXNbaV0uc3RhcnRUaW1lLFxyXG4gICAgICAgICAgICAgICAgZW5kOiAgIHN1YnRpdGxlc1tpXS5lbmRUaW1lXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFjdGl2ZVN1YnMgPSB7fTtcclxuXHJcbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2hFdmVudHMoKSB7XHJcbiAgICAgICAgaWYodGhpcy5pc0FjdGl2ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUV2ZW50ID0gdGhpcy51cGRhdGUuYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy52aWRlby5hZGRFdmVudExpc3RlbmVyKCd0aW1ldXBkYXRlJywgdGhpcy51cGRhdGVFdmVudCwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgRGlzcGF0Y2hlci5vbihcImlucHV0OnN1YnRpdGxlc1wiLCB0aGlzLnRvZ2dsZVN1YnRpdGxlcy5iaW5kKHRoaXMpKTtcclxuICAgICAgICBEaXNwYXRjaGVyLm9uKFwiaW5wdXQ6bGFuZ3VhZ2VcIiwgdGhpcy5jaGFuZ2VTdWJ0aXRsZXNMYW5ndWFnZS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgLy9HZXQgdGhlIGNhcHRpb25zXHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuc3Vicy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZih0aGlzLnZpZGVvLmN1cnJlbnRUaW1lID49IHRoaXMuc3Vic1tpXS5zdGFydCAmJiB0aGlzLnZpZGVvLmN1cnJlbnRUaW1lIDwgdGhpcy5zdWJzW2ldLmVuZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTdWJzW2ldID0gdGhpcy5zdWJzW2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy52aWRlby5jdXJyZW50VGltZSA+PSB0aGlzLnN1YnNbaV0uZW5kICYmIHRoaXMuYWN0aXZlU3Vic1tpXSkge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuYWN0aXZlU3Vic1tpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9kcmF3IHRoZW1cclxuICAgICAgICBsZXQga2V5cyAgICA9IE9iamVjdC5rZXlzKHRoaXMuYWN0aXZlU3Vicyk7XHJcbiAgICAgICAgbGV0IG1haW5LZXkgPSBrZXlzWzBdO1xyXG5cclxuICAgICAgICBpZih0aGlzLmFjdGl2ZVN1YnNbbWFpbktleV0gJiYgdGhpcy5hY3RpdmVTdWJzW21haW5LZXldLnRleHQpXHJcbiAgICAgICAgICAgIHRoaXMuY2FwdGlvbkNvbnRhaW5lci5pbm5lckhUTUwgPSB0aGlzLmFjdGl2ZVN1YnNbbWFpbktleV0udGV4dDtcclxuXHJcbiAgICAgICAgaWYoa2V5cy5sZW5ndGggPT0gMClcclxuICAgICAgICAgICAgdGhpcy5jYXB0aW9uQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZVN1YnRpdGxlcyhkYXRhKSB7XHJcbiAgICAgICAgaWYoZGF0YS52YWx1ZSA9PSBcIm9mZlwiKVxyXG4gICAgICAgICAgICB0aGlzLmNhcHRpb25Db250YWluZXIuY2xhc3NMaXN0LmFkZCgnc3ViLW9mZicpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy5jYXB0aW9uQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ3N1Yi1vZmYnKTtcclxuICAgIH1cclxuXHJcbiAgICBjaGFuZ2VTdWJ0aXRsZXNMYW5ndWFnZShkYXRhKSB7XHJcbiAgICAgICAgaWYoIXRoaXMuaXNBY3RpdmUgJiYgZGF0YS52YWx1ZSA9PSB0aGlzLmxhbmd1YWdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNBY3RpdmUgICAgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUV2ZW50ID0gdGhpcy51cGRhdGUuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudmlkZW8uYWRkRXZlbnRMaXN0ZW5lcigndGltZXVwZGF0ZScsIHRoaXMudXBkYXRlRXZlbnQsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZih0aGlzLmlzQWN0aXZlICYmIGRhdGEudmFsdWUgIT0gdGhpcy5sYW5ndWFnZSkge1xyXG4gICAgICAgICAgICB0aGlzLnZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RpbWV1cGRhdGUnLCB0aGlzLnVwZGF0ZUV2ZW50KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNBY3RpdmUgICAgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVFdmVudCA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuY2FwdGlvbkNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIGxvYWRUcmFja3ModmlkZW8pIHtcclxuICAgICAgICBsZXQgcHJlbG9hZCA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUodHJ1ZSk7XHJcblxyXG4gICAgICAgIHByZWxvYWQub24oXCJmaWxlbG9hZFwiLCAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGZvcihsZXQga2V5IGluIHJlcy5yZXN1bHQuaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgIFRyYWNrc0dyb3VwLnB1c2gobmV3IFRyYWNrKHZpZGVvLCByZXMucmVzdWx0LmxhbmcsIGtleSwgcmVzLnJlc3VsdC5pdGVtc1trZXldKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcHJlbG9hZC5sb2FkRmlsZShcIi9hc3NldHMvc3VidGl0bGVzL2ZyYW5jYWlzLmpzb25cIik7XHJcbiAgICAgICAgcHJlbG9hZC5sb2FkRmlsZShcIi9hc3NldHMvc3VidGl0bGVzL2FuZ2xhaXMuanNvblwiKTtcclxuICAgICAgICBwcmVsb2FkLmxvYWRGaWxlKFwiL2Fzc2V0cy9zdWJ0aXRsZXMvamFwb25haXMuanNvblwiKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY2xlYXIoKSB7XHJcbiAgICAgICAgVHJhY2tzR3JvdXAuZm9yRWFjaCh0cmFjayA9PiB7XHJcbiAgICAgICAgICAgIHRyYWNrLmFjdGl2ZVN1YnMgPSB7fTtcclxuICAgICAgICAgICAgdHJhY2suY2FwdGlvbkNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRyYWNrOyIsImltcG9ydCBhd2F5IGZyb20gJ2F3YXknO1xyXG5pbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuLi9jb3JlL0Rpc3BhdGNoZXInO1xyXG5cclxuY2xhc3MgTW9uaXRvciB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5oYXNTdGFydCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudGltZXIgICAgPSBhd2F5KDQgKiAxMDAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5hdHRhY2hFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dGFjaEV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudGltZXIub24oJ2lkbGUnLCB0aGlzLmhhbmRsZUlkbGUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy50aW1lci5vbignYWN0aXZlJywgdGhpcy5oYW5kbGVBY3RpdmUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIERpc3BhdGNoZXIub24oXCJ2aWRlbzpzdGFydFwiLCB0aGlzLmhhbmRsZVZpZGVvLmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUlkbGUoKSB7XHJcbiAgICAgICAgaWYoIXRoaXMuaGFzU3RhcnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWVudScpLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHJldHVybjtcclxuICAgICAgICBpZih+ZG9jdW1lbnQuYm9keS5jbGFzc05hbWUuaW5kZXhPZignb24tdmlldy0tJykpIHJldHVybjtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdpcy1pZGxlJyk7XHJcblxyXG4gICAgICAgIERpc3BhdGNoZXIuZW1pdCgndXNlcjppZGxlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQWN0aXZlKCkge1xyXG4gICAgICAgIGlmKCF0aGlzLmhhc1N0YXJ0KSByZXR1cm47XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnaXMtaWRsZScpO1xyXG5cclxuICAgICAgICBEaXNwYXRjaGVyLmVtaXQoJ3VzZXI6YWN0aXZlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVmlkZW8oKSB7XHJcbiAgICAgICAgdGhpcy5oYXNTdGFydCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBuZXcgTW9uaXRvcigpOyIsImZ1bmN0aW9uIElFKCkge1xyXG4gICAgY29uc3QgdWEgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcclxuXHJcbiAgICAvLyBUZXN0IHZhbHVlczsgVW5jb21tZW50IHRvIGNoZWNrIHJlc3VsdCDigKZcclxuXHJcbiAgICAvLyBJRSAxMFxyXG4gICAgLy8gdWEgPSAnTW96aWxsYS81LjAgKGNvbXBhdGlibGU7IE1TSUUgMTAuMDsgV2luZG93cyBOVCA2LjI7IFRyaWRlbnQvNi4wKSc7XHJcblxyXG4gICAgLy8gSUUgMTFcclxuICAgIC8vIHVhID0gJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDYuMzsgVHJpZGVudC83LjA7IHJ2OjExLjApIGxpa2UgR2Vja28nO1xyXG5cclxuICAgIC8vIEVkZ2UgMTIgKFNwYXJ0YW4pXHJcbiAgICAvLyB1YSA9ICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXT1c2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzM5LjAuMjE3MS43MSBTYWZhcmkvNTM3LjM2IEVkZ2UvMTIuMCc7XHJcblxyXG4gICAgLy8gRWRnZSAxM1xyXG4gICAgLy8gdWEgPSAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzQ2LjAuMjQ4Ni4wIFNhZmFyaS81MzcuMzYgRWRnZS8xMy4xMDU4Nic7XHJcblxyXG4gICAgY29uc3QgbXNpZSA9IHVhLmluZGV4T2YoJ01TSUUgJyk7XHJcbiAgICBpZiAobXNpZSA+IDApIHtcclxuICAgICAgICAvLyBJRSAxMCBvciBvbGRlciA9PiByZXR1cm4gdmVyc2lvbiBudW1iZXJcclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQodWEuc3Vic3RyaW5nKG1zaWUgKyA1LCB1YS5pbmRleE9mKCcuJywgbXNpZSkpLCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdHJpZGVudCA9IHVhLmluZGV4T2YoJ1RyaWRlbnQvJyk7XHJcbiAgICBpZiAodHJpZGVudCA+IDApIHtcclxuICAgICAgICAvLyBJRSAxMSA9PiByZXR1cm4gdmVyc2lvbiBudW1iZXJcclxuICAgICAgICBjb25zdCBydiA9IHVhLmluZGV4T2YoJ3J2OicpO1xyXG4gICAgICAgIHJldHVybiBwYXJzZUludCh1YS5zdWJzdHJpbmcocnYgKyAzLCB1YS5pbmRleE9mKCcuJywgcnYpKSwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGVkZ2UgPSB1YS5pbmRleE9mKCdFZGdlLycpO1xyXG4gICAgaWYgKGVkZ2UgPiAwKSB7XHJcbiAgICAgICAgLy8gRWRnZSAoSUUgMTIrKSA9PiByZXR1cm4gdmVyc2lvbiBudW1iZXJcclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQodWEuc3Vic3RyaW5nKGVkZ2UgKyA1LCB1YS5pbmRleE9mKCcuJywgZWRnZSkpLCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb3RoZXIgYnJvd3NlclxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBJT1MoKXtcclxuICAgIGlmICgvaVAoaG9uZXxvZHxhZCkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcclxuICAgICAgICAvLyBzdXBwb3J0cyBpT1MgMi4wIGFuZCBsYXRlcjogPGh0dHA6Ly9iaXQubHkvVEpqczFWPlxyXG4gICAgICAgIGxldCB2ZXJzaW9uU3RyaW5nID0gKG5hdmlnYXRvci5hcHBWZXJzaW9uKS5tYXRjaCgvT1MgKFxcZCspXyhcXGQrKV8/KFxcZCspPy8pO1xyXG5cclxuICAgICAgICBpZih2ZXJzaW9uU3RyaW5nID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHZlcnNpb25TdHJpbmcgPSAobmF2aWdhdG9yLnVzZXJBZ2VudCkubWF0Y2goL09TIChcXGQrKV8oXFxkKylfPyhcXGQrKT8vKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHZFeHRyYWN0ID0gW3BhcnNlSW50KHZlcnNpb25TdHJpbmdbMV0sIDEwKSwgcGFyc2VJbnQodmVyc2lvblN0cmluZ1syXSwgMTApLCBwYXJzZUludCh2ZXJzaW9uU3RyaW5nWzNdIHx8IDAsIDEwKV07XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJzZUludCh2RXh0cmFjdFswXSwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuY29uc3QgSVNfRklSRUZPWCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdmaXJlZm94JykgPiAtMTtcclxuXHJcbmNvbnN0IElTX0NIUk9NRSAgPSAvQ2hyb21lLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmIC9Hb29nbGUgSW5jLy50ZXN0KG5hdmlnYXRvci52ZW5kb3IpO1xyXG5cclxuY29uc3QgSVNfU0FGQVJJICA9IC9TYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgL0FwcGxlIENvbXB1dGVyLy50ZXN0KG5hdmlnYXRvci52ZW5kb3IpO1xyXG5cclxuY29uc3QgSVNfV0VCS0lUICA9IElTX0NIUk9NRSB8fCBJU19TQUZBUkk7XHJcblxyXG5jb25zdCBJU19JUEFEICAgID0gL2lQYWQvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpIHx8IC9pUGhvbmUgT1MgM18xXzIvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpIHx8IC9pUGhvbmUgT1MgM18yXzIvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xyXG5cclxuY29uc3QgSVNfTU9CSUxFID0gKCkgPT4gd2luZG93Lm1hdGNoTWVkaWEoXCIobWF4LXdpZHRoOiA3NjhweClcIikubWF0Y2hlcztcclxuXHJcbmNvbnN0IElTX0RFU0tUT1AgPSAoKSA9PiB3aW5kb3cubWF0Y2hNZWRpYShcIihtaW4td2lkdGg6IDEyODBweClcIikubWF0Y2hlcztcclxuXHJcbmNvbnN0IElTX1NNQUxMID0gKCkgPT4gd2luZG93Lm1hdGNoTWVkaWEoXCIobWF4LXdpZHRoOiA0MDBweClcIikubWF0Y2hlcztcclxuXHJcbmNvbnN0IElTX1RBQkxFVCA9ICgpID0+IHdpbmRvdy5tYXRjaE1lZGlhKFwiKG1heC13aWR0aDogOTgwcHgpXCIpLm1hdGNoZXM7XHJcblxyXG5jb25zdCBJU19QT1JUUkFJVCAgPSAoKSA9PiB3aW5kb3cubWF0Y2hNZWRpYShcIihtYXgtd2lkdGg6IDc2OHB4KSBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdClcIikubWF0Y2hlcztcclxuXHJcbmNvbnN0IElTX0xBTkRTQ0FQRSA9ICgpID0+IHdpbmRvdy5tYXRjaE1lZGlhKFwiKG1heC13aWR0aDogNzY4cHgpIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSlcIikubWF0Y2hlcztcclxuXHJcbmNvbnN0IEhBU19TTUFMTF9IRUlHSFQgPSAoKSA9PiB3aW5kb3cubWF0Y2hNZWRpYShcIihtYXgtaGVpZ2h0OiA2MDBweClcIikubWF0Y2hlcztcclxuXHJcbmV4cG9ydCB7IElFLCBJT1MsIElTX0ZJUkVGT1gsIElTX0NIUk9NRSwgSVNfU0FGQVJJLCBJU19XRUJLSVQsIElTX0lQQUQsIElTX01PQklMRSwgSVNfVEFCTEVULCBJU19QT1JUUkFJVCwgSVNfTEFORFNDQVBFLCBJU19TTUFMTCwgSVNfREVTS1RPUCwgSEFTX1NNQUxMX0hFSUdIVCB9OyIsImltcG9ydCB7IGNyZWF0ZVRpbWVSYW5nZSB9IGZyb20gJy4vdGltZS1yYW5nZXMuanMnO1xyXG5cclxuLyoqXHJcbiAqIENvbXB1dGUgaG93IG11Y2ggeW91ciB2aWRlbyBoYXMgYmVlbiBidWZmZXJlZFxyXG4gKlxyXG4gKiBAcGFyYW0gIHtPYmplY3R9IEJ1ZmZlcmVkIG9iamVjdFxyXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IFRvdGFsIGR1cmF0aW9uXHJcbiAqIEByZXR1cm4ge051bWJlcn0gUGVyY2VudCBidWZmZXJlZCBvZiB0aGUgdG90YWwgZHVyYXRpb25cclxuICogQHByaXZhdGVcclxuICogQGZ1bmN0aW9uIGJ1ZmZlcmVkUGVyY2VudFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlcmVkUGVyY2VudChidWZmZXJlZCwgZHVyYXRpb24pIHtcclxuICAgIGxldCBidWZmZXJlZER1cmF0aW9uID0gMDtcclxuICAgIGxldCBzdGFydDtcclxuICAgIGxldCBlbmQ7XHJcblxyXG4gICAgaWYgKCFkdXJhdGlvbikge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghYnVmZmVyZWQgfHwgIWJ1ZmZlcmVkLmxlbmd0aCkge1xyXG4gICAgICAgIGJ1ZmZlcmVkID0gY3JlYXRlVGltZVJhbmdlKDAsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnVmZmVyZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBzdGFydCA9IGJ1ZmZlcmVkLnN0YXJ0KGkpO1xyXG4gICAgICAgIGVuZCA9IGJ1ZmZlcmVkLmVuZChpKTtcclxuXHJcbiAgICAgICAgLy8gYnVmZmVyZWQgZW5kIGNhbiBiZSBiaWdnZXIgdGhhbiBkdXJhdGlvbiBieSBhIHZlcnkgc21hbGwgZnJhY3Rpb25cclxuICAgICAgICBpZiAoZW5kID4gZHVyYXRpb24pIHtcclxuICAgICAgICAgICAgZW5kID0gZHVyYXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBidWZmZXJlZER1cmF0aW9uICs9IGVuZCAtIHN0YXJ0O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBidWZmZXJlZER1cmF0aW9uIC8gZHVyYXRpb247XHJcbn1cclxuIiwiZnVuY3Rpb24gcmFuZ2VDaGVjayhmbk5hbWUsIGluZGV4LCBtYXhJbmRleCkge1xyXG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IG1heEluZGV4KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZXhlY3V0ZSAnJHtmbk5hbWV9JyBvbiAnVGltZVJhbmdlcyc6IFRoZSBpbmRleCBwcm92aWRlZCAoJHtpbmRleH0pIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGUgbWF4aW11bSBib3VuZCAoJHttYXhJbmRleH0pLmApO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRSYW5nZShmbk5hbWUsIHZhbHVlSW5kZXgsIHJhbmdlcywgcmFuZ2VJbmRleCkge1xyXG4gICAgaWYgKHJhbmdlSW5kZXggPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgREVQUkVDQVRFRDogRnVuY3Rpb24gJyR7Zm5OYW1lfScgb24gJ1RpbWVSYW5nZXMnIGNhbGxlZCB3aXRob3V0IGFuIGluZGV4IGFyZ3VtZW50LmApO1xyXG4gICAgICAgIHJhbmdlSW5kZXggPSAwO1xyXG4gICAgfVxyXG4gICAgcmFuZ2VDaGVjayhmbk5hbWUsIHJhbmdlSW5kZXgsIHJhbmdlcy5sZW5ndGggLSAxKTtcclxuICAgIHJldHVybiByYW5nZXNbcmFuZ2VJbmRleF1bdmFsdWVJbmRleF07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVRpbWVSYW5nZXNPYmoocmFuZ2VzKSB7XHJcbiAgICBpZiAocmFuZ2VzID09PSB1bmRlZmluZWQgfHwgcmFuZ2VzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGxlbmd0aDogMCxcclxuICAgICAgICAgICAgc3RhcnQoKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgVGltZVJhbmdlcyBvYmplY3QgaXMgZW1wdHknKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW5kKCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIFRpbWVSYW5nZXMgb2JqZWN0IGlzIGVtcHR5Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBsZW5ndGg6IHJhbmdlcy5sZW5ndGgsXHJcbiAgICAgICAgc3RhcnQ6IGdldFJhbmdlLmJpbmQobnVsbCwgJ3N0YXJ0JywgMCwgcmFuZ2VzKSxcclxuICAgICAgICBlbmQ6IGdldFJhbmdlLmJpbmQobnVsbCwgJ2VuZCcsIDEsIHJhbmdlcylcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUaW1lUmFuZ2VzKHN0YXJ0LCBlbmQpIHtcclxuICAgIGlmIChBcnJheS5pc0FycmF5KHN0YXJ0KSkge1xyXG4gICAgICAgIHJldHVybiBjcmVhdGVUaW1lUmFuZ2VzT2JqKHN0YXJ0KTtcclxuICAgIH0gZWxzZSBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybiBjcmVhdGVUaW1lUmFuZ2VzT2JqKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY3JlYXRlVGltZVJhbmdlc09iaihbW3N0YXJ0LCBlbmRdXSk7XHJcbn1cclxuXHJcbmV4cG9ydCB7IGNyZWF0ZVRpbWVSYW5nZXMgYXMgY3JlYXRlVGltZVJhbmdlIH07XHJcbiIsImltcG9ydCBTb3VuZE1hbmdlciBmcm9tICcuLi9hdWRpby9Tb3VuZE1hbmdlcic7XHJcbmltcG9ydCBUcmFjayAgICAgICBmcm9tICcuLi90cmFjay90cmFjayc7XHJcbmltcG9ydCBDb250cm9scyAgICBmcm9tICcuLi9jb250cm9scy9jb250cm9scyc7XHJcbmltcG9ydCBMb2FkZXIgICAgICBmcm9tICcuLi9sb2FkZXIvbG9hZGVyJztcclxuaW1wb3J0IERpc3BhdGNoZXIgIGZyb20gJy4uL2NvcmUvRGlzcGF0Y2hlcic7XHJcbmltcG9ydCBVdGlscyAgICAgICBmcm9tICcuLi9jb3JlL1V0aWxzJztcclxuXHJcbmltcG9ydCB7IGJ1ZmZlcmVkUGVyY2VudCB9IGZyb20gJy4uL3V0aWxzL2J1ZmZlcic7XHJcblxyXG5jb25zdCBDQVJESU5BVVggICAgPSBbXCJOT1JUSFwiLCBcIkVBU1RcIiwgXCJTT1VUSFwiLCBcIldFU1RcIl07XHJcbmNvbnN0IEFSUk9XUyAgICAgICA9IFszNywgMzgsIDM5LCA0MF07XHJcbmNvbnN0IElOVFJPX1RJTUUgICA9IDY5O1xyXG5jb25zdCBDUkVESVRTX1RJTUUgPSA1NzA7XHJcbmNvbnN0IEJVRkZFUl9USU1FICA9IDUwMDA7XHJcbmNvbnN0IFZJREVPUyAgICAgICA9IHtcclxuICAgIFwiNEtcIjogXCJodHRwOi8vY2RuLmxlc2NhcmRpbmF1eC5jb20vdmlkZW9zL2xldHNtYWtlaXRjb3VudF80MDAwLm1wNFwiLFxyXG4gICAgXCJIRFwiOiBcImh0dHA6Ly9jZG4ubGVzY2FyZGluYXV4LmNvbS92aWRlb3MvbGV0c21ha2VpdGNvdW50XzE5MjAubXA0XCIsXHJcbiAgICBcIk1EXCI6IFwiaHR0cDovL2Nkbi5sZXNjYXJkaW5hdXguY29tL3ZpZGVvcy9sZXRzbWFrZWl0Y291bnRfMTI4MC5tcDRcIixcclxuICAgIFwiU0RcIjogXCJodHRwOi8vY2RuLmxlc2NhcmRpbmF1eC5jb20vdmlkZW9zL2xldHNtYWtlaXRjb3VudF84NTQubXA0XCJcclxufTtcclxuXHJcbmNsYXNzIFZpZGVvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICAgIHRoaXMud3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3cmFwcGVyJyk7XHJcbiAgICAgICAgdGhpcy5zcXVhcmVzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc3F1YXJlJykpO1xyXG4gICAgICAgIHRoaXMucmVjdHMgICA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJlY3QnKSk7XHJcblxyXG4gICAgICAgIGlmKFV0aWxzLmlvcygpICYmIFV0aWxzLmlvcygpIDwgMTApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgRGlzcGF0Y2hlci5vbihcInNwZWVkXCIsIHRoaXMuY2hhbmdlU291cmNlQmFzZWRPbkNvbm5lY3Rpb24uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgRGlzcGF0Y2hlci5vbihcImlucHV0OnF1YWxpdHlcIiwgdGhpcy5jaGFuZ2VTb3VyY2VCYXNlZE9uVXNlci5iaW5kKHRoaXMpKTtcclxuICAgICAgICBEaXNwYXRjaGVyLm9uKFwidmlkZW86c2V0VGltZVwiLCB0aGlzLmN1cnJlbnRUaW1lLmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInZpZGVvOmFjdGl2ZVwiKTtcclxuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInJlcGxheVwiKTtcclxuXHJcbiAgICAgICAgVHJhY2subG9hZFRyYWNrcyh0aGlzLmVsZW1lbnQpO1xyXG5cclxuICAgICAgICB0aGlzLnNvdW5kTWFuYWdlciAgPSBuZXcgU291bmRNYW5nZXIoKTtcclxuICAgICAgICB0aGlzLmxvYWRlciAgICAgICAgPSBuZXcgTG9hZGVyKCk7XHJcbiAgICAgICAgdGhpcy5jb250cm9scyAgICAgID0gbmV3IENvbnRyb2xzKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5tdXRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuU3RhcnRJbnRybygpO1xyXG5cclxuICAgICAgICB0aGlzLnNvdW5kTWFuYWdlclxyXG4gICAgICAgICAgICAucHJlbG9hZCgpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IERpc3BhdGNoZXIuZW1pdChcInNvdW5kOmxvYWRcIikpO1xyXG5cclxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dGFjaEV2ZW50cygpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncGxheScsIHRoaXMucGxheUhhbmRsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbGlja0hhbmRsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCB0aGlzLmNhblBsYXlIYW5kbGUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgdGhpcy5jYW5QbGF5VGhyb3VnaEhhbmRsZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2FpdGluZycsIHRoaXMuaGFuZGxlV2FpdGluZy5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHRoaXMud3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5tb3VzZU91dEhhbmRsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleUhhbmRsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHRoaXMuc3F1YXJlcy5mb3JFYWNoKChzcXVhcmUpID0+IHtcclxuICAgICAgICAgICAgc3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5zcXVhcmVDbGlja0hhbmRsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHNxdWFyZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLnNxdWFyZUhvdmVySGFuZGxlLmJpbmQodGhpcyksIGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5yZWN0cy5mb3JFYWNoKChyZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHJlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnJlY3RDbGlja0hhbmRsZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmKFV0aWxzLm1vYmlsZSgpKSBEaXNwYXRjaGVyLm9uKFwic2NyZWVuOm9yaWVudGF0aW9uXCIsIHRoaXMuc2NyZWVuQ2hhbmdlLmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICBEaXNwYXRjaGVyLm9uKFwidmlkZW86dG9nZ2xlXCIsIHRoaXMudG9nZ2xlLmJpbmQodGhpcykpO1xyXG4gICAgICAgIERpc3BhdGNoZXIub24oXCJ2aWRlbzpzdGFydFwiLCB0aGlzLnN0YXJ0LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICBEaXNwYXRjaGVyLm9uKFwidmlkZW86ZG86cGxheVwiLCB0aGlzLnBsYXkuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgRGlzcGF0Y2hlci5vbihcInZpZGVvOmRvOnBhdXNlXCIsIHRoaXMucGF1c2UuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcGxheUhhbmRsZSgpIHtcclxuICAgICAgICB0aGlzLmxvYWRlci5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xpY2tIYW5kbGUoKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ29uLWZpcnN0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VPdXRIYW5kbGUoKSB7XHJcbiAgICAgICAgLy9sb3dlciB0aGUgc291bmQgd2hlbiBhbGwgdGhlIHZpZGVvcyBhcmUgcGxheWluZ1xyXG4gICAgICAgIGlmKHRoaXMucmVhZHkgJiYgIXRoaXMuYWN0aXZlU3F1YXJlICYmICF0aGlzLmluSW50cm8gJiYgIXRoaXMuc291bmRDaGFuZ2VkKSB7XHJcbiAgICAgICAgICAgIERpc3BhdGNoZXIuZW1pdChcInNvdW5kOnZvbHVtZVwiLCB7IHZvbHVtZTogdGhpcy5zb3VuZE1hbmFnZXIudm9sdW1lIC0gLjEgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmRDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmluSW50cm8gJiYgIXRoaXMuaW5DcmVkaXRzKVxyXG4gICAgICAgICAgICB0aGlzLnNvdW5kTWFuYWdlci5pc091dCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMud3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1ob3ZlcmluZycpO1xyXG5cclxuICAgICAgICBpZighdGhpcy5yZWFkeSB8fCB0aGlzLmFjdGl2ZVNxdWFyZSB8fCB0aGlzLmVsZW1lbnQucGF1c2VkIHx8IHRoaXMuaXNXYWl0aW5nKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuY2FuSG92ZXJTcXVhcmUoKTtcclxuICAgICAgICB0aGlzLnNvdW5kTWFuYWdlci51bm11dGVBbGwoKTtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuaW5JbnRybyAmJiAhdGhpcy5pbkNyZWRpdHMpIHRoaXMuc291bmRNYW5hZ2VyLm11dGVCYWNrZ3JvdW5kKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3F1YXJlSG92ZXJIYW5kbGUoZXZlbnQpIHtcclxuICAgICAgICBpZighdGhpcy5yZWFkeSB8fCB0aGlzLmFjdGl2ZVNxdWFyZSB8fCB0aGlzLmJhY2tGcm9tWm9vbSB8fCB0aGlzLmluSW50cm8gfHwgdGhpcy5pc1dhaXRpbmcpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIuaXNPdXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHNxdWFyZSA9IGV2ZW50LnRhcmdldDtcclxuXHJcbiAgICAgICAgd2hpbGUoIXNxdWFyZS5jbGFzc0xpc3QuY29udGFpbnMoJ3NxdWFyZScpKSB7XHJcbiAgICAgICAgICAgIHNxdWFyZSA9IHNxdWFyZS5wYXJlbnROb2RlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGluZGV4ICAgID0gcGFyc2VJbnQoc3F1YXJlLmdldEF0dHJpYnV0ZSgnZGF0YS1zcXVhcmUnKSwgMTApO1xyXG4gICAgICAgIGxldCBjYXJkaW5hbCA9IHNxdWFyZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2FyZGluYWwnKTtcclxuXHJcbiAgICAgICAgdGhpcy5zcXVhcmVzLmZvckVhY2goKHNxdWFyZSwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGlkeCArIDEgIT09IGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNvdW5kTWFuYWdlci5tdXRlKGlkeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNvdW5kTWFuYWdlci51bm11dGUoaWR4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZih0aGlzLnNvdW5kQ2hhbmdlZCkge1xyXG4gICAgICAgICAgICBEaXNwYXRjaGVyLmVtaXQoXCJzb3VuZDp2b2x1bWVcIiwgeyB2b2x1bWU6IHRoaXMuc291bmRNYW5hZ2VyLnZvbHVtZSArIC4xIH0pO1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5zb3VuZENoYW5nZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihldmVudC50eXBlICYmIGV2ZW50LnR5cGUgPT09IFwibW91c2VvdmVyXCIpIHtcclxuICAgICAgICAgICAgdGhpcy53cmFwcGVyLmNsYXNzTGlzdC5hZGQoJ2lzLWhvdmVyaW5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNxdWFyZUNsaWNrSGFuZGxlKGV2ZW50KSB7XHJcbiAgICAgICAgaWYoKHRoaXMuYWN0aXZlU3F1YXJlICYmICFldmVudC5mb3JjZSkgfHwgdGhpcy5pbkludHJvIHx8ICF0aGlzLnJlYWR5IHx8IHRoaXMuaXNXYWl0aW5nIHx8IGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3JlY3QnKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLmFjdGl2ZVNxdWFyZSA9IGV2ZW50LnRhcmdldDtcclxuXHJcbiAgICAgICAgd2hpbGUoIXRoaXMuYWN0aXZlU3F1YXJlLmNsYXNzTGlzdC5jb250YWlucygnc3F1YXJlJykpIHRoaXMuYWN0aXZlU3F1YXJlID0gdGhpcy5hY3RpdmVTcXVhcmUucGFyZW50Tm9kZTtcclxuXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBwYXJzZUludCh0aGlzLmFjdGl2ZVNxdWFyZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3F1YXJlJyksIDEwKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW5Ib3ZlclNxdWFyZSgpO1xyXG5cclxuICAgICAgICB0aGlzLndyYXBwZXIuY2xhc3NMaXN0LmFkZCgnbW9kZS16b29tJyk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTmFtZSA9IGBvbi0ke2luZGV4fWA7XHJcblxyXG4gICAgICAgIHRoaXMuc3F1YXJlcy5mb3JFYWNoKChzcXVhcmUsIGlkeCkgPT4ge1xyXG4gICAgICAgICAgIGlmKGlkeCArIDEgIT09IGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgIHNxdWFyZS5jbGFzc0xpc3QuYWRkKFwiaXMtaGlkZVwiKTtcclxuICAgICAgICAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1hY3RpdmVcIik7XHJcbiAgICAgICAgICAgICAgIHRoaXMuc291bmRNYW5hZ2VyLm11dGUoaWR4KTtcclxuICAgICAgICAgICB9XHJcbiAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgIGNvbnN0IGNhcmRpbmFsID0gc3F1YXJlLmdldEF0dHJpYnV0ZShcImRhdGEtY2FyZGluYWxcIik7XHJcblxyXG4gICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInZpZGVvOmFjdGl2ZVwiLCBjYXJkaW5hbCk7XHJcblxyXG4gICAgICAgICAgICAgICB0aGlzLnNvdW5kTWFuYWdlci51bm11dGUoaWR4KTtcclxuICAgICAgICAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1oaWRlXCIpO1xyXG4gICAgICAgICAgICAgICBzcXVhcmUuY2xhc3NMaXN0LmFkZChcImlzLWFjdGl2ZVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgIGlmKHdpbmRvdy5nYSkge1xyXG4gICAgICAgICAgICAgICAgICAgZ2EoJ3NlbmQnLCAnZXZlbnQnLCAndmlkZW8nLCAnY2xpYyB6b25lJywgY2FyZGluYWwudG9Mb3dlckNhc2UoKSk7XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vQ2xpY2sgdG8gcmV0dXJuIHRvIHNwbGl0XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRPbkFjdGl2ZVNxdWFyZSA9IHRoaXMuYWN0aXZlQ2xpY2tIYW5kbGUuYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy53cmFwcGVyLm9uY2xpY2sgPSB0aGlzLmV2ZW50T25BY3RpdmVTcXVhcmU7XHJcbiAgICAgICAgfSwgMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICByZWN0Q2xpY2tIYW5kbGUoZXZlbnQpIHtcclxuICAgICAgICAvL2lmKHRoaXMuYWN0aXZlU3F1YXJlIHx8IHRoaXMuaW5JbnRybyB8fCAhdGhpcy5yZWFkeSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgIGxldCBzcXVhcmUgPSB0YXJnZXQucGFyZW50Tm9kZTtcclxuXHJcbiAgICAgICAgaWYoc3F1YXJlLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHtcclxuICAgICAgICAgICAgdGhpcy5iYWNrVG9TcGxpdChldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNxdWFyZUNsaWNrSGFuZGxlKHsgdGFyZ2V0OiBzcXVhcmUgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFjdGl2ZUNsaWNrSGFuZGxlKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5iYWNrVG9TcGxpdChldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NyZWVuQ2hhbmdlKG9yaWVudGF0aW9uKSB7XHJcbiAgICAgICAgaWYob3JpZW50YXRpb24ubmV3T3JpZW50YXRpb24gPT09IFwicG9ydHJhaXRcIikge1xyXG4gICAgICAgICAgICB0aGlzLnBhdXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYob3JpZW50YXRpb24ubmV3T3JpZW50YXRpb24gPT09IFwibGFuZHNjYXBlXCIgJiYgb3JpZW50YXRpb24ucHJldmlvdXNPcmllbnRhdGlvbiA9PT0gXCJwb3J0cmFpdFwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBrZXlIYW5kbGUoZSkge1xyXG4gICAgICAgIGlmKCFlLnRhcmdldCB8fCAhZS50YXJnZXQubm9kZU5hbWUgfHwgKGUudGFyZ2V0ICYmIGUudGFyZ2V0Lm5vZGVOYW1lICE9PSBcIklOUFVUXCIpKSBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIC8vcmV0dXJuXHJcbiAgICAgICAgaWYoZS5rZXlDb2RlID09PSA4IHx8IGUua2V5Q29kZSA9PT0gMjcpIHtcclxuICAgICAgICAgICAgdGhpcy5iYWNrVG9TcGxpdChlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vc3BhY2VcclxuICAgICAgICBpZihlLmtleUNvZGUgPT09IDMyKSB7XHJcbiAgICAgICAgICAgIGlmKCF0aGlzLnJlYWR5KSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmVsZW1lbnQucGF1c2VkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXkodHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhdXNlKHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih+QVJST1dTLmluZGV4T2YoZS5rZXlDb2RlKSkge1xyXG4gICAgICAgICAgICBsZXQgY2FyZGluYWw7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM3OiBjYXJkaW5hbCA9IFwiV0VTVFwiOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzg6IGNhcmRpbmFsID0gXCJOT1JUSFwiOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzk6IGNhcmRpbmFsID0gXCJFQVNUXCI7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0MDogY2FyZGluYWwgPSBcIlNPVVRIXCI7IGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNxdWFyZUNsaWNrSGFuZGxlKHsgdGFyZ2V0OiB0aGlzLndyYXBwZXIucXVlcnlTZWxlY3RvcihgW2RhdGEtY2FyZGluYWw9XCIke2NhcmRpbmFsfVwiXWApLCBmb3JjZTogdHJ1ZSB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2FuSG92ZXJTcXVhcmUoKSB7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuYmFja0Zyb21ab29tO1xyXG5cclxuICAgICAgICB0aGlzLndyYXBwZXIuY2xhc3NMaXN0LnJlbW92ZSgncHJldmVudC1ob3ZlcicpO1xyXG4gICAgICAgIHRoaXMuc3F1YXJlcy5mb3JFYWNoKChzcXVhcmUpID0+IHtcclxuICAgICAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC5yZW1vdmUoJ2tlZXAtZm9jdXMnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5vdXRFbGVtZW50ICYmICh0aGlzLm91dEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzcXVhcmUnKSB8fCB0aGlzLm91dEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdjYXB0aW9uJykpKSB7XHJcbiAgICAgICAgICAgIGlmKCF0aGlzLm91dEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzcXVhcmUnKSkgdGhpcy5vdXRFbGVtZW50ID0gdGhpcy5vdXRFbGVtZW50LnBhcmVudE5vZGU7XHJcblxyXG4gICAgICAgICAgICBpZihVdGlscy5tb2JpbGUoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIudW5tdXRlQWxsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNxdWFyZUhvdmVySGFuZGxlKHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHRoaXMub3V0RWxlbWVudFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgdGhpcy5vdXRFdmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgYmFja1RvU3BsaXQoZXZlbnQpIHtcclxuICAgICAgICB0aGlzLmJhY2tGcm9tWm9vbSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy53cmFwcGVyLmNsYXNzTGlzdC5hZGQoJ3ByZXZlbnQtaG92ZXInKTtcclxuXHJcbiAgICAgICAgbGV0IGluZGV4RXh0cmFjdCA9IHRoaXMuZWxlbWVudC5jbGFzc05hbWUubWF0Y2goJ29uLShbMC05XXsxfSknKTtcclxuXHJcbiAgICAgICAgaWYoaW5kZXhFeHRyYWN0ICYmIGluZGV4RXh0cmFjdFsxXSkge1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBpbmRleEV4dHJhY3RbMV07XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc05hbWUgPSBgZnJvbS0ke2luZGV4fWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KHRoaXMuY2FuSG92ZXJTcXVhcmUuYmluZCh0aGlzKSwgMTAwMCk7XHJcblxyXG4gICAgICAgIGlmKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0RWxlbWVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMub3V0RXZlbnQgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vdXRFbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChldmVudC5wYWdlWCwgZXZlbnQucGFnZVkpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgdGhpcy5vdXRFdmVudCk7XHJcblxyXG4gICAgICAgIHRoaXMud3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKCdtb2RlLXpvb20nKTtcclxuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInZpZGVvOmFjdGl2ZVwiKTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmVsZW1lbnQuY2xhc3NOYW1lID0gJycsIDI1MCk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuYWN0aXZlU3F1YXJlKSB0aGlzLmFjdGl2ZVNxdWFyZS5jbGFzc0xpc3QuYWRkKCdrZWVwLWZvY3VzJyk7XHJcblxyXG4gICAgICAgIHRoaXMud3JhcHBlci5vbmNsaWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLmV2ZW50T25BY3RpdmVTcXVhcmUgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLnNxdWFyZXMuZm9yRWFjaCgoc3F1YXJlLCBpZHgpID0+IHtcclxuICAgICAgICAgICAgc3F1YXJlLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcclxuICAgICAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1oaWRlXCIpO1xyXG4gICAgICAgICAgICBzcXVhcmUuY2xhc3NMaXN0LnJlbW92ZShcImlzLWFjdGl2ZVwiKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSBudWxsO1xyXG5cclxuICAgICAgICBpZihVdGlscy5tb2JpbGUoKSkge1xyXG4gICAgICAgICAgICBUcmFjay5jbGVhcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBTdGFydEludHJvKGZyb21Vc2VyKSB7XHJcbiAgICAgICAgaWYodGhpcy5jaGFuZ2luZ1NvdXJjZSAmJiAhZnJvbVVzZXIpIHJldHVybjsgLy9Ob3QgdHJpZ2dlciB3aXRoIHRoaXMgd2hlbiB0aGUgdXNlciBjaGFuZ2UgdGhlIHF1YWxpdHkgb2YgdGhlIHZpZGVvXHJcblxyXG4gICAgICAgIHRoaXMuaW5JbnRybyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy53cmFwcGVyLmNsYXNzTGlzdC5hZGQoJ21vZGUtaW50cm8nKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIuY2FuTXV0ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc291bmRNYW5hZ2VyLmlzT3V0ID0gZmFsc2U7XHJcbiAgICAgICAgVHJhY2suY2xlYXIoKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5ldmVudE9uQWN0aXZlU3F1YXJlKSB7XHJcbiAgICAgICAgICAgIHRoaXMud3JhcHBlci5vbmNsaWNrID0gbnVsbDsvLycsIHRoaXMuZXZlbnRPbkFjdGl2ZVNxdWFyZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50T25BY3RpdmVTcXVhcmUgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9jbGVhclxyXG4gICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gbnVsbDtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NOYW1lID0gJyc7XHJcbiAgICAgICAgdGhpcy5zcXVhcmVzLmZvckVhY2goKHNxdWFyZSkgPT4ge1xyXG4gICAgICAgICAgICBzcXVhcmUuY2xhc3NMaXN0LnJlbW92ZSgnaXMtaGlkZScpO1xyXG4gICAgICAgICAgICBzcXVhcmUuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMucmVwbGF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmRNYW5hZ2VyLmluSW50cm8gPSB0cnVlO1xyXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInZpZGVvOmFjdGl2ZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIudW5tdXRlQWxsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIEVuZEludHJvKCkge1xyXG4gICAgICAgIHRoaXMuaW5JbnRybyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMud3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKCdtb2RlLWludHJvJyk7XHJcblxyXG4gICAgICAgIHRoaXMuc291bmRNYW5hZ2VyLmluSW50cm8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNvdW5kTWFuYWdlci5jYW5NdXRlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKFV0aWxzLm1vYmlsZSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmRNYW5hZ2VyLnVubXV0ZUFsbCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIuaXNPdXQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kTWFuYWdlci5tdXRlQmFja2dyb3VuZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBTdGFydENyZWRpdHMoKSB7XHJcbiAgICAgICAgdGhpcy5pbkNyZWRpdHMgPSB0cnVlO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgndmlkZW8tLW1vZGUtY3JlZGl0cycpO1xyXG4gICAgICAgIHRoaXMud3JhcHBlci5jbGFzc0xpc3QuYWRkKCdtb2RlLWNyZWRpdHMnKTtcclxuXHJcbiAgICAgICAgLy9jbGVhclxyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwidmlkZW86YWN0aXZlXCIpO1xyXG4gICAgICAgIHRoaXMuc291bmRNYW5hZ2VyLmlzT3V0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIudW5tdXRlQWxsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgRW5kQ3JlZGl0cygpIHtcclxuICAgICAgICB0aGlzLmluQ3JlZGl0cyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNQYXVzZWQgID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIuaXNPdXQgPSB0cnVlO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgndmlkZW8tLW1vZGUtY3JlZGl0cycpO1xyXG4gICAgICAgIHRoaXMud3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKCdtb2RlLWNyZWRpdHMnKTtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudmlldy0tY3JlZGl0cycpLmNsYXNzTGlzdC5yZW1vdmUoJ3ZpZXctLWFjdGl2ZScpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnb24tdmlldy0tY3JlZGl0cycpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBpZighdGhpcy5yZWFkeSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLmNoZWNrU3RhdGUoKTtcclxuXHJcbiAgICAgICAgaWYoVXRpbHMuc2FmYXJpKCkgfHwgVXRpbHMuaW9zKCkgfHwgVXRpbHMuaWUoKSkgdGhpcy5jaGVja0J1ZmZlcigpO1xyXG5cclxuICAgICAgICBpZighdGhpcy5pc1BhdXNlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kTWFuYWdlci5zeW5jKHRoaXMuZWxlbWVudC5jdXJyZW50VGltZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy51cGRhdGUuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tTdGF0ZShmcm9tVXNlcikge1xyXG4gICAgICAgIC8vRW5kIG9mIHRoZSBpbnRybyA/XHJcbiAgICAgICAgaWYodGhpcy5pbkludHJvICYmIHRoaXMuZWxlbWVudC5jdXJyZW50VGltZSA+PSBJTlRST19USU1FKSB7XHJcbiAgICAgICAgICAgIHRoaXMuRW5kSW50cm8oZnJvbVVzZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKCF0aGlzLmluSW50cm8gJiYgdGhpcy5lbGVtZW50LmN1cnJlbnRUaW1lIDwgSU5UUk9fVElNRSkge1xyXG4gICAgICAgICAgICB0aGlzLlN0YXJ0SW50cm8oZnJvbVVzZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9DcmVkaXRzXHJcbiAgICAgICAgaWYodGhpcy5pbkNyZWRpdHMgJiYgdGhpcy5lbGVtZW50LmN1cnJlbnRUaW1lIDw9IENSRURJVFNfVElNRSkge1xyXG4gICAgICAgICAgICB0aGlzLkVuZENyZWRpdHMoZnJvbVVzZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKCF0aGlzLmluQ3JlZGl0cyAmJiB0aGlzLmVsZW1lbnQuY3VycmVudFRpbWUgPiBDUkVESVRTX1RJTUUpIHtcclxuICAgICAgICAgICAgdGhpcy5TdGFydENyZWRpdHMoZnJvbVVzZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjaGVja0J1ZmZlcigpIHtcclxuICAgICAgICBpZih0aGlzLmVsZW1lbnQucmVhZHlTdGF0ZSA9PT0gNCAmJiB0aGlzLmlzV2FpdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLmlzV2FpdGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVXYWl0aW5nKCkge1xyXG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgICAgICB0aGlzLmlzV2FpdGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKHRoaXMubGFzdFdhaXRpbmcgJiYgKG5vdyAtIHRoaXMubGFzdFdhaXRpbmcgPiAoNTAwMCkpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yY2VXYWl0aW5nID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yY2VXYWl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxhc3RXYWl0aW5nID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgLy8gdGhpcy53cmFwcGVyLmNsYXNzTGlzdC5hZGQoJ2lzLXdhaXRpbmcnKTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2FkZXIuc2hvdygpO1xyXG5cclxuICAgICAgICBpZihVdGlscy5pZSgpKSB7XHJcbiAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRlci5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZha2VXYWl0aW5nKCkge1xyXG4gICAgICAgIHRoaXMubG9hZGVyLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICBjYW5QbGF5SGFuZGxlKCkge1xyXG4gICAgICAgIHRoaXMubG9hZGVyLmhpZGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1dhaXRpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBjYW5QbGF5VGhyb3VnaEhhbmRsZSgpIHtcclxuICAgICAgICBpZigoIXRoaXMucmVhZHkgJiYgIXRoaXMuaXNMb2FkaW5nICYmICF0aGlzLmlzV2FpdGluZykpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ3N1cGVyaW9yOiAnICsgdGhpcy52aWRlb1F1YWxpdHlJc1N1cGVyaW9yKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnZm9yY2Ugd2FpdGluZzogJyArIHRoaXMuZm9yY2VXYWl0aW5nKTtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMudmlkZW9RdWFsaXR5SXNTdXBlcmlvciAmJiAhdGhpcy5mb3JjZVdhaXRpbmcpIHtcclxuICAgICAgICAgICAgZG9uZS5jYWxsKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5wYXVzZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRlci5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuaXNXYWl0aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vV2FpdCBtYXggMTAgc2Vjb25kZXNcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBkb25lLmNhbGwodGhpcyk7XHJcbiAgICAgICAgICAgIH0sIEJVRkZFUl9USU1FKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGRvbmUoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGVyLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMuaXNXYWl0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNvdW5kTWFuYWdlci5jdXJyZW50VGltZSh0aGlzLmVsZW1lbnQuY3VycmVudFRpbWUpO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuaXNXYWl0aW5nO1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcy53cmFwcGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXdhaXRpbmcnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmluSW50cm8pXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIudW5tdXRlQWxsKHsgZm9yY2U6IHRydWUgfSk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNvdW5kTWFuYWdlci51bm11dGVBbGwoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZighdGhpcy5pbkludHJvICYmICF0aGlzLmluQ3JlZGl0cykgdGhpcy5zb3VuZE1hbmFnZXIubXV0ZUJhY2tncm91bmQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoIXRoaXMuaXNQYXVzZWQpIHRoaXMucGxheSgpO1xyXG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjdXJyZW50VGltZSh0aW1lLCBvcHRpb25zID0ge30pIHtcclxuICAgICAgICBpZih0eXBlb2YgdGltZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHRpbWU7XHJcbiAgICAgICAgICAgIHRpbWUgICAgPSB0aW1lLnRpbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgaWYoIXRoaXMucmVhZHkgfHwgdGltZSA8IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGlmKCFvcHRpb25zLmF1ZGlvT25seSkgdGhpcy5lbGVtZW50LmN1cnJlbnRUaW1lID0gdGltZTtcclxuXHJcbiAgICAgICAgICAgIFRyYWNrLmNsZWFyKCk7XHJcblxyXG4gICAgICAgICAgICBpZih0aGlzLmlzUGF1c2VkKSB0aGlzLmZha2VXYWl0aW5nKCk7XHJcblxyXG4gICAgICAgICAgICBpZihvcHRpb25zLnJlcGxheSlcclxuICAgICAgICAgICAgICAgIHRoaXMucmVwbGF5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vbWF5YmUgbmVlZCB0byByZW1vdmUgdGhlIGludHJvIG9yIGNyZWRpdHMgbGF5ZXJcclxuICAgICAgICAgICAgaWYob3B0aW9ucy5mcm9tVXNlciB8fCBvcHRpb25zLnJlcGxheSkgdGhpcy5jaGVja1N0YXRlKHRydWUpO1xyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5pc1dhaXRpbmcgJiYgIW9wdGlvbnMucmVwbGF5KSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBpZihvcHRpb25zLnZpZGVvT25seSkgdGhpcy5zb3VuZE1hbmFnZXIucGF1c2VBbGwoKTtcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzV2FpdGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNvdW5kTWFuYWdlci5tdXRlQWxsKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKG9wdGlvbnMucmVwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkVuZENyZWRpdHMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFja1RvU3BsaXQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc291bmRNYW5hZ2VyLnVubXV0ZUFsbCh7IGZvcmNlOiB0cnVlIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIucGxheUFsbCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEJ1ZmZlcmVkKCkge1xyXG4gICAgICAgIGxldCByYW5nZSAgICA9IDA7XHJcbiAgICAgICAgY29uc3QgYnVmZmVyID0gdGhpcy5lbGVtZW50LmJ1ZmZlcmVkO1xyXG4gICAgICAgIGNvbnN0IHRpbWUgICA9IHRoaXMuZWxlbWVudC5jdXJyZW50VGltZTtcclxuXHJcbiAgICAgICAgaWYodGltZSA9PT0gMCB8fCAhYnVmZmVyIHx8IGJ1ZmZlci5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgd2hpbGUoIShidWZmZXIuc3RhcnQocmFuZ2UpIDw9IHRpbWUgJiYgdGltZSA8PSBidWZmZXIuZW5kKHJhbmdlKSkpIHtcclxuICAgICAgICAgICAgcmFuZ2UgKz0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHdpbmRvdy5ERUJVRykge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWVzID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgYnVmZmVyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZXMucHVzaCh7c3RhcnQ6YnVmZmVyLnN0YXJ0KGkpLGVuZDpidWZmZXIuZW5kKGkpfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHt0aW1lLHJhbmdlfSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUudGFibGUodmFsdWVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBidWZmZXIuZW5kKHJhbmdlKSAtIHRpbWU7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgY29uc3QgcmVhZHlFdmVudCA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIuc3RhcnQoKS50aGVuKHJlYWR5LmJpbmQodGhpcykpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmKHRoaXMuZWxlbWVudC5yZWFkeVN0YXRlID09PSA0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmRNYW5hZ2VyLnN0YXJ0KCkudGhlbihyZWFkeS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5wbGF5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5JywgcmVhZHlFdmVudCwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVhZHkoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5JywgcmVhZHlFdmVudCwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZWFkeSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5wbGF5KCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwbGF5KGZyb21Vc2VyKSB7XHJcbiAgICAgICAgaWYoIXRoaXMucmVhZHkpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoZnJvbVVzZXIpIGRlbGV0ZSB0aGlzLmlzUGF1c2VkO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQucGxheSgpO1xyXG4gICAgICAgIHRoaXMuc291bmRNYW5hZ2VyLnJlc3VtZUFsbCgpO1xyXG5cclxuICAgICAgICBEaXNwYXRjaGVyLmVtaXQoXCJ2aWRlbzpwbGF5XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHBhdXNlKGZyb21Vc2VyKSB7XHJcbiAgICAgICAgaWYoIXRoaXMucmVhZHkpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoZnJvbVVzZXIpIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQucGF1c2UoKTtcclxuICAgICAgICB0aGlzLnNvdW5kTWFuYWdlci5wYXVzZUFsbCgpO1xyXG5cclxuICAgICAgICBEaXNwYXRjaGVyLmVtaXQoXCJ2aWRlbzpwYXVzZVwiKTtcclxuICAgIH1cclxuXHJcbiAgICB0b2dnbGUoKSB7XHJcbiAgICAgICAgaWYoIXRoaXMucmVhZHkpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYodGhpcy5pc1BhdXNlZCkgdGhpcy5wbGF5KHRydWUpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5wYXVzZSh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBjaGFuZ2VTb3VyY2VCYXNlZE9uQ29ubmVjdGlvbihwcm9ncmVzcyA9IDApIHtcclxuICAgICAgICBpZih0aGlzLnNvdXJjZUZvcmNlZEJ5VXNlcikgcmV0dXJuO1xyXG5cclxuICAgICAgICBwcm9ncmVzcyAqPSAxMDA7XHJcblxyXG4gICAgICAgIGxldCBjbGFzc05hbWUgPSBcImlzLVwiO1xyXG4gICAgICAgIGxldCBtZXNzYWdlICAgPSBcIlwiO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhgcHJvZ3Jlc3MgYWZ0ZXIgNTAwbXMgOiAke3Byb2dyZXNzfSVgKTtcclxuXHJcbiAgICAgICAgLy9TcGVjaWFsIGNhc2UgZm9yIGlPUywgb3IgaXQncyBjcmFzaC4uLlxyXG4gICAgICAgIGlmKFV0aWxzLmlvcygpIHx8IFV0aWxzLm1vYmlsZSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zcmMgPSBWSURFT1NbXCJTRFwiXTtcclxuICAgICAgICAgICAgY2xhc3NOYW1lICs9IFwic2RcIjtcclxuICAgICAgICAgICAgbWVzc2FnZSAgICA9IFwiU0RcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZihwcm9ncmVzcyA+IDEwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zcmMgPSBWSURFT1NbXCI0S1wiXTtcclxuICAgICAgICAgICAgY2xhc3NOYW1lICs9IFwiNGtcIjtcclxuICAgICAgICAgICAgbWVzc2FnZSAgICA9IFwiNEtcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZihwcm9ncmVzcyA+IDUpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNyYyA9IFZJREVPU1tcIkhEXCJdO1xyXG4gICAgICAgICAgICBjbGFzc05hbWUgKz0gXCJoZFwiO1xyXG4gICAgICAgICAgICBtZXNzYWdlICAgID0gXCJIRFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHByb2dyZXNzID4gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3JjID0gVklERU9TW1wiTURcIl07XHJcbiAgICAgICAgICAgIGNsYXNzTmFtZSArPSBcIm1kXCI7XHJcbiAgICAgICAgICAgIG1lc3NhZ2UgICAgPSBcIk1EXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjbGFzc05hbWUgKz0gXCJzZFwiO1xyXG4gICAgICAgICAgICBtZXNzYWdlICAgID0gXCJTRFwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hc3NpZ25lZFF1YWxpdHkgPSBPYmplY3Qua2V5cyhWSURFT1MpLmluZGV4T2YobWVzc2FnZSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJxdWFsaXR5XCJdW3ZhbHVlPVwiJyArIG1lc3NhZ2UgKyAnXCJdJykuc2V0U3RhdGUobWVzc2FnZSk7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGFiZWxbZm9yPVwicXVhbGl0eS0nICsgbWVzc2FnZS50b0xvd2VyQ2FzZSgpICsgJ1wiXScpLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICBtZXNzYWdlICs9IFwiIHZpZGVvIGxvYWRlZFwiO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhtZXNzYWdlKTtcclxuXHJcbiAgICAgICAgdGhpcy53cmFwcGVyLmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBjaGFuZ2VTb3VyY2VCYXNlZE9uVXNlcihkYXRhKSB7XHJcbiAgICAgICAgbGV0IGFjdHVhbFRpbWUgPSAwO1xyXG5cclxuICAgICAgICBpZihkYXRhLmZyb21TYXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc291cmNlRm9yY2VkQnlVc2VyID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucGF1c2UoKTtcclxuICAgICAgICAgICAgYWN0dWFsVGltZSA9IHRoaXMuZWxlbWVudC5jdXJyZW50VGltZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2hhbmdpbmdTb3VyY2UgPSB0cnVlO1xyXG5cclxuICAgICAgICBjb25zdCBxdWFsaXR5ICAgICAgPSBkYXRhLnZhbHVlLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgY29uc3QgcXVhbGl0eUluZGV4ID0gT2JqZWN0LmtleXMoVklERU9TKS5pbmRleE9mKHF1YWxpdHkpO1xyXG5cclxuICAgICAgICAvL0NoYW5nZSBzb3VyY2VcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3JjID0gVklERU9TW3F1YWxpdHldO1xyXG5cclxuICAgICAgICAvL0lmIG5ldyBzb3VyY2UgaXMgc3VwcGVyaW9yIHRvIHRoZSBhc3NpZ25lZCBvbmVcclxuICAgICAgICBpZihxdWFsaXR5SW5kZXggPCB0aGlzLmFzc2lnbmVkUXVhbGl0eSkge1xyXG4gICAgICAgICAgICB0aGlzLnZpZGVvUXVhbGl0eUlzU3VwZXJpb3IgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy52aWRlb1F1YWxpdHlJc1N1cGVyaW9yID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYWN0dWFsUXVhbGl0eSA9IC9pcy0oW2EtejAtOV17Mn0pLy5leGVjKHRoaXMud3JhcHBlci5jbGFzc05hbWUpO1xyXG5cclxuICAgICAgICBpZihhY3R1YWxRdWFsaXR5ICYmIGFjdHVhbFF1YWxpdHlbMF0pIHtcclxuICAgICAgICAgICAgdGhpcy53cmFwcGVyLmNsYXNzTmFtZSA9IHRoaXMud3JhcHBlci5jbGFzc05hbWUucmVwbGFjZShhY3R1YWxRdWFsaXR5WzBdLCBgaXMtJHtkYXRhLnZhbHVlLnRvTG93ZXJDYXNlKCl9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRlZG1ldGFkYXRhXCIsICgpID0+IHtcclxuICAgICAgICAgICAgaWYoZGF0YS5mcm9tU2F2ZSkgcmV0dXJuOyAvL0NhbmNlbCBpZiBzZXQgZnJvbSB1c2VyIHByZWZlcmVuY2UgOiB0aGUgdmlkZW8gaXNuJ3QgbG9hZGVkIHlldFxyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGltZShhY3R1YWxUaW1lKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc291bmRNYW5hZ2VyLnVubXV0ZUFsbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jaGFuZ2luZ1NvdXJjZTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zb3VuZE1hbmFnZXIudW5tdXRlQWxsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuY2hhbmdpbmdTb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihlcnIpIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sIGZhbHNlKTtcclxuXHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWaWRlbzsiLCIvKipcclxuICogQ3JlYXRlZCBieSBiYWVzdCBvbiAwMS8wOS8yMDE2LlxyXG4gKi9cclxuaW1wb3J0IERpc3BhdGNoZXIgZnJvbSBcIi4uL2NvcmUvRGlzcGF0Y2hlclwiO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSBcIi4uL2NvcmUvVXRpbHNcIjtcclxuaW1wb3J0IFNjcm9sbCBmcm9tICdzY3JvbGwnO1xyXG5cclxuY2xhc3MgVmlldyB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy53cmFwcGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3ZpZXdzJyk7XHJcbiAgICAgICAgdGhpcy5uYW1lICAgID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmlldycpO1xyXG5cclxuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50cygpO1xyXG4gICAgICAgIHRoaXMudmlld0Rpc3BhdGNoZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2hFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudE9uQ2xpY2sgPSB0aGlzLmNsaWNrSGFuZGxlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5ldmVudE9uQ2xpY2ssIGZhbHNlKTtcclxuXHJcbiAgICAgICAgRGlzcGF0Y2hlci5vbihcInZpZXc6Y2hhbmdlXCIsIHRoaXMuaGFuZGxlVmlld0NoYW5nZS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVmlld0NoYW5nZShkYXRhKSB7XHJcbiAgICAgICAgaWYoZGF0YS5ocmVmICYmIGRhdGEuaHJlZiA9PT0gdGhpcy5uYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZnJvbS1tZW51Jyk7XHJcbiAgICAgICAgICAgIHRoaXMud3JhcHBlci5jbGFzc0xpc3QuYWRkKCdmcm9tLW1lbnUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xpY2tIYW5kbGUoZXZlbnQpIHtcclxuICAgICAgICBpZihldmVudCAmJiBldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1wcmV2ZW50JykpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5pbkFjdGl2ZSh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBhY3RpdmUoZm9yY2UpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndmlldy0tYWN0aXZlJyk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKGBvbi12aWV3LS0ke3RoaXMubmFtZX1gKTtcclxuXHJcbiAgICAgICAgaWYoZm9yY2UpIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd2aWV3LS1mb3JjZWQnKTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH0sIDEwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5BY3RpdmUoKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKGBvbi12aWV3LS0ke3RoaXMubmFtZX1gKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2Zyb20tbWVudScpO1xyXG4gICAgICAgIHRoaXMud3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKCdmcm9tLW1lbnUnKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5oYXNMZWF2aW5nVHJhbnNpdGlvbigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd2aWV3LS1sZWF2aW5nJyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZXZlbnRUcmFuc2l0aW9uID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgndmlldy0tbGVhdmluZycpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBldmVudFRyYW5zaXRpb24pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBldmVudFRyYW5zaXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3ZpZXctLWFjdGl2ZScpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd2aWV3LS1mb3JjZWQnKTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZpZXdEaXNwYXRjaGVyKCkge1xyXG4gICAgICAgIGlmKHRoaXNbYGhhbmRsZVZpZXcke1V0aWxzLmNhcGl0YWxpemVGaXJzdExldHRlcih0aGlzLm5hbWUpfWBdKSB0aGlzW2BoYW5kbGVWaWV3JHtVdGlscy5jYXBpdGFsaXplRmlyc3RMZXR0ZXIodGhpcy5uYW1lKX1gXSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdvVG8odmlld05hbWUpIHtcclxuICAgICAgICBsZXQgdmlld3MgPSBBcnJheS5mcm9tKC4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXZpZXddJykpO1xyXG5cclxuICAgICAgICB2aWV3cy5mb3JFYWNoKCh2aWV3KSA9PiB7XHJcbiAgICAgICAgICAgIGlmKHZpZXcuZ2V0QXR0cmlidXRlKCdkYXRhLXZpZXcnKSA9PT0gdmlld05hbWUpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcuY2xhc3NMaXN0LmFkZCgndmlldy0tYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoYG9uLXZpZXctLSR7dmlld05hbWV9YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodGhpc1tgc2V0VmlldyR7VXRpbHMuY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKHRoaXMubmFtZSl9YF0pIHRoaXNbYHNldFZpZXcke1V0aWxzLmNhcGl0YWxpemVGaXJzdExldHRlcih0aGlzLm5hbWUpfWBdKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZih2aWV3LmdldEF0dHJpYnV0ZSgnZGF0YS12aWV3JykgIT09ICdvcmllbnRhdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIHZpZXcuY2xhc3NMaXN0LnJlbW92ZSgndmlldy0tYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBoYXNMZWF2aW5nVHJhbnNpdGlvbigpIHtcclxuICAgICAgICBsZXQgcmVzID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBzaGVldCA9IGRvY3VtZW50LnN0eWxlU2hlZXRzWzBdO1xyXG4gICAgICAgIGxldCBydWxlcyA9IHNoZWV0LnJ1bGVzID8gc2hlZXQucnVsZXMgOiAoc2hlZXQuY3NzUnVsZXMgPyBzaGVldC5jc3NSdWxlcyA6IFtdKTtcclxuXHJcbiAgICAgICAgQXJyYXkuZnJvbShydWxlcykuZm9yRWFjaChydWxlID0+IHtcclxuICAgICAgICAgICAgaWYocnVsZS5zZWxlY3RvclRleHQgJiYgfnJ1bGUuc2VsZWN0b3JUZXh0LmluZGV4T2YoYC52aWV3LS0ke3RoaXMubmFtZX0udmlldy0tbGVhdmluZ2ApKSB7XHJcbiAgICAgICAgICAgICAgICByZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVmlld0ludHJvKCkge1xyXG4gICAgICAgIGlmKCFVdGlscy5pb3MoKSB8fCAoVXRpbHMuaW9zKCkgJiYgVXRpbHMuaW9zKCkgPj0gMTApKSB0aGlzLmFjdGl2ZSgpO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgcGVyY2VudEVsZW1lbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkLXBlcmNlbnRcIik7XHJcbiAgICAgICAgbGV0IGxvYWRlckVsZW1lbnQgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYWRpbmcnKTtcclxuICAgICAgICBsZXQgbG9hZFBlcmNlbnQgICAgPSAwO1xyXG4gICAgICAgIGxldCBkZWNvZGVQZXJjZW50ICA9IDA7XHJcbiAgICAgICAgbGV0IGxvYWRlZCAgICAgICAgID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZXZlbnRPbkNsaWNrLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIGxldCBwcm9ncmVzc0V2ZW50ID0gKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgbG9hZFBlcmNlbnQgPSBkYXRhLnByb2dyZXNzO1xyXG5cclxuICAgICAgICAgICAgbGV0IHBlciA9IE1hdGgucm91bmQoKChNYXRoLmNlaWwobG9hZFBlcmNlbnQgKiAxMDApIC8gMTAwKSAqIDEwMCkgKiAuNikgKyBNYXRoLnJvdW5kKChkZWNvZGVQZXJjZW50ICogMTAwKSAqIC40KTtcclxuXHJcbiAgICAgICAgICAgIHBlcmNlbnRFbGVtZW50LmlubmVySFRNTCA9IGAke3Blcn0lYDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgZGVjb2RlZEV2ZW50ID0gKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgZGVjb2RlUGVyY2VudCA9IGRhdGEucHJvZ3Jlc3M7XHJcblxyXG4gICAgICAgICAgICBsZXQgcGVyID0gTWF0aC5yb3VuZCgoKE1hdGguY2VpbChsb2FkUGVyY2VudCAqIDEwMCkgLyAxMDApICogMTAwKSAqIC42KSArIE1hdGgucm91bmQoKGRlY29kZVBlcmNlbnQgKiAxMDApICogLjQpO1xyXG5cclxuICAgICAgICAgICAgcGVyY2VudEVsZW1lbnQuaW5uZXJIVE1MID0gYCR7cGVyfSVgO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBjbGlja0V2ZW50ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBEaXNwYXRjaGVyLmVtaXQoXCJsb2FkZXI6ZW5kXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWxvYWRlZCcpO1xyXG4gICAgICAgICAgICBsb2FkZXJFbGVtZW50LnBhcmVudE5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmVhZHknKTtcclxuICAgICAgICAgICAgbG9hZGVyRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNsaWNrRXZlbnQsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW5BY3RpdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgIERpc3BhdGNoZXIuZW1pdChcInZpZGVvOnN0YXJ0XCIpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIERpc3BhdGNoZXIub25jZShcInNvdW5kOmxvYWRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICBsb2FkZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgRGlzcGF0Y2hlci5vZmYoXCJzb3VuZDpwcm9ncmVzc1wiLCAgcHJvZ3Jlc3NFdmVudCk7XHJcbiAgICAgICAgICAgIERpc3BhdGNoZXIub2ZmKFwic291bmQ6ZGVjb2RlZFwiLCAgIGRlY29kZWRFdmVudCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtbG9hZGVkJyk7XHJcbiAgICAgICAgICAgIGxvYWRlckVsZW1lbnQucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKCdpcy1yZWFkeScpO1xyXG4gICAgICAgICAgICBsb2FkZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xpY2tFdmVudCwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1sb2FkaW5nJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIERpc3BhdGNoZXIub24oXCJzb3VuZDpwcm9ncmVzc1wiLCBwcm9ncmVzc0V2ZW50KTtcclxuICAgICAgICBEaXNwYXRjaGVyLm9uKFwic291bmQ6ZGVjb2RlZFwiLCBkZWNvZGVkRXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZVZpZXdUaXRsZSgpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmV2ZW50T25DbGljaywgZmFsc2UpO1xyXG5cclxuICAgICAgICBEaXNwYXRjaGVyLm9uY2UoXCJsb2FkZXI6ZW5kXCIsICgpID0+IHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluQWN0aXZlKCk7XHJcbiAgICAgICAgICAgICAgICBEaXNwYXRjaGVyLmVtaXQoXCJ2aWRlbzpzdGFydFwiKTtcclxuICAgICAgICAgICAgfSwgMTUwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVmlld0NyZWRpdHMoKSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZiAgPSB0aGlzO1xyXG4gICAgICAgIGxldCB2aWRlbyAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW4nKTtcclxuICAgICAgICBsZXQgY3JlZGl0cyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY3JlZGl0cycpO1xyXG5cclxuICAgICAgICBsZXQgb2JzZXJ2ZXJDb25maWcgPSB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogIGZhbHNlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSB9O1xyXG5cclxuICAgICAgICBsZXQgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XHJcbiAgICAgICAgICAgIG11dGF0aW9ucy5mb3JFYWNoKChtdXRhdGlvbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYobXV0YXRpb24uYXR0cmlidXRlTmFtZSA9PT0gXCJjbGFzc1wiICYmIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3ZpZXctLWFjdGl2ZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9BU2Nyb2xsVG9Cb3R0b20oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUodGhpcy5lbGVtZW50LCBvYnNlcnZlckNvbmZpZyk7XHJcblxyXG4gICAgICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoXCJ0aW1ldXBkYXRlXCIsICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHRpbWUgPSB2aWRlby5jdXJyZW50VGltZTtcclxuXHJcbiAgICAgICAgICAgIGlmKHRpbWUgPj0gNTcwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmV2ZW50T25DbGljaywgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmlkZW8uY2xhc3NMaXN0LmFkZCgnbW9kZS1jcmVkaXRzJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2aWRlby5jbGFzc0xpc3QucmVtb3ZlKCdtb2RlLWNyZWRpdHMnKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmV2ZW50T25DbGljaywgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjYW5jZWxQcmV2ZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJldmVudCgpIHtcclxuICAgICAgICAgICAgY3JlZGl0cy5vbndoZWVsICAgICAgPSBldmVudCA9PiBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBjcmVkaXRzLm9ubW91c2V3aGVlbCA9IGV2ZW50ID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGNyZWRpdHMub250b3VjaG1vdmUgID0gZXZlbnQgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgY3JlZGl0cy5vbmtleWRvd24gICAgPSBldmVudCA9PiBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FuY2VsUHJldmVudCgpIHtcclxuICAgICAgICAgICAgY3JlZGl0cy5vbndoZWVsICAgICAgPSBudWxsO1xyXG4gICAgICAgICAgICBjcmVkaXRzLm9ubW91c2V3aGVlbCA9IG51bGw7XHJcbiAgICAgICAgICAgIGNyZWRpdHMub250b3VjaG1vdmUgID0gbnVsbDtcclxuICAgICAgICAgICAgY3JlZGl0cy5vbmtleWRvd24gICAgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZG9BU2Nyb2xsVG9Cb3R0b20oKSB7XHJcbiAgICAgICAgICAgIGlmKHNlbGYuaXNBY3RpdmUpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGNyZWRpdHMuY2xhc3NMaXN0LnJlbW92ZSgnaXMtZW5kJyk7XHJcblxyXG4gICAgICAgICAgICBjcmVkaXRzLnNjcm9sbFRvcCA9IDA7XHJcblxyXG4gICAgICAgICAgICBsZXQgY2FuY2VsID0gU2Nyb2xsLnRvcChjcmVkaXRzLCBjcmVkaXRzLnNjcm9sbEhlaWdodCAtIHdpbmRvdy5pbm5lckhlaWdodCwge1xyXG4gICAgICAgICAgICAgICAgZWFzZTogY3JlYXRlanMuRWFzZS5saW5lYXIsXHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogKDMwICogMTAwMClcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY3JlZGl0cy5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIGNhbmNlbCk7XHJcbiAgICAgICAgICAgICAgICBjYW5jZWxQcmV2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBjcmVkaXRzLmNsYXNzTGlzdC5hZGQoJ2lzLWVuZCcpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHByZXZlbnQoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjYW5jZWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZVZpZXdJb3MoKSB7XHJcbiAgICAgICAgaWYoVXRpbHMuaW9zKCkgJiYgVXRpbHMuaW9zKCkgPCAxMCkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZXZlbnRPbkNsaWNrLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2FkZXInKS5jbGFzc0xpc3QuYWRkKCdpcy1oaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVmlld09yaWVudGF0aW9uKCkge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgb3JpZW50YXRpb25IYW5kbGVyKCk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvcmllbnRhdGlvbmNoYW5nZVwiLCBvcmllbnRhdGlvbkhhbmRsZXIsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5ldmVudE9uQ2xpY2ssIGZhbHNlKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb3JpZW50YXRpb25IYW5kbGVyKCkge1xyXG4gICAgICAgICAgICBsZXQgcHJldmlvdXNPcmllbnRhdGlvbiA9IHNlbGYub3JpZW50YXRpb247XHJcbiAgICAgICAgICAgIGxldCBwb3J0cmFpdCAgPSB3aW5kb3cubWF0Y2hNZWRpYShcIihvcmllbnRhdGlvbjogcG9ydHJhaXQpXCIpLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIGxldCBsYW5kc2NhcGUgPSB3aW5kb3cubWF0Y2hNZWRpYShcIihvcmllbnRhdGlvbjogbGFuZHNjYXBlKVwiKS5tYXRjaGVzO1xyXG5cclxuICAgICAgICAgICAgaWYocG9ydHJhaXQpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYub3JpZW50YXRpb24gPSBcInBvcnRyYWl0XCI7XHJcbiAgICAgICAgICAgICAgICBEaXNwYXRjaGVyLmVtaXQoXCJzY3JlZW46b3JpZW50YXRpb25cIiwgeyBuZXdPcmllbnRhdGlvbjogXCJwb3J0cmFpdFwiLCBwcmV2aW91c09yaWVudGF0aW9uIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYobGFuZHNjYXBlKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9yaWVudGF0aW9uID0gXCJsYW5kc2NhcGVcIjtcclxuICAgICAgICAgICAgICAgIERpc3BhdGNoZXIuZW1pdChcInNjcmVlbjpvcmllbnRhdGlvblwiLCB7IG5ld09yaWVudGF0aW9uOiBcImxhbmRzY2FwZVwiLCBwcmV2aW91c09yaWVudGF0aW9uIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVmlldzsiXX0=

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("ecs-framework"));
	else if(typeof define === 'function' && define.amd)
		define(["ecs-framework"], factory);
	else if(typeof exports === 'object')
		exports["ecs-keyframesystem"] = factory(require("ecs-framework"));
	else
		root["ecs-keyframesystem"] = factory(root["ecs-framework"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_4__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var PlaybackState;
(function (PlaybackState) {
    // First update flag to start
    PlaybackState[PlaybackState["started"] = 0] = "started";
    // Next will be in playing flag for the whole duration
    PlaybackState[PlaybackState["playing"] = 1] = "playing";
    // Ended once it reach the end of a timeline
    PlaybackState[PlaybackState["ended"] = 2] = "ended";
    // Next will be in stopped until it's start again
    PlaybackState[PlaybackState["stopped"] = 3] = "stopped";
    PlaybackState[PlaybackState["paused"] = 4] = "paused";
})(PlaybackState || (PlaybackState = {}));
exports.PlaybackState = PlaybackState;
var KeyFrameControllerComponent = /** @class */ (function () {
    function KeyFrameControllerComponent(entityId, active, from, duration, easingParams) {
        if (easingParams === void 0) { easingParams = { P1x: 0.0, P1y: 0.0, P2x: 1.0, P2y: 1.0 }; }
        this.entityId = entityId;
        this.active = active;
        this.from = from;
        this.duration = duration;
        this.easingParams = easingParams;
        this.nbLoop = 1;
        this.previousProgress = 0;
        this.progress = 0;
        this.playState = PlaybackState.stopped;
        this.timer = { count: 0, delta: 0, loopCount: 0, reverse: false, time: 0 };
        this.cycling = false;
        this.fadeLoop = false;
    }
    return KeyFrameControllerComponent;
}());
exports.KeyFrameControllerComponent = KeyFrameControllerComponent;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var KeyFrameController_1 = __webpack_require__(0);
exports.KeyFrameControllerComponent = KeyFrameController_1.KeyFrameControllerComponent;
exports.PlaybackState = KeyFrameController_1.PlaybackState;
var KeyFrameSystem_1 = __webpack_require__(3);
exports.KeyFrameSystem = KeyFrameSystem_1.KeyFrameSystem;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ecs_framework_1 = __webpack_require__(4);
var bezier = __webpack_require__(5);
var KeyFrameController_1 = __webpack_require__(0);
var defaultKeyFrameParam = {
    cycling: false,
    duration: 0,
    easingParams: { P1x: 0.0, P1y: 0.0, P2x: 1.0, P2y: 1.0 },
    fadeLoop: false,
    from: 0,
    nbLoop: 0,
    playState: KeyFrameController_1.PlaybackState.stopped,
    previousProgress: 0,
    progress: 0,
    timer: { count: 0, delta: 0, loopCount: 0, reverse: false, time: 0 },
};
var KeyFrameSystem = /** @class */ (function (_super) {
    __extends(KeyFrameSystem, _super);
    function KeyFrameSystem() {
        var _this = _super.call(this) || this;
        _this._defaultParameter = defaultKeyFrameParam;
        return _this;
    }
    KeyFrameSystem.prototype.execute = function (params, timeRef) {
        // if paused don't update
        if (params.playState[this._k.playState] === KeyFrameController_1.PlaybackState.paused) {
            return;
        }
        var loopEnded = params.timer[this._k.timer].loopCount >= params.nbLoop[this._k.nbLoop] && params.nbLoop[this._k.nbLoop] !== 0;
        // if loopCount reached end but not yet set to stopped
        if (loopEnded && params.playState[this._k.playState] === KeyFrameController_1.PlaybackState.ended) {
            params.playState[this._k.playState] = KeyFrameController_1.PlaybackState.stopped;
            params.timer[this._k.timer].count += 1;
            return;
        }
        // relative time
        var rFrom = params.from[this._k.from] * (params.timer[this._k.timer].loopCount + 1);
        var rEnd = params.from[this._k.from] + params.duration[this._k.duration] * (params.timer[this._k.timer].loopCount + 1);
        // start
        if ((params.playState[this._k.playState] === KeyFrameController_1.PlaybackState.stopped)
            && timeRef.time >= rFrom && timeRef.time <= rEnd && !loopEnded) {
            params.playState[this._k.playState] = KeyFrameController_1.PlaybackState.started;
            params.timer[this._k.timer].count += 1;
            // when we start directly in reverse
            if (params.timer[this._k.timer].reverse) {
                params.timer[this._k.timer].time = params.duration[this._k.duration];
            }
            return;
        }
        else if ((params.playState[this._k.playState] === KeyFrameController_1.PlaybackState.started || params.playState[this._k.playState] === KeyFrameController_1.PlaybackState.playing)
            && timeRef.time >= rFrom
            && timeRef.time <= rEnd
            && !loopEnded) {
            // playing
            params.playState[this._k.playState] = KeyFrameController_1.PlaybackState.playing;
            if (!params.timer[this._k.timer].reverse) {
                params.timer[this._k.timer].time += timeRef.delta;
            }
            else {
                params.timer[this._k.timer].time -= timeRef.delta;
            }
            params.timer[this._k.timer].delta = timeRef.delta;
            params.timer[this._k.timer].count += 1;
            var b = bezier(params.easingParams[this._k.easingParams].P1x, params.easingParams[this._k.easingParams].P1y, params.easingParams[this._k.easingParams].P2x, params.easingParams[this._k.easingParams].P2y);
            params.previousProgress[this._k.previousProgress] = params.progress[this._k.progress];
            params.progress[this._k.progress] = b(params.timer[this._k.timer].time / params.duration[this._k.duration]);
            return;
        }
        else if ((params.playState[this._k.playState] === KeyFrameController_1.PlaybackState.started || params.playState[this._k.playState] === KeyFrameController_1.PlaybackState.playing)
            && timeRef.time >= rFrom
            && timeRef.time > rEnd
            && !loopEnded) {
            // ending
            // when looping playState is set to ended only when all loop have completed otherwise it will set back to started
            //
            // a keyframe can be started and ended without being played if it duration is 1 for exemple
            // usefull for keyframe that trigger event but have no animation
            params.playState[this._k.playState] = KeyFrameController_1.PlaybackState.ended;
            params.timer[this._k.timer].loopCount += 1;
            params.timer[this._k.timer].count += 1;
            this.changeDirection(params, timeRef);
            return;
        }
    };
    KeyFrameSystem.prototype.changeDirection = function (params, timeRef) {
        if (params.timer[this._k.timer].loopCount >= params.nbLoop[this._k.nbLoop] && params.nbLoop[this._k.nbLoop] !== 0) {
            return;
        }
        // looping back from start
        if (!params.cycling[this._k.cycling]) {
            if (params.fadeLoop[this._k.fadeLoop]) {
                var delta = params.duration[this._k.duration] - params.timer[this._k.timer].time;
                var toStartDelta = timeRef.delta - delta;
                params.timer[this._k.timer].time = toStartDelta;
            }
            else {
                params.timer[this._k.timer].time = 0;
            }
        }
        else {
            // cycling
            params.timer[this._k.timer].reverse = !params.timer[this._k.timer].reverse;
            if (params.fadeLoop[this._k.fadeLoop]) {
            }
            else {
                if (params.timer[this._k.timer].reverse) {
                    params.timer[this._k.timer].time = params.duration[this._k.duration];
                }
                else {
                    params.timer[this._k.timer].time = 0;
                }
            }
        }
        var b = bezier(params.easingParams[this._k.easingParams].P1x, params.easingParams[this._k.easingParams].P1y, params.easingParams[this._k.easingParams].P2x, params.easingParams[this._k.easingParams].P2y);
        params.previousProgress[this._k.previousProgress] = params.progress[this._k.progress];
        params.progress[this._k.progress] = b(params.timer[this._k.timer].time / params.duration[this._k.duration]);
        params.playState[this._k.playState] = KeyFrameController_1.PlaybackState.started;
    };
    return KeyFrameSystem;
}(ecs_framework_1.System));
exports.KeyFrameSystem = KeyFrameSystem;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var require;var require;(function(f){if(true){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.BezierEasing = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return require(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;

var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

var float32ArraySupported = typeof Float32Array === 'function';

function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
function C (aA1)      { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

function binarySubdivide (aX, aA, aB, mX1, mX2) {
  var currentX, currentT, i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
   var currentSlope = getSlope(aGuessT, mX1, mX2);
   if (currentSlope === 0.0) {
     return aGuessT;
   }
   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
   aGuessT -= currentX / currentSlope;
 }
 return aGuessT;
}

module.exports = function bezier (mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  // Precompute samples table
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  if (mX1 !== mY1 || mX2 !== mY2) {
    for (var i = 0; i < kSplineTableSize; ++i) {
      sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
  }

  function getTForX (aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;

    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing (x) {
    if (mX1 === mY1 && mX2 === mY2) {
      return x; // linear
    }
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
};

},{}]},{},[1])(1)
});

/***/ })
/******/ ]);
});
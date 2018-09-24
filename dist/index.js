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
/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
// tslint:disable:object-literal-sort-keys
var easingFunctions = {
    // no easing, no acceleration
    linear: function (t) { return t; },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t * t; },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t * (2 - t); },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return (t < 0.5) ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    // accelerating from zero velocity
    easeInCubic: function (t) { return t * t * t; },
    // decelerating to zero velocity
    easeOutCubic: function (t) { return (--t) * t * t + 1; },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
    // accelerating from zero velocity
    easeInQuart: function (t) { return t * t * t * t; },
    // decelerating to zero velocity
    easeOutQuart: function (t) { return 1 - (--t) * t * t * t; },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t; },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t * t * t * t * t; },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t; },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t; },
};
exports.easingFunctions = easingFunctions;
// tslint:enable:object-literal-sort-keys


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var TimeLine_1 = __webpack_require__(3);
exports.AnimationDirection = TimeLine_1.AnimationDirection;
exports.Composite = TimeLine_1.Composite;
exports.FillMode = TimeLine_1.FillMode;
exports.Phase = TimeLine_1.Phase;
exports.PlaybackDirection = TimeLine_1.PlaybackDirection;
exports.PlayState = TimeLine_1.PlayState;
exports.TimelineSystem = TimeLine_1.TimelineSystem;
var EasingFunctions_1 = __webpack_require__(0);
exports.easingFunctions = EasingFunctions_1.easingFunctions;


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
var EasingFunctions_1 = __webpack_require__(0);
var AnimationDirection;
(function (AnimationDirection) {
    /** When playrate >= 0 */
    AnimationDirection[AnimationDirection["forwards"] = 0] = "forwards";
    /** When playrate < 0 */
    AnimationDirection[AnimationDirection["backwards"] = 1] = "backwards";
})(AnimationDirection = exports.AnimationDirection || (exports.AnimationDirection = {}));
var PlayDirection;
(function (PlayDirection) {
    PlayDirection[PlayDirection["forwards"] = 0] = "forwards";
    PlayDirection[PlayDirection["reverse"] = 1] = "reverse";
})(PlayDirection = exports.PlayDirection || (exports.PlayDirection = {}));
var Composite;
(function (Composite) {
    Composite[Composite["replace"] = 0] = "replace";
    Composite[Composite["add"] = 1] = "add";
    Composite[Composite["accumulate"] = 2] = "accumulate";
})(Composite = exports.Composite || (exports.Composite = {}));
var PlaybackDirection;
(function (PlaybackDirection) {
    PlaybackDirection[PlaybackDirection["normal"] = 0] = "normal";
    PlaybackDirection[PlaybackDirection["reverse"] = 1] = "reverse";
    PlaybackDirection[PlaybackDirection["alternate"] = 2] = "alternate";
    PlaybackDirection[PlaybackDirection["alternateReverse"] = 3] = "alternateReverse";
})(PlaybackDirection = exports.PlaybackDirection || (exports.PlaybackDirection = {}));
var Phase;
(function (Phase) {
    Phase[Phase["before"] = 0] = "before";
    Phase[Phase["active"] = 1] = "active";
    Phase[Phase["after"] = 2] = "after";
})(Phase = exports.Phase || (exports.Phase = {}));
var FillMode;
(function (FillMode) {
    FillMode[FillMode["none"] = 0] = "none";
    FillMode[FillMode["forwards"] = 1] = "forwards";
    FillMode[FillMode["backwards"] = 2] = "backwards";
    FillMode[FillMode["both"] = 3] = "both";
})(FillMode = exports.FillMode || (exports.FillMode = {}));
var PlayState;
(function (PlayState) {
    PlayState[PlayState["idle"] = 0] = "idle";
    PlayState[PlayState["started"] = 1] = "started";
    PlayState[PlayState["running"] = 2] = "running";
    PlayState[PlayState["paused"] = 3] = "paused";
    PlayState[PlayState["justFinished"] = 4] = "justFinished";
    PlayState[PlayState["finished"] = 5] = "finished";
})(PlayState = exports.PlayState || (exports.PlayState = {}));
exports.defaultParameters = {
    active: true,
    bezier: null,
    currentDirection: null,
    currentIteration: 0,
    directedProgress: null,
    duration: 0,
    easingFunction: "linear",
    // endDelay: 0,
    entityId: 0,
    fill: FillMode.both,
    iterationProgress: 0,
    iterationStart: 0,
    iterations: Infinity,
    playDirection: PlaybackDirection.normal,
    playRate: 1,
    progress: null,
    startDelay: 0,
    startTime: 0,
    state: PlayState.idle,
    time: null,
    transformedProgress: null,
};
var TimelineSystem = /** @class */ (function (_super) {
    __extends(TimelineSystem, _super);
    function TimelineSystem(_parentTMId, _parentTimeLineParameterIterator) {
        var _this = _super.call(this, exports.defaultParameters) || this;
        _this._parentTMId = _parentTMId;
        _this._parentTimeLineParameterIterator = _parentTimeLineParameterIterator;
        _parentTimeLineParameterIterator === undefined ? _this._isTMFrameEvent = true : _this._isTMFrameEvent = false;
        return _this;
    }
    TimelineSystem.prototype.process = function (frameEvent) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var state = this.getParentTimelineState(frameEvent);
        this._previousParentTmState = this._previousParentTmState || state;
        // only run if previous state of parent timeline was running, so that we can set children time line to finished or paused if the parent is, otherwise don't bother updating children time line.
        if (this._previousParentTmState !== PlayState.idle && this._previousParentTmState !== PlayState.finished && this._previousParentTmState !== PlayState.paused) {
            // this._previousParentTmState = state;
            var parentTM = this.getParentTimeLine(frameEvent);
            _super.prototype.process.apply(this, [parentTM].concat(args));
        }
        this._previousParentTmState = state;
    };
    TimelineSystem.prototype.execute = function (params, parentTimeline) {
        // const startDelay = 0;
        // console.log("bp");
        var endDelay = 0;
        var localTime = this.computeLocalTime(parentTimeline.time, params.startTime, params.playRate);
        var currentDirection = this.currentDirection(params.playDirection, params.currentIteration);
        // console.log(AnimationDirection[currentDirection]);
        var animationDirection = this.animationDirection(params.playRate);
        var iterationDuration = params.duration;
        var activeDuration = this.activeDuration(iterationDuration, params.iterations);
        var endTime = this.endTime(params.startDelay, activeDuration, endDelay);
        var beforeActiveBT = this.beforeActiveBoundaryTime(params.startDelay, endTime);
        var activeAfterBT = this.activeAfterBoundaryTime(params.startDelay, activeDuration, endTime);
        var currentPhase = this.phase(localTime, animationDirection, beforeActiveBT, activeAfterBT);
        var playState = this.playState(animationDirection, currentPhase, params.state, parentTimeline.state);
        var activeTime = this.activeTime(currentPhase, localTime, params.startDelay, params.fill, activeDuration);
        var progress = this.overallProgress(currentPhase, activeTime, iterationDuration, params.iterations, params.iterationStart);
        var iterationProgress = this.iterationProgress(currentPhase, params.iterationStart, progress, activeTime, iterationDuration, params.iterations);
        var currentIteration = this.currentIteration(currentPhase, activeTime, progress, params.iterations, iterationProgress);
        var directedProgress = this.directedProgress(iterationProgress, currentDirection);
        var transformedProgress;
        if (params.easingFunction !== null) {
            transformedProgress = this.transformedProgressEasingFunc(directedProgress, params.easingFunction);
        }
        else if (params.bezier !== null) {
            transformedProgress = this.transformedProgressBezier(directedProgress, params.bezier);
        }
        else {
            transformedProgress = this.transformedProgressEasingFunc(directedProgress, "linear");
        }
        params.progress = progress;
        params.iterationProgress = iterationProgress;
        params.currentIteration = currentIteration;
        params.directedProgress = directedProgress;
        params.currentDirection = currentDirection;
        params.transformedProgress = transformedProgress;
        params.state = playState;
        params.time = localTime;
        return params;
    };
    TimelineSystem.prototype.overallProgress = function (phase, activeTime, iterationDuration, iterationCount, iterationStart) {
        if (isNaN(activeTime)) {
            return null;
        }
        var progress = 0;
        if (iterationDuration === 0) {
            if (phase === Phase.before) {
                progress = 0;
            }
            else {
                progress = iterationCount;
            }
        }
        else {
            progress = activeTime / iterationDuration;
        }
        return progress + iterationStart;
    };
    /** The simple iteration progress is a fraction of the progress through the current iteration that ignores transformations to the time introduced by the playback direction or timing functions applied to the effect, and is calculated as follows:
     */
    TimelineSystem.prototype.iterationProgress = function (currentPhase, iterationStart, overallProgress, activeTime, iterationDuration, iterationCount) {
        var iterationProgress = 0;
        if (overallProgress === null) {
            iterationProgress = null;
        }
        else if (!isFinite(overallProgress)) {
            iterationProgress = iterationStart % 1.0;
        }
        else {
            iterationProgress = overallProgress % 1.0;
        }
        if (iterationProgress === 0 && currentPhase === Phase.after && iterationCount !== 0 && (activeTime !== 0 || iterationDuration === 0)) {
            iterationProgress = 1.0;
        }
        return iterationProgress;
    };
    TimelineSystem.prototype.currentIteration = function (currentPhase, activeTime, overallProgress, iterationCount, iterationProgress) {
        if (isNaN(activeTime)) {
            return null;
        }
        if (currentPhase === Phase.after && !isFinite(iterationCount)) {
            return Infinity;
        }
        else if (iterationProgress === 1.0) {
            return Math.floor(overallProgress) - 1;
        }
        else {
            return Math.floor(overallProgress);
        }
    };
    TimelineSystem.prototype.directedProgress = function (iterationProgress, currentDirection) {
        if (iterationProgress === null) {
            return null;
        }
        if (currentDirection === PlayDirection.forwards) {
            return iterationProgress;
        }
        else {
            return 1.0 - iterationProgress;
        }
    };
    TimelineSystem.prototype.currentDirection = function (playBackDirection, currentIteration) {
        if (playBackDirection === PlaybackDirection.normal) {
            return PlayDirection.forwards;
        }
        else if (playBackDirection === PlaybackDirection.reverse) {
            return PlayDirection.reverse;
        }
        else {
            var d = currentIteration;
            if (playBackDirection === PlaybackDirection.alternateReverse) {
                d += 1;
            }
            if (d % 2 === 0) {
                return PlayDirection.forwards;
            }
            else {
                return isFinite(d) ? PlayDirection.reverse : PlayDirection.forwards;
            }
        }
    };
    TimelineSystem.prototype.transformedProgressBezier = function (directedProgress, bezierparams) {
        if (directedProgress === null) {
            return null;
        }
        return bezier(bezierparams.P1x, bezierparams.P1y, bezierparams.P2x, bezierparams.P2y)(directedProgress);
    };
    TimelineSystem.prototype.transformedProgressEasingFunc = function (directedProgress, easing) {
        if (directedProgress === null) {
            return null;
        }
        return EasingFunctions_1.easingFunctions[easing](directedProgress);
    };
    // 3.9.3.1. Calculating the active time
    TimelineSystem.prototype.activeTime = function (phase, localTime, startDelay, fill, activeDuration) {
        switch (phase) {
            case Phase.before:
                if (fill === FillMode.backwards || fill === FillMode.both) {
                    return Math.max(localTime - startDelay, 0);
                }
                break;
            case Phase.active:
                return localTime - startDelay;
            case Phase.after:
                if (fill === FillMode.forwards || fill === FillMode.both) {
                    return Math.max(Math.min(localTime - startDelay, activeDuration), 0);
                }
                break;
            default:
                break;
        }
    };
    /** Time relative to startTime */
    TimelineSystem.prototype.computeLocalTime = function (timeLineTime, startTime, playBackRate) {
        return (timeLineTime - startTime) * playBackRate;
    };
    TimelineSystem.prototype.activeDuration = function (iterationDuration, iterationCount) {
        return iterationDuration * iterationCount || 0;
    };
    TimelineSystem.prototype.endTime = function (startDelay, activeDuration, endDelay) {
        return Math.max(startDelay + activeDuration + endDelay, 0);
    };
    TimelineSystem.prototype.animationDirection = function (playBackRate) {
        return playBackRate < 0 ? AnimationDirection.backwards : AnimationDirection.forwards;
    };
    TimelineSystem.prototype.beforeActiveBoundaryTime = function (startDelay, endTime) {
        return Math.max(Math.min(startDelay, endTime), 0);
    };
    TimelineSystem.prototype.activeAfterBoundaryTime = function (startDelay, activeDuration, endTime) {
        return Math.max(Math.min(startDelay + activeDuration, endTime), 0);
    };
    TimelineSystem.prototype.phase = function (localTime, animationDirection, beforeActiveBoundaryTime, activeAfterBoundaryTime) {
        if (localTime < beforeActiveBoundaryTime) {
            return Phase.before;
        }
        if (animationDirection === AnimationDirection.backwards && localTime === beforeActiveBoundaryTime) {
            return Phase.before;
        }
        // after phase
        if (localTime > activeAfterBoundaryTime) {
            return Phase.after;
        }
        if (animationDirection === AnimationDirection.forwards && localTime === activeAfterBoundaryTime) {
            return Phase.after;
        }
        // active phases
        return Phase.active;
    };
    TimelineSystem.prototype.playState = function (animationDirection, phase, previousState, parentState) {
        if (parentState === PlayState.paused || parentState === PlayState.finished || parentState === PlayState.idle) {
            return parentState;
        }
        switch (phase) {
            case Phase.active:
                return previousState === PlayState.idle ? PlayState.started : PlayState.running;
            case Phase.after:
                return (previousState === PlayState.justFinished || previousState === PlayState.finished) ? PlayState.finished : PlayState.justFinished;
            case Phase.before:
                // return PlayState.idle;
                return animationDirection === AnimationDirection.forwards ? PlayState.idle : (previousState === PlayState.running) ? PlayState.justFinished : PlayState.finished;
        }
    };
    TimelineSystem.prototype.getParentTimeLine = function (frameEvent) {
        if (this._isTMFrameEvent === true) {
            return {
                active: true,
                currentDirection: PlayDirection.forwards,
                // delta: frameEvent.delta,
                entityId: 0,
                playRate: 1,
                state: PlayState[frameEvent.state],
                time: frameEvent.time,
            };
        }
        else {
            return this._parentTimeLineParameterIterator.assembleParameters(this._parentTMId);
        }
    };
    TimelineSystem.prototype.getParentTimelineState = function (frameEvent) {
        return this._isTMFrameEvent === true ? PlayState[frameEvent.state] : this._parentTimeLineParameterIterator.getParameterValue(this._parentTMId, "state");
    };
    return TimelineSystem;
}(ecs_framework_1.System));
exports.TimelineSystem = TimelineSystem;


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
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ecs"] = factory();
	else
		root["ecs"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
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
var ecs_framework_1 = __webpack_require__(2);
var bezier = __webpack_require__(3);
exports.bezier = bezier;
var KeyFrameController_1 = __webpack_require__(4);
var KeyFrameSystem = /** @class */ (function (_super) {
    __extends(KeyFrameSystem, _super);
    function KeyFrameSystem() {
        return _super.call(this) || this;
    }
    KeyFrameSystem.changeDirection = function (c, timeRef) {
        if (c.timer.loopCount >= c.nbLoop && c.nbLoop !== 0) {
            return;
        }
        // looping back from start
        if (!c.cycling) {
            if (c.fadeLoop) {
                var delta = c.duration - c.timer.time;
                var toStartDelta = timeRef.delta - delta;
                c.timer.time = toStartDelta;
            }
            else {
                c.timer.time = 0;
            }
        }
        else {
            // cycling
            c.timer.reverse = !c.timer.reverse;
            if (c.fadeLoop) {
            }
            else {
                if (c.timer.reverse) {
                    c.timer.time = c.duration;
                }
                else {
                    c.timer.time = 0;
                }
            }
        }
        var b = bezier(c.easingParams.P1x, c.easingParams.P1y, c.easingParams.P2x, c.easingParams.P2y);
        c.progress = b(c.timer.time / c.duration);
        c.playState = KeyFrameController_1.PlaybackState.started;
    };
    KeyFrameSystem.prototype.execute = function (c, timeRef) {
        // if paused don't update
        if (c.playState === KeyFrameController_1.PlaybackState.paused) {
            return;
        }
        var loopEnded = c.timer.loopCount >= c.nbLoop && c.nbLoop !== 0;
        // if loopCount reached but not yet set to stopped
        if (loopEnded && c.playState === KeyFrameController_1.PlaybackState.ended) {
            c.playState = KeyFrameController_1.PlaybackState.stopped;
            c.timer.count += 1;
            return;
        }
        // relative time
        var rFrom = c.from * (c.timer.loopCount + 1);
        var rEnd = c.from + c.duration * (c.timer.loopCount + 1);
        // start
        if ((c.playState === KeyFrameController_1.PlaybackState.stopped)
            && timeRef.time >= rFrom && timeRef.time <= rEnd && !loopEnded) {
            c.playState = KeyFrameController_1.PlaybackState.started;
            c.timer.count += 1;
            // when we start directly in reverse
            if (c.timer.reverse) {
                c.timer.time = c.duration;
            }
            return;
        }
        else if ((c.playState === KeyFrameController_1.PlaybackState.started || c.playState === KeyFrameController_1.PlaybackState.playing)
            && timeRef.time >= rFrom
            && timeRef.time <= rEnd
            && !loopEnded) {
            // playing
            c.playState = KeyFrameController_1.PlaybackState.playing;
            if (!c.timer.reverse) {
                c.timer.time += timeRef.delta;
            }
            else {
                c.timer.time -= timeRef.delta;
            }
            c.timer.delta = timeRef.delta;
            c.timer.count += 1;
            var b = bezier(c.easingParams.P1x, c.easingParams.P1y, c.easingParams.P2x, c.easingParams.P2y);
            c.progress = b(c.timer.time / c.duration);
            return;
        }
        else if ((c.playState === KeyFrameController_1.PlaybackState.started || c.playState === KeyFrameController_1.PlaybackState.playing)
            && timeRef.time >= rFrom
            && timeRef.time > rEnd
            && !loopEnded) {
            // ending
            // when looping playState is set to ended only when all loop have completed otherwise it will set back to started
            //
            // a keyframe can be started and ended without being played if it duration is 1 for exemple
            // usefull for keyframe that trigger event but have no animation
            c.playState = KeyFrameController_1.PlaybackState.ended;
            c.timer.loopCount += 1;
            c.timer.count += 1;
            KeyFrameSystem.changeDirection(c, timeRef);
            return;
        }
    };
    return KeyFrameSystem;
}(ecs_framework_1.System));
exports.KeyFrameSystem = KeyFrameSystem;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ecs"] = factory();
	else
		root["ecs"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
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

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(typeof self !== 'undefined' ? self : this, function() {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var FastIterationMap = /** @class */ (function () {
    function FastIterationMap() {
        this._keys = new Map();
        this._values = [];
    }
    FastIterationMap.prototype.clear = function () {
        this._keys.clear();
        this._values = [];
    };
    FastIterationMap.prototype.delete = function (key) {
        var i = this._keys.get(key);
        var r = this._keys.delete(key);
        this.offsetIndexInKeys(i, -1);
        var r2 = this._values.splice(i, 1);
        if (r2.length > 0 && r) {
            return true;
        }
        else {
            return false;
        }
    };
    FastIterationMap.prototype.get = function (key) {
        return this._values[this._keys.get(key)];
    };
    FastIterationMap.prototype.has = function (key) {
        return this._keys.has(key);
    };
    FastIterationMap.prototype.insertAfter = function (key, value, keyRef) {
        if (this._keys.get(key) !== undefined) {
            return false;
        }
        var i = this._keys.get(keyRef);
        this.insertValue(key, value, i + 1);
        if (i === undefined) {
            return false;
        }
        else {
            this.offsetIndexInKeys(i, 1);
            this._keys.set(key, i + 1);
            return true;
        }
    };
    FastIterationMap.prototype.insertBefore = function (key, value, keyRef) {
        if (this._keys.get(key) !== undefined) {
            return false;
        }
        var i = this._keys.get(keyRef);
        this.insertValue(key, value, i);
        if (i === undefined) {
            return false;
        }
        else {
            this.offsetIndexInKeys(i - 1, 1);
            this._keys.set(key, i);
            return true;
        }
    };
    Object.defineProperty(FastIterationMap.prototype, "keys", {
        get: function () {
            return this._keys;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FastIterationMap.prototype, "length", {
        get: function () {
            return this._values.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FastIterationMap.prototype, "size", {
        get: function () {
            return this._values.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FastIterationMap.prototype, "values", {
        get: function () {
            return this._values;
        },
        enumerable: true,
        configurable: true
    });
    FastIterationMap.prototype.push = function (key, value) {
        var e = this._keys.get(key);
        // if the key doesn't exist add the element
        if (e === undefined) {
            var l = this._values.push(value);
            this._keys.set(key, l - 1);
        }
        else {
            // if the key is already there, update the value
            this._values[e] = value;
        }
        return this._values.length;
    };
    FastIterationMap.prototype.set = function (key, value) {
        return this.push(key, value);
    };
    FastIterationMap.prototype.swap = function (key1, key2) {
        var index1 = this._keys.get(key1);
        var index2 = this._keys.get(key2);
        if (index1 === undefined || index2 === undefined) {
            return false;
        }
        var tmp = this._values[index1];
        this._values[index1] = this._values[index2];
        this._values[index2] = tmp;
        this._keys.set(key1, index2);
        this._keys.set(key2, index1);
        return true;
    };
    FastIterationMap.prototype.insertValue = function (key, value, index) {
        return this._values.splice(index, 0, value);
    };
    // from exclusive
    // to exclusive
    FastIterationMap.prototype.offsetIndexInKeys = function (from, offsetVal, to) {
        var mapIter = this._keys.entries();
        var l = this._keys.size;
        to = to || Number.MAX_VALUE;
        for (var i = 0; i < l; ++i) {
            var e = mapIter.next().value;
            if (e[1] > from && e[1] < to) {
                this._keys.set(e[0], e[1] += offsetVal);
            }
        }
    };
    return FastIterationMap;
}());
exports.FastIterationMap = FastIterationMap;


/***/ })
/******/ ]);
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ComponentFactory_1 = __webpack_require__(3);
exports.ComponentFactory = ComponentFactory_1.ComponentFactory;
exports.EntityFactory = ComponentFactory_1.EntityFactory;
__webpack_require__(4);
var System_1 = __webpack_require__(5);
exports.System = System_1.System;
var SystemManager_1 = __webpack_require__(6);
exports.SystemManager = SystemManager_1.SystemManager;


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
var FastIterationMap_1 = __webpack_require__(0);
var ComponentFactory = /** @class */ (function (_super) {
    __extends(ComponentFactory, _super);
    function ComponentFactory(_size, componentType) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this._size = _size;
        _this._iterationLength = 0; // use by the system for iteration, avoid iterate over zeroed components
        _this._nbActive = 0;
        _this._nbInactive = 0;
        _this._nbCreated = 0;
        _this._zeroedRef = new (componentType.bind.apply(componentType, [void 0, 0, false].concat(args)))();
        _this._values.length = _this._size;
        for (var i = 0; i < _size; ++i) {
            _this.createZeroedComponentAt(i);
        }
        return _this;
    }
    ComponentFactory.prototype.activate = function (entityId, value) {
        var c = this.get(entityId);
        if (c.active !== value) {
            c.active = value;
            if (value) {
                this._nbActive += 1;
                this._nbInactive -= 1;
            }
            else {
                this._nbActive -= 1;
                this._nbInactive += 1;
            }
        }
    };
    /* Set the active proprety of all component in the pool */
    ComponentFactory.prototype.activateAll = function (value) {
        for (var i = 0; i < this.size; ++i) {
            this._values[i].active = value;
        }
        if (value) {
            this._nbActive = this._nbCreated;
            this._nbInactive = 0;
        }
        else {
            this._nbActive = 0;
            this._nbInactive = this._nbCreated;
        }
    };
    ComponentFactory.prototype.clear = function () {
        _super.prototype.clear.call(this);
        this._nbActive = 0;
        this._nbInactive = 0;
        this._nbCreated = 0;
        this._iterationLength = 0;
    };
    ComponentFactory.prototype.create = function (entityId, active) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var index;
        var toReplaceComp;
        // if the key doesn't exist yet
        if (!this.has(entityId)) {
            // get the key and index of the first zeroed component in the values array
            index = this.getIndexOfFirstAvailableSpot();
            if (index === -1) {
                throw new Error("no free slot available, please resize the pool");
            }
            else {
                // add the key of our newly created component and
                this._keys.set(entityId, index);
                this._nbCreated += 1;
                if (active) {
                    this._nbActive += 1;
                }
                else {
                    this._nbInactive += 1;
                }
                // replace all propreties value from the zeroed component
                toReplaceComp = this._values[index];
            }
        }
        else {
            index = this._keys.get(entityId);
            // replace all propreties value from the component to update
            toReplaceComp = this._values[index];
            if (toReplaceComp.active !== active) {
                if (active) {
                    this._nbActive += 1;
                    this._nbInactive -= 1;
                }
                else {
                    this._nbActive -= 1;
                    this._nbInactive += 1;
                }
            }
        }
        toReplaceComp.entityId = entityId;
        toReplaceComp.active = active;
        // lastly increment the lastActiveIndex
        this.incrementCreatedLength(index);
        return this._values[index];
    };
    ComponentFactory.prototype.delete = function (entityId) {
        var index = this._keys.get(entityId);
        if (index === undefined) {
            return false;
        }
        // update nbActive/Inactive counter
        if (this._values[index].active) {
            this._nbActive -= 1;
        }
        else {
            this._nbInactive -= 1;
        }
        // zeroed the component
        this.mapObject(this._values[index], this._zeroedRef);
        this._values[index].entityId = 0;
        this._keys.delete(entityId);
        this.decrementCreatedLength(index);
        this._nbCreated -= 1;
        return true;
    };
    ComponentFactory.prototype.recycle = function (indexComponentToReplace, componentRef) {
        var _this = this;
        // parsing Date ?
        // parsing Function ?
        var prop = JSON.parse(JSON.stringify(componentRef));
        this._values[indexComponentToReplace] = Object.create(componentRef);
        Object.keys(componentRef).forEach(function (p) {
            _this._values[indexComponentToReplace][p] = prop[p];
        });
    };
    ComponentFactory.prototype.resize = function (size) {
        var dif = size - this.size;
        if (dif > 0) {
            var oldL = this._values.length;
            this._values.length += dif;
            for (var i = 0; i < dif; ++i) {
                this.createZeroedComponentAt(oldL + i);
            }
        }
        else if (dif < 0) {
            dif = Math.abs(dif);
            for (var i = 0; i < dif; ++i) {
                var toDelete = this._values[this._values.length - 1];
                this._keys.delete(toDelete.entityId);
                this._values.pop();
            }
        }
        this._size += dif;
    };
    // overwrite fastIterationMap method we don't want to use
    ComponentFactory.prototype.insertAfter = function (key, value, keyRef) {
        return false;
    };
    ComponentFactory.prototype.insertBefore = function (key, value, keyRef) {
        return false;
    };
    ComponentFactory.prototype.createZeroedComponentAt = function (index) {
        this.recycle(index, this._zeroedRef);
        this._values[index].entityId = 0;
        this._values[index].active = false;
    };
    ComponentFactory.prototype.getIndexOfFirstAvailableSpot = function () {
        var l = this._values.length;
        for (var i = 0; i < l; ++i) {
            if (this._values[i].entityId === 0) {
                return i;
            }
        }
        return -1;
    };
    ComponentFactory.prototype.mapObject = function (oldC, newC) {
        for (var i in newC) {
            if (oldC.hasOwnProperty(i)) {
                oldC[i] = newC[i];
            }
        }
    };
    ComponentFactory.prototype.decrementCreatedLength = function (inputIndex) {
        if (inputIndex >= this._iterationLength - 1) {
            this._iterationLength -= 1;
        }
    };
    ComponentFactory.prototype.incrementCreatedLength = function (inputIndex) {
        if (inputIndex >= this._iterationLength) {
            this._iterationLength += 1;
        }
    };
    Object.defineProperty(ComponentFactory.prototype, "iterationLength", {
        get: function () {
            return this._iterationLength;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentFactory.prototype, "nbActive", {
        get: function () {
            return this._nbActive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentFactory.prototype, "nbInactive", {
        get: function () {
            return this._nbInactive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentFactory.prototype, "nbCreated", {
        get: function () {
            return this._nbCreated;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentFactory.prototype, "nbFreeSlot", {
        get: function () {
            return this._size - this._nbActive - this._nbInactive;
        },
        enumerable: true,
        configurable: true
    });
    return ComponentFactory;
}(FastIterationMap_1.FastIterationMap));
exports.ComponentFactory = ComponentFactory;
var EntityFactory = /** @class */ (function () {
    function EntityFactory(_size) {
        this._size = _size;
        this._factories = new Map();
    }
    EntityFactory.prototype.activate = function (entityId, value, factoriesName) {
        var _this = this;
        if (factoriesName) {
            factoriesName.forEach(function (f) {
                var ff = _this.getFactory(f);
                if (ff) {
                    ff.activate(entityId, value);
                }
            });
        }
        else {
            this._factories.forEach(function (f) {
                f.activate(entityId, value);
            });
        }
    };
    EntityFactory.prototype.activateAll = function (value) {
        this._factories.forEach(function (f) {
            f.activateAll(value);
        });
    };
    EntityFactory.prototype.addFactory = function (name, factory) {
        if (factory.size !== this._size) {
            factory.resize(this._size);
        }
        this._factories.set(name, factory);
    };
    EntityFactory.prototype.getComponent = function (entityId, factoryName) {
        var f = this._factories.get(factoryName);
        if (f) {
            return f.get(entityId);
        }
        else {
            return undefined;
        }
    };
    EntityFactory.prototype.getFactory = function (name) {
        return this._factories.get(name);
    };
    EntityFactory.prototype.delete = function (entityId) {
        var d = true;
        this._factories.forEach(function (f) {
            if (!f.delete(entityId)) {
                d = false;
            }
        });
        // false if no factories
        return this._factories.size > 0 && d;
    };
    EntityFactory.prototype.get = function (entityId) {
        var e = [];
        this._factories.forEach(function (f) {
            e.push(f.get(entityId));
        });
        return e;
    };
    EntityFactory.prototype.has = function (entityId) {
        var it = this._factories.entries();
        return it.next().value[1].has(entityId);
    };
    EntityFactory.prototype.create = function (entityId, active) {
        this._factories.forEach(function (f) {
            f.create(entityId, active);
        });
    };
    EntityFactory.prototype.resize = function (size) {
        this._factories.forEach(function (f) {
            f.resize(size);
        });
        this._size = size;
    };
    Object.defineProperty(EntityFactory.prototype, "iterationLength", {
        get: function () {
            // return iteratorLength of the first factory;
            var it = this._factories.entries();
            return it.next().value[1].iterationLength;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityFactory.prototype, "nbActive", {
        get: function () {
            var it = this._factories.entries();
            return it.next().value[1].nbActive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityFactory.prototype, "nbCreated", {
        get: function () {
            var it = this._factories.entries();
            return it.next().value[1].nbCreated;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityFactory.prototype, "nbFreeSlot", {
        get: function () {
            var it = this._factories.entries();
            return it.next().value[1].nbFreeSlot;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityFactory.prototype, "nbInactive", {
        get: function () {
            var it = this._factories.entries();
            return it.next().value[1].nbInactive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityFactory.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    return EntityFactory;
}());
exports.EntityFactory = EntityFactory;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// interface IFrameEvent {
//     /* The number of times the frame event was fired */
//     count: number;
//     /* The time passed in seconds since the last frame event */
//     delta: number;
//     loopCount: number;
//     reverse: boolean;
//     /* The total amount of time passed since the first frame event in seconds */
//     time: number;
// }


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// A factory for each parameters of the exectute function
var System = /** @class */ (function () {
    // public active: boolean = true;
    function System() {
    }
    /**  Set the source of the components that will be processed.
     * One factory per component parameters in the order requested by the executed method.
     * i.e :setFactories(movingFactory, movingFactory, iaFactory);
     */
    System.prototype.setFactories = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.factories = args;
    };
    // Query the components and execute active ones
    System.prototype.process = function (args) {
        var flist = this.factories;
        var l = flist[0].iterationLength;
        var f = flist[0].values;
        for (var i = 0; i < l; ++i) {
            // get the component from the first factory that serve as a reference
            // if it is active query the other components
            var refComponent = f[i];
            if (refComponent.active) {
                // Array that hold component that will be used by the execute function
                var arr = [];
                arr.push(refComponent);
                var isFound = true;
                // Iterate others factories to query rest of the components
                for (var j = 1; j < flist.length; ++j) {
                    // If the factory is the same as the factory that serve as a reference
                    // we push the same component to the args array,
                    // otherwise we query the component though get(entityId)
                    if (flist[j] === flist[0]) {
                        arr.push(refComponent);
                    }
                    else {
                        var c = flist[j].get(refComponent.entityId);
                        if (!c) {
                            isFound = false;
                            break;
                        }
                        arr.push(c);
                    }
                }
                if (isFound) {
                    // add eventual parameters passed to the process function at the end of the execute parameters list
                    if (args) {
                        var al = args.length;
                        for (var a = 0; a < al; ++a) {
                            arr.push(args[a]);
                        }
                    }
                    this.execute.apply(null, arr);
                }
            }
        }
    };
    return System;
}());
exports.System = System;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var FastIterationMap_1 = __webpack_require__(0);
var TimeMeasure_1 = __webpack_require__(7);
var SystemWithStates = /** @class */ (function () {
    function SystemWithStates(id, system) {
        this.active = true;
        this._measureTime = false;
        this.perfMeasure = new TimeMeasure_1.TimeMeasure(id);
        this.system = system;
        this.process = this.processDefault;
    }
    SystemWithStates.prototype.setFactories = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = this._system).setFactories.apply(_a, args);
        var _a;
    };
    SystemWithStates.prototype.processWithTimeMeasure = function (args) {
        this.perfMeasure.placeStartMark();
        this._system.process(args);
        this.perfMeasure.placeEndingMark();
        // measure and compute then clear data so we don't use memory since it's run in infinit loop
        this.perfMeasure.measure();
        this.perfMeasure.computeData();
        this.perfMeasure.clearData();
    };
    SystemWithStates.prototype.processDefault = function (args) {
        this._system.process(args);
    };
    Object.defineProperty(SystemWithStates.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SystemWithStates.prototype, "system", {
        get: function () {
            return this._system;
        },
        set: function (system) {
            this._system = system;
            this.perfMeasure.buildMark(this._id);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SystemWithStates.prototype, "measureTime", {
        set: function (val) {
            this._measureTime = val;
            if (val) {
                this.process = this.processWithTimeMeasure;
            }
            else {
                this.process = this.processDefault;
            }
        },
        enumerable: true,
        configurable: true
    });
    return SystemWithStates;
}());
// renomage necessaire fixed et non fixedTimeStep
// en realité les 2 sont executés en fixedTimeSteps
// seulement l'un est executer plusieurs fois si possible
var SystemManager = /** @class */ (function () {
    function SystemManager() {
        this.fixedTimeStepSystems = new FastIterationMap_1.FastIterationMap();
        this.nonFixedTimeStepSystems = new FastIterationMap_1.FastIterationMap();
    }
    /* Add a system to be processed in fixed time step or independently */
    SystemManager.prototype.pushSystem = function (system, fixedTimeStep) {
        if (fixedTimeStep === void 0) { fixedTimeStep = true; }
        var id = this.generateId(system);
        var sysWState = new SystemWithStates(id, system);
        if (fixedTimeStep) {
            this.fixedTimeStepSystems.push(id, sysWState);
        }
        else {
            this.nonFixedTimeStepSystems.push(id, sysWState);
        }
        return id;
    };
    SystemManager.prototype.getFixedTSSystems = function () {
        return this.fixedTimeStepSystems.values;
    };
    SystemManager.prototype.getNonFixedTSSystems = function () {
        return this.nonFixedTimeStepSystems.values;
    };
    /* Get a system by its id.
    /*  return undefined if not found.
    */
    SystemManager.prototype.get = function (systemId) {
        if (this.fixedTimeStepSystems.has(systemId)) {
            return this.fixedTimeStepSystems.get(systemId);
        }
        else if (this.nonFixedTimeStepSystems.has(systemId)) {
            return this.nonFixedTimeStepSystems.get(systemId);
        }
        return undefined;
    };
    /* Generate an Id with the System class name + a number if more than one instance in the SystemManager.
    /* i.e : System, System_1, System_2
    */
    SystemManager.prototype.generateId = function (system) {
        var stringName = system.constructor.name;
        var nbChar = stringName.length;
        var found = this.getListOfSystemId(stringName);
        if (found.length === 0) {
            return stringName;
        }
        else {
            // get the max number amound insances found
            var max_1 = null;
            found.forEach(function (k) {
                // if "_" then there is a number
                var numberIndex = k.indexOf("_");
                if (numberIndex !== -1) {
                    var num = Number(k.substring(k.length, numberIndex + 1));
                    if (num > max_1) {
                        max_1 = num;
                    }
                }
            });
            // found an instance without number
            if (max_1 === null) {
                return stringName + "_" + 1;
            }
            else {
                max_1 += 1;
                return stringName + "_" + max_1;
            }
        }
    };
    SystemManager.prototype.getListOfSystemId = function (className) {
        var res = [];
        // find all instance name
        this.fixedTimeStepSystems.keys.forEach(function (s, k) {
            // if already an instance of this system
            if (k.indexOf(className) === 0) {
                res.push(k);
            }
        });
        this.nonFixedTimeStepSystems.keys.forEach(function (s, k) {
            // if already an instance of this system
            if (k.indexOf(className) === 0) {
                res.push(k);
            }
        });
        return res;
    };
    SystemManager.prototype.orderSystem = function () {
    };
    return SystemManager;
}());
exports.SystemManager = SystemManager;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(8);
var TimeMeasure = /** @class */ (function () {
    function TimeMeasure(id) {
        this.performance = window.performance;
        this._min = Number.MAX_VALUE;
        this._max = 0;
        this._mean = 0;
        this.buildMark(id);
    }
    TimeMeasure.prototype.buildMark = function (id) {
        this._id = id;
        this._startingMark = id + "-start";
        this._endingMark = id + "-end";
    };
    TimeMeasure.prototype.placeStartMark = function () {
        this.performance.mark(this._startingMark);
    };
    TimeMeasure.prototype.placeEndingMark = function () {
        this.performance.mark(this._endingMark);
    };
    TimeMeasure.prototype.measure = function () {
        this.performance.measure(this._id, this._startingMark, this._endingMark);
    };
    TimeMeasure.prototype.clearData = function () {
        this.performance.clearMeasures(this._id);
    };
    /* Set the max, min, and mean value from the performance.measure data set */
    TimeMeasure.prototype.computeData = function () {
        var measures = this.performance.getEntriesByName(this._id);
        var l = measures.length;
        var min = Number.MAX_VALUE;
        var max = 0;
        var mean = 0;
        for (var i = 0; i < l; ++i) {
            var d = measures[i].duration;
            if (d < min) {
                min = d;
            }
            if (d > max) {
                max = d;
            }
            mean += d;
        }
        mean /= l;
        this._mean = mean;
        this._max = max;
        this._min = min;
    };
    Object.defineProperty(TimeMeasure.prototype, "data", {
        get: function () {
            return this.performance.getEntriesByName(this._id);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeMeasure.prototype, "mean", {
        get: function () {
            return this._mean;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeMeasure.prototype, "min", {
        get: function () {
            return this._min;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeMeasure.prototype, "max", {
        get: function () {
            return this._max;
        },
        enumerable: true,
        configurable: true
    });
    return TimeMeasure;
}());
exports.TimeMeasure = TimeMeasure;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * User Timing polyfill (http://www.w3.org/TR/user-timing/)
 * @author RubaXa <trash@rubaxa.org>
 */
(function (scope){
	var
		  startOffset = Date.now ? Date.now() : +(new Date)
		, performance = scope.performance || {}

		, _entries = []
		, _marksIndex = {}

		, _filterEntries = function (key, value){
			var i = 0, n = _entries.length, result = [];
			for( ; i < n; i++ ){
				if( _entries[i][key] == value ){
					result.push(_entries[i]);
				}
			}
			return	result;
		}

		, _clearEntries = function (type, name){
			var i = _entries.length, entry;
			while( i-- ){
				entry = _entries[i];
				if( entry.entryType == type && (name === void 0 || entry.name == name) ){
					_entries.splice(i, 1);
				}
			}
		}
	;


	if( !performance.now ){
		performance.now = performance.webkitNow || performance.mozNow || performance.msNow || function (){
			return (Date.now ? Date.now() : +(new Date)) - startOffset;
		};
	}


	if( !performance.mark ){
		performance.mark = performance.webkitMark || function (name){
			var mark = {
				  name:			name
				, entryType:	'mark'
				, startTime:	performance.now()
				, duration:		0
			};
			_entries.push(mark);
			_marksIndex[name] = mark;
		};
	}


	if( !performance.measure ){
		performance.measure = performance.webkitMeasure || function (name, startMark, endMark){
			startMark	= _marksIndex[startMark].startTime;
			endMark		= _marksIndex[endMark].startTime;

			_entries.push({
				  name:			name
				, entryType:	'measure'
				, startTime:	startMark
				, duration:		endMark - startMark
			});
		};
	}


	if( !performance.getEntriesByType ){
		performance.getEntriesByType = performance.webkitGetEntriesByType || function (type){
			return _filterEntries('entryType', type);
		};
	}


	if( !performance.getEntriesByName ){
		performance.getEntriesByName = performance.webkitGetEntriesByName || function (name){
			return _filterEntries('name', name);
		};
	}


	if( !performance.clearMarks ){
		performance.clearMarks = performance.webkitClearMarks || function (name){
			_clearEntries('mark', name);
		};
	}


	if( !performance.clearMeasures ){
		performance.clearMeasures = performance.webkitClearMeasures || function (name){
			_clearEntries('measure', name);
		};
	}


	// exports
	scope.performance = performance;

	if( true ){
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function (){ return performance }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}
})(self);


/***/ })
/******/ ]);
});

/***/ }),
/* 3 */
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

/***/ }),
/* 4 */
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
        this.progress = 0;
        this.playState = PlaybackState.stopped;
        this.timer = { count: 0, delta: 0, loopCount: 0, reverse: false, time: 0 };
        this.cycling = false;
        this.fadeLoop = false;
    }
    return KeyFrameControllerComponent;
}());
exports.KeyFrameControllerComponent = KeyFrameControllerComponent;


/***/ })
/******/ ]);
});
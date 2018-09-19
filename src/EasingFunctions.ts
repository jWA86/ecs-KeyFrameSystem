
export { easingFunctions, IEasingFunctions };
interface IEasingFunctions {
    linear: (t) => number;
    easeInQuad: (t) => number;
    easeOutQuad: (t) => number;
    easeInOutQuad: (t) => number;
    easeInCubic: (t) => number;
    easeOutCubic: (t) => number;
    easeInOutCubic: (t) => number;
    easeInQuart: (t) => number;
    easeOutQuart: (t) => number;
    easeInOutQuart: (t) => number;
    easeInQuint: (t) => number;
    easeOutQuint: (t) => number;
    easeInOutQuint: (t) => number;
}
/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
// tslint:disable:object-literal-sort-keys
const easingFunctions: IEasingFunctions = {
    // no easing, no acceleration
    linear: (t: number) => t,
    // accelerating from zero velocity
    easeInQuad: (t: number) => t * t,
    // decelerating to zero velocity
    easeOutQuad: (t) => t * (2 - t),
    // acceleration until halfway, then deceleration
    easeInOutQuad: (t) => (t < 0.5) ? 2 * t * t : -1 + (4 - 2 * t) * t,
    // accelerating from zero velocity
    easeInCubic: (t) => t * t * t,
    // decelerating to zero velocity
    easeOutCubic: (t) => (--t) * t * t + 1,
    // acceleration until halfway, then deceleration
    easeInOutCubic: (t) => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    // accelerating from zero velocity
    easeInQuart: (t) => t * t * t * t,
    // decelerating to zero velocity
    easeOutQuart: (t) => 1 - (--t) * t * t * t,
    // acceleration until halfway, then deceleration
    easeInOutQuart: (t) => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    // accelerating from zero velocity
    easeInQuint: (t) => t * t * t * t * t,
    // decelerating to zero velocity
    easeOutQuint: (t) => 1 + (--t) * t * t * t * t,
    // acceleration until halfway, then deceleration
    easeInOutQuint: (t) => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
};
// tslint:enable:object-literal-sort-keys

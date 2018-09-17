/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
// tslint:disable:object-literal-sort-keys
export default class EasingFunctions {

    // no easing, no acceleration
    public static linear = (t: number) => t;
    // accelerating from zero velocity
    public static easeInQuad = (t: number) => t * t;
    // decelerating to zero velocity
    public static easeOutQuad = (t) => t * (2 - t);
    // acceleration until halfway, then deceleration
    public static easeInOutQuad = (t) => (t < 0.5) ? 2 * t * t : -1 + (4 - 2 * t) * t;
    // accelerating from zero velocity
    public static easeInCubic = (t) => t * t * t;
    // decelerating to zero velocity
    public static easeOutCubic = (t) => (--t) * t * t + 1;
    // acceleration until halfway, then deceleration
    public static easeInOutCubic = (t) => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    // accelerating from zero velocity
    public static easeInQuart = (t) => t * t * t * t;
    // decelerating to zero velocity
    public static easeOutQuart = (t) => 1 - (--t) * t * t * t;
    // acceleration until halfway, then deceleration
    public static easeInOutQuart = (t) => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    // accelerating from zero velocity
    public static easeInQuint = (t) => t * t * t * t * t;
    // decelerating to zero velocity
    public static easeOutQuint = (t) => 1 + (--t) * t * t * t * t;
    // acceleration until halfway, then deceleration
    public static easeInOutQuint = (t) => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
}
// tslint:enable:object-literal-sort-keys

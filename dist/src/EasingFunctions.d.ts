export { easingFunctions, IEasingFunctions };
interface IEasingFunctions {
    linear: (t: any) => number;
    easeInQuad: (t: any) => number;
    easeOutQuad: (t: any) => number;
    easeInOutQuad: (t: any) => number;
    easeInCubic: (t: any) => number;
    easeOutCubic: (t: any) => number;
    easeInOutCubic: (t: any) => number;
    easeInQuart: (t: any) => number;
    easeOutQuart: (t: any) => number;
    easeInOutQuart: (t: any) => number;
    easeInQuint: (t: any) => number;
    easeOutQuint: (t: any) => number;
    easeInOutQuint: (t: any) => number;
}
declare const easingFunctions: IEasingFunctions;

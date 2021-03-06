import { interfaces, ParametersSourceIterator, System } from "ecs-framework";
import { IEasingFunctions } from "./EasingFunctions";
export interface IBezierParams {
    P1x: number;
    P1y: number;
    P2x: number;
    P2y: number;
}
export declare enum AnimationDirection {
    /** When playrate >= 0 */
    "forwards" = 0,
    /** When playrate < 0 */
    "backwards" = 1
}
export declare enum PlayDirection {
    "forwards" = 0,
    "reverse" = 1
}
export declare enum Composite {
    replace = 0,
    add = 1,
    accumulate = 2
}
export declare enum PlaybackDirection {
    normal = 0,
    reverse = 1,
    alternate = 2,
    alternateReverse = 3
}
export declare enum Phase {
    "before" = 0,
    "active" = 1,
    "after" = 2
}
export declare enum FillMode {
    none = 0,
    forwards = 1,
    backwards = 2,
    both = 3
}
export declare enum PlayState {
    idle = 0,
    started = 1,
    running = 2,
    paused = 3,
    justFinished = 4,
    finished = 5
}
export interface ITimingOptions {
    iterationDuration: number;
    startTime: number;
    startDelay: number;
    iterationStart: number | null;
    playRate: number;
    playDirection: PlaybackDirection;
    iterations: number;
    easingFunction: keyof IEasingFunctions | null;
    bezier: IBezierParams | null;
    fill: FillMode;
}
export interface IParentTimeline extends interfaces.IComponent {
    time: number;
    playRate: number;
    currentDirection: PlayDirection;
    state: PlayState;
    currentIteration: number;
    iterationDuration: number;
}
export interface ITimelineProgress extends interfaces.IComponent {
    progress: number;
    iterationProgress: number;
    currentIteration: number;
    directedProgress: number;
    transformedProgress: number;
}
export interface ITimelineParams extends IParentTimeline, ITimingOptions, ITimelineProgress {
}
export declare const defaultParameters: ITimelineParams;
export declare class TimelineSystem extends System<ITimelineParams> {
    protected _parentTMId?: number;
    protected _parentTimeLineParameterIterator?: ParametersSourceIterator<IParentTimeline>;
    protected _isTMFrameEvent: boolean;
    protected _previousParentTmState: PlayState;
    constructor(_parentTMId?: number, _parentTimeLineParameterIterator?: ParametersSourceIterator<IParentTimeline>);
    process(frameEvent: interfaces.IFrameEvent, ...args: any[]): void;
    execute(params: ITimelineParams, parentTimeline: IParentTimeline): ITimelineParams;
    overallProgress(phase: Phase, activeTime: number, iterationDuration: number, iterationCount: number, iterationStart: number): number;
    /** The simple iteration progress is a fraction of the progress through the current iteration that ignores transformations to the time introduced by the playback direction or timing functions applied to the effect, and is calculated as follows:
     */
    iterationProgress(currentPhase: Phase, iterationStart: number, overallProgress: number, activeTime: number, iterationDuration: number, iterationCount: number): number;
    currentIteration(currentPhase: Phase, activeTime: number, overallProgress: number, iterationCount: number, iterationProgress: number): number;
    directedProgress(iterationProgress: number, currentDirection: PlayDirection): number;
    currentDirection(playBackDirection: PlaybackDirection, currentIteration: number): PlayDirection;
    transformedProgressBezier(directedProgress: number, bezierparams: IBezierParams): number;
    transformedProgressEasingFunc(directedProgress: number, easing: keyof IEasingFunctions): number;
    activeTime(phase: Phase, localTime: number, startDelay: number, fill: FillMode, activeDuration: number): number;
    /** Time relative to startTime */
    computeLocalTime(parentTimeLineTime: number, startTime: number, playBackRate: number, parentCurrentIteration: number, iterationDuration: number): number;
    activeDuration(iterationDuration: number, iterationCount: number): number;
    endTime(startDelay: number, activeDuration: number, endDelay: number): number;
    animationDirection(playBackRate: number): AnimationDirection;
    beforeActiveBoundaryTime(startDelay: number, endTime: number): number;
    activeAfterBoundaryTime(startDelay: number, activeDuration: number, endTime: number): number;
    phase(localTime: number, animationDirection: AnimationDirection, beforeActiveBoundaryTime: number, activeAfterBoundaryTime: number): Phase;
    playState(animationDirection: AnimationDirection, phase: Phase, previousState: PlayState, parentState: PlayState): PlayState;
    protected getParentTimeLine(frameEvent: interfaces.IFrameEvent): IParentTimeline;
    protected getParentTimelineState(frameEvent: interfaces.IFrameEvent): PlayState;
}

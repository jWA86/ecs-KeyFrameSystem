import { interfaces, ParametersSourceIterator, System } from "ecs-framework";
import * as bezier from "../node_modules/bezier-easing/dist/bezier-easing.js";
import { easingFunctions, IEasingFunctions } from "./EasingFunctions";

export interface IBezierParams { P1x: number; P1y: number; P2x: number; P2y: number; }

export enum AnimationDirection {
    /** When playrate >= 0 */
    "forwards",
    /** When playrate < 0 */
    "backwards",
}

export enum PlayDirection {
    "forwards",
    "reverse",
}

export enum Composite {
    replace,
    add,
    accumulate,
}

export enum PlaybackDirection {
    normal,
    reverse,
    alternate, // odd iterations are played in reverse, even as specified
    alternateReverse, // even iterations are played in reverse, odd as specified
}

export enum Phase {
    "before",
    "active",
    "after",
}

export enum FillMode {
    none, // progress set to null
    forwards, // progress retains the max last value when playing forwards
    backwards, // progress retains the last value when playing backwards
    both, // progress retains value in any direction of play
}

export enum PlayState {
    idle, // not yet started
    started, // first update of progress
    running, // active time
    paused,
    justFinished, // last update of progress
    finished, // finished all iterations
}

export interface ITimingOptions {
    iterationDuration: number;
    startTime: number; // relative to the parent timeline
    startDelay: number; // offset from the startTime, use to compute iterationStart (ie: skip part)
    iterationStart: number | null; // ie: 0.5 would start half way
    // endDelay: number; // offset from the end
    playRate: number;
    playDirection: PlaybackDirection; // direction to be played at each repetition
    iterations: number; // the number of iterations to be played
    easingFunction: keyof IEasingFunctions | null; // scale time by an easing function
    bezier: IBezierParams | null;
    fill: FillMode;
    // composite: Composite;
}

export interface IParentTimeline extends interfaces.IComponent {
    time: number; // current time
    playRate: number;
    currentDirection: PlayDirection;
    state: PlayState;
    currentIteration: number;
    iterationDuration: number;
    // delta: number;
}

export interface ITimelineProgress extends interfaces.IComponent {
    progress: number; // overall progress
    iterationProgress: number;
    currentIteration: number;
    directedProgress: number;
    transformedProgress: number;
}

export interface ITimelineParams extends IParentTimeline, ITimingOptions, ITimelineProgress {

}

export const defaultParameters: ITimelineParams = {
    active: true,
    bezier: null,
    currentDirection: null,
    currentIteration: 0,
    directedProgress: null,
    easingFunction: "linear" as keyof IEasingFunctions,
    // endDelay: 0,
    entityId: 0,
    fill: FillMode.both,
    iterationDuration: Infinity,
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

export class TimelineSystem extends System<ITimelineParams> {
    protected _isTMFrameEvent: boolean;
    protected _previousParentTmState: PlayState;
    constructor(protected _parentTMId?: number, protected _parentTimeLineParameterIterator?: ParametersSourceIterator<IParentTimeline>) {
        super(defaultParameters);
        _parentTimeLineParameterIterator === undefined ? this._isTMFrameEvent = true : this._isTMFrameEvent = false;
    }

    public process(frameEvent: interfaces.IFrameEvent, ...args: any[]) {
        const state = this.getParentTimelineState(frameEvent);
        this._previousParentTmState = this._previousParentTmState || state;
        // only run if previous state of parent timeline was running, so that we can set children time line to finished or paused if the parent is, otherwise don't bother updating children time line.
        if (this._previousParentTmState !== PlayState.idle &&  this._previousParentTmState !== PlayState.finished && this._previousParentTmState !== PlayState.paused) {
            // this._previousParentTmState = state;
            const parentTM = this.getParentTimeLine(frameEvent);
            super.process(parentTM, ...args);
        }
        this._previousParentTmState = state;
    }

    public execute(params: ITimelineParams, parentTimeline: IParentTimeline): ITimelineParams {
        // const startDelay = 0;
        // console.log("bp");
        const endDelay = 0;
        // const localTime = this.computeLocalTime(parentTimeline.time, params.startTime, params.playRate);

        const localTime = ((parentTimeline.time - params.startTime) * params.playRate) - (parentTimeline.currentIteration * parentTimeline.iterationDuration * params.playRate || 0);
        // const currentDirection = this.currentDirection(params.playDirection, params.currentIteration);
        const animationDirection = this.animationDirection(params.playRate);
        const iterationDuration = params.iterationDuration;
        const activeDuration = this.activeDuration(iterationDuration, params.iterations);
        const endTime = this.endTime(params.startDelay, activeDuration, endDelay);
        const beforeActiveBT = this.beforeActiveBoundaryTime(params.startDelay, endTime);
        const activeAfterBT = this.activeAfterBoundaryTime(params.startDelay, activeDuration, endTime);
        const currentPhase = this.phase(localTime, animationDirection, beforeActiveBT, activeAfterBT);

        const playState = this.playState(animationDirection, currentPhase, params.state, parentTimeline.state);
        const activeTime = this.activeTime(currentPhase, localTime, params.startDelay, params.fill, activeDuration);

        const progress = this.overallProgress(currentPhase, activeTime, iterationDuration, params.iterations, params.iterationStart);
        const iterationProgress = this.iterationProgress(currentPhase, params.iterationStart, progress, activeTime, iterationDuration, params.iterations);
        const currentIteration = this.currentIteration(currentPhase, activeTime, progress, params.iterations, iterationProgress);

        const currentDirection = this.currentDirection(params.playDirection, currentIteration);

        const directedProgress = this.directedProgress(iterationProgress, currentDirection);

        let transformedProgress: number;
        if (params.easingFunction !== null) {
            transformedProgress = this.transformedProgressEasingFunc(directedProgress, params.easingFunction);
        } else if (params.bezier !== null) {
            transformedProgress = this.transformedProgressBezier(directedProgress, params.bezier);
        } else {
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
    }

    public overallProgress(phase: Phase, activeTime: number, iterationDuration: number, iterationCount: number, iterationStart: number): number {
        if (isNaN(activeTime)) { return null; }
        let progress = 0;
        if (iterationDuration === 0) {
            if (phase === Phase.before) {
                progress = 0;
            } else {
                progress = iterationCount;
            }
        } else {
            progress = activeTime / iterationDuration;
        }
        return progress + iterationStart;
    }

    /** The simple iteration progress is a fraction of the progress through the current iteration that ignores transformations to the time introduced by the playback direction or timing functions applied to the effect, and is calculated as follows:
     */
    public iterationProgress(currentPhase: Phase, iterationStart: number, overallProgress: number, activeTime: number, iterationDuration: number, iterationCount: number): number {
        let iterationProgress = 0;
        if (overallProgress === null) {
            iterationProgress = null;
        } else if (!isFinite(overallProgress)) {
            iterationProgress = iterationStart % 1.0;
        } else {
            iterationProgress = overallProgress % 1.0;
        }

        if (iterationProgress === 0 && currentPhase === Phase.after && iterationCount !== 0 && (activeTime !== 0 || iterationDuration === 0)) {
            iterationProgress = 1.0;
        }
        return iterationProgress;
    }

    public currentIteration(currentPhase: Phase, activeTime: number, overallProgress: number, iterationCount: number, iterationProgress: number): number {
        if (isNaN(activeTime)) { return null; }
        if (currentPhase === Phase.after && !isFinite(iterationCount)) {
            return Infinity;
        } else if (iterationProgress === 1.0) {
            return Math.floor(overallProgress) - 1;
        } else {
            return Math.floor(overallProgress);
        }
    }

    public directedProgress(iterationProgress: number, currentDirection: PlayDirection) {
        if (iterationProgress === null) {
            return null;
        }
        if (currentDirection === PlayDirection.forwards) {
            return iterationProgress;
        } else {
            return 1.0 - iterationProgress;
        }
    }

    public currentDirection(playBackDirection: PlaybackDirection, currentIteration: number): PlayDirection {
        if (playBackDirection === PlaybackDirection.normal) {
            return PlayDirection.forwards;
        } else if (playBackDirection === PlaybackDirection.reverse) {
            return PlayDirection.reverse;
        } else {
            let d = currentIteration;
            if (playBackDirection === PlaybackDirection.alternateReverse) {
                d += 1;
            }
            if (d % 2 === 0) {
                return PlayDirection.forwards;
            } else {
                return isFinite(d) ? PlayDirection.reverse : PlayDirection.forwards;
            }
        }
    }

    public transformedProgressBezier(directedProgress: number, bezierparams: IBezierParams): number {
        if (directedProgress === null) {
            return null;
        }
        return bezier(bezierparams.P1x, bezierparams.P1y, bezierparams.P2x, bezierparams.P2y)(directedProgress);
    }

    public transformedProgressEasingFunc(directedProgress: number, easing: keyof IEasingFunctions) {
        if (directedProgress === null) {
            return null;
        }
        return easingFunctions[easing](directedProgress);
    }

    // 3.9.3.1. Calculating the active time
    public activeTime(phase: Phase, localTime: number, startDelay: number, fill: FillMode, activeDuration: number): number {
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
    }
    /** Time relative to startTime */
    public computeLocalTime(timeLineTime: number, startTime: number, playBackRate) {
        return (timeLineTime - startTime) * playBackRate;
    }

    public activeDuration(iterationDuration: number, iterationCount: number): number {
        return iterationDuration * iterationCount || 0;
    }

    public endTime(startDelay: number, activeDuration: number, endDelay: number) {
        return Math.max(startDelay + activeDuration + endDelay, 0);
    }

    public animationDirection(playBackRate: number): AnimationDirection {
        return playBackRate < 0 ? AnimationDirection.backwards : AnimationDirection.forwards;
    }

    public beforeActiveBoundaryTime(startDelay: number, endTime: number): number {
        return Math.max(Math.min(startDelay, endTime), 0);
    }

    public activeAfterBoundaryTime(startDelay: number, activeDuration: number, endTime: number) {
        return Math.max(Math.min(startDelay + activeDuration, endTime), 0);
    }

    public phase(localTime: number, animationDirection: AnimationDirection, beforeActiveBoundaryTime: number, activeAfterBoundaryTime: number): Phase {
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
    }

    public playState(animationDirection: AnimationDirection, phase: Phase, previousState: PlayState, parentState: PlayState): PlayState {
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
    }

    protected getParentTimeLine(frameEvent: interfaces.IFrameEvent): IParentTimeline {
        if (this._isTMFrameEvent === true) {
            return {
                active: true,
                currentDirection: PlayDirection.forwards,
                currentIteration: 0,
                // delta: frameEvent.delta,
                entityId: 0,
                iterationDuration: Infinity,
                playRate: 1,
                state: PlayState[frameEvent.state],
                time: frameEvent.time,
            };
        } else {
            return this._parentTimeLineParameterIterator.assembleParameters(this._parentTMId);
        }

    }

    protected getParentTimelineState(frameEvent: interfaces.IFrameEvent): PlayState {
        return this._isTMFrameEvent === true ? PlayState[frameEvent.state] : this._parentTimeLineParameterIterator.getParameterValue(this._parentTMId, "state");
    }
}

import { interfaces, ParametersSourceIterator, System } from "ecs-framework";
import EasingFunctions from "./EasingFunctions";
import { IBezierParams } from "./KeyFrameController";

export enum AnimationDirection {
    "forwards",
    "backwards",
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
    running, // active time
    paused,
    finished, // finished all iterations
}

export interface ITimingOptions {
    duration: number;
    startTime: number; // relative to the parent timeline
    // startDelay: number; // offset from the startTime, use to compute iterationStart (ie: skip part)
    iterationStart: number | null; // ie: 0.5 would start half way
    // endDelay: number; // offset from the end
    playRate: number;
    playDirection: PlaybackDirection; // direction to be played at each repetition
    iterations: number; // the number of iterations to be played
    easing: IBezierParams | keyof EasingFunctions | undefined; // scale time by an easing function
    fill: FillMode;
    // composite: Composite;
}

export interface IParentTimeline extends interfaces.IComponent {
    time: number; // current time
    playRate: number;
    currentDirection: AnimationDirection;
    state: PlayState;
    delta: number;
}

export interface ITimelineProgress extends interfaces.IComponent {
    progress: number; // overall progress
    iterationProgress: number;
}

export interface ITimelineParams extends IParentTimeline, ITimingOptions, ITimelineProgress {

}

export class TimelineSystem extends System<ITimelineParams> {
    protected _isTMFrameEvent: boolean;
    protected _previousParentTmState: PlayState;
    constructor(defaultParameter: ITimelineParams, protected _parentTMId?: number, protected _parentTimeLineParameterIterator?: ParametersSourceIterator<IParentTimeline>) {
        super(defaultParameter);
        _parentTimeLineParameterIterator === undefined ? this._isTMFrameEvent = true : this._isTMFrameEvent = false;
    }

    public process(frameEvent: interfaces.IFrameEvent, ...args: any[]) {
        const state = this.getParentTimelineState(frameEvent);
        this._previousParentTmState = this._previousParentTmState || state;
        // only run if previous state of parent timeline was running, so that we can set children time line to finished or paused if the parent is, otherwise don't bother updating children time line.
        if (this._previousParentTmState === PlayState.running) {
            this._previousParentTmState = state;
            const parentTM = this.getParentTimeLine(frameEvent);
            super.process(parentTM, ...args);
        }
        this._previousParentTmState = state;
    }

    public execute(params: ITimelineParams, parentTimeline: IParentTimeline): ITimelineParams {
        const startDelay = 0;
        const endDelay = 0;
        const localTime = this.computeLocalTime(parentTimeline.time, params.startTime, params.playRate);
        const currentDirection = parentTimeline.currentDirection;
        // const iterationDuration = params.startDelay + params.duration; // ?? iterationDuration === params.duration ?
        const iterationDuration = params.duration;
        const activeDuration = this.activeDuration(iterationDuration, params.iterations);
        const endTime = this.endTime(startDelay, activeDuration, endDelay);
        const beforeActiveBT = this.beforeActiveBoundaryTime(startDelay, endTime);
        const activeAfterBT = this.activeAfterBoundaryTime(startDelay, activeDuration, endTime);
        const currentPhase = this.phase(localTime, currentDirection, beforeActiveBT, activeAfterBT);

        const playState = this.playState(parentTimeline.currentDirection, currentPhase, parentTimeline.state);
        const activeTime = this.activeTime(currentPhase, localTime, startDelay, params.fill, activeDuration);
        const progress = isNaN(activeTime) ? null : this.overallProgress(currentPhase, activeTime, iterationDuration, params.iterations, params.iterationStart);
        const iterationProgress = this.iterationProgress(currentPhase, params.iterationStart, progress, activeTime, iterationDuration, params.iterations);

        params.progress = progress;
        params.iterationProgress = iterationProgress;
        params.state = playState;
        params.time = localTime;
        return params;
    }

    public overallProgress(phase: Phase, activeTime: number, iterationDuration: number, iterationCount: number, iterationStart: number) {
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
    public iterationProgress(currentPhase: Phase, iterationStart: number, overallProgress: number, activeTime: number, iterationDuration: number, iterationCount: number) {
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
        // console.log(localTime);
        // console.log("before: " + beforeActiveBoundaryTime);
        // console.log("after: " + activeAfterBoundaryTime);
        // before phase
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

    public playState(animationDirection: AnimationDirection, phase: Phase, parentState: PlayState): PlayState {
        if (parentState === PlayState.paused || parentState === PlayState.finished || parentState === PlayState.idle) {
            return parentState;
        }
        switch (phase) {
            case Phase.active:
                return PlayState.running;
            case Phase.after:
                return PlayState.finished;
            case Phase.before:
                return animationDirection === AnimationDirection.forwards ? PlayState.idle : PlayState.finished;
        }
    }

    protected getParentTimeLine(frameEvent: interfaces.IFrameEvent): IParentTimeline {
        if (this._isTMFrameEvent === true) {
            return {
                active: true,
                currentDirection: AnimationDirection.forwards,
                delta: frameEvent.delta,
                entityId: 0,
                playRate: 1,
                state: PlayState[frameEvent.state],
                time: frameEvent.time,
            };
        } else {
            return this._parentTimeLineParameterIterator.assembleParamters(this._parentTMId);
        }

    }

    protected getParentTimelineState(frameEvent: interfaces.IFrameEvent): PlayState {
        return this._isTMFrameEvent === true ? PlayState[frameEvent.state] : this._parentTimeLineParameterIterator.getParameterValue(this._parentTMId, "state");
    }
}

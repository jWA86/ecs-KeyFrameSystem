import { interfaces, System } from "ecs-framework";
import * as bezier from "../node_modules/bezier-easing/dist/bezier-easing.js";
import { IAnimationFrameEvent, IBezierParams, PlaybackState } from "./KeyFrameController";
export { KeyFrameSystem, IKeyFrameParams, defaultKeyFrameParam };

interface IKeyFrameParams {
    nbLoop: number;
    previousProgress: number;
    progress: number;
    timer: IAnimationFrameEvent;
    cycling: boolean;
    fadeLoop: boolean;
    from: number;
    duration: number;
    easingParams: IBezierParams;
}

const defaultKeyFrameParam: IKeyFrameParams = {
    cycling: false,
    duration: 0,
    easingParams: { P1x: 0.0, P1y: 0.0, P2x: 1.0, P2y: 1.0 },
    fadeLoop: false,
    from: 0,
    nbLoop: 0,
    previousProgress: 0,
    progress: 0,
    timer: { count: 0, delta: 0, loopCount: 0, reverse: false, time: 0, playState: PlaybackState.stopped },
};

class KeyFrameSystem extends System<IKeyFrameParams> {

    protected _defaultParameter: IKeyFrameParams = defaultKeyFrameParam;

    constructor(public timeRef: IAnimationFrameEvent) {
        super();
    }

    public process(...args: any[]) {
        if (this.timeRef.playState !== PlaybackState.stopped && this.timeRef.playState !== PlaybackState.paused ) {
            super.process(...args);
        }
    }

    public execute(params: IKeyFrameParams) {
        // if paused don't update
        if (params.timer[this._k.timer].playState === PlaybackState.paused) { return; }

        const loopEnded: boolean = params.timer[this._k.timer].loopCount >= params.nbLoop[this._k.nbLoop] && params.nbLoop[this._k.nbLoop] !== 0;
        // if loopCount reached end but not yet set to stopped
        if (loopEnded && params.timer[this._k.timer].playState === PlaybackState.ended) {
            params.timer[this._k.timer].playState = PlaybackState.stopped;
            // params.timer[this._k.timer].count += 1;
            // set progress to 1 or 0 ?
            return;
        }
        // relative time
        const rFrom = params.from[this._k.from] * (params.timer[this._k.timer].loopCount + 1);
        const rEnd = params.from[this._k.from] + params.duration[this._k.duration] * (params.timer[this._k.timer].loopCount + 1);

        // start
        if ((params.timer[this._k.timer].playState === PlaybackState.stopped)
            && this.timeRef.time >= rFrom && this.timeRef.time <= rEnd && !loopEnded) {
            params.timer[this._k.timer].playState = PlaybackState.started;
            // params.timer[this._k.timer].count += 1;
            // when we start directly in reverse
            if (params.timer[this._k.timer].reverse) {
                params.timer[this._k.timer].time = params.duration[this._k.duration];
            }
            return;

        } else if ((params.timer[this._k.timer].playState === PlaybackState.started || params.timer[this._k.timer].playState === PlaybackState.playing)
            && this.timeRef.time >= rFrom
            && this.timeRef.time <= rEnd
            && !loopEnded) {
            // playing
            params.timer[this._k.timer].playState = PlaybackState.playing;

            if (!params.timer[this._k.timer].reverse) {
                params.timer[this._k.timer].time += this.timeRef.delta;
            } else {
                params.timer[this._k.timer].time -= this.timeRef.delta;
            }
            params.timer[this._k.timer].delta = this.timeRef.delta;
            // params.timer[this._k.timer].count += 1;
            const b = bezier(params.easingParams[this._k.easingParams].P1x, params.easingParams[this._k.easingParams].P1y, params.easingParams[this._k.easingParams].P2x, params.easingParams[this._k.easingParams].P2y);

            params.previousProgress[this._k.previousProgress] = params.progress[this._k.progress];

            params.progress[this._k.progress] = b(params.timer[this._k.timer].time / params.duration[this._k.duration]);
            return;
        } else if ((params.timer[this._k.timer].playState === PlaybackState.started || params.timer[this._k.timer].playState === PlaybackState.playing)
            && this.timeRef.time >= rFrom
            && this.timeRef.time > rEnd
            && !loopEnded) {
            // ending
            // when looping playState is set to ended only when all loop have completed otherwise it will set back to started
            //
            // a keyframe can be started and ended without being played if it duration is 1 for exemple
            // usefull for keyframe that trigger event but have no animation
            params.timer[this._k.timer].playState = PlaybackState.ended;
            params.timer[this._k.timer].loopCount += 1;
            // params.timer[this._k.timer].count += 1;
            this.changeDirection(params);
            return;
        }
    }
    protected changeDirection(params: IKeyFrameParams) {
        if (params.timer[this._k.timer].loopCount >= params.nbLoop[this._k.nbLoop] && params.nbLoop[this._k.nbLoop] !== 0) { return; }
        // looping back from start
        if (!params.cycling[this._k.cycling]) {
            if (params.fadeLoop[this._k.fadeLoop]) {
                const delta = params.duration[this._k.duration] - params.timer[this._k.timer].time;
                const toStartDelta = this.timeRef.delta - delta;
                params.timer[this._k.timer].time = toStartDelta;
            } else {
                params.timer[this._k.timer].time = 0;
            }
        } else {
            // cycling
            params.timer[this._k.timer].reverse = !params.timer[this._k.timer].reverse;
            if (params.fadeLoop[this._k.fadeLoop]) {
            } else {
                if (params.timer[this._k.timer].reverse) {
                    params.timer[this._k.timer].time = params.duration[this._k.duration];
                } else {
                    params.timer[this._k.timer].time = 0;
                }
            }
        }

        const b = bezier(params.easingParams[this._k.easingParams].P1x, params.easingParams[this._k.easingParams].P1y, params.easingParams[this._k.easingParams].P2x, params.easingParams[this._k.easingParams].P2y);

        params.previousProgress[this._k.previousProgress] = params.progress[this._k.progress];

        params.progress[this._k.progress] = b(params.timer[this._k.timer].time / params.duration[this._k.duration]);
        params.timer[this._k.timer].playState = PlaybackState.started;
    }
}

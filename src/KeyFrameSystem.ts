import { interfaces, System } from "ecs-framework";
import * as bezier from "../node_modules/bezier-easing/dist/bezier-easing.js";
import { IAnimationFrameEvent, IBezierParams, PlaybackState } from "./KeyFrameController";
export { KeyFrameSystem, IKeyFrameParams };

interface IKeyFrameParams {
    nbLoop: number;
    progress: number;
    playState: PlaybackState;
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
    playState: PlaybackState.stopped,
    progress: 0,
    timer: { count: 0, delta: 0, loopCount: 0, reverse: false, time: 0 },
};

class KeyFrameSystem extends System<IKeyFrameParams> {

    protected _defaultParameter: IKeyFrameParams = defaultKeyFrameParam;

    constructor() {
        super();
    }

    public execute(params: IKeyFrameParams, timeRef: interfaces.IFrameEvent) {
        // if paused don't update
        if (params.playState[this._k.playState] === PlaybackState.paused) { return; }

        const loopEnded: boolean = params.timer[this._k.timer].loopCount >= params.nbLoop[this._k.nbLoop] && params.nbLoop[this._k.nbLoop] !== 0;
        // if loopCount reached end but not yet set to stopped
        if (loopEnded && params.playState[this._k.playState] === PlaybackState.ended) {
            params.playState[this._k.playState] = PlaybackState.stopped;
            params.timer[this._k.timer].count += 1;
            return;
        }
        // relative time
        const rFrom = params.from[this._k.from] * (params.timer[this._k.timer].loopCount + 1);
        const rEnd = params.from[this._k.from] + params.duration[this._k.duration] * (params.timer[this._k.timer].loopCount + 1);

        // start
        if ((params.playState[this._k.playState] === PlaybackState.stopped)
            && timeRef.time >= rFrom && timeRef.time <= rEnd && !loopEnded) {
            params.playState[this._k.playState] = PlaybackState.started;
            params.timer[this._k.timer].count += 1;
            // when we start directly in reverse
            if (params.timer[this._k.timer].reverse) {
                params.timer[this._k.timer].time = params.duration[this._k.duration];
            }
            return;

        } else if ((params.playState[this._k.playState] === PlaybackState.started || params.playState[this._k.playState] === PlaybackState.playing)
            && timeRef.time >= rFrom
            && timeRef.time <= rEnd
            && !loopEnded) {
            // playing
            params.playState[this._k.playState] = PlaybackState.playing;

            if (!params.timer[this._k.timer].reverse) {
                params.timer[this._k.timer].time += timeRef.delta;
            } else {
                params.timer[this._k.timer].time -= timeRef.delta;
            }
            params.timer[this._k.timer].delta = timeRef.delta;
            params.timer[this._k.timer].count += 1;
            const b = bezier(params.easingParams[this._k.easingParams].P1x, params.easingParams[this._k.easingParams].P1y, params.easingParams[this._k.easingParams].P2x, params.easingParams[this._k.easingParams].P2y);
            params.progress[this._k.progress] = b(params.timer[this._k.timer].time / params.duration[this._k.duration]);
            return;
        } else if ((params.playState[this._k.playState] === PlaybackState.started || params.playState[this._k.playState] === PlaybackState.playing)
            && timeRef.time >= rFrom
            && timeRef.time > rEnd
            && !loopEnded) {
            // ending
            // when looping playState is set to ended only when all loop have completed otherwise it will set back to started
            //
            // a keyframe can be started and ended without being played if it duration is 1 for exemple
            // usefull for keyframe that trigger event but have no animation
            params.playState[this._k.playState] = PlaybackState.ended;
            params.timer[this._k.timer].loopCount += 1;
            params.timer[this._k.timer].count += 1;
            this.changeDirection(params, timeRef);
            return;
        }
    }
    protected changeDirection(params: IKeyFrameParams, timeRef: interfaces.IFrameEvent) {
        if (params.timer[this._k.timer].loopCount >= params.nbLoop[this._k.nbLoop] && params.nbLoop[this._k.nbLoop] !== 0) { return; }
        // looping back from start
        if (!params.cycling[this._k.cycling]) {
            if (params.fadeLoop[this._k.fadeLoop]) {
                const delta = params.duration[this._k.duration] - params.timer[this._k.timer].time;
                const toStartDelta = timeRef.delta - delta;
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
        params.progress[this._k.progress] = b(params.timer[this._k.timer].time / params.duration[this._k.duration]);
        params.playState[this._k.playState] = PlaybackState.started;
    }
}

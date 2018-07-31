import { ComponentFactory, interfaces, System } from "ecs-framework";
import * as bezier from "../node_modules/bezier-easing/dist/bezier-easing.js";
import { IAnimationFrameEvent, IBezierParams, IKeyFrame, IKeyFrameController, KeyFrameControllerComponent, PlaybackState } from "./KeyFrameController";
export { KeyFrameSystem, IKeyFrameParams };

interface IKeyFrameParams {
    n: { nbLoop: number };
    pr: { progress: number };
    pl: { playState: PlaybackState };
    t: { timer: IAnimationFrameEvent };
    c: { cycling: boolean };
    f: { fadeLoop: boolean };
    fr: { from: number };
    d: { duration: number };
    e: { easingParams: IBezierParams };
}

const defaultKeyFrameParam: IKeyFrameParams = {
    c: { cycling: false },
    d: { duration: 0 },
    e: { easingParams: { P1x: 0.0, P1y: 0.0, P2x: 1.0, P2y: 1.0 } },
    f: { fadeLoop: false },
    fr: { from: 0 },
    n: { nbLoop: 0 },
    pl: { playState: PlaybackState.stopped },
    pr: { progress: 0 },
    t: { timer: { count: 0, delta: 0, loopCount: 0, reverse: false, time: 0 } },
};

class KeyFrameSystem extends System<IKeyFrameParams> {
    protected static changeDirection(params: IKeyFrameParams, timeRef: interfaces.IFrameEvent) {
        if (params.t.timer.loopCount >= params.n.nbLoop && params.n.nbLoop !== 0) { return; }
        // looping back from start
        if (!params.c.cycling) {
            if (params.f.fadeLoop) {
                const delta = params.d.duration - params.t.timer.time;
                const toStartDelta = timeRef.delta - delta;
                params.t.timer.time = toStartDelta;
            } else {
                params.t.timer.time = 0;
            }
        } else {
            // cycling
            params.t.timer.reverse = !params.t.timer.reverse;
            if (params.f.fadeLoop) {
            } else {
                if (params.t.timer.reverse) {
                    params.t.timer.time = params.d.duration;
                } else {
                    params.t.timer.time = 0;
                }
            }
        }

        const b = bezier(params.e.easingParams.P1x, params.e.easingParams.P1y, params.e.easingParams.P2x, params.e.easingParams.P2y);
        params.pr.progress = b(params.t.timer.time / params.d.duration);
        params.pl.playState = PlaybackState.started;
    }

    protected _parameters: IKeyFrameParams = defaultKeyFrameParam;
    constructor() {
        super();
    }

    public execute(params: IKeyFrameParams, timeRef: interfaces.IFrameEvent) {
        // if paused don't update
        if (params.pl.playState === PlaybackState.paused) { return; }

        const loopEnded: boolean = params.t.timer.loopCount >= params.n.nbLoop && params.n.nbLoop !== 0;
        // if loopCount reached end but not yet set to stopped
        if (loopEnded && params.pl.playState === PlaybackState.ended) {
            params.pl.playState = PlaybackState.stopped;
            params.t.timer.count += 1;
            return;
        }
        // relative time
        const rFrom = params.fr.from * (params.t.timer.loopCount + 1);
        const rEnd = params.fr.from + params.d.duration * (params.t.timer.loopCount + 1);

        // start
        if ((params.pl.playState === PlaybackState.stopped)
            && timeRef.time >= rFrom && timeRef.time <= rEnd && !loopEnded) {
            params.pl.playState = PlaybackState.started;
            params.t.timer.count += 1;
            // when we start directly in reverse
            if (params.t.timer.reverse) {
                params.t.timer.time = params.d.duration;
            }
            return;

        } else if ((params.pl.playState === PlaybackState.started || params.pl.playState === PlaybackState.playing)
            && timeRef.time >= rFrom
            && timeRef.time <= rEnd
            && !loopEnded) {
            // playing
            params.pl.playState = PlaybackState.playing;

            if (!params.t.timer.reverse) {
                params.t.timer.time += timeRef.delta;
            } else {
                params.t.timer.time -= timeRef.delta;
            }
            params.t.timer.delta = timeRef.delta;
            params.t.timer.count += 1;
            const b = bezier(params.e.easingParams.P1x, params.e.easingParams.P1y, params.e.easingParams.P2x, params.e.easingParams.P2y);
            params.pr.progress = b(params.t.timer.time / params.d.duration);
            return;
        } else if ((params.pl.playState === PlaybackState.started || params.pl.playState === PlaybackState.playing)
            && timeRef.time >= rFrom
            && timeRef.time > rEnd
            && !loopEnded) {
            // ending
            // when looping playState is set to ended only when all loop have completed otherwise it will set back to started
            //
            // a keyframe can be started and ended without being played if it duration is 1 for exemple
            // usefull for keyframe that trigger event but have no animation
            params.pl.playState = PlaybackState.ended;
            params.t.timer.loopCount += 1;
            params.t.timer.count += 1;
            KeyFrameSystem.changeDirection(params, timeRef);
            return;
        }
    }
}

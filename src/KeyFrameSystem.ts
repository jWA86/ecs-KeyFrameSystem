import { ComponentFactory, IComponent, IComponentFactory, IFrameEvent, System } from "componententitysystem";
import * as bezier from "../node_modules/bezier-easing/dist/bezier-easing.js";
import { IAnimationFrameEvent, IKeyFrame, IKeyFrameController, KeyFrameControllerComponent, PlaybackState } from "../src/KeyFrameController";
export { KeyFrameSystem, bezier };

class KeyFrameSystem extends System {

    protected static changeDirection(c: KeyFrameControllerComponent, timeRef: IFrameEvent) {
        if (c.timer.loopCount >= c.nbLoop && c.nbLoop !== 0) { return; }
        // looping back from start
        if (!c.cycling) {
            if (c.fadeLoop) {
                const delta = c.duration - c.timer.time;
                const toStartDelta = timeRef.delta - delta;
                c.timer.time = toStartDelta;
            } else {
                c.timer.time = 0;
            }
        } else {
            // cycling
            c.timer.reverse = !c.timer.reverse;
            if (c.fadeLoop) {
            } else {
                if (c.timer.reverse) {
                    c.timer.time = c.duration;
                } else {
                    c.timer.time = 0;
                }
            }
        }

        const b = bezier(c.easingParams.P1x, c.easingParams.P1y, c.easingParams.P2x, c.easingParams.P2y);
        c.progress = b(c.timer.time / c.duration);
        c.playState = PlaybackState.started;
    }
    constructor() {
        super();
    }
    public execute(c: KeyFrameControllerComponent, timeRef: IFrameEvent) {
        // if paused don't update
        if (c.playState === PlaybackState.paused) { return; }

        const loopEnded: boolean = c.timer.loopCount >= c.nbLoop && c.nbLoop !== 0;
        // if loopCount reached but not yet set to stopped
        if (loopEnded && c.playState === PlaybackState.ended) {
            c.playState = PlaybackState.stopped;
            c.timer.count += 1;
            return;
        }

        // relative time
        const rFrom = c.from * (c.timer.loopCount + 1);
        const rEnd = c.from + c.duration * (c.timer.loopCount + 1);

        // start
        if ((c.playState === PlaybackState.stopped)
            && timeRef.time >= rFrom && timeRef.time <= rEnd && !loopEnded) {

            c.playState = PlaybackState.started;
            c.timer.count += 1;
            // when we start directly in reverse
            if (c.timer.reverse) {
                c.timer.time = c.duration;
            }
            return;

        } else if ((c.playState === PlaybackState.started || c.playState === PlaybackState.playing)
            && timeRef.time >= rFrom
            && timeRef.time <= rEnd
            && !loopEnded) {
            // playing
            c.playState = PlaybackState.playing;

            if (!c.timer.reverse) {
                c.timer.time += timeRef.delta;
            } else {
                c.timer.time -= timeRef.delta;
            }
            c.timer.delta = timeRef.delta;
            c.timer.count += 1;
            const b = bezier(c.easingParams.P1x, c.easingParams.P1y, c.easingParams.P2x, c.easingParams.P2y);
            c.progress = b(c.timer.time / c.duration);
            return;
        } else if ((c.playState === PlaybackState.started || c.playState === PlaybackState.playing)
            && timeRef.time >= rFrom
            && timeRef.time > rEnd
            && !loopEnded) {
            // ending
            // when looping playState is set to ended only when all loop have completed otherwise it will set back to started
            //
            // a keyframe can be started and ended without being played if it duration is 1 for exemple
            // usefull for keyframe that trigger event but have no animation
            c.playState = PlaybackState.ended;
            c.timer.loopCount += 1;
            c.timer.count += 1;
            KeyFrameSystem.changeDirection(c, timeRef);
            return;
        }
    }
}

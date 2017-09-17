import { ISystem, ComponentFactory, IComponent, IComponentFactory } from "componententitysystem";
import { IKeyFrame, IKeyFrameController, KeyFrameControllerComponent, IFrameEvent, PlaybackState } from "../src/KeyFrameController";
import * as bezier from "../node_modules/bezier-easing/dist/bezier-easing.js"
export { KeyFrameSystem, bezier }

class KeyFrameSystem implements ISystem {
    constructor() { }
    process(factory: IComponentFactory<KeyFrameControllerComponent>, timeRef: IFrameEvent) {
        let l = factory.size;
        let f = factory.values;
        for (let i = 0; i < l; ++i) {
            if (f[i].active) {
                this.execute(f[i], timeRef);
            }
        }
    }

    execute(c: KeyFrameControllerComponent, timeRef: IFrameEvent) {
        // if paused don't update
        if (c.playState === PlaybackState.paused) { return; }

        let loopEnded:boolean = c.timer.loopCount >= c.nbLoop && c.nbLoop !== 0;

        // if loopCount reached but not yet set to stopped 
        if(loopEnded && c.playState === PlaybackState.ended) {
            c.playState = PlaybackState.stopped;
            c.timer.count += 1;
            return;
        }

        //relative time
        let rFrom = c.from*(c.timer.loopCount+1);
        let rEnd = c.from + c.duration*(c.timer.loopCount+1);

        // start
        if ((c.playState === PlaybackState.stopped)
            && timeRef.time >= rFrom && timeRef.time <= rEnd && !loopEnded) {

            c.playState = PlaybackState.started;
            c.timer.count += 1;
            // when we start directly in reverse
            if(c.timer.reverse){
                c.timer.time = c.duration;
            }
            return;
        }
        // playing
        else if ((c.playState === PlaybackState.started || c.playState === PlaybackState.playing)
            && timeRef.time >= rFrom && timeRef.time <= rEnd && !loopEnded) {
                
            c.playState = PlaybackState.playing;

            if (!c.timer.reverse) {
                c.timer.time += timeRef.delta;
            } else {
                c.timer.time -= timeRef.delta;
            }
            c.timer.delta = timeRef.delta;
            c.timer.count += 1;
            let b = bezier(c.easingParams.P1x, c.easingParams.P1y, c.easingParams.P2x, c.easingParams.P2y);
            c.progress = b(c.timer.time / c.duration);
            return;
        }
        // ending
        // when looping playState is set to ended only when all loop have completed otherwise it will set back to started
        //
        // a keyframe can be started and ended without being played if it duration is 1 for exemple
        // usefull for keyframe that trigger event but have no animation
        else if ((c.playState === PlaybackState.started || c.playState === PlaybackState.playing)
            && timeRef.time >= rFrom && timeRef.time > rEnd && !loopEnded) {

            c.playState = PlaybackState.ended;
            c.timer.loopCount += 1;
            c.timer.count += 1;
            this.changeDirection(c, timeRef);
            return;
        }
    }

    changeDirection(c: KeyFrameControllerComponent, timeRef: IFrameEvent) {
        if(c.timer.loopCount >= c.nbLoop && c.nbLoop !== 0){ return; }
        // looping back from start
        if (!c.cycling) {
            if (c.fadeLoop) {
                let delta = c.duration - c.timer.time;
                let toStartDelta = timeRef.delta - delta;
                c.timer.time = toStartDelta;
            }
            else {
                c.timer.time = 0;
            }
        }
        // cycling
        else {
            c.timer.reverse = !c.timer.reverse;
            if(c.fadeLoop) {
                
            } else {
                if(c.timer.reverse) {
                    c.timer.time = c.duration;
                }
                else{
                    c.timer.time = 0;
                }
            }
        }
        
        let b = bezier(c.easingParams.P1x, c.easingParams.P1y, c.easingParams.P2x, c.easingParams.P2y);
        c.progress = b(c.timer.time / c.duration);
        c.playState = PlaybackState.started;
    }
}


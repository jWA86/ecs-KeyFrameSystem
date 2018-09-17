import { expect } from "chai";
import { ComponentFactory, interfaces } from "ecs-framework";
import "mocha";
import { IAnimationFrameEvent, KeyFrameControllerComponent, PlaybackState } from "../src/KeyFrameController";
import { defaultKeyFrameParam, IKeyFrameParams, KeyFrameSystem } from "../src/KeyFrameSystem";

describe("KeyFrameController", () => {
    function incrementFrameEvent(frameEvent: IAnimationFrameEvent, delta = 1) {
        if (frameEvent.reverse) {
            frameEvent.time -= delta;
        } else {
            frameEvent.time += delta;
        }
        frameEvent.delta = delta;
        // e.count += 1;
    }
    const keyFrameParam: IKeyFrameParams = Object.assign({}, defaultKeyFrameParam);

    let e: IAnimationFrameEvent;
    let system: KeyFrameSystem;
    let factory: ComponentFactory<KeyFrameControllerComponent>;
    let c: KeyFrameControllerComponent;

    beforeEach(() => {
        e = Object.assign({}, defaultKeyFrameParam.timer);
        e.playState = PlaybackState.playing;
        system = new KeyFrameSystem(e);
        factory = new ComponentFactory<KeyFrameControllerComponent>(10, new KeyFrameControllerComponent(0, true, 0, 0, Object.assign({}, keyFrameParam.easingParams)));
        c = factory.create(1, true);
        c.from = 10;
        c.duration = 10;

        system.setParamSource("*", factory);
    });

    describe("playstate", () => {
        it("don't process any component if the timeRef playstate is set to stopped", () => {
            e.playState = PlaybackState.stopped;
            incrementFrameEvent(e, 10);
            expect(e.time).to.be.gte(c.from);
            expect(e.time).to.be.lt(c.duration + c.from);
            system.process(e);
            expect(factory.get(c.entityId).timer.playState).to.equal(PlaybackState.stopped);
        });
        it("instanciated KeyFrameControllerComponent should have it state set to stopped", () => {
            expect(c.from + c.duration).to.equal(20);
            expect(factory.get(1).timer.playState).to.equal(PlaybackState.stopped);
        });
        it("set playstate to started when timeRef >= from and <= from+duration", () => {
            expect(c.from + c.duration).to.equal(20);

            incrementFrameEvent(e);
            expect(e.time).to.equal(1);
            system.process(e);
            expect(factory.get(c.entityId).timer.playState).to.equal(PlaybackState.stopped);

            incrementFrameEvent(e, 9);
            expect(e.time).to.equal(10);
            expect(e.time, "timeRef not >= component from").to.be.gte(c.from);
            expect(e.time, "timeRef is not <= component from+duration").to.be.lte(c.from + c.duration);
            system.process(e);
            expect(factory.get(c.entityId).timer.playState, "component playstate is not set to started").to.equal(PlaybackState.started);

        });
        it("set playstate to playing when timeRef >= from and <= from+duration and it was already set to started", () => {
            expect(c.from + c.duration).to.equal(20);

            incrementFrameEvent(e, 11);
            expect(e.time).to.equal(11);
            system.process(e);
            expect(factory.get(1).timer.playState).to.equal(PlaybackState.started);

            incrementFrameEvent(e);
            expect(e.time).to.equal(12);
            system.process(e);
            expect(factory.get(1).timer.playState).to.equal(PlaybackState.playing);
        });
        it("set playstate to ended when timeRef >= from and > from+duration and it was set as playing", () => {

            expect(c.from + c.duration).to.equal(20);

            // start
            incrementFrameEvent(e, 11);
            expect(e.time).to.equal(11);
            system.process(e);

            // playing
            incrementFrameEvent(e);
            expect(e.time).to.equal(12);
            system.process(e);

            incrementFrameEvent(e, 9);
            expect(e.time).to.equal(21);
            system.process(e);

            const comp = factory.get(1);
            expect(comp.timer.playState, "component is set to playstate : '" + PlaybackState[comp.timer.playState] + "' instead of 'ended' ").to.equal(PlaybackState.ended);
        });
        it("set playstate to stopped if state was set on ended", () => {

            expect(c.from + c.duration).to.equal(20);

            // start
            incrementFrameEvent(e, 11);
            expect(e.time).to.equal(11);
            system.process(e);
            // playing
            incrementFrameEvent(e);
            expect(e.time).to.equal(12);
            system.process(e);
            // ended
            incrementFrameEvent(e, 9);
            expect(e.time).to.equal(21);
            system.process(e);
            incrementFrameEvent(e);
            expect(e.time).to.equal(22);
            system.process(e);
            expect(factory.get(1).timer.playState).to.equal(PlaybackState.stopped);
        });
    });
    describe("timer ", () => {
        it("in paying state increment the timer by the delta of reference timer", () => {

            expect(c.from + c.duration).to.equal(20);

            expect(c.timer.time).to.equal(0);

            // start
            incrementFrameEvent(e, 11);
            expect(e.time).to.equal(11);
            system.process(e);
            // playing
            incrementFrameEvent(e);
            expect(e.time).to.equal(12);
            system.process(e);
            expect(e.delta).to.equal(1);
            expect(c.timer.time).to.equal(1);

            incrementFrameEvent(e);
            expect(e.time).to.equal(13);
            system.process(e);
            expect(e.delta).to.equal(1);
            expect(c.timer.time).to.equal(2);
        });
    });
    describe("play in reverse", () => {
        it("start playing from the end when reverse param is set to true", () => {

            expect(c.from + c.duration).to.equal(20);

            c.timer.reverse = true;
            incrementFrameEvent(e);
            system.process(e);
            expect(c.timer.time).to.equal(0);

            incrementFrameEvent(e, 9);
            system.process(e);
            expect(c.timer.time).to.equal(c.duration);

        });
        it("decrement the animation timer when playing in reverse", () => {

            expect(c.from + c.duration).to.equal(20);

            c.timer.reverse = true;
            incrementFrameEvent(e);
            system.process(e);
            expect(c.timer.time).to.equal(0);

            incrementFrameEvent(e, 9);
            system.process(e);
            expect(c.timer.time).to.equal(c.duration);

            incrementFrameEvent(e);
            system.process(e);
            expect(c.timer.time).to.equal(c.duration - 1);
        });
    });
    describe("cycling", () => {
        it("toPlayInReverse should set to false by default", () => {
            expect(c.cycling).to.equal(false);
        });
        it("set to started when timer reach the end and toLoop is true", () => {
            expect(c.from + c.duration).to.equal(20);

            c.nbLoop = 2;
            incrementFrameEvent(e, 10);

            system.process(e);
            incrementFrameEvent(e, 11);

            system.process(e);
            expect(c.timer.playState).to.equal(PlaybackState.started);

        });
        it("start from 0 when looping", () => {
            expect(c.from + c.duration).to.equal(20);

            c.nbLoop = 2;
            incrementFrameEvent(e, 10);

            system.process(e);
            incrementFrameEvent(e, 11);

            system.process(e);
            expect(c.timer.playState).to.equal(PlaybackState.started);
            expect(c.timer.time).to.equal(0);

        });
        it("increment loopCount at the end", () => {
            expect(c.from + c.duration).to.equal(20);

            c.nbLoop = 2;
            expect(c.timer.loopCount).to.equal(0);
            incrementFrameEvent(e, 10);

            system.process(e);
            incrementFrameEvent(e, 11);

            system.process(e);
            expect(c.timer.loopCount).to.equal(1);
        });
        it("loop the number of time specified by the param nbLoop", () => {
            expect(c.from + c.duration).to.equal(20);

            c.cycling = false;
            c.nbLoop = 2;
            expect(c.timer.loopCount).to.equal(0);
            incrementFrameEvent(e, 10);

            system.process(e);
            incrementFrameEvent(e, 11);

            system.process(e);
            expect(c.timer.loopCount).to.equal(1);

            incrementFrameEvent(e);

            system.process(e);
            incrementFrameEvent(e, 10);

            system.process(e);
            expect(c.timer.loopCount).to.equal(2);
        });
        it("loop indefinitely when nbLoop is set to 0", () => {
            expect(c.from + c.duration).to.equal(20);

            c.nbLoop = 0;
            expect(c.timer.loopCount).to.equal(0);
            incrementFrameEvent(e, 10);

            system.process(e);
            incrementFrameEvent(e, 11);

            system.process(e);
            expect(c.timer.loopCount).to.equal(1);

            incrementFrameEvent(e, 10);

            system.process(e);
            expect(c.timer.loopCount).to.equal(2);
            incrementFrameEvent(e, 10);

            system.process(e);
            expect(c.timer.loopCount).to.equal(3);

            expect(e.time).to.equal(41);
            expect(c.timer.time).to.equal(0);
            expect(c.timer.playState).to.equal(PlaybackState.started);
        });
        it("not looping when nbLoop is set to 1", () => {
            expect(c.from + c.duration).to.equal(20);

            c.nbLoop = 1;
            expect(c.timer.loopCount).to.equal(0);
            incrementFrameEvent(e, 10);

            system.process(e);
            incrementFrameEvent(e, 11);

            system.process(e);
            expect(c.timer.loopCount).to.equal(1);

            incrementFrameEvent(e, 10);

            system.process(e);
            expect(c.timer.playState).to.equal(PlaybackState.stopped);
            expect(c.timer.loopCount).to.equal(1);

            incrementFrameEvent(e, 5);

            system.process(e);
            expect(c.timer.playState).to.equal(PlaybackState.stopped);
            expect(c.timer.loopCount).to.equal(1);
        });
        describe("looping in reverse", () => {
            it("increment the loopCount when looping in reverse", () => {
                expect(c.from + c.duration).to.equal(20);

                c.cycling = true;
                c.nbLoop = 2;

                expect(c.timer.loopCount).to.equal(0);
                incrementFrameEvent(e, 10);

                system.process(e);
                incrementFrameEvent(e, 11);

                system.process(e);
                expect(c.timer.loopCount).to.equal(1);
            });
            it("set to started when looping in reverse", () => {
                expect(c.from + c.duration).to.equal(20);

                c.cycling = true;
                c.nbLoop = 2;

                incrementFrameEvent(e, 10);

                system.process(e);
                incrementFrameEvent(e, 11);

                system.process(e);
                expect(c.timer.playState).to.equal(PlaybackState.started);
            });
            it("start with timer set to duration instead of 0", () => {
                expect(c.from + c.duration).to.equal(20);

                c.cycling = true;
                c.nbLoop = 2;

                incrementFrameEvent(e, 10);

                system.process(e);
                incrementFrameEvent(e, 11);

                system.process(e);
                expect(c.timer.playState).to.equal(PlaybackState.started);
                expect(c.timer.time).to.equal(c.duration);
            });
            it("have the timer set to reverse when looping in reverse", () => {
                expect(c.from + c.duration).to.equal(20);

                c.cycling = true;
                c.nbLoop = 2;

                incrementFrameEvent(e, 10);

                system.process(e);
                expect(c.timer.reverse).to.equal(false);

                incrementFrameEvent(e, 11);

                system.process(e);

                expect(c.timer.playState).to.equal(PlaybackState.started);
                expect(c.timer.time).to.equal(c.duration);
                expect(c.timer.reverse).to.equal(true);
            });
            it("increment the loopCount when time reach 0 while it was playing in reverse", () => {
                expect(c.from + c.duration).to.equal(20);

                c.cycling = true;
                c.nbLoop = 3;

                incrementFrameEvent(e, 10);

                system.process(e);

                incrementFrameEvent(e, 11);

                system.process(e);
                expect(c.timer.loopCount).to.equal(1);

                incrementFrameEvent(e);

                system.process(e);
                expect(c.timer.time).to.equal(9);

                incrementFrameEvent(e, 11);

                system.process(e);
                expect(c.timer.time).to.equal(0);
                expect(c.timer.loopCount).to.equal(2);
            });
            it("increment timer when reach 0", () => {
                expect(c.from + c.duration).to.equal(20);

                c.cycling = true;
                c.nbLoop = 3;

                incrementFrameEvent(e, 10);

                system.process(e);

                incrementFrameEvent(e, 11);

                system.process(e);
                expect(c.timer.loopCount).to.equal(1);

                incrementFrameEvent(e);

                system.process(e);

                incrementFrameEvent(e, 10);

                system.process(e);
                expect(c.timer.time).to.equal(0);
                expect(c.timer.loopCount).to.equal(2);

                incrementFrameEvent(e, 2);

                system.process(e);
                expect(c.timer.time).to.equal(2);
            });
            it("should set playsate to ended when all loop completed then stopped", () => {
                const from = 1000; // 1000ms
                const duration = 1000; // 1 seconde
                c = factory.create(10, true);
                c.from = from;
                c.duration = duration;
                c.cycling = true;
                c.nbLoop = 3;

                // start
                const nbIncrement = c.nbLoop * c.duration + c.from + 1;
                const fps = 1000 / 60;
                for (let i = 0; i < nbIncrement / fps; ++i) {
                    incrementFrameEvent(e, fps);

                    system.process(e);
                }

                expect(e.time).to.be.at.least(nbIncrement);
                expect(c.timer.playState).to.equal(PlaybackState.ended);

                incrementFrameEvent(e, fps);

                system.process(e);

                expect(c.timer.playState).to.equal(PlaybackState.stopped);
            });
            it("should be able to start from the end when the parent timer increment in reverse", () => {
                const parentTimeLine = factory.get(1);
                parentTimeLine.from = 10;
                parentTimeLine.duration = 20;
                parentTimeLine.cycling = true;
                parentTimeLine.nbLoop = 0;

                const childKeyFramePool = new ComponentFactory<KeyFrameControllerComponent>(2, new KeyFrameControllerComponent(0, true, 0, 0));
                const childKFSys = new KeyFrameSystem(parentTimeLine.timer);
                childKFSys.setParamSource("*", childKeyFramePool);

                const c1 = childKeyFramePool.create(1, true);
                c1.from = 0;
                c1.duration = 10;
                // c1.cycling = true;
                c1.nbLoop = 0;

                const c2 = childKeyFramePool.create(2, true);
                c2.from = 10;
                c2.duration = 10;
                // c2.cycling = true;
                c2.nbLoop = 0;

                incrementFrameEvent(e);
                expect(parentTimeLine.timer.playState).to.equal(PlaybackState.stopped);
                system.process();
                expect(childKFSys.timeRef.time).to.equal(0);

                incrementFrameEvent(e, 9);
                system.process();
                childKFSys.process();
                expect(parentTimeLine.timer.playState).to.equal(PlaybackState.started);
                // make sure the timer in the childSys is a reference
                expect(childKFSys.timeRef.playState).to.equal(PlaybackState.started);
                expect(c1.timer.playState, "child component c1 playstate wasn't set to started").to.equal(PlaybackState.started);

                incrementFrameEvent(e);
                system.process();
                childKFSys.process();
                expect(childKFSys.timeRef.time).to.equal(1);
                expect(parentTimeLine.timer.time).to.equal(1);
                expect(parentTimeLine.timer.playState).to.equal(PlaybackState.playing);
                expect(childKFSys.timeRef.playState).to.equal(PlaybackState.playing);
                expect(c1.timer.playState, "child component c1 playstate wasn't set to playing").to.equal(PlaybackState.playing);
                expect(c1.timer.time).to.equal(1);
                expect(c2.timer.playState, "child component c2 playstate should be equal to stopped").to.equal(PlaybackState.stopped);

                incrementFrameEvent(e, 10);
                expect(e.time).to.equal(21);
                system.process();
                childKFSys.process();
                console.log(c1.timer);
                expect(c1.timer.playState, "child component c1 playstate wasn't set to ended").to.equal(PlaybackState.ended);
                expect(c2.timer.playState, "child component c2 playstate should have been started").to.equal(PlaybackState.started);

                incrementFrameEvent(e, 10);
                expect(e.time).to.equal(31);
                system.process();
                childKFSys.process();
                expect(parentTimeLine.timer.playState).to.equal(PlaybackState.ended);

                incrementFrameEvent(e);
                expect(e.time).to.equal(32);
                system.process();
                childKFSys.process();
                expect(parentTimeLine.timer.playState).to.equal(PlaybackState.stopped);
                // should child be set to stopped if parent is stopped or ended ?
                console.log(parentTimeLine.timer);
                console.log(c1.timer);
                console.log(c2.timer);

                incrementFrameEvent(e, 2);
                expect(e.time).to.equal(34);
                system.process();
                childKFSys.process();
                console.log(parentTimeLine.timer);
                console.log(c1.timer);
                console.log(c2.timer);

                incrementFrameEvent(e, 5);
                expect(e.time).to.equal(39);
                system.process();
                childKFSys.process();
                console.log(parentTimeLine.timer);
                console.log(c1.timer);
                console.log(c2.timer);
            });

        });

    });
    describe("interpolation ", () => {
        it("by default, easing params should be of 0.0, 0.0, 1.0, 1.0", () => {
            expect(c.easingParams.P1x).to.equal(0.0);
            expect(c.easingParams.P1y).to.equal(0.0);
            expect(c.easingParams.P2x).to.equal(1.0);
            expect(c.easingParams.P2y).to.equal(1.0);
        });
        it("by defaut progress indicate the linear progression of the timeline", () => {
            expect(c.from + c.duration).to.equal(20);

            expect(c.timer.time).to.equal(0);

            expect(c.progress).to.equal(0);

            // start
            incrementFrameEvent(e, 10);
            expect(e.time).to.equal(10);

            system.process(e);

            // playing
            incrementFrameEvent(e, 5);
            expect(e.time).to.equal(15);

            system.process(e);
            expect(e.delta).to.equal(5);
            expect(c.timer.time).to.equal(5);

            expect(c.previousProgress, "previous progress value is not under current progress value").to.be.lessThan(0.5);

            expect(c.progress).to.equal(0.5);
        });
        it("progress should take the value of easing function ", () => {
            c.easingParams = { P1x: 0.25, P1y: 0.1, P2x: 0.25, P2y: 1.0 };

            expect(c.from + c.duration).to.equal(20);

            expect(c.timer.time).to.equal(0);

            expect(c.progress).to.equal(0);

            // start
            incrementFrameEvent(e, 10);
            expect(e.time).to.equal(10);

            system.process(e);

            // playing
            incrementFrameEvent(e, 5);
            expect(e.time).to.equal(15);

            system.process(e);
            expect(e.delta).to.equal(5);
            expect(c.timer.time).to.equal(5);

            expect(c.progress).to.not.equal(0.5);

            incrementFrameEvent(e, 5);

            system.process(e);
            expect(e.time).to.equal(20);
            expect(c.timer.time).to.equal(10);
            expect(c.progress).to.equal(1);
        });
    });
});

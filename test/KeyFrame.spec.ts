import { expect } from "chai";
import { ComponentFactory, IComponent, IComponentFactory, IFrameEvent } from "ecs-framework";
import "mocha";
import { IAnimationFrameEvent, IKeyFrame, IKeyFrameController, KeyFrameControllerComponent, PlaybackState } from "../src/KeyFrameController";
import { bezier, KeyFrameSystem } from "../src/KeyFrameSystem";

describe("KeyFrameController", () => {
    function incrementFrameEvent(e, delta = 1) {
        if (e.reverse) {
            e.time -= delta;
        } else {
            e.time += delta;
        }
        e.delta = delta;
        e.count += 1;
    }

    let system: KeyFrameSystem;
    let factory: ComponentFactory<KeyFrameControllerComponent>;
    let c: KeyFrameControllerComponent;

    beforeEach(() => {
        system = new KeyFrameSystem();
        factory = new ComponentFactory<KeyFrameControllerComponent>(10, KeyFrameControllerComponent, 0, 10, { P1x: 0.0, P1y: 0.0, P2x: 1.0, P2y: 1.0 });
        c = factory.create(1, true);
        c.from = 10;
        c.duration = 10;
    });

    describe("playstate", () => {
        it("instanciated KeyFrameControllerComponent should have it state set to stopped", () => {
            expect(c.from + c.duration).to.equal(20);
            expect(factory.get(1).playState).to.equal(PlaybackState.stopped);
        });
        it("set playstate to started when timeRef >= from and <= from+duration", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };

            incrementFrameEvent(e);
            expect(e.time).to.equal(1);
            system.setFactories(factory);
            system.process([e]);
            expect(factory.get(1).playState).to.equal(PlaybackState.stopped);

            incrementFrameEvent(e, 9);
            expect(e.time).to.equal(10);
            system.setFactories(factory);
            system.process([e]);
            expect(factory.get(1).playState).to.equal
                (PlaybackState.started);

        });
        it("set playstate to playing when timeRef >= from and <= from+duration and it was already set to started", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };

            incrementFrameEvent(e, 11);
            expect(e.time).to.equal(11);
            system.setFactories(factory);
            system.process([e]);
            expect(factory.get(1).playState).to.equal(PlaybackState.started);

            incrementFrameEvent(e);
            expect(e.time).to.equal(12);
            system.setFactories(factory);
            system.process([e]);
            expect(factory.get(1).playState).to.equal(PlaybackState.playing);
        });
        it("set playstate to ended when timeRef >= from and > from+duration and it was set as playing", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };

            // start
            incrementFrameEvent(e, 11);
            expect(e.time).to.equal(11);
            system.setFactories(factory);
            system.process([e]);

            // playing
            incrementFrameEvent(e);
            expect(e.time).to.equal(12);
            system.setFactories(factory);
            system.process([e]);
            incrementFrameEvent(e, 9);
            expect(e.time).to.equal(21);
            system.setFactories(factory);
            system.process([e]); expect(factory.get(1).playState).to.equal(PlaybackState.ended);
        });
        it("set playstate to stopped if state was set on ended", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
            // start
            incrementFrameEvent(e, 11);
            expect(e.time).to.equal(11);
            system.setFactories(factory);
            system.process([e]);
            // playing
            incrementFrameEvent(e);
            expect(e.time).to.equal(12);
            system.setFactories(factory);
            system.process([e]);
            // ended
            incrementFrameEvent(e, 9);
            expect(e.time).to.equal(21);
            system.setFactories(factory);
            system.process([e]);
            incrementFrameEvent(e);
            expect(e.time).to.equal(22);
            system.setFactories(factory);
            system.process([e]);
            expect(factory.get(1).playState).to.equal(PlaybackState.stopped);
        });
    });
    describe("timer ", () => {
        it("in paying state increment the timer by the delta of reference timer", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
            expect(c.timer.time).to.equal(0);

            // start
            incrementFrameEvent(e, 11);
            expect(e.time).to.equal(11);
            system.setFactories(factory);
            system.process([e]);
            // playing
            incrementFrameEvent(e);
            expect(e.time).to.equal(12);
            system.setFactories(factory);
            system.process([e]);
            expect(e.delta).to.equal(1);
            expect(c.timer.time).to.equal(1);

            incrementFrameEvent(e);
            expect(e.time).to.equal(13);
            system.setFactories(factory);
            system.process([e]);
            expect(e.delta).to.equal(1);
            expect(c.timer.time).to.equal(2);
        });
    });
    describe("play in reverse", () => {
        it("start playing from the end when reverse param is set to true", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
            c.timer.reverse = true;
            incrementFrameEvent(e);
            system.setFactories(factory);
            system.process([e]);
            expect(c.timer.time).to.equal(0);

            incrementFrameEvent(e, 9);
            system.setFactories(factory);
            system.process([e]);
            expect(c.timer.time).to.equal(c.duration);

        });
        it("decrement the animation timer when playing in reverse", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
            c.timer.reverse = true;
            incrementFrameEvent(e);
            system.setFactories(factory);
            system.process([e]);
            expect(c.timer.time).to.equal(0);

            incrementFrameEvent(e, 9);
            system.setFactories(factory);
            system.process([e]);
            expect(c.timer.time).to.equal(c.duration);

            incrementFrameEvent(e);
            system.setFactories(factory);
            system.process([e]);
            expect(c.timer.time).to.equal(c.duration - 1);
        });
    });
    describe("cycling", () => {
        it("toPlayInReverse should set to false by default", () => {
            expect(c.cycling).to.equal(false);
        });
        it("set to started when timer reach the end and toLoop is true", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
            c.nbLoop = 2;
            incrementFrameEvent(e, 10);
            system.setFactories(factory);
            system.process([e]);
            incrementFrameEvent(e, 11);
            system.setFactories(factory);
            system.process([e]);
            expect(c.playState).to.equal(PlaybackState.started);

        });
        it("start from 0 when looping", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
            c.nbLoop = 2;
            incrementFrameEvent(e, 10);
            system.setFactories(factory);
            system.process([e]);
            incrementFrameEvent(e, 11);
            system.setFactories(factory);
            system.process([e]);
            expect(c.playState).to.equal(PlaybackState.started);
            expect(c.timer.time).to.equal(0);

        });
        it("increment loopCount at the end", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
            c.nbLoop = 2;
            expect(c.timer.loopCount).to.equal(0);
            incrementFrameEvent(e, 10);
            system.setFactories(factory);
            system.process([e]);
            incrementFrameEvent(e, 11);
            system.setFactories(factory);
            system.process([e]);
            expect(c.timer.loopCount).to.equal(1);
        });
        it("loop the number of time specified by the param nbLoop", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
            c.cycling = false;
            c.nbLoop = 2;
            expect(c.timer.loopCount).to.equal(0);
            incrementFrameEvent(e, 10);
            system.setFactories(factory);
            system.process([e]);
            incrementFrameEvent(e, 11);
            system.setFactories(factory);
            system.process([e]);
            expect(c.timer.loopCount).to.equal(1);

            incrementFrameEvent(e);
            system.setFactories(factory);
            system.process([e]);
            incrementFrameEvent(e, 10);
            system.setFactories(factory);
            system.process([e]);
            expect(c.timer.loopCount).to.equal(2);
        });
        it("loop indefinitely when nbLoop is set to 0", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
            c.nbLoop = 0;
            expect(c.timer.loopCount).to.equal(0);
            incrementFrameEvent(e, 10);
            system.setFactories(factory);
            system.process([e]);
            incrementFrameEvent(e, 11);
            system.setFactories(factory);
            system.process([e]);
            expect(c.timer.loopCount).to.equal(1);

            incrementFrameEvent(e, 10);
            system.setFactories(factory);
            system.process([e]);
            expect(c.timer.loopCount).to.equal(2);
            incrementFrameEvent(e, 10);
            system.setFactories(factory);
            system.process([e]);
            expect(c.timer.loopCount).to.equal(3);

            expect(e.time).to.equal(41);
            expect(c.timer.time).to.equal(0);
            expect(c.playState).to.equal(PlaybackState.started);
        });
        it("not looping when nbLoop is set to 1", () => {
            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };

            c.nbLoop = 1;
            expect(c.timer.loopCount).to.equal(0);
            incrementFrameEvent(e, 10);
            system.setFactories(factory);
            system.process([e]);
            incrementFrameEvent(e, 11);
            system.setFactories(factory);
            system.process([e]);
            expect(c.timer.loopCount).to.equal(1);

            incrementFrameEvent(e, 10);
            system.setFactories(factory);
            system.process([e]);
            expect(c.playState).to.equal(PlaybackState.stopped);
            expect(c.timer.loopCount).to.equal(1);

            incrementFrameEvent(e, 5);
            system.setFactories(factory);
            system.process([e]);
            expect(c.playState).to.equal(PlaybackState.stopped);
            expect(c.timer.loopCount).to.equal(1);
        });
        describe("looping in reverse", () => {
            it("increment the loopCount when looping in reverse", () => {
                expect(c.from + c.duration).to.equal(20);
                const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
                c.cycling = true;
                c.nbLoop = 2;

                expect(c.timer.loopCount).to.equal(0);
                incrementFrameEvent(e, 10);
                system.setFactories(factory);
                system.process([e]);
                incrementFrameEvent(e, 11);
                system.setFactories(factory);
                system.process([e]);
                expect(c.timer.loopCount).to.equal(1);
            });
            it("set to started when looping in reverse", () => {
                expect(c.from + c.duration).to.equal(20);
                const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
                c.cycling = true;
                c.nbLoop = 2;

                incrementFrameEvent(e, 10);
                system.setFactories(factory);
                system.process([e]);
                incrementFrameEvent(e, 11);
                system.setFactories(factory);
                system.process([e]);
                expect(c.playState).to.equal(PlaybackState.started);
            });
            it("start with timer set to duration instead of 0", () => {
                expect(c.from + c.duration).to.equal(20);
                const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
                c.cycling = true;
                c.nbLoop = 2;

                incrementFrameEvent(e, 10);
                system.setFactories(factory);
                system.process([e]);
                incrementFrameEvent(e, 11);
                system.setFactories(factory);
                system.process([e]);
                expect(c.playState).to.equal(PlaybackState.started);
                expect(c.timer.time).to.equal(c.duration);
            });
            it("have the timer set to reverse when looping in reverse", () => {
                expect(c.from + c.duration).to.equal(20);
                const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
                c.cycling = true;
                c.nbLoop = 2;

                incrementFrameEvent(e, 10);
                system.setFactories(factory);
                system.process([e]);
                expect(c.timer.reverse).to.equal(false);

                incrementFrameEvent(e, 11);
                system.setFactories(factory);
                system.process([e]);

                expect(c.playState).to.equal(PlaybackState.started);
                expect(c.timer.time).to.equal(c.duration);
                expect(c.timer.reverse).to.equal(true);
            });
            it("increment the loopCount when time reach 0 while it was playing in reverse", () => {
                expect(c.from + c.duration).to.equal(20);
                const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
                c.cycling = true;
                c.nbLoop = 3;

                incrementFrameEvent(e, 10);
                system.setFactories(factory);
                system.process([e]);

                incrementFrameEvent(e, 11);
                system.setFactories(factory);
                system.process([e]);
                expect(c.timer.loopCount).to.equal(1);

                incrementFrameEvent(e);
                system.setFactories(factory);
                system.process([e]);
                expect(c.timer.time).to.equal(9);

                incrementFrameEvent(e, 11);
                system.setFactories(factory);
                system.process([e]);
                expect(c.timer.time).to.equal(0);
                expect(c.timer.loopCount).to.equal(2);
            });
            it("increment timer when reach 0", () => {
                expect(c.from + c.duration).to.equal(20);
                const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
                c.cycling = true;
                c.nbLoop = 3;

                incrementFrameEvent(e, 10);
                system.setFactories(factory);
                system.process([e]);

                incrementFrameEvent(e, 11);
                system.setFactories(factory);
                system.process([e]);
                expect(c.timer.loopCount).to.equal(1);

                incrementFrameEvent(e);
                system.setFactories(factory);
                system.process([e]);

                incrementFrameEvent(e, 10);
                system.setFactories(factory);
                system.process([e]);
                expect(c.timer.time).to.equal(0);
                expect(c.timer.loopCount).to.equal(2);

                incrementFrameEvent(e, 2);
                system.setFactories(factory);
                system.process([e]);
                expect(c.timer.time).to.equal(2);
            });
            it("should set playsate to ended when all loop completed then stopped", () => {
                const from = 1000; // 1000ms
                const duration = 1000; // 1 seconde
                c = factory.create(1, true);
                c.from = from;
                c.duration = duration;
                c.cycling = true;
                c.nbLoop = 3;
                const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };

                // start
                const nbIncrement = c.nbLoop * c.duration + c.from + 1;
                const fps = 1000 / 60;
                for (let i = 0; i < nbIncrement / fps; ++i) {
                    incrementFrameEvent(e, fps);
                    system.setFactories(factory);
                    system.process([e]);
                }

                expect(e.time).to.be.at.least(nbIncrement);
                expect(c.playState).to.equal(PlaybackState.ended);

                incrementFrameEvent(e, fps);
                system.setFactories(factory);
                system.process([e]);

                expect(c.playState).to.equal(PlaybackState.stopped);
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
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
            expect(c.timer.time).to.equal(0);

            expect(c.progress).to.equal(0);

            // start
            incrementFrameEvent(e, 10);
            expect(e.time).to.equal(10);
            system.setFactories(factory);
            system.process([e]);

            // playing
            incrementFrameEvent(e, 5);
            expect(e.time).to.equal(15);
            system.setFactories(factory);
            system.process([e]);
            expect(e.delta).to.equal(5);
            expect(c.timer.time).to.equal(5);

            expect(c.progress).to.equal(0.5);
        });
        it("progress should take the value of easing function ", () => {
            c.easingParams = { P1x: 0.25, P1y: 0.1, P2x: 0.25, P2y: 1.0 };

            expect(c.from + c.duration).to.equal(20);
            const e: IFrameEvent = { delta: 0, time: 0, MS_PER_UPDATE: 0, lag: 0, lastFrame: Date.now() };
            expect(c.timer.time).to.equal(0);

            expect(c.progress).to.equal(0);

            // start
            incrementFrameEvent(e, 10);
            expect(e.time).to.equal(10);
            system.setFactories(factory);
            system.process([e]);

            // playing
            incrementFrameEvent(e, 5);
            expect(e.time).to.equal(15);
            system.setFactories(factory);
            system.process([e]);
            expect(e.delta).to.equal(5);
            expect(c.timer.time).to.equal(5);

            expect(c.progress).to.not.equal(0.5);

            incrementFrameEvent(e, 5);
            system.setFactories(factory);
            system.process([e]);
            expect(e.time).to.equal(20);
            expect(c.timer.time).to.equal(10);
            expect(c.progress).to.equal(1);
        });
    });
});

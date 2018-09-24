import { expect } from "chai";
import { ComponentFactory, interfaces } from "ecs-framework";
import "mocha";
import { IEasingFunctions } from "../src/EasingFunctions";
import { FillMode, ITimelineParams, PlaybackDirection, PlayState, TimelineSystem } from "../src/TimeLine";

describe("TimeLine playstate", () => {
    let system: TimelineSystem;
    const defaultTimeLineParams: ITimelineParams = {
        active: true,
        bezier: null,
        currentDirection: null,
        currentIteration: 0,
        // delta: 0,
        directedProgress: null,
        duration: 0,
        easingFunction: "linear" as keyof IEasingFunctions,
        // endDelay: 0,
        entityId: 0,
        fill: FillMode.both,
        iterationProgress: 0,
        iterationStart: 0,
        iterations: 1,
        playDirection: PlaybackDirection.normal,
        playRate: 1.0,
        progress: null,
        startDelay: 0,
        startTime: 0,
        state: PlayState.idle,
        time: null,
        transformedProgress: null,
    };

    let frameEvent: interfaces.IFrameEvent = {
        MS_PER_UPDATE: 0,
        delta: 0,
        lag: 0,
        lastFrame: 0,
        state: "idle",
        time: 0,
    };

    let tmPool: ComponentFactory<ITimelineParams>;

    beforeEach(() => {
        system = new TimelineSystem();
        tmPool = new ComponentFactory<ITimelineParams>(10, Object.assign({}, defaultTimeLineParams));

        system.setParamSource("*", tmPool);
        system.validateParametersSources();

        frameEvent = {
            MS_PER_UPDATE: 0,
            delta: 0,
            lag: 0,
            lastFrame: 0,
            state: "idle",
            time: 0,
        };
    });
    describe("time", () => {
        it("holds a time from the parent timeline and relative to startTime", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;

            frameEvent.state = "running";
            frameEvent.time = 5;
            system.process(frameEvent);
            expect(tm1.time).to.lessThan(0);

            frameEvent.time = 10;
            system.process(frameEvent);
            expect(tm1.time).to.eq(frameEvent.time - tm1.startTime);

            frameEvent.time = 20;
            system.process(frameEvent);
            expect(tm1.time).to.eq(frameEvent.time - tm1.startTime);

            frameEvent.time = 21;
            system.process(frameEvent);
            expect(tm1.time).to.gt(tm1.duration);

        });
        it("playRate > 1 should scale the time", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            tm1.playRate = 2;

            frameEvent.state = "running";
            frameEvent.time = 5;
            system.process(frameEvent);
            expect(tm1.time).to.lessThan(0);

            frameEvent.time = 10;
            system.process(frameEvent);
            expect(tm1.time).to.eq(0);

            frameEvent.time = 15;
            system.process(frameEvent);
            expect(tm1.time).to.eq((frameEvent.time - tm1.startTime) * tm1.playRate);

            frameEvent.time = 20;
            system.process(frameEvent);
            expect(tm1.time).to.eq((frameEvent.time - tm1.startTime) * tm1.playRate);

            // don't update if finished ?
            frameEvent.time = 25;
            system.process(frameEvent);
            expect(tm1.time).to.eq((frameEvent.time - tm1.startTime) * tm1.playRate);

        });
    });
    describe("overall progression", () => {
        describe("1 iteteration", () => {
            describe("should increment update the progression when in active phase", () => {
                it("FillMode.forwards should keep progress to 1 after finished, and null before running", () => {
                    const tm1 = tmPool.create(2, true);
                    tm1.startTime = 10;
                    tm1.duration = 10;
                    tm1.fill = FillMode.forwards;

                    frameEvent.state = "running";
                    frameEvent.time = 5;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(null);

                    frameEvent.time = 10;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(0);

                    frameEvent.time = 15;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(0.5);

                    frameEvent.time = 20;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(1);

                    frameEvent.time = 30;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(1);

                    frameEvent.time = 40;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(1);
                });
                it("FillMode.backwards should have progress set to 0 prior running and null after finishing", () => {
                    const tm1 = tmPool.create(1, true);
                    tm1.startTime = 10;
                    tm1.duration = 10;
                    tm1.fill = FillMode.backwards;

                    frameEvent.state = "running";
                    frameEvent.time = 5;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(0);

                    frameEvent.time = 10;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(0);

                    frameEvent.time = 15;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(0.5);

                    frameEvent.time = 20;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(null);

                    frameEvent.time = 30;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(null);

                    frameEvent.time = 40;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(null);
                });
                it("FillMode.both should set progress to 0 prior running and keep value 1 after finishing", () => {
                    const tm1 = tmPool.create(1, true);
                    tm1.startTime = 10;
                    tm1.duration = 10;
                    tm1.fill = FillMode.both;

                    frameEvent.state = "running";
                    frameEvent.time = 5;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(0);

                    frameEvent.time = 10;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(0);

                    frameEvent.time = 15;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(0.5);

                    frameEvent.time = 20;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(1);

                    frameEvent.time = 30;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(1);

                    frameEvent.time = 40;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(1);
                });
                it("FillMode.none should set progress to null before running and after finishing", () => {
                    const tm1 = tmPool.create(1, true);
                    tm1.startTime = 10;
                    tm1.duration = 10;
                    tm1.fill = FillMode.none;

                    frameEvent.state = "running";
                    frameEvent.time = 5;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(null);

                    frameEvent.time = 10;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(0);

                    frameEvent.time = 15;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(0.5);

                    frameEvent.time = 20;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(null);

                    frameEvent.time = 30;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(null);

                    frameEvent.time = 40;
                    system.process(frameEvent);
                    expect(tm1.progress).to.eq(null);
                });
            });

            it("with iterationStart > 0", () => {

            });
            describe("with multiple iteration", () => {

            });
        });
    });
    describe("iteration progress", () => {
        it("return the progress of the current iteration", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            tm1.iterations = 2;

            frameEvent.state = "running";
            frameEvent.time = 5;
            system.process(frameEvent);
            expect(tm1.iterationProgress).to.eq(0);

            frameEvent.time = 15;
            system.process(frameEvent);
            expect(tm1.iterationProgress).to.eq(0.5);

            // when multiples iteratons final value 1 is reached only at the last iteration
            frameEvent.time = 20;
            system.process(frameEvent);
            expect(tm1.iterationProgress).to.eq(0);

            frameEvent.time = 25;
            system.process(frameEvent);
            expect(tm1.iterationProgress).to.eq(0.5);

            frameEvent.time = 30;
            system.process(frameEvent);
            expect(tm1.iterationProgress).to.eq(1);

            frameEvent.time = 35;
            system.process(frameEvent);
            expect(tm1.iterationProgress).to.eq(1);
        });
    });
    describe("current iteration", () => {
        it("should is the nth iteration", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            tm1.iterations = 3;

            frameEvent.state = "running";
            frameEvent.time = 5;
            system.process(frameEvent);
            expect(tm1.currentIteration).to.eq(0);

            frameEvent.time = 10;
            system.process(frameEvent);
            expect(tm1.currentIteration).to.eq(0);

            frameEvent.time = 15;
            system.process(frameEvent);
            expect(tm1.currentIteration).to.eq(0);

            frameEvent.time = 20;
            system.process(frameEvent);
            expect(tm1.currentIteration).to.eq(1);

            frameEvent.time = 25;
            system.process(frameEvent);
            expect(tm1.currentIteration).to.eq(1);

            frameEvent.time = 30;
            system.process(frameEvent);
            expect(tm1.currentIteration).to.eq(2);

            frameEvent.time = 40;
            system.process(frameEvent);
            expect(tm1.currentIteration).to.eq(2);

            frameEvent.time = 45;
            system.process(frameEvent);
            expect(tm1.currentIteration).to.eq(2);

            frameEvent.time = 60;
            system.process(frameEvent);
            expect(tm1.currentIteration).to.eq(2);
        });
    });

    describe("directedProgress", () => {
        it("represent current iteration progress relative to the animationDirection", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            tm1.iterations = 2;
            tm1.playDirection = PlaybackDirection.reverse;

            frameEvent.state = "running";
            frameEvent.time = 14;
            system.process(frameEvent);
            expect(tm1.directedProgress).to.eq(0.6);

            frameEvent.state = "running";
            frameEvent.time = 10;
            system.process(frameEvent);
            expect(tm1.directedProgress).to.eq(1.0);

        });
        it("playDirection alternate", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            tm1.iterations = 2;
            tm1.playDirection = PlaybackDirection.alternate;

            frameEvent.state = "running";
            frameEvent.time = 14;
            system.process(frameEvent);
            expect(tm1.directedProgress).to.eq(0.4);

            frameEvent.time = 19;
            system.process(frameEvent);
            expect(tm1.iterationProgress).to.eq(0.9);
            expect(tm1.directedProgress).to.eq(0.9);

            frameEvent.time = 20;
            system.process(frameEvent);
            // 1 is reached only on the last iteration
            expect(tm1.iterationProgress).to.equal(0);
            expect(tm1.directedProgress).to.eq(0);

            frameEvent.time = 22;
            system.process(frameEvent);
            expect(tm1.iterationProgress).to.approximately(0.2, 0.01);
            expect(tm1.directedProgress).to.eq(0.8);

            frameEvent.time = 28;
            system.process(frameEvent);
            expect(tm1.iterationProgress).to.approximately(0.8, 0.001);
            expect(tm1.directedProgress).to.approximately(0.2, 0.001);

            frameEvent.time = 30;
            system.process(frameEvent);
            expect(tm1.iterationProgress).to.equal(1);
            expect(tm1.directedProgress).to.equal(0);
            expect(tm1.state).to.equal(PlayState.justFinished);

            frameEvent.time = 31;
            system.process(frameEvent);
            expect(tm1.iterationProgress).to.equal(1);
            expect(tm1.directedProgress).to.equal(0);
            expect(tm1.state).to.equal(PlayState.finished);

            system.process(frameEvent);
            frameEvent.time = 32;
            expect(tm1.iterationProgress).to.equal(1);
            expect(tm1.directedProgress).to.equal(0);
            expect(tm1.state).to.equal(PlayState.finished);

        });
    });
    describe("transformedProgress", () => {
        it("transform progress === directedProgress if no easeing function or bezier are set", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            tm1.iterations = 3;
            tm1.playDirection = PlaybackDirection.alternate;
            tm1.easingFunction = null;
            tm1.bezier = null;

            frameEvent.state = "running";
            frameEvent.time = 10;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);

            frameEvent.time = 15;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);

            frameEvent.time = 20;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);

            frameEvent.time = 25;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);

            frameEvent.time = 45;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);

        });
        it("should be able to use a bezier curve", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            tm1.iterations = 3;
            tm1.playDirection = PlaybackDirection.alternate;
            tm1.easingFunction = null;
            // bezier that equal linear transformation for ease of testing
            tm1.bezier = { P1x: 0, P1y: 0, P2x: 1.0, P2y: 1.0 };

            frameEvent.state = "running";
            frameEvent.time = 10;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);

            frameEvent.time = 15;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);

            frameEvent.time = 20;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);

            frameEvent.time = 35;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);
        });
        it("should be able to use a pre-made function by name", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            tm1.iterations = 3;
            tm1.playDirection = PlaybackDirection.alternate;
            tm1.easingFunction = "linear";
            tm1.bezier = null;

            frameEvent.state = "running";
            frameEvent.time = 10;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);

            frameEvent.time = 15;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);

            frameEvent.time = 20;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);

            frameEvent.time = 35;
            system.process(frameEvent);
            expect(tm1.transformedProgress).to.eq(tm1.directedProgress);
        });
    });
});

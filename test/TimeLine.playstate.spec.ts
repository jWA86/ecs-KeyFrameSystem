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
        playRate: 1,
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
        system = new TimelineSystem(defaultTimeLineParams);
        tmPool = new ComponentFactory<ITimelineParams>(10, defaultTimeLineParams);

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
    describe("idle (no yet started)", () => {
        it("timeline should be set to idle by default when not yet started", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;

            frameEvent.time += 1;
            frameEvent.state = "running";
            expect(frameEvent.time).to.be.lessThan(tm1.startTime);
            system.process(frameEvent);
            expect(tm1.state).to.equal(PlayState.idle);
        });
    });
    describe("running", () => {
        it("should be set to 'running' when parent timeline >= timeLine.startTime and it was has already been started", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;

            frameEvent.time = 1;
            frameEvent.state = "running";
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of idle").to.equal(PlayState.idle);

            frameEvent.time = 10;
            system.process(frameEvent);

            frameEvent.time = 12;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'running'").to.equal(PlayState.running);
        });
        it("should be set to 'started' if it was in state idle before ", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;

            frameEvent.time = 1;
            frameEvent.state = "running";
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of idle").to.equal(PlayState.idle);

            frameEvent.time = 10;
            system.process(frameEvent);
            expect(frameEvent.time).to.equal(tm1.startTime);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'started'").to.equal(PlayState.started);
        });
        it("startDelay should offset the setting of 'started' ", () => {
            const tm1 = tmPool.create(2, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            tm1.startDelay = 5;

            frameEvent.state = "running";
            frameEvent.time = 5;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of idle").to.equal(PlayState.idle);

            frameEvent.time = 10;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of idle").to.equal(PlayState.idle);

            frameEvent.time = 15;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of started").to.equal(PlayState.started);

            frameEvent.time = 20;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of running").to.equal(PlayState.running);

            frameEvent.time = 25;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of justFinished").to.equal(PlayState.justFinished);
        });
        it("negative startDelay should offset the active phase", () => {
            const tm1 = tmPool.create(3, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            tm1.startDelay = -5;

            frameEvent.state = "running";
            frameEvent.time = 4;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of idle").to.equal(PlayState.idle);

            frameEvent.time = 5;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of idle").to.equal(PlayState.idle);

            frameEvent.time = 10;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of started").to.equal(PlayState.started);
            expect(tm1.progress).to.equal(0.5);

            frameEvent.time = 15;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of justFinished").to.equal(PlayState.justFinished);
            expect(tm1.progress).to.equal(1);

            frameEvent.time = 20;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of finished").to.equal(PlayState.finished);
            expect(tm1.progress).to.equal(1);

        });
    });
    describe("finished", () => {
        beforeEach(() => {
            tmPool = new ComponentFactory<ITimelineParams>(10, defaultTimeLineParams);
            system.setParamSource("*", tmPool);
            system.validateParametersSources();
        });
        it("should be set to justFinished when parentTimeLine === timeline endTime", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            const endTime = system.endTime(0, system.activeDuration(10, 1), 0);

            frameEvent.time = tm1.startTime + endTime;
            frameEvent.state = "running";
            system.process(frameEvent);
            expect(frameEvent.time).to.equal(tm1.startTime + tm1.duration);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'justFinished'").to.equal(PlayState.justFinished);
        });
        it("should be set to finished when parentTimeLine > timeline endTime and already set to justFinished", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            const endTime = system.endTime(0, system.activeDuration(10, 1), 0);

            frameEvent.state = "running";
            frameEvent.time = 21;
            system.process(frameEvent);
            expect(frameEvent.time).to.be.greaterThan(tm1.startTime + tm1.duration);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'justFinished'").to.equal(PlayState.justFinished);

            frameEvent.time = tm1.startTime + endTime + 10;
            system.process(frameEvent);
            expect(frameEvent.time).to.be.greaterThan(tm1.startTime + tm1.duration);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'finished'").to.equal(PlayState.finished);

            frameEvent.time = tm1.startTime + endTime + 20;
            system.process(frameEvent);
            expect(frameEvent.time).to.be.greaterThan(tm1.startTime + tm1.duration);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'finished'").to.equal(PlayState.finished);
        });
        // it("negative endDelay should offset the endTime", () => {
        //     const tm1 = tmPool.create(1, true);
        //     tm1.startTime = 10;
        //     tm1.duration = 10;
        //     tm1.startDelay = 0;
        //     tm1.endDelay = -5;

        //     frameEvent.state = "running";
        //     frameEvent.time = 0;
        //     system.process(frameEvent);
        //     console.log(tm1.progress);
        //     expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'idle'").to.equal(PlayState.idle);

        //     frameEvent.time = 10;
        //     system.process(frameEvent);
        //     console.log(tm1.progress);
        //     expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'running'").to.equal(PlayState.running);
        //     expect(tm1.progress).to.equal(0);

        //     frameEvent.time = 15;
        //     system.process(frameEvent);
        //     expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'finished'").to.equal(PlayState.finished);
        //     expect(tm1.progress).to.equal(0.5);

        //     frameEvent.time = 20;
        //     system.process(frameEvent);
        //     expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'finished'").to.equal(PlayState.finished);
        //     expect(tm1.progress).to.equal(0.5);

        // });
        // it("endDelay", () => {

        // });
        it("when in reverse playback", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            tm1.playDirection = PlaybackDirection.reverse;

            frameEvent.state = "running";
            frameEvent.time = 0;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'idle'").to.equal(PlayState.idle);

            frameEvent.time = 10;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'started'").to.equal(PlayState.started);

            frameEvent.time = 15;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'running'").to.equal(PlayState.running);

            frameEvent.time = 20;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'justFinished'").to.equal(PlayState.justFinished);

            frameEvent.time = 21;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'finished'").to.equal(PlayState.finished);

            frameEvent.time = 22;
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'finished'").to.equal(PlayState.finished);
        });
    });
    describe("paused", () => {
        it("should be paused if parentTimeline is paused", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            tm1.state = PlayState.idle;

            frameEvent.state = "running";
            system.process(frameEvent);

            frameEvent.time = 1;
            frameEvent.state = "paused";
            system.process(frameEvent);

            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'paused'").to.equal(PlayState.paused);
        });
    });
    describe("reset", () => {

    });
});

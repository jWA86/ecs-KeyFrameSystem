import { expect } from "chai";
import { ComponentFactory, interfaces } from "ecs-framework";
import "mocha";
import EasingFunctions from "../src/EasingFunctions";
import { AnimationDirection, FillMode, ITimelineParams, PlaybackDirection, PlayState, TimelineSystem } from "../src/TimeLine";

describe.only("TimeLine playstate", () => {
    let system: TimelineSystem;
    const defaultTimeLineParams: ITimelineParams = {
        active: true,
        currentDirection: AnimationDirection.forwards,
        delta: 0,
        duration: 0,
        easing: "linear" as keyof EasingFunctions,
        endDelay: 0,
        entityId: 0,
        fill: FillMode.both,
        iterationStart: 0,
        iterations: 1,
        playDirection: PlaybackDirection.normal,
        playRate: 1,
        startDelay: 0,
        startTime: 0,
        state: PlayState.idle,
        time: 0,
    };

    let frameEvent: interfaces.IFrameEvent = {
        MS_PER_UPDATE: 0,
        delta: 0,
        lag: 0,
        lastFrame: 0,
        state: "idle",
        time: 0,
    };

    // const incrementFrameEvent = (fE: interfaces.IFrameEvent, inc = 1, delta = 0) => {
    //     fE.time += 1;
    //     fE.delta = delta;
    // };

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
        it("should be set to active when parent timeline >= timeLine.startTime", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;

            frameEvent.time = 1;
            frameEvent.state = "running";
            system.process(frameEvent);
            expect(tm1.state, "timeline component is in state " + PlayState[tm1.state] + " instead of idle").to.equal(PlayState.idle);

            frameEvent.time = 10;
            frameEvent.state = "running";
            system.process(frameEvent);
            expect(frameEvent.time).to.equal(tm1.startTime);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'running'").to.equal(PlayState.running);
        });
    });
    describe("finished", () => {
        it("should be set to finished when parentTimeLine === timeline endTime", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            const endTime = system.endTime(tm1.startDelay, system.activeDuration(10, 1), tm1.endDelay);

            frameEvent.time = tm1.startTime + endTime;
            frameEvent.state = "running";
            system.process(frameEvent);
            expect(frameEvent.time).to.equal(tm1.startTime + tm1.duration);
            expect(tm1.state, "timeline component is in state '" + PlayState[tm1.state] + "' instead of 'finished'").to.equal(PlayState.finished);
        });
        it("should be set to finished when parentTimeLine > timeline endTime", () => {
            const tm1 = tmPool.create(1, true);
            tm1.startTime = 10;
            tm1.duration = 10;
            const endTime = system.endTime(tm1.startDelay, system.activeDuration(10, 1), tm1.endDelay);

            frameEvent.time = tm1.startTime + endTime + 10;
            frameEvent.state = "running";
            system.process(frameEvent);
            expect(frameEvent.time).to.be.greaterThan(tm1.startTime + tm1.duration);
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

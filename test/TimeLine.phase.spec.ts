import { expect } from "chai";
import { interfaces } from "ecs-framework";
import "mocha";
import { IEasingFunctions } from "../src/EasingFunctions";
import { AnimationDirection, FillMode, ITimelineParams, Phase, PlaybackDirection, PlayState, TimelineSystem } from "../src/TimeLine";

describe("Timeline Phase", () => {
    let system: TimelineSystem;
    const defaultTimeLineParams: ITimelineParams = {
        active: true,
        bezier: null,
        currentDirection: AnimationDirection.forwards,
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
        iterations: Infinity,
        playDirection: PlaybackDirection.normal,
        playRate: 1,
        progress: null,
        startDelay: 0,
        startTime: 0,
        state: PlayState.idle,
        time: 0,
        transformedProgress: null,
    };

    const frameEvent: interfaces.IFrameEvent = {
        MS_PER_UPDATE: 0,
        delta: 0,
        lag: 0,
        lastFrame: 0,
        state: "idle",
        time: 0,
    };

    beforeEach(() => {
        system = new TimelineSystem(defaultTimeLineParams);
    });
    describe("time boundaries", () => {

        it("activeDuration should be equal the total duration of a TimeLine", () => {

            expect(system.activeDuration(0, 10)).to.equal(0);
            expect(system.activeDuration(2, 10)).to.equal(20);
            expect(system.activeDuration(10, 0)).to.equal(0);
            expect(system.activeDuration(10, 2)).to.equal(20);
            expect(system.activeDuration(0, Math.pow(10, 1000))).to.equal(0);
            expect(system.activeDuration(10, Math.pow(10, 1000))).to.equal(Infinity);
        });
        it("endTime is the total duration including startDelay and endDelay & always >= 0", () => {
            expect(system.endTime(0, 0, 0)).to.equal(0);
            expect(system.endTime(0, 10, 0)).to.equal(10);
            expect(system.endTime(10, 10, 0)).to.equal(20);
            expect(system.endTime(10, 10, 10)).to.equal(30);
            expect(system.endTime(-20, 10, 0)).to.equal(0);
            expect(system.endTime(10, 10, -10)).to.equal(10);

        });
        it("animationDirection is determined by the playback rate", () => {
            expect(system.animationDirection(1)).to.equal(AnimationDirection.forwards);
            expect(system.animationDirection(-1)).to.equal(AnimationDirection.reverse);
            expect(system.animationDirection(2)).to.equal(AnimationDirection.forwards);
            expect(system.animationDirection(-2)).to.equal(AnimationDirection.reverse);
            expect(system.animationDirection(0)).to.equal(AnimationDirection.forwards);
        });
        it("beforeActiveBoundaryTime is the time before the timeline is started and should take the start delay into account and should not be < to 0 ", () => {
            expect(system.beforeActiveBoundaryTime(0, 10)).to.equal(0);
            expect(system.beforeActiveBoundaryTime(10, 20)).to.equal(10);
            expect(system.beforeActiveBoundaryTime(10, 5)).to.equal(5);
            expect(system.beforeActiveBoundaryTime(-10, 20)).to.equal(0);
        });
        it("activeAfterBoundaryTime is the time after which the timeline is started & is always >= 0", () => {
            expect(system.activeAfterBoundaryTime(0, 0, 0)).to.equal(0);
            expect(system.activeAfterBoundaryTime(0, 10, 10)).to.equal(10);
            expect(system.activeAfterBoundaryTime(10, 10, 20)).to.equal(20);
            expect(system.activeAfterBoundaryTime(10, 10, 10)).to.equal(10);
            expect(system.activeAfterBoundaryTime(-20, 10, 10)).to.equal(0);
        });
    });

    describe("play phase is based on the timeline boundaries, current reference timeline play direction and startDelay & endDelay", () => {
        describe("before phase", () => {
            it("if localTime is < beforeActiveBoundaryTime", () => {
                const beforeActive = 10;
                const afterActive = 20;

                expect(system.phase(0, AnimationDirection.forwards, beforeActive, afterActive)).to.equal(Phase.before);

                expect(system.phase(15, AnimationDirection.forwards, beforeActive, afterActive)).to.not.equal(Phase.before);

                expect(system.phase(10, AnimationDirection.forwards, beforeActive, afterActive)).to.not.equal(Phase.before);

            });
            it("if playing reverse & localTime === beforeActiveBoundaryTime", () => {
                const beforeActive = 10;
                const afterActive = 20;

                expect(system.phase(10, AnimationDirection.reverse, beforeActive, afterActive)).to.equal(Phase.before);

                expect(system.phase(11, AnimationDirection.reverse, beforeActive, afterActive)).to.not.equal(Phase.before);

                expect(system.phase(20, AnimationDirection.reverse, beforeActive, afterActive)).to.not.equal(Phase.before);
            });
        });
        describe("after phase", () => {
            it("if localtime is > activeAfterBoundaryTime", () => {
                const beforeActive = 10;
                const afterActive = 20;

                expect(system.phase(25, AnimationDirection.forwards, beforeActive, afterActive)).to.equal(Phase.after);
            });
            it("if localTime === activeAfterBoundaryTime & playing forwards", () => {
                const beforeActive = 10;
                const afterActive = 20;

                expect(system.phase(20, AnimationDirection.forwards, beforeActive, afterActive)).to.equal(Phase.after);

                expect(system.phase(20, AnimationDirection.reverse, beforeActive, afterActive)).to.not.equal(Phase.after);
            });
        });
        describe("active phase", () => {

            it("if neither in beforePhase or AfterPhase", () => {
                const beforeActive = 10;
                const afterActive = 20;

                expect(system.phase(15, AnimationDirection.forwards, beforeActive, afterActive)).to.equal(Phase.active);

                expect(system.phase(15, AnimationDirection.reverse, beforeActive, afterActive)).to.equal(Phase.active);
            });
        });
    });
});

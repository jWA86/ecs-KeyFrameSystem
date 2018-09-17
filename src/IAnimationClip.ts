import { AnimationDirection, FillMode, Phase } from "./TimeLine";

// Effect
// object
// transform
// duration
// fill

// timeline / timing options
// time
// startTime
// startDelay
// endDelay
// duration
// playDirection
// repeat
// easing

// play
// reverse (decrease time)
// pause
// finish (go to end of timeline)
// cancel
// remove
// go to

// difference beetween reverse and backward
export interface ITimelineSettings {
    startTime: number; // relative to the timeline
    startDelay: number; // offset from the startTime, use to compute iterationStart (ie: skip part)
    iterationStart: number; // ie: 0.5 would start half way
    endDelay: number; // offset from the end
    duration: number; // 0 to infinit
    playDirection: PlaybackDirection; // direction to be played at each repetition
    iterations: number; // the number of iterations to be played
    easing: IBezierParams | undefined; // scale time by an easing function
    fill: FillMode;
    // composite: Composite;
}

export interface IPlaybackState {
    holdTime: Date;
    currentDirection: AnimationDirection;
    currentIteration: number;
    localTime: number;
    activeTime: number; // after start delay
    progress: number; // whole number: iterations count and decimal correspond to current iteration progress.
    // iterationProgress + current iteration
    // i.e : 1.5 = half way part of the second iteration
    iterationProgress: number; // progress on the current iteration (0 to 1)
    directedProgress: number; // incorporate the playback progress
    // if current direction is forwards : == iterationProgress otherwise 1.0 - iterationProgress
    transformedProgress: number;
    // progress scale by a timing function
}

// computed from ITimeline
// use to decide wheter to proceed itself and children
// interface ITimelineBoundary {
//     start: number; // min(startTimeSetting + start delay, 0).
//     to: number; // max(start delay + active duration + end delay, 0).
//     playDirection: AnimationDirection;
//     repeat: number;
// }

// interface IPlayBack {
//     currentDirection: "forwards" | "backwards"; // current play direction, "forwards" : time is incrementing, "backwards" : time is decreasing
//     currentState: PlayState; // default : idle
//     currentTime: number | undefined; // miliseconds since start
//     delta: number | undefined; // time difference from last call.
//     rate: number; // playback rate default = 1 // when currentDirection == "backwards" negate it
//     iterationProgress: number;
//     // directedProgress: number; //
// }

// mul delta by rate because we scale the vec

// Forwards for playRate 1 : 10 - 10 == last call time == 0, 10 later == currentTime
// P.currentTime - P.rate * P.delta = 0 test from [0 to 10]
// rate 2 : should be 0 to 20
// 10 - 20 = max(-10, 0) , test from 0 to currentTime * P.rate
// backwards rate = -1
// current time == 20, delta = 20, means from 40 to 20
// 20 - P.rate * 20 = 20 + 20 = 40 test from [40 to 20]
// rate - 2
// 20 - -2*20 = 20 + 40 = 60 : test from [60 to 20]

// return end1 >= start2 && end2 >= start1

interface IBezierParams { P1x: number; P1y: number; P2x: number; P2y: number; }

// interface IKeyFrame {
//     startTime: number;
//     duration: number;
//     easingParams: IBezierParams;
// }

// interface IKeyFrameController {
//     previousProgress: number;
//     progress: number; // 0 to 1
//     timer: IAnimationFrameEvent;
//     cycling: boolean;
//     fadeLoop: boolean;
//     nbLoop: number; // 0 = infinit
// }

// base timeline time == clock



import { interfaces } from "ecs-framework";
export { PlaybackState, IAnimationFrameEvent, IBezierParams, IKeyFrame, IKeyFrameController, KeyFrameControllerComponent };

enum PlaybackState {
    // First update flag to start
    "started",
    // Next will be in playing flag for the whole duration
    "playing",
    // Ended once it reach the end of a timeline
    "ended",
    // Next will be in stopped until it's start again
    "stopped",
    "paused",
}

interface IAnimationFrameEvent {
    count: number; // the number of times the frame event was fired
    delta: number; // the time passed in seconds since the last frame event
    loopCount: number;
    reverse: boolean;
    time: number; // the total amount of time passed since the first frame event in seconds
}

interface IBezierParams { P1x: number; P1y: number; P2x: number; P2y: number; }

interface IKeyFrame {
    from: number;
    duration: number;
    easingParams: IBezierParams;
}

interface IKeyFrameController {
    progress: number; // 0 to 1
    playState: PlaybackState;
    timer: IAnimationFrameEvent;
    cycling: boolean;
    fadeLoop: boolean;
    nbLoop: number; // 0 = infinit
}

class KeyFrameControllerComponent implements IKeyFrameController, IKeyFrame, interfaces.IComponent {
    public nbLoop: number = 1;
    public progress: number = 0;
    public playState: PlaybackState = PlaybackState.stopped;
    public timer: IAnimationFrameEvent = { count: 0, delta: 0, loopCount: 0, reverse: false, time: 0 };
    public cycling: boolean = false;
    public fadeLoop: boolean = false;
    constructor(public entityId, public active, public from: number, public duration: number, public easingParams: IBezierParams = { P1x: 0.0, P1y: 0.0, P2x: 1.0, P2y: 1.0 }) {
    }
}

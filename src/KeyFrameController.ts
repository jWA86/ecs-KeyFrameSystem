import { IComponent } from "componententitysystem";
export { PlaybackState, IFrameEvent, IKeyFrame, IKeyFrameController, KeyFrameControllerComponent }

enum PlaybackState {
    //first update flag to start
    "started",
    //next will be in playing flag for the whole duration
    "playing",
    // ended once it reach the end of a timeline
    "ended",
    // next will be in stopped until it's start again
    "stopped",
    "paused",
}

interface IFrameEvent {
    count: number; //the number of times the frame event was fired
    delta: number; //the time passed in seconds since the last frame event
    loopCount: number;
    reverse: boolean;
    time: number; //the total amount of time passed since the first frame event in seconds
}

interface bezierParams { P1x:number, P1y:number, P2x:number, P2y:number }

interface IKeyFrame {
    from: number;
    duration: number;
    easingParams: bezierParams;
}

interface IKeyFrameController {
    progress: number; // 0 to 1
    playState: PlaybackState;
    timer: IFrameEvent;
    cycling: boolean;
    fadeLoop: boolean;
    nbLoop: number; // 0 = infinit 
}

class KeyFrameControllerComponent implements IKeyFrameController, IKeyFrame, IComponent {
    public nbLoop: number = 1;
    public progress: number = 0;
    public playState: PlaybackState = PlaybackState.stopped;
    public timer: IFrameEvent = {'count':0, 'delta':0, 'loopCount':0, 'reverse': false, 'time':0};
    public cycling: boolean = false;
    public fadeLoop: boolean = false;
    constructor(public entityId, public active, public from:number, public duration:number,public easingParams:bezierParams = {P1x:0.0, P1y:0.0, P2x:1.0, P2y:1.0}) {
    }
}
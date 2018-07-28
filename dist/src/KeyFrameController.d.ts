import { interfaces } from "ecs-framework";
export { PlaybackState, IAnimationFrameEvent, IBezierParams, IKeyFrame, IKeyFrameController, KeyFrameControllerComponent };
declare enum PlaybackState {
    "started" = 0,
    "playing" = 1,
    "ended" = 2,
    "stopped" = 3,
    "paused" = 4
}
interface IAnimationFrameEvent {
    count: number;
    delta: number;
    loopCount: number;
    reverse: boolean;
    time: number;
}
interface IBezierParams {
    P1x: number;
    P1y: number;
    P2x: number;
    P2y: number;
}
interface IKeyFrame {
    from: number;
    duration: number;
    easingParams: IBezierParams;
}
interface IKeyFrameController {
    progress: number;
    playState: PlaybackState;
    timer: IAnimationFrameEvent;
    cycling: boolean;
    fadeLoop: boolean;
    nbLoop: number;
}
declare class KeyFrameControllerComponent implements IKeyFrameController, IKeyFrame, interfaces.IComponent {
    entityId: any;
    active: any;
    from: number;
    duration: number;
    easingParams: IBezierParams;
    nbLoop: number;
    progress: number;
    playState: PlaybackState;
    timer: IAnimationFrameEvent;
    cycling: boolean;
    fadeLoop: boolean;
    constructor(entityId: any, active: any, from: number, duration: number, easingParams?: IBezierParams);
}

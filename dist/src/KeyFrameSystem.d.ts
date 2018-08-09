import { interfaces, System } from "ecs-framework";
import { IAnimationFrameEvent, IBezierParams, PlaybackState } from "./KeyFrameController";
export { KeyFrameSystem, IKeyFrameParams };
interface IKeyFrameParams {
    nbLoop: number;
    previousProgress: number;
    progress: number;
    playState: PlaybackState;
    timer: IAnimationFrameEvent;
    cycling: boolean;
    fadeLoop: boolean;
    from: number;
    duration: number;
    easingParams: IBezierParams;
}
declare class KeyFrameSystem extends System<IKeyFrameParams> {
    protected _defaultParameter: IKeyFrameParams;
    constructor();
    execute(params: IKeyFrameParams, timeRef: interfaces.IFrameEvent): void;
    protected changeDirection(params: IKeyFrameParams, timeRef: interfaces.IFrameEvent): void;
}

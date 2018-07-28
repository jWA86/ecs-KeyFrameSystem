import { interfaces, System } from "ecs-framework";
import { IAnimationFrameEvent, IBezierParams, PlaybackState } from "./KeyFrameController";
export { KeyFrameSystem, IKeyFrameParams };
interface IKeyFrameParams {
    n: {
        nbLoop: number;
    };
    pr: {
        progress: number;
    };
    pl: {
        playState: PlaybackState;
    };
    t: {
        timer: IAnimationFrameEvent;
    };
    c: {
        cycling: boolean;
    };
    f: {
        fadeLoop: boolean;
    };
    fr: {
        from: number;
    };
    d: {
        duration: number;
    };
    e: {
        easingParams: IBezierParams;
    };
}
declare class KeyFrameSystem extends System<IKeyFrameParams> {
    protected static changeDirection(params: IKeyFrameParams, timeRef: interfaces.IFrameEvent): void;
    constructor(params: IKeyFrameParams);
    execute(params: IKeyFrameParams, timeRef: interfaces.IFrameEvent): void;
}

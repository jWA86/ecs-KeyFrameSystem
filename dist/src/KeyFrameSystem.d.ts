import { IFrameEvent, System } from "ecs-framework";
import { KeyFrameControllerComponent } from "./KeyFrameController";
export { KeyFrameSystem };
declare class KeyFrameSystem extends System {
    protected static changeDirection(c: KeyFrameControllerComponent, timeRef: IFrameEvent): void;
    constructor();
    execute(c: KeyFrameControllerComponent, timeRef: IFrameEvent): void;
}

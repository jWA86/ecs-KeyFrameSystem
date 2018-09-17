import { System, interfaces } from "ecs-framework";
import { IParentTimeline } from "./TimeLine";

class FrameEventToTimelineSystem extends System<IParentTimeline> {
    constructor(params: IParentTimeline) {
        super(params);
    }
    public process(frameEvent: interfaces.IFrameEvent) {
        
    }
}

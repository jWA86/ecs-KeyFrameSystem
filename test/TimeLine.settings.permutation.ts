// import "mocha";
// import { FillMode, ITimelineSettings, PlaybackDirection } from "../src/IAnimationClip";

// // startTime : 0, beforeCurrentTime, betweenPreviousAndCurrentTime, afterCurrentTime
// // startDelay: < 0, 0, > 0
// // iterationStart: 0, < activeDuration, > activeDuration
// // endDelay: < 0, 0, > 0
// // duration: 0, 1, <ParentTimelineDuration, >ParentTimeLineDuration
// // playDirection: "normal", "reverse", "alternate", "alternate-reverse"
// // iterations: 0, 1, +infinit
// // easing: "linear", [0.420, 0, 0.580, 1]
// // fill: "none", "forwards", "backwards", "both"

// class TimeLineSettingComponent implements ITimelineSettings {
//     public entityId = 0;
//     public active = true;
//     public startTime = 0;
//     public startDelay = 0;
//     public iterationStart = 0;
//     public endDelay = 0;
//     public duration = 0;
//     public playDirection = PlaybackDirection.normal;
//     public repeat = Math.pow(10, 1000); // -1 === will
//     public easing = { P1x: 0.0, P1y: 0.0, P2x: 1.0, P2y: 1.0 };
//     public fill = FillMode.both;
//     constructor() { }
// }

// const parentTimeLineDuration = 100;
// const parentTimeLineCurrentTime = 50;
// const parentTimeLineDelta = 20;
// // val
// const durationValues = [0, 1, 25, parentTimeLineDuration + 25];
// const startTimeValues = [0, parentTimeLineCurrentTime - parentTimeLineDelta - 26, parentTimeLineCurrentTime - parentTimeLineDelta + 5, parentTimeLineCurrentTime + 25];
// const startDelayValues = [-10, 0, 10];
// const iterationStartValues = [0, 15, 30];
// const endDelayValues = [-10, 0, 10];
// const playDirectionValues = [PlaybackDirection.normal, PlaybackDirection.reverse, PlaybackDirection.alternate, PlaybackDirection.alternateReverse];
// const iterationsValues = [0, 1, Math.pow(10, 1000)];
// const easingValues = [{ P1x: 0.0, P1y: 0.0, P2x: 1.0, P2y: 1.0 }, { P1x: 0.420, P1y: 0.0, P2x: 0.580, P2y: 1.0 }];
// const fillValues = [FillMode.none, FillMode.forwards, FillMode.backwards, FillMode.both];

// // const allCases: TimeLineSettingComponent[];

// const values = [durationValues, startTimeValues, startDelayValues, iterationStartValues, endDelayValues, playDirectionValues, iterationsValues, easingValues, fillValues];

// const allPossibleCase = (arr: any[]) => {
//     if (arr.length === 1) {
//         return arr[0];
//     } else {
//         const result = [];
//         const allCaseOfRest = allPossibleCase(arr.slice(1));
//         /*tslint:disable:prefer-for-of */
//         for (let i = 0; i < allCaseOfRest.length; ++i) {
//             for (let j = 0; j < arr[0].length; ++j) {
//                 result.push([arr[0][j]].concat(allCaseOfRest[i]));
//             }
//         }
//         return result;
//     }
// };

// describe.only("allCase", () => {
//     const allCase = allPossibleCase(values);
//     // console.log(allCase);
//     console.log(allCase.length);
//     console.log(JSON.stringify(allCase[0]));
//     const allObject: TimeLineSettingComponent[];
//     allCase.map((c) => {
//         const t = new TimeLineSettingComponent();
//         t.duration = c[0];
//         t.startTime = c[1];
//         t.startDelay = c[2];
//         t.iterationStart = c[3];
//         t.endDelay = c[4];
//         t.playDirection = c[5];
//         t.repeat = c[6];
//         t.easing = c[7];
//         t.fill = c[8];

//         allObject.push(t);
//     });
//     console.log(allObject[0]);
// });

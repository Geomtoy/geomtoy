// import Geomtoy from "@geomtoy/core";
// import { View, ViewElement, CanvasRenderer } from "@geomtoy/view";
// import color from "../../assets/color";
// // import { mathFont, hoverStyle, activeStyle, interactableStyles } from "../../assets/common";
// import tpl from "../../assets/templates/simple-canvas-renderer";

// const canvas = tpl.getCanvas();
// tpl.setDescription(`
// <strong>Interactables</strong>
// <ul>
//     <li>Points: styled as <span class="style-indicator" style="border-color:${interactableStyles.point[0].stroke};background-color:${interactableStyles.point[0].fill}"></span></li>
// </ul>
// <strong>Description</strong>
// <ol>
//     <li>Point P is constrained on line AB.</li>
//     <li>Move point P to determine the distance between it and point A. The distance will be kept until you move point P.</li>
//     <li>Point A and point B determine line AB.</li>
//     <li>Point A, point B and point P will follow line AB to move.</li>
//     <li>Move line AB or circle O to get the intersection points of them.</li>
// </ol>
// `);
// const g = new Geomtoy();

// const canvasRenderer = new CanvasRenderer(canvas, g);
// canvasRenderer.display.density = 10;
// canvasRenderer.display.zoom = 0.5;
// canvasRenderer.display.yAxisPositiveOnBottom = false;
// canvasRenderer.display.xAxisPositiveOnRight = false;

// const view = new View(g, { hoverForemost: false }, canvasRenderer);
// view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
// view.startInteractive();

// const main = () => {
//     const pA = g.Point(2, 4);
//     const pB = g.Point(6, 12);
//     const pC = g.Point(5, 10);

//     const qb = g.QuadraticBezier().bind(
//         [
//             [pA, "any"],
//             [pB, "any"],
//             [pC, "any"]
//         ],
//         function ([e1, e2, e3]) {
//             this.copyFrom(g.QuadraticBezier(e1.target, e2.target, e3.target));
//         }
//     );

//     const controlLineSegments = g.Group().bind([[qb, "any"]], function ([e]) {
//         const cpc = e.target.controlPointCoordinates;
//         const c1 = e.target.point1Coordinates;
//         const c2 = e.target.point2Coordinates;
//         this.items = [g.LineSegment(c1, cpc), g.LineSegment(c2, cpc)];
//     });

//     const pP = g.Point()
//         .data("time", 0.2)
//         .bind([[qb, "any"]], function ([e]) {
//             const time = this.data("time") as number;
//             if (e.target.isValid()) this.copyFrom(e.target.getPointAtTime(time));
//         })
//         .on(
//             "any",
//             function () {
//                 if (qb.isValid()) {
//                     const pointClosest = qb.getClosestPointFrom(pP);
//                     this.copyFrom(pointClosest);
//                     console.log(qb.getTimeOfPointExtend(pointClosest))
//                     this.data("time", qb.getTimeOfPoint(pointClosest));
//                 }
//             },
//             { priority: 1001 }
//         );

//     // const l = g.Line().bind([[pP, "any"]], function ([e]) {
//     //     const time = e.target.data("time") as number;
//     //     console.log(time)
//     //     if (qb.isValid()) this.copyFrom(qb.getTangentLineAtTime(time));
//     // });

//     const vt = g.Vector().bind([[pP, "any"]], function ([e]) {
//         const time = e.target.data("time") as number;
//         if (qb.isValid()) this.copyFrom(qb.getTangentUnitVectorAtTime(time).scalarMultiply(20));
//     });
//     // const vn = g.Vector().bind([[pP, "any"]], function ([e]) {
//     //     const time = e.target.data("time") as number;
//     //     if (qb.isValid()) this.copyFrom(qb.getNormalUnitVectorAtTime(time).scalarMultiply(20));
//     // });
//     // const circle = g.Circle().bind([[pP, "any"]], function ([e]) {
//     //     const time = e.target.data("time") as number;
//     //     if (qb.isValid()) this.copyFrom(qb.getOsculatingCircleAtTime(time));
//     // });

//     view.add(new ViewElement(pP, true, ...interactableStyles.point))
//         .add(new ViewElement(pA, true, ...interactableStyles.point))
//         .add(new ViewElement(pB, true, ...interactableStyles.point))
//         .add(new ViewElement(pC, true, ...interactableStyles.point))

//         .add(new ViewElement(qb, false, { stroke: color("red"), strokeWidth: 2 }))
//         .add(new ViewElement(controlLineSegments, false, { stroke: color("gray"), strokeWidth: 2, strokeDash: [4, 4] }))
//         // .add(new ViewElement(l, false, { stroke: color("gray"), strokeWidth: 2 }))
//         // .add(new ViewElement(circle, false, { stroke: color("orange"), strokeWidth: 2 }))
//         .add(new ViewElement(vt, false, { stroke: color("purple"), strokeWidth: 2 }))
//     // .add(new ViewElement(vn, false, { stroke: color("blue"), strokeWidth: 2 }));
// };
// main();

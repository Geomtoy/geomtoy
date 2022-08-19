// import Geomtoy, { Bezier, LineSegment } from "@geomtoy/core";
// import { View, ViewElement, CanvasRenderer } from "@geomtoy/view";
// import color from "../assets/color";
// // import { mathFont, hoverStyle, activeStyle, interactableStyles } from "../assets/common";
// import tpl from "../assets/templates/simple-canvas-renderer";

// import type { EventObject, Text, Point } from "@geomtoy/core";

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

// const g = new Geomtoy({
//     graphics: {
//         pointSize: 6,
//         arrow: {
//             width: 9,
//             length: 20,
//             foldback: 0,
//             noFoldback: true
//         }
//     }
// });

// const canvasRenderer = new CanvasRenderer(canvas, g);
// canvasRenderer.display.density = 10;
// canvasRenderer.display.zoom = 1;
// canvasRenderer.display.yAxisPositiveOnBottom = false;
// canvasRenderer.display.xAxisPositiveOnRight = false;

// const view = new View(g, { hoverForemost: false }, canvasRenderer);
// view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
// view.startInteractive();

// const main = () => {
//     const pA = g.Point(-80, 8);
//     const pB = g.Point(58, 29);
//     const pC = g.Point(220, -8);

//     const qb = g.QuadraticBezier().bind(
//         [
//             [pA, "any"],
//             [pB, "any"],
//             [pC, "any"]
//         ],
//         function ([e1, e2, e3]) {
//             this.copyFrom(g.QuadraticBezier.fromThreePointsAndTime(e1.target, e2.target, e3.target, 0.5));
//         }
//     );
//     const pD = g.Point().bind([[qb, "any"]], function ([e]) {
//         this.copyFrom(e.target.controlPoint);
//     });
//     const group = g.Group().bind([[qb, "any"]], function ([e]) {
//         this.items = [g.LineSegment(e.target.point1Coordinates, e.target.controlPointCoordinates), g.LineSegment(e.target.point2Coordinates, e.target.controlPointCoordinates)];
//     });

//     view.add(new ViewElement(pA, true, ...interactableStyles.point))
//         .add(new ViewElement(pB, true, ...interactableStyles.point))
//         .add(new ViewElement(pC, true, ...interactableStyles.point))
//         .add(new ViewElement(pD, false, { fill: color("gray") }))
//         .add(new ViewElement(qb, false, { stroke: color("red") }))
//         .add(new ViewElement(group, false, { stroke: color("gray"), strokeDash: [4, 4] }));
// };
// main();

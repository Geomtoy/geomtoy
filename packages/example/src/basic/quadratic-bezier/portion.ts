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
//     const pA = g.Point(200, 80);
//     const pB = g.Point(50, 80);
//     const pC = g.Point(0, 20);

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

//     const g = g.Group().bind([[qb, "any"]], function ([e]) {
//         this.items = [qb.portionOfExtend(2,0.2)]
//     });

//     view.add(new ViewElement(pA, true, ...interactableStyles.point))
//         .add(new ViewElement(pB, true, ...interactableStyles.point))
//         .add(new ViewElement(pC, true, ...interactableStyles.point))

//         .add(new ViewElement(qb, false, { stroke: color("red"), strokeWidth: 2 }))
//         .add(new ViewElement(controlLineSegments, false, { stroke: color("gray"), strokeWidth: 2, strokeDash: [4, 4] }))
//         .add(new ViewElement(g, false, { stroke: color("purple"), strokeWidth: 6 }));
// };
// main();

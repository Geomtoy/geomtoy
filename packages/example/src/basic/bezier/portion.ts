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
//     const pC = g.Point(100, 80);
//     const pD = g.Point(50, 80);

//     const b = g.Bezier().bind(
//         [
//             [pA, "any"],
//             [pB, "any"],
//             [pC, "any"],
//             [pD, "any"],
//         ],
//         function ([e1, e2, e3,e4]) {
//             this.copyFrom(g.Bezier(e1.target, e2.target, e3.target,e4.target));
//         }
//     );
//     const controlLineSegments = g.Group().bind([[b, "any"]], function ([e]) {
//         const c1 = e.target.point1Coordinates;
//         const c2 = e.target.point2Coordinates;
//         const cpc1 = e.target.controlPoint1Coordinates;
//         const cpc2 = e.target.controlPoint2Coordinates;
//         this.items = [g.LineSegment(c1, cpc1), g.LineSegment(cpc1, cpc2),g.LineSegment(cpc2,c2)];
//     });

//     const g = g.Group().bind([[b, "any"]], function ([e]) {
//         const bc = b.portionOfExtend(-0.2,1.2)
//         this.items = [bc]
//         console.log(b.getPolynomial(),b.getImplicitFunctionCoefs())
//     });

//     view.add(new ViewElement(pA, true, ...interactableStyles.point))
//         .add(new ViewElement(pB, true, ...interactableStyles.point))
//         .add(new ViewElement(pC, true, ...interactableStyles.point))
//         .add(new ViewElement(pD, true, ...interactableStyles.point))

//         .add(new ViewElement(b, false, { stroke: color("red"), strokeWidth: 2 }))
//         .add(new ViewElement(controlLineSegments, false, { stroke: color("gray"), strokeWidth: 2, strokeDash: [4, 4] }))
//         // .add(new ViewElement(g, false, { stroke: color("green"), strokeWidth: 1 }));
// };
// main();

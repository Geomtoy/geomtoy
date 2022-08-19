// import Geomtoy, { Ellipse } from "@geomtoy/core";
// import { View, ViewElement, CanvasRenderer } from "@geomtoy/view";
// import color from "../../assets/color";
// // import { mathFont, interactableStyles } from "../../assets/common";
// import tpl from "../../assets/templates/simple-canvas-renderer";

// import type { EventObject, Text, Point } from "@geomtoy/core";

// const canvas = tpl.getCanvas();
// tpl.setDescription(``);

// const g = new Geomtoy();

// const canvasRenderer = new CanvasRenderer(canvas, g);
// canvasRenderer.display.density = 10;
// canvasRenderer.display.zoom = 1;
// canvasRenderer.display.yAxisPositiveOnBottom = false;
// canvasRenderer.display.xAxisPositiveOnRight = false;

// const view = new View(g, { hoverForemost: false }, canvasRenderer);
// view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
// view.startInteractive();

// const main = () => {
//     const pointA = g.Point(-25, 30);
//     const pointB = g.Point(20, 20);
//     const pointC = g.Point(50, 60);
//     const pointD = g.Point(80, 100);
//     const pointE = g.Point(10, 60);
//     const pointF = g.Point(-10, 80);
//     const pointG = g.Point(160, 80);

//     const ellipse1 = g.Ellipse().bind(
//         [
//             [pointA, "any"],
//             [pointB, "any"],
//             [pointC, "any"]
//         ],
//         function (this: Ellipse, [e1, e2, e3]: [EventObject<Point>, EventObject<Point>, EventObject<Point>]) {
//             this.copyFrom(g.Ellipse.fromCenterPointAndTwoConjugateDiametersEndPoints(e1.target, e2.target, e3.target));
//         }
//     );
//     console.log(ellipse1.radiusX, ellipse1.radiusY, ellipse1.getLength());

//     const ellipse2 = new Ellipse(g).bind(
//         [
//             [pointD, "any"],
//             [pointE, "any"]
//         ],
//         function (this: Ellipse, [e1, e2]: [EventObject<Point>, EventObject<Point>]) {
//             this.copyFrom(Ellipse.fromTwoFociAndDistanceSum(g, e1.target, e2.target, 100));
//         }
//     );
//     console.log(ellipse2.getLength());
//     const ellipse3 = new Ellipse(g).bind(
//         [
//             [pointF, "any"],
//             [pointG, "any"]
//         ],
//         function (this: Ellipse, [e1, e2]: [EventObject<Point>, EventObject<Point>]) {
//             this.copyFrom(Ellipse.fromTwoFociAndEccentricity(g, e1.target, e2.target, 0.5));
//         }
//     );
//     console.log(ellipse3.getLength());

//     view.add(new ViewElement(pointA, true, ...interactableStyles.point))
//         .add(new ViewElement(pointB, true, ...interactableStyles.point))
//         .add(new ViewElement(pointC, true, ...interactableStyles.point))
//         .add(new ViewElement(pointD, true, ...interactableStyles.point))
//         .add(new ViewElement(pointE, true, ...interactableStyles.point))
//         .add(new ViewElement(pointF, true, ...interactableStyles.point))
//         .add(new ViewElement(pointG, true, ...interactableStyles.point))
//         .add(new ViewElement(ellipse1, false, { stroke: color("red"), strokeWidth: 2 }))
//         .add(new ViewElement(ellipse2, false, { stroke: color("purple"), strokeWidth: 2 }))
//         .add(new ViewElement(ellipse3, false, { stroke: color("teal"), strokeWidth: 2 }));
// };
// main();

// import { Maths } from "@geomtoy/util";
// import Geomtoy, { Ellipse } from "@geomtoy/core";
// import { View, ViewElement, CanvasRenderer } from "@geomtoy/view";
// import color from "../../assets/color";
// // import { mathFont, interactableStyles } from "../../assets/common";
// import tpl from "../../assets/templates/simple-canvas-renderer";

// import type { EventObject, Text, Point } from "@geomtoy/core";

// const canvas = tpl.getCanvas();
// tpl.setDescription(``);

// const g = new Geomtoy();

// const view = new View(g, { hoverForemost: false }, new CanvasRenderer(canvas, g, {}, { density: 10, yAxisPositiveOnBottom: false }));
// view.defaultStyle = { strokeLineCap: "round" };
// view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
// view.startInteractive();

// {
//     const pointA = g.Point(0, 3);
//     const pointB = g.Point(10, 10);
//     const pointC = g.Point(20, 10);

//     const ellipse = g.Ellipse().bind(
//         [
//             [pointA, "any"],
//             [pointB, "any"],
//             [pointC, "any"]
//         ],
//         function (this: Ellipse, [e1, e2, e3]: [EventObject<Point>, EventObject<Point>, EventObject<Point>]) {
//             this.copyFrom(g.Ellipse.fromCenterPointAndTwoConjugateDiametersEndPoints(e1.target, e2.target, e3.target));
//             console.log(this)
//         }
//     );
//     const vectorT = g.Vector().bind([[ellipse, "any"]], function ([e]) {
//         this.copyFrom(ellipse.getTangentUnitVectorAtAngle(Maths.PI/4).scalarMultiply(20));
//     });
//     const vectorN = g.Vector().bind([[ellipse, "any"]], function ([e]) {
//         this.copyFrom(ellipse.getNormalUnitVectorAtAngle(Maths.PI/4).scalarMultiply(20));
//     });
//     const circle = g.Circle().bind([[ellipse, "any"]], function ([e]) {
//         this.copyFrom(ellipse.getOsculatingCircleAtAngle(Maths.PI/4));
//     });

//     view.add(new ViewElement(pointA, true, ...interactableStyles.point))
//         .add(new ViewElement(pointB, true, ...interactableStyles.point))
//         .add(new ViewElement(pointC, true, ...interactableStyles.point))
//         .add(new ViewElement(vectorT, false, { stroke: color("teal"), strokeWidth: 4 }))
//         .add(new ViewElement(vectorN, false, { stroke: color("orange"), strokeWidth: 4 }))
//         .add(new ViewElement(circle, false, { stroke: color("purple"), strokeWidth: 4 }))
//         .add(new ViewElement(ellipse, false, { stroke: color("red"), strokeWidth: 4 }));
// }

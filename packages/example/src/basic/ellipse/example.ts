// import Geomtoy, { type EventObject, type Text, Point, type Arc, Ellipse } from "@geomtoy/core";
// import { Maths, Polynomial, Utility } from "@geomtoy/util";
// import { View, ViewElement, CanvasRenderer, SvgRenderer } from "@geomtoy/view";
// import color from "../../assets/color";
// // import { mathFont, hoverStyle, activeStyle, interactableStyles } from "../../assets/common";
// import tpl from "../../assets/templates/multiple-canvas-renderer";
// import { Pane } from "tweakpane";

// tpl.title("Ellipse radiusX and radiusY explanation");
// const g = new Geomtoy();

// tpl.addSection(`Ellipse radiusX and radiusY explanation`);
// {
//     const card = tpl.addCard({
//         canvasId: Utility.uuid(),
//         aspectRatio: "3:1",
//         className: "col-12",
//         withPane: true
//     });

//     const view = new View(g, {}, new CanvasRenderer(card.canvas, g, {}, { density: 10, zoom: 1, yAxisPositiveOnBottom: false }));
//     view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
//     view.startInteractive();
//     const centerPoint = g.Point(0, 0);

//     const dynamic = g.Dynamic();
//     const restParams = dynamic.create({
//         radiusX: 10,
//         radiusY: 20,
//         on :"1"
//     });

//     console.log(restParams.toArray())
//     const ellipse = g.Ellipse().bind(
//         [
//             [centerPoint, "any"],
//             [restParams, "any"]
//         ],
//         function ([e1, e2]) {
//             const { radiusX, radiusY } = e2.target;
//             this.copyFrom(g.Ellipse(e1.target, radiusX, radiusY));
//         }
//     );
//     const circle1 = g.Circle().bind(
//         [
//             [centerPoint, "any"],
//             [restParams, "radiusX"]
//         ],
//         function ([e1, e2]) {
//             const { radiusX } = e2.target;
//             this.copyFrom(g.Circle(e1.target, radiusX));
//         }
//     );

//     restParams.on("radiusX",function(){
//         console.log(this)
//     })

//     const circle2 = g.Circle().bind(
//         [
//             [centerPoint, "any"],
//             [restParams, "radiusY"]
//         ],
//         function ([e1, e2]) {
//             const { radiusY } = e2.target;
//             this.copyFrom(g.Circle(e1.target, radiusY));
//         }
//     );

//     // #region Pane
//     const pane = new Pane({ title: "Arc", container: card.pane! });
//     const restParamsFolder = pane.addFolder({ title: "Rest parameters" });
//     restParamsFolder.addInput(restParams, "radiusX", { min: Number.EPSILON });
//     restParamsFolder.addInput(restParams, "radiusY", { min: Number.EPSILON });
//     // #endregion

//     view.add(new ViewElement(centerPoint, true, true, interactableStyles.point))
//         .add(new ViewElement(circle1, false, true, { style: { stroke: color("red"), strokeWidth: 4 } }))
//         .add(new ViewElement(circle2, false, true, { style: { stroke: color("blue"), strokeWidth: 4 } }))
//         .add(new ViewElement(ellipse, false, true, { style: { stroke: color("purple"), strokeWidth: 4 } }));
// }

// import Geomtoy, { Arc, Transformation, Point, Arbitrary } from "@geomtoy/core";
// import { Maths, Utility } from "@geomtoy/util";
// import { View, ViewElement, ViewGroupElement, CanvasRenderer } from "@geomtoy/view";

// import color from "../assets/color";
// import tpl from "../assets/templates/multiple-canvas-renderer";
// tpl.title("Transformation");

// const redStrokeStyle = { stroke: color("red", 0.75), strokeWidth: 4, noFill: true };
// const blueStrokeStyle = { stroke: color("blue", 0.75), strokeWidth: 4, noFill: true };
// const purpleStrokeStyle = { stroke: color("purple", 0.75), strokeWidth: 4, noFill: true };
// const purpleFillStyle = { fill: color("purple", 0.75), noStroke: true };

// const g = new Geomtoy();

// tpl.addSection("Separate");
// {
//     const card = tpl.addCard({ title: "separate-on same curve", canvasId: Utility.uuid() });
//     const view = new View(g, {}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 1, yAxisPositiveOnBottom: false }));
//     view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
//     view.startInteractive();
//     const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc(g, [0, 0], 10, 5, (3 * Maths.PI) / 4, -Maths.PI / 6, true, 0);
//     const t = new Transformation(g);
//     t.addTranslate(20, 20);
//     t.addScale(1, -0.5);
//     t.addRotate(Maths.PI / 3);

//     const p = Point.origin(g);

//     // const tArc1 = new Arbitrary(g).bind(
//     //     [
//     //         [arc1, "any"],
//     //         [t, "any"]
//     //     ],
//     //     function () {
//     //         this.copyFrom(arc1.apply(t));
//     //     }
//     // );

//     const tArc1 = arc1.apply(t);

//     tArc1.on("any", function () {
//         console.log(this);
//     });

//     const pp = new Point(g).bind(
//         [
//             [p, "any"],
//             [tArc1, "any"]
//         ],
//         function () {
//             // if (tArc1.is(Arc)) {
//                 this.copyFrom(tArc1.getClosestPointFrom(p));
//             // }
//         }
//     );

//     view.add(
//         //
//         new ViewElement(arc1, {
//             interactable: true,
//             autoUpdateView: true,
//             style: redStrokeStyle
//         })
//     )
//         .add(
//             new ViewElement(tArc1, {
//                 interactable: true,
//                 autoUpdateView: true,
//                 style: blueStrokeStyle
//             })
//         )
//         .add(
//             new ViewElement(pp, {
//                 interactable: false,
//                 autoUpdateView: true,
//                 style: blueStrokeStyle
//             })
//         );
//     // view.add(new ViewElement(arc2, false, true, { style: blueStrokeStyle }));
// }

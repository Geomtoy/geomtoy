// import Geomtoy, { Bezier, LineSegment, Ellipse, Transformation, ShapeArray, Line, Point, Arbitrary, Dynamic, QuadraticBezier, Arc, EndpointIntersection  } from "@geomtoy/core";
// import { Maths, Utility } from "@geomtoy/util";
// import { View, ViewElement, CanvasRenderer, ViewGroupElement, Style } from "@geomtoy/view";

// import color from "../assets/color";
// // import { interactableStyles } from "../assets/common";
// import tpl from "../assets/templates/multiple-canvas-renderer";

// tpl.title("Endpoint Intersection");

// const g = new Geomtoy();
// const redStrokeStyle = { stroke: color("red", 0.75), noFill: true, strokeWidth: 2 };
// const blueStrokeStyle = { stroke: color("blue", 0.75), noFill: true, strokeWidth: 2 };
// const greenStrokeStyle = { stroke: color("green", 0.75), noFill: true, strokeWidth: 2 };
// const orangeStrokeStyle = { stroke: color("orange", 0.75), noFill: true, strokeWidth: 2 };

// function randomPoint() {
//     return Point.random(g, [-100, -100, 200, 200]) as Point;
// }

// function lineSegmentElement(lineSegment: LineSegment, style: Partial<Style>, view: View) {
//     const p1 = lineSegment.point1;
//     const p2 = lineSegment.point2;
//     lineSegment.bind(
//         [
//             [p1, "any"],
//             [p2, "any"]
//         ],
//         function ([e1, e2]) {
//             this.copyFrom(new LineSegment(g, e1.target, e2.target));
//         }
//     );
//     const bundle = {
//         p1: new ViewElement(p1, { interactable: true, ...interactableStyles.point }),
//         p2: new ViewElement(p2, { interactable: true, ...interactableStyles.point }),
//         segment: new ViewElement(lineSegment, { interactable: true, style })
//     };
//     return {
//         bundle,
//         addToView(){
//             view.add(bundle.p1)
//             view.add(bundle.p2)
//             view.add(bundle.segment)
//         },
//         removeFromView(){
//             view.remove(bundle.p1)
//             view.remove(bundle.p2)
//             view.remove(bundle.segment)
//         }
//     }
// }
// function quadraticBezierElement(quadraticBezier: QuadraticBezier, style:Partial<Style>,view:View){
//     const p1 = quadraticBezier.point1;
//     const p2 = quadraticBezier.point2;
//     const cp = quadraticBezier.controlPoint
//     quadraticBezier.bind(
//         [
//             [p1, "any"],
//             [p2, "any"],
//             [cp,"any"]
//         ],
//         function ([e1, e2,e3]) {
//             this.copyFrom(new QuadraticBezier(g, e1.target, e2.target,e3.target));
//         }
//     );
//     const bundle = {
//         p1: new ViewElement(p1, { interactable: true, ...interactableStyles.point }),
//         p2: new ViewElement(p2, { interactable: true, ...interactableStyles.point }),
//         cp: new ViewElement(cp, { interactable: true, ...interactableStyles.point }),
//         segment: new ViewElement(quadraticBezier, { interactable: true, style })
//     };
//     return {
//         bundle,
//         addToView(){
//             view.add(bundle.p1)
//             view.add(bundle.p2)
//             view.add(bundle.cp)
//             view.add(bundle.segment)
//         },
//         removeFromView(){
//             view.remove(bundle.p1)
//             view.remove(bundle.p2)
//             view.remove(bundle.cp)
//             view.remove(bundle.segment)
//         }
//     }
// }

// function bezierElement(bezier: Bezier, style:Partial<Style>,view:View){
//     const p1 = bezier.point1;
//     const p2 = bezier.point2;
//     const cp1 = bezier.controlPoint1
//     const cp2 = bezier.controlPoint2

//     bezier.bind(
//         [
//             [p1, "any"],
//             [p2, "any"],
//             [cp1,"any"],
//             [cp2,"any"],
//         ],
//         function ([e1, e2,e3,e4]) {
//             this.copyFrom(new Bezier(g, e1.target, e2.target,e3.target ,e4.target));
//         }
//     );
//     const bundle = {
//         p1: new ViewElement(p1, { interactable: true, ...interactableStyles.point, ...{style: {fill: style.stroke  }} }),
//         p2: new ViewElement(p2, { interactable: true, ...interactableStyles.point,...{style: {fill: style.stroke  }} }),
//         cp1: new ViewElement(cp1, { interactable: true, ...interactableStyles.point,...{style: {fill: style.stroke  }} }),
//         cp2: new ViewElement(cp2, { interactable: true, ...interactableStyles.point ,...{style: {fill: style.stroke  }} }),
//         segment: new ViewElement(bezier, { interactable: false, style })
//     };
//     return {
//         bundle,
//         addToView(){
//             view.add(bundle.p1)
//             view.add(bundle.p2)
//             view.add(bundle.cp1)
//             view.add(bundle.cp2)
//             view.add(bundle.segment)
//         },
//         removeFromView(){
//             view.remove(bundle.p1)
//             view.remove(bundle.p2)
//             view.remove(bundle.cp1)
//             view.remove(bundle.cp2)
//             view.remove(bundle.segment)
//         }
//     }
// }

// {
//     tpl.addSection("Endpoint Intersection");
//     {
//         const card = tpl.addCard({
//             canvasId: Utility.uuid(),
//             className: "col-12",
//             withPane: true
//         });

//         const view = new View(g, {}, new CanvasRenderer(card.canvas, {}, { density: 1, zoom: 2, yAxisPositiveOnBottom: false }));
//         view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
//         view.startInteractive();

//         //@ts-ignore
//         // const pane = new Tweakpane.Pane({ title: "Construction-2", container: card.pane });

//         // const segmentsType = {
//         //     Bezier: "Bezier",
//         //     QuadraticBezier: "QuadraticBezier",
//         //     LineSegment: "LineSegment",
//         //     Arc: "Arc"
//         // };

//         const interPoint = new Point(g, 0, 0);
//         const aInSegment = new Bezier(g, randomPoint(), interPoint, randomPoint(), randomPoint());;
//         const aOutSegment = new Bezier(g, interPoint, randomPoint(), randomPoint(), randomPoint())
//         const bInSegment = new Bezier(g, randomPoint(), interPoint, randomPoint(), randomPoint());;
//         const bOutSegment = new Bezier(g, interPoint, randomPoint(), randomPoint(), randomPoint());

//         bezierElement(aInSegment, redStrokeStyle,view).addToView()
//         bezierElement(aOutSegment, blueStrokeStyle,view).addToView()
//         bezierElement(bInSegment, greenStrokeStyle,view).addToView()
//         bezierElement(bOutSegment, orangeStrokeStyle,view).addToView()

//         const testEndpointIntersection = function(){
//             const ei = new EndpointIntersection(g,interPoint,
//             aInSegment,
//             aOutSegment,
//             bInSegment,
//             bOutSegment).determine()
//             card.setDescription(ei)
//         }
//         aInSegment.on("any",testEndpointIntersection)
//         aOutSegment.on("any",testEndpointIntersection)
//         bInSegment.on("any",testEndpointIntersection)
//         bOutSegment.on("any",testEndpointIntersection)

//         // const param = new Dynamic(g, {
//         //     aIn: "LineSegment",
//         //     aOut: "LineSegment",
//         //     bIn: "LineSegment",
//         //     bOut: "LineSegment"
//         // }).on("any", function (e) {
//         //     if (e.event === "aIn") {
//         //         if (this.aIn === "LineSegment") aInSegment.geometry = new LineSegment(g, randomPoint(), interPoint);
//         //         if (this.aIn === "QuadraticBezier") aInSegment.geometry = new QuadraticBezier(g, randomPoint(), interPoint, randomPoint());
//         //         if (this.aIn === "Bezier") aInSegment.geometry = new Bezier(g, randomPoint(), interPoint, randomPoint(), randomPoint());
//         //         if (this.aIn === "Arc") aInSegment.geometry = new Arc(g, randomPoint(), interPoint, 50, 100, true, true);
//         //         lineSegmentElement()
//         //     }
//         //     if (e.event === "aOut") {
//         //         if (this.aOut === "LineSegment") aOutSegment.geometry = new LineSegment(g, interPoint, randomPoint());
//         //         if (this.aOut === "QuadraticBezier") aOutSegment.geometry = new QuadraticBezier(g, interPoint, randomPoint(), randomPoint());
//         //         if (this.aOut === "Bezier") aOutSegment.geometry = new Bezier(g, interPoint, randomPoint(), randomPoint(), randomPoint());
//         //         if (this.aOut === "Arc") aOutSegment.geometry = new Arc(g, interPoint, randomPoint(), 50, 100, true, true);
//         //     }
//         //     if (e.event === "bIn") {
//         //         if (this.bIn === "LineSegment") bInSegment.geometry = new LineSegment(g, randomPoint(), interPoint);
//         //         if (this.bIn === "QuadraticBezier") bInSegment.geometry = new QuadraticBezier(g, randomPoint(), interPoint, randomPoint());
//         //         if (this.bIn === "Bezier") bInSegment.geometry =
//         //         if (this.bIn === "Arc") bInSegment.geometry = new Arc(g, randomPoint(), interPoint, 50, 100, true, true);
//         //     }
//         //     if (e.event === "bOut") {
//         //         if (this.bOut === "LineSegment") bOutSegment.geometry = new LineSegment(g, interPoint, randomPoint());
//         //         if (this.bOut === "QuadraticBezier") bOutSegment.geometry = new QuadraticBezier(g, interPoint, randomPoint(), randomPoint());
//         //         if (this.bOut === "Bezier") bOutSegment.geometry = new Bezier(g, interPoint, randomPoint(), randomPoint(), randomPoint());
//         //         if (this.bOut === "Arc") bOutSegment.geometry = new Arc(g, interPoint, randomPoint(), 50, 100, true, true);
//         //     }
//         // });

//         // pane.addInput(param, "aIn", {
//         //     options: segmentsType
//         // });
//         // pane.addInput(param, "aOut", {
//         //     options: segmentsType
//         // });
//         // pane.addInput(param, "bIn", {
//         //     options: segmentsType
//         // });
//         // pane.addInput(param, "bOut", {
//         //     options: segmentsType
//         // });

//         // view.add(new ViewElement(segment1, { interactable: false, style: redStrokeStyle }));
//         // view.add(new ViewElement(segment2, { interactable: false, style: blueStrokeStyle }));
//         // view.add(new ViewElement(segment3, { interactable: false, style: greenStrokeStyle }));
//         // view.add(new ViewElement(segment4, { interactable: false, style: orangeStrokeStyle }));
//         // card.setDescription("Result: " + result.toString());
//     }
// }

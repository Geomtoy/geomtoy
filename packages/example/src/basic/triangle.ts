// import Geomtoy from "@geomtoy/core";
// import { View, ViewElement, CanvasRenderer, SvgRenderer } from "@geomtoy/view";
// import color from "../assets/color";
// // import { mathFont, hoverStyle, activeStyle } from "../assets/common";
// import tpl from "../assets/templates/full-dual-renderer";

// import type { EventObject, Text, Point, Triangle } from "@geomtoy/core";

// const [canvas, svg] = tpl.initRenderer();
// tpl.setDescription(`
//     <strong>Touchables</strong>
//     <ul>
//         <li>Points: A, B, P</li>
//         <li>Lines: AB</li>
//         <li>Circles: O</li>
//     </ul>
//     <strong>Description</strong>
//     <ol>
//         <li>Point P is constrained on line AB.</li>
//         <li>Move point P to determine the distance between it and point A. The distance will be kept until you move point P.</li>
//         <li>Point A and point B determine line AB.</li>
//         <li>Point A, point B and point P will follow line AB to move.</li>
//         <li>Move line AB or circle O to get the intersection points of them.</li>
//     </ol>
// `);

// const g = new Geomtoy({
//     graphics: {
//         pointSize: 6,
//         arrow: {
//             width: 5,
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

// const svgRenderer = new SvgRenderer(svg, g);
// svgRenderer.display.density = 10;
// svgRenderer.display.zoom = 1;
// // svgRenderer.display.yAxisPositiveOnBottom = false;
// // svgRenderer.display.xAxisPositiveOnRight = false;

// const view = new View(g, { hoverForemost: false });
// tpl.switchRenderer({ canvas: canvasRenderer, svg: svgRenderer }, "canvas", renderer => {
//     view.use(renderer, (width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
// });
// const main = () => {
//     const pointA = g.Point(-25, -12);
//     const pointB = g.Point(35, 25);
//     const pointC = g.Point(35, -16);

//     const offsetLabel = function (this: Text, [e]: [EventObject<Point>]) {
//         this.point = e.target.move(2, 2);
//     };

//     const labelA = g.Text("A", mathFont).bind([[pointA, "any"]], offsetLabel);
//     const labelB = g.Text("B", mathFont).bind([[pointB, "any"]], offsetLabel);
//     const labelC = g.Text("C", mathFont).bind([[pointC, "any"]], offsetLabel);

//     const vector = g.Vector().bind([[pointA, "any"]], function ([e]) {
//         this.point1 = e.target;
//     });
//     const triangle = g.Triangle().bind(
//         [
//             [pointA, "any"],
//             [pointB, "any"],
//             [pointC, "any"]
//         ],
//         function ([e1, e2, e3]) {
//             this.copyFrom(g.Triangle(e1.target, e2.target, e3.target));
//         }
//     );

//     const line = g.Line().bind(
//         [
//             [pointA, "any"],
//             [pointB, "any"]
//         ],
//         function ([e1, e2]) {
//             this.copyFrom(g.Line.fromTwoPoints(e1.target, e2.target));
//         }
//     );

//     const pointP = g.Point().bind([[line, "any"]], function ([e]) {
//         this.copyFrom(e.target.isValid() ? e.target.getPointWhereXEqualTo(5) : null);
//     });

//     const triangleBind = [triangle, "any"] as [Triangle, string];

//     const medianSegments = g.Group([g.LineSegment(), g.LineSegment(), g.LineSegment()]).bind([triangleBind], function ([e]) {
//         const [a, b, c] = e.target.isValid() ? e.target.getMedianLineSegments() : [null,null,null];
//         this.items[0].copyFrom(a);
//         this.items[1].copyFrom(b);
//         this.items[2].copyFrom(c);
//     });
//     // const angleBisectingSegments = g.Group([g.LineSegment(), g.LineSegment(), g.LineSegment()]).bind([triangleBind], function ([e]) {
//     //     if (triangle.isValid()) {
//     //         const [a, b, c] = e.target.getAngleBisectingLineSegments();
//     //         this.items[0].copyFrom(a);
//     //         this.items[1].copyFrom(b);
//     //         this.items[2].copyFrom(c);
//     //     }
//     // });
//     // const altitudeLines = g.Group([g.Line(), g.Line(), g.Line()]).bind([triangleBind], function ([e]) {
//     //     if (triangle.isValid()) {
//     //         const [a, b, c] = e.target.getAltitudeLineSegments().map(s => s.toLine());
//     //         this.items[0].copyFrom(a);
//     //         this.items[1].copyFrom(b);
//     //         this.items[2].copyFrom(c);
//     //     }
//     // });

//     const incenterPoint = g.Point().bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             this.copyFrom(e.target.getIncenterPoint());
//         }
//     });
//     const inscribedCircle = g.Circle().bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             this.copyFrom(e.target.getInscribedCircle());
//         }
//     });

//     const centroidPoint = g.Point().bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             this.copyFrom(e.target.getCentroidPoint());
//         }
//     });
//     const orthocenterPoint = g.Point().bind([triangleBind], function ([e]) {
//         e.target.isValid() && this.copyFrom(e.target.getOrthocenterPoint());
//     });

//     const antimedialTriangle = g.Triangle().bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             this.copyFrom(e.target.getAntimedialTriangle());
//         }
//     });

//     const orthicTriangle = g.Triangle().bind([triangleBind], function ([e]) {
//         if (e.target.isValid()) {
//             this.copyFrom(e.target.getOrthicTriangle());
//         }
//     });

//     const polarCircle = g.Circle().bind([triangleBind], function ([e]) {
//         if (e.target.isValid()) {
//             this.copyFrom(e.target.getPolarCircle());
//         }
//     });

//     const perpendicularlyBisectingLines = g.Group([g.Line(), g.Line(), g.Line()]).bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             const [a, b, c] = e.target.getPerpendicularlyBisectingLineSegments().map(s => s.toLine());
//             this.items[0].copyFrom(a);
//             this.items[1].copyFrom(b);
//             this.items[2].copyFrom(c);
//         }
//     });
//     const circumcenterPoint = g.Point().bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             this.copyFrom(e.target.getCircumcenterPoint());
//         }
//     });

//     const circumscribedCircle = g.Circle().bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             this.copyFrom(e.target.getCircumscribedCircle());
//         }
//     });

//     const escenterPoints = g.Group([g.Point(), g.Point(), g.Point()]).bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             const [a, b, c] = e.target.getEscenterPoints();
//             this.items[0].copyFrom(a);
//             this.items[1].copyFrom(b);
//             this.items[2].copyFrom(c);
//         }
//     });
//     const escribedCircles = g.Group([g.Circle(), g.Circle(), g.Circle()]).bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             const [a, b, c] = e.target.getEscribedCircles();
//             this.items[0].copyFrom(a);
//             this.items[1].copyFrom(b);
//             this.items[2].copyFrom(c);
//         }
//     });

//     const symmedianSegments = g.Group([g.LineSegment(), g.LineSegment(), g.LineSegment()]).bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             const [a, b, c] = e.target.getSymmedianLineSegments();
//             this.items[0].copyFrom(a);
//             this.items[1].copyFrom(b);
//             this.items[2].copyFrom(c);
//         }
//     });

//     const lemoinePoint = g.Point().bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             this.copyFrom(e.target.getLemoinePoint());
//         }
//     });

//     const eulerLine = g.Line().bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             this.copyFrom(e.target.getEulerLine());
//         }
//     });

//     const ninePointCenterPoint = g.Point().bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             this.copyFrom(e.target.getNinePointCenterPoint());
//         }
//     });

//     const ninePointCircle = g.Circle().bind([triangleBind], function ([e]) {
//         if (triangle.isValid()) {
//             this.copyFrom(e.target.getNinePointCircle());
//         }
//     });

//     view.add(new ViewElement(g.Point.zero(), false, { fill: color("black") }, hoverStyle, activeStyle))
//         .add(new ViewElement(pointA, true, { fill: color("black") }, hoverStyle, activeStyle))
//         .add(new ViewElement(labelA, false, { fill: color("black") }, hoverStyle, activeStyle))
//         .add(new ViewElement(pointB, true, { fill: color("black") }, hoverStyle, activeStyle))
//         .add(new ViewElement(labelB, false, { fill: color("black") }, hoverStyle, activeStyle))
//         .add(new ViewElement(pointC, true, { fill: color("black") }, hoverStyle, activeStyle))
//         .add(new ViewElement(labelC, false, { fill: color("black") }, hoverStyle, activeStyle))
//         .add(new ViewElement(triangle, false, { stroke: color("black") }, hoverStyle, activeStyle))
//         .add(new ViewElement(vector, true, { fill: color("black") }, hoverStyle, activeStyle))

//         .add(new ViewElement(centroidPoint, false, { stroke: color("amber"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(medianSegments, false, { stroke: color("amber"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(incenterPoint, false, { stroke: color("blue"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(inscribedCircle, false, { stroke: color("blue"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(orthocenterPoint, false, { stroke: color("purple"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(antimedialTriangle, false, { stroke: color("green"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(orthicTriangle, false, { stroke: color("yellow"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(polarCircle, false, { stroke: color("purple"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(perpendicularlyBisectingLines, false, { stroke: color("teal"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(circumcenterPoint, false, { stroke: color("cyan"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(circumscribedCircle, false, { stroke: color("cyan"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(escenterPoints, false, { stroke: color("red"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(escribedCircles, false, { stroke: color("red"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(symmedianSegments, false, { stroke: color("indigo"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(lemoinePoint, false, { stroke: color("indigo"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(eulerLine, false, { stroke: color("black"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(ninePointCenterPoint, false, { stroke: color("lime"), strokeWidth: 3 }, hoverStyle, activeStyle))
//         .add(new ViewElement(ninePointCircle, false, { stroke: color("lime"), strokeWidth: 3 }, hoverStyle, activeStyle));

//     view.foremost(pointA.uuid);
//     view.foremost(labelA.uuid);
//     view.foremost(pointB.uuid);
//     view.foremost(labelB.uuid);
//     view.foremost(pointC.uuid);
//     view.foremost(labelC.uuid);
// };
// main();

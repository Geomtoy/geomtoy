// import Geomtoy, { BooleanOperation, Line, Path, QuadraticBezier, Rectangle } from "@geomtoy/core";
// import { Box, Maths, Utility } from "@geomtoy/util";
// import { CanvasRenderer, View, ViewElement, ViewGroupElement } from "@geomtoy/view";
// import { stroke, strokeFill, lightStroke, thinStroke } from "../assets/common";
// import tpl from "../assets/templates/multiple-canvas-renderer";
// import { randomPathCommand, strokeFillByIndex } from "../boolean-operation/_common";

// tpl.title("Path, boundingBoxes and lines");

// const g = new Geomtoy();
// {
//     const path = new Path(
//         g,
//         Utility.range(0, 10).map(_ => randomPathCommand(g)),
//         true
//     )!;

//     const card = tpl.addCard({ title: "original", canvasId: Utility.uuid(), className: "col-12" });
//     const view = new View(g, {}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 0.2, yAxisPositiveOnBottom: false }));

//     view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
//     view.startInteractive();

//     view.add(new ViewElement(path, { interactable: false, ...strokeFill("red") }));

//     const boundingBoxes = path.getSegments().map(segment => {
//         return new Rectangle(g, ...segment.getBoundingBox());
//     });
//     const epsilon = g.options().epsilon;
//     let lines: Line[] = [];
//     let xArray: number[] = [];

//     path.getSegments().forEach(segment => {
//         xArray.push(segment.point1X, segment.point2X);
//         const box = segment.getBoundingBox();
//         xArray.push(Box.minX(box));
//         xArray.push(Box.maxX(box));
//     });
//     xArray = Utility.uniqWith(xArray, (a, b) => Maths.equalTo(a, b, epsilon));

//     lines = xArray.map(x => {
//         return new Line(g, x, 0, Infinity);
//     });

//     view.add(new ViewGroupElement(boundingBoxes, { interactable: false, ...thinStroke("teal") }));
//     view.add(new ViewGroupElement(lines, { interactable: false, ...thinStroke("black") }));
// }

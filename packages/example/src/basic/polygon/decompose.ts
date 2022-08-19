// import Geomtoy, { Bezier, BooleanOperation, Point, Polygon } from "@geomtoy/core";
// import { Utility } from "@geomtoy/util";
// import { CanvasRenderer, View, ViewElement } from "@geomtoy/view";
// import tpl from "../../assets/templates/multiple-canvas-renderer";

// tpl.title("Polygon-polygon boolean operation");

// const g = new Geomtoy();

// {
//     tpl.addSection("Union");
//     const polygon = new Polygon(
//         g,
//         Utility.range(0, 10).map(_ => Polygon.vertex(Point.random(g, [-100, -100, 200, 200])))
//     )!;

//     const card1 = tpl.addCard({ title: "original", canvasId: Utility.uuid(), className: "col-6" });
//     const view1 = new View(g, {}, new CanvasRenderer(card1.canvas, {}, { density: 10, zoom: 0.2, yAxisPositiveOnBottom: false }));

//     const card2 = tpl.addCard({ title: "decompose", canvasId: Utility.uuid(), className: "col-6" });
//     const view2 = new View(g, {}, new CanvasRenderer(card2.canvas, {}, { density: 10, zoom: 0.2, yAxisPositiveOnBottom: false }));

//     view1.startResponsive((width, height) => (view1.renderer.display.origin = [width / 2, height / 2]));
//     view1.startInteractive();

//     view2.startResponsive((width, height) => (view2.renderer.display.origin = [width / 2, height / 2]));
//     view2.startInteractive();

//     view1.add(new ViewElement(polygon, { interactable: false, autoUpdateView: true, style: redStyle }));

//     // polygon.decompose().forEach((item, index) => {
//     //     view2.add(new ViewElement(item, { interactable: false, autoUpdateView: true, style: styles(index) }), true);
//     // });
// }

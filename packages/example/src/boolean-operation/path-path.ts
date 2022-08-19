import { BooleanOperation, Path } from "@geomtoy/core";
import { Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewElement } from "@geomtoy/view";
import { strokeFill } from "../assets/common";
import tpl from "../assets/templates/multiple-canvas-renderer";
import { randomPathCommand } from "./_common";

tpl.title("Path-path boolean operation");

const bo = new BooleanOperation();

const path1 = new Path(
    Utility.range(0, 10).map(_ => randomPathCommand()),
    true
);
const path2 = new Path(
    Utility.range(0, 10).map(_ => randomPathCommand()),
    true
);

const desc1 = bo.describe(path1);
const desc2 = bo.describe(path2);
console.log(desc1);
console.log(desc2);
const combined = bo.combine(desc1, desc2);

// console.log(combined)
{
    tpl.addSection("Union");
    const compound = bo.chain(bo.selectUnion(combined));

    const card1 = tpl.addCard({ title: "original", canvasId: Utility.uuid(), className: "col-6" });
    const view1 = new View({}, new CanvasRenderer(card1.canvas, {}, { density: 10, zoom: 0.18, yAxisPositiveOnBottom: false }));

    const card2 = tpl.addCard({ title: "boolean", canvasId: Utility.uuid(), className: "col-6" });
    const view2 = new View({}, new CanvasRenderer(card2.canvas, {}, { density: 10, zoom: 0.18, yAxisPositiveOnBottom: false }));

    view1.startResponsive((width, height) => (view1.renderer.display.origin = [width / 2, height / 2]));
    view1.startInteractive();

    view2.startResponsive((width, height) => (view2.renderer.display.origin = [width / 2, height / 2]));
    view2.startInteractive();

    view1.add(new ViewElement(path1, { interactable: false, ...strokeFill("red") }));
    // view1.add(new ViewElement(path2, { interactable: false, autoUpdateView: true, style: blueStyle }));
    desc1.annotators.forEach(sfa => {
        view2.add(new ViewElement(sfa.segment.point1, { interactable: false, autoUpdateView: true, style: { noFill: true, stroke: "red" } }));
        view2.add(new ViewElement(sfa.segment.point2, { interactable: false, autoUpdateView: true, style: { noFill: true, stroke: "blue" } }));
        view2.add(new ViewElement(sfa.segment, { interactable: false, autoUpdateView: true, style: { noFill: true, stroke: "purple" } }));
    });
    // desc2.annotators.forEach(sfa=>{
    //     view2.add(new ViewElement(sfa.segment, {interactable: false, autoUpdateView: true, style: {noFill:true, stroke:"blue"}} ))
    // })

    // view2.add(new ViewElement(compound, { interactable: false, autoUpdateView: true, style: purpleStyle }));
}

// {
//     tpl.addSection("Intersection");
//     const compound = bo.chain(bo.selectIntersection(combined));

//     const card1 = tpl.addCard({ title: "original", canvasId: Utility.uuid(), className: "col-6" });
//     const view1 = new View({}, new CanvasRenderer(card1.canvas, {}, { density: 10, zoom: 0.18, yAxisPositiveOnBottom: false }));

//     const card2 = tpl.addCard({ title: "boolean", canvasId: Utility.uuid(), className: "col-6" });
//     const view2 = new View({}, new CanvasRenderer(card2.canvas, {}, { density: 10, zoom: 0.18, yAxisPositiveOnBottom: false }));

//     view1.startResponsive((width, height) => (view1.renderer.display.origin = [width / 2, height / 2]));
//     view1.startInteractive();

//     view2.startResponsive((width, height) => (view2.renderer.display.origin = [width / 2, height / 2]));
//     view2.startInteractive();

//     view1.add(new ViewElement(path1, { interactable: false, autoUpdateView: true, style: redStyle }));
//     view1.add(new ViewElement(path2, { interactable: false, autoUpdateView: true, style: blueStyle }));
//     view2.add(new ViewElement(compound, { interactable: false, autoUpdateView: true, style: purpleStyle }));
// }

// {
//     tpl.addSection("Difference");
//     const compound = bo.chain(bo.selectDifference(combined));

//     const card1 = tpl.addCard({ title: "original", canvasId: Utility.uuid(), className: "col-6" });
//     const view1 = new View({}, new CanvasRenderer(card1.canvas, {}, { density: 10, zoom: 0.18, yAxisPositiveOnBottom: false }));

//     const card2 = tpl.addCard({ title: "boolean", canvasId: Utility.uuid(), className: "col-6" });
//     const view2 = new View({}, new CanvasRenderer(card2.canvas, {}, { density: 10, zoom: 0.18, yAxisPositiveOnBottom: false }));

//     view1.startResponsive((width, height) => (view1.renderer.display.origin = [width / 2, height / 2]));
//     view1.startInteractive();

//     view2.startResponsive((width, height) => (view2.renderer.display.origin = [width / 2, height / 2]));
//     view2.startInteractive();

//     view1.add(new ViewElement(path1, { interactable: false, autoUpdateView: true, style: redStyle }));
//     view1.add(new ViewElement(path2, { interactable: false, autoUpdateView: true, style: blueStyle }));
//     view2.add(new ViewElement(compound, { interactable: false, autoUpdateView: true, style: purpleStyle }));
// }

// {
//     tpl.addSection("DifferenceRev");
//     const compound = bo.chain(bo.selectDifferenceRev(combined));

//     const card1 = tpl.addCard({ title: "original", canvasId: Utility.uuid(), className: "col-6" });
//     const view1 = new View({}, new CanvasRenderer(card1.canvas, {}, { density: 10, zoom: 0.18, yAxisPositiveOnBottom: false }));

//     const card2 = tpl.addCard({ title: "boolean", canvasId: Utility.uuid(), className: "col-6" });
//     const view2 = new View({}, new CanvasRenderer(card2.canvas, {}, { density: 10, zoom: 0.18, yAxisPositiveOnBottom: false }));

//     view1.startResponsive((width, height) => (view1.renderer.display.origin = [width / 2, height / 2]));
//     view1.startInteractive();

//     view2.startResponsive((width, height) => (view2.renderer.display.origin = [width / 2, height / 2]));
//     view2.startInteractive();

//     view1.add(new ViewElement(path1, { interactable: false, autoUpdateView: true, style: redStyle }));
//     view1.add(new ViewElement(path2, { interactable: false, autoUpdateView: true, style: blueStyle }));
//     view2.add(new ViewElement(compound, { interactable: false, autoUpdateView: true, style: purpleStyle }));
// }

// {
//     tpl.addSection("Exclusion");
//     const compound = bo.chain(bo.selectExclusion(combined));

//     const card1 = tpl.addCard({ title: "original", canvasId: Utility.uuid(), className: "col-6" });
//     const view1 = new View({}, new CanvasRenderer(card1.canvas, {}, { density: 10, zoom: 0.18, yAxisPositiveOnBottom: false }));

//     const card2 = tpl.addCard({ title: "boolean", canvasId: Utility.uuid(), className: "col-6" });
//     const view2 = new View({}, new CanvasRenderer(card2.canvas, {}, { density: 10, zoom: 0.18, yAxisPositiveOnBottom: false }));

//     view1.startResponsive((width, height) => (view1.renderer.display.origin = [width / 2, height / 2]));
//     view1.startInteractive();

//     view2.startResponsive((width, height) => (view2.renderer.display.origin = [width / 2, height / 2]));
//     view2.startInteractive();

//     view1.add(new ViewElement(path1, { interactable: false, autoUpdateView: true, style: redStyle }));
//     view1.add(new ViewElement(path2, { interactable: false, autoUpdateView: true, style: blueStyle }));
//     view2.add(new ViewElement(compound, { interactable: false, autoUpdateView: true, style: purpleStyle }));
// }

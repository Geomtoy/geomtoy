import { Arc, Dynamic, Point } from "@geomtoy/core";
import { Maths, Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewElement } from "@geomtoy/view";
import { codeHtml, lightStrokeFill, stroke } from "../../assets/common";
import tpl from "../../assets/templates/multiple-canvas-renderer";

tpl.title("Arc construction");

tpl.addSection(`Construction-1: constructor`);
{
    const card = tpl.addCard({ canvasId: Utility.uuid(), aspectRatio: "2:1", className: "col-12", withPane: true });
    card.setTitle("This is the way SVG describe an arc.");
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 1, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    const point1 = new Point(0, 0);
    const point2 = new Point(10, 1);
    const restParams = new Dynamic({
        radiusX: 10,
        radiusY: 20,
        largeArc: true,
        positive: true,
        rotation: 0
    });

    const arc = new Arc().bind(
        [
            [point1, "any"],
            [point2, "any"],
            [restParams, "any"]
        ],
        function ([e1, e2, e3]) {
            const { radiusX, radiusY, largeArc, positive, rotation } = e3.target;
            this.copyFrom(new Arc(e1.target, e2.target, radiusX, radiusY, largeArc, positive, rotation));
        }
    );

    card.setDescription(
        codeHtml(`
    const point1 = new Point(0, 0);
    const point2 = new Point(10, 1);
    const restParams = new Dynamic({
        radiusX: 10,
        radiusY: 20,
        largeArc: true,
        positive: true,
        rotation: 0
    });

    const arc = new Arc().bind(
        [
            [point1, "any"],
            [point2, "any"],
            [restParams, "any"]
        ],
        function ([e1, e2, e3]) {
            const { radiusX, radiusY, largeArc, positive, rotation } = e3.target;
            this.copyFrom(new Arc(e1.target, e2.target, radiusX, radiusY, largeArc, positive, rotation));
        }
    );
    `)
    );

    // `Arc` may correct its own radiusX and radiusY by itself.
    restParams.bind(
        [[arc, "radiusX|radiusY"]],
        function ([e]) {
            restParams.radiusX = e.target.radiusX;
            restParams.radiusY = e.target.radiusY;
        },
        { hasRecursiveEffect: true }
    );

    // #region Pane
    // @ts-ignore
    const pane = new Tweakpane.Pane({ title: "Construction-1", container: card.pane });
    const p1Input = pane.addInput({ point1 }, "point1", { y: { inverted: true } });
    const p2Input = pane.addInput({ point2 }, "point2", { y: { inverted: true } });
    point1.on("any", () => p1Input.refresh());
    point2.on("any", () => p2Input.refresh());
    const rxInput = pane.addInput(restParams, "radiusX", { min: Number.EPSILON });
    restParams.on("radiusX", () => rxInput.refresh());
    const ryInput = pane.addInput(restParams, "radiusY", { min: Number.EPSILON });
    restParams.on("radiusY", () => ryInput.refresh());
    pane.addInput(restParams, "largeArc");
    pane.addInput(restParams, "positive");
    pane.addInput(restParams, "rotation", { min: 0, max: 2 * Math.PI });
    // #endregion

    view.add(new ViewElement(point1, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(point2, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(arc, { interactable: false, ...stroke("brown") }));
}

tpl.addSection(`Construction-2: fromCenterPointAndStartEndAnglesEtc`);
{
    const card = tpl.addCard({ canvasId: Utility.uuid(), aspectRatio: "2:1", className: "col-12", withPane: true });
    card.setTitle("This is the way Canvas describe an arc.");
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 1, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();

    const centerPoint = new Point(0, 0);
    const restParams = new Dynamic({
        radiusX: 20,
        radiusY: 10,
        startAngle: Maths.PI / 4,
        endAngle: (5 * Maths.PI) / 4,
        positive: true,
        rotation: 0
    });

    const arc = new Arc().bind(
        [
            [centerPoint, "any"],
            [restParams, "any"]
        ],
        function ([e1, e2]) {
            const { radiusX, radiusY, startAngle, endAngle, positive, rotation } = e2.target;
            this.copyFrom(Arc.fromCenterPointAndStartEndAnglesEtc(e1.target, radiusX, radiusY, startAngle, endAngle, positive, rotation));
        }
    );

    card.setDescription(
        codeHtml(`
    const centerPoint = new Point(0, 0);
    const restParams = new Dynamic({
        radiusX: 20,
        radiusY: 10,
        startAngle: Maths.PI / 4,
        endAngle: (5 * Maths.PI) / 4,
        positive: true,
        rotation: 0
    });

    const arc = new Arc().bind(
        [
            [centerPoint, "any"],
            [restParams, "any"]
        ],
        function ([e1, e2]) {
            const { radiusX, radiusY, startAngle, endAngle, positive, rotation } = e2.target;
            this.copyFrom(Arc.fromCenterPointAndStartEndAnglesEtc(e1.target, radiusX, radiusY, startAngle, endAngle, positive, rotation));
        }
    );
    `)
    );

    // #region Pane
    // @ts-ignore
    const pane = new Tweakpane.Pane({ title: "Construction-2", container: card.pane });
    const cpInput = pane.addInput({ centerPoint }, "centerPoint", { y: { inverted: true } });
    centerPoint.on("any", () => cpInput.refresh());
    pane.addInput(restParams, "radiusX", { min: Number.EPSILON });
    pane.addInput(restParams, "radiusY", { min: Number.EPSILON });
    pane.addInput(restParams, "startAngle", { format: (v: number) => v.toFixed(2) });
    pane.addInput(restParams, "endAngle", { format: (v: number) => v.toFixed(2) });
    pane.addInput(restParams, "positive");
    pane.addInput(restParams, "rotation", { min: 0, max: 2 * Math.PI });
    // #endregion

    view.add(new ViewElement(centerPoint, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(arc, { interactable: false, ...stroke("brown") }));
}

tpl.addSection(`Construction-3: fromThreePointsCircular`);
{
    const card = tpl.addCard({ canvasId: Utility.uuid(), aspectRatio: "2:1", className: "col-12", withPane: true });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 1, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();

    const point1 = new Point([0, 10]);
    const point2 = new Point([10, 5]);
    const radiusControlPoint = new Point([10, 0]);

    const arc = new Arc().bind(
        [
            [point1, "any"],
            [point2, "any"],
            [radiusControlPoint, "any"]
        ],
        function ([e1, e2, e3]) {
            this.copyFrom(Arc.fromThreePointsCircular(e1.target, e2.target, e3.target));
        }
    );

    card.setDescription(
        codeHtml(` 
    const point1 = new Point([0, 10]);
    const point2 = new Point([10, 5]);
    const radiusControlPoint = new Point([10, 0]);

    const arc = new Arc().bind(
        [
            [point1, "any"],
            [point2, "any"],
            [radiusControlPoint, "any"]
        ],
        function ([e1, e2, e3]) {
            this.copyFrom(Arc.fromThreePointsCircular(e1.target, e2.target, e3.target));
        }
    );
    `)
    );

    view.add(new ViewElement(point1, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(point2, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(radiusControlPoint, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(arc, { interactable: false, ...stroke("brown") }));
}

import { Point, Dynamic, Arc, ShapeArray, Rectangle } from "@geomtoy/core";
import { Maths, Utility } from "@geomtoy/util";
import { View, ViewElement, CanvasRenderer, ViewGroupElement } from "@geomtoy/view";
import { codeHtml, stroke, lightStrokeFill } from "../../assets/common";
import tpl from "../../assets/templates/multiple-canvas-renderer";

tpl.title("Arc extrema and bounding box");

{
    const card = tpl.addCard({ canvasId: Utility.uuid(), className: "col-12", aspectRatio: "2:1", withPane: true });
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
    const extremePoints = new ShapeArray().bind([[arc, "any"]], function ([e]) {
        this.shapes = e.target.extrema().map(([p]) => {
            p.appearance = "plus"
            return p
        });
    });
    const boundingBoxRectangle = new Rectangle().bind([[arc, "any"]], function ([e]) {
        this.copyFrom(new Rectangle(...e.target.getBoundingBox()));
    });

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
    const extremePoints = new ShapeArray().bind([[arc, "any"]], function ([e]) {
        this.shapes = e.target.extrema().map(([p]) => {
            p.appearance = "plus"
            return p
        });
    });
    const boundingBoxRectangle = new Rectangle().bind([[arc, "any"]], function ([e]) {
        this.copyFrom(new Rectangle(...e.target.getBoundingBox()));
    });
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
    view.add(new ViewGroupElement(extremePoints.shapes, { interactable: false, ...stroke("green") }),true);
    view.add(new ViewElement(boundingBoxRectangle, { interactable: false, ...stroke("cyan") }));
}

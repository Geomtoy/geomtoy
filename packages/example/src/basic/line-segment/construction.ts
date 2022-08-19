import { Bezier, Dynamic, LineSegment, Point, ShapeArray } from "@geomtoy/core";
import { Maths, Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewElement, ViewGroupElement } from "@geomtoy/view";
import { codeHtml, lightStrokeFill, stroke, thinStroke } from "../../assets/common";
import tpl from "../../assets/templates/multiple-canvas-renderer";

tpl.title("Line segment construction");

tpl.addSection(`Construction-1: constructor`);
{
    const card = tpl.addCard({ canvasId: Utility.uuid(), aspectRatio: "2:1", className: "col-12" });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 0.5, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    const point1 = new Point([-20, 40]);
    const point2 = new Point([10, 20]);

    const lineSegment = new LineSegment().bind(
        [
            [point1, "any"],
            [point2, "any"]
        ],
        function ([e1, e2]) {
            this.copyFrom(new LineSegment(e1.target, e2.target));
        }
    );
    card.setDescription(
        codeHtml(`
    const point1 = new Point([-20, 40]);
    const point2 = new Point([10, 20]);
    
    const lineSegment = new LineSegment().bind(
        [
            [point1, "any"],
            [point2, "any"]
        ],
        function ([e1, e2]) {
            this.copyFrom(new LineSegment(e1.target, e2.target));
        }
    );
    `)
    );

    view.add(new ViewElement(point1, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(point2, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(lineSegment, { interactable: false, ...stroke("brown") }));
}

tpl.addSection(`Construction-2: fromPointAndAngleAndLength`);
{
    const card = tpl.addCard({ canvasId: Utility.uuid(), aspectRatio: "2:1", className: "col-12", withPane: true });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 0.1, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();

    const point = new Point(-80, -80);
    const restParams = new Dynamic({
        angle: 0,
        length: 100
    });
    const lineSegment = new LineSegment().bind(
        [
            [point, "any"],
            [restParams, "any"]
        ],
        function ([e1, e2]) {
            const { angle, length } = e2.target;
            const ls = LineSegment.fromPointAndAngleLength(e1.target, angle, length);
            if (ls !== null) this.copyFrom(ls);
        }
    );

    card.setDescription(
        codeHtml(`
    const point = new Point(-80, -80);
    const restParams = new Dynamic({
        angle: 0,
        length: 100
    });
    const lineSegment = new LineSegment().bind(
        [
            [point, "any"],
            [restParams, "any"]
        ],
        function ([e1, e2]) {
            const { angle, length } = e2.target;
            const ls = LineSegment.fromPointAndAngleLength(e1.target, angle, length);
            if (ls !== null) this.copyFrom(ls);
        }
    );
    `)
    );

    // #region Pane
    // @ts-ignore
    const pane = new Tweakpane.Pane({ title: "Construction-2", container: card.pane });
    const inputPoint = pane.addInput({ point }, "point", { y: { inverted: true } });
    point.on("any", () => inputPoint.refresh());

    pane.addInput(restParams, "angle", { min: 0, max: Maths.PI * 2 });
    pane.addInput(restParams, "length", { min: Number.EPSILON });
    // #endregion

    view.add(new ViewElement(point, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(lineSegment, { interactable: false, ...stroke("brown") }));
}

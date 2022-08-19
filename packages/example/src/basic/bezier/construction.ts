import { Bezier, Dynamic, LineSegment, Point, ShapeArray } from "@geomtoy/core";
import { Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewElement, ViewGroupElement } from "@geomtoy/view";
import { codeHtml, lightStrokeFill, stroke, thinStroke } from "../../assets/common";
import tpl from "../../assets/templates/multiple-canvas-renderer";

tpl.title("Bezier construction");

tpl.addSection(`Construction-1: constructor`);
{
    const card = tpl.addCard({ canvasId: Utility.uuid(), aspectRatio: "2:1", className: "col-12" });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 0.5, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    const point1 = new Point([-20, 40]);
    const point2 = new Point([10, 20]);
    const controlPoint1 = new Point([30, 70]);
    const controlPoint2 = new Point([40, 20]);
    const bezier = new Bezier().bind(
        [
            [point1, "any"],
            [point2, "any"],
            [controlPoint1, "any"],
            [controlPoint2, "any"]
        ],
        function ([e1, e2, e3, e4]) {
            this.copyFrom(new Bezier(e1.target, e2.target, e3.target, e4.target));
        }
    );
    card.setDescription(
        codeHtml(`
    const point1 = new Point([-20, 40]);
    const point2 = new Point([10, 20]);
    const controlPoint1 = new Point([30, 70]);
    const controlPoint2 = new Point([40, 20]);
    const bezier = new Bezier().bind(
        [
            [point1, "any"],
            [point2, "any"],
            [controlPoint1, "any"],
            [controlPoint2, "any"]
        ],
        function ([e1, e2, e3, e4]) {
            this.copyFrom(new Bezier(e1.target, e2.target, e3.target, e4.target));
        }
    );
    `)
    );

    const controlLineSegment1 = new LineSegment().bind(
        [
            [point1, "any"],
            [controlPoint1, "any"]
        ],
        function ([e1, e2]) {
            this.copyFrom(new LineSegment(e1.target, e2.target));
        }
    );
    const controlLineSegment2 = new LineSegment().bind(
        [
            [controlPoint1, "any"],
            [controlPoint2, "any"]
        ],
        function ([e1, e2]) {
            this.copyFrom(new LineSegment(e1.target, e2.target));
        }
    );
    const controlLineSegment3 = new LineSegment().bind(
        [
            [controlPoint2, "any"],
            [point2, "any"]
        ],
        function ([e1, e2]) {
            this.copyFrom(new LineSegment(e1.target, e2.target));
        }
    );

    view.add(new ViewElement(point1, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(point2, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(controlPoint1, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(controlPoint2, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(controlLineSegment1, { interactable: false, ...thinStroke("gray") }));
    view.add(new ViewElement(controlLineSegment2, { interactable: false, ...thinStroke("gray") }));
    view.add(new ViewElement(controlLineSegment3, { interactable: false, ...thinStroke("gray") }));
    view.add(new ViewElement(bezier, { interactable: false, ...stroke("brown") }));
}

tpl.addSection(`Construction-2: fromFourPointsAndTimes`);
{
    const card = tpl.addCard({ canvasId: Utility.uuid(), aspectRatio: "2:1", className: "col-12", withPane: true });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 0.1, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();

    const point1 = new Point(-80, -80);
    const point2 = new Point(-60, 30);
    const point3 = new Point(10, 10);
    const point4 = new Point(50, 60);
    const times = new Dynamic({
        time1: 1 / 3,
        time2: 2 / 3
    });

    const bezier = new Bezier().bind(
        [
            [point1, "any"],
            [point2, "any"],
            [point3, "any"],
            [point4, "any"],
            [times, "any"]
        ],
        function ([e1, e2, e3, e4, e5]) {
            const { time1, time2 } = e5.target;
            const b = Bezier.fromFourPointsAndTimes(e1.target, e2.target, e3.target, e4.target, [time1, time2]);
            if (b !== null) this.copyFrom(b);
        }
    );

    card.setDescription(
        codeHtml(`
    const point1 = new Point(-80, -80);
    const point2 = new Point(-60, 30);
    const point3 = new Point(10, 10);
    const point4 = new Point(50, 60);
    const times = new Dynamic({
        time1: 1 / 3,
        time2: 2 / 3
    });

    const bezier = new Bezier().bind(
        [
            [point1, "any"],
            [point2, "any"],
            [point3, "any"],
            [point4, "any"],
            [times, "any"]
        ],
        function ([e1, e2, e3, e4, e5]) {
            const { time1, time2 } = e5.target;
            const b = Bezier.fromFourPointsAndTimes(e1.target, e2.target, e3.target, e4.target, [time1, time2]);
            if (b.isValid()) this.copyFrom(b);
        }
    );
    `)
    );

    // #region Pane
    // @ts-ignore
    const pane = new Tweakpane.Pane({ title: "Construction-2", container: card.pane });
    const p1Input = pane.addInput({ point1 }, "point1", { y: { inverted: true } });
    const p2Input = pane.addInput({ point2 }, "point2", { y: { inverted: true } });
    const p3Input = pane.addInput({ point3 }, "point3", { y: { inverted: true } });
    const p4Input = pane.addInput({ point4 }, "point4", { y: { inverted: true } });
    point1.on("any", () => p1Input.refresh());
    point2.on("any", () => p2Input.refresh());
    point3.on("any", () => p3Input.refresh());
    point4.on("any", () => p4Input.refresh());

    pane.addInput(times, "time1", { min: Number.EPSILON, max: 1 - Number.EPSILON });
    pane.addInput(times, "time2", { min: Number.EPSILON, max: 1 - Number.EPSILON });

    // #endregion

    const shapeArray = new ShapeArray().bind([[bezier, "any"]], function ([e]) {
        this.shapes = [
            e.target.point1,
            e.target.point2,
            e.target.controlPoint1,
            e.target.controlPoint2,
            new LineSegment(e.target.point1, e.target.controlPoint1),
            new LineSegment(e.target.controlPoint1, e.target.controlPoint2),
            new LineSegment(e.target.controlPoint2, e.target.point2)
        ];
    });

    view.add(new ViewElement(point1, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(point2, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(point3, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewElement(point4, { interactable: true, ...lightStrokeFill("brown") }));
    view.add(new ViewGroupElement(shapeArray.shapes, { interactable: true, ...thinStroke("gray") }));
    view.add(new ViewElement(bezier, { interactable: false, ...stroke("brown") }));
}

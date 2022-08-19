import { Arbitrary, Circle, Dynamic, Geomtoy, Inversion, Line, Point, ShapeArray } from "@geomtoy/core";
import { Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewElement, ViewGroupElement } from "@geomtoy/view";
import { codeHtml, lightStroke, lightStrokeFill, stroke, strokeFill, thinStroke } from "../../assets/common";
import tpl from "../../assets/templates/multiple-canvas-renderer";

tpl.title("Inversion: inverse of circle");

{
    const card = tpl.addCard({ canvasId: Utility.uuid(), aspectRatio: "1:1", className: "col-12", withPane: true });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 1, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();

    const centerPoint1 = new Point(10, 0);
    const centerPoint2 = new Point(15, 0);

    const circle1 = new Circle().bind([[centerPoint1, "any"]], function ([e1]) {
        this.copyFrom(new Circle(e1.target, 10));
    });
    const circle2 = new Circle().bind([[centerPoint2, "any"]], function ([e1]) {
        this.copyFrom(new Circle(e1.target, 15));
    });

    const point = new Point(0, 0);
    // const inversion = new Inversion(point,2)

    // const invCircle1 = inversion.invertCircle(circle1) as Circle
    // const invCircle2 = inversion.invertCircle(circle2) as Circle

    // const lines = Circle.getCommonTangentLinesOfTwoCircles(invCircle1,invCircle2).map(v=>v[0])

    // const circles = lines.map(l=> inversion.invertLine(l))

    const circles = new ShapeArray().bind(
        [
            [circle1, "any"],
            [circle2, "any"],
            [point, "any"]
        ],
        function ([e1, e2, e3]) {
            this.shapes = Circle.getCommonTangentCirclesOfTwoCirclesThroughPoint(e1.target, e2.target, e3.target);
        }
    );

    // view.add(new ViewElement(centerPoint1, { interactable: true, ...lightStrokeFill("red") }));
    // view.add(new ViewElement(centerPoint2, { interactable: true, ...lightStrokeFill("blue") }));

    view.add(new ViewElement(circle1, { interactable: false, ...strokeFill("red") }));
    view.add(new ViewElement(circle2, { interactable: false, ...strokeFill("blue") }));
    // view.add(new ViewElement(invCircle1, { interactable: false, ...lightStroke("red") }));
    // view.add(new ViewElement(invCircle2, { interactable: false, ...lightStroke("blue") }));

    // view.add(new ViewElement(new Circle(inversion.centerCoordinates, inversion.power),{ interactable: true, ...lightStrokeFill("green") }))

    view.add(new ViewElement(point, { interactable: true, ...lightStrokeFill("teal") }), true);
    // view.add(new ViewGroupElement(lines, { interactable: false, ...lightStroke("gray") }));
    view.add(new ViewGroupElement(circles.shapes, { interactable: false, ...lightStroke("brown") }), true);

    // view.add(new ViewElement(line, { interactable: false, ...thinStroke("purple") }));
    // view.add(new ViewElement(invLine, { interactable: false, ...thinStroke("purple") }));
}

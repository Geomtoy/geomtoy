import { Circle, Point, ShapeArray } from "@geomtoy/core";
import { Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewElement, ViewGroupElement } from "@geomtoy/view";
import { codeHtml, lightStroke, lightStrokeFill, stroke } from "../../assets/common";
import tpl from "../../assets/templates/multiple-canvas-renderer";

tpl.title("Common tangent lines of two circles");

{
    const card = tpl.addCard({ canvasId: Utility.uuid(), aspectRatio: "2:1", className: "col-12" });
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 0.5, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    const centerPoint1 = new Point([-20, 40]);
    const radiusControlPoint1 = new Point([0, 0]);
    const centerPoint2 = new Point([10, 20]);
    const radiusControlPoint2 = new Point([10, 5]);

    const circle1 = new Circle().bind(
        [
            [centerPoint1, "any"],
            [radiusControlPoint1, "any"]
        ],
        function ([e1, e2]) {
            this.copyFrom(Circle.fromTwoPoints(e1.target, e2.target));
        }
    );
    const circle2 = new Circle().bind(
        [
            [centerPoint2, "any"],
            [radiusControlPoint2, "any"]
        ],
        function ([e1, e2]) {
            this.copyFrom(Circle.fromTwoPoints(e1.target, e2.target));
        }
    );

    const shapeArray = new ShapeArray().bind(
        [
            [circle1, "any"],
            [circle2, "any"]
        ],
        function ([e1, e2]) {
            const result = Circle.getCommonTangentLinesOfTwoCircles(e1.target, e2.target);
            this.shapes = result.map(data => data[0]);
        }
    );

    card.setDescription(
        codeHtml(` 
    const centerPoint1 = new Point([-20, 40]);
    const radiusControlPoint1 = new Point([0, 0]);
    const centerPoint2 = new Point([10, 20]);
    const radiusControlPoint2 = new Point([10, 5]);

    const circle1 = new Circle().bind(
        [
            [centerPoint1, "any"],
            [radiusControlPoint1, "any"]
        ],
        function ([e1, e2]) {
            this.copyFrom(Circle.fromTwoPoints(e1.target, e2.target));
        }
    );
    const circle2 = new Circle().bind(
        [
            [centerPoint2, "any"],
            [radiusControlPoint2, "any"]
        ],
        function ([e1, e2]) {
            this.copyFrom(Circle.fromTwoPoints(e1.target, e2.target));
        }
    );

    const shapeArray = new ShapeArray().bind(
        [
            [circle1, "any"],
            [circle2, "any"]
        ],
        function ([e1, e2]) {
            const result = Circle.getCommonTangentLinesOfTwoCircles(e1.target, e2.target);
            this.shapes = result.map(data=> data[0]);
        }
    );
    `)
    );

    view.add(new ViewElement(centerPoint1, { interactable: true, ...lightStrokeFill("red") }));
    view.add(new ViewElement(radiusControlPoint1, { interactable: true, ...lightStrokeFill("red") }));
    view.add(new ViewElement(centerPoint2, { interactable: true, ...lightStrokeFill("blue") }));
    view.add(new ViewElement(radiusControlPoint2, { interactable: true, ...lightStrokeFill("blue") }));
    view.add(new ViewElement(circle1, { interactable: false, ...stroke("red") }));
    view.add(new ViewElement(circle2, { interactable: false, ...stroke("blue") }));
    view.add(new ViewGroupElement(shapeArray.shapes, { interactable: false, ...lightStroke("orange") }), true);
}

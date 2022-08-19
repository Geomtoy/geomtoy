import { Bezier, Dynamic, Geomtoy, Point, QuadraticBezier, Relationship, ShapeArray, Trilean } from "@geomtoy/core";
import { Coordinates, Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewGroupElement } from "@geomtoy/view";
import color from "../../assets/color";
import { stroke, lightStroke, lightStrokeFill, lightStrokeFillTrans } from "../../assets/common";
import tpl from "../../assets/templates/multiple-canvas-renderer";
import { bezierViewBundle, quadraticBezierViewBundle, samePointsOffset } from "../_common";

tpl.title("Try quadratic bezier-bezier relationship");

const rs = new Relationship();

const quadraticBezierBundle = quadraticBezierViewBundle(stroke("red"), lightStrokeFill("red"), lightStrokeFillTrans("red"), lightStroke("gray"));
const bezierBundle = bezierViewBundle(stroke("blue"), lightStrokeFill("blue"), lightStrokeFillTrans("blue"), lightStroke("gray"));

const card = tpl.addCard({ canvasId: Utility.uuid(), className: "col-12", withIntroduction: true, withPane: true });
const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 1, yAxisPositiveOnBottom: false }));
view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
view.startInteractive();

view.addBatch(Object.values(quadraticBezierBundle));
view.addBatch(Object.values(bezierBundle));

// #region Pane
// @ts-ignore
const pane = new Tweakpane.Pane({ title: "Try", container: card.pane });
{
    const f1 = pane.addFolder({ title: "QuadraticBezier" });
    const p1Input = f1.addInput(quadraticBezierBundle.point1, "shape", { y: { inverted: true }, label: "point1" });
    const p2Input = f1.addInput(quadraticBezierBundle.point2, "shape", { y: { inverted: true }, label: "point2" });
    const cpInput = f1.addInput(quadraticBezierBundle.controlPoint, "shape", { y: { inverted: true }, label: "controlPoint" });
    quadraticBezierBundle.point1.shape.on("any", () => p1Input.refresh());
    quadraticBezierBundle.point2.shape.on("any", () => p2Input.refresh());
    quadraticBezierBundle.controlPoint.shape.on("any", () => cpInput.refresh());
}
{
    const f2 = pane.addFolder({ title: "Bezier" });
    const p1Input = f2.addInput(bezierBundle.point1, "shape", { y: { inverted: true }, label: "point1" });
    const p2Input = f2.addInput(bezierBundle.point2, "shape", { y: { inverted: true }, label: "point2" });
    const cp1Input = f2.addInput(bezierBundle.controlPoint1, "shape", { y: { inverted: true }, label: "controlPoint1" });
    const cp2Input = f2.addInput(bezierBundle.controlPoint2, "shape", { y: { inverted: true }, label: "controlPoint2" });
    bezierBundle.point1.shape.on("any", () => p1Input.refresh());
    bezierBundle.point2.shape.on("any", () => p2Input.refresh());
    bezierBundle.controlPoint1.shape.on("any", () => cp1Input.refresh());
    bezierBundle.controlPoint2.shape.on("any", () => cp2Input.refresh());
}
// #endregion

const autoOffset = samePointsOffset(Geomtoy.getOptions().epsilon);

const relObject = new Dynamic({
    separate: undefined as Trilean,
    intersect: new ShapeArray(),
    strike: new ShapeArray(),
    contact: new ShapeArray(),
    cross: new ShapeArray(),
    touch: new ShapeArray(),
    block: new ShapeArray(),
    blockedBy: new ShapeArray(),
    connect: new ShapeArray()
});

relObject.bind(
    [
        [quadraticBezierBundle.quadraticBezier.shape as QuadraticBezier, "any"],
        [bezierBundle.bezier.shape as Bezier, "any"]
    ],
    function ([e1, e2]) {
        const relationship = rs.relate(e1.target, e2.target);
        autoOffset.clear();

        relObject.separate = relationship.separate;

        relationship.intersect.forEach(p => ((p.appearance = "cross"), autoOffset.check(p)));
        relObject.intersect.shapes = relationship.intersect;

        relationship.strike.forEach(p => ((p.appearance = "cross"), autoOffset.check(p)));
        relObject.strike.shapes = relationship.strike;

        relationship.contact.forEach(p => ((p.appearance = "cross"), autoOffset.check(p)));
        relObject.contact.shapes = relationship.contact;

        relationship.cross.forEach(p => ((p.appearance = "cross"), autoOffset.check(p)));
        relObject.cross.shapes = relationship.cross;

        relationship.touch.forEach(p => ((p.appearance = "cross"), autoOffset.check(p)));
        relObject.touch.shapes = relationship.touch;

        relationship.block.forEach(p => ((p.appearance = "cross"), autoOffset.check(p)));
        relObject.block.shapes = relationship.block;

        relationship.blockedBy.forEach(p => ((p.appearance = "cross"), autoOffset.check(p)));
        relObject.blockedBy.shapes = relationship.blockedBy;

        relationship.connect.forEach(p => ((p.appearance = "cross"), autoOffset.check(p)));
        relObject.connect.shapes = relationship.connect;

        card.setIntroduction(` 
        <ul class="list-group shadow-sm">
            <li class="list-group-item">Separate: <span class="fw-bold">${relObject.separate}</span></li>
            <li class="list-group-item">Intersect: <span style="color:${color("amber")}" class="fw-bold">&#x2716;</span> <span class="badge bg-secondary">${relationship.intersect.length}</span></li>
            <li class="list-group-item">Strike: <span style="color:${color("green")}" class="fw-bold">&#x2716;</span> <span class="badge bg-secondary">${relationship.strike.length}</span></li>
            <li class="list-group-item">Contact: <span style="color:${color("orange")}" class="fw-bold">&#x2716;</span> <span class="badge bg-secondary">${relationship.contact.length}</span></li>
            <li class="list-group-item">Cross: <span style="color:${color("lime")}" class="fw-bold">&#x2716;</span> <span class="badge bg-secondary">${relationship.cross.length}</span></li>
            <li class="list-group-item">Touch: <span style="color:${color("pink")}" class="fw-bold">&#x2716;</span> <span class="badge bg-secondary">${relationship.touch.length}</span></li>
            <li class="list-group-item">Block: <span style="color:${color("lightBlue")}" class="fw-bold">&#x2716;</span> <span class="badge bg-secondary">${relationship.block.length}</span></li>
            <li class="list-group-item">BlockedBy: <span style="color:${color("teal")}" class="fw-bold">&#x2716;</span> <span class="badge bg-secondary">${relationship.blockedBy.length}</span></li>
            <li class="list-group-item">Connect: <span style="color:${color("cyan")}" class="fw-bold">&#x2716;</span> <span class="badge bg-secondary">${relationship.connect.length}</span></li> 
        </ul>
        `);
    }
);

view.add(new ViewGroupElement(relObject.intersect.shapes, { interactable: false, ...stroke("amber") }), true);
view.add(new ViewGroupElement(relObject.strike.shapes, { interactable: false, ...stroke("green") }), true);
view.add(new ViewGroupElement(relObject.contact.shapes, { interactable: false, ...stroke("orange") }), true);
view.add(new ViewGroupElement(relObject.cross.shapes, { interactable: false, ...stroke("lime") }), true);
view.add(new ViewGroupElement(relObject.touch.shapes, { interactable: false, ...stroke("pink") }), true);
view.add(new ViewGroupElement(relObject.block.shapes, { interactable: false, ...stroke("lightBlue") }), true);
view.add(new ViewGroupElement(relObject.blockedBy.shapes, { interactable: false, ...stroke("teal") }), true);
view.add(new ViewGroupElement(relObject.connect.shapes, { interactable: false, ...stroke("cyan") }), true);

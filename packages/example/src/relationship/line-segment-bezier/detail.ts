import { LineSegment, Line } from "@geomtoy/core";
import { View, ViewElement, CanvasRenderer } from "@geomtoy/view";
import color from "../../assets/color";
import tpl from "../../assets/templates/simple-canvas-renderer";

import type { EventObject, Text, Point } from "@geomtoy/core";

const canvas = tpl.getCanvas();
tpl.setDescription(`
<strong>Interactables</strong>
<ul>
    <li>Points: styled as <span class="style-indicator" style="border-color:${interactableStyles.point[0].stroke};background-color:${interactableStyles.point[0].fill}"></span></li>
</ul>
<strong>Description</strong>
<ol>
    <li>Point P is constrained on line AB.</li>
    <li>Move point P to determine the distance between it and point A. The distance will be kept until you move point P.</li>
    <li>Point A and point B determine line AB.</li>
    <li>Point A, point B and point P will follow line AB to move.</li>
    <li>Move line AB or circle O to get the intersection points of them.</li>
</ol>
`);

console.log(g.options());
const canvasRenderer = new CanvasRenderer(canvas, g);
canvasRenderer.display.density = 10;
canvasRenderer.display.zoom = 1;
canvasRenderer.display.yAxisPositiveOnBottom = false;
canvasRenderer.display.xAxisPositiveOnRight = false;

const view = new View(g, { hoverForemost: false }, canvasRenderer);
view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
view.startInteractive();

const main = () => {
    const pA = g.Point(-80, 8);
    const pB = g.Point(58, 29);

    const pC = g.Point(220, -8);
    const pD = g.Point(20, 30);
    const pE = g.Point(-182, 34);
    const pF = g.Point(30, 40);

    function lineSegmentBind(this: LineSegment, [e1, e2]: [EventObject<Point>, EventObject<Point>]) {
        this.copyFrom(g.LineSegment(e1.target, e2.target));
    }

    const l = g.Line.fromTwoPoints(pA, pB)!;

    pC.on("any", function () {
        this.copyFrom(l.getClosestPointFrom(this));
    });
    pD.on("any", function () {
        this.copyFrom(l.getClosestPointFrom(this));
    });
    pE.on("any", function () {
        this.copyFrom(l.getClosestPointFrom(this));
    });
    pF.on("any", function () {
        this.copyFrom(l.getClosestPointFrom(this));
    });

    const ls1 = g
        .LineSegment()
        .bind(
            [
                [pC, "any"],
                [pD, "any"]
            ],
            lineSegmentBind
        )
        .on(
            "any",
            function () {
                this.point1 = l.getClosestPointFrom(this.point1Coordinates);
                this.point2 = l.getClosestPointFrom(this.point2Coordinates);
                pC.copyFrom(this.point1);
                pD.copyFrom(this.point2);
            },
            { hasRecursiveEffect: true }
        );

    const ls2 = g
        .LineSegment()
        .bind(
            [
                [pE, "any"],
                [pF, "any"]
            ],
            lineSegmentBind
        )
        .on(
            "any",
            function () {
                this.point1 = l.getClosestPointFrom(this.point1Coordinates);
                this.point2 = l.getClosestPointFrom(this.point2Coordinates);
                pE.copyFrom(this.point1);
                pF.copyFrom(this.point2);
            },
            { hasRecursiveEffect: true }
        );

    const rs = g.Relationship();

    const group = g.Group().bind(
        [
            [ls1, "any"],
            [ls2, "any"]
        ],
        function ([e1, e2]) {
            const ls = rs.overlap.lineSegmentLineSegment(e1.target, e2.target);
            console.log(ls);
            if (ls === null) {
                this.items = [];
            } else {
                this.items = [ls];
            }
        },
        { priority: 0 }
    );

    const overlap = new ViewElement(group, false, { stroke: color("pink"), strokeWidth: 6 }, hoverStyle, activeStyle);
    view.add(new ViewElement(pC, true, ...interactableStyles.point))
        .add(new ViewElement(pD, true, ...interactableStyles.point))
        .add(new ViewElement(pE, true, ...interactableStyles.point))
        .add(new ViewElement(pF, true, ...interactableStyles.point))
        .add(new ViewElement(ls1, true, { stroke: color("orange"), strokeWidth: 4 }, hoverStyle, activeStyle))
        .add(new ViewElement(ls2, true, { stroke: color("teal"), strokeWidth: 4 }, hoverStyle, activeStyle))
        .add(new ViewElement(l, false, { stroke: color("gray"), strokeWidth: 2 }, hoverStyle, activeStyle))
        .add(overlap);
    view.foremost(overlap);
};
main();

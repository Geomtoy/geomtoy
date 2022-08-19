import { LineSegment } from "@geomtoy/core";
import { View, ViewElement, CanvasRenderer } from "@geomtoy/view";
import color from "../assets/color";
// import { mathFont, hoverStyle, activeStyle } from "../assets/common";
import tpl from "../assets/templates/simple-canvas-renderer";

import type { EventObject, Text, Point } from "@geomtoy/core";

const canvas = tpl.getCanvas();
tpl.setDescription(``);

const canvasRenderer = new CanvasRenderer(canvas, g);
canvasRenderer.display.density = 10;
canvasRenderer.display.zoom = 1;
canvasRenderer.display.yAxisPositiveOnBottom = false;
canvasRenderer.display.xAxisPositiveOnRight = false;

const view = new View(g, { hoverForemost: false }, canvasRenderer);
view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
view.startInteractive();

const main = () => {
    const pA = g.Point(-25, -12);
    const pB = g.Point(-20, 25);
    const pC = g.Point(0, 0);
    const pD = g.Point(20, 40);
    const pE = g.Point(20, 60);

    const offsetLabel = function (this: Text, [e]: [EventObject<Point>]) {
        this.coordinates = e.target.move(1, 1).coordinates;
    };
    const lsAB = g.LineSegment().bind(
        [
            [pA, "any"],
            [pB, "any"]
        ],
        function ([e1, e2]) {
            this.copyFrom(g.LineSegment(e1.target, e2.target));
        }
    );
    const qbCDE = g.QuadraticBezier().bind(
        [
            [pC, "any"],
            [pD, "any"],
            [pE, "any"]
        ],
        function ([e1, e2, e3]) {
            this.copyFrom(g.QuadraticBezier(e1.target, e2.target, e3.target));
        }
    );

    const rs = g.Relationship();

    const group = g.Group().bind(
        [
            [lsAB, "any"],
            [qbCDE, "any"]
        ],
        function ([e1, e2]) {
            const cs = rs.cross.lineSegmentQuadraticBezier(e1.target, e2.target);
            this.items = cs;
        }
    );

    // const circle = g.Circle(0, 0, 10);
    // const pointO = g.Point().bind([[circle, "any"]], function ([e]) {
    //     this.copyFrom(e.target.centerPoint);
    // });
    // const labelO = g.Text("O", mathFont).bind([[pointO, "any"]], offsetLabel, { priority: 0 });

    // g.Group([pointInt1, pointInt2]).bind(
    //     [
    //         [lineAB, "any"],
    //         [circle, "any"]
    //     ],
    //     function ([e1, e2]) {
    //         const ret = e1.target.getIntersectionPointsWithCircle(e2.target);
    //         this.items[0].copyFrom(ret === null ? null : ret[0]);
    //         this.items[1].copyFrom(ret === null ? null : ret[1]);
    //     }
    // );

    view.add(new ViewElement(pA, true, { fill: color("black", 0.2) }, hoverStyle, activeStyle))
        .add(new ViewElement(pB, true, { fill: color("black", 0.2) }, hoverStyle, activeStyle))
        .add(new ViewElement(pC, true, { fill: color("black", 0.2) }, hoverStyle, activeStyle))
        .add(new ViewElement(pD, true, { fill: color("black", 0.2) }, hoverStyle, activeStyle))
        .add(new ViewElement(pE, true, { fill: color("gray") }, hoverStyle, activeStyle))
        .add(new ViewElement(lsAB, false, { stroke: color("red") }, hoverStyle, activeStyle))
        .add(new ViewElement(qbCDE, false, { stroke: color("purple") }, hoverStyle, activeStyle))
        .add(new ViewElement(group, false, { fill: color("pink") }, hoverStyle, activeStyle))

        // .add(new ViewElement(pointP, true, { fill: color("green") }, hoverStyle, activeStyle))
        // .add(new ViewElement(labelP, false, { fill: color("green") }, hoverStyle, activeStyle))
        // .add(new ViewElement(lineAB, true, { stroke: color("orange"), strokeWidth: 3, fill: "transparent" }, hoverStyle, activeStyle))

        // .add(new ViewElement(labelO, false, { fill: color("red") }))
        // .add(new ViewElement(circle, true, { fill: color("red", 0.2), stroke: color("red"), strokeWidth: 1 }, hoverStyle, activeStyle))
        // .add(new ViewElement(pointO, false, { stroke: color("red"), strokeWidth: 2 }, hoverStyle, activeStyle))

        // .add(new ViewElement(pointInt1, false, { stroke: color("lightBlue"), strokeWidth: 2 }, hoverStyle, activeStyle))
        // .add(new ViewElement(pointInt2, false, { stroke: color("lightBlue"), strokeWidth: 2 }, hoverStyle, activeStyle))
        // .add(new ViewElement(image, true, { fill: color("red", 0.75) }, hoverStyle, activeStyle))
        .add(new ViewElement(g.Point.zero(), false, { fill: color("gray") }, hoverStyle, activeStyle));
    // .add(new ViewElement(path, true, { fill: color("red", 0.75) }, hoverStyle, activeStyle));
};
main();

import { Bezier, LineSegment, Relationship } from "@geomtoy/core";
import { Maths, Utility } from "@geomtoy/util";
import { View, ViewElement, CanvasRenderer } from "@geomtoy/view";

import color from "../assets/color";
import tpl from "../assets/templates/multiple-canvas-renderer";
import { arrayResult, trileanResult } from "./_common";

tpl.title("Line segment-line segment relationship");

const rs = new Relationship();
{
    tpl.addSection("Equal");
    {
        const card = tpl.addCard({ title: "equal", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([-5, -5], [5, 5]);
        const lineSegment2 = new LineSegment([5, 5], [-5, -5]);
        trileanResult(card, lineSegment1, lineSegment2, rs.equal(lineSegment1, lineSegment2));
    }
}
{
    tpl.addSection("Separate");
    {
        const card = tpl.addCard({ title: "on same trajectory separate", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([-4, -4], [0, 0]);
        const lineSegment2 = new LineSegment([2, 2], [7, 7]);
        trileanResult(card, lineSegment1, lineSegment2, rs.separate(lineSegment1, lineSegment2));
    }
    {
        const card = tpl.addCard({ title: "not on same trajectory separate", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([0, -2], [10, 5]);
        const lineSegment2 = new LineSegment([5, 5], [-5, -5]);
        trileanResult(card, lineSegment1, lineSegment2, rs.separate(lineSegment1, lineSegment2));
    }
}
{
    tpl.addSection("Intersect");
    {
        const card = tpl.addCard({ title: "intersect", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([-4, -4], [4, 4]);
        const lineSegment2 = new LineSegment([-5, 2], [7, -7]);
        arrayResult(card, lineSegment1, lineSegment2, rs.intersect(lineSegment1, lineSegment2));
    }
}
{
    tpl.addSection("Strike/Cross");
    {
        const card = tpl.addCard({ title: "at end strike", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([-10, -10], [10, 10]);
        const lineSegment2 = new LineSegment([-10, -10], [-10, 10]);
        arrayResult(card, lineSegment1, lineSegment2, rs.strike(lineSegment1, lineSegment2));
    }
    {
        const card = tpl.addCard({ title: "not at end strike = cross", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([-10, -10], [10, 10]);
        const lineSegment2 = new LineSegment([10, -10], [-10, 10]);
        arrayResult(card, lineSegment1, lineSegment2, rs.cross(lineSegment1, lineSegment2));
    }
}
{
    tpl.addSection("Block/BlockedBy");
    {
        const card = tpl.addCard({ title: "block", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([-10, -10], [10, 10]);
        const lineSegment2 = new LineSegment([0, 0], [10, 5]);
        arrayResult(card, lineSegment1, lineSegment2, rs.block(lineSegment1, lineSegment2));
    }
    {
        const card = tpl.addCard({ title: "blocked by", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([-10, 0], [10, 5]);
        const lineSegment2 = new LineSegment([10, 0], [10, 10]);
        arrayResult(card, lineSegment1, lineSegment2, rs.blockedBy(lineSegment1, lineSegment2));
    }
}
{
    tpl.addSection("Connect");
    {
        const card = tpl.addCard({ title: "connect", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([-10, 0], [10, 5]);
        const lineSegment2 = new LineSegment([10, 0], [10, 5]);
        arrayResult(card, lineSegment1, lineSegment2, rs.connect(lineSegment1, lineSegment2));
    }
}
{
    tpl.addSection("Coincide");
    {
        const card = tpl.addCard({ title: "1 point coincide", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([0, 0], [10, 5]);
        const lineSegment2 = new LineSegment([0, 0], [-10, -5]);
        arrayResult(card, lineSegment1, lineSegment2, rs.coincide(lineSegment1, lineSegment2));
    }
    {
        const card = tpl.addCard({ title: "1 segment coincide", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([-4, -4], [5, 5]);
        const lineSegment2 = new LineSegment([-10, -10], [2, 2]);
        arrayResult(card, lineSegment1, lineSegment2, rs.coincide(lineSegment1, lineSegment2));
    }
    {
        const card = tpl.addCard({ title: "1 segment within coincide", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([-4, -4], [5, 5]);
        const lineSegment2 = new LineSegment([0, 0], [2, 2]);
        arrayResult(card, lineSegment1, lineSegment2, rs.coincide(lineSegment1, lineSegment2));
    }
    {
        const card = tpl.addCard({ title: "equal coincide", canvasId: Utility.uuid() });
        const lineSegment1 = new LineSegment([0, 0], [10, 5]);
        const lineSegment2 = new LineSegment([10, 5], [0, 0]);
        arrayResult(card, lineSegment1, lineSegment2, rs.coincide(lineSegment1, lineSegment2));
    }
}

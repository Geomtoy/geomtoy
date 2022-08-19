import { Arc, Polygon, Relationship } from "@geomtoy/core";
import { Maths, Utility } from "@geomtoy/util";
import tpl from "../assets/templates/multiple-canvas-renderer";
import { arrayResult, trileanResult } from "./_common";

tpl.title("Polygon-polygon relationship");

const rs = new Relationship();

{
    tpl.addSection("Separate");
    {
        const card = tpl.addCard({ canvasId: Utility.uuid() });
        const polygon1 = new Polygon([Polygon.vertex([50, 0]), Polygon.vertex([21, 90]), Polygon.vertex([98, 35]), Polygon.vertex([2, 35]), Polygon.vertex([79, 90])]);
        const polygon2 = new Polygon([Polygon.vertex([25, 25]), Polygon.vertex([25, 75]), Polygon.vertex([75, 75]), Polygon.vertex([75, 25])]);
        trileanResult(card, polygon1, polygon2, rs.separate(polygon1, polygon2));
    }
    {
        const card = tpl.addCard({ title: "not on same trajectory", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, (3 * Maths.PI) / 4, -Maths.PI / 3, true, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([5, 5], 10, 5, Maths.PI / 4, -Maths.PI / 6, true, 0);
        trileanResult(card, arc1, arc2, rs.separate(arc1, arc2));
    }
}
{
    tpl.addSection("Equal");
    {
        const card = tpl.addCard({ canvasId: Utility.uuid() });
        const polygon1 = new Polygon([Polygon.vertex([50, 0]), Polygon.vertex([21, 90]), Polygon.vertex([98, 35]), Polygon.vertex([2, 35]), Polygon.vertex([79, 90])]);
        const polygon2 = new Polygon([Polygon.vertex([25, 25]), Polygon.vertex([25, 75]), Polygon.vertex([75, 75]), Polygon.vertex([75, 25])]);
        arrayResult(card, polygon1, polygon2, rs.cross(polygon1, polygon2));
    }
}

{
    tpl.addSection("Strike");
    {
        const card = tpl.addCard({ title: "at end", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, (4 * Maths.PI) / 3, -Maths.PI / 4, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, -10], 10, 5, 0, Maths.PI, true, Maths.PI / 2);
        arrayResult(card, arc1, arc2, rs.strike(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "not at end-cross", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, (4 * Maths.PI) / 3, -Maths.PI / 4, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, -10], 10, 5, Maths.PI / 2, Maths.PI, false, Maths.PI / 2);
        arrayResult(card, arc1, arc2, rs.strike(arc1, arc2));
    }
}
{
    tpl.addSection("Contact");
    {
        const card = tpl.addCard({ title: "at end", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, 0], 10, 5, Maths.PI / 2, 0, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([10, 0], 10, 5, (4 * Maths.PI) / 3, -Maths.PI / 3, false, 0);
        arrayResult(card, arc1, arc2, rs.contact(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "not at end-touch", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 2.193357483982], 5, 10, (4 * Maths.PI) / 3, -Maths.PI / 4, false, Maths.PI / 2);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, -10], 10, 5, Maths.PI / 2, Maths.PI, false, Maths.PI / 2);
        arrayResult(card, arc1, arc2, rs.intersect(arc1, arc2));
    }
}
{
    tpl.addSection("Cross");
    {
        const card = tpl.addCard({ title: "1 point", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, (2 * Maths.PI) / 3, -Maths.PI / 4, true, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI, -Maths.PI / 2, false, Maths.PI / 4);
        arrayResult(card, arc1, arc2, rs.intersect(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "2 points", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI, -Maths.PI / 4, true, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, -10], 10, 5, Maths.PI, -Maths.PI / 2, false, Maths.PI / 4);
        arrayResult(card, arc1, arc2, rs.cross(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "3 points", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI, (3 * Maths.PI) / 4, true, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI, -Maths.PI / 2, false, Maths.PI / 4);
        arrayResult(card, arc1, arc2, rs.cross(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "4 points", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI, (3 * Maths.PI) / 4, true, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI, (-2 * Maths.PI) / 3, false, Maths.PI / 4);
        arrayResult(card, arc1, arc2, rs.cross(arc1, arc2));
    }
}
{
    tpl.addSection("Touch");
    {
        const card = tpl.addCard({ title: "only touch", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([10, 0], 10, 5, (4 * Maths.PI) / 3, -Maths.PI / 3, false, 0);
        arrayResult(card, arc1, arc2, rs.touch(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "touch and cross", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([5, 0], 5, 5, (4 * Maths.PI) / 3, -Maths.PI / 3, false, 0);
        arrayResult(card, arc1, arc2, rs.touch(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "2 points", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 5, 5, Maths.PI / 3, -Maths.PI / 4, true, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 15, 5, Maths.PI / 3, -Maths.PI / 3, true, 0);
        arrayResult(card, arc1, arc2, rs.touch(arc1, arc2));
    }
}
{
    tpl.addSection("Block/BlockedBy");
    {
        const card = tpl.addCard({ canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([10, 0], 10, 5, Maths.PI, -Maths.PI / 3, false, 0);
        arrayResult(card, arc1, arc2, rs.block(arc1, arc2));
    }
    {
        const card = tpl.addCard({ canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 5], 10, 5, Maths.PI, -Maths.PI / 2, false, 0);
        arrayResult(card, arc1, arc2, rs.block(arc1, arc2));
    }
}
{
    tpl.addSection("Connect");
    {
        const card = tpl.addCard({ canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 5], 10, 5, Maths.PI, -Maths.PI / 2, false, 0);
        arrayResult(card, arc1, arc2, rs.connect(arc1, arc2));
    }
    {
        const card = tpl.addCard({ canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([-11, 0], 10, 5, Maths.PI / 2, -Maths.PI / 2, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([-11, 0], 10, 10, Maths.PI / 2, -Maths.PI / 2, false, 0);
        arrayResult(card, arc1, arc2, rs.touch(arc1, arc2));
    }
}
{
    tpl.addSection("Coincide");
    {
        const card = tpl.addCard({ title: "1 point", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI, -Maths.PI / 4, true, 0);
        arrayResult(card, arc1, arc2, rs.coincide(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "2 points", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, true, 0);
        arrayResult(card, arc1, arc2, rs.coincide(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "merge-1 overlap", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 3, true, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 4, -Maths.PI / 2, false, 0);
        arrayResult(card, arc1, arc2, rs.coincide(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "merge-2 overlaps", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 3, -Maths.PI / 3, true, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, (3 * Maths.PI) / 4, -Maths.PI / 2, false, 0);
        arrayResult(card, arc1, arc2, rs.coincide(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "merge-contain", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 2, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, -Maths.PI / 3, Maths.PI / 3, true, 0);
        arrayResult(card, arc1, arc2, rs.coincide(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "merge-equal", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 2, false, 0);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 2, false, 0);
        arrayResult(card, arc1, arc2, rs.coincide(arc1, arc2));
    }
}

import { Arc, Relationship } from "@geomtoy/core";
import { Maths, Utility } from "@geomtoy/util";
import tpl from "../assets/templates/multiple-canvas-renderer";
import { arrayResult, trileanResult } from "./_common";

tpl.title("Arc-arc relationship");

const rs = new Relationship();

{
    tpl.addSection("Equal");
    {
        const card = tpl.addCard({ title: "equal", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 6, false);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 6, false);
        trileanResult(card, arc1, arc2, rs.equal(arc1, arc2));
    }
}
{
    tpl.addSection("Separate");
    {
        const card = tpl.addCard({ title: "on same trajectory separate", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, (3 * Maths.PI) / 4, -Maths.PI / 3, true);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 4, -Maths.PI / 6, false);
        trileanResult(card, arc1, arc2, rs.separate(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "not on same trajectory separate", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, (3 * Maths.PI) / 4, -Maths.PI / 3, true);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([5, 5], 10, 5, Maths.PI / 4, -Maths.PI / 6, true);
        trileanResult(card, arc1, arc2, rs.separate(arc1, arc2));
    }
}
{
    tpl.addSection("Intersect");
    {
        const card = tpl.addCard({ title: "1 point intersect", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, (4 * Maths.PI) / 3, -Maths.PI / 4, false, Maths.PI / 3);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, -10], 10, 5, 0, Maths.PI, true, Maths.PI / 5);
        arrayResult(card, arc1, arc2, rs.intersect(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "2 points intersect", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, (3 * Maths.PI) / 4, -Maths.PI / 3, true, Maths.PI / 2);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 4, -Maths.PI / 6, true);
        arrayResult(card, arc1, arc2, rs.intersect(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "3 points intersect", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 20, 5, 0, -Maths.PI / 3, true, Maths.PI / 3);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([-2, -2], 20, 5, Maths.PI / 4, -Maths.PI / 6, true);
        arrayResult(card, arc1, arc2, rs.intersect(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "4 points intersect", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 5, 15, -Maths.PI / 2, (-2 * Maths.PI) / 3, true);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([2, 2], 20, 5, Maths.PI / 4, -Maths.PI / 6, true);
        arrayResult(card, arc1, arc2, rs.intersect(arc1, arc2));
    }
}
{
    tpl.addSection("Strike/Cross");
    {
        const card = tpl.addCard({ title: "at end strike", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, (4 * Maths.PI) / 3, -Maths.PI / 4, false);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, -10], 10, 5, 0, Maths.PI, true, Maths.PI / 2);
        arrayResult(card, arc1, arc2, rs.strike(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "not at end strike = cross", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, (4 * Maths.PI) / 3, -Maths.PI / 4, false);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, -10], 10, 5, Maths.PI / 2, Maths.PI, false, Maths.PI / 2);
        arrayResult(card, arc1, arc2, rs.cross(arc1, arc2));
    }
}
{
    tpl.addSection("Contact/Touch");
    {
        const card = tpl.addCard({ title: "at end contact", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, 0], 10, 5, Maths.PI / 2, 0, false);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([10, 0], 10, 5, (4 * Maths.PI) / 3, -Maths.PI / 3, false);
        arrayResult(card, arc1, arc2, rs.contact(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "not at end contact = touch", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 2.193357483982], 5, 10, (4 * Maths.PI) / 3, -Maths.PI / 4, false, Maths.PI / 2);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, -10], 10, 5, Maths.PI / 2, Maths.PI, false, Maths.PI / 2);
        arrayResult(card, arc1, arc2, rs.intersect(arc1, arc2));
    }
}
{
    tpl.addSection("Block/BlockedBy");
    {
        const card = tpl.addCard({ title: "block", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, false);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([10, 0], 10, 5, Maths.PI, -Maths.PI / 3, false);
        arrayResult(card, arc1, arc2, rs.block(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "blocked by", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 5], 10, 5, Maths.PI, -Maths.PI / 2, false);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, false);
        arrayResult(card, arc1, arc2, rs.blockedBy(arc1, arc2));
    }
}
{
    tpl.addSection("Connect");
    {
        const card = tpl.addCard({ title: "strike connect", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([-10, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, false);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 5], 10, 5, Maths.PI, -Maths.PI / 2, false);
        arrayResult(card, arc1, arc2, rs.connect(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "contact connect", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([-11, 0], 10, 5, 0, -Maths.PI / 2, false);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([-11, 0], 10, 10, Maths.PI / 2, 0, false);
        arrayResult(card, arc1, arc2, rs.connect(arc1, arc2));
    }
}
{
    tpl.addSection("Coincide");
    {
        const card = tpl.addCard({ title: "1 point coincide", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, false);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI, -Maths.PI / 4, true);
        arrayResult(card, arc1, arc2, rs.coincide(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "2 points coincide", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, false);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 4, true);
        arrayResult(card, arc1, arc2, rs.coincide(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "1 segment coincide", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 3, true);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 4, -Maths.PI / 2, false);
        arrayResult(card, arc1, arc2, rs.coincide(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "2 segments coincide", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 3, -Maths.PI / 3, true);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, (3 * Maths.PI) / 4, -Maths.PI / 2, false);
        arrayResult(card, arc1, arc2, rs.coincide(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "1 segment within coincide", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 2, false);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, -Maths.PI / 3, Maths.PI / 3, true);
        arrayResult(card, arc1, arc2, rs.coincide(arc1, arc2));
    }
    {
        const card = tpl.addCard({ title: "equal coincide", canvasId: Utility.uuid() });
        const arc1 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 2, false);
        const arc2 = Arc.fromCenterPointAndStartEndAnglesEtc([0, 0], 10, 5, Maths.PI / 2, -Maths.PI / 2, false);
        arrayResult(card, arc1, arc2, rs.coincide(arc1, arc2));
    }
}

import { Bezier, BooleanOperation, Geomtoy, Point, Polygon } from "@geomtoy/core";
import { Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewElement } from "@geomtoy/view";
import { strokeFill } from "../assets/common";
import tpl from "../assets/templates/multiple-canvas-renderer";
import { randomPolygonVertex } from "./_common";

tpl.title("Polygon self-union");

Geomtoy.setOptions({
    // graphics: { polygonSegmentArrow: false }
});
const bo = new BooleanOperation();

{
    tpl.addSection("Common case");
    tpl.addParagraph("Refresh to random");
    const polygon = new Polygon(Utility.range(0, 10).map(_ => randomPolygonVertex()))!;
    polygon.fillRule = "nonzero";

    const compound = bo.selfUnion(polygon);

    console.log(compound);

    const card1 = tpl.addCard({ title: "original", canvasId: Utility.uuid(), className: "col-6" });
    const view1 = new View({}, new CanvasRenderer(card1.canvas, {}, { density: 10, zoom: 0.2, yAxisPositiveOnBottom: false }));

    const card2 = tpl.addCard({ title: "self-union", canvasId: Utility.uuid(), className: "col-6" });
    const view2 = new View({}, new CanvasRenderer(card2.canvas, {}, { density: 10, zoom: 0.2, yAxisPositiveOnBottom: false }));

    view1.startResponsive((width, height) => (view1.renderer.display.origin = [width / 2, height / 2]));
    view1.startInteractive();

    view2.startResponsive((width, height) => (view2.renderer.display.origin = [width / 2, height / 2]));
    view2.startInteractive();

    view1.add(new ViewElement(polygon, { interactable: false, ...strokeFill("red") }));
    view2.add(new ViewElement(compound, { interactable: false, ...strokeFill("red") }));
}

{
    tpl.addSection("Special case about fill rule");
    const polygon1 = new Polygon(
        [
            Polygon.vertex([-50, 25]),
            Polygon.vertex([-50, -25]),
            Polygon.vertex([-25, -25]),
            Polygon.vertex([-25, 25]),
            Polygon.vertex([-50, 25]),
            Polygon.vertex([-50, -25]),
            Polygon.vertex([-25, -25]),
            Polygon.vertex([-25, 25])
        ],
        true
    );
    polygon1.fillRule = "evenodd";

    const polygon2 = new Polygon(
        [
            Polygon.vertex([25, 25]),
            Polygon.vertex([25, -25]),
            Polygon.vertex([50, -25]),
            Polygon.vertex([50, 25]),
            Polygon.vertex([25, 25]),
            Polygon.vertex([25, -25]),
            Polygon.vertex([50, -25]),
            Polygon.vertex([50, 25])
        ],
        true
    );
    polygon2.fillRule = "nonzero";

    const compound1 = bo.selfUnion(polygon1);
    const compound2 = bo.selfUnion(polygon2);

    const card1 = tpl.addCard({ title: "original", canvasId: Utility.uuid(), className: "col-6" });
    const view1 = new View({}, new CanvasRenderer(card1.canvas, {}, { density: 10, zoom: 0.2, yAxisPositiveOnBottom: false }));

    const card2 = tpl.addCard({ title: "self-union", canvasId: Utility.uuid(), className: "col-6" });
    const view2 = new View({}, new CanvasRenderer(card2.canvas, {}, { density: 10, zoom: 0.2, yAxisPositiveOnBottom: false }));

    view1.startResponsive((width, height) => (view1.renderer.display.origin = [width / 2, height / 2]));
    view1.startInteractive();

    view2.startResponsive((width, height) => (view2.renderer.display.origin = [width / 2, height / 2]));
    view2.startInteractive();

    view1.add(new ViewElement(polygon1, { interactable: false, ...strokeFill("red") }));
    view1.add(new ViewElement(polygon2, { interactable: false, ...strokeFill("blue") }));

    view2.add(new ViewElement(compound1, { interactable: false, ...strokeFill("red") }));
    view2.add(new ViewElement(compound2, { interactable: false, ...strokeFill("blue") }));

    card1.setDescription(`<pre><code class="language-js">
    // red and blue polygons are both two loop closed polygon

    // red polygon
    const polygon1 = new Polygon(
        
        [
            Polygon.vertex([-50, 25]),
            Polygon.vertex([-50, -25]),
            Polygon.vertex([-25, -25]),
            Polygon.vertex([-25, 25]),
            Polygon.vertex([-50, 25]),
            Polygon.vertex([-50, -25]),
            Polygon.vertex([-25, -25]),
            Polygon.vertex([-25, 25])
        ],
        true
    );
    polygon1.fillRule = "evenodd";

    // blue polygon
    const polygon2 = new Polygon(
        
        [
            Polygon.vertex([25, 25]),
            Polygon.vertex([25, -25]),
            Polygon.vertex([50, -25]),
            Polygon.vertex([50, 25]),
            Polygon.vertex([25, 25]),
            Polygon.vertex([25, -25]),
            Polygon.vertex([50, -25]),
            Polygon.vertex([50, 25]),
        ],
        true
    );
    polygon2.fillRule = "nonzero";
    </pre>`);

    card2.setDescription(`<pre><code class="language-js">
    // red polygon after self-union is empty set 
    const compound1 = bo.selfUnion(polygon1);

    // blue polygon after self-union is normal polygon
    const compound2 = bo.selfUnion(polygon2); 
    </pre>`);
}

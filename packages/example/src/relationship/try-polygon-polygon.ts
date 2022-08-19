import Geomtoy, { Arc, Point, Polygon, Relationship } from "@geomtoy/core";
import { Maths, Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewElement } from "@geomtoy/view";
import tpl from "../assets/templates/multiple-canvas-renderer";
import { arrayResult, trileanResult } from "./_common";

tpl.title("Polygon-polygon relationship");

const rs = new Relationship();

const points = Utility.range(0, 20).map(_ => Point.random([-100, -100, 200, 200]));

const polygon = new Polygon(points.map(p => Polygon.vertex(p))).bind(
    points.map(p => [p, "any"] as [Point, string]),
    function ([...evs]) {}
);

tpl.addSection("Try");
const card = tpl.addCard({ canvasId: Utility.uuid() });

const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 1, yAxisPositiveOnBottom: false }));
view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
view.startInteractive();
view.add(new ViewElement(g1, { interactable: false, autoUpdateView: true, style: redStrokeStyle }));
view.add(new ViewElement(g2, { interactable: false, autoUpdateView: true, style: blueStrokeStyle }));
card.setDescription("Result: " + result?.toString() ?? "undefined");

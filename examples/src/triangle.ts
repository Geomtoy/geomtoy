import Geomtoy from "../../src/geomtoy";
import { modifyDatGuiStyle, rendererSwitch } from "./assets/misc";
import { colors, mathFont } from "./assets/assets";
import Interact from "./assets/interact";
import { Collection, Drawable, Touchable } from "./assets/GeomObjectWrapper";
import { Renderer } from "../../src/geomtoy/types";

import type { EventObject, Text, Point } from "../../src/geomtoy/package";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const svg = document.querySelector("#svg") as SVGSVGElement;
const description = document.querySelector("#description") as HTMLElement;
description.innerHTML = `
    <strong>Touchables</strong>
    <ul>
        <li>Points: A, B, P</li>
        <li>Lines: AB</li>
        <li>Circles: O</li>
    </ul>
    <strong>Description</strong>
    <ol>
        <li>Point P is constrained on line AB.</li>
        <li>Move point P to determine the distance between it and point A. The distance will be kept until you move point P.</li>
        <li>Point A and point B determine line AB.</li>
        <li>Point A, point B and point P will follow line AB to move.</li>
        <li>Move line AB or circle O to get the intersection points of them.</li>
    </ol>
`;
const G = new Geomtoy(100, 100, {
    epsilon: 2 ** -32,
    graphics: {
        pointSize: 6,
        arrow: {
            width: 5,
            length: 20,
            foldback: 0,
            noFoldback: true
        }
    }
});
G.yAxisPositiveOnBottom = false;
G.scale = 10;

const canvasRenderer = new Geomtoy.adapters.VanillaCanvas(canvas, G);
canvasRenderer.lineCap("round");
const svgRenderer = new Geomtoy.adapters.VanillaSvg(svg, G);
svgRenderer.lineCap("round");
const collection = new Collection();
const interactCanvas = new Interact(canvasRenderer, collection);
const interactSvg = new Interact(svgRenderer, collection);

let currentRendererType: string;
const rendererList: { [key: string]: Renderer } = { canvas: canvasRenderer, svg: svgRenderer };
const interactList: { [key: string]: Interact } = { canvas: interactCanvas, svg: interactSvg };

modifyDatGuiStyle();
rendererSwitch(rendererList, "svg", (type: string) => {
    currentRendererType = type;
    Object.keys(rendererList)
        .filter(t => t !== type)
        .forEach(t => {
            interactList[t].stopDragAndDrop();
            interactList[t].stopZoomAndPan();
            interactList[t].stopResponsive;
        });
    interactList[type].startDragAndDrop();
    interactList[type].startZoomAndPan();
    interactList[type].startResponsive((width, height) => {
        G.width = width;
        G.height = height;
        G.origin = [width / 2, height / 2];
    });
});

const setting = {
    sideLines: true,
    medianSegments: false,
    centroidPoint: false,
    medialTriangle: false,
    antimedialTriangle: false,
    angleBisectingSegments: false,
    incenterPoint: false,
    inscribedCircle: false,
    altitudeLines: false,
    orthocenterPoint: false,
    orthicTriangle: false,
    polarCircle: false,
    perpendicularlyBisectingLines: false,
    circumcenterPoint: false,
    circumscribedCircle: false,
    escenterPoints: false,
    escribedCircles: false,
    symmedianSegments: false,
    lemoinePoint: false,
    eulerLine: false,
    ninePointCenterPoint: false,
    ninePointCircle: false
};

// //@ts-ignore
// const gui = new dat.GUI()
// function newGuiObject(folder, touchable) {
//     if ((touchable.type = "point")) {
//         let controllerX = folder
//             .add(touchable.object, "x", -200, 200, 0.1)
//             .listen()
//             .onChange(() => G.nextTick(() => draw(currentRenderer)))
//         touchable.controller.x = controllerX
//         let controllerY = folder
//             .add(touchable.object, "y", -200, 200, 0.1)
//             .listen()
//             .onChange(() => G.nextTick(() => draw(currentRenderer)))
//         touchable.controller.y = controllerY
//     }
// }

// const guiObject = gui.addFolder("objects")
// guiObject.open()
// Object.keys(touchables).forEach(name => {
//     let folder = guiObject.addFolder(name)
//     folder.open()
//     newGuiObject(folder, touchables[name])
// })

// const guiSetting = gui.addFolder("setting")
// guiSetting.open()
// Object.keys(setting).forEach(name => {
//     guiSetting
//         .add(setting, name)
//         .listen()
//         .onChange(() => draw(currentRenderer))
// })

const main = () => {
    const pointA = G.Point(-25, -12);
    const pointB = G.Point(35, 25);
    const pointC = G.Point(35, -16);

    const offsetLabel = function (this: Text, [e]: [EventObject<Point>]) {
        this.point = e.target.move(2, 2);
    };

    const labelA = G.Text("A", mathFont).bind([[pointA, "any"]], offsetLabel);
    const labelB = G.Text("B", mathFont).bind([[pointB, "any"]], offsetLabel);
    const labelC = G.Text("C", mathFont).bind([[pointC, "any"]], offsetLabel);

    const vector = G.Vector().bind([[pointA, "any"]], function ([e]) {
        this.point1 = e.target;
    });
    const triangle = G.Triangle().bind(
        [
            [pointA, "any"],
            [pointB, "any"],
            [pointC, "any"]
        ],
        function ([e1, e2, e3]) {
            this.copyFrom(G.Triangle(e1.target, e2.target, e3.target));
        }
    );

    const line = G.Line().bind(
        [
            [pointA, "any"],
            [pointB, "any"]
        ],
        function ([e1, e2]) {
            this.copyFrom(G.Line.fromTwoPoints(e1.target, e2.target));
        }
    );

    const pointP = G.Point().bind([[line, "any"]], function ([e]) {
        this.copyFrom(e.target.isValid() ? e.target.getPointWhereXEqualTo(5) : null);
    });

    collection
        .setDrawable("coordinateSystemOriginPoint", new Drawable(G.Point.zero(), true, colors.grey, undefined))
        .setTouchable("pointA", new Touchable(pointA, false, colors.black, undefined))
        .setDrawable("labelA", new Drawable(labelA, false, colors.black, undefined))
        .setTouchable("pointB", new Touchable(pointB, false, colors.black, undefined))
        .setDrawable("labelB", new Drawable(labelB, false, colors.black, undefined))
        .setTouchable("pointC", new Touchable(pointC, false, colors.black, undefined))
        .setDrawable("labelC", new Drawable(labelC, false, colors.black, undefined))
        .setDrawable("triangle", new Drawable(triangle, true, colors.red + "20", colors.red, 3))
        .setDrawable("vector", new Drawable(vector, false, undefined, colors.blue, 3));
};
main();

// function draw(renderer) {

//     renderer.stroke(colors.grey)
//     setting.sideLines &&
//         renderer.drawBatch(
//             objects.triangle.getSideSegments().map(s => s.toLine()),
//             true
//         )
// }

// renderer.strokeWidth(4)
// renderer.strokeDash([10,10])
// renderer.strokeDash([10,10])
// Object.assign(objectCollection.triangle, {
//     point1: touchables.pointA.object,
//     point2: touchables.pointB.object,
//     point3: touchables.pointC.object
// })

// if (objectCollection.triangle.isValid()) {
//     renderer.fill("transparent")
//     renderer.draw(objectCollection.triangle)

// renderer.stroke(colors.grey + "CC")
// renderer.strokeDash([2, 2])
// setting.sideLines &&
//     renderer.drawBatch(
//         tri.getSideSegments().map(s => s.toLine()),
//         true
//     )
// renderer.strokeDash([])
// renderer.stroke(colors.red + "CC")
// setting.medianSegments && renderer.drawBatch(tri.getMedianSegments(), true)
// setting.centroidPoint && renderer.draw(tri.getCentroidPoint(), true)
// setting.medialTriangle && renderer.draw(tri.getMedialTriangle(), true)
// setting.antimedialTriangle && renderer.draw(tri.getAntimedialTriangle(), true)
// renderer.stroke(colors.green + "CC")
// setting.angleBisectingSegments && renderer.drawBatch(tri.getAngleBisectingSegments(), true)
// setting.incenterPoint && renderer.draw(tri.getIncenterPoint(), true)
// setting.inscribedCircle && renderer.draw(tri.getInscribedCircle(), true)
// renderer.stroke(colors.purple + "CC")
// setting.altitudeLines &&
//     renderer.drawBatch(
//         tri.getAltitudeSegments().map(s => s.toLine()),
//         true
//     )
// setting.orthocenterPoint && renderer.draw(tri.getOrthocenterPoint(), true)
// let ot, pc
// setting.orthicTriangle && (ot = tri.getOrthicTriangle()) !== null && renderer.draw(ot, true)
// setting.polarCircle && (pc = tri.getPolarCircle()) !== null && renderer.draw(pc, true)
// renderer.stroke(colors.indigo + "CC")
// setting.perpendicularlyBisectingLines &&
//     renderer.drawBatch(
//         tri.getPerpendicularlyBisectingSegments().map(s => s.toLine()),
//         true
//     )
// setting.circumcenterPoint && renderer.draw(tri.getCircumcenterPoint(), true)
// setting.circumscribedCircle && renderer.draw(tri.getCircumscribedCircle(), true)
// renderer.stroke(colors.teal + "CC")
// setting.escenterPoints && renderer.drawBatch(tri.getEscenterPoints(), true)
// setting.escribedCircles && renderer.drawBatch(tri.getEscribedCircles(), true)
// renderer.stroke(colors.yellow + "CC")
// setting.symmedianSegments && renderer.drawBatch(tri.getSymmedianSegments(), true)
// setting.lemoinePoint && renderer.draw(tri.getLemoinePoint(), true)
// renderer.stroke(colors.brown + "CC")
// setting.eulerLine && renderer.draw(tri.getEulerLine(), true)
// setting.ninePointCenterPoint && renderer.draw(tri.getNinePointCenterPoint(), true)
// setting.ninePointCircle && renderer.draw(tri.getNinePointCircle(), true)
// }
// }

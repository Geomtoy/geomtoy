import { Arc, Path, PathBezierToCommand, PathLineToCommand, Point, Polygon, Relationship, ShapeObject } from "@geomtoy/core";
import { Maths, Utility } from "@geomtoy/util";
import { CanvasRenderer, View, ViewElement } from "@geomtoy/view";
import tpl from "../assets/templates/multiple-canvas-renderer";
import { arrayResult, trileanResult } from "./_common";

tpl.title("Path-Path relationship");

const rs = new Relationship();

const commands = [Path.moveTo([0, 0]), Path.bezierTo([20, 20], [-10, 40], [80, 90])];

const path = new Path(commands, true);

const map: WeakMap<Path, { [uuid: string]: ViewElement[] }> = new WeakMap();

function showBezierAssets(view: View, path: Path, uuid: string) {
    const cmd = path.getCommand(uuid)! as PathBezierToCommand;
    const nextCmd = path;

    const pathAssets = map.has(path) ? map.get(path)! : map.set(path, {}).get(path)!;

    const { controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y } = cmd;

    let cp1: Point;
    let cp2: Point;
    let cp1Element: ViewElement;
    let cp2Element: ViewElement;
    if (pathAssets[uuid] !== undefined) {
        [cp1Element, cp2Element] = pathAssets[uuid];
        cp1 = cp1Element.shape as Point;
        cp2 = cp2Element.shape as Point;
        cp1.x = controlPoint1X;
        cp1.y = controlPoint1Y;
        cp2.x = controlPoint2X;
        cp2.y = controlPoint2Y;
    } else {
        cp1 = new Point(controlPoint1X, controlPoint1Y);
        cp2 = new Point(controlPoint2X, controlPoint2Y);
        cp1Element = new ViewElement(cp1, { interactable: true });
        cp2Element = new ViewElement(cp2, { interactable: true });
        pathCpElements[uuid] = [cp1Element, cp2Element];
    }

    cp1.on("x|y", function () {
        cmd.controlPoint1X = this.x;
        cmd.controlPoint1Y = this.y;
        path.setCommand(uuid, cmd);
    });
    cp2.on("x|y", function () {
        cmd.controlPoint2X = this.x;
        cmd.controlPoint2Y = this.y;
        path.setCommand(uuid, cmd);
    });
    view.add(cp1Element);
    view.add(cp2Element);
}
function hideBezierControlPoints(view: View, path: Path, uuid: string) {
    if (!map.has(path)) return;
    const pathCpElements = map.get(path)!;
    const [cp1Element, cp2Element] = pathCpElements[uuid];
    const cp1 = cp1Element.shape as Point;
    const cp2 = cp1Element.shape as Point;
    cp1.clear();
    cp2.clear();
    view.remove(cp1Element);
    view.remove(cp2Element);
}

tpl.addSection("Try");
const card = tpl.addCard({ canvasId: Utility.uuid() });

const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 1, yAxisPositiveOnBottom: false }));
view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
view.startInteractive();
view.add(new ViewElement(path, { interactable: false }));

showBezierControlPoints(view, path, path.getUuidOfIndex(1));

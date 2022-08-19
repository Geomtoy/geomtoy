import tpl from "../assets/templates/multiple-canvas-renderer";
import { CanvasRenderer, Style, View, ViewElement, ViewGroupElement } from "@geomtoy/view";
import { Bezier, EventObject, Geometry, LineSegment, Point, QuadraticBezier, ShapeArray, Trilean } from "@geomtoy/core";
import { Coordinates, Utility } from "@geomtoy/util";
import { stroke } from "../assets/common";

export function samePointsOffset(epsilon: number) {
    const ret = {
        samePoints: [] as [Point, number][],
        check(point: Point) {
            const offset = 0.5;
            const samePoints = ret.samePoints;
            const index = samePoints.findIndex(([p]) => Coordinates.isEqualTo(p.coordinates, point.coordinates, epsilon));
            if (index === -1) {
                samePoints.push([point, 0]);
            } else {
                const theOffset = ++samePoints[index][1] * offset;
                point.move(theOffset, -theOffset);
            }
        },
        clear() {
            ret.samePoints = [];
        }
    };
    return ret;
}
export function trileanResult(card: ReturnType<typeof tpl.addCard>, g1: Geometry, g2: Geometry, result: Trilean) {
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 1, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    view.add(new ViewElement(g1, { interactable: false, ...stroke("red") }));
    view.add(new ViewElement(g2, { interactable: false, ...stroke("blue") }));
    card.setDescription("Result: " + result?.toString() ?? "undefined");
    return view;
}
export function arrayResult(card: ReturnType<typeof tpl.addCard>, g1: Geometry, g2: Geometry, result: Geometry[]) {
    const view = new View({}, new CanvasRenderer(card.canvas, {}, { density: 10, zoom: 1, yAxisPositiveOnBottom: false }));
    view.startResponsive((width, height) => (view.renderer.display.origin = [width / 2, height / 2]));
    view.startInteractive();
    const shapeArray = new ShapeArray(result);
    view.add(new ViewGroupElement(shapeArray.shapes, { interactable: false, ...stroke("purple") }));
    view.add(new ViewElement(g1, { interactable: false, ...stroke("red") }));
    view.add(new ViewElement(g2, { interactable: false, ...stroke("blue") }));

    const content = `Result: <button class="btn btn-outline-primary btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${card.canvasId}">
        View
    </button>
    <div class="collapse" id="collapse-${card.canvasId}"> 
        ${shapeArray.shapes.map(p => `<p><pre>${p.toString()}</pre></p>`).join("")} 
    </div>
    `;
    card.setDescription(content);
    // @ts-ignore
    new bootstrap.Collapse(document.querySelector(`#collapse-${card.canvasId}`), { toggle: false });
    return view;
}

function lineSegmentCtor(this: LineSegment, [e1, e2]: [EventObject<Point>, EventObject<Point>]) {
    this.copyFrom(new LineSegment(e1.target, e2.target));
}
function bezierCtor(this: Bezier, [e1, e2, e3, e4]: [EventObject<Point>, EventObject<Point>, EventObject<Point>, EventObject<Point>]) {
    this.copyFrom(new Bezier(e1.target, e2.target, e3.target, e4.target));
}
function quadraticBezierCtor(this: QuadraticBezier, [e1, e2, e3]: [EventObject<Point>, EventObject<Point>, EventObject<Point>]) {
    this.copyFrom(new QuadraticBezier(e1.target, e2.target, e3.target));
}

export function quadraticBezierViewBundle(
    curveStyle: { style: Partial<Style>; hoverStyle: Partial<Style>; activeStyle: Partial<Style> },
    endpointStyle: { style: Partial<Style>; hoverStyle: Partial<Style>; activeStyle: Partial<Style> },
    controlPointStyle: { style: Partial<Style>; hoverStyle: Partial<Style>; activeStyle: Partial<Style> },
    controlSegmentStyle: { style: Partial<Style>; hoverStyle: Partial<Style>; activeStyle: Partial<Style> }
) {
    const points = Utility.range(0, 3).map(_ => Point.random([-20, -20, 40, 40]));
    // prettier-ignore
    const quadraticBezier = new QuadraticBezier().bind(
        points.map(point => [point, "any"]) as [[Point, string], [Point, string], [Point, string]],
        quadraticBezierCtor
    );
    const controlSegment1 = new LineSegment().bind(
        [
            [points[0], "any"],
            [points[2], "any"]
        ],
        lineSegmentCtor
    );
    const controlSegment2 = new LineSegment().bind(
        [
            [points[1], "any"],
            [points[2], "any"]
        ],
        lineSegmentCtor
    );

    return {
        quadraticBezier: new ViewElement(quadraticBezier, { interactable: false, ...curveStyle }),
        point1: new ViewElement(points[0], { interactable: true, ...endpointStyle }),
        point2: new ViewElement(points[1], { interactable: true, ...endpointStyle }),
        controlPoint: new ViewElement(points[2], { interactable: true, ...controlPointStyle }),
        controlSegment1: new ViewElement(controlSegment1, { interactable: false, ...controlSegmentStyle }),
        controlSegment2: new ViewElement(controlSegment2, { interactable: false, ...controlSegmentStyle })
    };
}

export function bezierViewBundle(
    curveStyle: { style: Partial<Style>; hoverStyle: Partial<Style>; activeStyle: Partial<Style> },
    endpointStyle: { style: Partial<Style>; hoverStyle: Partial<Style>; activeStyle: Partial<Style> },
    controlPointStyle: { style: Partial<Style>; hoverStyle: Partial<Style>; activeStyle: Partial<Style> },
    controlSegmentStyle: { style: Partial<Style>; hoverStyle: Partial<Style>; activeStyle: Partial<Style> }
) {
    const points = Utility.range(0, 4).map(_ => Point.random([-20, -20, 40, 40]));
    const bezier = new Bezier().bind(points.map(point => [point, "any"]) as [[Point, string], [Point, string], [Point, string], [Point, string]], bezierCtor);
    const controlSegment1 = new LineSegment().bind(
        [
            [points[0], "any"],
            [points[2], "any"]
        ],
        lineSegmentCtor
    );
    const controlSegment2 = new LineSegment().bind(
        [
            [points[1], "any"],
            [points[3], "any"]
        ],
        lineSegmentCtor
    );
    const controlSegment3 = new LineSegment().bind(
        [
            [points[2], "any"],
            [points[3], "any"]
        ],
        lineSegmentCtor
    );

    return {
        bezier: new ViewElement(bezier, { interactable: false, ...curveStyle }),
        point1: new ViewElement(points[0], { interactable: true, ...endpointStyle }),
        point2: new ViewElement(points[1], { interactable: true, ...endpointStyle }),
        controlPoint1: new ViewElement(points[2], { interactable: true, ...controlPointStyle }),
        controlPoint2: new ViewElement(points[3], { interactable: true, ...controlPointStyle }),
        controlSegment1: new ViewElement(controlSegment1, { interactable: false, ...controlSegmentStyle }),
        controlSegment2: new ViewElement(controlSegment2, { interactable: false, ...controlSegmentStyle }),
        controlSegment3: new ViewElement(controlSegment3, { interactable: false, ...controlSegmentStyle })
    };
}

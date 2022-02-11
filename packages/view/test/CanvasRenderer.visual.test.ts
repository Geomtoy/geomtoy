import { canvasSetup, canvasTeardown } from "./util";
import { visualTestSize, diffPixelData } from "./util/visual";
import Geomtoy from "@geomtoy/core";
import { Maths } from "@geomtoy/util";
import CanvasRenderer from "../src/renderer/CanvasRenderer";

const expect = chai.expect;

describe("CanvasRenderer visual", () => {
    let canvasTestElement: HTMLCanvasElement;
    let canvasNativeElement: HTMLCanvasElement;
    let cr: CanvasRenderer;
    const g = new Geomtoy();

    before(() => {
        [canvasTestElement, canvasNativeElement] = canvasSetup(true);
        cr = new CanvasRenderer(canvasTestElement, g, { showAxis: false, showGrid: false, showLabel: false });
        cr.display.width = visualTestSize.width;
        cr.display.height = visualTestSize.height;
        cr.display.xAxisPositiveOnRight = true;
        cr.display.yAxisPositiveOnBottom = true;

        canvasNativeElement.setAttribute("width", `${visualTestSize.width}`);
        canvasNativeElement.setAttribute("height", `${visualTestSize.height}`);
    });
    after(() => {
        canvasTeardown(true);
    });

    beforeEach(() => {
        canvasNativeElement.getContext("2d")!.clearRect(0, 0, visualTestSize.width, visualTestSize.height);
    });

    it("visual-1", async () => {
        const visual1Url = "http://localhost:9876/base/test/visual/visual-1.png";
        const circle = g.Circle(visualTestSize.width / 2, visualTestSize.height / 2, 10);
        cr.stroke("black");
        cr.fill("transparent");
        cr.draw(circle);
        await diffPixelData(visual1Url, cr.container, [visualTestSize.width, visualTestSize.height]);
    });

    it("visual-2", async () => {
        const visual1Url = "http://localhost:9876/base/test/visual/visual-2.png";
        const triangle = g.Triangle(0, 0, 25, 100, 80, 90);

        cr.stroke("red");
        cr.strokeWidth(2);
        cr.fill("rgba(255,0,0,0.5");
        cr.draw(triangle);

        await diffPixelData(visual1Url, cr.container, [visualTestSize.width, visualTestSize.height]);
    });

    it("line segment", async () => {
        cr.stroke("red");
        cr.strokeWidth(1);
        cr.fill("transparent");
        cr.draw(g.LineSegment([0, 0], [200, 200]));

        const ctx = canvasNativeElement.getContext("2d")!;
        const path2D = new Path2D();
        ctx.strokeStyle = "red";
        ctx.fillStyle = "transparent";
        ctx.lineWidth = 1;
        path2D.moveTo(0, 0);
        path2D.lineTo(200, 200);
        ctx.stroke(path2D);
        ctx.fill(path2D);

        await diffPixelData(cr.container, canvasNativeElement, [visualTestSize.width, visualTestSize.height]);
    });

    it("quadratic bezier", async () => {
        cr.stroke("blue");
        cr.strokeWidth(1);
        cr.fill("transparent");
        cr.draw(g.QuadraticBezier([100, 100], [200, 200], [150, 150]));

        const ctx = canvasNativeElement.getContext("2d")!;
        const path2D = new Path2D();
        ctx.strokeStyle = "blue";
        ctx.fillStyle = "transparent";
        ctx.lineWidth = 1;
        path2D.moveTo(100, 100);
        path2D.quadraticCurveTo(150, 150, 200, 200);
        ctx.stroke(path2D);
        ctx.fill(path2D);

        await diffPixelData(cr.container, canvasNativeElement, [visualTestSize.width, visualTestSize.height]);
    });

    it("cubic bezier", async () => {
        cr.stroke("green");
        cr.strokeWidth(1);
        cr.fill("transparent");
        cr.draw(g.Bezier([100, 100], [400, 300], [150, 150], [300, 300]));

        const ctx = canvasNativeElement.getContext("2d")!;
        const path2D = new Path2D();
        ctx.strokeStyle = "green";
        ctx.fillStyle = "transparent";
        ctx.lineWidth = 1;
        path2D.moveTo(100, 100);
        path2D.bezierCurveTo(150, 150, 300, 300, 400, 300);
        ctx.stroke(path2D);
        ctx.fill(path2D);

        await diffPixelData(cr.container, canvasNativeElement, [visualTestSize.width, visualTestSize.height]);
    });

    it("arc-center parameterization", async () => {
        cr.stroke("red");
        cr.strokeWidth(1);
        cr.fill("transparent");
        cr.draw(g.Arc([250, 200], 25, 50, 0.5 * Math.PI, 1 * Math.PI, true, Maths.PI / 3));

        const ctx = canvasNativeElement.getContext("2d")!;
        const path2D = new Path2D();
        ctx.strokeStyle = "red";
        ctx.fillStyle = "transparent";
        ctx.lineWidth = 1;
        path2D.ellipse(250, 200, 25, 50, Maths.PI / 3, 0.5 * Math.PI, 1 * Math.PI, false);
        ctx.stroke(path2D);
        ctx.fill(path2D);

        await diffPixelData(cr.container, canvasNativeElement, [visualTestSize.width, visualTestSize.height]);
    });

    it("arc-center parameterization full arc", async () => {
        cr.stroke("red");
        cr.strokeWidth(1);
        cr.fill("transparent");
        cr.draw(g.Arc([100, 200], 30, 50, 0, 2 * Math.PI, true, 0));

        const ctx = canvasNativeElement.getContext("2d")!;
        const path2D = new Path2D();
        ctx.strokeStyle = "red";
        ctx.fillStyle = "transparent";
        ctx.lineWidth = 1;
        path2D.ellipse(100, 200, 30, 50, 0, 0, 2 * Math.PI, false);
        ctx.stroke(path2D);
        ctx.fill(path2D);

        await diffPixelData(cr.container, canvasNativeElement, [visualTestSize.width, visualTestSize.height]);
    });
});

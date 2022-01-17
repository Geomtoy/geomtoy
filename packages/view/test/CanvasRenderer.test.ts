import { canvasSetup, canvasTeardown } from "./util";
import { visualTestSize, diffPixelData } from "./util/visual";
import Geomtoy from "@geomtoy/core";
import CanvasRenderer from "../src/renderer/CanvasRenderer";

const expect = chai.expect;

describe("CanvasRenderer", () => {
    let canvasElement: HTMLCanvasElement;
    let sr: CanvasRenderer;
    const g = new Geomtoy();

    before(() => {
        canvasElement = canvasSetup();
        sr = new CanvasRenderer(canvasElement, g, { showAxis: false, showGrid: false, showLabel: false });
    });
    after(() => {
        // canvasTeardown();
    });

    it("constructor", () => {
        expect(sr).to.be.an.instanceOf(CanvasRenderer);
        expect(sr.container).to.be.equal(canvasElement);
    });
    it("display", () => {
        sr.display.width = visualTestSize.width;
        sr.display.height = visualTestSize.height;
        expect(canvasElement.getAttribute("width")).to.be.equal(`${visualTestSize.width}`);
        expect(canvasElement.getAttribute("height")).to.be.equal(`${visualTestSize.height}`);
    });

    it("visual-1", async () => {
        const visual1Url = "http://localhost:9876/base/test/visual/visual-1.png";
        const circle = g.Circle(visualTestSize.width / 2, visualTestSize.height / 2, 10);
        sr.stroke("black");
        sr.fill("transparent");
        sr.draw(circle);
        await diffPixelData(visual1Url, canvasElement, [visualTestSize.width, visualTestSize.height]);
    });

    it("visual-2", async () => {
        const visual1Url = "http://localhost:9876/base/test/visual/visual-2.png";
        const triangle = g.Triangle(0, 0, 25, 100, 80, 90);

        sr.stroke("red");
        sr.strokeWidth(2);
        sr.fill("rgba(255,0,0,0.5");
        sr.draw(triangle);

        await diffPixelData(visual1Url, canvasElement, [visualTestSize.width, visualTestSize.height]);
    });
});

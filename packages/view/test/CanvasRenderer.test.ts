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
});

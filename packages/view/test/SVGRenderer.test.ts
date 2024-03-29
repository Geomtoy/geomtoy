import { Circle, Triangle } from "@geomtoy/core";
import SVGRenderer from "../src/renderer/SVGRenderer";
import { svgSetup, svgTeardown } from "./util";
import { diffPixelData, visualTestSize } from "./util/visual";

const expect = chai.expect;

describe("SVGRenderer", () => {
    let svgElement: SVGSVGElement;
    let sr: SVGRenderer;

    before(() => {
        svgElement = svgSetup();
        sr = new SVGRenderer(svgElement, { showAxis: false, showGrid: false, showLabel: false });
    });
    after(() => {
        svgTeardown();
    });

    it("constructor", () => {
        expect(sr).to.be.an.instanceOf(SVGRenderer);
        expect(sr.container).to.be.equal(svgElement);
    });
    it("display", () => {
        sr.display.width = visualTestSize.width;
        sr.display.height = visualTestSize.height;
        expect(svgElement.getAttribute("width")).to.be.equal(`${visualTestSize.width}`);
        expect(svgElement.getAttribute("height")).to.be.equal(`${visualTestSize.height}`);
    });

    it("visual-1", async () => {
        const visual1Url = "http://localhost:9876/base/test/visual/visual-1.png";
        const circle = new Circle(visualTestSize.width / 2, visualTestSize.height / 2, 10);
        sr.stroke("black");
        sr.fill("transparent");
        sr.draw(circle);
        await diffPixelData(visual1Url, svgElement, [visualTestSize.width, visualTestSize.height]);
    });

    it("visual-2", async () => {
        const visual1Url = "http://localhost:9876/base/test/visual/visual-2.png";
        const triangle = new Triangle(0, 0, 25, 100, 80, 90);

        sr.stroke("red");
        sr.fill("rgba(255,0,0,0.5)");
        sr.draw(triangle);

        await diffPixelData(visual1Url, svgElement, [visualTestSize.width, visualTestSize.height]);
    });
});

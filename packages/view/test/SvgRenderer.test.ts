import { svgSetup, svgTeardown } from "./util";
import { visualTestSize, diffPixelData } from "./util/visual";
import Geomtoy from "@geomtoy/core";
import SvgRenderer from "../src/renderer/SvgRenderer";

const expect = chai.expect;

describe("SvgRenderer", () => {
    let svgElement: SVGSVGElement;
    let sr: SvgRenderer;
    const g = new Geomtoy();

    before(() => {
        svgElement = svgSetup();
        sr = new SvgRenderer(svgElement, g, { showAxis: false, showGrid: false, showLabel: false });
    });
    after(() => {
        // svgTeardown();
    });

    it("constructor", () => {
        expect(sr).to.be.an.instanceOf(SvgRenderer);
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
        const circle = g.Circle(visualTestSize.width / 2, visualTestSize.height / 2, 10);
        sr.stroke("black");
        sr.fill("transparent");
        sr.draw(circle);
        await diffPixelData(visual1Url, svgElement, [visualTestSize.width, visualTestSize.height]);
    });

    it("visual-2", async () => {
        const visual1Url = "http://localhost:9876/base/test/visual/visual-2.png";
        const triangle = g.Triangle(0, 0, 25, 100, 80, 90);

        sr.stroke("red");
        sr.fill("rgba(255,0,0,0.5)");
        sr.draw(triangle);

        await diffPixelData(visual1Url, svgElement, [visualTestSize.width, visualTestSize.height]);
    });
});

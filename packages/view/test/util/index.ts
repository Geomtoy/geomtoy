const testSvgId = "testSvg";
const testCanvasId = "testCanvas";

export function svgSetup() {
    if (document.body.querySelector(`svg#${testSvgId}`) !== null) {
        throw new Error(`The svg element id=\`${testSvgId}\` is already existed.`);
    }
    document.body.insertAdjacentHTML("beforeend", `<svg id="${testSvgId}"></svg>`);
    return document.body.querySelector(`svg#${testSvgId}`) as SVGSVGElement;
}
export function svgTeardown() {
    document.body.querySelector(`svg#${testSvgId}`)?.remove();
}

export function canvasSetup() {
    if (document.body.querySelector(`canvas#${testCanvasId}`) !== null) {
        throw new Error(`The canvas element id=\`${testCanvasId}\` is already existed.`);
    }
    document.body.insertAdjacentHTML("beforeend", `<canvas id="${testCanvasId}"></canvas>`);
    return document.body.querySelector(`canvas#${testCanvasId}`) as HTMLCanvasElement;
}

export function canvasTeardown() {
    document.body.querySelector(`#${testCanvasId}`)?.remove();
}

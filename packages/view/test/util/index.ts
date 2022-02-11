const nativeSvgId = "nativeSvg";
const testSvgId = "testSvg";
const nativeCanvasId = "nativeCanvas";
const testCanvasId = "testCanvas";

const body = document.body;
const assertNotExisted = (id: string) => {
    if (body.querySelector(`#${id}`) !== null) throw new Error(`The element id=\`${id}\` is already existed.`);
};
const add = <E extends { canvas: HTMLCanvasElement; svg: SVGSVGElement }, T extends "canvas" | "svg">(type: T, id: string): E[T] => {
    body.insertAdjacentHTML("beforeend", `<${type} id="${id}"></${type}>`);
    return body.querySelector<E[T]>(`${type}#${id}`)!;
};
const remove = (id: string) => {
    body.querySelector(`#${id}`)?.remove();
};

function svgSetup(withNative: true): [SVGSVGElement, SVGSVGElement];
function svgSetup(withNative?: false): SVGSVGElement;
function svgSetup(withNative = false) {
    assertNotExisted(testSvgId);
    withNative && assertNotExisted(nativeSvgId);
    return withNative ? ([add("svg", testSvgId), add("svg", nativeSvgId)] as [SVGSVGElement, SVGSVGElement]) : add("svg", testSvgId);
}

export { svgSetup };

export function svgTeardown(withNative = false) {
    remove(testSvgId);
    withNative && remove(nativeSvgId);
}

function canvasSetup(withNative: true): [HTMLCanvasElement, HTMLCanvasElement];
function canvasSetup(withNative?: false): HTMLCanvasElement;
function canvasSetup(withNative = false) {
    assertNotExisted(testCanvasId);
    withNative && assertNotExisted(nativeCanvasId);
    return withNative ? ([add("canvas", testCanvasId), add("canvas", nativeCanvasId)] as [HTMLCanvasElement, HTMLCanvasElement]) : add("canvas", testCanvasId);
}
export { canvasSetup };

export function canvasTeardown(withNative = false) {
    remove(testCanvasId);
    withNative && remove(nativeCanvasId);
}

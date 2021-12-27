import type { Renderer } from "../../../src/geomtoy-kit/types";

export function setDescription(text: string) {
    const description = document.querySelector("#description") as HTMLElement;
    description.innerHTML = text;
}

export function initRenderer(useSwitch: boolean = true) {
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    const svg = document.querySelector("#svg") as SVGSVGElement;
    const switchDiv = document.querySelector("#switch") as HTMLDivElement;
    !useSwitch && (switchDiv.style.display = "none");
    return [canvas, svg] as [HTMLCanvasElement, SVGSVGElement];
}

export function switchRenderer(rendererList: { [key: string]: Renderer }, defaultType: "svg" | "canvas" = "canvas", callback: (...args: any[]) => void) {
    showRenderer(defaultType);
    function showRenderer(type: "svg" | "canvas") {
        Object.keys(rendererList).forEach(t => {
            rendererList[t].container.style.display = "none";
        });
        rendererList[type].container.style.display = "block";
        callback(type);
    }
}

import type Renderer from "../../../src/geomtoy-kit/renderer/Renderer";

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

export function switchRenderer(rendererList: { "svg": Renderer ,"canvas":Renderer}, defaultType: "svg" | "canvas" = "canvas", callback: (renderer:Renderer) => void) {
    const form = document.forms["rendererSwitch" as any] as HTMLFormElement;
    form.addEventListener("change", e => showRenderer((e.target as HTMLInputElement).value as "svg" | "canvas"));

    (form.renderer as RadioNodeList).value = defaultType;
    showRenderer(defaultType);

    function showRenderer(type: "svg" | "canvas") {
        Object.keys(rendererList).forEach((t: keyof typeof rendererList) => {
            rendererList[t].container.style.display = "none";
        });
        rendererList[type].container.style.display = "block";
        callback(rendererList[type]);
    }
}

import html from "./full-dual-renderer.html";

import type { Renderer } from "@geomtoy/view";

document.body.innerHTML = html();

export default {
    setDescription(text: string) {
        const description = document.querySelector<HTMLElement>("#description")!;
        description.innerHTML = text;
    },
    initRenderer(useSwitch: boolean = true) {
        const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
        const svg = document.querySelector<SVGSVGElement>("#svg")!;
        const switchDiv = document.querySelector<HTMLDivElement>("#switch")!;
        !useSwitch && (switchDiv.style.display = "none");
        return [canvas, svg] as const;
    },
    switchRenderer(rendererList: { svg: Renderer; canvas: Renderer }, defaultType: "svg" | "canvas" = "canvas", callback: (renderer: Renderer) => void) {
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
};

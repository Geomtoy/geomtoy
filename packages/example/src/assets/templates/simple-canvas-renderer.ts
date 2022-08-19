import html from "./simple-canvas-renderer.html";

document.body.innerHTML = html();

export default {
    setDescription(text: string) {
        const description = document.querySelector<HTMLElement>("#description")!;
        description.innerHTML = text;
    },
    getCanvas() {
        return document.querySelector<HTMLCanvasElement>("#canvas")!;
    }
};

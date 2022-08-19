import html from "./simple-svg-renderer.html";

document.body.innerHTML = html();

export default {
    setDescription(text: string) {
        const description = document.querySelector<HTMLElement>("#description")!;
        description.innerHTML = text;
    },
    getSvg() {
        return document.querySelector<SVGSVGElement>("#svg")!;
    }
};

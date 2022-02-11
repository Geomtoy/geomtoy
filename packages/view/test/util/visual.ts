import { toPixelData } from "html-to-image";
import pixelMatch from "pixelmatch";

const expect = chai.expect;

export const visualTestSize = {
    width: 500,
    height: 400
};

function loadImagePixelData(imageUrl: string) {
    const image = new Image();
    return new Promise<Uint8ClampedArray>((resolve, reject) => {
        image.onload = () => {
            const ctx = document.createElement("canvas").getContext("2d")!;
            const { width: w, height: h } = image;
            ctx.canvas.width = w;
            ctx.canvas.height = h;
            ctx.drawImage(image, 0, 0);
            resolve(ctx.getImageData(0, 0, w, h).data);
        };
        image.onerror = () => {
            reject();
        };
        image.src = imageUrl;
    });
}

export async function diffPixelData(sourceA: string | SVGSVGElement | HTMLCanvasElement, sourceB: string | SVGSVGElement | HTMLCanvasElement, [width, height]: [number, number]) {
    const pA = sourceA instanceof SVGSVGElement || sourceA instanceof HTMLCanvasElement ? toPixelData(sourceA as unknown as HTMLElement) : loadImagePixelData(sourceA);
    const pB = sourceB instanceof SVGSVGElement || sourceB instanceof HTMLCanvasElement ? toPixelData(sourceB as unknown as HTMLElement) : loadImagePixelData(sourceB);
    await Promise.all([pA, pB]).then(([a, b]) => {
        const diffPixelCount = pixelMatch(a, b, null, width, height);
        expect(diffPixelCount).to.be.equal(0);
    });
}

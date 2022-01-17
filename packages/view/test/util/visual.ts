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

export async function diffPixelData(originImageUrl: string, currentSvgOrCanvas: SVGSVGElement | HTMLCanvasElement, [width, height]: [number, number]) {
    await Promise.all([loadImagePixelData(originImageUrl), toPixelData(currentSvgOrCanvas as unknown as HTMLElement)]).then(([origin, current]) => {
        const diffPixelCount = pixelMatch(origin, current, null, width, height);
        expect(diffPixelCount).to.be.equal(0);
    });
}

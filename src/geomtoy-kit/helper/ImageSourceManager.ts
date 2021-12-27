import math from "../../geomtoy/utility/math";
import { ImageSourceStatus } from "../types";

export default class ImageSourceManager {
    private _cache: { [key: string]: { image: SVGImageElement | null; status: ImageSourceStatus } } = {};

    private _placeholderCanvas = document.createElement("canvas");
    private _placeholderDocumentFragment = document.createDocumentFragment();

    placeholderForCanvas(width: number, height: number, backgroundColor: string = "rgba(0, 0, 0, 0.3)", color: string = "rgba(0, 0, 0, 0.5)") {
        this._placeholderCanvas.width = width;
        this._placeholderCanvas.height = height;
        const ctx = this._placeholderCanvas.getContext("2d")!;
        const size = math.min(width, height) / 3;
        const boxSize = size / 5;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = color;
        const startX = (width - size) / 2;
        const startY = (height - size) / 2;

        ctx.fillRect(startX + boxSize, startY, boxSize * 3, boxSize);
        ctx.fillRect(startX, startY + boxSize, boxSize, boxSize * 3);
        ctx.fillRect(startX + boxSize, startY + boxSize * 4, boxSize * 3, boxSize);
        ctx.fillRect(startX + boxSize * 4, startY + boxSize * 2, boxSize, boxSize * 2);
        ctx.fillRect(startX + boxSize * 2, startY + boxSize * 2, boxSize, boxSize);

        return this._placeholderCanvas;
    }

    placeholderForSvg(width: number, height: number, backgroundColor: string = "rgba(0, 0, 0, 0.3)", color: string = "rgba(0, 0, 0, 0.5)") {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;
        svg.setAttribute("width", `${width}`);
        svg.setAttribute("height", `${height}`);

        const size = math.min(width, height) / 3;
        const boxSize = size / 5;

        const startX = (width - size) / 2;
        const startY = (height - size) / 2;

        svg.insertAdjacentHTML(
            "afterbegin",
            `
            <rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}" />
            <rect x="${startX + boxSize}" y="${startY}" width="${boxSize * 3}" height="${boxSize}" fill="${color}"/>
            <rect x="${startX}" y="${startY + boxSize}" width="${boxSize}" height="${boxSize * 3}" fill="${color}"/>
            <rect x="${startX + boxSize}" y="${startY + boxSize * 4}" width="${boxSize * 3}" height="${boxSize}" fill="${color}"/>
            <rect x="${startX + boxSize * 4}" y="${startY + boxSize * 2}" width="${boxSize}" height="${boxSize * 2}" fill="${color}"/>
            <rect x="${startX + boxSize * 2}" y="${startY + boxSize * 2}" width="${boxSize}" height="${boxSize}" fill="${color}"/>
            `
        );
        this._placeholderDocumentFragment.append(svg);
        return this._placeholderDocumentFragment;
    }

    private _keyOf(urlOrFile: string | File) {
        return urlOrFile instanceof File ? urlOrFile.name + urlOrFile.lastModified : urlOrFile;
    }

    successful(urlOrFile: string | File) {
        return this._cache[this._keyOf(urlOrFile)]?.status === ImageSourceStatus.Successful;
    }
    failed(urlOrFile: string | File) {
        return this._cache[this._keyOf(urlOrFile)]?.status === ImageSourceStatus.Failed;
    }
    notLoaded(urlOrFile: string | File) {
        return this._cache[this._keyOf(urlOrFile)] === undefined  
    }
    loading(urlOrFile: string | File) {
        return this._cache[this._keyOf(urlOrFile)]?.status === ImageSourceStatus.Loading;
    }

    take(urlOrFile: string | File) {
        return this._cache[this._keyOf(urlOrFile)].image;
    }

    async load(urlOrFile: string | File) {
        const key = this._keyOf(urlOrFile);

        if (this._cache[key] === undefined) {
            this._cache[key] = { image: null, status: ImageSourceStatus.Loading };
        }

        if (this._cache[key].status === ImageSourceStatus.Failed || this._cache[key].status === ImageSourceStatus.Successful) {
            return Promise.reject();
        }

        return new Promise<void>((resolve, reject) => {
            const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
            if (urlOrFile instanceof File) {
                const url = URL.createObjectURL(urlOrFile);

                image.onload = () => {
                    URL.revokeObjectURL(url);
                    this._cache[key].image = image;
                    this._cache[key].status = ImageSourceStatus.Successful
                    resolve();
                };
                image.onerror = () => {
                    console.warn("[G]Failed to load image from the `file`.");
                    this._cache[key].status = ImageSourceStatus.Failed
                    reject();
                };
                image.setAttribute("href", url);
            } else {
                image.setAttribute("crossorigin", "anonymous");
                image.onload = () => {
                    this._cache[key].image = image;
                    this._cache[key].status = ImageSourceStatus.Successful
                    resolve();
                };
                image.onerror = () => {
                    console.warn("[G]Failed to request image from  the `url`.");
                    this._cache[key].status = ImageSourceStatus.Failed
                    reject();
                };
                image.setAttribute("href", urlOrFile);
            }
        });
    }
}

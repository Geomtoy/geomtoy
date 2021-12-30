import { ImageSourceStatus } from "../types";

export default class ImageSourceManager {
    private _cache: { [key: string]: { image: SVGImageElement | null; status: ImageSourceStatus } } = {};

    private _placeholderCanvas = document.createElement("canvas");
    private _placeholderSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    placeholderForCanvas(width: number, height: number, backgroundColor: string = "rgba(0, 0, 0, 0.3)", color: string = "rgba(0, 0, 0, 0.5)") {
        this._placeholderCanvas.width = width;
        this._placeholderCanvas.height = height;
        const context = this._placeholderCanvas.getContext("2d")!;
        const size = (width < height ? width : height) / 3;
        const boxSize = size / 5;

        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, width, height);

        context.fillStyle = color;
        const startX = (width - size) / 2;
        const startY = (height - size) / 2;

        context.fillRect(startX + boxSize, startY, boxSize * 3, boxSize);
        context.fillRect(startX, startY + boxSize, boxSize, boxSize * 3);
        context.fillRect(startX + boxSize, startY + boxSize * 4, boxSize * 3, boxSize);
        context.fillRect(startX + boxSize * 4, startY + boxSize * 2, boxSize, boxSize * 2);
        context.fillRect(startX + boxSize * 2, startY + boxSize * 2, boxSize, boxSize);

        return this._placeholderCanvas;
    }

    placeholderForSvg(width: number, height: number, backgroundColor: string = "rgba(0, 0, 0, 0.3)", color: string = "rgba(0, 0, 0, 0.5)") {
        const svg = this._placeholderSvg.cloneNode() as SVGSVGElement;
        svg.setAttribute("width", `${width}`);
        svg.setAttribute("height", `${height}`);

        const size = (width < height ? width : height) / 3;
        const boxSize = size / 5;

        const startX = (width - size) / 2;
        const startY = (height - size) / 2;

        svg.innerHTML = `
            <rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}" />
            <rect x="${startX + boxSize}" y="${startY}" width="${boxSize * 3}" height="${boxSize}" fill="${color}"/>
            <rect x="${startX}" y="${startY + boxSize}" width="${boxSize}" height="${boxSize * 3}" fill="${color}"/>
            <rect x="${startX + boxSize}" y="${startY + boxSize * 4}" width="${boxSize * 3}" height="${boxSize}" fill="${color}"/>
            <rect x="${startX + boxSize * 4}" y="${startY + boxSize * 2}" width="${boxSize}" height="${boxSize * 2}" fill="${color}"/>
            <rect x="${startX + boxSize * 2}" y="${startY + boxSize * 2}" width="${boxSize}" height="${boxSize}" fill="${color}"/>
            `;
        return svg;
    }

    successful(url: string) {
        return this._cache[url]?.status === ImageSourceStatus.Successful;
    }
    failed(url: string) {
        return this._cache[url]?.status === ImageSourceStatus.Failed;
    }
    notLoaded(url: string) {
        return this._cache[url] === undefined;
    }
    loading(url: string) {
        return this._cache[url]?.status === ImageSourceStatus.Loading;
    }
    take(url: string) {
        return this._cache[url].image;
    }

    private _isBlobUrl(url: string) {
        return url.substring(0, 8) === `blob:http`;
    }
    private _isDataUrl(url: string) {
        return url.substring(0, 10) === `data:image/`;
    }

    async load(url: string) {
        if (this.notLoaded(url)) {
            this._cache[url] = { image: null, status: ImageSourceStatus.Loading };
        }

        if (this.failed(url) || this.successful(url)) {
            return Promise.reject();
        }

        return new Promise<void>((resolve, reject) => {
            const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
            if (!this._isBlobUrl(url) && !this._isDataUrl(url)) {
                image.setAttribute("crossorigin", "anonymous");
            }

            image.onload = () => {
                this._cache[url].image = image;
                this._cache[url].status = ImageSourceStatus.Successful;
                resolve();
            };
            image.onerror = () => {
                console.warn(`[G]Failed to request image from the url: ${url}.`);
                this._cache[url].status = ImageSourceStatus.Failed;
                reject();
            };
            image.setAttribute("href", url);
        });
    }
}

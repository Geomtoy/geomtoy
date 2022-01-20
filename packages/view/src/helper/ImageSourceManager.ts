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
        context.transform(Math.SQRT1_2, Math.SQRT1_2, -Math.SQRT1_2, Math.SQRT1_2, width / 2, (height - size * Math.SQRT2) / 2);

        const path = new Path2D(`
            M0,0V${boxSize * 5}H${boxSize * 5}V${boxSize * 2}H${boxSize * 4}V${boxSize * 4}H${boxSize}V${boxSize}H${boxSize * 5}V0Z
            M${boxSize * 2},${boxSize * 2}V${boxSize * 3}H${boxSize * 3}V${boxSize * 2}Z
        `);
        context.fill(path);
        return this._placeholderCanvas;
    }

    placeholderForSvg(width: number, height: number, backgroundColor: string = "rgba(0, 0, 0, 0.3)", color: string = "rgba(0, 0, 0, 0.5)") {
        const svg = this._placeholderSvg.cloneNode() as SVGSVGElement;
        svg.setAttribute("width", `${width}`);
        svg.setAttribute("height", `${height}`);

        const size = (width < height ? width : height) / 3;
        const boxSize = size / 5;

        svg.innerHTML = `
            <rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}"/>
            <path transform="matrix(${Math.SQRT1_2}, ${Math.SQRT1_2}, ${-Math.SQRT1_2}, ${Math.SQRT1_2}, ${width / 2}, ${(height - size * Math.SQRT2) / 2})"
                d="M0,0V${boxSize * 5}H${boxSize * 5}V${boxSize * 2}H${boxSize * 4}V${boxSize * 4}H${boxSize}V${boxSize}H${boxSize * 5}V0Z
                M${boxSize * 2},${boxSize * 2}V${boxSize * 3}H${boxSize * 3}V${boxSize * 2}Z" fill="${color}"/>  
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

import { Maths } from "@geomtoy/util";
import { ContainerElement, ImageSourceStatus } from "../types";

export default abstract class ImageSourceManager {
    private _cache: { [key: string]: { image: SVGImageElement | null; status: ImageSourceStatus } } = {};
    private _isBlobUrl(url: string) {
        return url.substring(0, 8) === `blob:http`;
    }
    private _isDataUrl(url: string) {
        return url.substring(0, 10) === `data:image/`;
    }

    abstract placeholder(width: number, height: number, backgroundColor: string, color: string): ContainerElement;

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

import { TransformationMatrix, Utility } from "@geomtoy/util";

import type { InterfaceSettings } from "../types";
import type Renderer from "./Renderer";

const INTERFACE_DEFAULTS: InterfaceSettings = {
    showAxis: true,
    axisColor: "#666666",
    showLabel: true,
    labelFillColor: "#000000",
    labelStrokeColor: "#ffffff",
    showGrid: true,
    showPrimaryGridOnly: false,
    primaryGridColor: "#d0d0d0",
    secondaryGridColor: "#f0f0f0"
};

const INTERFACE_INTERNAL_DEFAULTS = {
    onlyGridPatternGridSize: 50,
    onlyGridPatternImageSize: 100,
    axisArrowLength: 6,
    axisArrowWidth: 4,
    labelXOffset: 12,
    labelYOffset: 6,
    labelFontSize: 12,
    exponentialNotationLower: -6,
    exponentialNotationUpper: 6
} as const;

export default abstract class Interface implements InterfaceSettings {
    private _renderer: Renderer;
    // x-axis exceeded on top
    private _xEt = false;
    // x-axis exceeded on bottom
    private _xEb = false;
    // y-axis exceeded on left
    private _yEl = false;
    // y-axis exceeded on right
    private _yEr = false;
    // transformed origin x-coordinate
    private _tOx = NaN;
    // transformed origin y-coordinate
    private _tOy = NaN;
    // ratio
    private _ratio = NaN;
    // grid pattern grid size
    private _gridSize = NaN;
    // grid pattern image size
    private _imageSize = NaN;
    // transformed origin x-coordinate remainder
    private _tOxRem = NaN;
    // transformed origin y-coordinate remainder
    private _tOyRem = NaN;

    constructor(renderer: Renderer, interfaceSettings: Partial<InterfaceSettings> = {}) {
        this._renderer = renderer;
        Object.assign(this, Utility.cloneDeep(interfaceSettings));
    }

    showAxis = INTERFACE_DEFAULTS.showAxis;
    axisColor = INTERFACE_DEFAULTS.axisColor;
    showLabel = INTERFACE_DEFAULTS.showLabel;
    labelFillColor = INTERFACE_DEFAULTS.labelFillColor;
    labelStrokeColor = INTERFACE_DEFAULTS.labelStrokeColor;
    showGrid = INTERFACE_DEFAULTS.showGrid;
    showPrimaryGridOnly = INTERFACE_DEFAULTS.showPrimaryGridOnly;
    primaryGridColor = INTERFACE_DEFAULTS.primaryGridColor;
    secondaryGridColor = INTERFACE_DEFAULTS.secondaryGridColor;

    get renderer() {
        return this._renderer;
    }

    abstract create(): Promise<DocumentFragment | HTMLCanvasElement>;

    private _disassembleExponentialNotation(n: number) {
        const m = n.toExponential().match(/(?<coef>\d(.\d+)?)e(?<exp>[+-]\d+)/i);
        if (m === null) throw new Error("[G]The `zoom` is `NaN` or `Infinity`.");
        return [Number(m.groups!["coef"]), Number(m.groups!["exp"])] as [number, number];
    }
    private _ratioOf(zoom: number) {
        const [coef] = this._disassembleExponentialNotation(zoom);
        // 1,2,5 are the only three integers in [1, 10)(1-9). The result of dividing numbers 1-9 by them has at most one decimal place.
        // Since `zoom` is limited to 2 precision(significand digits), so it has only one decimal place in the coefficient, so the dividing of
        // `ratio = zoom / (1 or 2 or 5)` will at most has only two decimal places in the coefficient.
        // And the original size of the pattern image we cropped is exactly 100px, so product of `ratio * 100` will always get an integer.
        // In this way, the size of the final pattern image is always an integer.
        // But we still need to do the `toFixed(2)` here, even if it's not seem to be necessary.
        // It' a float point number world, so this must be something you should think of: 9.8/5 = 1.9600000000000002 not 1.96.
        // prettier-ignore
        return Number(
            (
                coef >= 1 && coef < 2
                ? coef / 1
                : coef >= 2 && coef < 5 
                ? coef / 2
                : coef >= 5 && coef < 10 
                ? coef / 5
                : NaN
            ).toFixed(2)
        );
    }
    private _adjustHexColorString(hexColor: string) {
        return hexColor.replace("#", "%23");
    }
    private _exactValue(n: number, precision = 14) {
        // see https://stackoverflow.com/questions/28045787/how-many-decimal-places-does-the-primitive-float-and-double-support#answer-28047413
        // 15 not working like: 1.9-1.8 = 0.09999999999999987, only 14 precision.
        return Number(n.toPrecision(precision));
    }
    private _labelValue(n: number) {
        const { exponentialNotationUpper, exponentialNotationLower } = INTERFACE_INTERNAL_DEFAULTS;
        // do `_exactValue` again
        n = this._exactValue(n);
        let [, exp] = this._disassembleExponentialNotation(n);
        if (exp > exponentialNotationUpper || exp < exponentialNotationLower) {
            return n.toExponential().replace("+", "");
        }
        return n.toString();
    }
    private _decodeImage(width: number, height: number, svgDataUrl: string) {
        // Why don't we use `onload`, because our renderer drawing is in the microtask queue,
        // and the `onload` callback is put into the macrotask queue,
        // which will cause the image of this frame to run to later.

        // The image(HTMLImageElement or SVGImageElement).decode method is executed in the microtask queue, which is why we chose `decode`.
        // But Safari never seemed to have any intention of supporting SVGImageElement's decode.
        // Fortunately, SVGImageElement can be inserted directly into <svg> without necessarily having to decode it first (Canvas is a must).
        // But the consequence of this non-decoding is that the decoding will be put into the main thread. But the impact of this should
        // be very small, after all, our pictures are very small.

        // Old Safari incompatible note:
        // Safari(<=15 tested):
        // Do not support `SVGImageElement.decode`. (still do not support now)
        // Implement `HTMLImageElement.decode` in the macrotask queue.(not on 16.1)
        // `CanvasRenderingContext2D.createPattern` can't use svg image. (do not know yet)

        if (this._renderer.container instanceof HTMLCanvasElement) {
            const image = document.createElement("img");
            image.setAttribute("width", `${width}`);
            image.setAttribute("height", `${height}`);
            image.setAttribute("src", svgDataUrl);
            return image.decode().then(() => image) as Promise<HTMLImageElement>;
        }

        if (this._renderer.container instanceof SVGSVGElement) {
            const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
            image.setAttribute("width", `${width}`);
            image.setAttribute("height", `${height}`);
            image.setAttribute("href", svgDataUrl);
            return Promise.resolve(image);
        }

        throw new Error("[G]We should never be here.");
    }

    protected prepare_() {
        const { globalTransformation, width, height, zoom } = this.renderer.display;
        const { onlyGridPatternGridSize, onlyGridPatternImageSize, labelXOffset, labelYOffset } = INTERFACE_INTERNAL_DEFAULTS;
        const [tOx, tOy] = TransformationMatrix.transformCoordinates(globalTransformation, [0, 0]);
        [this._tOx, this._tOy] = [tOx, tOy];
        this._xEt = tOy <= 0;
        this._xEb = tOy >= height - labelXOffset;
        this._yEl = tOx <= labelYOffset;
        this._yEr = tOx >= width;

        const ratio = this._ratioOf(zoom);
        this._ratio = ratio;

        const gridSize = this._exactValue(this._ratio * onlyGridPatternGridSize);
        const imageSize = this._exactValue(this._ratio * onlyGridPatternImageSize);

        this._gridSize = gridSize;
        this._imageSize = imageSize;

        const [tOxRem, tOyRem] = [tOx < 0 ? (tOx % gridSize) + gridSize : tOx % gridSize, tOy < 0 ? (tOy % gridSize) + gridSize : tOy % gridSize];
        [this._tOxRem, this._tOyRem] = [tOxRem, tOyRem];
    }
    protected labelImage_() {
        let { labelFillColor, labelStrokeColor } = this;
        labelFillColor = this._adjustHexColorString(labelFillColor);
        labelStrokeColor = this._adjustHexColorString(labelStrokeColor);

        const { labelFontSize, labelXOffset, labelYOffset } = INTERFACE_INTERNAL_DEFAULTS;
        const { _xEt: xEt, _xEb: xEb, _yEl: yEl, _yEr: yEr, _tOx: tOx, _tOy: tOy, _tOxRem: tOxRem, _tOyRem: tOyRem, _gridSize: gridSize } = this;
        const { scale, width: w, height: h, xAxisPositiveOnRight: xPr, yAxisPositiveOnBottom: yPb } = this.renderer.display;

        const [startXPosition, startYPosition] = [tOxRem, tOyRem];
        const [startXValue, startYValue] = [this._exactValue(xPr ? (tOxRem - tOx) / scale : (tOx - tOxRem) / scale), this._exactValue(yPb ? (tOyRem - tOy) / scale : (tOy - tOyRem) / scale)];

        let xAxisLabels = "";
        let yAxisLabels = "";

        for (let i = 0; i < w; i += gridSize) {
            const [x, y] = xEt ? [startXPosition + i, labelXOffset] : xEb ? [startXPosition + i, h - labelXOffset] : [startXPosition + i, tOy + labelXOffset];
            const value = xPr ? this._labelValue(startXValue + this._exactValue(i / scale)) : this._labelValue(startXValue - this._exactValue(i / scale));
            if (value === "0") continue;
            xAxisLabels += `%3Ctext x='${x}' y='${y}' text-anchor='middle'%3E${value}%3C/text%3E`;
        }

        for (let i = 0; i < h; i += gridSize) {
            const [x, y] = yEl ? [labelYOffset, startYPosition + i] : yEr ? [w - labelYOffset, startYPosition + i] : [tOx - labelYOffset, startYPosition + i];
            const value = yPb ? this._labelValue(startYValue + this._exactValue(i / scale)) : this._labelValue(startYValue - this._exactValue(i / scale));
            if (value === "0") continue;
            yAxisLabels += yEl ? `%3Ctext x='${x}' y='${y}' text-anchor='start'%3E${value}%3C/text%3E` : `%3Ctext x='${x}' y='${y}' text-anchor='end'%3E${value}%3C/text%3E`;
        }

        let originLabel = "";
        if (!xEt && !xEb && !yEl && !yEr) {
            originLabel += `%3Ctext x='${tOx - labelYOffset}' y='${tOy + labelXOffset}' text-anchor='end'%3E0%3C/text%3E`;
        }

        // prettier-ignore
        const svgDataUrl =
            `data:image/svg+xml;charset=utf8,` +
            `%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' width='${w}' height='${h}'%3E` +
            `%3Cg fill='${labelFillColor}' dominant-baseline='middle' font-size='${labelFontSize}' font-family='sans-serif' stroke='${labelStrokeColor}' stroke-width='3' paint-order='stroke'%3E`+
            originLabel +
            xAxisLabels +
            yAxisLabels +
            `%3C/g%3E`+
            `%3C/svg%3E`;

        return this._decodeImage(w, h, svgDataUrl);
    }
    protected axisImage_() {
        let { axisColor } = this;
        axisColor = this._adjustHexColorString(axisColor);

        const { axisArrowLength, axisArrowWidth } = INTERFACE_INTERNAL_DEFAULTS;
        const { _tOx: tOx, _tOy: tOy } = this;
        const { width: w, height: h, xAxisPositiveOnRight: xPr, yAxisPositiveOnBottom: yPb } = this.renderer.display;

        let xAxisD = "";
        let yAxisD = "";
        let xArrowD = "";
        let yArrowD = "";

        xAxisD = `M0,${tOy}h${w}`;
        xArrowD = xPr
            ? `M${w - axisArrowLength},${tOy - axisArrowWidth}L${w},${tOy}L${w - axisArrowLength},${tOy + axisArrowWidth}`
            : `M${axisArrowLength},${tOy - axisArrowWidth}L0,${tOy}L${axisArrowLength},${tOy + axisArrowWidth}`;

        yAxisD = `M${tOx},0v${h}`;
        yArrowD = yPb
            ? `M${tOx - axisArrowWidth},${h - axisArrowLength}L${tOx},${h}L${tOx + axisArrowWidth},${h - axisArrowLength}`
            : `M${tOx - axisArrowWidth},${axisArrowLength}L${tOx},0L${tOx + axisArrowWidth},${axisArrowLength}`;

        const svgDataUrl =
            `data:image/svg+xml;charset=utf8,` +
            `%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' width='${w}' height='${h}'%3E` +
            `%3Cpath d='${xAxisD}' vector-effect='non-scaling-stroke' shape-rendering='crispEdges' stroke='${axisColor}' stroke-width='1'/%3E` +
            `%3Cpath d='${xArrowD}' stroke='${axisColor}' fill='none' stroke-width='1'/%3E` +
            `%3Cpath d='${yAxisD}' vector-effect='non-scaling-stroke' shape-rendering='crispEdges' stroke='${axisColor}' stroke-width='1'/%3E` +
            `%3Cpath d='${yArrowD}' stroke='${axisColor}' fill='none' stroke-width='1'/%3E` +
            `%3C/svg%3E`;

        return this._decodeImage(w, h, svgDataUrl);
    }
    protected gridPatternImage_() {
        let { showPrimaryGridOnly, primaryGridColor, secondaryGridColor } = this;
        primaryGridColor = this._adjustHexColorString(primaryGridColor);
        secondaryGridColor = this._adjustHexColorString(secondaryGridColor);

        const { onlyGridPatternImageSize, onlyGridPatternGridSize } = INTERFACE_INTERNAL_DEFAULTS;
        const { _tOxRem: tOxRem, _tOyRem: tOyRem, _ratio: ratio, _imageSize: imageSize } = this;

        // viewBoxX, viewBoxY are always in the interval: [0, 50)
        const [viewBoxX, viewBoxY] = [tOxRem === 0 ? 0 : onlyGridPatternGridSize - tOxRem / ratio, tOyRem === 0 ? 0 : onlyGridPatternGridSize - tOyRem / ratio];

        const svgDataUrl =
            `data:image/svg+xml;charset=utf8,` +
            `%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBoxX} ${viewBoxY} ${onlyGridPatternImageSize} ${onlyGridPatternImageSize}' width='${imageSize}' height='${imageSize}'%3E` +
            (!showPrimaryGridOnly
                ? `%3Cpath d='M0,10h150M0,20h150M0,30h150M0,40h150M0,60h150M0,70h150M0,80h150M0,90h150M0,110h150M0,120h150M0,130h150M0,140h150M10,0v150M20,0v150M30,0v150M40,0v150M60,0v150M70,0v150M80,0v150M90,0v150M110,0v150M120,0v150M130,0v150M140,0v150'
                    vector-effect='non-scaling-stroke' shape-rendering='crispEdges'
                    id='secondaryGrid' stroke='${secondaryGridColor}' stroke-width='1'/%3E`
                : "") +
            `%3Cpath d='M0,0h150M0,50h150M0,100h150M0,0v150M50,0v150M100,0v150' 
                    vector-effect='non-scaling-stroke' shape-rendering='crispEdges' 
                    id='primaryGrid' stroke='${primaryGridColor}' stroke-width='1'/%3E` +
            `%3C/svg%3E`;

        // The `decode()` is not like `onload` event. It returns a `Promise` instead of a callback placed in the task queue.
        // It should be in the microtask queue. So the `decode()` returned `Promise` will be fulfilled before the next execution in the task queue.
        // Ps:
        // Compared with the ordinary URLs, the data URL are decoded first and then `onload` is triggered. (This may means the data URL never need to be loaded.)
        // Ordinary URL triggers `onload` first, then it gets decoded.
        return this._decodeImage(imageSize, imageSize, svgDataUrl);
    }
}

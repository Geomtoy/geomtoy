import { Maths, Assert, Coordinates, Utility, TransformationMatrix } from "@geomtoy/util";

import type Renderer from "./Renderer";
import type { ViewportDescriptor } from "@geomtoy/core";
import type { DisplaySettings } from "../types";

// 300x150 is the browser default size for both `<canvas>` and `<svg>`
const DEFAULT_CONTAINER_WIDTH = 300;
const DEFAULT_CONTAINER_HEIGHT = 150;

const DISPLAY_DEFAULTS = {
    density: 1,
    zoom: 1,
    origin: [0, 0] as [number, number],
    pan: [0, 0] as [number, number],
    xAxisPositiveOnRight: true,
    yAxisPositiveOnBottom: true
};

const DISPLAY_DEFAULT_RANGES = {
    minDensity: Maths.pow(10, -5),
    maxDensity: Maths.pow(10, 5),
    maxZoom: Maths.pow(10, 8),
    minZoom: Maths.pow(10, -8),
    maxOrigin: Maths.pow(2, 32),
    minOrigin: -Maths.pow(2, 32),
    maxPan: Maths.pow(2, 44),
    minPan: -Maths.pow(2, 44)
};

export default class Display implements ViewportDescriptor {
    private _renderer: Renderer;

    private _density = DISPLAY_DEFAULTS.density;
    private _zoom = DISPLAY_DEFAULTS.zoom;
    private _origin = DISPLAY_DEFAULTS.origin;
    private _pan = DISPLAY_DEFAULTS.pan;
    private _xAxisPositiveOnRight = DISPLAY_DEFAULTS.xAxisPositiveOnRight;
    private _yAxisPositiveOnBottom = DISPLAY_DEFAULTS.yAxisPositiveOnBottom;

    private _globalTransformation = TransformationMatrix.identity();
    private _globalViewBox = [NaN, NaN, NaN, NaN] as [number, number, number, number];

    constructor(renderer: Renderer, displaySettings: Partial<DisplaySettings> = {}) {
        this._renderer = renderer;
        Object.assign(this, Utility.cloneDeep(displaySettings));
    }

    //? What if the user set `width` or `height` with percentage? - calculate it.
    get width() {
        return Number(this._renderer.container.getAttribute("width")) || DEFAULT_CONTAINER_WIDTH;
    }
    set width(value) {
        Assert.isPositiveNumber(value, "width");
        this._renderer.container.setAttribute("width", `${value}`);
        this._refresh();
    }
    get height() {
        return Number(this._renderer.container.getAttribute("height")) || DEFAULT_CONTAINER_HEIGHT;
    }
    set height(value) {
        Assert.isPositiveNumber(value, "height");
        this._renderer.container.setAttribute("height", `${value}`);
        this._refresh();
    }
    get density() {
        return this._density;
    }
    set density(value) {
        Assert.isPositiveNumber(value, "density");
        Assert.condition(/^1e[+-]\d+$/i.test(value.toExponential()), "[G]The `density` should be a power of 10.");
        value = Maths.clamp(value, DISPLAY_DEFAULT_RANGES.minDensity, DISPLAY_DEFAULT_RANGES.maxDensity);
        this._density = value;
        this._refresh();
    }

    /**
     * The `zoom` is the scale base on `density`.
     */
    get zoom() {
        return this._zoom;
    }
    set zoom(value) {
        Assert.isPositiveNumber(value, "zoom");
        value = Maths.clamp(value, DISPLAY_DEFAULT_RANGES.minZoom, DISPLAY_DEFAULT_RANGES.maxZoom);
        // Only keep two significand digits, so after all calculations, the width and height of the grid pattern image will be integers.
        this._zoom = Number(value.toPrecision(2));
        this._refresh();
    }
    get origin(): [number, number] {
        return [...this._origin];
    }
    set origin(value) {
        Assert.isCoordinates(value, "origin");
        let [ox, oy] = value;
        ox = Maths.clamp(ox, DISPLAY_DEFAULT_RANGES.minOrigin, DISPLAY_DEFAULT_RANGES.maxOrigin);
        oy = Maths.clamp(oy, DISPLAY_DEFAULT_RANGES.minOrigin, DISPLAY_DEFAULT_RANGES.maxOrigin);
        this._origin = [ox, oy];
        this._refresh();
    }
    /**
     * The `pan` is the offset base on `origin`.
     */
    get pan(): [number, number] {
        return [...this._pan];
    }
    set pan(value) {
        Assert.isCoordinates(value, "pan");
        let [px, py] = value;
        px = Maths.clamp(px, DISPLAY_DEFAULT_RANGES.minPan, DISPLAY_DEFAULT_RANGES.maxPan);
        py = Maths.clamp(py, DISPLAY_DEFAULT_RANGES.minPan, DISPLAY_DEFAULT_RANGES.maxPan);
        this._pan = [px, py];
        this._refresh();
    }
    get xAxisPositiveOnRight() {
        return this._xAxisPositiveOnRight;
    }
    set xAxisPositiveOnRight(value) {
        this._xAxisPositiveOnRight = value;
        this._refresh();
    }
    get yAxisPositiveOnBottom() {
        return this._yAxisPositiveOnBottom;
    }
    set yAxisPositiveOnBottom(value) {
        this._yAxisPositiveOnBottom = value;
        this._refresh();
    }

    get globalTransformation() {
        return [...this._globalTransformation] as [number, number, number, number, number, number];
    }
    get globalViewBox() {
        return [...this._globalViewBox] as [number, number, number, number];
    }
    get scale() {
        return this._density * this._zoom;
    }

    private _refresh() {
        const { width, height, origin, pan, xAxisPositiveOnRight: xPr, yAxisPositiveOnBottom: yPb } = this;

        const scale = this.scale;
        const [offsetX, offsetY] = [Coordinates.x(origin) + Coordinates.x(pan), Coordinates.y(origin) + Coordinates.y(pan)];

        let gt = TransformationMatrix.identity();
        gt = TransformationMatrix.multiply(gt, TransformationMatrix.translate(offsetX, offsetY));
        gt = TransformationMatrix.multiply(gt, TransformationMatrix.scale(xPr ? scale : -scale, yPb ? scale : -scale));

        this._globalTransformation = gt;
        const [x, y] = TransformationMatrix.antitransformCoordinates(gt, [xPr ? 0 : width, yPb ? 0 : height]);
        this._globalViewBox = [x, y, width / scale, height / scale] as [number, number, number, number];
    }
}

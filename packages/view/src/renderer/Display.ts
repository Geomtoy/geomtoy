import { Maths, Assert, Utility, TransformationMatrix } from "@geomtoy/util";

import type Renderer from "./Renderer";
import type { ViewportDescriptor } from "@geomtoy/core";
import type { DisplaySettings } from "../types";

// 300 x 150 is the browser default size for both `<canvas>` and `<svg>`
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

    /**
     *  * Memo:
     *  What if the user set `width` or `height` with percentage? - calculate it.
     */

    /**
     * The width of the display, equal to the width fo the renderer's container in the screen coordinate system.
     */
    get width() {
        return Number(this._renderer.container.getAttribute("width")) || DEFAULT_CONTAINER_WIDTH;
    }
    set width(value) {
        Assert.isPositiveNumber(value, "width");
        this._renderer.container.setAttribute("width", `${value}`);
        this._refresh();
    }
    /**
     * The height of the display, equal to the height of the renderer's container in the screen coordinate system.
     */
    get height() {
        return Number(this._renderer.container.getAttribute("height")) || DEFAULT_CONTAINER_HEIGHT;
    }
    set height(value) {
        Assert.isPositiveNumber(value, "height");
        this._renderer.container.setAttribute("height", `${value}`);
        this._refresh();
    }
    /**
     * The density of the display, can be interpreted as the initial zoom of the view coordinate system in the screen coordinate system.
     */
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
     * The zoom is the scale based on the density, the zoom of the view coordinate system in the screen coordinate system.
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
    /**
     * The origin of the view coordinate system in the screen coordinate system, can be also interpreted as the initial offset
     * of the view coordinate system in the screen coordinate system. It takes the units of the screen coordinate system.
     */
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
     * The pan is the offset based on the origin, the offset of the view coordinate system in the screen coordinate system.
     * It takes the units of the screen coordinate system.
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
    /**
     * Whether the x-axis of the view coordinate system is positive on the right.
     */
    get xAxisPositiveOnRight() {
        return this._xAxisPositiveOnRight;
    }
    set xAxisPositiveOnRight(value) {
        this._xAxisPositiveOnRight = value;
        this._refresh();
    }
    /**
     * Whether the y-axis of the view coordinate system is positive on the bottom.
     */
    get yAxisPositiveOnBottom() {
        return this._yAxisPositiveOnBottom;
    }
    set yAxisPositiveOnBottom(value) {
        this._yAxisPositiveOnBottom = value;
        this._refresh();
    }
    /**
     * The transformation of the view coordinate system based on the screen coordinate system.
     */
    get globalTransformation() {
        return [...this._globalTransformation] as [number, number, number, number, number, number];
    }
    /**
     * The dimensions of the renderer's container in the view coordinate system.
     * It takes the units of the view coordinate system.
     */
    get globalViewBox() {
        return [...this._globalViewBox] as [number, number, number, number];
    }
    /**
     * The total scale of the view coordinate system.
     */
    get scale() {
        return this._density * this._zoom;
    }
    /**
     * The total offset of the view coordinate system.
     */
    get offset() {
        return [this._origin[0] + this._pan[0], this._origin[1] + this._pan[1]] as [number, number];
    }

    private _refresh() {
        const { width, height, scale, offset, _xAxisPositiveOnRight: xPr, _yAxisPositiveOnBottom: yPb } = this;

        let gt = TransformationMatrix.identity();
        gt = TransformationMatrix.multiply(gt, TransformationMatrix.translate(...offset));
        gt = TransformationMatrix.multiply(gt, TransformationMatrix.scale(xPr ? scale : -scale, yPb ? scale : -scale));

        this._globalTransformation = gt;
        const [x, y] = TransformationMatrix.antitransformCoordinates(gt, [xPr ? 0 : width, yPb ? 0 : height]);
        this._globalViewBox = [x, y, width / scale, height / scale] as [number, number, number, number];
    }
}

import { Math, Assert, Coordinates } from "@geomtoy/util";
import { Matrix } from "@geomtoy/core";

import type Renderer from "./Renderer";
import type { ViewportDescriptor } from "@geomtoy/core";

// 300x150 is the browser default size for both `<canvas>` and `<svg>`
const defaultContainerWidth = 300;
const defaultContainerHeight = 150;

const minDensity = Math.pow(10, -5);
const maxDensity = Math.pow(10, 5);
const maxZoom = Math.pow(10, 8);
const minZoom = Math.pow(10, -8);
const maxOrigin = Math.pow(2, 32);
const minOrigin = -Math.pow(2, 32);
const maxPan = Math.pow(2, 44);
const minPan = -Math.pow(2, 44);

export default class Display implements ViewportDescriptor {
    private _renderer: Renderer;

    private _density = 1;
    private _zoom = 1;
    private _origin = [0, 0] as [number, number];
    private _pan = [0, 0] as [number, number];
    private _xAxisPositiveOnRight = true;
    private _yAxisPositiveOnBottom = true;

    private _globalTransformation = Matrix.identity;
    private _globalViewBox = [NaN, NaN, NaN, NaN] as [number, number, number, number];

    constructor(renderer: Renderer) {
        this._renderer = renderer;
    }

    //? What if the user set `width` or `height` with percentage?
    get width() {
        return Number(this._renderer.container.getAttribute("width")) || defaultContainerWidth;
    }
    set width(value) {
        Assert.isPositiveNumber(value, "width");
        this._renderer.container.setAttribute("width", `${value}`);
        this._refresh();
    }
    get height() {
        return Number(this._renderer.container.getAttribute("height")) || defaultContainerHeight;
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
        value = Math.clamp(value, minDensity, maxDensity);
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
        value = Math.clamp(value, minZoom, maxZoom);
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
        ox = Math.clamp(ox, minOrigin, maxOrigin);
        oy = Math.clamp(oy, minOrigin, maxOrigin);
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
        px = Math.clamp(px, minPan, maxPan);
        py = Math.clamp(py, minPan, maxPan);
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

    get globalTransformation(): Matrix {
        return this._globalTransformation.clone();
    }
    get globalViewBox(): [number, number, number, number] {
        return [...this._globalViewBox];
    }

    private _refresh() {
        const { width, height, density, zoom, origin, pan, xAxisPositiveOnRight: xPr, yAxisPositiveOnBottom: yPb } = this;

        const scale = density * zoom;
        const offset: [number, number] = [Coordinates.x(origin) + Coordinates.x(pan), Coordinates.y(origin) + Coordinates.y(pan)];

        this._globalTransformation
            .identitySelf()
            .postMultiplySelf(new Matrix(1, 0, 0, 1, ...offset))
            .postMultiplySelf(new Matrix(xPr ? scale : -scale, 0, 0, yPb ? scale : -scale, 0, 0));

        const [x, y] = this.globalTransformation.antitransformCoordinates([xPr ? 0 : width, yPb ? 0 : height]);
        this._globalViewBox = [x, y, width / scale, height / scale];
    }
}

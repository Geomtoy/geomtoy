import Interface from "./Interface";
import type { Renderer } from "../types";

export default class SvgInterface extends Interface {
    private _interfaceBuffer = document.createDocumentFragment();

    constructor(renderer: Renderer) {
        super(renderer);
    }

    async create() {
        this.prepare();
        await this.createGrid();
        await this.createAxis();
        await this.createLabel();
        return this._interfaceBuffer;
    }

    async createLabel() {
        if (!this.options_.showLabel) return;

        const [promise, img] = this.labelImage();
        return promise.then(() => {
            this._interfaceBuffer.append(img);
        });
    }
    async createAxis() {
        if (!this.options_.showAxis) return;

        const [promise, img] = this.axisImage();
        return promise.then(() => {
            this._interfaceBuffer.append(img);
        });
    }

    async createGrid() {
        if (!this.options_.showGrid) return;
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
        const grid = document.createElementNS("http://www.w3.org/2000/svg", "rect");

        pattern.setAttribute("id", "gridPattern");
        defs.append(pattern);

        grid.setAttribute("x", "0");
        grid.setAttribute("y", "0");
        grid.setAttribute("width", `${this.renderer.display.width}`);
        grid.setAttribute("height", `${this.renderer.display.height}`);
        grid.setAttribute("fill", "url(#gridPattern)");

        const { showPrimaryGridOnly, primaryGridColor, secondaryGridColor } = this.options_;

        const [promise, img] = this.gridPatternImage();
        return promise.then(() => {
            pattern.setAttribute("x", `0`);
            pattern.setAttribute("y", `0`);
            pattern.setAttribute("patternUnits", "userSpaceOnUse");
            pattern.setAttribute("width", `${img.getAttribute("width")}`);
            pattern.setAttribute("height", `${img.getAttribute("width")}`);
            pattern.append(img);

            this._interfaceBuffer.append(defs);
            this._interfaceBuffer.append(grid);
        });
    }
}

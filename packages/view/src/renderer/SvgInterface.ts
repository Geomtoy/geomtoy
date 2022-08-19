import Interface from "./Interface";

import type SvgRenderer from "./SvgRenderer";
import type { InterfaceSettings } from "../types";

export default class SvgInterface extends Interface {
    private _interfaceBuffer = document.createDocumentFragment();

    constructor(renderer: SvgRenderer, interfaceSettings: Partial<InterfaceSettings>) {
        super(renderer, interfaceSettings);
    }

    async create() {
        this.prepare_();
        await this._createGrid();
        await this._createAxis();
        await this._createLabel();
        return this._interfaceBuffer;
    }

    private async _createLabel() {
        if (!this.showLabel) return;
        const [promise, img] = this.labelImage_();
        return promise.then(() => {
            this._interfaceBuffer.append(img);
        });
    }
    private async _createAxis() {
        if (!this.showAxis) return;
        const [promise, img] = this.axisImage_();
        return promise.then(() => {
            this._interfaceBuffer.append(img);
        });
    }
    private async _createGrid() {
        if (!this.showGrid) return;
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", "0");
        rect.setAttribute("y", "0");
        rect.setAttribute("width", `${this.renderer.display.width}`);
        rect.setAttribute("height", `${this.renderer.display.height}`);
        rect.setAttribute("fill", "url(#gridPattern)");
        const [promise, img] = this.gridPatternImage_();
        return promise.then(() => {
            defs.innerHTML = ` 
                <pattern id='gridPattern' x='0' y='0' patternUnits='userSpaceOnUse' width='${img.getAttribute("width")}' height='${img.getAttribute("height")}'>
                    ${img.outerHTML}
                </pattern> 
            `;
            this._interfaceBuffer.append(defs);
            this._interfaceBuffer.append(rect);
        });
    }
}

import type { InterfaceSettings } from "../types";
import Interface from "./Interface";
import type SVGRenderer from "./SVGRenderer";

export default class SVGInterface extends Interface {
    private _interfaceBuffer = document.createDocumentFragment();

    constructor(renderer: SVGRenderer, interfaceSettings: Partial<InterfaceSettings>) {
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
        const img = await this.labelImage_();
        this._interfaceBuffer.append(img);
    }
    private async _createAxis() {
        if (!this.showAxis) return;
        const img = await this.axisImage_();
        this._interfaceBuffer.append(img);
    }
    private async _createGrid() {
        if (!this.showGrid) return;
        const img = await this.gridPatternImage_();

        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", `${this.renderer.display.width}`);
        rect.setAttribute("height", `${this.renderer.display.height}`);
        rect.setAttribute("fill", `url(#gridPattern-${this.renderer.id})`);
        defs.innerHTML = ` 
                <pattern id='gridPattern-${this.renderer.id}' x='0' y='0' patternUnits='userSpaceOnUse' width='${img.getAttribute("width")}' height='${img.getAttribute("height")}'>
                    ${img.outerHTML}
                </pattern> 
            `;
        this._interfaceBuffer.append(defs);
        this._interfaceBuffer.append(rect);
    }
}

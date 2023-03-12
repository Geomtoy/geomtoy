import type { InterfaceSettings } from "../types";
import type CanvasRenderer from "./CanvasRenderer";
import Interface from "./Interface";

export default class CanvasInterface extends Interface {
    private _interfaceBuffer = document.createElement("canvas").getContext("2d")!;

    constructor(renderer: CanvasRenderer, interfaceSettings: Partial<InterfaceSettings>) {
        super(renderer, interfaceSettings);
    }

    async create() {
        this.prepare_();
        this._interfaceBuffer.canvas.width = this.renderer.display.width;
        this._interfaceBuffer.canvas.height = this.renderer.display.height;
        await this._createGrid();
        await this._createAxis();
        await this._createLabel();
        return this._interfaceBuffer.canvas;
    }

    private async _createLabel() {
        if (!this.showLabel) return;
        return this.labelImage_().then(img => {
            this._interfaceBuffer.drawImage(img, 0, 0);
        });
    }
    private async _createAxis() {
        if (!this.showAxis) return;
        return this.axisImage_().then(img => {
            this._interfaceBuffer.drawImage(img, 0, 0);
        });
    }
    private async _createGrid() {
        if (!this.showGrid) return;
        return this.gridPatternImage_().then(img => {
            const pattern = this._interfaceBuffer.createPattern(img, "repeat");
            this._interfaceBuffer.fillStyle = pattern!;
            this._interfaceBuffer.fillRect(0, 0, this.renderer.display.width, this.renderer.display.height);
        });
    }
}

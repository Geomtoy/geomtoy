import Interface from "./Interface";
import type CanvasRenderer from "./CanvasRenderer";

export default class CanvasInterface extends Interface {
    private _interfaceBuffer = document.createElement("canvas").getContext("2d")!;

    constructor(renderer: CanvasRenderer) {
        super(renderer);
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
        if (!this.options_.showLabel) return;
        const [promise, img] = this.labelImage_();
        return promise.then(() => {
            this._interfaceBuffer.drawImage(img, 0, 0);
        });
    }
    private async _createAxis() {
        if (!this.options_.showAxis) return;
        const [promise, img] = this.axisImage_();
        return promise.then(() => {
            this._interfaceBuffer.drawImage(img, 0, 0);
        });
    }
    private async _createGrid() {
        if (!this.options_.showGrid) return;
        const [promise, img] = this.gridPatternImage_();
        return promise.then(() => {
            const pattern = this._interfaceBuffer.createPattern(img, "repeat");
            this._interfaceBuffer.fillStyle = pattern!;
            this._interfaceBuffer.fillRect(0, 0, this.renderer.display.width, this.renderer.display.height);
        });
    }
}

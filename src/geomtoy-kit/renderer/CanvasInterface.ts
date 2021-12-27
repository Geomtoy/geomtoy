import { Renderer } from "../types";
import Interface from "./Interface";

export default class CanvasInterface extends Interface {
    private _interfaceBufferCanvas = document.createElement("canvas");
    private _interfaceBuffer = this._interfaceBufferCanvas.getContext("2d")!;

    constructor(renderer: Renderer) {
        super(renderer);
    }

    async create() {
        this.prepare();
        await this.createGrid();
        await this.createAxis();
        await this.createLabel();
        return this._interfaceBufferCanvas;
    }

    prepare() {
        super.prepare();
        this._interfaceBufferCanvas.width = this.renderer.display.width;
        this._interfaceBufferCanvas.height = this.renderer.display.height;
    }

    async createLabel() {
        if (!this.options_.showLabel) return;

        const [promise, img] = this.labelImage();
        return promise.then(() => {
            this._interfaceBuffer.drawImage(img, 0, 0);
        });
    }
    async createGrid() {
        if (!this.options_.showGrid) return;
        const [promise, img] = this.gridPatternImage();
        return promise.then(() => {
            const pattern = this._interfaceBuffer.createPattern(img, "repeat");
            this._interfaceBuffer.fillStyle = pattern!;
            this._interfaceBuffer.fillRect(0, 0, this._interfaceBufferCanvas.width, this._interfaceBufferCanvas.height);
        });
    }

    async createAxis() {
        if (!this.options_.showAxis) return;
        const [promise, img] = this.axisImage();
        return promise.then(() => {
            this._interfaceBuffer.drawImage(img, 0, 0);
        });
    }
}

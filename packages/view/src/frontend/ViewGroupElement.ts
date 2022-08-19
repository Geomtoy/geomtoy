import { Utility } from "@geomtoy/util";
import { Shape } from "@geomtoy/core";
import Stylable from "./Stylable";
import type { Style, InteractiveStyle, PathLike } from "../types";
import type View from "./View";

export default class ViewGroupElement extends Stylable {
    private _interactable = false;
    private _autoUpdateView = false;
    private _uuid = Utility.uuid();

    private _autoUpdateFunction = () => {
        if (this.parent) this.parent.render();
    };

    parent?: View;
    paths?: PathLike[];

    constructor(
        public shapes: Shape[],
        { interactable = false, autoUpdateView = true, style, hoverStyle, activeStyle } = {} as Partial<{
            interactable: boolean;
            autoUpdateView: boolean;
            style: Partial<Style>;
            hoverStyle: Partial<InteractiveStyle>;
            activeStyle: Partial<InteractiveStyle>;
        }>
    ) {
        super({ style, hoverStyle, activeStyle });
        Object.assign(this, { interactable, autoUpdateView });
    }

    get uuid() {
        return this._uuid;
    }
    get interactable() {
        return this._interactable;
    }
    set interactable(value) {
        this._interactable = value;
        this.parent !== undefined && this.parent.refreshInteractables();
    }

    get autoUpdateView() {
        return this._autoUpdateView;
    }
    set autoUpdateView(value) {
        this._autoUpdateView = value;
        if (value) {
            this.shapes.forEach(shape => {
                shape.on("any", this._autoUpdateFunction);
            });
        } else {
            this.shapes.forEach(shape => {
                shape.off("any", this._autoUpdateFunction);
            });
        }
    }
    move(deltaX: number, deltaY: number) {
        this.shapes.forEach(shape => shape.move(deltaX, deltaY));
    }
}

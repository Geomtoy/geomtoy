import Shape from "../../geomtoy/base/Shape";
import Group from "../../geomtoy/group";

import type { Style, InteractiveStyle, PathLike } from "../types";
import type View from "./View";

class ViewElement {
    private _object: Shape | Group;
    private _interactable: boolean = true;

    private _style: Partial<Style> = {};
    private _hoverStyle: Partial<InteractiveStyle> = {};
    private _activeStyle: Partial<InteractiveStyle> = {};

    public parent?: View;
    public path?: PathLike | PathLike[];

    constructor(object: Shape | Group, interactable = false, style: Partial<Style> = {}, hoverStyle: Partial<InteractiveStyle> = {}, activeStyle: Partial<InteractiveStyle> = {}) {
        this._object = object;
        this._interactable = interactable;

        this.style(style);
        this.hoverStyle(hoverStyle);
        this.activeStyle(activeStyle);
    }

    get interactable() {
        return this._interactable;
    }
    set interactable(value) {
        this._interactable = value;
        this.parent !== undefined && this.parent.refreshInteractables();
    }

    get object() {
        return this._object;
    }
    get uuid() {
        return this._object.uuid;
    }

    style(): Partial<Style>;
    style(value: Partial<Style>): void;
    style(value?: Partial<Style>) {
        if (value === undefined) {
            if (this._style.strokeDash === undefined) {
                return { ...this._style };
            } else {
                return { ...this._style, ...{ strokeDash: [...this._style.strokeDash] } };
            }
        }

        if (value.strokeDash === undefined) {
            this._style = { ...this.style, ...value };
        } else {
            this._style = { ...this.style, ...value, ...{ strokeDash: [...value.strokeDash] } };
        }
    }

    hoverStyle(): Partial<InteractiveStyle>;
    hoverStyle(value: Partial<InteractiveStyle>): void;
    hoverStyle(value?: Partial<InteractiveStyle>) {
        if (value === undefined) {
            return { ...this._hoverStyle };
        }
        this._hoverStyle = { ...this._hoverStyle, ...value };
    }

    activeStyle(): Partial<InteractiveStyle>;
    activeStyle(value: Partial<InteractiveStyle>): void;
    activeStyle(value?: Partial<InteractiveStyle>) {
        if (value === undefined) {
            return { ...this._activeStyle };
        }
        this._activeStyle = { ...this._activeStyle, ...value };
    }

    move(deltaX: number, deltaY: number) {
        if (this.object instanceof Group) {
            this.object.items.forEach(s => s.moveSelf(deltaX, deltaY));
        } else if (this.object instanceof Shape) {
            this.object.moveSelf(deltaX, deltaY);
        }
    }
}

export default ViewElement;

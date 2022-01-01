import util from "../../geomtoy/utility";

import type { Style, InteractiveStyle, PathLike } from "../types";
import type View from "./View";

//@internal
import type Shape from "../../geomtoy/base/Shape";
//@internal
import type Group from "../../geomtoy/group";

export default class ViewElement {
    private _object: Shape | Group;
    private _interactable: boolean = true;

    private _style: Partial<Style> = {
        fill: undefined,
        stroke: undefined,
        strokeWidth: undefined,
        strokeDash: undefined,
        strokeDashOffset: undefined,
        strokeLineJoin: undefined,
        strokeMiterLimit: undefined,
        strokeLineCap: undefined
    };
    private _hoverStyle: Partial<InteractiveStyle> = {
        fill: undefined,
        stroke: undefined,
        strokeWidth: undefined
    };
    private _activeStyle: Partial<InteractiveStyle> = {
        fill: undefined,
        stroke: undefined,
        strokeWidth: undefined
    };

    parent?: View;
    path?: PathLike | PathLike[];

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

    isObjectGroup(): this is { object: Group } {
        return this._object.prototypeNameChain().includes("Group");
    }
    isObjectShape(): this is { object: Shape } {
        return this._object.prototypeNameChain().includes("Shape");
    }

    style(): Partial<Style>;
    style(value: Partial<Style>): void;
    style(value?: Partial<Style>) {
        if (value === undefined) {
            return util.cloneDeep(this._style);
        }
        util.assignDeep(this._style, value);
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
        if (this.isObjectGroup()) {
            this.object.items.forEach(s => s.moveSelf(deltaX, deltaY));
        } else if (this.isObjectShape()) {
            this.object.moveSelf(deltaX, deltaY);
        }
    }
}

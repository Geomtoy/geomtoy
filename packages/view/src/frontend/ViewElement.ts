import type { Shape } from "@geomtoy/core";
import { Assert, Type, Utility } from "@geomtoy/util";
import type { InteractiveStyle, PathInfo, Style } from "../types";
import type SubView from "./SubView";
import type View from "./View";

const DEFAULT_STYLE: Style = {
    paintOrder: "fill", // svg default
    noFill: false,
    noStroke: false,
    fill: "black",
    stroke: "black", // canvas default `black`, svg default `none`
    strokeWidth: 1,
    strokeDash: [],
    strokeDashOffset: 0,
    strokeLineJoin: "miter",
    strokeLineCap: "butt",
    strokeMiterLimit: 10 // canvas default 10, svg default 4
};
const DEFAULT_INTERACTIVE_STYLE: InteractiveStyle = {
    fill: "black",
    stroke: "black",
    strokeWidth: 1
};

export default class ViewElement {
    private _interactable: boolean;
    private _zIndex: number;
    private _style = Utility.cloneDeep(DEFAULT_STYLE);
    private _hoverStyle = Utility.cloneDeep(DEFAULT_INTERACTIVE_STYLE);
    private _activeStyle = Utility.cloneDeep(DEFAULT_INTERACTIVE_STYLE);

    shape: Shape;

    paths: PathInfo[] = [];

    // view: null && subView: null - ViewElement initial status
    // view: View && subView: null - ViewElement directly added to a View
    // view: View && subView: SubView - ViewElement added to a SubView
    // @internal
    view: View | null = null;
    // @internal
    subView: SubView | null = null;

    constructor(
        shape: Shape,
        { interactable = false, zIndex = 0, style, hoverStyle, activeStyle } = {} as Partial<{
            interactable: boolean;
            zIndex: number;
            style: Partial<Style>;
            hoverStyle: Partial<InteractiveStyle>;
            activeStyle: Partial<InteractiveStyle>;
        }>
    ) {
        style !== undefined && this.style(style);
        hoverStyle !== undefined && this.hoverStyle(hoverStyle);
        activeStyle !== undefined && this.activeStyle(activeStyle);

        this.shape = shape;
        this._zIndex = zIndex;
        this._interactable = interactable;
    }

    get interactable() {
        return this._interactable;
    }
    set interactable(value) {
        this._interactable = value;
        this.view?.refreshInteractables();
    }

    get zIndex() {
        return this._zIndex;
    }
    set zIndex(value) {
        Assert.isInteger(value, "zIndex");
        this._zIndex = value;
        this.view?.sortElements();
    }

    move(deltaX: number, deltaY: number) {
        this.shape.move(deltaX, deltaY);
        this.view?.requestRender();
    }

    style(): Style;
    style(value: Partial<Style>): void;
    style(value?: Partial<Style>) {
        if (value === undefined) {
            return Utility.cloneDeep(this._style);
        }
        value = Utility.cloneDeep(value);
        if (value.strokeWidth !== undefined && !Type.isPositiveNumber(value.strokeWidth)) {
            console.warn("[G]The `strokeWidth` is set unsuccessfully. For it should be a positive number. If you wish to set it to 0, consider setting the `stroke` to `transparent`.");
            delete value.strokeWidth;
        }
        if (value.strokeMiterLimit !== undefined && !Type.isPositiveNumber(value.strokeMiterLimit)) {
            console.warn("[G]The `strokeMiterLimit` is set unsuccessfully. For it should be a positive number.");
            delete value.strokeMiterLimit;
        }
        if (value.strokeDashOffset !== undefined && !Type.isRealNumber(value.strokeDashOffset)) {
            console.warn("[G]The `strokeDashOffset` is set unsuccessfully. For it should be a real number.");
            delete value.strokeDashOffset;
        }
        if (value.strokeDash !== undefined && !value.strokeDash.every(n => Type.isRealNumber(n))) {
            console.warn("[G]The `strokeDash` is set unsuccessfully. For it should be an array of real number.");
            delete value.strokeDash;
        }
        Utility.assignDeep(this._style, value);
        this.view?.requestRender();
    }
    hoverStyle(): InteractiveStyle;
    hoverStyle(value: Partial<InteractiveStyle>): void;
    hoverStyle(value?: Partial<InteractiveStyle>) {
        if (value === undefined) {
            return { ...this._hoverStyle };
        }
        value = { ...value };
        if (value.strokeWidth !== undefined && !Type.isPositiveNumber(value.strokeWidth)) {
            console.warn("[G]The `strokeWidth` is set unsuccessfully. For it should be a positive number. If you wish to set it to 0, consider setting the `stroke` to `transparent`.");
            delete value.strokeWidth;
        }
        Object.assign(this._hoverStyle, value);
        this.view?.requestRender();
    }
    activeStyle(): InteractiveStyle;
    activeStyle(value: Partial<InteractiveStyle>): void;
    activeStyle(value?: Partial<InteractiveStyle>) {
        if (value === undefined) {
            return { ...this._activeStyle };
        }
        value = { ...value };
        if (value.strokeWidth !== undefined && !Type.isPositiveNumber(value.strokeWidth)) {
            console.warn("[G]The `strokeWidth` is set unsuccessfully. For it should be a positive number. If you wish to set it to 0, consider setting the `stroke` to `transparent`.");
            delete value.strokeWidth;
        }
        Object.assign(this._activeStyle, value);
        this.view?.requestRender();
    }
}

import type { Shape } from "@geomtoy/core";
import { Assert, Type, Utility } from "@geomtoy/util";
import { ViewElementEventType, ViewElementType, type InteractiveStyle, type PathInfo, type Style, type ViewEventObject } from "../types";
import type SubView from "./SubView";
import { SV_VIEW_SYMBOL } from "./SubView";
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

export const VE_VIEW_SYMBOL = Symbol("ViewElement.view");
export const VE_SUB_VIEW_SYMBOL = Symbol("ViewElement.subView");
export const VE_EVENT_HANDLERS_SYMBOL = Symbol("ViewElement.eventHandlers");

export default class ViewElement<T extends Shape = Shape> {
    /**
     * type:
     *
     * `None`:
     * The element has no interaction and exists as a background.
     *
     * `Operation`:
     * The element is interactive that can respond to
     *      -`hover`, `unhover`
     *      -`click`,
     *      -`dragStart`, `dragEnd`
     * This is mostly used for the UI, corresponding to `currentOperationElement` of a view.
     *
     * `Activation`:
     * The element is interactive that can respond to
     *      -`hover`, `unhover`
     *      -`activate`, `deactivate`
     *      -`click`,
     *      -`dragStart`, `dragEnd`
     * This is mostly used for the contents corresponding to `currentActivationElement` and `activeElements` of a view.
     */

    private _type: ViewElementType;
    private _zIndex: number;
    private _style = Utility.cloneDeep(DEFAULT_STYLE);
    private _hoverStyle = Utility.cloneDeep(DEFAULT_INTERACTIVE_STYLE);
    private _clickStyle = Utility.cloneDeep(DEFAULT_INTERACTIVE_STYLE);
    private _activeStyle = Utility.cloneDeep(DEFAULT_INTERACTIVE_STYLE);

    // @internal
    [VE_EVENT_HANDLERS_SYMBOL]: { [key: string]: ((e: ViewEventObject) => void)[] } = {};

    private _shape: T;
    paths: PathInfo[] = [];
    noDrag: boolean;
    noHover: boolean;

    // There status:
    // 1. view: null && subView: null - The view element initial status.
    // 2. view: View && subView: null - The view element directly added to a view.
    // 3. view: null && subView: SubView - The view element added to a sub view.
    // @internal
    [VE_VIEW_SYMBOL]: View | null = null;
    // @internal
    [VE_SUB_VIEW_SYMBOL]: SubView | null = null;

    constructor(
        shape: T,
        { interactMode = ViewElementType.Activation, zIndex = 0, noDrag = false, noHover = false, style, hoverStyle, clickStyle, activeStyle } = {} as Partial<{
            interactMode: ViewElementType;
            zIndex: number;
            noDrag: boolean;
            noHover: boolean;
            style: Partial<Style>;
            hoverStyle: Partial<InteractiveStyle>;
            clickStyle: Partial<InteractiveStyle>;
            activeStyle: Partial<InteractiveStyle>;
        }>
    ) {
        style !== undefined && this.style(style);
        hoverStyle !== undefined && this.hoverStyle(hoverStyle);
        clickStyle !== undefined && this.clickStyle(clickStyle);
        activeStyle !== undefined && this.activeStyle(activeStyle);

        this._shape = shape;
        this._zIndex = zIndex;
        this.noDrag = noDrag;
        this.noHover = noHover;
        this._type = interactMode;
    }
    get shape() {
        return this._shape;
    }
    get view() {
        return this[VE_VIEW_SYMBOL];
    }
    get subView() {
        return this[VE_SUB_VIEW_SYMBOL];
    }

    get interactMode() {
        return this._type;
    }
    set interactMode(value) {
        if (this._type !== value) {
            this._type = value;
            (this[VE_VIEW_SYMBOL] ?? this[VE_SUB_VIEW_SYMBOL]?.[SV_VIEW_SYMBOL])?.refreshInteractables();
        }
    }

    get zIndex() {
        return this._zIndex;
    }
    set zIndex(value) {
        Assert.isInteger(value, "zIndex");
        if (this._zIndex !== value) {
            this._zIndex = value;
            (this[VE_VIEW_SYMBOL] ?? this[VE_SUB_VIEW_SYMBOL]?.[SV_VIEW_SYMBOL])?.sortRenderables();
        }
    }

    on(eventType: ViewElementEventType, callback: (this: this, e: ViewEventObject) => void) {
        if (this[VE_EVENT_HANDLERS_SYMBOL][eventType] === undefined) this[VE_EVENT_HANDLERS_SYMBOL][eventType] = [];
        this[VE_EVENT_HANDLERS_SYMBOL][eventType].push(callback);
        return this;
    }
    off(eventType: ViewElementEventType, callback: (this: this, e: ViewEventObject) => void) {
        if (this[VE_EVENT_HANDLERS_SYMBOL][eventType] === undefined) return this;
        const index = this[VE_EVENT_HANDLERS_SYMBOL][eventType].findIndex(h => h === callback);
        this[VE_EVENT_HANDLERS_SYMBOL][eventType].splice(index, 1);
        return this;
    }
    clear(eventType?: ViewElementEventType) {
        if (eventType === undefined) {
            this[VE_EVENT_HANDLERS_SYMBOL] = {};
        } else {
            delete this[VE_EVENT_HANDLERS_SYMBOL][eventType];
        }
        return this;
    }

    move(deltaX: number, deltaY: number) {
        // `this.shape.move` will definitely make Geomtoy enter a new loop and trigger `allTick`, so we don't use `requestRender` here.
        this.shape.move(deltaX, deltaY);
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
        (this[VE_VIEW_SYMBOL] ?? this[VE_SUB_VIEW_SYMBOL]?.[SV_VIEW_SYMBOL])?.requestRender();
    }

    private _interactiveStyle(style: InteractiveStyle, value?: Partial<InteractiveStyle>) {
        if (value === undefined) {
            return { ...style };
        }
        value = { ...value };
        if (value.strokeWidth !== undefined && !Type.isPositiveNumber(value.strokeWidth)) {
            console.warn("[G]The `strokeWidth` is set unsuccessfully. For it should be a positive number. If you wish to set it to 0, consider setting the `stroke` to `transparent`.");
            delete value.strokeWidth;
        }
        Object.assign(style, value);
        (this[VE_VIEW_SYMBOL] ?? this[VE_SUB_VIEW_SYMBOL]?.[SV_VIEW_SYMBOL])?.requestRender();
    }

    hoverStyle(): InteractiveStyle;
    hoverStyle(value: Partial<InteractiveStyle>): void;
    hoverStyle(value?: Partial<InteractiveStyle>) {
        return this._interactiveStyle(this._hoverStyle, value);
    }

    clickStyle(): InteractiveStyle;
    clickStyle(value: Partial<InteractiveStyle>): void;
    clickStyle(value?: Partial<InteractiveStyle>) {
        return this._interactiveStyle(this._clickStyle, value);
    }

    activeStyle(): InteractiveStyle;
    activeStyle(value: Partial<InteractiveStyle>): void;
    activeStyle(value?: Partial<InteractiveStyle>) {
        return this._interactiveStyle(this._activeStyle, value);
    }
}

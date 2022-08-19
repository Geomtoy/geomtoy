import { Type, Utility } from "@geomtoy/util";
import { InteractiveStyle, Style } from "../types";

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

export default class Stylable {
    protected style_: Style = Utility.cloneDeep(DEFAULT_STYLE);
    protected hoverStyle_: InteractiveStyle = { ...DEFAULT_INTERACTIVE_STYLE };
    protected activeStyle_: InteractiveStyle = { ...DEFAULT_INTERACTIVE_STYLE };

    constructor(
        { style, hoverStyle, activeStyle } = {} as Partial<{
            style: Partial<Style>;
            hoverStyle: Partial<InteractiveStyle>;
            activeStyle: Partial<InteractiveStyle>;
        }>
    ) {
        style !== undefined && this.style(style);
        hoverStyle !== undefined && this.hoverStyle(hoverStyle);
        activeStyle !== undefined && this.activeStyle(activeStyle);
    }

    style(): Style;
    style(value: Partial<Style>): void;
    style(value?: Partial<Style>) {
        if (value === undefined) {
            return Utility.cloneDeep(this.style_);
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

        Utility.assignDeep(this.style_, value);
    }
    hoverStyle(): InteractiveStyle;
    hoverStyle(value: Partial<InteractiveStyle>): void;
    hoverStyle(value?: Partial<InteractiveStyle>) {
        if (value === undefined) {
            return { ...this.hoverStyle_ };
        }
        value = { ...value };
        if (value.strokeWidth !== undefined && !Type.isPositiveNumber(value.strokeWidth)) {
            console.warn("[G]The `strokeWidth` is set unsuccessfully. For it should be a positive number. If you wish to set it to 0, consider setting the `stroke` to `transparent`.");
            delete value.strokeWidth;
        }
        Object.assign(this.hoverStyle_, value);
    }
    activeStyle(): InteractiveStyle;
    activeStyle(value: Partial<InteractiveStyle>): void;
    activeStyle(value?: Partial<InteractiveStyle>) {
        if (value === undefined) {
            return { ...this.activeStyle_ };
        }
        value = { ...value };
        if (value.strokeWidth !== undefined && !Type.isPositiveNumber(value.strokeWidth)) {
            console.warn("[G]The `strokeWidth` is set unsuccessfully. For it should be a positive number. If you wish to set it to 0, consider setting the `stroke` to `transparent`.");
            delete value.strokeWidth;
        }
        Object.assign(this.activeStyle_, value);
    }
}

import { ViewportDescriptor, FillRule } from "@geomtoy/core";

export const enum ViewElementInteractMode {
    None = 0,
    Activation = 1,
    Operation = 2
}
export const enum ViewElementEventType {
    DragStart = "dragStart", // view.operativeElement / view.activeElements
    DragEnd = "dragEnd", // view.operativeElement / view.activeElements
    Activate = "activate", // view.activeElements
    Deactivate = "deactivate", // view.activeElements
    Click = "click", // view.operativeElement
    Hover = "hover",
    Unhover = "unhover"
}
export const enum ViewEventType {
    PointerEnter = "pointerEnter",
    PointerLeave = "pointerLeave",
    PointerMove = "pointerMove",
    PointerDown = "pointerDown",
    PointerUp = "pointerUp",
    PointerCancel = "pointerCancel",
    Wheel = "wheel",

    DragStart = "dragStart",
    Dragging = "dragging",
    DragEnd = "dragEnd",
    PanStart = "panStart",
    Panning = "panning",
    PanEnd = "panEnd",
    ZoomStart = "zoomStart",
    Zooming = "zooming",
    ZoomEnd = "zoomEnd",

    Activate = "activate",
    Deactivate = "deactivate",
    Click = "click",
    Hover = "hover",
    Unhover = "unhover"
}

export interface ViewEventObject {
    isTouch: boolean;
    viewportX: number;
    viewportY: number;
    x: number;
    y: number;
}

export type StrokeLineJoinType = "bevel" | "miter" | "round";
export type StrokeLineCapType = "butt" | "round" | "square";
export type PaintOrderType = "stroke" | "fill";
export type Style = {
    paintOrder: PaintOrderType;
    noStroke: boolean;
    noFill: boolean;
    fill: string;
    stroke: string;
    strokeWidth: number;
    strokeDash: number[];
    strokeDashOffset: number;
    strokeLineJoin: StrokeLineJoinType;
    strokeMiterLimit: number;
    strokeLineCap: StrokeLineCapType;
};
export type InteractiveStyle = {
    fill: string;
    stroke: string;
    strokeWidth: number;
};

export type InterfaceSettings = {
    showAxis: boolean;
    axisColor: string;
    showLabel: boolean;
    labelFillColor: string;
    labelStrokeColor: string;
    showGrid: boolean;
    showPrimaryGridOnly: boolean;
    primaryGridColor: string;
    secondaryGridColor: string;
};
export type DisplaySettings = Omit<ViewportDescriptor, "globalTransformation" | "globalViewBox">;

export const enum ImageSourceStatus {
    Successful,
    Failed,
    Loading
}

export type PathLike = SVGPathElement | Path2D;
export type PathInfo = [PathLike, FillRule];
export type ContainerElement = SVGSVGElement | HTMLCanvasElement;

import { ViewportDescriptor, FillRule } from "@geomtoy/core";

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

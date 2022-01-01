export type StrokeLineJoinType = "bevel" | "miter" | "round";
export type StrokeLineCapType = "butt" | "round" | "square";

export type Style = {
    fill: string;
    stroke: string;
    strokeWidth: number;
    strokeDash: number[];
    strokeDashOffset: number;
    strokeLineJoin: StrokeLineJoinType;
    strokeMiterLimit: number;
    strokeLineCap: StrokeLineCapType;
};
export type InteractiveStyle = Omit<Style, "strokeDash" | "strokeDashOffset" | "strokeLineJoin" | "strokeMiterLimit" | "strokeLineCap">;

export type InterfaceOptions = {
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

export const enum ImageSourceStatus {
    Successful,
    Failed,
    Loading
}

export type PathLike = SVGPathElement | Path2D;
export type ContainerElement = SVGSVGElement | HTMLCanvasElement;

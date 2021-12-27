export type LineJoinType = "bevel" | "miter" | "round";
export type LineCapType = "butt" | "round" | "square";

export type Style = {
    fill: string;
    stroke: string;
    strokeWidth: number;
    strokeDash: number[];
    strokeDashOffset: number;
    lineJoin: LineJoinType;
    miterLimit: number;
    lineCap: LineCapType;
};
export type InteractiveStyle = Omit<Style, "strokeDash" | "strokeDashOffset" | "lineJoin" | "miterLimit" | "lineCap">;

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

export type LineJoinType = "bevel" | "miter" | "round"
export type LineCapType = "butt" | "round" | "square"

export type AdapterOptions = {
    lineJoin: LineJoinType
    miterLimit: number
    lineCap: LineCapType
}

import type { FontConfig, Options, RendererConfig } from "../types"

export const defaultOptions: Options = {
    epsilon: 2 ** -32,
    graphics: {
        pointSize: 2,
        lineArrow: true,
        vectorArrow: true,
        rayArrow: true,
        arrow: {
            width: 5,
            length: 10,
            foldback: 1,
            noFoldback: false
        }
    },
    pathSampleRatio: 100
}

export const defaultRendererConfig: RendererConfig = {
    stroke: "transparent",
    strokeDash: [],
    strokeDashOffset: 0,
    strokeWidth: 1,
    fill: "transparent",
    lineJoin: "miter",
    lineCap: "butt",
    miterLimit: 10
}
export const defaultFontConfig: FontConfig = {
    fontSize: 16,
    fontFamily: "sans-serif",
    fontBold: false,
    fontItalic: false
}

export const eventNameSplitter = /\s+/
export const eventNameForAny = "*"
export const onEventHandlerDefaultPriority = 1
export const bindEventHandlerDefaultPriority = 1000

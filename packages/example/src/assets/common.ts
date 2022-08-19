import { EventObject, Point, Text } from "@geomtoy/core";
import { Style } from "@geomtoy/view";
import color from "./color";

export var mathFont = {
    fontSize: 28,
    fontFamily: "Cambria Math, Times New Roman, math, serif",
    fontBold: false,
    fontItalic: true
};

function styles(strokeColor: Parameters<typeof color>["0"], fillColor: Parameters<typeof color>["0"], strokeWidth: number, noFill: boolean, noStroke: boolean) {
    let ret = {
        style: { stroke: color(strokeColor), fill: color(fillColor, 0.2), strokeWidth, noFill, noStroke, paintOrder: "fill" }
    } as {
        style: Partial<Style>;
        hoverStyle: Partial<Style>;
        activeStyle: Partial<Style>;
    };
    ret.hoverStyle = {
        fill: color("blue-a400", 0.2),
        stroke: color("blue-a400", 0.8),
        strokeWidth
    };
    ret.activeStyle = {
        fill: color("blue-a700", 0.2),
        stroke: color("blue-a700", 0.8),
        strokeWidth
    };
    return ret;
}

export function strokeFill(c: Parameters<typeof color>["0"]) {
    return styles(c, c, 4, false, false);
}
export function lightStrokeFill(c: Parameters<typeof color>["0"]) {
    return styles(c, c, 2, false, false);
}
export function thinStrokeFill(c: Parameters<typeof color>["0"]) {
    return styles(c, c, 1, false, false);
}

export function strokeFillTrans(c: Parameters<typeof color>["0"]) {
    const ret = styles(c, c, 4, false, false);
    ret.style.fill = "transparent";
    return ret;
}
export function lightStrokeFillTrans(c: Parameters<typeof color>["0"]) {
    const ret = styles(c, c, 2, false, false);
    ret.style.fill = "transparent";
    return ret;
}
export function thinStrokeFillTrans(c: Parameters<typeof color>["0"]) {
    const ret = styles(c, c, 1, false, false);
    ret.style.fill = "transparent";
    return ret;
}

export function stroke(c: Parameters<typeof color>["0"]) {
    return styles(c, c, 4, true, false);
}
export function lightStroke(c: Parameters<typeof color>["0"]) {
    return styles(c, c, 2, true, false);
}
export function thinStroke(c: Parameters<typeof color>["0"]) {
    return styles(c, c, 1, true, false);
}

export function codeHtml(code: string, lang = "js") {
    return `<pre><code class="language-${lang}">${code}</code></pre>`;
}

export function offsetLabel(this: Text, [e]: [EventObject<Point>]) {
    this.point = e.target.clone().move(1, 1);
}

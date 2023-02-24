import { InteractiveStyle, Style } from "@geomtoy/view";
import color from "./color";

export var mathFont = {
    fontSize: 28,
    fontFamily: "Cambria Math, Times New Roman, math, serif",
    fontBold: false,
    fontItalic: true
};

type ColorName = Parameters<typeof color>["0"];

export function styles(strokeColor: ColorName, fillColor: ColorName, style: Omit<Partial<Style>, "stroke" | "fill">) {
    const strokeWidth = style.strokeWidth ?? 2;
    return {
        style: {
            stroke: color(strokeColor),
            fill: color(fillColor, 0.5),
            strokeWidth: strokeWidth,
            strokeDash: style.strokeDash ?? undefined,
            noFill: style.noFill ?? false,
            noStroke: style.noStroke ?? false,
            paintOrder: "fill"
        },
        hoverStyle: {
            fill: color("blue-a400", 0.5),
            stroke: color("blue-a400"),
            strokeWidth
        },
        activeStyle: {
            fill: color("blue-a700", 0.5),
            stroke: color("blue-a700"),
            strokeWidth
        }
    } as {
        style: Partial<Style>;
        hoverStyle: Partial<InteractiveStyle>;
        activeStyle: Partial<InteractiveStyle>;
    };
}

export function strokeFill(c: ColorName) {
    return styles(c, c, { strokeWidth: 4 });
}
export function lightStrokeFill(c: ColorName) {
    return styles(c, c, { strokeWidth: 2 });
}
export function thinStrokeFill(c: ColorName) {
    return styles(c, c, { strokeWidth: 1 });
}

export function strokeFillTrans(c: ColorName) {
    return styles(c, "transparent", { strokeWidth: 4 });
}
export function lightStrokeFillTrans(c: ColorName) {
    return styles(c, "transparent", { strokeWidth: 2 });
}
export function thinStrokeFillTrans(c: ColorName) {
    return styles(c, "transparent", { strokeWidth: 1 });
}

export function strokeOnly(c: ColorName) {
    return styles(c, c, { strokeWidth: 4, noFill: true });
}
export function lightStrokeOnly(c: ColorName) {
    return styles(c, c, { strokeWidth: 2, noFill: true });
}
export function thinStrokeOnly(c: ColorName) {
    return styles(c, c, { strokeWidth: 1, noFill: true });
}

export function dashedStroke(c: ColorName) {
    return styles(c, c, { noFill: true, strokeWidth: 4, strokeDash: [4] });
}
export function dashedLightStroke(c: ColorName) {
    return styles(c, c, { noFill: true, strokeWidth: 2, strokeDash: [3] });
}
export function dashedThinStroke(c: ColorName) {
    return styles(c, c, { noFill: true, strokeWidth: 1, strokeDash: [2] });
}

export function fillOnly(c: ColorName) {
    return styles(c, c, { noStroke: true });
}

export function codeHtml(code: string, lang = "js") {
    return `<pre><code class="language-${lang}">${code}</code></pre>`;
}

export function elementFromString(htmlString: string) {
    const document = new DOMParser().parseFromString(htmlString, "text/html");
    return document.body.firstElementChild as HTMLElement;
}

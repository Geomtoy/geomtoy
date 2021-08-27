/**
 * Reference:
 * @see {@link https://www.w3.org/TR/SVG2/implnote.html#ArcImplementationNotes}
 * @see {@link https://observablehq.com/@awhitty/svg-2-elliptical-arc-to-canvas-path2d}
 */

import math from "../utility/math"
import vec2 from "../utility/vec2"
import mat2 from "../utility/mat2"

function arcCenterToEndpointParameterization({
    cx,
    cy,
    rx: srcRx,
    ry: srcRy,
    startAngle,
    endAngle,
    xAxisRotation,
    anticlockwise
}: {
    cx: number
    cy: number
    rx: number
    ry: number
    startAngle: number
    endAngle: number
    xAxisRotation: number
    anticlockwise: boolean
}) {
    let cosPhi = math.cos(xAxisRotation),
        sinPhi = math.sin(xAxisRotation),
        [rx, ry] = correctRadii(srcRx, srcRy),
        // prettier-ignore
        [x1,y1] = vec2.add(
            mat2.dotVec2(
                [cosPhi, -sinPhi, sinPhi, cosPhi],
                [rx * math.cos(startAngle), ry * math.sin(startAngle)]
            ),
            [cx, cy]
        ),
        // prettier-ignore
        [x2, y2] = vec2.add(
            mat2.dotVec2(
                [cosPhi, -sinPhi, sinPhi, cosPhi], 
                [rx * math.cos(endAngle), ry * math.sin(endAngle)]
            ),
            [cx, cy]
        ),
        deltaAngle = (endAngle - startAngle) % (2 * Math.PI),
        largeArcFlag = math.abs(deltaAngle) > Math.PI ? true : false,
        sweepFlagP = deltaAngle > 0 ? true : false,
        sweepFlag = anticlockwise ? !sweepFlagP : sweepFlagP

    return { x1, y1, x2, y2, rx, ry, largeArcFlag, sweepFlag, xAxisRotation }
}
function arcEndpointToCenterParameterization({
    x1,
    y1,
    x2,
    y2,
    rx: srcRx,
    ry: srcRy,
    largeArcFlag,
    sweepFlag,
    xAxisRotation
}: {
    x1: number
    y1: number
    x2: number
    y2: number
    rx: number
    ry: number
    largeArcFlag: boolean
    sweepFlag: boolean
    xAxisRotation: number
}) {
    let cosPhi = math.cos(xAxisRotation),
        sinPhi = math.sin(xAxisRotation),
        // prettier-ignore
        [x1P, y1P] = mat2.dotVec2(
            [cosPhi, sinPhi, -sinPhi, cosPhi], 
            [(x1 - x2) / 2, (y1 - y2) / 2]
        ),
        [rx, ry] = correctRadii(srcRx, srcRy, x1P, y1P),
        sign = largeArcFlag !== sweepFlag ? 1 : -1,
        // prettier-ignore
        [cxP, cyP] = vec2.scalarMultiply(
            [(rx * y1P) / ry, (-ry * x1P) / rx], 
            sign * math.sqrt((rx ** 2 * ry ** 2 - rx ** 2 * y1P ** 2 - ry ** 2 * x1P ** 2) / (rx ** 2 * y1P ** 2 + ry ** 2 * x1P ** 2))
        ),
        // prettier-ignore
        [cx, cy] = vec2.add(
            mat2.dotVec2(
                [cosPhi, -sinPhi, sinPhi, cosPhi], 
                [cxP, cyP]
            ), 
            [(x1 + x2) / 2, (y1 + y2) / 2]
        ),
        a: [number, number] = [(x1P - cxP) / rx, (y1P - cyP) / ry],
        b: [number, number] = [(-x1P - cxP) / rx, (-y1P - cyP) / ry]

    let startAngle = vec2.angleTo([1, 0], a),
        deltaAngleP = vec2.angleTo(a, b),
        // prettier-ignore
        deltaAngle = !sweepFlag && deltaAngleP > 0 
                ? deltaAngleP - 2 * Math.PI 
                : sweepFlag && deltaAngleP < 0 
                ? deltaAngleP + 2 * Math.PI 
                : deltaAngleP,
        endAngle = startAngle + deltaAngle

    return { cx, cy, rx, ry, startAngle, endAngle, xAxisRotation, anticlockwise: deltaAngle < 0 }
}

function correctRadii(rx: number, ry: number, x1P?: number, y1P?: number) {
    if (rx == 0 || ry == 0) return [0, 0]
    rx = math.abs(rx)
    ry = math.abs(ry)
    if (x1P !== undefined && y1P !== undefined) {
        let lambda = x1P ** 2 / rx ** 2 + y1P ** 2 / ry ** 2
        if (lambda > 1) [rx, ry] = [math.sqrt(lambda) * rx, math.sqrt(lambda) * ry]
    }
    return [rx, ry]
}

export { arcCenterToEndpointParameterization, arcEndpointToCenterParameterization }

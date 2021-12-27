/**
 * Reference:
 * @see https://www.w3.org/TR/SVG2/implnote.html#ArcImplementationNotes
 * @see https://observablehq.com/@awhitty/svg-2-elliptical-arc-to-canvas-path2d
 * @see https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-arc
 */

import math from "../utility/math"
import vec2 from "../utility/vec2"
import mat2 from "../utility/mat2"
import angle from "../utility/angle"

type ArcEndpointParameterization = {
    point1X: number
    point1Y: number
    point2X: number
    point2Y: number
    radiusX: number
    radiusY: number
    largeArcFlag: boolean
    sweepFlag: boolean
    xAxisRotation: number
}
type ArcCenterParameterization = {
    centerX: number
    centerY: number
    radiusX: number
    radiusY: number
    startAngle: number
    endAngle: number
    xAxisRotation: number
    anticlockwise: boolean
}

function arcCenterToEndpointParameterization({
    centerX: cx,
    centerY: cy,
    radiusX: srcRx,
    radiusY: srcRy,
    xAxisRotation: phi,
    startAngle: sa,
    endAngle: ea,
    anticlockwise: anti
}: ArcCenterParameterization): ArcEndpointParameterization {
    const cosPhi = math.cos(phi)
    const sinPhi = math.sin(phi)
    const [rx, ry] = [math.abs(srcRx), math.abs(srcRy)]
    //prettier-ignore
    const [x1,y1] = vec2.add(
        mat2.dotVec2(
            [cosPhi, -sinPhi, sinPhi, cosPhi],
            [rx * math.cos(sa), ry * math.sin(sa)]
        ),
        [cx, cy]
    )
    if ((!anti && ea - sa >= 2 * Math.PI) || (anti && sa - ea >= 2 * Math.PI)) {
        // full arc, then adjust point2 close to point1 to simulate
        const approx = Math.PI / 1800
        ea = !anti ? ea - approx : ea + approx
    }
    //prettier-ignore
    const [x2, y2] = vec2.add(
        mat2.dotVec2(
            [cosPhi, -sinPhi, sinPhi, cosPhi], 
            [rx * math.cos(ea), ry * math.sin(ea)]
        ),
        [cx, cy]
    )

    const deltaA = angle.simplify(ea) - angle.simplify(sa)
    const laf = math.abs(deltaA) > Math.PI ? true : false
    const sf = deltaA > 0 ? true : false

    return { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2, radiusX: rx, radiusY: ry, largeArcFlag: laf, sweepFlag: sf, xAxisRotation: phi }
}

function arcEndpointToCenterParameterization({
    point1X: x1,
    point1Y: y1,
    point2X: x2,
    point2Y: y2,
    radiusX: srcRx,
    radiusY: srcRy,
    largeArcFlag: laf,
    sweepFlag: sf,
    xAxisRotation: phi
}: ArcEndpointParameterization): ArcCenterParameterization {
    const cosPhi = math.cos(phi)
    const sinPhi = math.sin(phi)
    //prettier-ignore
    const [x1P, y1P] = mat2.dotVec2(
        [cosPhi, sinPhi, -sinPhi, cosPhi], 
        [(x1 - x2) / 2, (y1 - y2) / 2]
    )
    // correctRadii
    let lambda = x1P ** 2 / srcRx ** 2 + y1P ** 2 / srcRy ** 2
    if (lambda > 1) {
        srcRx = math.sqrt(lambda) * srcRx
        srcRy = math.sqrt(lambda) * srcRy
    }
    const [rx, ry] = [math.abs(srcRx), math.abs(srcRy)]
    const sign = laf !== sf ? 1 : -1
    //prettier-ignore
    const [cxP, cyP] = vec2.scalarMultiply(
        [(rx * y1P) / ry, (-ry * x1P) / rx], 
        sign * math.sqrt((rx ** 2 * ry ** 2 - rx ** 2 * y1P ** 2 - ry ** 2 * x1P ** 2) / (rx ** 2 * y1P ** 2 + ry ** 2 * x1P ** 2))
    )
    //prettier-ignore
    const [cx, cy] = vec2.add(
        mat2.dotVec2(
            [cosPhi, -sinPhi, sinPhi, cosPhi], 
            [cxP, cyP]
        ), 
        [(x1 + x2) / 2, (y1 + y2) / 2]
    )
    const a: [number, number] = [(x1P - cxP) / rx, (y1P - cyP) / ry]
    const b: [number, number] = [(-x1P - cxP) / rx, (-y1P - cyP) / ry]

    const sa = vec2.angleTo([1, 0], a)
    const deltaAP = vec2.angleTo(a, b)
    //prettier-ignore
    const deltaA = 
        !sf && deltaAP > 0 
        ? deltaAP - 2 * Math.PI 
        : sf && deltaAP < 0 
        ? deltaAP + 2 * Math.PI 
        : deltaAP
    const ea = sa + deltaA

    return { centerX: cx, centerY: cy, radiusX: rx, radiusY: ry, startAngle: sa, endAngle: ea, xAxisRotation: phi, anticlockwise: deltaA < 0 }
}

export { arcCenterToEndpointParameterization, arcEndpointToCenterParameterization }

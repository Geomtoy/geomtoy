import _ from "lodash"

/**
 * 由于总是在屏幕上绘制，所以此处不做角度正旋转换（即总是顺时针正旋）
 * @see {@link https://www.w3.org/TR/SVG2/implnote.html#ArcImplementationNotes}
 * @see {@link https://observablehq.com/@awhitty/svg-2-elliptical-arc-to-canvas-path2d}
 */

/**
 *
 * @param cx
 * @param cy
 * @param rx
 * @param ry
 * @param startAngle
 * @param endAngle
 * @param xAxisRotation
 * @param anticlockwise
 */
function arcCenterToEndpointParameterization({ cx, cy, rx: srcRx, ry: srcRy, startAngle, endAngle, xAxisRotation, anticlockwise = false }) {
    let cosPhi = Math.cos(xAxisRotation),
        sinPhi = Math.sin(xAxisRotation),
        [rx, ry] = correctRadii(srcRx, srcRy),
        // prettier-ignore
        [x1,y1] = vec2Add(
            mat2DotProductVec2(
                [cosPhi, -sinPhi, sinPhi, cosPhi],
                [rx * Math.cos(startAngle), ry * Math.sin(startAngle)]
            ),
            [cx, cy]
        ),
        // prettier-ignore
        [x2, y2] = vec2Add(
            mat2DotProductVec2(
                [cosPhi, -sinPhi, sinPhi, cosPhi], 
                [rx * Math.cos(endAngle), ry * Math.sin(endAngle)]
            ),
            [cx, cy]
        ),
        deltaAngle = (endAngle - startAngle) % (2 * Math.PI), //(-2*Math.PI, 2*Math.PI)
        largeArcFlag = Math.abs(deltaAngle) > Math.PI ? true : false,
        sweepFlagP = deltaAngle > 0 ? true : false,
        sweepFlag = anticlockwise ? !sweepFlagP : sweepFlagP

    return { x1, y1, x2, y2, rx, ry, largeArcFlag, sweepFlag, xAxisRotation }
}

/**
 *
 * @param {*} x1
 * @param {*} y1
 * @param {*} x2
 * @param {*} y2
 * @param {*} rx
 * @param {*} ry
 * @param {*} largeArcFlag
 * @param {*} sweepFlag
 * @param {*} xAxisRotation
 */
function arcEndpointToCenterParameterization({ x1, y1, x2, y2, rx: srcRx, ry: srcRy, largeArcFlag, sweepFlag, xAxisRotation }) {
    let cosPhi = Math.cos(xAxisRotation),
        sinPhi = Math.sin(xAxisRotation),
        // prettier-ignore
        [x1P, y1P] = mat2DotProductVec2(
            [cosPhi, sinPhi, -sinPhi, cosPhi], 
            [(x1 - x2) / 2, (y1 - y2) / 2]
        ),
        [rx, ry] = correctRadii(srcRx, srcRy, x1P, y1P),
        sign = largeArcFlag !== sweepFlag ? 1 : -1,
        // prettier-ignore
        [xP, yP] = vec2ScalarMultiply(
            [(rx * y1P) / ry, (-ry * x1P) / rx], 
            sign * Math.sqrt((rx ** 2 * ry ** 2 - rx ** 2 * y1P ** 2 - ry ** 2 * x1P ** 2) / (rx ** 2 * y1P ** 2 + ry ** 2 * x1P ** 2))
        ),
        // prettier-ignore
        [cx, cy] = vec2Add(
            mat2DotProductVec2(
                [cosPhi, -sinPhi, sinPhi, cosPhi], 
                [xP, yP]
            ), 
            [(x1 + x2) / 2, (y1 + y2) / 2]
        ),
        a = [(x1P - xP) / rx, (y1P - yP) / ry],
        b = [(-x1P - xP) / rx, (-y1P - yP) / ry]

    let startAngle = vec2AngleBetween([1, 0], a),
        deltaAngleP = vec2AngleBetween(a, b) % (2 * Math.PI), //(-2*Math.PI, 2*Math.PI)
        // prettier-ignore
        deltaAngle = !sweepFlag && deltaAngleP > 0 
                ? deltaAngleP - 2 * Math.PI 
                : sweepFlag && deltaAngleP < 0 
                ? deltaAngleP + 2 * Math.PI 
                : deltaAngleP,
        endAngle = startAngle + deltaAngle

    return { cx, cy, rx, ry, startAngle, endAngle, xAxisRotation, anticlockwise: deltaAngle < 0 }
}

function mat2DotProductVec2([m00, m01, m10, m11], [vx, vy]) {
    return [m00 * vx + m01 * vy, m10 * vx + m11 * vy]
}

function vec2Add([ux, uy], [vx, vy]) {
    return [ux + vx, uy + vy]
}

function vec2DotProduct([ux, uy], [vx, vy]) {
    return ux * vx + uy * vy
}

function vec2CrossProduct([ux, uy], [vx, vy]) {
    return ux * vy - uy * vx
}

function vec2ScalarMultiply([x, y], scalar) {
    return [x * scalar, y * scalar]
}

function vec2Magnitude([x, y]) {
    return Math.hypot(x, y)
}

function vec2AngleBetween(u, v) {
    let sign = vec2CrossProduct(u, v) >= 0 ? 1 : -1
    return sign * Math.acos(vec2DotProduct(u, v) / (vec2Magnitude(u) * vec2Magnitude(v)))
}

function correctRadii(rx, ry, x1P, y1P) {
    if (rx == 0 || ry == 0) return [0, 0]
    rx = Math.abs(rx)
    ry = Math.abs(ry)
    if (_.isNumber(x1P) && _.isNumber(y1P)) {
        let lambda = x1P ** 2 / rx ** 2 + y1P ** 2 / ry ** 2
        if (lambda > 1) [rx, ry] = [Math.sqrt(lambda) * rx, Math.sqrt(lambda) * ry]
    }
    return [rx, ry]
}

export { arcCenterToEndpointParameterization, arcEndpointToCenterParameterization, correctRadii }

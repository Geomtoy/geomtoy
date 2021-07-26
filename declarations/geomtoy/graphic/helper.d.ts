/**
 * 由于总是在屏幕上绘制，所以此处不做角度正旋转换（即总是顺时针正旋）
 * @see https://www.w3.org/TR/SVG2/implnote.html#ArcImplementationNotes
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
export function arcCenterToEndpointParameterization({ cx, cy, rx: srcRx, ry: srcRy, startAngle, endAngle, xAxisRotation, anticlockwise }: {
    cx: any;
    cy: any;
    rx: any;
    ry: any;
    startAngle: any;
    endAngle: any;
    xAxisRotation: any;
    anticlockwise?: boolean | undefined;
}): {
    x1: any;
    y1: any;
    x2: any;
    y2: any;
    rx: any;
    ry: any;
    largeArcFlag: boolean;
    sweepFlag: boolean;
    xAxisRotation: any;
};
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
export function arcEndpointToCenterParameterization({ x1, y1, x2, y2, rx: srcRx, ry: srcRy, largeArcFlag, sweepFlag, xAxisRotation }: any): {
    cx: any;
    cy: any;
    rx: any;
    ry: any;
    startAngle: number;
    endAngle: number;
    xAxisRotation: any;
    anticlockwise: boolean;
};
export function correctRadii(rx: any, ry: any, x1P: any, y1P: any): any[];

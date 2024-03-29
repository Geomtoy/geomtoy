/**
 * Reference:
 * @see https://www.w3.org/TR/SVG2/implnote.html#ArcImplementationNotes
 * @see https://observablehq.com/@awhitty/svg-2-elliptical-arc-to-canvas-path2d
 * @see https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-ellipse
 */
import { Angle, Float, Maths, TransformationMatrix, Vector2 } from "@geomtoy/util";
import { ArcCenterParameterization, ArcEndpointParameterization } from "../types";

const ARC_ENDPOINT_FULL_APPROX = Maths.PI / 1800;

export function centerParameterizationTransform(
    // prettier-ignore
    {
        centerX: cx,
        centerY: cy,
        radiusX: rx,
        radiusY: ry,
        startAngle: sa,
        endAngle: ea,
        positive: pos,
        rotation: phi
    }: ArcCenterParameterization,
    transformationMatrix: [number, number, number, number, number, number]
): ArcCenterParameterization {
    let m = TransformationMatrix.identity();
    m = TransformationMatrix.multiply(m, TransformationMatrix.translate(cx, cy));
    m = TransformationMatrix.multiply(m, TransformationMatrix.rotate(phi));
    m = TransformationMatrix.multiply(m, TransformationMatrix.scale(rx, ry));
    m = TransformationMatrix.multiply(transformationMatrix, m);

    const {
        translate: [nCx, nCy],
        rotate1: nPhi,
        scale: [sx, sy]
    } = TransformationMatrix.decomposeSvd(m);
    const nRx = Maths.abs(sx);
    const nRy = Maths.abs(sy);
    const nPos = TransformationMatrix.determinant(transformationMatrix) < 0 ? !pos : pos;

    // Think sa,ea corresponding points on the unit circle
    const saC = Vector2.from2(sa, 1);
    const eaC = Vector2.from2(ea, 1);
    const [nSaX, nSaY] = TransformationMatrix.transformCoordinates(m, saC);
    const [nEaX, nEaY] = TransformationMatrix.transformCoordinates(m, eaC);
    const vSa = Vector2.from([nCx, nCy], [nSaX, nSaY]);
    const vEa = Vector2.from([nCx, nCy], [nEaX, nEaY]);
    const vPhi = Vector2.from2(nPhi, 1);
    const nSa = Angle.simplify(Vector2.angleTo(vPhi, vSa));
    const nEa = Angle.simplify(Vector2.angleTo(vPhi, vEa));

    return {
        centerX: nCx,
        centerY: nCy,
        radiusX: nRx,
        radiusY: nRy,
        startAngle: nSa,
        endAngle: nEa,
        positive: nPos,
        rotation: nPhi
    };
}

export function endpointParameterizationTransform(
    // prettier-ignore
    {
        point1X: x1,
        point1Y: y1,
        point2X: x2,
        point2Y: y2,
        radiusX: rx,
        radiusY: ry,
        largeArc: la,
        positive: pos,
        rotation: phi
    }: ArcEndpointParameterization,
    transformationMatrix: [number, number, number, number, number, number]
): ArcEndpointParameterization {
    let m = TransformationMatrix.identity();
    m = TransformationMatrix.multiply(m, TransformationMatrix.rotate(phi));
    m = TransformationMatrix.multiply(m, TransformationMatrix.scale(rx, ry));
    m = TransformationMatrix.multiply(transformationMatrix, m);
    // Here we have to ignore the position(cx, cy) of the arc, because the translation of the arc has no effect on both `rotation` and `positive`,
    // their values, regardless of where the arc is positioned, are the same.
    // It is mainly the linear transformation of [a, b, c, d] that will have an effect.
    // Of course we can also assume that we moved the center of the arc back to the origin before pre multiply the `transformationMatrix`

    const {
        rotate1: nPhi,
        scale: [sx, sy]
    } = TransformationMatrix.decomposeSvd(m);
    const nRx = Maths.abs(sx);
    const nRy = Maths.abs(sy);
    const nPos = TransformationMatrix.determinant(transformationMatrix) < 0 ? !pos : pos;
    const [nX1, nY1] = TransformationMatrix.transformCoordinates(transformationMatrix, [x1, y1]);
    const [nX2, nY2] = TransformationMatrix.transformCoordinates(transformationMatrix, [x2, y2]);

    return {
        point1X: nX1,
        point1Y: nY1,
        point2X: nX2,
        point2Y: nY2,
        radiusX: nRx,
        radiusY: nRy,
        largeArc: la,
        positive: nPos,
        rotation: nPhi
    };
}

export function centerToEndpointParameterization(
    // prettier-ignore
    { 
        centerX: cx, 
        centerY: cy, 
        radiusX: rx, 
        radiusY: ry, 
        startAngle: sa, 
        endAngle: ea, 
        positive: pos, 
        rotation: phi 
    }: ArcCenterParameterization
): ArcEndpointParameterization {
    if ((pos && ea - sa >= 2 * Maths.PI) || (!pos && sa - ea >= 2 * Maths.PI)) {
        /**
         * Full arc situation:
         * When converting the center parameterization to the endpoint parameterization,
         * the endpoint parameterization can NOT directly draw a full circle/ellipse like the center parameterization does,
         * we use an approximation of $\frac{\pi}{1800}$ to adjust the terminal endpoint every close to initial endpoint to simulate.
         */
        ea = pos ? sa - ARC_ENDPOINT_FULL_APPROX : sa + ARC_ENDPOINT_FULL_APPROX;
    }
    ea = Angle.simplify(ea);
    sa = Angle.simplify(sa);

    // prettier-ignore
    const deltaTheta = pos
            ? ea > sa 
                ? ea - sa 
                : 2 * Maths.PI - (sa - ea)
            : sa > ea 
                ? sa - ea 
                : 2 * Maths.PI - (ea - sa);
    const [x1, y1] = Vector2.add(Vector2.rotate(Vector2.scale([rx, ry], Maths.cos(sa), Maths.sin(sa)), phi), [cx, cy]);
    const [x2, y2] = Vector2.add(Vector2.rotate(Vector2.scale([rx, ry], Maths.cos(ea), Maths.sin(ea)), phi), [cx, cy]);
    const la = deltaTheta > Maths.PI ? true : false;
    return {
        point1X: x1,
        point1Y: y1,
        point2X: x2,
        point2Y: y2,
        radiusX: rx,
        radiusY: ry,
        largeArc: la,
        positive: pos,
        rotation: phi
    };
}

// This function aligns with the W3C's implementation notes on how to correct the radii.
export function correctRadii(x1: number, y1: number, x2: number, y2: number, rx: number, ry: number, phi: number) {
    const [x1P, y1P] = Vector2.rotate(Vector2.scalarMultiply([x1 - x2, y1 - y2], 0.5), -phi);
    const lambda = x1P ** 2 / rx ** 2 + y1P ** 2 / ry ** 2;
    if (Float.greaterThan(lambda, 1, Float.MACHINE_EPSILON)) {
        const s = Maths.sqrt(lambda);
        (rx = s * rx), (ry = s * ry);
    }
    return [Maths.abs(rx), Maths.abs(ry)] as [crtRx: number, crtRy: number];
}

// This function more flexible than W3C. The radii correction mentioned in the W3C implementation note only depends on the proportional relationship of `rx` and `ry`.
// But this function also takes into account the minimal value, which is useful when trying to edit the arc radii individually.
export function flexCorrectRadii(x1: number, y1: number, x2: number, y2: number, rx: number, ry: number, phi: number) {
    const [x1P, y1P] = Vector2.rotate(Vector2.scalarMultiply([x1 - x2, y1 - y2], 0.5), -phi);
    const [minRx, minRy] = [Maths.abs(x1P), Maths.abs(y1P)];

    const lambdaX = minRx ** 2 / rx ** 2;
    const lambdaY = minRy ** 2 / ry ** 2;
    const lambda = lambdaX + lambdaY;

    const lxGt1 = Float.greaterThan(lambdaX, 1, Float.MACHINE_EPSILON);
    const lyGt1 = Float.greaterThan(lambdaY, 1, Float.MACHINE_EPSILON);
    const lGt1 = Float.greaterThan(lambda, 1, Float.MACHINE_EPSILON);

    if (lxGt1 && !lyGt1) {
        const s = Maths.sqrt(1 - lambdaY);
        rx = minRx / s;
    } else if (!lxGt1 && lyGt1) {
        const s = Maths.sqrt(1 - lambdaX);
        ry = minRy / s;
    } else if (lGt1) {
        const s = Maths.sqrt(lambda);
        (rx = s * rx), (ry = s * ry);
    } else {
        // do nothing, the radii are already correct
    }
    return [Maths.abs(rx), Maths.abs(ry)] as [crtRx: number, crtRy: number];
}

// Before calling this method, you must ensure that both `radiusX` and `radiusY` are non-zero and have been corrected.
export function endpointToCenterParameterization(
    // prettier-ignore
    {
        point1X: x1,
        point1Y: y1,
        point2X: x2,
        point2Y: y2,
        radiusX: rx,
        radiusY: ry,
        largeArc: la,
        positive: pos,
        rotation: phi
    }: ArcEndpointParameterization
): ArcCenterParameterization {
    // Correction of radii must be done before calling this method.
    // The logic of this radii correction should belong to the internal property processing of a class.

    const [x1P, y1P] = Vector2.rotate(Vector2.scalarMultiply([x1 - x2, y1 - y2], 0.5), -phi);
    const sign = la !== pos ? 1 : -1;

    const num = rx ** 2 * ry ** 2 - rx ** 2 * y1P ** 2 - ry ** 2 * x1P ** 2;
    const den = rx ** 2 * y1P ** 2 + ry ** 2 * x1P ** 2;
    const frac = Maths.abs(num / den);
    // prettier-ignore
    const [cxP, cyP] = Vector2.scalarMultiply(
         [(rx * y1P) / ry, (-ry * x1P) / rx],
         sign * Maths.sqrt( frac)
     )
    const [cx, cy] = Vector2.add(Vector2.rotate([cxP, cyP], phi), Vector2.scalarMultiply([x1 + x2, y1 + y2], 0.5));
    const sa = Angle.simplify(Vector2.angle([(x1P - cxP) / rx, (y1P - cyP) / ry]));
    const ea = Angle.simplify(Vector2.angle([(-x1P - cxP) / rx, (-y1P - cyP) / ry]));
    return {
        centerX: cx,
        centerY: cy,
        radiusX: rx,
        radiusY: ry,
        startAngle: sa,
        endAngle: ea,
        positive: pos,
        rotation: phi
    };
}

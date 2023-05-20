import { Float, Vector2 } from "@geomtoy/util";

// A convex polygon is formed from the `vertices`, the `vertices` cannot have duplicates but the winding of the `vertices` dose not matter.
export function simplePointPosition(vertices: [number, number][], coordinates: [number, number], epsilon: number) {
    const l = vertices.length;
    let cpSign;
    for (let i = 0; i < l; i++) {
        const currVertex = vertices[i];
        const nextVertex = vertices[(i + 1) % l];
        const vo = Vector2.from(currVertex, nextVertex);
        const vp = Vector2.from(currVertex, coordinates);
        const cp = Vector2.cross(vp, vo);
        if (Float.equalTo(cp, 0, epsilon)) {
            const dp = Vector2.dot(vp, vo);
            if (!Float.lessThan(dp, 0, epsilon) && !Float.greaterThan(dp, Vector2.squaredMagnitude(vo), epsilon)) return 0; // on
        } else {
            if (cpSign === undefined) cpSign = Float.sign(cp, epsilon);
            if (cpSign !== Float.sign(cp, epsilon)) return 1; // outside
        }
    }
    return -1; // inside;
}

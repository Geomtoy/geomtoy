import { Maths, Vector2 } from "@geomtoy/util";

class Cartesian {
    constructor(public x: number, public y: number) {}
    toPolar() {
        const { x, y } = this;
        const r = Maths.hypot(x, y);
        const theta = Maths.atan2(y, x);
        return new Polar(r, theta);
    }
    toBarycentric(c1: [number, number], c2: [number, number], c3: [number, number]) {
        const { x, y } = this;
        const a1 = Vector2.cross(Vector2.from(c2, c3), Vector2.from(c2, [x, y]));
        const a2 = Vector2.cross(Vector2.from(c3, c1), Vector2.from(c3, [x, y]));
        const a3 = Vector2.cross(Vector2.from(c1, c2), Vector2.from(c1, [x, y]));
        return new Barycentric(a1, a2, a3);
    }
    toTrilinear(c1: [number, number], c2: [number, number], c3: [number, number]) {
        let { lambda1, lambda2, lambda3 } = this.toBarycentric(c1, c2, c3);
        const l1 = Vector2.magnitude(Vector2.from(c2, c3));
        const l2 = Vector2.magnitude(Vector2.from(c3, c1));
        const l3 = Vector2.magnitude(Vector2.from(c1, c2));

        lambda1 /= l1;
        lambda2 /= l2;
        lambda3 /= l3;
        return new Trilinear(lambda1, lambda2, lambda3);
    }
    valueOf(): [number, number] {
        return [this.x, this.y];
    }
}

class Polar {
    constructor(public r: number, public theta: number) {}
    toCartesian() {
        const { r, theta } = this;
        const x = r * Maths.cos(theta);
        const y = r * Maths.sin(theta);
        return new Cartesian(x, y);
    }
    valueOf(): [number, number] {
        return [this.r, this.theta];
    }
}

class Barycentric {
    constructor(public lambda1: number, public lambda2: number, public lambda3: number) {
        this.simplify();
    }
    simplify() {
        const { lambda1, lambda2, lambda3 } = this;
        const sum = lambda1 + lambda2 + lambda3;
        if (!Maths.equalTo(sum, 1, Number.EPSILON)) {
            this.lambda1 /= sum;
            this.lambda2 /= sum;
            this.lambda3 /= sum;
        }
    }
    toCartesian(c1: [number, number], c2: [number, number], c3: [number, number]) {
        const { lambda1, lambda2, lambda3 } = this;
        const [x, y] = Vector2.add(Vector2.add(Vector2.scalarMultiply(c1, lambda1), Vector2.scalarMultiply(c2, lambda2)), Vector2.scalarMultiply(c3, lambda3));
        return new Cartesian(x, y);
    }
    valueOf(): [number, number, number] {
        return [this.lambda1, this.lambda2, this.lambda3];
    }
}

class Trilinear {
    constructor(public lambda1: number, public lambda2: number, public lambda3: number) {
        this.simplify();
    }
    simplify() {
        const { lambda1, lambda2, lambda3 } = this;
        const sum = lambda1 + lambda2 + lambda3;
        if (!Maths.equalTo(sum, 1, Number.EPSILON)) {
            this.lambda1 /= sum;
            this.lambda2 /= sum;
            this.lambda3 /= sum;
        }
    }
    toCartesian(c1: [number, number], c2: [number, number], c3: [number, number]) {
        let { lambda1, lambda2, lambda3 } = this;
        const l1 = Vector2.magnitude(Vector2.from(c2, c3));
        const l2 = Vector2.magnitude(Vector2.from(c3, c1));
        const l3 = Vector2.magnitude(Vector2.from(c1, c2));
        lambda1 *= l1;
        lambda2 *= l2;
        lambda3 *= l3;
        return new Barycentric(lambda1, lambda2, lambda3).toCartesian(c1, c2, c3);
    }
    valueOf(): [number, number, number] {
        return [this.lambda1, this.lambda2, this.lambda3];
    }
}

export { Cartesian, Polar, Barycentric, Trilinear };

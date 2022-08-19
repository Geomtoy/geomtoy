import { Maths } from "@geomtoy/util";

export default class IntersectionDescriptor {
    public readonly aIn: [index: number, param: number];
    public readonly aOut: [index: number, param: number];
    public readonly bIn: [index: number, param: number];
    public readonly bOut: [index: number, param: number];
    public readonly intersectAtEnd: boolean = false;

    constructor(a: [index: number, param: number], b: [index: number, param: number]);
    constructor(aIn: [index: number, param: number], aOut: [index: number, param: number], bIn: [index: number, param: number], bOut: [index: number, param: number]);
    constructor(...args: [index: number, param: number][]) {
        if (args.length === 2) {
            this.aIn = args[0];
            this.aOut = args[0];
            this.bIn = args[1];
            this.bOut = args[1];
            this.intersectAtEnd = false;
        } else {
            this.aIn = args[0];
            this.aOut = args[1];
            this.bIn = args[2];
            this.bOut = args[3];
            this.intersectAtEnd = true;
        }
    }

    indexAndParams() {
        if (this.intersectAtEnd) {
            return [this.aIn, this.aOut, this.bIn, this.bOut];
        }
        return [this.aIn, this.bIn];
    }
    equalTo(other: IntersectionDescriptor, epsilon: number) {
        if (this.intersectAtEnd) {
            return other.aIn[0] === this.aIn[0] && other.aOut[0] === this.aOut[0] && other.bIn[0] === this.bIn[0] && other.bOut[0] === this.bOut[0];
        }
        return other.aIn[0] === this.aIn[0] && Maths.equalTo(other.aIn[1], this.aIn[1], epsilon) && other.bIn[0] === this.bIn[0] && Maths.equalTo(other.bIn[1], this.bIn[1], epsilon);
    }

    matchWith(other: IntersectionDescriptor, epsilon: number) {
        if (this.intersectAtEnd) {
            return (
                (other.aIn[0] === this.aIn[0] && other.aOut[0] === this.aOut[0] && other.bIn[0] === this.bIn[0] && other.bOut[0] === this.bOut[0]) ||
                (other.aIn[0] === this.bIn[0] && other.aOut[0] === this.bOut[0] && other.bIn[0] === this.aIn[0] && other.bOut[0] === this.aOut[0])
            );
        }
        return (
            (other.aIn[0] === this.aIn[0] && Maths.equalTo(other.aIn[1], this.aIn[1], epsilon) && other.bIn[0] === this.bIn[0] && Maths.equalTo(other.bIn[1], this.bIn[1], epsilon)) ||
            (other.aIn[0] === this.bIn[0] && Maths.equalTo(other.aIn[1], this.bIn[1], epsilon) && other.bIn[0] === this.aIn[0] && Maths.equalTo(other.bIn[1], this.aIn[1], epsilon))
        );
    }
}

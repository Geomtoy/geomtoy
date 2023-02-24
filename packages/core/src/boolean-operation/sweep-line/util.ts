import { Maths } from "@geomtoy/util";
import { optioner } from "../../geomtoy";

export function compareX(c1: [number, number], c2: [number, number]) {
    if (Maths.equalTo(c1[0], c2[0], optioner.options.epsilon)) {
        return 0;
    }
    return c1[0] < c2[0] ? -1 : 1;
}
export function compareY(c1: [number, number], c2: [number, number]) {
    if (Maths.equalTo(c1[1], c2[1], optioner.options.epsilon)) {
        return 0;
    }
    return c1[1] < c2[1] ? -1 : 1;
}

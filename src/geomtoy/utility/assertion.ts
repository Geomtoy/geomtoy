import util from "../utility";

import Shape from "../base/Shape";
import Point from "../shapes/basic/Point";
import Line from "../shapes/basic/Line";
import Circle from "../shapes/basic/Circle";

interface Assertion {
    condition(condition: any, msg?: string): asserts condition;
    isNumberNotNaN(value: any, p: string): asserts value is number;
    isRealNumber(value: any, p: string): asserts value is number;
    isInteger(value: any, p: string): asserts value is number;
    isPositiveNumber(value: any, p: string): asserts value is number;
    isNegativeNumber(value: any, p: string): asserts value is number;
    isNonZeroNumber(value: any, p: string): asserts value is number;
    isCoordinates(value: any, p: string): asserts value is [number, number];
    isPoint(value: any, p: string): asserts value is Point;
    isCoordinatesOrPoint(value: any, p: string): asserts value is [number, number] | Point;
    isCoordinatesOrPointArray(value: any, p: string): asserts value is ([number, number] | Point)[];
    isSize(value: any, p: string): asserts value is [number, number];
    isBoolean(value: any, p: string): asserts value is boolean;
    isArray(value: any, p: string): asserts value is any[];
    isFunction(value: any, p: string): asserts value is (...args: any) => any;
    isString(value: any, p: string): asserts value is string;
    isLine(value: any, p: string): asserts value is Line;
    isCircle(value: any, p: string): asserts value is Circle;
    isShape(value: any, p: string): asserts value is Shape;
    isShapeArray(value: any, p: string): asserts value is Shape[];
    comparison(value: any, p: string, t: "gt" | "lt" | "eq" | "ge" | "le" | "ne", n: number): void;
}

const assert: Assertion = {
    condition(condition: any, msg?: string): asserts condition {
        if (!condition) {
            throw new TypeError(`${msg}`);
        }
    },
    isNumberNotNaN(value: any, p: string): asserts value is number {
        if (!util.isNumberNotNaN(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a number not \`NaN\`(but including \`Infinity\`).`);
        }
    },
    isRealNumber(value: any, p: string): asserts value is number {
        if (!util.isRealNumber(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a real number(number excluding \`Infinity\` and \`NaN\`).`);
        }
    },
    isInteger(value: any, p: string): asserts value is number {
        if (!util.isInteger(value)) {
            throw new TypeError(`[G]The \`${p}\` should be an integer.`);
        }
    },
    isPositiveNumber(value: any, p: string): asserts value is number {
        if (!util.isPositiveNumber(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a positive number.`);
        }
    },
    isNegativeNumber(value: any, p: string): asserts value is number {
        if (!util.isNegativeNumber(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a negative number.`);
        }
    },
    isNonZeroNumber(value: any, p: string): asserts value is number {
        if (!util.isNonZeroNumber(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a nonzero number.`);
        }
    },
    isCoordinates(value: any, p: string): asserts value is [number, number] {
        if (!util.isCoordinates(value)) {
            throw new TypeError(`[G]The \`${p}\` should be coordinates.`);
        }
    },
    isPoint(value: any, p: string): asserts value is Point {
        if (!(value instanceof Point)) {
            throw new Error(`[G]The \`${p}\` should be a \`Point\`.`);
        }
    },
    isCoordinatesOrPoint(value: any, p: string): asserts value is [number, number] | Point {
        if (!util.isCoordinates(value) && !(value instanceof Point)) {
            throw new TypeError(`[G]The \`${p}\` should be coordinates or a \`Point\`.`);
        }
    },
    isCoordinatesOrPointArray(value: any, p: string): asserts value is ([number, number] | Point)[] {
        if (!(util.isArray(value) && value.every(p => util.isCoordinates(value) || p instanceof Point))) {
            throw new Error(`[G]The \`${p}\`  an array of coordinates or \`Point\`.`);
        }
    },
    isSize(value: any, p: string): asserts value is [number, number] {
        if (!util.isSize(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a size.`);
        }
    },
    isBoolean(value: any, p: string): asserts value is boolean {
        if (!util.isBoolean(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a boolean.`);
        }
    },
    isArray(value: any, p: string): asserts value is any[] {
        if (!util.isArray(value)) {
            throw new TypeError(`[G]The \`${p}\` should be an array.`);
        }
    },
    isFunction(value: any, p: string): asserts value is (...args: any) => any {
        if (!util.isFunction(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a function.`);
        }
    },
    isString(value: any, p: string): asserts value is string {
        if (!util.isString(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a string.`);
        }
    },
    isLine(value: any, p: string): asserts value is Line {
        if (!(value instanceof Line)) {
            throw new TypeError(`[G]The \`${p}\` should be a \`Line\`.`);
        }
    },
    isCircle(value: any, p: string): asserts value is Circle {
        if (!(value instanceof Circle)) {
            throw new TypeError(`[G]The \`${p}\` should be a \`Circle\`.`);
        }
    },
    isShape(value: any, p: string): asserts value is Shape {
        if (!(value instanceof Shape)) {
            throw new TypeError(`[G]The \`${p}\` should be a \`Shape\`.`);
        }
    },
    isShapeArray(value: any, p: string): asserts value is Shape[] {
        if (!(util.isArray(value) && value.every(p => p instanceof Shape))) {
            throw new Error(`[G]The \`${p}\`  an array of \`Shape\`.`);
        }
    },
    comparison(value: any, p: string, t: "gt" | "lt" | "eq" | "ge" | "le" | "ne", n: number) {
        if (t === "gt" && !(value > n)) {
            throw new TypeError(`[G]The \`${p}\` should be greater than ${n}.`);
        }
        if (t === "lt" && !(value < n)) {
            throw new TypeError(`[G]The \`${p}\` should be less than ${n}.`);
        }
        if (t === "eq" && !(value === n)) {
            throw new TypeError(`[G]The \`${p}\` should be equal to ${n}.`);
        }
        if (t === "ge" && !(value >= n)) {
            throw new TypeError(`[G]The \`${p}\` should be greater than or equal to ${n}.`);
        }
        if (t === "le" && !(value <= n)) {
            throw new TypeError(`[G]The \`${p}\` should be less than or equal to ${n}.`);
        }
        if (t === "ne" && !(value !== n)) {
            throw new TypeError(`[G]The \`${p}\` should not be equal to ${n}.`);
        }
    }
};
export default assert;

import { Float } from "../../src";

export function diffFlatNumberArray(arr1: number[], arr2: number[], tolerance = 1e-10) {
    if (arr1.length !== arr2.length) return true;
    return arr1.some((_, i) => !Float.equalTo(arr1[i], arr2[i], tolerance));
}

export function diffDepth1NumberArray(arr1: (number | number[])[], arr2: (number | number[])[], tolerance = 1e-10) {
    if (arr1.length !== arr2.length) return true;

    const deepLengthDiff = arr1.some((_, i) => {
        const arr1Elem = arr1[i];
        const arr2Elem = arr2[i];
        const d1 = Array.isArray(arr1Elem) ? arr1Elem.length : -1;
        const d2 = Array.isArray(arr2Elem) ? arr2Elem.length : -1;
        if (d1 !== d2) return true;
        return false;
    });
    if (deepLengthDiff) return true;
    return diffFlatNumberArray(arr1.flat(1), arr2.flat(1), tolerance);
}

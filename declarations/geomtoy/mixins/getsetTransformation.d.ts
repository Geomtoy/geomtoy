import Matrix from "../transformation/Matrix";
declare function getSetTransformation<T extends abstract new (...args: any[]) => any>(c: T): (abstract new (...args: any[]) => {
    [x: string]: any;
    "__#132601@#transformation": Matrix;
    getTransformation(): Matrix;
    setTransformation(m: Matrix): void;
}) & T;
export default getSetTransformation;

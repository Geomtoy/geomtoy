/**
 * @internal
 */
export type Tail<T extends any[]> = T extends [infer A, ...infer R] ? R : never
/**
 * @internal
 */
// prettier-ignore
export type ConstructorOverloads<T> =
    T extends {
        new(...args: infer A1): infer R1
        new(...args: infer A2): infer R2
        new(...args: infer A3): infer R3
        new(...args: infer A4): infer R4
        new(...args: infer A5): infer R5
        new(...args: infer A6): infer R6
        new(...args: infer A7): infer R7
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5,
        new (...args: A6) => R6,
        new (...args: A7) => R7,
    ]
    : T extends {
        new(...args: infer A1): infer R1
        new(...args: infer A2): infer R2
        new(...args: infer A3): infer R3
        new(...args: infer A4): infer R4
        new(...args: infer A5): infer R5
        new(...args: infer A6): infer R6
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5,
        new (...args: A6) => R6,
    ]
    : T extends {
        new(...args: infer A1): infer R1
        new(...args: infer A2): infer R2
        new(...args: infer A3): infer R3
        new(...args: infer A4): infer R4
        new(...args: infer A5): infer R5
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5
    ]
    : T extends {
        new(...args: infer A1): infer R1
        new(...args: infer A2): infer R2
        new(...args: infer A3): infer R3
        new(...args: infer A4): infer R4
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4
    ]
    : T extends {
        new(...args: infer A1): infer R1
        new(...args: infer A2): infer R2
        new(...args: infer A3): infer R3
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3
    ]
    : T extends {
        new(...args: infer A1): infer R1
        new(...args: infer A2): infer R2
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2
    ]
    : T extends {
        new(...args: infer A1): infer R1
    }
    ? [
        new (...args: A1) => R1
    ]
    : never
/**
 * @internal
 */
// prettier-ignore
export type TailedStaticMethods<T extends { new (...args: any): any }> = {
    [K in keyof T as T[K] extends (...args: any) => any ? K : never]
    : T[K] extends (...args: any) => any ? (...args: Tail<Parameters<T[K]>>) => ReturnType<T[K]> : never
}
/**
 * @internal
 */
export type TailedConstructor<T extends { new (...args: any): any }> = {
    (...args: Tail<ConstructorParameters<ConstructorOverloads<T>[number]>>): InstanceType<T>
}
/**
 * @internal
 */
export type TailedConstructorAndStaticMethods<T extends { new (...args: any): any }> = TailedStaticMethods<T> & TailedConstructor<T>

// export
export type RecursivePartial<T> = {
    [K in keyof T]?: T[K] extends (infer U)[] ? RecursivePartial<U>[] : T[K] extends object ? RecursivePartial<T[K]> : T[K]
}
// Fake type for user to understand
export type ConstructorDelegate<T extends { new (...args: any): any }> = {
    (...args: ConstructorParameters<T>): InstanceType<T>
}
export type StaticMethodsDelegate<T extends { new (...args: any): any }> = {
    [K in keyof T as T[K] extends (...args: any) => any ? K : never]: T[K]
}
export type Factory<T extends { new (...args: any): any }> = ConstructorDelegate<T> & StaticMethodsDelegate<T>

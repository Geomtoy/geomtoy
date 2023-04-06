import { Type } from "@geomtoy/util";
import Geometry from "../base/Geometry";

function article(name: string, adj?: string) {
    const vowels = ["A", "E", "I", "O", "U"];
    const a = adj !== undefined ? (vowels.includes(adj[0].toUpperCase()) ? `an ${adj}` : `a ${adj}`) : vowels.includes(name[0].toUpperCase()) ? "an" : "a";
    return `${a} \`${name}\``;
}
const alwaysAvailableInstanceMethods = [
    "initialized", // from Geometry
    "degenerate", // from Geometry
    "isValid", // from Geometry
    "move", // from Shape
    "toJSON", // from Object
    "toString", // from Object
    "copyFrom", // from Shape
    "clone", // from Shape
    "getGraphics", // from Shape
    "is", // from Arbitrary
    "appendVertex", // from Polygon
    "prependVertex", // from Polygon
    "setVertex", // from Polygon
    "appendCommand", // from Path
    "prependCommand", // from Path
    "setCommand" // from Path
];

function geometryInvalidText(geometryInstance: Geometry) {
    const name = geometryInstance.name;
    const id = geometryInstance.id;

    return `
        \nPlease check whether the essential properties of the \`${name}\`(${id}) have been initialized and set proper values. \
        \nIf \`Geometry\` falls into a degenerate condition, it will also be considered invalid. You can access \`degenerate\` method to determine what happened.
        \nWhen a \`Geometry\` is invalid, all of its instance methods cannot be accessed except the following: \`${alwaysAvailableInstanceMethods.join(
            "`, `"
        )}\`, nor can it be passed as an argument to other instance or static methods\`.
    `;
}

export function validGeometry(constructor: new (...args: any[]) => any) {
    Object.getOwnPropertyNames(constructor.prototype).forEach(memberName => {
        const name = constructor.name;
        const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, memberName)!;

        if (
            Type.isFunction(descriptor.value) &&
            memberName !== "constructor" /* excluding `constructor` */ &&
            !alwaysAvailableInstanceMethods.includes(memberName) /* excluding the always-available methods when invalid*/ &&
            !memberName.startsWith("_") /* excluding the private method start with `_`*/ &&
            !memberName.endsWith("_") /* excluding the protected method end with `_`*/
        ) {
            const method = descriptor.value;
            descriptor.value = function (this: Geometry) {
                if (!this.skipValidation && !this.isValid()) {
                    throw new Error(
                        `[G]Calling \`${memberName}\` of ${article(name, "invalid")}: \
                        \n${this}. \
                        \n${geometryInvalidText(this)}`
                    );
                }
                return method.call(this, ...arguments);
            };
            Object.defineProperty(constructor.prototype, memberName, descriptor);
        }
    });
}

export function validGeometryArguments(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
    const method = descriptor.value!;
    descriptor.value = function (this: typeof target) {
        for (const arg of arguments) {
            if (arg instanceof Geometry && !arg.skipValidation && !arg.isValid()) {
                throw new Error(
                    `[G]Calling \`${propertyKey}\` of \`${this.name}\` with ${article(arg.name, "invalid")}: \
                    \n${arg}. \
                    \n${geometryInvalidText(arg)}`
                );
            }
        }
        return method.call(this, ...arguments);
    };
}

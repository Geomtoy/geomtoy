import { Utility } from "@geomtoy/util";
import EventTarget from "../base/EventTarget";
import Shape from "../base/Shape";
import EventObject from "../event/EventObject";

export default class SealedShapeObject<T extends { [key: string]: Shape }> extends EventTarget {
    private _shapes: T;
    private _shapesProxy!: typeof this._shapes;

    constructor(shapes: T) {
        super();
        this._shapes = { ...shapes };
        this._initProxy();
    }
    get events() {
        return {
            shapeChanged: "shapeChange"
        };
    }
    get shapes() {
        return this._shapesProxy;
    }

    private _initProxy() {
        // basically Object.seal logical alike, but we do not force the `configurable` of properties to `true`, so we do not get `TypeError`.
        this._shapesProxy = new Proxy(this._shapes, {
            defineProperty: (target, prop, descriptor) => {
                if (Reflect.ownKeys(target).includes(prop)) {
                    if (descriptor.get !== undefined || descriptor.set !== undefined) {
                        console.warn(`[G]You could not define the property \`${prop.toString()}\` of \`shapes\` as an accessor.`);
                        return true;
                    }
                    if (!Utility.isEqualTo(target[String(prop)], descriptor.value)) this.trigger_(EventObject.collection(this, this.events.shapeChanged, String(prop), ""));
                    return Reflect.defineProperty(target, prop, {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: descriptor.value
                    });
                }
                console.warn(`[G]You could not add any new property to \`shapes\`.`);
                return true;
            },
            deleteProperty: (target, prop) => {
                if (Reflect.ownKeys(target).includes(prop)) {
                    console.warn(`[G]You could not delete any property from \`shapes\`.`);
                    return true;
                }
                return true; // `prop` do not existed, `Reflect.deleteProperty` always return `true`
            },
            setPrototypeOf: (target, prototype) => {
                console.warn(`[G]You could not set the prototype of \`shapes\`.`);
                return true;
            }
        });
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tshapes: {`,
            Object.entries(this._shapes).map(([key,value])=> `\t${key}: ${value}`),
            `\t}`,
            `}`
        ].join("\n")
    }
    toArray() {
        return Object.values(this._shapes).map(shape => shape.toArray());
    }
    toObject() {
        return { ...this.shapes };
    }
}

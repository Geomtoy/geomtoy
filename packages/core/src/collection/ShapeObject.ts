import { Utility } from "@geomtoy/util";
import EventTarget from "../base/EventTarget";
import Shape from "../base/Shape";
import EventObject from "../event/EventObject";

export default class ShapeObject extends EventTarget {
    private _shapes: { [key: string]: Shape } = {};
    private _shapesProxy!: typeof this._shapes;

    constructor(shapes: { [key: string]: Shape } = {}) {
        super();
        Object.assign(this, { shapes });
        this._initProxy();
    }
    get events() {
        return {
            shapesReset: "reset",
            shapeChanged: "shapeChange",
            shapeAdded: "shapeAdd",
            shapeRemoved: "shapeRemove"
        };
    }
    private _setShapes(value: { [key: string]: Shape }) {
        if (!Utility.isEqualTo(this._shapes, value)) this.trigger_(EventObject.simple(this, this.events.shapesReset));
        for (let p in this._shapes) delete this._shapes[p];
        for (let q in value) this._shapes[q] = value[q];
    }
    get shapes() {
        return this._shapesProxy;
    }
    set shapes(value) {
        this._setShapes(value);
    }
    private _initProxy() {
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
                this.trigger_(EventObject.collection(this, this.events.shapeAdded, String(prop), ""));
                return Reflect.defineProperty(target, prop, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: descriptor.value
                });
            },
            deleteProperty: (target, prop) => {
                if (Reflect.ownKeys(target).includes(prop)) {
                    this.trigger_(EventObject.collection(this, this.events.shapeRemoved, String(prop), ""));
                    return Reflect.deleteProperty(target, prop);
                }
                return true; // `prop` do not existed, `Reflect.deleteProperty` always return `true`
            },
            preventExtensions: target => {
                console.warn(`[G]You could not prevent extensions of \`shapes\`.`);
                return true;
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

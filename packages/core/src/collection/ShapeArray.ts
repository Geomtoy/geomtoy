import { Utility } from "@geomtoy/util";
import EventTarget from "../base/EventTarget";
import Shape from "../base/Shape";
import EventObject from "../event/EventObject";

export default class ShapeArray extends EventTarget {
    private _shapes: Shape[] = [];
    private _shapesProxy!: typeof this._shapes;

    constructor(shapes: Shape[] = []) {
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
    private _setShapes(value: Shape[]) {
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
                    // setting `length` alone to less number will not trigger `deleteProperty`
                    if (prop === "length") {
                        let i = this._shapesProxy.length - 1;
                        let newI = Number(descriptor.value) - 1;
                        while (i > newI) {
                            this.trigger_(EventObject.collection(this, this.events.shapeRemoved, i, ""));
                            i--;
                        }
                        return Reflect.defineProperty(target, prop, descriptor);
                    }

                    if (!Utility.isEqualTo(target[Number(prop)], descriptor.value)) this.trigger_(EventObject.collection(this, this.events.shapeChanged, Number(prop), ""));
                    return Reflect.defineProperty(target, prop, {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: descriptor.value
                    });
                }
                this.trigger_(EventObject.collection(this, this.events.shapeAdded, Number(prop), ""));
                return Reflect.defineProperty(target, prop, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: descriptor.value
                });
            },
            deleteProperty: (target, prop) => {
                if (Reflect.ownKeys(target).includes(prop)) {
                    this.trigger_(EventObject.collection(this, this.events.shapeRemoved, Number(prop), ""));
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
            this._shapes.map((shape,index)=> `\t${index}: ${shape}`),
            `}`
        ].join("\n")
    }
    toArray() {
        return this._shapes.map(shape => shape.toArray());
    }
    toObject() {
        return this._shapes.reduce((acc, shape, index) => {
            acc[index] = shape.toObject();
            return acc;
        }, {} as { [key: number]: object });
    }
}

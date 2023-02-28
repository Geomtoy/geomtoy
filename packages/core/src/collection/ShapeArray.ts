import { Utility } from "@geomtoy/util";
import Shape from "../base/Shape";
import EventSourceObject from "../event/EventSourceObject";
import Graphics from "../graphics";
import { ViewportDescriptor } from "../types";

export default class ShapeArray<T extends Shape> extends Shape {
    private _shapes: T[] = [];
    private _shapesProxy!: typeof this._shapes;

    constructor(shapes: T[] = []) {
        super();
        Object.assign(this, { shapes });
        this._initProxy();
    }
    static override events = {
        shapesReset: "reset",
        shapeChanged: "shapeChange",
        shapeAdded: "shapeAdd",
        shapeRemoved: "shapeRemove"
    };

    private _setShapes(value: T[]) {
        if (!Utility.isEqualTo(this._shapes, value)) this.trigger_(new EventSourceObject(this, ShapeArray.events.shapesReset));
        this._shapes.length = 0;
        for (const [i, v] of value.entries()) this._shapes[i] = v;
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
                        const newI = Number(descriptor.value) - 1;
                        while (i > newI) {
                            this.trigger_(new EventSourceObject(this, ShapeArray.events.shapeRemoved, i));
                            i--;
                        }
                        return Reflect.defineProperty(target, prop, descriptor);
                    }

                    if (!Utility.isEqualTo(target[Number(prop)], descriptor.value)) this.trigger_(new EventSourceObject(this, ShapeArray.events.shapeChanged, Number(prop)));
                    return Reflect.defineProperty(target, prop, {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: descriptor.value
                    });
                }
                this.trigger_(new EventSourceObject(this, ShapeArray.events.shapeAdded, Number(prop)));
                return Reflect.defineProperty(target, prop, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: descriptor.value
                });
            },
            deleteProperty: (target, prop) => {
                if (Reflect.ownKeys(target).includes(prop)) {
                    this.trigger_(new EventSourceObject(this, ShapeArray.events.shapeRemoved, Number(prop)));
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

    move(deltaX: number, deltaY: number) {
        for (const shape of this._shapes) {
            shape.move(deltaX, deltaY);
        }
        return this;
    }
    clone() {
        return new ShapeArray(this._shapes);
    }
    getGraphics(viewport: ViewportDescriptor) {
        const g = new Graphics();
        for (const shape of this._shapes) {
            g.concat(shape.getGraphics(viewport));
        }
        return g;
    }
    override toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.id}){`,
            `\tshapes: [`,
            ...this._shapes.map((shape)=> `\t\t${shape.name}(${shape.id})`),
            `\t]`,
            `}`
        ].join("\n")
    }
}

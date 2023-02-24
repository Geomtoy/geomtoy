import { Utility } from "@geomtoy/util";
import Shape from "../base/Shape";
import EventSourceObject from "../event/EventSourceObject";
import Graphics from "../graphics";
import { ViewportDescriptor } from "../types";

export default class ShapeObject<T extends Shape> extends Shape {
    private _shapes: { [key: string]: T } = {};
    private _shapesProxy!: typeof this._shapes;

    constructor(shapes: { [key: string]: T } = {}) {
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
    private _setShapes(value: { [key: string]: T }) {
        if (!Utility.isEqualTo(this._shapes, value)) this.trigger_(new EventSourceObject(this, ShapeObject.events.shapesReset));
        for (const k of Object.keys(this._shapes)) delete this._shapes[k];
        for (const [k, v] of Object.entries(value)) this._shapes[k] = v;
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
                    if (!Utility.isEqualTo(target[String(prop)], descriptor.value)) this.trigger_(new EventSourceObject(this, ShapeObject.events.shapeChanged, String(prop)));
                    return Reflect.defineProperty(target, prop, {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: descriptor.value
                    });
                }
                this.trigger_(new EventSourceObject(this, ShapeObject.events.shapeAdded, String(prop)));
                return Reflect.defineProperty(target, prop, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: descriptor.value
                });
            },
            deleteProperty: (target, prop) => {
                if (Reflect.ownKeys(target).includes(prop)) {
                    this.trigger_(new EventSourceObject(this, ShapeObject.events.shapeRemoved, String(prop)));
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
        for (const shape of Object.values(this._shapes)) {
            shape.move(deltaX, deltaY);
        }
        return this;
    }
    clone() {
        return new ShapeObject(this._shapes);
    }
    getGraphics(viewport: ViewportDescriptor) {
        const g = new Graphics();
        for (const shape of Object.values(this._shapes)) {
            g.concat(shape.getGraphics(viewport));
        }
        return g;
    }
    override toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tshapes: {`,
            ...Object.entries(this._shapes).map(([key,shape])=> `\t\t${key}: ${shape.name}(${shape.uuid})`),
            `\t}`,
            `}`
        ].join("\n")
    }
}

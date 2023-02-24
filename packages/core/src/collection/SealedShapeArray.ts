import { Utility } from "@geomtoy/util";
import Shape from "../base/Shape";
import EventSourceObject from "../event/EventSourceObject";
import Graphics from "../graphics";
import { ViewportDescriptor } from "../types";

export default class SealedShapeArray<T extends Shape[]> extends Shape {
    private _shapes: [...T];
    private _shapesProxy!: typeof this._shapes;

    constructor(shapes: [...T]) {
        super();
        this._shapes = [...shapes];
        this._initProxy();
    }

    static override events = {
        shapeChanged: "shapeChange"
    };

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
                    if (prop === "length") {
                        console.warn(`[G]You could not change the \`length\` of \`shapes\`.`);
                        return true;
                    }
                    if (!Utility.isEqualTo(target[Number(prop)], descriptor.value))
                        this.trigger_(new EventSourceObject(this, SealedShapeArray.events.shapeChanged, target[Number(prop)], Number(prop)));
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

    move(deltaX: number, deltaY: number) {
        for (const shape of this._shapes) {
            shape.move(deltaX, deltaY);
        }
        return this;
    }
    clone() {
        return new SealedShapeArray(this._shapes);
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
            `${this.name}(${this.uuid}){`,
            `\tshapes: [`,
            ...this._shapes.map(shape=> `\t\t${shape.name}(${shape.uuid})`),
            `\t]`,
            `}`
        ].join("\n")
    }
}

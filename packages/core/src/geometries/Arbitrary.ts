import Geometry from "../base/Geometry";
import EventSourceObject from "../event/EventSourceObject";
import Graphics from "../graphics";
import { stated } from "../misc/decor-cache";
import { validGeometry } from "../misc/decor-geometry";
import Transformation from "../transformation";
import { ViewportDescriptor } from "../types";

@validGeometry
export default class Arbitrary extends Geometry {
    private _geometry: Geometry | null = null;

    constructor(geometry?: Geometry) {
        super();
        if (geometry !== undefined) {
            Object.assign(this, { geometry });
        }
    }

    static override events = {
        geometryChanged: "geometry"
    };

    private _setGeometry(value: Geometry | null) {
        if (value instanceof Arbitrary) value = value._geometry;
        if (value !== this._geometry) this.trigger_(new EventSourceObject(this, Arbitrary.events.geometryChanged));
        this._geometry = value;
    }

    get geometry() {
        return this._geometry;
    }
    set geometry(value: Geometry | null) {
        this._setGeometry(value);
    }

    @stated
    initialized() {
        return this._geometry !== null;
    }

    is<T extends typeof Geometry>(ctor: T): this is { geometry: InstanceType<T> } {
        return this._geometry instanceof ctor;
    }

    apply(transformation: Transformation) {
        return this._geometry!.apply(transformation);
    }

    move(deltaX: number, deltaY: number) {
        this._geometry!.move(deltaX, deltaY);
        return this;
    }
    clone() {
        return new Arbitrary(this._geometry!);
    }
    copyFrom(geometry: Geometry | null): this {
        this._setGeometry(geometry);
        return this;
    }
    getGraphics(viewport: ViewportDescriptor) {
        if (!this.initialized()) return new Graphics();
        return this._geometry!.getGraphics(viewport);
    }

    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.id}){`,
             `\tgeometry: ${this.geometry}(${this.geometry?.id})`, 
             `}`
        ].join("\n");
    }
}

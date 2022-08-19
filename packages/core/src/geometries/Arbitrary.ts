import Geometry from "../base/Geometry";
import EventObject from "../event/EventObject";
import GeometryGraphics from "../graphics/GeometryGraphics";
import { validGeometry } from "../misc/decor-valid-geometry";
import Transformation from "../transformation";
import { ViewportDescriptor } from "../types";
import Point from "./basic/Point";

@validGeometry
export default class Arbitrary extends Geometry {
    private _geometry: Geometry | null = null;

    constructor(geometry?: Geometry) {
        super();
        if (geometry !== undefined) {
            Object.assign(this, { geometry });
        }
    }

    get events() {
        return {
            geometryChanged: "geometry"
        };
    }

    get geometry() {
        return this._geometry;
    }
    set geometry(value: Geometry | null) {
        this._setGeometry(value);
    }

    protected initialized_() {
        return this._geometry !== null;
    }

    dimensionallyDegenerate() {
        if (!this.initialized_()) return true;
        return this._geometry!.dimensionallyDegenerate?.() ?? false;
    }

    private _setGeometry(value: Geometry | null) {
        if (value instanceof Arbitrary) value = value._geometry;
        if (value !== this._geometry) this.trigger_(EventObject.simple(this, this.events.geometryChanged));
        this._geometry = value;
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
    moveAlongAngle(angle: number, distance: number) {
        this._geometry!.moveAlongAngle(angle, distance);
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
        if (!this.initialized_()) return new GeometryGraphics();
        return this._geometry!.getGraphics(viewport);
    }

    toString() {
        return [`${this.name}(${this.uuid}){`, `\tgeometry: ${this.geometry}`, `}`].join("\n");
    }
    toArray() {
        return [];
    }
    toObject() {
        return {};
    }
}

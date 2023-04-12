import Geometry from "../base/Geometry";
import EventSourceObject from "../event/EventSourceObject";
import Graphics from "../graphics";
import { validGeometry } from "../misc/decor-geometry";
import { stated, statedWithBoolean } from "../misc/decor-stated";
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
        this.initState_();
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

    initialized() {
        // We do not require the `geometry` to be non-degenerate, but we cannot tolerate it not being initialized.
        return this._geometry !== null && this._geometry.initialized();
    }
    degenerate(check: false): this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;
        return check ? false : this;
    }

    is<T extends typeof Geometry>(ctor: T): this is { geometry: InstanceType<T> } {
        return this._geometry instanceof ctor;
    }

    getBoundingBox() {
        const dg = this.geometry!.degenerate(false);
        return dg!.getBoundingBox();
    }

    apply(transformation: Transformation) {
        const dg = this.geometry!.degenerate(false);
        return dg!.apply(transformation);
    }

    move(deltaX: number, deltaY: number) {
        this._geometry!.move(deltaX, deltaY);
        return this;
    }
    clone() {
        const ret = new Arbitrary();
        ret._geometry = this._geometry === null ? null : (this._geometry.clone() as Geometry);
        return ret;
    }
    copyFrom(geometry: Geometry | null): this {
        this._setGeometry(geometry);
        return this;
    }
    getGraphics(viewport: ViewportDescriptor) {
        if (!this.initialized()) return new Graphics();
        return this._geometry!.getGraphics(viewport);
    }

    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            geometry: this._geometry === null ? null : this._geometry.toJSON()
        };
    }
}

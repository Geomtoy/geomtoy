import util from "./utility";
import coord from "./utility/coordinate";
import assert from "./utility/assertion";
import bbox from "./utility/boundingBox";
import { sealed } from "./decorator";
import Scheduler, { schedulerOf } from "./helper/Scheduler";
import Optioner, { optionerOf } from "./helper/Optioner";

import { Options, Tail, ConstructorOverloads, ConstructorTailer, RecursivePartial, Factory, StaticMethodsMapper, OwnerCarrier, BaseObjectFactoryCollection } from "./types";
import VanillaCanvas from "./renderer/vanilla-canvas";
import VanillaSvg from "./renderer/vanilla-svg";
import BaseObject from "./base/BaseObject";
import math from "./utility/math";
import angle from "./utility/angle";

import Arc from "./shapes/basic/Arc";
import Bezier from "./shapes/basic/Bezier";
import Circle from "./shapes/basic/Circle";
import Ellipse from "./shapes/basic/Ellipse";
import Image from "./shapes/basic/Image"
import Line from "./shapes/basic/Line";
import LineSegment from "./shapes/basic/LineSegment";
import Point from "./shapes/basic/Point";
import QuadraticBezier from "./shapes/basic/QuadraticBezier";
import Ray from "./shapes/basic/Ray";
import Rectangle from "./shapes/basic/Rectangle";
import RegularPolygon from "./shapes/basic/RegularPolygon";
import Square from "./shapes/basic/Square";
import Text from "./shapes/basic/Text";
import Triangle from "./shapes/basic/Triangle";
import Vector from "./shapes/basic/Vector";

import Group from "./group";
import Inversion from "./inversion";
import Relationship from "./relationship";
import Transformation from "./transformation";

const shapes = {
    Arc,
    Bezier,
    Circle,
    Ellipse,
    Image,
    Line,
    LineSegment,
    Point,
    QuadraticBezier,
    Ray,
    Rectangle,
    RegularPolygon,
    Square,
    Text,
    Triangle,
    Vector
};
const objects = {
    ...shapes,
    Group,
    Inversion,
    Relationship,
    Transformation
};

function factory<T extends { new (...args: any[]): any }>(owner: Geomtoy, ctor: T): Factory<T> {
    // Use arrow function to define tailed constructor and static methods to avoid user trying to `new`(create instance of) them.
    const constructorTailer: ConstructorTailer<T> = (...args: Tail<ConstructorParameters<ConstructorOverloads<T>[number]>>) => {
        return new ctor(owner, ...(args as Tail<ConstructorParameters<T>>));
    };

    const staticMethodsMapper: StaticMethodsMapper<T> = {} as StaticMethodsMapper<T>;
    // DO use `Object.getOwnPropertyNames` to retrieve all enumerable and non-enumerable property names,
    // for static methods defined as function like `static method(){}` is non-enumerable according to ES6 standard,
    // and static methods defined as variable like `static method = function(){} or () => {}` is enumerable according to ES6 standard.
    Object.getOwnPropertyNames(ctor).forEach(name => {
        let member = ctor[name as Extract<keyof T, string>];
        if (util.isFunction(member)) {
            staticMethodsMapper[name as keyof StaticMethodsMapper<T>] = member as unknown as StaticMethodsMapper<T>[keyof StaticMethodsMapper<T>];
        }
    });
    const ownerCarrier: OwnerCarrier = { owner };
    return Object.assign(constructorTailer, staticMethodsMapper, ownerCarrier);
}

interface Geomtoy extends BaseObjectFactoryCollection {}
class Geomtoy {
    private _uuid = util.uuid();

    private _width: number = NaN;
    private _height: number = NaN;
    private _scale: number = 1;
    private _offset: [number, number] = [0, 0];

    private _xAxisPositiveOnRight: boolean = true;
    private _yAxisPositiveOnBottom: boolean = true;
    private _origin: [number, number] = [0, 0];

    private _scheduler: Scheduler;
    private _optioner: Optioner;

    private _globalTransformation = new Transformation(this);
    private _globalBoundingBox: [number, number, number, number] = [NaN, NaN, NaN, NaN];

    constructor(width: number, height: number, options: RecursivePartial<Options> = {}) {
        Object.assign(this, { width, height });

        Object.keys(objects).forEach((name: keyof typeof objects) => {
            Object.defineProperty(this, name, {
                configurable: false,
                enumerable: true,
                get() {
                    return factory(this, objects[name]);
                }
            });
        });

        this._optioner = optionerOf(this);
        this._scheduler = schedulerOf(this);
        this.options(options);
        return Object.seal(this);
    }

    static get adapters() {
        return {
            VanillaCanvas,
            VanillaSvg
        };
    }
    get utils() {
        const options = this._optioner.options;
        return {
            approximatelyEqualTo(n1: number, n2: number) {
                return math.equalTo(n1, n2, options.epsilon);
            },
            definitelyGreaterThan(n1: number, n2: number) {
                return math.greaterThan(n1, n2, options.epsilon);
            },
            definitelyLessThan(n1: number, n2: number) {
                return math.lessThan(n1, n2, options.epsilon);
            },
            uuid: util.uuid,
            degreeToRadian: angle.degreeToRadian,
            radianToDegree: angle.radianToDegree
        };
    }

    get width() {
        return this._width;
    }
    set width(value) {
        assert.isPositiveNumber(value, "width");
        this._width = value;
    }
    get height() {
        return this._height;
    }
    set height(value) {
        assert.isPositiveNumber(value, "height");
        this._height = value;
    }
    get scale() {
        return this._scale;
    }
    set scale(value) {
        assert.isPositiveNumber(value, "scale");
        this._scale = value;
        this._refresh();
    }
    get origin(): [number, number] {
        return coord.clone(this._origin);
    }
    set origin(value) {
        assert.isCoordinate(value, "origin");
        this._origin = value;
        this._refresh();
    }

    get offset(): [number, number] {
        return [...this._offset];
    }
    set offset(value) {
        assert.isCoordinate(value, "offset");
        this._offset = value;
        this._refresh();
    }
    get xAxisPositiveOnRight() {
        return this._xAxisPositiveOnRight;
    }
    set xAxisPositiveOnRight(value) {
        assert.isBoolean(value, "xAxisPositiveOnRight");
        this._xAxisPositiveOnRight = value;
        this._refresh();
    }
    get yAxisPositiveOnBottom() {
        return this._yAxisPositiveOnBottom;
    }
    set yAxisPositiveOnBottom(value) {
        assert.isBoolean(value, "yAxisPositiveOnBottom");
        this._yAxisPositiveOnBottom = value;
        this._refresh();
    }

    get name() {
        return this.constructor.name;
    }
    get uuid() {
        return this._uuid;
    }
    get globalTransformation() {
        return this._globalTransformation.clone();
    }
    get globalBoundingBox() {
        return bbox.clone(this._globalBoundingBox);
    }

    private _refresh() {
        const { width, height, origin, scale, offset, xAxisPositiveOnRight: xpr, yAxisPositiveOnBottom: ypb } = this;
        this._globalTransformation
            .reset()
            .translate(coord.x(origin) + coord.x(offset), coord.y(origin) + coord.y(offset))
            .scale(xpr ? scale : -scale, ypb ? scale : -scale);

        const [x, y] = this.globalTransformation.antitransformCoordinate([xpr ? 0 : width, ypb ? 0 : height]);
        bbox.assign(this._globalBoundingBox, bbox.from([x, y], [width / scale, height / scale]));
    }

    options(): Options;
    options(options: RecursivePartial<Options>): void;
    options(options?: any) {
        if (options === undefined) return this._optioner.getOptions();
        this._optioner.setOptions(options);
    }

    nextTick(todo: (...args: any) => any) {
        assert.isFunction(todo, "todo");
        this._scheduler.nextTick(todo);
    }

    adopt(object: BaseObject) {
        object.owner = this;
    }
}

sealed(Geomtoy);
/**
 * @category Entry
 */
export default Geomtoy;
export { objects, shapes };

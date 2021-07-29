import Point from "./Point";
import Line from "./Line";
import Segment from "./Segment";
import Vector from "./Vector";
import Triangle from "./Triangle";
import Circle from "./Circle";
import Rectangle from "./Rectangle";
import Polyline from "./Polyline";
import Polygon from "./Polygon";
import RegularPolygon from "./RegularPolygon";
import Inversion from "./inversion/Inversion";
import Ellipse from "./Ellipse";
import Matrix from "./transformation/Matrix";
import { Options } from "./types";
declare class Geomtoy {
    #private;
    width: number;
    height: number;
    constructor(width: number, height: number, options?: Partial<Options>);
    static adapters: object;
    get options(): Options;
    get Point(): {
        new (...args: any[]): {
            [x: string]: any;
            options: Options;
        };
    } & typeof Point;
    get Line(): {
        new (...args: any[]): {
            [x: string]: any;
            options: Options;
        };
    } & typeof Line;
    get Segment(): {
        new (...args: any[]): {
            [x: string]: any;
            options: Options;
        };
    } & typeof Segment;
    get Vector(): {
        new (...args: any[]): {
            [x: string]: any;
            options: Options;
        };
    } & typeof Vector;
    get Triangle(): {
        new (...args: any[]): {
            [x: string]: any;
            options: Options;
        };
    } & typeof Triangle;
    get Circle(): {
        new (...args: any[]): {
            [x: string]: any;
            options: Options;
        };
    } & typeof Circle;
    get Ellipse(): {
        new (...args: any[]): {
            [x: string]: any;
            options: Options;
        };
    } & typeof Ellipse;
    get Rectangle(): {
        new (...args: any[]): {
            [x: string]: any;
            options: Options;
        };
    } & typeof Rectangle;
    get Polyline(): {
        new (...args: any[]): {
            [x: string]: any;
            options: Options;
        };
    } & typeof Polyline;
    get Polygon(): {
        new (...args: any[]): {
            [x: string]: any;
            options: Options;
        };
    } & typeof Polygon;
    get Inversion(): {
        new (...args: any[]): {
            [x: string]: any;
            options: Options;
        };
    } & typeof Inversion;
    get RegularPolygon(): {
        new (...args: any[]): {
            [x: string]: any;
            options: Options;
        };
    } & typeof RegularPolygon;
    getCoordinateSystem(): {
        xAxisPositiveOnRight: boolean;
        yAxisPositiveOnBottom: boolean;
        originX: number;
        originY: number;
        scale: number;
    };
    setCoordinateSystem({ xAxisPositiveOnRight, yAxisPositiveOnBottom, originX, originY, scale }: {
        xAxisPositiveOnRight?: boolean | undefined;
        yAxisPositiveOnBottom?: boolean | undefined;
        originX?: number | undefined;
        originY?: number | undefined;
        scale?: number | undefined;
    }): void;
    getGlobalTransformation(): Matrix;
    setGlobalTransformation(matrix: Matrix): void;
}
export default Geomtoy;

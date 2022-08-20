import Geomtoy from "./geomtoy";

/** @category Entry */
export { Geomtoy };

export * from "./types";

import BaseObject from "./base/BaseObject";
import EventTarget from "./base/EventTarget";
import Shape from "./base/Shape";
import Geometry from "./base/Geometry";
import EventObject from "./event/EventObject";
/** @category Base */
export { BaseObject, EventTarget, Shape, Geometry, EventObject };

import Arc from "./geometries/basic/Arc";
import Bezier from "./geometries/basic/Bezier";
import Circle from "./geometries/basic/Circle";
import Ellipse from "./geometries/basic/Ellipse";
import Line from "./geometries/basic/Line";
import LineSegment from "./geometries/basic/LineSegment";
import Point from "./geometries/basic/Point";
import QuadraticBezier from "./geometries/basic/QuadraticBezier";
import Ray from "./geometries/basic/Ray";
import Rectangle from "./geometries/basic/Rectangle";
import RegularPolygon from "./geometries/basic/RegularPolygon";
import Triangle from "./geometries/basic/Triangle";
import Vector from "./geometries/basic/Vector";

import Path from "./geometries/advanced/Path";
import Polygon from "./geometries/advanced/Polygon";
import Compound from "./geometries/advanced/Compound";

import Image from "./non-geometries/Image";
import Text from "./non-geometries/Text";

import Arbitrary from "./geometries/Arbitrary";

/** @category Shape */
export { Arc, Bezier, Circle, Ellipse, Image, Line, LineSegment, Point, QuadraticBezier, Ray, Rectangle, RegularPolygon, Text, Triangle, Vector, Path, Polygon, Compound, Arbitrary };

import SealedShapeArray from "./collection/SealedShapeArray";
import SealedShapeObject from "./collection/SealedShapeObject";
import ShapeArray from "./collection/ShapeArray";
import ShapeObject from "./collection/ShapeObject";

/** @category Collection */
export { SealedShapeArray, SealedShapeObject, ShapeArray, ShapeObject };

import Dynamic from "./dynamic";
import Inversion from "./inversion";
import Relationship from "./relationship";
import Transformation from "./transformation";
import BooleanOperation from "./boolean-operation";

/** @category Tool */
export { Dynamic, Inversion, Relationship, Transformation, BooleanOperation };

import GeometryGraphics from "./graphics/GeometryGraphics";
import ImageGraphics from "./graphics/ImageGraphics";
import TextGraphics from "./graphics/TextGraphics";
/** @category Graphics */
export { GeometryGraphics, ImageGraphics, TextGraphics };

import EndpointIntersection from "./helper/EndpointIntersection";
export { EndpointIntersection };

import Geomtoy from "./geomtoy";

/** @category Entry */
export { Geomtoy };

export * from "./types";

import BaseObject from "./base/BaseObject";
import EventTarget from "./base/EventTarget";
import Shape from "./base/Shape";
import Geometry from "./base/Geometry";
import EventObject from "./event/EventObject";
import EventSourceObject from "./event/EventSourceObject";
/** @category Base */
export { BaseObject, EventTarget, Shape, Geometry, EventObject, EventSourceObject };

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

import Path from "./geometries/general/Path";
import Polygon from "./geometries/general/Polygon";
import Compound from "./geometries/general/Compound";

import Image from "./non-geometries/Image";
import Text from "./non-geometries/Text";

import Arbitrary from "./geometries/Arbitrary";

/** @category Shape */
export { Arc, Bezier, Circle, Ellipse, Image, Line, LineSegment, Point, QuadraticBezier, Ray, Rectangle, RegularPolygon, Text, Triangle, Vector, Path, Polygon, Compound, Arbitrary };

import SealedShapeArray from "./collection/SealedShapeArray";
import SealedShapeObject from "./collection/SealedShapeObject";
import ShapeArray from "./collection/ShapeArray";
import ShapeObject from "./collection/ShapeObject";
import SealedGeometryArray from "./collection/SealedGeometryArray";
import SealedGeometryObject from "./collection/SealedGeometryObject";
import GeometryArray from "./collection/GeometryArray";
import GeometryObject from "./collection/GeometryObject";

/** @category Collection */
export { SealedShapeArray, SealedShapeObject, ShapeArray, ShapeObject, SealedGeometryArray, SealedGeometryObject, GeometryArray, GeometryObject };

import Dynamic from "./dynamic";
import Inversion from "./inversion";
import Intersection from "./intersection";
import Transformation from "./transformation";
import BooleanOperation from "./boolean-operation";

/** @category Tool */
export { Dynamic, Inversion, Intersection, Transformation, BooleanOperation };

import Graphics from "./graphics";
import GeometryGraphic from "./graphics/GeometryGraphic";
import ImageGraphic from "./graphics/ImageGraphic";
import TextGraphic from "./graphics/TextGraphic";
/** @category Graphics */
export { Graphics, GeometryGraphic, ImageGraphic, TextGraphic };

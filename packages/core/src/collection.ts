import Arc from "./shapes/basic/Arc";
import Bezier from "./shapes/basic/Bezier";
import Circle from "./shapes/basic/Circle";
import Ellipse from "./shapes/basic/Ellipse";
import Image from "./shapes/basic/Image";
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
import Path from "./shapes/advanced/Path";
import Polygon from "./shapes/advanced/Polygon";

import Group from "./group";
import Inversion from "./inversion";
import Relationship from "./relationship";
import Transformation from "./transformation";

export const shapes = {
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
    Vector,
    Path,
    Polygon
};
export const nonShapes = {
    Group,
    Inversion,
    Relationship,
    Transformation
};

export const objects = {
    ...shapes,
    ...nonShapes
};

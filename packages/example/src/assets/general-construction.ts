import { EventObject, Line, LineSegment, Point, Text } from "@geomtoy/core";

export function twoPointsLineSegment(this: LineSegment, e1: EventObject<Point>, e2: EventObject<Point>) {
    this.copyFrom(new LineSegment(e1.target, e2.target));
}
export function twoPointsLine(this: Line, e1: EventObject<Point>, e2: EventObject<Point>) {
    this.copyFrom(Line.fromTwoPoints(e1.target, e2.target));
}
export function locateLabel(this: Text, e: EventObject<Point>) {
    this.coordinates = e.target.coordinates;
}

import { Path, Point, Polygon } from "@geomtoy/core";
import { Maths, Box } from "@geomtoy/util";
import { strokeFill } from "../assets/common";

export function randomPolygonVertex(box: [number, number, number, number] = [-100, -100, 200, 200]) {
    return Polygon.vertex(Point.random(box));
}

export function randomPathCommand(box: [number, number, number, number] = [-100, -100, 200, 200]) {
    const typeRandom = Maths.random();

    const commandType = typeRandom > 0.2 ? (typeRandom > 0.4 ? (typeRandom > 0.6 ? (typeRandom > 0.8 ? "arcTo" : "bezierTo") : "quadraticBezierTo") : "lineTo") : "moveTo";

    switch (commandType) {
        case "moveTo": {
            return Path.moveTo(Point.random(box));
        }
        case "lineTo": {
            return Path.lineTo(Point.random(box));
        }
        case "quadraticBezierTo": {
            return Path.quadraticBezierTo(Point.random(box), Point.random(box));
        }
        case "bezierTo": {
            return Path.bezierTo(Point.random(box), Point.random(box), Point.random(box));
        }
        case "arcTo": {
            const radiusX = (Box.width(box) * Maths.random()) / 2;
            const radiusY = (Box.height(box) * Maths.random()) / 2;
            const positive = Maths.random() > 0.5;
            const largeArc = Maths.random() > 0.5;
            const rotation = Maths.random() * Maths.PI * 2;
            return Path.arcTo(radiusX, radiusY, rotation, largeArc, positive, Point.random(box));
        }
    }
}

export function strokeFillByIndex(index: number) {
    const arr = [
        strokeFill("purple"),
        strokeFill("green"),
        strokeFill("cyan"),
        strokeFill("orange"),
        strokeFill("lightBlue"),
        strokeFill("deepOrange"),
        strokeFill("teal"),
        strokeFill("amber"),
        strokeFill("lime"),
        strokeFill("brown")
    ];
    return arr[index % arr.length];
}

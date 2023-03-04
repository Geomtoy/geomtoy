import { centerToEndpointParameterization, endpointToCenterParameterization } from "../misc/arc";
import { type GeometryGraphicCommand, GeometryGraphicCommandType, type FillRule } from "../types";

export default class GeometryGraphic {
    commands: GeometryGraphicCommand[] = [];
    fillRule: FillRule = "nonzero";
    private _currentXY: [number, number] = [0, 0];
    private _startXY: [number, number] = [0, 0];

    moveTo(x: number, y: number) {
        this.commands.push({
            type: GeometryGraphicCommandType.MoveTo,
            x,
            y
        });
        this._currentXY = [x, y];
        this._startXY = [x, y];
        return this;
    }
    lineTo(x: number, y: number) {
        this.commands.push({
            type: GeometryGraphicCommandType.LineTo,
            x,
            y
        });
        this._currentXY = [x, y];
        return this;
    }
    bezierTo(controlPoint1X: number, controlPoint1Y: number, controlPoint2X: number, controlPoint2Y: number, x: number, y: number) {
        this.commands.push({
            type: GeometryGraphicCommandType.BezierTo,
            controlPoint1X,
            controlPoint1Y,
            controlPoint2X,
            controlPoint2Y,
            x,
            y
        });
        this._currentXY = [x, y];
        return this;
    }
    quadraticBezierTo(controlPointX: number, controlPointY: number, x: number, y: number) {
        this.commands.push({
            type: GeometryGraphicCommandType.QuadraticBezierTo,
            controlPointX,
            controlPointY,
            x,
            y
        });
        this._currentXY = [x, y];
        return this;
    }
    centerArcTo(centerX: number, centerY: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, positive: boolean = true) {
        const { point1X, point1Y, point2X, point2Y, largeArc } = centerToEndpointParameterization({ centerX, centerY, radiusX, radiusY, startAngle, endAngle, rotation, positive });

        // `Canvas` logic
        if (this.commands.length === 0) {
            // Move to the starting point of the arc, if this `centerArcTo` will be the first command,
            // like `Canvas` implicitly do. We make it explicitly for `SVG`
            this.moveTo(point1X, point1Y);
        } else {
            // Line to the starting point of the arc, if this `centerArcTo` is not the first command,
            // like `Canvas` implicitly do. We make it explicitly for `SVG`
            this.lineTo(point1X, point1Y);
        }
        this.commands.push({
            type: GeometryGraphicCommandType.ArcTo,
            centerX,
            centerY,
            radiusX,
            radiusY,
            startAngle,
            endAngle,
            rotation,
            positive,
            x: point2X,
            y: point2Y,
            largeArc
        });
        this._currentXY = [point2X, point2Y];
        return this;
    }
    endpointArcTo(radiusX: number, radiusY: number, rotation: number, largeArc: boolean, positive: boolean, x: number, y: number) {
        const [point1X, point1Y] = this._currentXY;
        const [point2X, point2Y] = [x, y];
        // prettier-ignore
        const {
            centerX,
            centerY, 
            startAngle,
            endAngle
        } = endpointToCenterParameterization({ point1X, point1Y, point2X,point2Y, radiusX, radiusY, largeArc, positive, rotation })

        this.commands.push({
            type: GeometryGraphicCommandType.ArcTo,
            centerX,
            centerY,
            radiusX,
            radiusY,
            startAngle,
            endAngle,
            rotation,
            positive,
            x: point2X,
            y: point2Y,
            largeArc
        });
        this._currentXY = [point2X, point2Y];
        return this;
    }
    close() {
        this.commands.push({
            type: GeometryGraphicCommandType.Close
        });
        this._currentXY = this._startXY;
        return this;
    }
}

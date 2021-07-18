import Point from "./Point"
import Circle from "./Circle"

class Triangle {
    p1
    p2
    p3
    
    constructor(p1, p2, p3) {
        this.p1 = p1
        this.p2 = p2
        this.p3 = p3
    }
    //内切圆
    getInscribedCircle() {
        let a = this.p1,
            b = this.p2,
            c = this.p3,
            lA = b.getDistanceFromPoint(c),
            lB = a.getDistanceFromPoint(c),
            lC = a.getDistanceFromPoint(b),
            d = lA + lB + lC, //周长
            p = d / 2, //半周长
            s = Math.sqrt(p * (p - lA) * (p - lB) * (p - lC)), //海伦公式
            cx = (lA * a.x + lB * b.x + lC * c.x) / d,
            cy = (lA * a.y + lB * b.y + lC * c.y) / d,
            r = (2 * s) / d
        return new Circle(r, cx, cy)
    }
    //旁切圆
    getEscribedCircles(){


    }
    //外接圆
    getCircumscribedCircle(){

    } 


    getGravityCenterPoint() {
        let a = this.p1,
            b = this.p2,
            c = this.p3,
            x = (a.x + b.x + c.x) / 3,
            y = (a.y + b.y + c.y) / 3
        return new Point(x, y)
    }
    getCircumscribedCircleCenterPoint() {
        let a = this.p1,
            b = this.p2,
            c = this.p3,
            x1 = a.x,
            y1 = a.y,
            x2 = b.x,
            y2 = b.y,
            x3 = c.x,
            y3 = c.y,
            a1 = 2 * (x2 - x1),
            b1 = 2 * (y2 - y1),
            c1 = x2 * x2 + y2 * y2 - x1 * x1 - y1 * y1,
            a2 = 2 * (x3 - x2),
            b2 = 2 * (y3 - y2),
            c2 = x3 * x3 + y3 * y3 - x2 * x2 - y2 * y2,
            x = (c1 * b2 - c2 * b1) / (a1 * b2 - a2 * b1),
            y = (a1 * c2 - a2 * c1) / (a1 * b2 - a2 * b1)
        return Point(x, y)
    }

    getOrthoCenterPoint() {
        let a = this.p1,
            b = this.p2,
            c = this.p3,
            a1 = b.x - c.x,
            b1 = b.y - c.y,
            c1 = a1 * a.y - b1 * a.x,
            a2 = a.x - c.x,
            b2 = a.y - c.y,
            c2 = a2 * b.y - b2 * b.x,
            x = (a1 * c2 - a2 * c1) / (a2 * b1 - a1 * b2),
            y = (b1 * c2 - b2 * c1) / (a2 * b1 - a1 * b2)
        return Point(x, y)
    }
}

export default Triangle

import Vector from "./Vector"
import Point from "./Point"

class Arc {
    ellipse
    p1
    p2

    constructor(ellipse, p1, p2, large = false) {
        this.ellipse = ellipse
        this.p1 = p1
        this.p2 = p2
        this.large = large
        this.clockwise = clockwise

        if(this.p1.isSameAs(this.p2)){
            throw new Error(`[G]The two end points of an \`Arc\` must be distinct.`)
        }
    }

    getLength(){
        if(this.ellipse.radius){
            let pO = this.ellipse.centerPoint
                pA = this.p1
                pB = this.p2,
                aOA = new Vector(pO,pA).angle
                aOB = new Vector(pO,pB).angle,
                angle 

            if(this.large){
                angle
            }
        }
    }



}

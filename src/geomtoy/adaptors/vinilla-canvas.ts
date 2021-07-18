import Path from "../utility/Path"
import _ from "lodash"

export default class artist {
    constructor(public path: Path, public ctx: CanvasRenderingContext2D) {}

    paint() {
        this.ctx.beginPath()
        _.forEach(this.path.valueOf("canvas"), d => {
            let dName = d[0]
            if (dName === Path.D.M) {
                this.ctx.moveTo(<number>d[1], <number>d[2])
            }
            if (dName === Path.D.L) {
                this.ctx.lineTo(<number>d[1], <number>d[2])
            }
            if (dName === Path.D.C) {
                this.ctx.bezierCurveTo(<number>d[1], <number>d[2], <number>d[3], <number>d[4], <number>d[5], <number>d[6])
            }
            if (dName === Path.D.Q) {
                this.ctx.quadraticCurveTo(<number>d[1], <number>d[2], <number>d[3], <number>d[4])
            }
            if (dName === Path.D.Z) {
                this.ctx.closePath()
            }
        })
    }
}

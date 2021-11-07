import Geomtoy from "../../src/geomtoy"
import "./assets/misc"
import { colors, mathFont } from "./assets/assets"
import Interact from "./assets/interact"
import { Collection, Drawable, Touchable } from "./assets/GeomObjectWrapper"

const canvas = document.querySelector("#canvas") as HTMLCanvasElement
const svg = document.querySelector("#svg") as SVGSVGElement
const description = document.querySelector("#description") as HTMLElement
description.innerHTML = `
    <strong>Touchables</strong>
    <ul>
        <li>Points: A, B, P</li>
        <li>Lines: AB</li>
        <li>Circles: O</li>
    </ul>
    <strong>Description</strong>
    <ol>
        <li>Point P is constrained on line AB.</li>
        <li>Move point P to determine the distance between it and point A. The distance will be kept until you move point P.</li>
        <li>Point A and point B determine line AB.</li>
        <li>Point A, point B and point P will follow line AB to move.</li>
        <li>Move line AB or circle O to get the intersection points of them.</li>
    </ol>
`

svg.style.display = "none"

const G = new Geomtoy(100, 100, {
    epsilon: 2 ** -32,
    graphics: {
        pointSize: 6,
        arrow: {
            width: 3,
            length: 20,
            foldback: 0,
            noFoldback: false
        }
    }
})
G.yAxisPositiveOnBottom = false
G.scale = 10

const renderer = new Geomtoy.adapters.VanillaCanvas(canvas, G, { lineJoin: "round" })
const collection = new Collection()
const interact = new Interact(renderer, collection)

interact.startDragAndDrop()
interact.startZoomAndPan()
interact.startResponsive((width, height) => {
    G.width = width
    G.height = height
    G.origin = [width / 2, height / 2]
})

const main = () => {
    const pointA = G.Point(-25, -12)
    const pointB = G.Point(-20, 25)

    const offsetLabel = function ([...args]) {
        this.point = args[0].move(1, 1)
    }
    const lineAB = G.Line()
        .bind([pointA, pointB], function ([p1, p2]) {
            this.copyFrom(G.Line.fromTwoPoints(p1, p2))
        })
        .on("*", function () {
            pointA.mute()
            pointB.mute()
            const [oldX, oldY] = pointA.coordinate
            const [newX, newY] = this.point.coordinate
            const [dx, dy] = [newX - oldX, newY - oldY]
            pointA.moveSelf(dx, dy)
            pointB.moveSelf(dx, dy)
            pointA.unmute()
            pointB.unmute()
        })
    const labelA = G.Text("A", ...mathFont).bind([pointA, lineAB], offsetLabel, true, 0)
    const labelB = G.Text("B", ...mathFont).bind([pointB, lineAB], offsetLabel, true, 0)

    const pointP = G.Point()
        .data("distToPointA", 5)
        .bind(
            [pointA, lineAB],
            function () {
                const angle = G.Vector(pointA, pointB).angle
                this.copyFrom(pointA.moveAlongAngle(angle, this.data("distToPointA")))
            },
            true,
            0
        )
    const labelP = G.Text("P", ...mathFont).bind([pointP, lineAB], offsetLabel, true, 0)

    pointP.on("x y", function () {
        if (Math.abs(lineAB.slope) <= 1) {
            this.y = lineAB.getYWhereXEqualTo(this.x)
        } else {
            this.x = lineAB.getXWhereYEqualTo(this.y)
        }
        const d1 = G.Vector(pointA, this).angle
        const d2 = G.Vector(pointA, pointB).angle
        this.data("distToPointA", (G.utils.approximatelyEqualTo(d1, d2) ? 1 : -1) * this.getDistanceBetweenPoint(pointA))
    })

    const [pointInt1, pointInt2] = [G.Point.zero(), G.Point.zero()]
    const circle = G.Circle(20, 20, 10)
    const pointO = G.Point().bind([[circle, "centerCoordinate"]], function ([c]) {
        this.copyFrom(c.centerPoint)
    })
    const labelO = G.Text("O", ...mathFont).bind([pointO], offsetLabel, true, 0)

    G.Group([pointInt1, pointInt2]).bind([lineAB, circle], function ([l, c]) {
        const ret = l.getIntersectionPointsWithCircle(c)
        this.items[0].copyFrom(ret === null ? null : ret[0])
        this.items[1].copyFrom(ret === null ? null : ret[1])
    })

    collection
        .setDrawable("coordinateSystemOriginPoint", new Drawable(G.Point.zero(), true, colors.grey, undefined, 0))
        .setTouchable("pointA", new Touchable(pointA, false, colors.black, undefined, 0))
        .setDrawable("labelA", new Drawable(labelA, false, colors.black, undefined, 0))
        .setTouchable("pointB", new Touchable(pointB, false, colors.black, undefined, 0))
        .setDrawable("labelB", new Drawable(labelB, false, colors.black, undefined, 0))

        .setTouchable("lineAB", new Touchable(lineAB, true, undefined, colors.red, 3))
        .setTouchable("pointP", new Touchable(pointP, false, colors.green, undefined, 0))
        .setDrawable("labelP", new Drawable(labelP, false, colors.green, undefined, 0))
        .setTouchable("circle", new Touchable(circle, false, colors.purple + "20", colors.purple, 3))
        .setDrawable("pointInt1", new Drawable(pointInt1, false, undefined, colors.lightBlue, 2))
        .setDrawable("pointInt2", new Drawable(pointInt2, false, undefined, colors.lightBlue, 2))
        .setDrawable("pointO", new Drawable(pointO, false, undefined, colors.purple, 2))
        .setDrawable("labelO", new Drawable(labelO, false, colors.purple, undefined, 0))
}
main()

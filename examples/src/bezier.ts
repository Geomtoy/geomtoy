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
    const pointC = G.Point(0, 0)

    const offsetLabel = function ([...args]) {
        this.point = args[0].move(1, 1)
    }
    const twoPointsLineSegment = function([...args]){
        this.copyFrom(G.LineSegment(args[0],args[1]))
    }

    const quadraticBezier = G.QuadraticBezier().bind([pointA, pointB, pointC], function ([p1, p2, p3]) {
        this.copyFrom(G.QuadraticBezier(p1, p2, p3))
    })

    const labelA = G.Text("A", ...mathFont).bind([pointA], offsetLabel)
    const labelB = G.Text("B", ...mathFont).bind([pointB], offsetLabel)
    const labelC = G.Text("Control", ...mathFont).bind([pointC], offsetLabel)

    const segmentCA = G.LineSegment().bind([pointC,pointA],twoPointsLineSegment)
    const segmentCB = G.LineSegment().bind([pointC,pointB],twoPointsLineSegment)

    collection
        .setDrawable("coordinateSystemOriginPoint", new Drawable(G.Point.zero(), true, colors.grey, undefined, 0))
        .setTouchable("pointA", new Touchable(pointA, false, colors.black, undefined, 0))
        .setDrawable("labelA", new Drawable(labelA, false, colors.black, undefined, 0))
        .setTouchable("pointB", new Touchable(pointB, false, colors.black, undefined, 0))
        .setDrawable("labelB", new Drawable(labelB, false, colors.black, undefined, 0))
        .setTouchable("pointC", new Touchable(pointC, false, colors.black, undefined, 0))
        .setDrawable("labelC", new Drawable(labelC, false, colors.black, undefined, 0))
        .setDrawable("quadraticBezier", new Drawable(quadraticBezier, false, undefined, colors.pink, 3))
        .setDrawable("segmentCA", new Drawable(segmentCA, false, undefined, colors.pink, 3,[10]))
        .setDrawable("segmentCB", new Drawable(segmentCB, false, undefined, colors.pink, 3,[10]))
}
main()

import Geomtoy from "../../src/geomtoy"

let canvas = document.querySelector("#canvas"),
    ctx = canvas.getContext("2d"),
    G = new Geomtoy(),
      G1 = new Geomtoy(),
    canvasDrawer = new Geomtoy.adapters.VanillaCanvas(ctx, G),
    cWidth,
    cHeight

window.addEventListener("resize", () => {
    canvas.setAttribute("width", window.innerWidth)
    canvas.setAttribute("height", window.innerHeight)

    G.setOptions({
        epsilon:2**-32,
        coordinateSystem: {
            scale: 12,
            originX: window.innerWidth / 2,
            originY: window.innerHeight / 2,
            xAxisPositiveOnRight: true,
            yAxisPositiveOnBottom: false
        },
        graphic: {
            pointSize: 0.5
        }
    })
    cWidth = window.innerWidth / G.getOptions().coordinateSystem.scale
    cHeight = window.innerHeight / G.getOptions().coordinateSystem.scale
})
window.dispatchEvent(new Event("resize"))

let touchable = [],
    currentTouch = null,
    dragging = false

canvas.addEventListener("mousedown", function (e) {
    let coord = G.globalTransformation.beforeTransformed([e.offsetX, e.offsetY])
    touchable.forEach(t => {
        if (ctx.isPointInPath(t.path2D, coord[0], coord[1])) {
            t.offset = [t.geomObject.x - coord[0], t.geomObject.y - coord[1]]
            currentTouch = t
            dragging = true
        }
    })
})
canvas.addEventListener("mouseup", function (e) {
    currentTouch = null
    dragging = false
})

canvas.addEventListener("mousemove", function (e) {
    let coord = G.globalTransformation.beforeTransformed([e.offsetX, e.offsetY])
    if (dragging) {
        currentTouch.geomObject.x = coord[0] + currentTouch.offset[0]
        currentTouch.geomObject.y = coord[1] + currentTouch.offset[1]
        draw()
    } else {
        document.documentElement.style.cursor = touchable.some(t => ctx.isPointInPath(t.path2D, coord[0], coord[1])) ? "pointer" : "default"
    }
})

let colors = {
    red: "#f44336",
    pink: "#e91e63",
    purple: "#9c27b0",
    deepPurple: "#673ab7",
    indigo: "#3f51b5",
    blue: "#2196f3",
    lightBlue: "#03a9f4",
    cyan: "#00bcd4",
    teal: "#009688",
    green: "#4caf50",
    lightGreen: "#8bc34a",
    lime: "#cddc39",
    yellow: "#ffeb3b",
    amber: "#ffc107",
    orange: "#ff9800",
    deepOrange: "#ff5722",
    brown: "#795548",
    grey: "#9e9e9e",
    blueGrey: "#607d8b",
    black: "#000000"
}

let gui = new dat.GUI()

let p1 = G.Point(-25, -25),
    // p2 = G.Point(2.5,2.45130082959499673300),
    p2 = G.Point(2.5,2.46731498123892323270),
    // p2 = G.Point(2.5,2.49995),
    p3 = G.Point(25, 25)

let guiP1 = gui.addFolder("point1")
guiP1.open()
guiP1
    .add(p1, "x", -cWidth / 2, cWidth / 2, 0.1)
    .listen()
    .onChange(v => {
        p1.x = v
        draw()
    })
guiP1
    .add(p1, "y", -cHeight / 2, cHeight / 2, 0.1)
    .listen()
    .onChange(v => {
        p1.y = v
        draw()
    })
let guiP2 = gui.addFolder("point2")
guiP2.open()
guiP2
    .add(p2, "x", -cWidth / 2, cWidth / 2, 0.1)
    .listen()
    .onChange(v => {
        p2.x = v
        draw()
    })
guiP2
    .add(p2, "y", -cHeight / 2, cHeight / 2, 0.1)
    .listen()
    .onChange(v => {
        p2.y = v
        draw()
    })
let guiP3 = gui.addFolder("point3")
guiP3.open()
guiP3
    .add(p3, "x", -cWidth / 2, cWidth / 2, 0.1)
    .listen()
    .onChange(v => {
        p3.x = v
        draw()
    })
guiP3
    .add(p3, "y", -cHeight / 2, cHeight / 2, 0.1)
    .listen()
    .onChange(v => {
        p3.y = v
        draw()
    })

touchable.push({ uuid: p1.uuid, geomObject: p1 })
touchable.push({ uuid: p2.uuid, geomObject: p2 })
touchable.push({ uuid: p3.uuid, geomObject: p3 })
draw()
window.addEventListener("resize", draw)



function draw() {
    canvasDrawer.clear()
    ctx.fillStyle = "#00000000"
    ctx.lineWidth = 0.25
    ctx.strokeStyle = colors.black + "CC"

    ctx.globalCompositeOperation = "destination-over"
    touchable.filter(v => v.uuid === p1.uuid)[0].path2D = canvasDrawer.draw(p1)
    touchable.filter(v => v.uuid === p2.uuid)[0].path2D = canvasDrawer.draw(p2)
    touchable.filter(v => v.uuid === p3.uuid)[0].path2D = canvasDrawer.draw(p3)

    let tri = G.Triangle()
    G.Line.fromTwoPoints(G.Point(1,1),G.Point(1,2))
    
    tri.point1 = p1
    tri.point2 = p2
    tri.point3 = p3 
    tri.getIsogonalConjugatePointOfPoint(G1.Point())
    

    if (tri.isValid()) {
        canvasDrawer.draw(tri)
        ctx.strokeStyle = colors.grey + "CC"
        canvasDrawer.drawBatch(...tri.getSideSegments().map(s => s.toLine()))

        ctx.strokeStyle = colors.red + "CC"
        canvasDrawer.drawBatch(...tri.getMedianSegments())
        canvasDrawer.draw(tri.getCentroidPoint())
        // canvasDrawer.draw(tri.getMedialTriangle())
        // canvasDrawer.draw(tri.getAntimedialTriangle())

        ctx.strokeStyle = colors.green + "CC"
        canvasDrawer.drawBatch(...tri.getAngleBisectingSegments())
        // canvasDrawer.draw(tri.getIncenterPoint())
        // canvasDrawer.draw(tri.getInscribedCircle())

        ctx.strokeStyle = colors.purple + "CC"
        canvasDrawer.drawBatch(...tri.getAltitudeSegments().map(s => s.toLine()))
        canvasDrawer.draw(tri.getOrthocenterPoint())
        // let ot = tri.getOrthicTriangle()
        // ot !== null && canvasDrawer.draw(ot)
        // let pc = tri.getPolarCircle()
        // pc !== null && canvasDrawer.draw(pc)

        ctx.strokeStyle = colors.indigo + "CC"
        canvasDrawer.drawBatch(...tri.getPerpendicularlyBisectingSegments().map(s => s.toLine()))
        // canvasDrawer.draw(tri.getCircumcenterPoint())
        // canvasDrawer.draw(tri.getCircumscribedCircle())

        // ctx.strokeStyle = colors.teal + "CC"
        // canvasDrawer.drawBatch(...tri.getEscenterPoints())
        // canvasDrawer.drawBatch(...tri.getEscribedCircles())

        // ctx.strokeStyle = colors.yellow + "CC"
        // canvasDrawer.drawBatch(...tri.getSymmedianSegments())
        // canvasDrawer.draw(tri.getLemoinePoint())

        // ctx.strokeStyle = colors.brown + "CC"
        // ctx.globalCompositeOperation = "source-over"
        // canvasDrawer.draw(tri.getEulerLine())
        // canvasDrawer.draw(tri.getNinePointCenterPoint())
        // canvasDrawer.draw(tri.getNinePointCircle())
    }
}

import Geomtoy from "../../src/geomtoy"
import "./assets/dg"

let canvas = document.querySelector("#canvas"),
    ctx = canvas.getContext("2d"),
    G = new Geomtoy({
        epsilon: 2 ** -32,
        coordinateSystem: {
            scale: 12,
            xAxisPositiveOnRight: true,
            yAxisPositiveOnBottom: false
        },
        graphic: {
            pointSize: 0.5
        }
    }),
    canvasDrawer = new Geomtoy.adapters.VanillaCanvas(ctx, G)
let gui = new dat.GUI(),
    points = {
        point1: {
            object: G.Point(-25, -12),
            controller: {
                x: undefined,
                y: undefined
            }
        },
        point2: {
            object: G.Point(0, 25),
            controller: {
                x: undefined,
                y: undefined
            }
        },
        point3: {
            object: G.Point(35, -16),
            controller: {
                x: undefined,
                y: undefined
            }
        }
    },
    setting = {
        sideLines: true,
        medianSegments: true,
        centroidPoint: true,
        medialTriangle: false,
        antimedialTriangle: false,
        bisectingSegments: true,
        incenterPoint: true,
        inscribedCircle: true,
        altitudeLines: true,
        orthocenterPoint: true,
        orthicTriangle: false,
        polarCircle: false,
        perpendicularlyBisectingLines: true,
        circumcenterPoint: true,
        circumscribedCircle: true,
        escenterPoints: true,
        escribedCircles: true,
        symmedianSegments: false,
        lemoinePoint: false,
        eulerLine: false,
        ninePointCenterPoint: false,
        ninePointCircle: false
    }
let guiObject = gui.addFolder("objects")
guiObject.open()
Object.getOwnPropertyNames(points).forEach(name => {
    let folder = guiObject.addFolder(name)
    folder.open()
    let controllerX = folder.add(points[name].object, "x", 0, 0, 0.1).listen().onChange(draw)
    points[name].controller.x = controllerX
    let controllerY = folder.add(points[name].object, "y", 0, 0, 0.1).listen().onChange(draw)
    points[name].controller.y = controllerY
})
let guiSetting = gui.addFolder("setting")
guiSetting.open()
Object.getOwnPropertyNames(setting).forEach(name => {
    guiSetting.add(setting, name).listen().onChange(draw)
}) //

window.addEventListener("resize", () => {
    canvas.setAttribute("width", window.innerWidth)
    canvas.setAttribute("height", window.innerHeight)
    G.setOptions({
        coordinateSystem: {
            originX: window.innerWidth / 2,
            originY: window.innerHeight / 2
        }
    })
    let cWidth = window.innerWidth / G.getOptions().coordinateSystem.scale,
        cHeight = window.innerHeight / G.getOptions().coordinateSystem.scale
    Object.getOwnPropertyNames(points).forEach(name => {
        points[name].controller.x.min(-cWidth / 2)
        points[name].controller.x.max(cWidth / 2)
        points[name].controller.y.min(-cHeight / 2)
        points[name].controller.y.max(cHeight / 2)
    })
})
window.dispatchEvent(new Event("resize")) //

let currentTouch = null,
    dragging = false,
    touchable = [
        {
            object: points.point1.object,
            path2D: undefined
        },
        {
            object: points.point2.object,
            path2D: undefined
        },
        {
            object: points.point3.object,
            path2D: undefined
        }
    ]
canvas.addEventListener("mousedown", function (e) {
    let coord = G.globalTransformation.antitransformCoordinate([e.offsetX, e.offsetY])
    touchable.forEach(t => {
        if (ctx.isPointInPath(t.path2D, coord[0], coord[1])) {
            t.offset = [t.object.x - coord[0], t.object.y - coord[1]]
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
    let coord = G.globalTransformation.antitransformCoordinate([e.offsetX, e.offsetY])

    if (dragging) {
        currentTouch.object.x = coord[0] + currentTouch.offset[0]
        currentTouch.object.y = coord[1] + currentTouch.offset[1]
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
        black: "#000000",
        white:"#FFFFF"
    },
    tri = G.Triangle()
window.addEventListener("resize", draw)
draw()

function draw() {
    canvasDrawer.clear()
    ctx.fillStyle = "#00000000"
    ctx.lineWidth = 0.25
    ctx.globalCompositeOperation = "destination-over"
    canvasDrawer.draw(G.Point(0, 0))
    let {
        point1: { object: p1 },
        point2: { object: p2 },
        point3: { object: p3 }
    } = points
    ctx.strokeStyle = colors.black + "CC"
    touchable.find(v => v.object === p1).path2D = canvasDrawer.draw(p1)
    touchable.find(v => v.object === p2).path2D = canvasDrawer.draw(p2)
    touchable.find(v => v.object === p3).path2D = canvasDrawer.draw(p3)
    Object.assign(tri, {
        point1: p1,
        point2: p2,
        point3: p3
    })

    if (tri.isValid()) {
        canvasDrawer.draw(tri)
        ctx.strokeStyle = colors.grey + "CC"
        setting.sideLines && canvasDrawer.drawBatch(...tri.getSideSegments().map(s => s.toLine()))
        ctx.strokeStyle = colors.red + "CC"
        setting.medianSegments && canvasDrawer.drawBatch(...tri.getMedianSegments())
        setting.centroidPoint && canvasDrawer.draw(tri.getCentroidPoint())
        setting.medialTriangle && canvasDrawer.draw(tri.getMedialTriangle())
        setting.antimedialTriangle && canvasDrawer.draw(tri.getAntimedialTriangle())
        ctx.strokeStyle = colors.green + "CC"
        setting.bisectingSegments && canvasDrawer.drawBatch(...tri.getAngleBisectingSegments())
        setting.incenterPoint && canvasDrawer.draw(tri.getIncenterPoint())
        setting.inscribedCircle && canvasDrawer.draw(tri.getInscribedCircle())
        ctx.strokeStyle = colors.purple + "CC"
        setting.altitudeLines && canvasDrawer.drawBatch(...tri.getAltitudeSegments().map(s => s.toLine()))
        setting.orthocenterPoint && canvasDrawer.draw(tri.getOrthocenterPoint())
        let ot, pc
        setting.orthicTriangle && (ot = tri.getOrthicTriangle()) !== null && canvasDrawer.draw(ot)
        setting.polarCircle && (pc = tri.getPolarCircle()) !== null && canvasDrawer.draw(pc)
        ctx.strokeStyle = colors.indigo + "CC"
        setting.perpendicularlyBisectingLines && canvasDrawer.drawBatch(...tri.getPerpendicularlyBisectingSegments().map(s => s.toLine()))
        setting.circumcenterPoint && canvasDrawer.draw(tri.getCircumcenterPoint())
        setting.circumscribedCircle && canvasDrawer.draw(tri.getCircumscribedCircle())
        ctx.strokeStyle = colors.teal + "CC"
        setting.escenterPoints && canvasDrawer.drawBatch(...tri.getEscenterPoints())
        setting.escribedCircles && canvasDrawer.drawBatch(...tri.getEscribedCircles())
        ctx.strokeStyle = colors.yellow + "CC"
        setting.symmedianSegments && canvasDrawer.drawBatch(...tri.getSymmedianSegments())
        setting.lemoinePoint && canvasDrawer.draw(tri.getLemoinePoint())
        ctx.strokeStyle = colors.brown + "CC"
        ctx.globalCompositeOperation = "source-over"
        setting.eulerLine && canvasDrawer.draw(tri.getEulerLine())
        setting.ninePointCenterPoint && canvasDrawer.draw(tri.getNinePointCenterPoint())
        setting.ninePointCircle && canvasDrawer.draw(tri.getNinePointCircle())
    }
}

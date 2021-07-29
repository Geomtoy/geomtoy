import Geomtoy from "../../src/geomtoy"

let canvasContext = new CanvasRenderingContext2D(),
    canDrawer = new vanillaCanvasDrawer(canvasContext)

let G = new Geomtoy(1000,1000)

let p = new Point(0, 0)

G.setCoordinateSystem(true, true, 0, 0, 0.5)
canDrawer.draw(p.getGraphic())

let G1 = new Geomtoy(1000,1000)
G1.setCoordinateSystem()

let p1 = new G1.Point(0, 0)
G1.setCoordinateSystem(true,false,500,500,1)
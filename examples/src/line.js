import Geomtoy from "../../src/geomtoy"
import "./assets/misc"
import {colors} from "./assets/assets"
import interact from "./assets/interact" 

const canvas = document.querySelector("#canvas") 

const G = new Geomtoy(100, 100, {
    epsilon: 2 ** -32,
    graphics: {
        pointSize: 6,
        lineRange: 1000
    }
})
// G.xAxisPositiveOnRight = false
G.yAxisPositiveOnBottom = false
G.scale = 10

const canvasRenderer = new Geomtoy.adapters.VanillaCanvas(canvas, G, { lineJoin: "round" }) 
const gui = new dat.GUI()


const objectCollection = () => {
    const line = G.Line(1,2,3)
  
    return {
       line
    }
}
let o = objectCollection() 
interact.startZoomAndPan(canvasRenderer ,draw)
interact.startResponsive(canvasRenderer, (_, width, height) => {
    G.width = width
    G.height = height
    G.origin = [width / 2, height / 2]
    
    draw(canvasRenderer)
})

const guiLine = gui.addFolder("line")
guiLine.open()
guiLine
.add(o.line, "a", -100, 100, 0.1)
.listen()
.onChange(() => draw(canvasRenderer))
guiLine
.add(o.line, "b", -100, 100, 0.1)
.listen()
.onChange(() => draw(canvasRenderer))

guiLine
.add(o.line, "c", -100, 100, 0.1)
.listen()
.onChange(() => draw(canvasRenderer))
 
function draw(renderer) {
    renderer.clear()
    renderer.draw(G.Point.zero())
    renderer.strokeWidth(2)
    renderer.stroke(colors.grey + "CC") 
    renderer.draw(o.line)
}

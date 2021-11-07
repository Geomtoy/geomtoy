import Geomtoy from "../../src/geomtoy"
import "./assets/misc"
import {colors} from "./assets/assets"
import Interact from "./assets/interact"

const canvas = document.querySelector("#canvas")
const svg = document.querySelector("#svg")

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
const svgRenderer = new Geomtoy.adapters.VanillaSvg(svg, G, { lineJoin: "round" })
const gui = new dat.GUI()

const mathFont = "Cambria Math, Times New Roman, math, serif"

const objectCollection = () => {
    const pointA = G.Point(-25, -12)
    const pointB = G.Point(0, 25)
    const pointC = G.Point(35, -16)
    const pointD = G.Point(0, 0)
    const twoPointsLineFunc = function (p1, p2) {
        this.copyFrom(G.Line.fromTwoPoints(p1, p2))
    }
    
    // const triangle = G.Triangle() //.bind([pointA, pointB, pointC], function (p1, p2, p3) {
    //     this.copyFrom(G.Triangle(p1, p2, p3))
    //     // })
    // pointA.on("x", function(){
    //     this.x = Math.random()
    //     this.y = Math.random()
    // })
    // pointA.on("y", function(){
    //     console.log(this.x,this.y,"y")
    //     this.x = Math.random()
    // })
    // pointA.on("coordinate",function(){
    //     console.log(this.coordinate,"coordinate")
    // })
    // // pointA.on("*",consoleC)
    // const line3 = G.Line()
    

    const line1 = G.Line().bind([pointA,pointB], function ([p1, p2]) { 
        this.copyFrom(G.Line.fromTwoPoints(p1, p2)) 
    // pointA.bind([line1,pointA,pointB,[G.Circle(),"x"]],function(l,p1,p2){
    //     p1.x
    })
    
    
    // pointA.bind([[line1,"*"],line1],function(l1,l2){
    //     l1
    //     l2
    // })

    // const seg = G.Segment().bind([pointA,pointB],function(p1,p2){
    //     this.copyFrom(G.Segment(p1,p2))
    // })

    // pointA.bind([seg,"point1Coordinate"],function(seg){
    //     this.copyFrom(seg.point1)
    // })
    // pointB.bind([seg,"point2Coordinate"],function(seg){
    //     this.copyFrom(seg.point2)
    // })






    // const line3 = G.Line().bind([pointA, pointB, pointC], function (p1, p2, p3) {
    //     this.copyFrom(G.Line.fromTwoPoints(p1, p2).getPerpendicularLineFromPoint(p3))
    // })

   

    //用类似于来实现once
    // pointA.on("x y ",function a(){
    //     pointA.off("x y",a)

    // })
    // const line = G.Line().bind([pointA, pointB, pointC], function b (p1, p2, p3) {
    //     this.copyFrom(G.Line.fromTwoPoints(p1, p2).getPerpendicularLineFromPoint(p3))
    //     line.unbind([pointA, pointB, pointC],b)
    // })
    
    // 如果此处继续改变pointA的值呢,，这个地方没有办法阻止用户必须要用传入的参数，而不可以直接用已经声明的变量

    return {
        pointA,
        pointB,
        pointC,
        pointD,
        // triangle,
        line1,
        // line2,
        // line3
    }
}
let o = objectCollection()

const touchables = {
    pointA: {
        object: o.pointA,
        controller: {
            x: undefined,
            y: undefined
        },
        path: undefined
    },
    pointB: {
        object: o.pointB,
        controller: {
            x: undefined,
            y: undefined
        },
        path: undefined
    },
    pointC: {
        object: o.pointC,
        controller: {
            x: undefined,
            y: undefined
        },
        path: undefined
    },
    pointD: {
        object: o.pointD,
        controller: {
            x: undefined,
            y: undefined
        },
        path: undefined
    }
}

let currentRenderer
const rendererList = { canvas: canvasRenderer, svg: svgRenderer }

rendererSwitch(gui, rendererList, "canvas", (type, renderer) => {
    currentRenderer = renderer
    Object.keys(rendererList)
        .filter(t => t !== type)
        .forEach(t => {
            interact.stopDragAndDrop(rendererList[t])
            interact.stopZoomAndPan(rendererList[t])
            interact.stopResponsive(rendererList[t])
        })
    interact.startDragAndDrop(touchables, currentRenderer, draw)
    interact.startZoomAndPan(currentRenderer, draw)
    interact.startResponsive(currentRenderer, (_, width, height) => {
        G.width = width
        G.height = height
        G.origin = [width / 2, height / 2]
        let cWidth = width / G.scale,
            cHeight = height / G.scale
        Object.getOwnPropertyNames(touchables).forEach(name => {
            touchables[name].controller.x.min(-cWidth / 2)
            touchables[name].controller.x.max(cWidth / 2)
            touchables[name].controller.y.min(-cHeight / 2)
            touchables[name].controller.y.max(cHeight / 2)
        })
        draw(currentRenderer)
    })
})

const guiObject = gui.addFolder("objects")
guiObject.open()
Object.keys(touchables).forEach(name => {
    let folder = guiObject.addFolder(name)
    folder.open()
    let controllerX = folder
        .add(touchables[name].object, "x", 0, 0, 0.1)
        .listen()
        // .onChange(() => G.nextTick(() => draw(currentRenderer)))
        .onChange(() =>   draw(currentRenderer))
    touchables[name].controller.x = controllerX
    let controllerY = folder
        .add(touchables[name].object, "y", 0, 0, 0.1)
        .listen()
        .onChange(() => G.nextTick(() => draw(currentRenderer)))
    touchables[name].controller.y = controllerY
})

function draw(renderer) {
    renderer.clear()

    renderer.strokeWidth(2)
    renderer.stroke(colors.grey + "CC")
    renderer.fill(colors.grey + "CC")
    // renderer.draw(objectCollection.originPoint)
    // renderer.draw(objectCollection.originPointLabel)

    renderer.fill(colors.black + "00")
    renderer.stroke(colors.black + "FF")
    renderer.strokeWidth(4)
    touchables.pointA.path = renderer.draw(touchables.pointA.object)
    renderer.strokeWidth(2)
    touchables.pointB.path = renderer.draw(touchables.pointB.object)
    touchables.pointC.path = renderer.draw(touchables.pointC.object)
    renderer.fill(colors.green + "CC")
    touchables.pointD.path = renderer.draw(touchables.pointD.object)
    // renderer.draw(o.triangle)
    renderer.stroke(colors.deepOrange + "FF")
    renderer.draw(o.line1)
    renderer.stroke(colors.orange + "FF")
    // renderer.draw(o.line3)
}

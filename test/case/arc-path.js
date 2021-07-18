import { SVG } from "@svgdotjs/svg.js"
import _ from "lodash"
import G from "../../src/geomtoy"

var c = document.querySelector("#canOrigin")
var ctx = c.getContext("2d")


ctx.strokeStyle = "red" 
ctx.beginPath()
ctx.moveTo(50, 100)
//角度总是顺时针的
ctx.arc(50, 50, 50, 0.5*Math.PI, 1*Math.PI, true)
ctx.stroke()

ctx.strokeStyle = "blue" 
ctx.beginPath()
ctx.moveTo(50, 100)
ctx.ellipse(50, 50, 25, 50, 0, 0.5*Math.PI, 1*Math.PI,false);
ctx.stroke()
// ctx.closePath()

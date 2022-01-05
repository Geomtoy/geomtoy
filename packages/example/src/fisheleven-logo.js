import Geomtoy from "@geomtoy/core"

class myAdapter {
    constructor(svgDotJsContainer, geomtoy) {
        this.svgDotJsContainer = svgDotJsContainer
        this.geomtoy = geomtoy
    }
    setup() {
        let [a, b, c, d, e, f] = this.geomtoy.globalTransformation.get()
        this.svgDotJsContainer.attr("transform", `matrix(${a} ${b} ${c} ${d} ${e} ${f})`)
    }
    async draw(object, { duration = 2000, delay = 0 } = {}) {
        this.setup()
        return new Promise((resolve, reject) => {
            let ds = object.getGraphics("svg"),
                path = this.svgDotJsContainer.path(),
                attrD = ""

            ds.forEach(d => {
                if (d.type === "M") {
                    attrD += `M${d.x},${d.y}`
                }
                if (d.type === "L") {
                    attrD += `L${d.x},${d.y}`
                }
                if (d.type === "C") {
                    attrD += `C${d.cp1x},${d.cp1y} ${d.cp2x},${d.cp2y} ${d.x},${d.y}`
                }
                if (d.type === "Q") {
                    attrD += `C${d.cpx},${d.cpy} ${d.x},${d.y}`
                }
                if (d.type === "A") {
                    attrD += `A${d.rx} ${d.ry} ${d.xAxisRotation} ${d.largeArcFlag ? 1 : 0} ${d.sweepFlag ? 1 : 0} ${d.x},${d.y}`
                }
                if (d.type === "Z") {
                    attrD += `Z`
                }
            })
            path.plot(attrD)
                .attr({
                    "fill-opacity": 0,
                    "stroke-opacity": 0
                })
                .animate(duration, delay, "now")
                .attr({
                    "fill-opacity": 1,
                    "stroke-opacity": 1
                })
                .after(() => {
                    resolve(path)
                })
        })
    }
}

const radius = 256,
    prePadding = 100,
    seven = 7,
    four = 4,
    three = 3,
    colors = ["#900", "#099", "#009"]

let draw = SVG()
        .addTo("body")
        .size(radius * 2 + prePadding * 2, radius * 2 + prePadding * 2)
        .viewbox(0, 0, radius * 2 + prePadding * 2, radius * 2 + prePadding * 2),
    data = {}

const G = new Geomtoy()

let sketchGroup = draw.group(),
    sketchD = new myAdapter(sketchGroup, G)
sketchGroup.stroke({ color: "rgba(77, 77, 77, 0.5)", width: 1 }).fill("none")

let sketchStrokeGroup = draw.group(),
    sketchStrokeD = new myAdapter(sketchStrokeGroup, G)
sketchStrokeGroup.stroke({ color: "rgba(77, 77, 77, 0.3)", width: 1, dasharray: 2 }).fill("none")

let imageGroup = draw.group()
imageGroup.stroke({ color: "rgba(0, 0, 0, 0.5)", width: 2 }).fill({ color: "rgba(111, 0, 0, 0.8)" })

Promise.resolve("Let's begin")
    .then(async () => {
        data.centerPoint = null
        data.initCircle = null

        let centerPoint = G.Point(radius + prePadding, radius + prePadding)
        data.centerPoint = centerPoint
        await sketchD.draw(centerPoint)

        let initCircle = G.Circle(radius, data.centerPoint)
        data.initCircle = initCircle
        console.log(data)
        await sketchStrokeD.draw(initCircle)
    })
    .then(async () => {
        data.heptagonPoints = []
        data.heptagonOffsetPoints = []
        data.heptagonPQuarterPoints = []
        data.heptagonNQuarterPoints = []
        data.heptagonPEighthPoints = []
        data.heptagonNEighthPoints = []
        let heptagon = G.RegularPolygon(radius, data.centerPoint, seven, -Math.PI / 2),
            heptagonOffset = G.RegularPolygon(radius, data.centerPoint, seven, Math.PI / seven - Math.PI / 2),
            heptagonPQuarter = G.RegularPolygon(radius, data.centerPoint, seven, Math.PI / seven / 2 - Math.PI / 2),
            heptagonNQuarter = G.RegularPolygon(radius, data.centerPoint, seven, -Math.PI / seven / 2 - Math.PI / 2),
            heptagonPEighth = G.RegularPolygon(radius, data.centerPoint, seven, Math.PI / seven / 4 - Math.PI / 2),
            heptagonNEighth = G.RegularPolygon(radius, data.centerPoint, seven, -Math.PI / seven / 4 - Math.PI / 2)
        data.heptagonPoints = heptagon.getPoints()
        data.heptagonOffsetPoints = heptagonOffset.getPoints()
        data.heptagonPQuarterPoints = heptagonPQuarter.getPoints()
        data.heptagonNQuarterPoints = heptagonNQuarter.getPoints()
        data.heptagonPEighthPoints = heptagonPEighth.getPoints()
        data.heptagonNEighthPoints = heptagonNEighth.getPoints()

        console.log(data.centerPoint)
        console.log(heptagon.centerPoint)

        let heptagonDraw = await sketchD.draw(heptagon)
        heptagonDraw.stroke({ color: colors[0] })

        let promises = _.range(seven).map(async index => {
            await sketchD.draw(data.heptagonPoints[index])
            await sketchStrokeD.draw(G.Segment(data.centerPoint, data.heptagonPoints[index]))
            await sketchD.draw(data.heptagonOffsetPoints[index])
            await sketchStrokeD.draw(G.Segment(data.centerPoint, data.heptagonOffsetPoints[index]))
            await Promise.all([sketchD.draw(data.heptagonPQuarterPoints[index]), sketchD.draw(data.heptagonNQuarterPoints[index])])
            await Promise.all([
                sketchStrokeD.draw(G.Segment(data.centerPoint, data.heptagonPQuarterPoints[index])),
                sketchStrokeD.draw(G.Segment(data.centerPoint, data.heptagonNQuarterPoints[index]))
            ])
            await Promise.all([sketchD.draw(data.heptagonPEighthPoints[index]), sketchD.draw(data.heptagonNEighthPoints[index])])
            await Promise.all([
                sketchStrokeD.draw(G.Segment(data.centerPoint, data.heptagonPEighthPoints[index])),
                sketchStrokeD.draw(G.Segment(data.centerPoint, data.heptagonNEighthPoints[index]))
            ])
        })
        await Promise.all(promises)
    })

    .then(async () => {
        data.heptagonC1 = {
            intPoints: [],
            circles: []
        }
        let promises = _.range(seven).map(async index => {
            let lA = G.Line.fromTwoPoints(_.nth(data.heptagonOffsetPoints, index - 1), data.centerPoint), //use _.nth to get index -1
                lB = G.Line.fromTwoPoints(_.nth(data.heptagonOffsetPoints, index), data.centerPoint),
                lC = G.Circle(radius, data.centerPoint).getTangentLineAtPoint(_.nth(data.heptagonPoints, index)),
                pA = lA.getIntersectionPointWithLine(lC),
                pB = lB.getIntersectionPointWithLine(lC),
                triangle = G.Triangle(pA, pB, data.centerPoint),
                c = triangle.getInscribedCircle()
            await sketchStrokeD.draw(triangle)
            await sketchD.draw(c)
            data.heptagonC1.circles[index] = c

            let ps = G.Line.fromTwoPoints(_.nth(data.heptagonPoints, index), data.centerPoint).getIntersectionPointsWithCircle(c)
            data.heptagonC1.intPoints[index] = _.find(ps, p => !p.isSameAs(_.nth(data.heptagonPoints, index)))
            await sketchD.draw(data.heptagonC1.intPoints[index])
        })
        await Promise.all(promises)
    })
    .then(async () => {
        data.heptagonC2 = {
            intPoints: [],
            circles: []
        }
        let promises = _.range(seven).map(async index => {
            let lA = G.Line.fromTwoPoints(data.heptagonPEighthPoints[index], data.centerPoint),
                lB = G.Line.fromTwoPoints(data.heptagonNEighthPoints[index], data.centerPoint),
                lC = G.Circle(radius, data.centerPoint).getTangentLineAtPoint(_.nth(data.heptagonPoints, index)),
                pA = lA.getIntersectionPointWithLine(lC),
                pB = lB.getIntersectionPointWithLine(lC),
                triangle = G.Triangle(pA, pB, data.centerPoint),
                c = triangle.getInscribedCircle()

            await sketchStrokeD.draw(triangle)
            await sketchD.draw(c)
            data.heptagonC2.circles[index] = c

            let ps = G.Line.fromTwoPoints(_.nth(data.heptagonPoints, index), data.centerPoint).getIntersectionPointsWithCircle(c)
            data.heptagonC2.intPoints[index] = _.find(ps, p => !p.isSameAs(data.heptagonPoints[index]))
            await sketchD.draw(data.heptagonC2.intPoints[index])
        })
        await Promise.all(promises)
    })
    .then(async () => {
        data.heptagonC3 = {
            intPoints: [],
            circles: []
        }
        let promises = _.range(seven).map(async index => {
            let lA = G.Line.fromTwoPoints(data.heptagonPQuarterPoints[index], data.centerPoint),
                lB = G.Line.fromTwoPoints(data.heptagonNQuarterPoints[index], data.centerPoint),
                lC = data.heptagonC2.circles[index].getTangentLineAtPoint(data.heptagonC2.intPoints[index]),
                pA = lA.getIntersectionPointWithLine(lC),
                pB = lB.getIntersectionPointWithLine(lC),
                triangle = G.Triangle(pA, pB, data.centerPoint),
                c = triangle.getInscribedCircle()

            await sketchStrokeD.draw(triangle)
            await sketchD.draw(c)
            data.heptagonC3.circles[index] = c

            let ps = G.Line.fromTwoPoints(data.heptagonC2.intPoints[index], data.centerPoint).getIntersectionPointsWithCircle(c)
            data.heptagonC3.intPoints[index] = _.find(ps, p => !p.isSameAs(data.heptagonC2.intPoints[index]))
            await sketchD.draw(data.heptagonC3.intPoints[index])
        })
        await Promise.all(promises)
    })
    .then(async () => {
        data.heptagonC4 = {
            intPointLists: [],
            circles: []
        }
        data.gap = null

        let promises = _.range(seven).map(async index => {
            let p = G.Point(data.heptagonC3.circles[index].centerX, data.heptagonC3.circles[index].centerY),
                c = G.Circle(data.heptagonC2.circles[index].radius, p),
                l = G.Line.fromTwoPoints(data.centerPoint, data.heptagonPoints[index]),
                ps = l.getIntersectionPointsWithCircle(c)

            ps = _.sortBy(ps, p => p.getDistanceBetweenPoint(data.centerPoint)) //ascending order

            await sketchD.draw(p)
            await sketchD.draw(c)
            await sketchD.draw(ps[0])
            await sketchD.draw(ps[1])

            data.heptagonC4.circles[index] = c
            data.heptagonC4.intPointLists[index] = ps
        })
        //gap
        await Promise.all(promises).then(() => {
            data.gap = data.heptagonC3.circles[0].radius - data.heptagonC4.circles[0].radius
        })
    })
    .then(async () => {
        data.heptagonC5 = {
            circles: []
        }
        let promises = _.range(seven).map(async index => {
            let pA = data.heptagonC1.intPoints[index],
                pB = data.heptagonC3.intPoints[index],
                r = pA.getDistanceBetweenPoint(pB) / 2,
                mp = G.Segment(pA, pB).getMiddlePoint()

            let c = G.Circle(r, mp)
            await sketchD.draw(c)
            data.heptagonC5.circles[index] = c
        })
        await Promise.all(promises)
    })
    .then(async () => {
        data.heptagonC6 = {
            circles: []
        }
        let promises = _.range(seven).map(async index => {
            let pA = data.heptagonPoints[index],
                pB = data.heptagonC3.intPoints[index],
                r = pA.getDistanceBetweenPoint(pB) / 2,
                mp = G.Segment(pA, pB).getMiddlePoint()

            let c = G.Circle(r, mp)
            await sketchD.draw(c)
            data.heptagonC6.circles[index] = c
        })
        await Promise.all(promises)
    })
    .then(async () => {
        data.heptagonC7 = {
            intPoints: [],
            circles: []
        }
        let promises = _.range(seven).map(async index => {
            let p = data.heptagonOffsetPoints[index],
                r = data.heptagonC5.circles[index].radius,
                l = G.Line.fromTwoPoints(p, data.centerPoint),
                ps1 = l.getIntersectionPointsWithCircle(G.Circle(r, p)),
                ps2 = l.getIntersectionPointsWithCircle(G.Circle(2 * r, p))

            ps1 = _.sortBy(ps1, p => p.getDistanceBetweenPoint(data.centerPoint)) //ascending order
            ps2 = _.sortBy(ps2, p => p.getDistanceBetweenPoint(data.centerPoint)) //ascending order

            let center = ps1[0],
                c = G.Circle(r, center)
            await sketchD.draw(c)

            data.heptagonC7.intPoints[index] = ps2[0]
            data.heptagonC7.circles[index] = c
        })
        await Promise.all(promises)
    })
    .then(async () => {
        data.innerBorderC1 = null
        data.innerBorderC2 = null

        let r1 = radius - data.heptagonC1.circles[0].radius * 2,
            r2 = r1 - data.gap,
            c1 = G.Circle(r1, data.centerPoint),
            c2 = G.Circle(r2, data.centerPoint)

        await sketchStrokeD.draw(c1)
        await sketchD.draw(c2)

        data.innerBorderC1 = c1
        data.innerBorderC2 = c2
    })
    .then(async () => {
        data.outerBorderC1 = null
        data.outerBorderC2 = null

        let r1 = radius + data.gap,
            r2 = r1 + data.gap,
            c1 = G.Circle(r1, data.centerPoint),
            c2 = G.Circle(r2, data.centerPoint)

        await sketchD.draw(c1)
        await sketchD.draw(c2)

        data.outerBorderC1 = c1
        data.outerBorderC2 = c2
    })
    .then(async () => {
        data.trianglePoints = []
        data.triangleC1 = {
            intPoints: [],
            circles: []
        }
        data.triangleC2 = {
            tanPoints: [],
            circles: []
        }

        let triangle = data.innerBorderC2.getInscribedRegularPolygon(three, Math.PI / 2),
            triangleDraw = await sketchD .draw(triangle)
        triangleDraw.stroke({ color: colors[1] })
        data.trianglePoints = triangle.getPoints()

        let promises1 = _.range(three).map(async index => {
            await sketchD.draw(data.trianglePoints[index])

            let l = G.Line.fromTwoPoints(data.trianglePoints[index], data.centerPoint),
                psWithIBC1 = l.getIntersectionPointsWithCircle(data.innerBorderC1)

            psWithIBC1 = _.sortBy(psWithIBC1, p => p.getDistanceBetweenPoint(data.trianglePoints[index]))
            await sketchD.draw( psWithIBC1[0])

            let c =  G.Circle(psWithIBC1[0].getDistanceBetweenPoint(data.centerPoint) / 2,  G.Segment(psWithIBC1[0], data.centerPoint).getMiddlePoint())
            await sketchD.draw(c)
            await sketchD.draw(c.centerPoint)

            let ps = c.getIntersectionPointsWithCircle(data.innerBorderC2)
            await sketchD.draw(ps[0])
            await sketchD.draw(ps[1])

            data.triangleC1.circles[index] = c
            data.triangleC1.intPoints[index] = ps[0]
        })

        await Promise.all(promises1)

        let promises2 = _.range(three).map(async index => {
            let commonTangentCircles = G.Circle.getCommonTangentCirclesOfTwoCirclesThroughPointNotOn(
                _.nth(data.triangleC1.circles, index - 1),
                _.nth(data.triangleC1.circles, index - 2),
                data.trianglePoints[index]
            )

            data.triangleC2.circles[index] = commonTangentCircles[1]
            await sketchD.draw(commonTangentCircles[1])

            let etData = commonTangentCircles[1].getExternallyTangentDataWithCircle(_.nth(data.triangleC1.circles, index - 2))
            data.triangleC2.tanPoints[index] = etData.point
            await sketchD.draw(etData.point)
        })

        await Promise.all(promises2)
    })
// .then(async () => {
//     data.quadrilateralPoints = []
//     data.quadrilateral = {
//         int1Points: [],
//         int2Points: []
//     }

//     let quadrilateral =  G.RegularPolygon(radius + data.gap * 2, data.centerPoint, four, Math.PI / 2),
//         quadrilateralDraw = await quadrilateral.draw(sketchGroup)

//     quadrilateralDraw.stroke({ color: colors[2] })

//     let ls = quadrilateral.lines

//     let promises1 = _.range(four).map(async index => {
//         let ps = ls[index].getIntersectionPointsWithCircle(data.outerBorderC1)
//         ps = _.sortBy(ps, p => ( G.Vector(data.centerPoint, p).angle + 1.5 * Math.PI) % (2 * Math.PI))
//         await ps[0].draw(sketchGroup)
//         await ps[1].draw(sketchGroup)

//         data.quadrilateral.int1Points.push(...ps)
//     })

//     await Promise.all(promises1)

//     let promises2 = _.range(0 - 1, four - 1).map(async index => {
//         let toIndex
//         if (Math.abs(index % 2) == 1) {
//             toIndex = index - (four - 1)
//         } else {
//             toIndex = index + (four - 1)
//         }
//         let l = G.Line.fromTwoPoints(_.nth(data.quadrilateral.int1Points, index), _.nth(data.quadrilateral.int1Points, toIndex)),
//             ps = l.getIntersectionPointsWithCircle(data.outerBorderC2)

//         ps = _.sortBy(ps, p => (new G.Vector(data.centerPoint, p).angle + 1.5 * Math.PI) % (2 * Math.PI))

//         await ps[0].draw(sketchGroup)
//         await ps[1].draw(sketchGroup)

//         let indexLessThan0 = index < 0
//         index = (2 * four + index) % (2 * four)
//         toIndex = (2 * four + toIndex) % (2 * four)
//         if (indexLessThan0) {
//             data.quadrilateral.int2Points[index] = ps[1]
//             data.quadrilateral.int2Points[toIndex] = ps[0]
//         } else {
//             data.quadrilateral.int2Points[index] = ps[0]
//             data.quadrilateral.int2Points[toIndex] = ps[1]
//         }
//     })

//     await Promise.all(promises2)
// })
// //Draw final image
// .then(() => {
//     _.range(seven).forEach(index => {
//         let c1 = data.heptagonC1.circles[index],
//             c2 = data.heptagonC2.circles[index],
//             c3 = data.heptagonC3.circles[index],
//             c4 = data.heptagonC4.circles[index],
//             c6 = data.heptagonC6.circles[index],
//             c7 = data.heptagonC7.circles[index]

//         let l1 =
//             c1.getArcLengthBetween(data.heptagonPoints[index], data.heptagonC1.intPoints[index], true) +
//             c1.getArcLengthBetween(data.heptagonC1.intPoints[index], data.heptagonPoints[index], true) +
//             c6.getArcLengthBetween(data.heptagonPoints[index], data.heptagonC3.intPoints[index], false) +
//             c3.getArcLengthBetween(data.heptagonC3.intPoints[index], data.heptagonC2.intPoints[index], false) +
//             c2.getArcLengthBetween(data.heptagonC2.intPoints[index], data.heptagonPoints[index], true)

//         imageGroup
//             .path()
//             .attr("stroke-dasharray", [0, l1])
//             .attr("fill-opacity", 0)
//             .plot([
//                 ["M", ...data.heptagonPoints[index].toArray()],
//                 ["A", c1.radius, c1.radius, 0, 0, 1, ...data.heptagonC1.intPoints[index].toArray()],
//                 ["A", c1.radius, c1.radius, 0, 0, 1, ...data.heptagonPoints[index].toArray()],
//                 ["A", c6.radius, c6.radius, 0, 0, 0, ...data.heptagonC3.intPoints[index].toArray()],
//                 ["A", c3.radius, c3.radius, 0, 0, 0, ...data.heptagonC2.intPoints[index].toArray()],
//                 ["A", c2.radius, c2.radius, 0, 0, 1, ...data.heptagonPoints[index].toArray()],
//                 ["Z"]
//             ])
//             .animate(3000, 1000, "now")
//             .attr("stroke-dasharray", [l1, 0])
//             .animate(3000, 0, "after")
//             .attr("fill-opacity", 1)

//         let l2 = c4.getPerimeter()

//         imageGroup
//             .path()
//             .attr("stroke-dasharray", [0, l2])
//             .attr("fill-opacity", 0)
//             .plot([
//                 ["M", ...data.heptagonC4.intPointLists[index][0].toArray()],
//                 ["A", c4.radius, c4.radius, 0, 0, 0, ...data.heptagonC4.intPointLists[index][1].toArray()],
//                 ["A", c4.radius, c4.radius, 0, 0, 0, ...data.heptagonC4.intPointLists[index][0].toArray()],
//                 ["Z"]
//             ])
//             .animate(3000, 1000, "now")
//             .attr("stroke-dasharray", [l2, 0])
//             .animate(3000, 0, "after")
//             .attr("fill-opacity", 1)

//         let l3 = c7.getPerimeter()
//         imageGroup
//             .path()
//             .attr("stroke-dasharray", [0, l3])
//             .attr("fill-opacity", 0)
//             .plot([
//                 ["M", ...data.heptagonOffsetPoints[index].toArray()],
//                 ["A", c7.radius, c7.radius, 0, 0, 0, ...data.heptagonC7.intPoints[index].toArray()],
//                 ["A", c7.radius, c7.radius, 0, 0, 0, ...data.heptagonOffsetPoints[index].toArray()],
//                 ["Z"]
//             ])
//             .animate(3000, 1000, "now")
//             .attr("stroke-dasharray", [l3, 0])
//             .animate(3000, 0, "after")
//             .attr("fill-opacity", 1)
//     })
//     _.range(three).forEach(index => {
//         let c1 = data.triangleC1.circles[index],
//             c2 = data.triangleC2.circles[index],
//             ibc = data.innerBorderC2

//         let l =
//             c2.getArcLengthBetween(data.trianglePoints[index], data.triangleC2.tanPoints[index], true) +
//             _.nth(data.triangleC1.circles, index - three + 1).getArcLengthBetween(data.triangleC2.tanPoints[index], _.nth(data.triangleC1.intPoints, index - three + 1), false) +
//             ibc.getArcLengthBetween(_.nth(data.triangleC1.intPoints, index - three + 1), data.trianglePoints[index], true)

//         imageGroup
//             .path()
//             .attr("stroke-dasharray", [0, l])
//             .attr("fill-opacity", 0)
//             .plot([
//                 ["M", ...data.trianglePoints[index].toArray()],
//                 ["A", c2.radius, c2.radius, 0, 1, 1, ...data.triangleC2.tanPoints[index].toArray()],
//                 ["A", c1.radius, c1.radius, 0, 0, 0, ..._.nth(data.triangleC1.intPoints, index - three + 1).toArray()],
//                 ["A", ibc.radius, ibc.radius, 0, 0, 1, ...data.trianglePoints[index].toArray()],
//                 ["Z"]
//             ])
//             .animate(3000, 1000, "now")
//             .attr("stroke-dasharray", [l, 0])
//             .animate(3000, 0, "after")
//             .attr("fill-opacity", 1)
//     })
//     let int1ps = data.quadrilateral.int1Points,
//         int2ps = data.quadrilateral.int2Points,
//         oc1 = data.outerBorderC1,
//         oc2 = data.outerBorderC2

//     _.range(four).forEach(index => {
//         let l =
//             int2ps[index * 2].getDistanceBetweenPoint(int1ps[index * 2]) +
//             oc1.getArcLengthBetween(int1ps[index * 2], int1ps[index * 2 + 1], false) +
//             int1ps[index * 2 + 1].getDistanceBetweenPoint(int2ps[index * 2 + 1]) +
//             oc2.getArcLengthBetween(int2ps[index * 2 + 1], int2ps[index * 2], true)

//         imageGroup
//             .path()
//             .attr("stroke-dasharray", [0, l])
//             .attr("fill-opacity", 0)
//             .plot([
//                 ["M", ...int2ps[index * 2].toArray()],
//                 ["L", ...int1ps[index * 2].toArray()],
//                 ["A", oc1.radius, oc1.radius, 0, 0, 0, ...int1ps[index * 2 + 1].toArray()],
//                 ["L", ...int2ps[index * 2 + 1].toArray()],
//                 ["A", oc2.radius, oc2.radius, 0, 0, 1, ...int2ps[index * 2].toArray()],
//                 ["Z"]
//             ])
//             .animate(3000, 1000, "now")
//             .attr("stroke-dasharray", [l, 0])
//             .animate(3000, 0, "after")
//             .attr("fill-opacity", 1)
//     })
// })

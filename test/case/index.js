import { SVG } from "@svgdotjs/svg.js"
import _ from "lodash"
import G from "../../src/geomtoy"
import "../../src/_draw.js"
 

const radius = 256,
    prePadding = 100,
    seven = 7,
    four = 4,
    three = 3,
    colors = ["#900", "#099", "#009"]

console.log(G);window.G = G

let draw = SVG()
        .addTo("body")
        .size(radius * 2 + prePadding * 2, radius * 2 + prePadding * 2)
        .viewbox(0, 0, radius * 2 + prePadding * 2, radius * 2 + prePadding * 2),
    data = {}

let sketchGroup = draw.group()
sketchGroup.stroke({ color: "rgba(77, 77, 77, 0.5)", width: 1 }).fill("none")

let sketchStrokeGroup = draw.group()
sketchStrokeGroup.stroke({ color: "rgba(77, 77, 77, 0.3)", width: 1, dasharray: 2 }).fill("none")

let imageGroup = draw.group()
imageGroup.stroke({ color: "rgba(0, 0, 0, 0.5)", width: 2 }).fill({ color: "rgba(111, 0, 0, 0.8)" })

Promise.resolve("Let's begin")
    .then(async () => {
        data.centerPoint = null
        data.initCircle = null

        let centerPoint = new G.Point(radius + prePadding, radius + prePadding)
        data.centerPoint = centerPoint
        await centerPoint.draw(sketchGroup)
        
        let initCircle = new G.Circle(radius, data.centerPoint)
        data.initCircle = initCircle
        await initCircle.draw(sketchStrokeGroup)
    })
    .then(async () => {
        data.heptagonPoints = []
        data.heptagonOffsetPoints = []
        data.heptagonPQuarterPoints = []
        data.heptagonNQuarterPoints = []
        data.heptagonPEighthPoints = []
        data.heptagonNEighthPoints = []

        let heptagon = new G.RegularPolygon(radius, data.centerPoint, seven, -Math.PI / 2),
            heptagonOffset = new G.RegularPolygon(radius, data.centerPoint, seven, Math.PI / seven - Math.PI / 2),
            heptagonPQuarter = new G.RegularPolygon(radius, data.centerPoint, seven, Math.PI / seven / 2 - Math.PI / 2),
            heptagonNQuarter = new G.RegularPolygon(radius, data.centerPoint, seven, -Math.PI / seven / 2 - Math.PI / 2),
            heptagonPEighth = new G.RegularPolygon(radius, data.centerPoint, seven, Math.PI / seven / 4 - Math.PI / 2),
            heptagonNEighth = new G.RegularPolygon(radius, data.centerPoint, seven, -Math.PI / seven / 4 - Math.PI / 2)

        data.heptagonPoints = heptagon.points
        data.heptagonOffsetPoints = heptagonOffset.points
        data.heptagonPQuarterPoints = heptagonPQuarter.points
        data.heptagonNQuarterPoints = heptagonNQuarter.points
        data.heptagonPEighthPoints = heptagonPEighth.points
        data.heptagonNEighthPoints = heptagonNEighth.points

        let heptagonDraw = await heptagon.draw(sketchGroup)
        heptagonDraw.stroke({ color: colors[0] })

        let promises = _.range(seven).map(async index => {
            await data.heptagonPoints[index].draw(sketchGroup)
            await new G.Segment(data.centerPoint, data.heptagonPoints[index]).draw(sketchStrokeGroup)

            await data.heptagonOffsetPoints[index].draw(sketchGroup)
            await new G.Segment(data.centerPoint, data.heptagonOffsetPoints[index]).draw(sketchStrokeGroup)

            await Promise.all([data.heptagonPQuarterPoints[index].draw(sketchGroup), data.heptagonNQuarterPoints[index].draw(sketchGroup)])
            await Promise.all([
                new G.Segment(data.centerPoint, data.heptagonPQuarterPoints[index]).draw(sketchStrokeGroup),
                new G.Segment(data.centerPoint, data.heptagonNQuarterPoints[index]).draw(sketchStrokeGroup)
            ])

            await Promise.all([data.heptagonPEighthPoints[index].draw(sketchGroup), data.heptagonNEighthPoints[index].draw(sketchGroup)])
            await Promise.all([
                new G.Segment(data.centerPoint, data.heptagonPEighthPoints[index]).draw(sketchStrokeGroup),
                new G.Segment(data.centerPoint, data.heptagonNEighthPoints[index]).draw(sketchStrokeGroup)
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
            let lA = G.Line.fromPoints(_.nth(data.heptagonOffsetPoints, index - 1), data.centerPoint), //use _.nth to get index -1
                lB = G.Line.fromPoints(_.nth(data.heptagonOffsetPoints, index), data.centerPoint),
                lC = new G.Circle(radius, data.centerPoint).getTangentLineAtPoint(_.nth(data.heptagonPoints, index)),
                pA = lA.getIntersectionPointWithLine(lC),
                pB = lB.getIntersectionPointWithLine(lC),
                triangle = new G.Triangle(pA, pB, data.centerPoint),
                c = triangle.getInscribedCircle()
            await triangle.draw(sketchStrokeGroup)
            await c.draw(sketchGroup)
            data.heptagonC1.circles[index] = c

            let ps = G.Line.fromPoints(_.nth(data.heptagonPoints, index), data.centerPoint).getIntersectionPointsWithCircle(c)
            data.heptagonC1.intPoints[index] = _.find(ps, p => !p.isSameAs(_.nth(data.heptagonPoints, index)))
            await data.heptagonC1.intPoints[index].draw(sketchGroup)
        })
        await Promise.all(promises)
    })
    .then(async () => {
        data.heptagonC2 = {
            intPoints: [],
            circles: []
        }
        let promises = _.range(seven).map(async index => {
            let lA = G.Line.fromPoints(data.heptagonPEighthPoints[index], data.centerPoint),
                lB = G.Line.fromPoints(data.heptagonNEighthPoints[index], data.centerPoint),
                lC = new G.Circle(radius, data.centerPoint).getTangentLineAtPoint(_.nth(data.heptagonPoints, index)),
                pA = lA.getIntersectionPointWithLine(lC),
                pB = lB.getIntersectionPointWithLine(lC),
                triangle = new G.Triangle(pA, pB, data.centerPoint),
                c = triangle.getInscribedCircle()

            await triangle.draw(sketchStrokeGroup)
            await c.draw(sketchGroup)
            data.heptagonC2.circles[index] = c

            let ps = G.Line.fromPoints(_.nth(data.heptagonPoints, index), data.centerPoint).getIntersectionPointsWithCircle(c)
            data.heptagonC2.intPoints[index] = _.find(ps, p => !p.isSameAs(data.heptagonPoints[index]))
            await data.heptagonC2.intPoints[index].draw(sketchGroup)
        })
        await Promise.all(promises)
    })
    .then(async () => {
        data.heptagonC3 = {
            intPoints: [],
            circles: []
        }
        let promises = _.range(seven).map(async index => {
            let lA = G.Line.fromPoints(data.heptagonPQuarterPoints[index], data.centerPoint),
                lB = G.Line.fromPoints(data.heptagonNQuarterPoints[index], data.centerPoint),
                lC = data.heptagonC2.circles[index].getTangentLineAtPoint(data.heptagonC2.intPoints[index]),
                pA = lA.getIntersectionPointWithLine(lC),
                pB = lB.getIntersectionPointWithLine(lC),
                triangle = new G.Triangle(pA, pB, data.centerPoint),
                c = triangle.getInscribedCircle()

            await triangle.draw(sketchStrokeGroup)
            await c.draw(sketchGroup)
            data.heptagonC3.circles[index] = c

            let ps = G.Line.fromPoints(data.heptagonC2.intPoints[index], data.centerPoint).getIntersectionPointsWithCircle(c)
            data.heptagonC3.intPoints[index] = _.find(ps, p => !p.isSameAs(data.heptagonC2.intPoints[index]))
            await data.heptagonC3.intPoints[index].draw(sketchGroup)
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
            let p = new G.Point(data.heptagonC3.circles[index].cx, data.heptagonC3.circles[index].cy),
                c = new G.Circle(data.heptagonC2.circles[index].radius, p),
                l = G.Line.fromPoints(data.centerPoint, data.heptagonPoints[index]),
                ps = l.getIntersectionPointsWithCircle(c)

            ps = _.sortBy(ps, p => p.getDistanceFromPoint(data.centerPoint)) //ascending order

            await p.draw(sketchGroup)
            await c.draw(sketchGroup)
            await ps[0].draw(sketchGroup)
            await ps[1].draw(sketchGroup)

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
                r = pA.getDistanceFromPoint(pB) / 2,
                mp = new G.Segment(pA, pB).getMiddlePoint()

            let c = new G.Circle(r, mp)
            await c.draw(sketchGroup)
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
                r = pA.getDistanceFromPoint(pB) / 2,
                mp = new G.Segment(pA, pB).getMiddlePoint()

            let c = new G.Circle(r, mp)
            await c.draw(sketchGroup)
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
                l = G.Line.fromPoints(p, data.centerPoint),
                ps1 = l.getIntersectionPointsWithCircle(new G.Circle(r, p)),
                ps2 = l.getIntersectionPointsWithCircle(new G.Circle(2 * r, p))

            ps1 = _.sortBy(ps1, p => p.getDistanceFromPoint(data.centerPoint)) //ascending order
            ps2 = _.sortBy(ps2, p => p.getDistanceFromPoint(data.centerPoint)) //ascending order

            let center = ps1[0],
                c = new G.Circle(r, center)
            await c.draw(sketchGroup)

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
            c1 = new G.Circle(r1, data.centerPoint),
            c2 = new G.Circle(r2, data.centerPoint)

        await c1.draw(sketchStrokeGroup)
        await c2.draw(sketchGroup)

        data.innerBorderC1 = c1
        data.innerBorderC2 = c2
    })
    .then(async () => {
        data.outerBorderC1 = null
        data.outerBorderC2 = null

        let r1 = radius + data.gap,
            r2 = r1 + data.gap,
            c1 = new G.Circle(r1, data.centerPoint),
            c2 = new G.Circle(r2, data.centerPoint)

        await c1.draw(sketchGroup)
        await c2.draw(sketchGroup)

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
            triangleDraw = await triangle.draw(sketchGroup)
        triangleDraw.stroke({ color: colors[1] })
        data.trianglePoints = triangle.points

        let promises1 = _.range(three).map(async index => {
            await data.trianglePoints[index].draw(sketchGroup)

            let l = G.Line.fromPoints(data.trianglePoints[index], data.centerPoint),
                psWithIBC1 = l.getIntersectionPointsWithCircle(data.innerBorderC1)

            psWithIBC1 = _.sortBy(psWithIBC1, p => p.getDistanceFromPoint(data.trianglePoints[index]))
            psWithIBC1[0].draw(sketchGroup)

            let c = new G.Circle(psWithIBC1[0].getDistanceFromPoint(data.centerPoint) / 2, new G.Segment(psWithIBC1[0], data.centerPoint).getMiddlePoint())
            await c.draw(sketchGroup)
            await c.centerPoint.draw(sketchGroup)

            let ps = c.getIntersectionPointsWithCircle(data.innerBorderC2)
            await ps[0].draw(sketchGroup)
            await ps[1].draw(sketchGroup)

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
            await commonTangentCircles[1].draw(sketchGroup)

            let etData = commonTangentCircles[1].getExternallyTangentDataWithCircle(_.nth(data.triangleC1.circles, index - 2))
            data.triangleC2.tanPoints[index] = etData.point
            await etData.point.draw(sketchGroup)
        })

        await Promise.all(promises2)
    })
    .then(async () => {
        data.quadrilateralPoints = []
        data.quadrilateral = {
            int1Points: [],
            int2Points: []
        }

        let quadrilateral = new G.RegularPolygon(radius + data.gap * 2, data.centerPoint, four, Math.PI / 2),
            quadrilateralDraw = await quadrilateral.draw(sketchGroup)

        quadrilateralDraw.stroke({ color: colors[2] })

        let ls = quadrilateral.lines

        let promises1 = _.range(four).map(async index => {
            let ps = ls[index].getIntersectionPointsWithCircle(data.outerBorderC1)
            ps = _.sortBy(ps, p => (new G.Vector(data.centerPoint, p).angle + 1.5 * Math.PI) % (2 * Math.PI))
            await ps[0].draw(sketchGroup)
            await ps[1].draw(sketchGroup)

            data.quadrilateral.int1Points.push(...ps)
        })

        await Promise.all(promises1)

        let promises2 = _.range(0 - 1, four - 1).map(async index => {
            let toIndex
            if (Math.abs(index % 2) == 1) {
                toIndex = index - (four - 1)
            } else {
                toIndex = index + (four - 1)
            }
            let l = G.Line.fromPoints(_.nth(data.quadrilateral.int1Points, index), _.nth(data.quadrilateral.int1Points, toIndex)),
                ps = l.getIntersectionPointsWithCircle(data.outerBorderC2)

            ps = _.sortBy(ps, p => (new G.Vector(data.centerPoint, p).angle + 1.5 * Math.PI) % (2 * Math.PI))

            await ps[0].draw(sketchGroup)
            await ps[1].draw(sketchGroup)

            let indexLessThan0 = index < 0
            index = (2 * four + index) % (2 * four)
            toIndex = (2 * four + toIndex) % (2 * four)
            if (indexLessThan0) {
                data.quadrilateral.int2Points[index] = ps[1]
                data.quadrilateral.int2Points[toIndex] = ps[0]
            } else {
                data.quadrilateral.int2Points[index] = ps[0]
                data.quadrilateral.int2Points[toIndex] = ps[1]
            }
        })

        await Promise.all(promises2)
    })
    //Draw final image
    .then(() => {
        _.range(seven).forEach(index => {
            let c1 = data.heptagonC1.circles[index],
                c2 = data.heptagonC2.circles[index],
                c3 = data.heptagonC3.circles[index],
                c4 = data.heptagonC4.circles[index],
                c6 = data.heptagonC6.circles[index],
                c7 = data.heptagonC7.circles[index]

            let l1 =
                c1.getArcLengthBetween(data.heptagonPoints[index], data.heptagonC1.intPoints[index], true) +
                c1.getArcLengthBetween(data.heptagonC1.intPoints[index], data.heptagonPoints[index], true) +
                c6.getArcLengthBetween(data.heptagonPoints[index], data.heptagonC3.intPoints[index], false) +
                c3.getArcLengthBetween(data.heptagonC3.intPoints[index], data.heptagonC2.intPoints[index], false) +
                c2.getArcLengthBetween(data.heptagonC2.intPoints[index], data.heptagonPoints[index], true)

            imageGroup
                .path()
                .attr("stroke-dasharray", [0, l1])
                .attr("fill-opacity", 0)
                .plot([
                    ["M", ...data.heptagonPoints[index].toArray()],
                    ["A", c1.radius, c1.radius, 0, 0, 1, ...data.heptagonC1.intPoints[index].toArray()],
                    ["A", c1.radius, c1.radius, 0, 0, 1, ...data.heptagonPoints[index].toArray()],
                    ["A", c6.radius, c6.radius, 0, 0, 0, ...data.heptagonC3.intPoints[index].toArray()],
                    ["A", c3.radius, c3.radius, 0, 0, 0, ...data.heptagonC2.intPoints[index].toArray()],
                    ["A", c2.radius, c2.radius, 0, 0, 1, ...data.heptagonPoints[index].toArray()],
                    ["Z"]
                ])
                .animate(3000, 1000, "now")
                .attr("stroke-dasharray", [l1, 0])
                .animate(3000, 0, "after")
                .attr("fill-opacity", 1)

            let l2 = c4.getPerimeter()

            imageGroup
                .path()
                .attr("stroke-dasharray", [0, l2])
                .attr("fill-opacity", 0)
                .plot([
                    ["M", ...data.heptagonC4.intPointLists[index][0].toArray()],
                    ["A", c4.radius, c4.radius, 0, 0, 0, ...data.heptagonC4.intPointLists[index][1].toArray()],
                    ["A", c4.radius, c4.radius, 0, 0, 0, ...data.heptagonC4.intPointLists[index][0].toArray()],
                    ["Z"]
                ])
                .animate(3000, 1000, "now")
                .attr("stroke-dasharray", [l2, 0])
                .animate(3000, 0, "after")
                .attr("fill-opacity", 1)

            let l3 = c7.getPerimeter()
            imageGroup
                .path()
                .attr("stroke-dasharray", [0, l3])
                .attr("fill-opacity", 0)
                .plot([
                    ["M", ...data.heptagonOffsetPoints[index].toArray()],
                    ["A", c7.radius, c7.radius, 0, 0, 0, ...data.heptagonC7.intPoints[index].toArray()],
                    ["A", c7.radius, c7.radius, 0, 0, 0, ...data.heptagonOffsetPoints[index].toArray()],
                    ["Z"]
                ])
                .animate(3000, 1000, "now")
                .attr("stroke-dasharray", [l3, 0])
                .animate(3000, 0, "after")
                .attr("fill-opacity", 1)
        })
        _.range(three).forEach(index => {
            let c1 = data.triangleC1.circles[index],
                c2 = data.triangleC2.circles[index],
                ibc = data.innerBorderC2

            let l =
                c2.getArcLengthBetween(data.trianglePoints[index], data.triangleC2.tanPoints[index], true) +
                _.nth(data.triangleC1.circles, index - three + 1).getArcLengthBetween(data.triangleC2.tanPoints[index], _.nth(data.triangleC1.intPoints, index - three + 1), false) +
                ibc.getArcLengthBetween(_.nth(data.triangleC1.intPoints, index - three + 1), data.trianglePoints[index], true)

            imageGroup
                .path()
                .attr("stroke-dasharray", [0, l])
                .attr("fill-opacity", 0)
                .plot([
                    ["M", ...data.trianglePoints[index].toArray()],
                    ["A", c2.radius, c2.radius, 0, 1, 1, ...data.triangleC2.tanPoints[index].toArray()],
                    ["A", c1.radius, c1.radius, 0, 0, 0, ..._.nth(data.triangleC1.intPoints, index - three + 1).toArray()],
                    ["A", ibc.radius, ibc.radius, 0, 0, 1, ...data.trianglePoints[index].toArray()],
                    ["Z"]
                ])
                .animate(3000, 1000, "now")
                .attr("stroke-dasharray", [l, 0])
                .animate(3000, 0, "after")
                .attr("fill-opacity", 1)
        })
        let int1ps = data.quadrilateral.int1Points,
            int2ps = data.quadrilateral.int2Points,
            oc1 = data.outerBorderC1,
            oc2 = data.outerBorderC2

        _.range(four).forEach(index => {
            let l =
                int2ps[index * 2].getDistanceFromPoint(int1ps[index * 2]) +
                oc1.getArcLengthBetween(int1ps[index * 2], int1ps[index * 2 + 1], false) +
                int1ps[index * 2 + 1].getDistanceFromPoint(int2ps[index * 2 + 1]) +
                oc2.getArcLengthBetween(int2ps[index * 2 + 1], int2ps[index * 2], true)

            imageGroup
                .path()
                .attr("stroke-dasharray", [0, l])
                .attr("fill-opacity", 0)
                .plot([
                    ["M", ...int2ps[index * 2].toArray()],
                    ["L", ...int1ps[index * 2].toArray()],
                    ["A", oc1.radius, oc1.radius, 0, 0, 0, ...int1ps[index * 2 + 1].toArray()],
                    ["L", ...int2ps[index * 2 + 1].toArray()],
                    ["A", oc2.radius, oc2.radius, 0, 0, 1, ...int2ps[index * 2].toArray()],
                    ["Z"]
                ])
                .animate(3000, 1000, "now")
                .attr("stroke-dasharray", [l, 0])
                .animate(3000, 0, "after")
                .attr("fill-opacity", 1)
        })
    })

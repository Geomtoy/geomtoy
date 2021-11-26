import { defaultRendererConfig } from "../consts"
import { RendererConfig, LineCapType, LineJoinType, Renderer, GraphicsTextCommand, GraphicsImageCommand } from "../types"

import type Geomtoy from ".."
import type Shape from "../base/Shape"
import util from "../utility"
import bbox from "../utility/boundingBox"
/**
 * @category Renderer
 */
export default class VanillaCanvas implements Renderer {
    container: HTMLCanvasElement
    geomtoy: Geomtoy
    context: CanvasRenderingContext2D

    private _config: RendererConfig = defaultRendererConfig

    constructor(container: HTMLCanvasElement, geomtoy: Geomtoy) {
        if (container instanceof HTMLCanvasElement) {
            this.container = container
            this.geomtoy = geomtoy
            this.context = this.container.getContext("2d")!
            return this
        }
        throw new Error(`[G]Unable to initialize.`)
    }

    setup() {
        const gt = this.geomtoy.globalTransformation.get()
        this.context.setTransform(...gt)

        this.context.strokeStyle = this._config.stroke
        this.context.fillStyle = this._config.fill
        if (this._config.strokeDash.length) {
            this.context.setLineDash(this._config.strokeDash)
            this.context.lineDashOffset = this._config.strokeDashOffset
        }
        this.context.lineWidth = this._config.strokeWidth
        this.context.lineJoin = this._config.lineJoin
        this.context.miterLimit = this._config.miterLimit
        this.context.lineCap = this._config.lineCap
    }

    private _drawImage(cmd: GraphicsImageCommand, path2D: Path2D, behind = false) {
        const img = new window.Image()
        const { imageSource, x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight } = cmd

        img.addEventListener("load", () => {
            if (behind) {
                this.context.globalCompositeOperation = "destination-over"
            } else {
                this.context.globalCompositeOperation = "source-over"
            }
            if (util.isNaN(cmd.sourceX) || util.isNaN(cmd.sourceY) || util.isNaN(cmd.sourceWidth) || util.isNaN(cmd.sourceHeight)) {
                this.context.drawImage(img, x, y, width, height)
            } else {
                this.context.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
            }
        })
        img.src = imageSource
        // draw transparent bounding box
        this.context.strokeStyle = "transparent"
        this.context.fillStyle = "transparent"
        const box: [number, number, number, number] = [x, y, width, height]
        path2D.moveTo(...bbox.nn(box))
        path2D.lineTo(...bbox.nm(box))
        path2D.lineTo(...bbox.mm(box))
        path2D.lineTo(...bbox.mn(box))
        path2D.closePath()
    }
    private _drawText(cmd: GraphicsTextCommand, path2D: Path2D, behind = false) {
        // text baseline
        this.context.textBaseline = "alphabetic"
        // text font style
        let fontStyle = ""
        cmd.fontBold && (fontStyle += "bold ")
        cmd.fontItalic && (fontStyle += "italic ")
        fontStyle += `${cmd.fontSize}px `
        fontStyle += cmd.fontFamily
        this.context.font = fontStyle

        // handle text orientation
        this.context.save()
        this.context.transform(...this.geomtoy.globalTransformation.invert().get()) // resetTransform
        // text
        if (behind) {
            this.context.globalCompositeOperation = "destination-over"
        } else {
            this.context.globalCompositeOperation = "source-over"
        }
        this.context.fillText(cmd.text, ...this.geomtoy.globalTransformation.transformCoordinate([cmd.x, cmd.y]))
        this.context.restore()
        // draw transparent bounding box
        this.context.strokeStyle = "transparent"
        this.context.fillStyle = "transparent"
        const metrics = this.context.measureText(cmd.text)
        const width = metrics.width / this.geomtoy.scale
        const height = (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent) / this.geomtoy.scale
        const offsetY = this.geomtoy.yAxisPositiveOnBottom ? height : 0
        const offsetX = this.geomtoy.xAxisPositiveOnRight ? 0 : width
        const box: [number, number, number, number] = [cmd.x - offsetX, cmd.y - offsetY, width, height]
        path2D.moveTo(...bbox.nn(box))
        path2D.lineTo(...bbox.nm(box))
        path2D.lineTo(...bbox.mm(box))
        path2D.lineTo(...bbox.mn(box))
        path2D.closePath()
    }

    draw(shape: Shape, behind = false) {
        this.context.save()
        this.setup()
        const cmds = shape.getGraphics().commands
        const path2D = new Path2D()

        cmds.forEach(cmd => {
            if (cmd.type === "moveTo") {
                path2D.moveTo(cmd.x, cmd.y)
            }
            if (cmd.type === "lineTo") {
                path2D.lineTo(cmd.x, cmd.y)
            }
            if (cmd.type === "bezierCurveTo") {
                path2D.bezierCurveTo(cmd.controlPoint1X, cmd.controlPoint1Y, cmd.controlPoint2X, cmd.controlPoint2Y, cmd.x, cmd.y)
            }
            if (cmd.type === "quadraticBezierCurveTo") {
                path2D.quadraticCurveTo(cmd.controlPointX, cmd.controlPointY, cmd.x, cmd.y)
            }
            if (cmd.type === "arcTo") {
                path2D.ellipse(cmd.centerX, cmd.centerY, cmd.radiusX, cmd.radiusY, cmd.xAxisRotation, cmd.startAngle, cmd.endAngle, !cmd.positive)
            }
            if (cmd.type === "close") {
                path2D.closePath()
            }
            if (cmd.type === "text") {
                this._drawText(cmd, path2D, behind)
            }
            if (cmd.type === "image") {
                this._drawImage(cmd, path2D, behind)
            }
        })

        if (behind) {
            this.context.globalCompositeOperation = "destination-over"
        } else {
            this.context.globalCompositeOperation = "source-over"
        }
        this.context.fill(path2D)
        this.context.stroke(path2D)
        this.context.restore()
        return path2D
    }
    drawBatch(shapes: Shape[], behind = false) {
        return shapes.map(o => this.draw(o, behind))
    }
    clear() {
        this.context.clearRect(0, 0, this.container.width, this.container.height)
    }
    stroke(stroke: string) {
        this._config.stroke = stroke
    }
    strokeWidth(strokeWidth: number) {
        this._config.strokeWidth = strokeWidth / this.geomtoy.scale
    }
    strokeDash(strokeDash: number[]) {
        this._config.strokeDash = strokeDash.map(n => n / this.geomtoy.scale)
    }
    strokeDashOffset(strokeDashOffset: number) {
        this._config.strokeDashOffset = strokeDashOffset / this.geomtoy.scale
    }
    fill(fill: string) {
        this._config.fill = fill
    }
    lineJoin(lineJoin: LineJoinType) {
        this._config.lineJoin = lineJoin
    }
    lineCap(lineCap: LineCapType) {
        this._config.lineCap = lineCap
    }
    miterLimit(miterLimit: number) {
        this._config.miterLimit = miterLimit
    }

    isPointInFill(path2D: Path2D, x: number, y: number) {
        return this.context.isPointInPath(path2D, x, y)
    }
    isPointInStroke(path2D: Path2D, strokeWidth: number, x: number, y: number) {
        this.context.save()
        this.context.lineWidth = strokeWidth / this.geomtoy.scale
        const d = this.context.isPointInStroke(path2D, x, y)
        this.context.restore()
        return d
    }
}

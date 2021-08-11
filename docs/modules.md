[Geomtoy](README.md) / Modules

# Geomtoy

## Table of contents

### Entry Classes

- [Geomtoy](classes/Geomtoy.md)

### Base Classes

- [GeomObject](classes/GeomObject.md)

### GeomObject Classes

- [Point](classes/Point.md)
- [Line](classes/Line.md)
- [Segment](classes/Segment.md)
- [Vector](classes/Vector.md)
- [Triangle](classes/Triangle.md)
- [Circle](classes/Circle.md)
- [Rectangle](classes/Rectangle.md)
- [Polyline](classes/Polyline.md)
- [Polygon](classes/Polygon.md)
- [RegularPolygon](classes/RegularPolygon.md)
- [Ellipse](classes/Ellipse.md)

### Other Classes

- [Transformation](classes/Transformation.md)
- [Inversion](classes/Inversion.md)
- [SvgDotJs](classes/SvgDotJs.md)
- [VanillaCanvas](classes/VanillaCanvas.md)
- [VanillaSvg](classes/VanillaSvg.md)

### Interfaces

- [AreaMeasurable](interfaces/AreaMeasurable.md)
- [Visible](interfaces/Visible.md)

### Type aliases

- [GraphicImplType](modules.md#graphicimpltype)
- [GraphicDirective](modules.md#graphicdirective)
- [GraphicMoveToDirective](modules.md#graphicmovetodirective)
- [GraphicLineToDirective](modules.md#graphiclinetodirective)
- [GraphicBezierCurveToDirective](modules.md#graphicbeziercurvetodirective)
- [GraphicQuadraticBezierCurveToDirective](modules.md#graphicquadraticbeziercurvetodirective)
- [GraphicArcToDirective](modules.md#graphicarctodirective)
- [GraphicCloseDirective](modules.md#graphicclosedirective)
- [SvgDirective](modules.md#svgdirective)
- [SvgMDirective](modules.md#svgmdirective)
- [SvgLDirective](modules.md#svgldirective)
- [SvgCDirective](modules.md#svgcdirective)
- [SvgQDirective](modules.md#svgqdirective)
- [SvgADirective](modules.md#svgadirective)
- [SvgZDirective](modules.md#svgzdirective)
- [CanvasDirective](modules.md#canvasdirective)
- [CanvasMoveToDirective](modules.md#canvasmovetodirective)
- [CanvasLineToDirective](modules.md#canvaslinetodirective)
- [CanvasBezierCurveToDirective](modules.md#canvasbeziercurvetodirective)
- [CanvasQuadraticCurveToDirective](modules.md#canvasquadraticcurvetodirective)
- [CanvasArcDirective](modules.md#canvasarcdirective)
- [CanvasEllipseDirective](modules.md#canvasellipsedirective)
- [CanvasClosePathDirective](modules.md#canvasclosepathdirective)
- [Options](modules.md#options)

### Enumerations

- [GraphicDirectiveType](enums/GraphicDirectiveType.md)
- [SvgDirectiveType](enums/SvgDirectiveType.md)
- [CanvasDirectiveType](enums/CanvasDirectiveType.md)
- [RsPointToLine](enums/RsPointToLine.md)
- [RsPointToSegment](enums/RsPointToSegment.md)
- [RsPointToCircle](enums/RsPointToCircle.md)
- [RsLineToSegment](enums/RsLineToSegment.md)
- [RsLineToRectangle](enums/RsLineToRectangle.md)
- [RsSegmentToSegment](enums/RsSegmentToSegment.md)
- [RsCircleToCircle](enums/RsCircleToCircle.md)
- [RsRectangleToRectangle](enums/RsRectangleToRectangle.md)

### Variables

- [defaultOptions](modules.md#defaultoptions)

## Type aliases

### GraphicImplType

Ƭ **GraphicImplType**: ``"canvas"`` \| ``"svg"``

___

### GraphicDirective

Ƭ **GraphicDirective**: [`GraphicMoveToDirective`](modules.md#graphicmovetodirective) \| [`GraphicLineToDirective`](modules.md#graphiclinetodirective) \| [`GraphicBezierCurveToDirective`](modules.md#graphicbeziercurvetodirective) \| [`GraphicQuadraticBezierCurveToDirective`](modules.md#graphicquadraticbeziercurvetodirective) \| [`GraphicArcToDirective`](modules.md#graphicarctodirective) \| [`GraphicCloseDirective`](modules.md#graphicclosedirective)

___

### GraphicMoveToDirective

Ƭ **GraphicMoveToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`MoveTo`](enums/GraphicDirectiveType.md#moveto) |
| `x` | `number` |
| `y` | `number` |
| `currentX` | `number` |
| `currentY` | `number` |

___

### GraphicLineToDirective

Ƭ **GraphicLineToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`LineTo`](enums/GraphicDirectiveType.md#lineto) |
| `x` | `number` |
| `y` | `number` |
| `currentX` | `number` |
| `currentY` | `number` |

___

### GraphicBezierCurveToDirective

Ƭ **GraphicBezierCurveToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`BezierCurveTo`](enums/GraphicDirectiveType.md#beziercurveto) |
| `cp1x` | `number` |
| `cp1y` | `number` |
| `cp2x` | `number` |
| `cp2y` | `number` |
| `x` | `number` |
| `y` | `number` |
| `currentX` | `number` |
| `currentY` | `number` |

___

### GraphicQuadraticBezierCurveToDirective

Ƭ **GraphicQuadraticBezierCurveToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`QuadraticBezierCurveTo`](enums/GraphicDirectiveType.md#quadraticbeziercurveto) |
| `cpx` | `number` |
| `cpy` | `number` |
| `x` | `number` |
| `y` | `number` |
| `currentX` | `number` |
| `currentY` | `number` |

___

### GraphicArcToDirective

Ƭ **GraphicArcToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`ArcTo`](enums/GraphicDirectiveType.md#arcto) |
| `cx` | `number` |
| `cy` | `number` |
| `rx` | `number` |
| `ry` | `number` |
| `startAngle` | `number` |
| `endAngle` | `number` |
| `xAxisRotation` | `number` |
| `anticlockwise` | `boolean` |
| `x1` | `number` |
| `y1` | `number` |
| `x2` | `number` |
| `y2` | `number` |
| `largeArcFlag` | `boolean` |
| `sweepFlag` | `boolean` |
| `currentX` | `number` |
| `currentY` | `number` |

___

### GraphicCloseDirective

Ƭ **GraphicCloseDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`Close`](enums/GraphicDirectiveType.md#close) |
| `currentX` | `number` |
| `currentY` | `number` |

___

### SvgDirective

Ƭ **SvgDirective**: [`SvgMDirective`](modules.md#svgmdirective) \| [`SvgLDirective`](modules.md#svgldirective) \| [`SvgCDirective`](modules.md#svgcdirective) \| [`SvgQDirective`](modules.md#svgqdirective) \| [`SvgADirective`](modules.md#svgadirective) \| [`SvgZDirective`](modules.md#svgzdirective)

___

### SvgMDirective

Ƭ **SvgMDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`M`](enums/SvgDirectiveType.md#m) |
| `x` | `number` |
| `y` | `number` |

___

### SvgLDirective

Ƭ **SvgLDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`L`](enums/SvgDirectiveType.md#l) |
| `x` | `number` |
| `y` | `number` |

___

### SvgCDirective

Ƭ **SvgCDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`C`](enums/SvgDirectiveType.md#c) |
| `x` | `number` |
| `y` | `number` |
| `cp1x` | `number` |
| `cp1y` | `number` |
| `cp2x` | `number` |
| `cp2y` | `number` |

___

### SvgQDirective

Ƭ **SvgQDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`Q`](enums/SvgDirectiveType.md#q) |
| `x` | `number` |
| `y` | `number` |
| `cpx` | `number` |
| `cpy` | `number` |

___

### SvgADirective

Ƭ **SvgADirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`A`](enums/SvgDirectiveType.md#a) |
| `x` | `number` |
| `y` | `number` |
| `rx` | `number` |
| `ry` | `number` |
| `largeArcFlag` | `boolean` |
| `sweepFlag` | `boolean` |
| `xAxisRotation` | `number` |

___

### SvgZDirective

Ƭ **SvgZDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`Z`](enums/SvgDirectiveType.md#z) |

___

### CanvasDirective

Ƭ **CanvasDirective**: [`CanvasMoveToDirective`](modules.md#canvasmovetodirective) \| [`CanvasLineToDirective`](modules.md#canvaslinetodirective) \| [`CanvasBezierCurveToDirective`](modules.md#canvasbeziercurvetodirective) \| [`CanvasQuadraticCurveToDirective`](modules.md#canvasquadraticcurvetodirective) \| [`CanvasArcDirective`](modules.md#canvasarcdirective) \| [`CanvasEllipseDirective`](modules.md#canvasellipsedirective) \| [`CanvasClosePathDirective`](modules.md#canvasclosepathdirective)

___

### CanvasMoveToDirective

Ƭ **CanvasMoveToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`MoveTo`](enums/CanvasDirectiveType.md#moveto) |
| `x` | `number` |
| `y` | `number` |

___

### CanvasLineToDirective

Ƭ **CanvasLineToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`LineTo`](enums/CanvasDirectiveType.md#lineto) |
| `x` | `number` |
| `y` | `number` |

___

### CanvasBezierCurveToDirective

Ƭ **CanvasBezierCurveToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`BezierCurveTo`](enums/CanvasDirectiveType.md#beziercurveto) |
| `x` | `number` |
| `y` | `number` |
| `cp1x` | `number` |
| `cp1y` | `number` |
| `cp2x` | `number` |
| `cp2y` | `number` |

___

### CanvasQuadraticCurveToDirective

Ƭ **CanvasQuadraticCurveToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`QuadraticCurveTo`](enums/CanvasDirectiveType.md#quadraticcurveto) |
| `x` | `number` |
| `y` | `number` |
| `cpx` | `number` |
| `cpy` | `number` |

___

### CanvasArcDirective

Ƭ **CanvasArcDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`Arc`](enums/CanvasDirectiveType.md#arc) |
| `x` | `number` |
| `y` | `number` |
| `r` | `number` |
| `startAngle` | `number` |
| `endAngle` | `number` |
| `anticlockwise` | `boolean` |

___

### CanvasEllipseDirective

Ƭ **CanvasEllipseDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`Ellipse`](enums/CanvasDirectiveType.md#ellipse) |
| `x` | `number` |
| `y` | `number` |
| `rx` | `number` |
| `ry` | `number` |
| `startAngle` | `number` |
| `endAngle` | `number` |
| `xAxisRotation` | `number` |
| `anticlockwise` | `boolean` |

___

### CanvasClosePathDirective

Ƭ **CanvasClosePathDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`ClosePath`](enums/CanvasDirectiveType.md#closepath) |

___

### Options

Ƭ **Options**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `epsilon` | `number` |
| `graphic` | `Object` |
| `graphic.pointSize` | `number` |
| `graphic.lineRange` | `number` |
| `graphic.vectorArrow` | `Object` |
| `graphic.vectorArrow.width` | `number` |
| `graphic.vectorArrow.length` | `number` |
| `graphic.vectorArrow.foldback` | `number` |
| `fillRule` | ``"nonzero"`` \| ``"evenodd"`` |
| `pathSampleRatio` | ``100`` |
| `coordinateSystem` | `Object` |
| `coordinateSystem.xAxisPositiveOnRight` | `boolean` |
| `coordinateSystem.yAxisPositiveOnBottom` | `boolean` |
| `coordinateSystem.originX` | `number` |
| `coordinateSystem.originY` | `number` |
| `coordinateSystem.scale` | `number` |

## Variables

### defaultOptions

• `Const` **defaultOptions**: [`Options`](modules.md#options)

[geomtoy](../README.md) / [Exports](../modules.md) / types/graphic

# Module: types/graphic

## Table of contents

### Enumerations

- [CanvasDirectiveType](../enums/types_graphic.CanvasDirectiveType.md)
- [GraphicDirectiveType](../enums/types_graphic.GraphicDirectiveType.md)
- [SvgDirectiveType](../enums/types_graphic.SvgDirectiveType.md)

### Type aliases

- [CanvasArcDirective](types_graphic.md#canvasarcdirective)
- [CanvasBezierCurveToDirective](types_graphic.md#canvasbeziercurvetodirective)
- [CanvasClosePathDirective](types_graphic.md#canvasclosepathdirective)
- [CanvasDirective](types_graphic.md#canvasdirective)
- [CanvasEllipseDirective](types_graphic.md#canvasellipsedirective)
- [CanvasLineToDirective](types_graphic.md#canvaslinetodirective)
- [CanvasMoveToDirective](types_graphic.md#canvasmovetodirective)
- [CanvasQuadraticCurveToDirective](types_graphic.md#canvasquadraticcurvetodirective)
- [GraphicArcToDirective](types_graphic.md#graphicarctodirective)
- [GraphicBezierCurveToDirective](types_graphic.md#graphicbeziercurvetodirective)
- [GraphicCloseDirective](types_graphic.md#graphicclosedirective)
- [GraphicDirective](types_graphic.md#graphicdirective)
- [GraphicImplType](types_graphic.md#graphicimpltype)
- [GraphicLineToDirective](types_graphic.md#graphiclinetodirective)
- [GraphicMoveToDirective](types_graphic.md#graphicmovetodirective)
- [GraphicQuadraticBezierCurveToDirective](types_graphic.md#graphicquadraticbeziercurvetodirective)
- [SvgADirective](types_graphic.md#svgadirective)
- [SvgCDirective](types_graphic.md#svgcdirective)
- [SvgDirective](types_graphic.md#svgdirective)
- [SvgLDirective](types_graphic.md#svgldirective)
- [SvgMDirective](types_graphic.md#svgmdirective)
- [SvgQDirective](types_graphic.md#svgqdirective)
- [SvgZDirective](types_graphic.md#svgzdirective)

## Type aliases

### CanvasArcDirective

Ƭ **CanvasArcDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `anticlockwise` | `boolean` |
| `endAngle` | `number` |
| `r` | `number` |
| `startAngle` | `number` |
| `type` | [`Arc`](../enums/types_graphic.CanvasDirectiveType.md#arc) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:172

___

### CanvasBezierCurveToDirective

Ƭ **CanvasBezierCurveToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cp1x` | `number` |
| `cp1y` | `number` |
| `cp2x` | `number` |
| `cp2y` | `number` |
| `type` | [`BezierCurveTo`](../enums/types_graphic.CanvasDirectiveType.md#beziercurveto) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:156

___

### CanvasClosePathDirective

Ƭ **CanvasClosePathDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`ClosePath`](../enums/types_graphic.CanvasDirectiveType.md#closepath) |

#### Defined in

types/graphic.ts:192

___

### CanvasDirective

Ƭ **CanvasDirective**: [`CanvasMoveToDirective`](types_graphic.md#canvasmovetodirective) \| [`CanvasLineToDirective`](types_graphic.md#canvaslinetodirective) \| [`CanvasBezierCurveToDirective`](types_graphic.md#canvasbeziercurvetodirective) \| [`CanvasQuadraticCurveToDirective`](types_graphic.md#canvasquadraticcurvetodirective) \| [`CanvasArcDirective`](types_graphic.md#canvasarcdirective) \| [`CanvasEllipseDirective`](types_graphic.md#canvasellipsedirective) \| [`CanvasClosePathDirective`](types_graphic.md#canvasclosepathdirective)

#### Defined in

types/graphic.ts:137

___

### CanvasEllipseDirective

Ƭ **CanvasEllipseDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `anticlockwise` | `boolean` |
| `endAngle` | `number` |
| `rx` | `number` |
| `ry` | `number` |
| `startAngle` | `number` |
| `type` | [`Ellipse`](../enums/types_graphic.CanvasDirectiveType.md#ellipse) |
| `x` | `number` |
| `xAxisRotation` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:181

___

### CanvasLineToDirective

Ƭ **CanvasLineToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`LineTo`](../enums/types_graphic.CanvasDirectiveType.md#lineto) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:151

___

### CanvasMoveToDirective

Ƭ **CanvasMoveToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`MoveTo`](../enums/types_graphic.CanvasDirectiveType.md#moveto) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:146

___

### CanvasQuadraticCurveToDirective

Ƭ **CanvasQuadraticCurveToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cpx` | `number` |
| `cpy` | `number` |
| `type` | [`QuadraticCurveTo`](../enums/types_graphic.CanvasDirectiveType.md#quadraticcurveto) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:165

___

### GraphicArcToDirective

Ƭ **GraphicArcToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `anticlockwise` | `boolean` |
| `currentX` | `number` |
| `currentY` | `number` |
| `cx` | `number` |
| `cy` | `number` |
| `endAngle` | `number` |
| `largeArcFlag` | `boolean` |
| `rx` | `number` |
| `ry` | `number` |
| `startAngle` | `number` |
| `sweepFlag` | `boolean` |
| `type` | [`ArcTo`](../enums/types_graphic.GraphicDirectiveType.md#arcto) |
| `x1` | `number` |
| `x2` | `number` |
| `xAxisRotation` | `number` |
| `y1` | `number` |
| `y2` | `number` |

#### Defined in

types/graphic.ts:48

___

### GraphicBezierCurveToDirective

Ƭ **GraphicBezierCurveToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cp1x` | `number` |
| `cp1y` | `number` |
| `cp2x` | `number` |
| `cp2y` | `number` |
| `currentX` | `number` |
| `currentY` | `number` |
| `type` | [`BezierCurveTo`](../enums/types_graphic.GraphicDirectiveType.md#beziercurveto) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:28

___

### GraphicCloseDirective

Ƭ **GraphicCloseDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `currentX` | `number` |
| `currentY` | `number` |
| `type` | [`Close`](../enums/types_graphic.GraphicDirectiveType.md#close) |

#### Defined in

types/graphic.ts:69

___

### GraphicDirective

Ƭ **GraphicDirective**: [`GraphicMoveToDirective`](types_graphic.md#graphicmovetodirective) \| [`GraphicLineToDirective`](types_graphic.md#graphiclinetodirective) \| [`GraphicBezierCurveToDirective`](types_graphic.md#graphicbeziercurvetodirective) \| [`GraphicQuadraticBezierCurveToDirective`](types_graphic.md#graphicquadraticbeziercurvetodirective) \| [`GraphicArcToDirective`](types_graphic.md#graphicarctodirective) \| [`GraphicCloseDirective`](types_graphic.md#graphicclosedirective)

#### Defined in

types/graphic.ts:12

___

### GraphicImplType

Ƭ **GraphicImplType**: ``"canvas"`` \| ``"svg"``

#### Defined in

types/graphic.ts:1

___

### GraphicLineToDirective

Ƭ **GraphicLineToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `currentX` | `number` |
| `currentY` | `number` |
| `type` | [`LineTo`](../enums/types_graphic.GraphicDirectiveType.md#lineto) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:21

___

### GraphicMoveToDirective

Ƭ **GraphicMoveToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `currentX` | `number` |
| `currentY` | `number` |
| `type` | [`MoveTo`](../enums/types_graphic.GraphicDirectiveType.md#moveto) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:14

___

### GraphicQuadraticBezierCurveToDirective

Ƭ **GraphicQuadraticBezierCurveToDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cpx` | `number` |
| `cpy` | `number` |
| `currentX` | `number` |
| `currentY` | `number` |
| `type` | [`QuadraticBezierCurveTo`](../enums/types_graphic.GraphicDirectiveType.md#quadraticbeziercurveto) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:39

___

### SvgADirective

Ƭ **SvgADirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `largeArcFlag` | `boolean` |
| `rx` | `number` |
| `ry` | `number` |
| `sweepFlag` | `boolean` |
| `type` | [`A`](../enums/types_graphic.SvgDirectiveType.md#a) |
| `x` | `number` |
| `xAxisRotation` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:112

___

### SvgCDirective

Ƭ **SvgCDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cp1x` | `number` |
| `cp1y` | `number` |
| `cp2x` | `number` |
| `cp2y` | `number` |
| `type` | [`C`](../enums/types_graphic.SvgDirectiveType.md#c) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:96

___

### SvgDirective

Ƭ **SvgDirective**: [`SvgMDirective`](types_graphic.md#svgmdirective) \| [`SvgLDirective`](types_graphic.md#svgldirective) \| [`SvgCDirective`](types_graphic.md#svgcdirective) \| [`SvgQDirective`](types_graphic.md#svgqdirective) \| [`SvgADirective`](types_graphic.md#svgadirective) \| [`SvgZDirective`](types_graphic.md#svgzdirective)

#### Defined in

types/graphic.ts:84

___

### SvgLDirective

Ƭ **SvgLDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`L`](../enums/types_graphic.SvgDirectiveType.md#l) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:91

___

### SvgMDirective

Ƭ **SvgMDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`M`](../enums/types_graphic.SvgDirectiveType.md#m) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:86

___

### SvgQDirective

Ƭ **SvgQDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cpx` | `number` |
| `cpy` | `number` |
| `type` | [`Q`](../enums/types_graphic.SvgDirectiveType.md#q) |
| `x` | `number` |
| `y` | `number` |

#### Defined in

types/graphic.ts:105

___

### SvgZDirective

Ƭ **SvgZDirective**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`Z`](../enums/types_graphic.SvgDirectiveType.md#z) |

#### Defined in

types/graphic.ts:122

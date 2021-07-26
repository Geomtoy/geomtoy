[geomtoy](../README.md) / [Exports](../modules.md) / [graphic](../modules/graphic.md) / default

# Class: default

[graphic](../modules/graphic.md).default

## Table of contents

### Constructors

- [constructor](graphic.default.md#constructor)

### Properties

- [currentX](graphic.default.md#currentx)
- [currentY](graphic.default.md#currenty)
- [directives](graphic.default.md#directives)
- [startX](graphic.default.md#startx)
- [startY](graphic.default.md#starty)
- [canvasDirectiveType](graphic.default.md#canvasdirectivetype)
- [svgDirectiveType](graphic.default.md#svgdirectivetype)

### Methods

- [bezierCurveTo](graphic.default.md#beziercurveto)
- [centerArcTo](graphic.default.md#centerarcto)
- [close](graphic.default.md#close)
- [endpointArcTo](graphic.default.md#endpointarcto)
- [lineTo](graphic.default.md#lineto)
- [moveTo](graphic.default.md#moveto)
- [quadraticBezierCurveTo](graphic.default.md#quadraticbeziercurveto)
- [valueOf](graphic.default.md#valueof)

## Constructors

### constructor

• **new default**()

#### Defined in

graphic/index.ts:14

## Properties

### currentX

• **currentX**: `number`

#### Defined in

graphic/index.ts:10

___

### currentY

• **currentY**: `number`

#### Defined in

graphic/index.ts:11

___

### directives

• **directives**: [`GraphicDirective`](../modules/types_graphic.md#graphicdirective)[]

#### Defined in

graphic/index.ts:9

___

### startX

• **startX**: `number`

#### Defined in

graphic/index.ts:12

___

### startY

• **startY**: `number`

#### Defined in

graphic/index.ts:13

___

### canvasDirectiveType

▪ `Static` **canvasDirectiveType**: typeof [`CanvasDirectiveType`](../enums/types_graphic.CanvasDirectiveType.md)

#### Defined in

graphic/index.ts:169

___

### svgDirectiveType

▪ `Static` **svgDirectiveType**: typeof [`SvgDirectiveType`](../enums/types_graphic.SvgDirectiveType.md)

#### Defined in

graphic/index.ts:170

## Methods

### bezierCurveTo

▸ **bezierCurveTo**(`cp1x`, `cp1y`, `cp2x`, `cp2y`, `x`, `y`): [`default`](graphic.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `cp1x` | `number` |
| `cp1y` | `number` |
| `cp2x` | `number` |
| `cp2y` | `number` |
| `x` | `number` |
| `y` | `number` |

#### Returns

[`default`](graphic.default.md)

#### Defined in

graphic/index.ts:50

___

### centerArcTo

▸ **centerArcTo**(`cx`, `cy`, `rx`, `ry`, `startAngle`, `endAngle`, `xAxisRotation`, `anticlockwise?`): [`default`](graphic.default.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `cx` | `number` | `undefined` |
| `cy` | `number` | `undefined` |
| `rx` | `number` | `undefined` |
| `ry` | `number` | `undefined` |
| `startAngle` | `number` | `undefined` |
| `endAngle` | `number` | `undefined` |
| `xAxisRotation` | `number` | `undefined` |
| `anticlockwise` | `boolean` | `false` |

#### Returns

[`default`](graphic.default.md)

#### Defined in

graphic/index.ts:82

___

### close

▸ **close**(): [`default`](graphic.default.md)

#### Returns

[`default`](graphic.default.md)

#### Defined in

graphic/index.ts:157

___

### endpointArcTo

▸ **endpointArcTo**(`x`, `y`, `rx`, `ry`, `largeArcFlag`, `sweepFlag`, `xAxisRotation`): [`default`](graphic.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |
| `rx` | `number` |
| `ry` | `number` |
| `largeArcFlag` | `boolean` |
| `sweepFlag` | `boolean` |
| `xAxisRotation` | `number` |

#### Returns

[`default`](graphic.default.md)

#### Defined in

graphic/index.ts:118

___

### lineTo

▸ **lineTo**(`x`, `y`): [`default`](graphic.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

[`default`](graphic.default.md)

#### Defined in

graphic/index.ts:37

___

### moveTo

▸ **moveTo**(`x`, `y`): [`default`](graphic.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

[`default`](graphic.default.md)

#### Defined in

graphic/index.ts:22

___

### quadraticBezierCurveTo

▸ **quadraticBezierCurveTo**(`cpx`, `cpy`, `x`, `y`): [`default`](graphic.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `cpx` | `number` |
| `cpy` | `number` |
| `x` | `number` |
| `y` | `number` |

#### Returns

[`default`](graphic.default.md)

#### Defined in

graphic/index.ts:67

___

### valueOf

▸ **valueOf**(`type`): ([`SvgDirective`](../modules/types_graphic.md#svgdirective) \| [`CanvasDirective`](../modules/types_graphic.md#canvasdirective))[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GraphicImplType`](../modules/types_graphic.md#graphicimpltype) |

#### Returns

([`SvgDirective`](../modules/types_graphic.md#svgdirective) \| [`CanvasDirective`](../modules/types_graphic.md#canvasdirective))[]

#### Defined in

graphic/index.ts:172

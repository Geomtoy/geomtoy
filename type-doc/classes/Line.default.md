[geomtoy](../README.md) / [Exports](../modules.md) / [Line](../modules/Line.md) / default

# Class: default

[Line](../modules/Line.md).default

## Hierarchy

- [`default`](base_GeomObject.default.md)

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](Line.default.md#constructor)

### Properties

- [options](Line.default.md#options)

### Accessors

- [a](Line.default.md#a)
- [b](Line.default.md#b)
- [c](Line.default.md#c)

### Methods

- [apply](Line.default.md#apply)
- [clone](Line.default.md#clone)
- [flatten](Line.default.md#flatten)
- [getDistanceToParallelLine](Line.default.md#getdistancetoparallelline)
- [getGraphic](Line.default.md#getgraphic)
- [getInterceptX](Line.default.md#getinterceptx)
- [getInterceptY](Line.default.md#getintercepty)
- [getIntersectionPointWithLine](Line.default.md#getintersectionpointwithline)
- [getIntersectionPointWithRectangle](Line.default.md#getintersectionpointwithrectangle)
- [getIntersectionPointWithSegment](Line.default.md#getintersectionpointwithsegment)
- [getIntersectionPointsWithCircle](Line.default.md#getintersectionpointswithcircle)
- [getNormalLineAtPoint](Line.default.md#getnormallineatpoint)
- [getPerpendicularLineWithPointOn](Line.default.md#getperpendicularlinewithpointon)
- [getPerpendicularPointWithPointNotOn](Line.default.md#getperpendicularpointwithpointnoton)
- [getRandomPointOnLine](Line.default.md#getrandompointonline)
- [getSlope](Line.default.md#getslope)
- [isIntersectedWithCircle](Line.default.md#isintersectedwithcircle)
- [isIntersectedWithLine](Line.default.md#isintersectedwithline)
- [isIntersectedWithRectangle](Line.default.md#isintersectedwithrectangle)
- [isIntersectedWithSegment](Line.default.md#isintersectedwithsegment)
- [isParallelToLine](Line.default.md#isparalleltoline)
- [isSameAs](Line.default.md#issameas)
- [toArray](Line.default.md#toarray)
- [toObject](Line.default.md#toobject)
- [toString](Line.default.md#tostring)
- [fromIntercepts](Line.default.md#fromintercepts)
- [fromPointAndAngle](Line.default.md#frompointandangle)
- [fromPointAndSlope](Line.default.md#frompointandslope)
- [fromPoints](Line.default.md#frompoints)
- [fromSegment](Line.default.md#fromsegment)
- [fromSlopeAndInterceptX](Line.default.md#fromslopeandinterceptx)
- [fromSlopeAndInterceptY](Line.default.md#fromslopeandintercepty)
- [fromVector](Line.default.md#fromvector)

## Constructors

### constructor

• **new default**(`a`, `b`, `c`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number` |
| `b` | `number` |
| `c` | `number` |

#### Overrides

[default](base_GeomObject.default.md).[constructor](base_GeomObject.default.md#constructor)

#### Defined in

Line.ts:20

• **new default**(`line`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`default`](Line.default.md) |

#### Overrides

GeomObject.constructor

#### Defined in

Line.ts:21

## Properties

### options

• **options**: [`Options`](../modules/types.md#options)

#### Inherited from

[default](base_GeomObject.default.md).[options](base_GeomObject.default.md#options)

#### Defined in

base/GeomObject.ts:5

## Accessors

### a

• `get` **a**(): `number`

#### Returns

`number`

#### Defined in

Line.ts:35

• `set` **a**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Line.ts:38

___

### b

• `get` **b**(): `number`

#### Returns

`number`

#### Defined in

Line.ts:43

• `set` **b**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Line.ts:46

___

### c

• `get` **c**(): `number`

#### Returns

`number`

#### Defined in

Line.ts:51

• `set` **c**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Line.ts:54

## Methods

### apply

▸ **apply**(`transformation`): [`default`](base_GeomObject.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `transformation` | [`default`](transformation.default.md) |

#### Returns

[`default`](base_GeomObject.default.md)

#### Overrides

[default](base_GeomObject.default.md).[apply](base_GeomObject.default.md#apply)

#### Defined in

Line.ts:364

___

### clone

▸ **clone**(): [`default`](Line.default.md)

#### Returns

[`default`](Line.default.md)

#### Overrides

[default](base_GeomObject.default.md).[clone](base_GeomObject.default.md#clone)

#### Defined in

Line.ts:401

___

### flatten

▸ **flatten**(): [`default`](Line.default.md)

#### Returns

[`default`](Line.default.md)

#### Defined in

Line.ts:397

___

### getDistanceToParallelLine

▸ **getDistanceToParallelLine**(`line`): ``null`` \| `number`

若`直线this`与`直线line`平行，则返回它们之间的距离，否则返回null

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`default`](Line.default.md) |

#### Returns

``null`` \| `number`

#### Defined in

Line.ts:357

___

### getGraphic

▸ **getGraphic**(`type`): ([`SvgDirective`](../modules/types_graphic.md#svgdirective) \| [`CanvasDirective`](../modules/types_graphic.md#canvasdirective))[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GraphicImplType`](../modules/types_graphic.md#graphicimpltype) |

#### Returns

([`SvgDirective`](../modules/types_graphic.md#svgdirective) \| [`CanvasDirective`](../modules/types_graphic.md#canvasdirective))[]

#### Overrides

[default](base_GeomObject.default.md).[getGraphic](base_GeomObject.default.md#getgraphic)

#### Defined in

Line.ts:367

___

### getInterceptX

▸ **getInterceptX**(): `number`

#### Returns

`number`

#### Defined in

Line.ts:150

___

### getInterceptY

▸ **getInterceptY**(): `number`

`直线this`的截距

#### Returns

`number`

#### Defined in

Line.ts:141

___

### getIntersectionPointWithLine

▸ **getIntersectionPointWithLine**(`line`): ``null`` \| [`default`](Point.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`default`](Line.default.md) |

#### Returns

``null`` \| [`default`](Point.default.md)

#### Defined in

Line.ts:239

___

### getIntersectionPointWithRectangle

▸ **getIntersectionPointWithRectangle**(`rectangle`): ``null`` \| ``true``

#### Parameters

| Name | Type |
| :------ | :------ |
| `rectangle` | [`default`](Rectangle.default.md) |

#### Returns

``null`` \| ``true``

#### Defined in

Line.ts:290

___

### getIntersectionPointWithSegment

▸ **getIntersectionPointWithSegment**(`segment`): ``null`` \| [`default`](Point.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`default`](Segment.default.md) |

#### Returns

``null`` \| [`default`](Point.default.md)

#### Defined in

Line.ts:259

___

### getIntersectionPointsWithCircle

▸ **getIntersectionPointsWithCircle**(`circle`): ``null`` \| [`default`](Point.default.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

``null`` \| [`default`](Point.default.md)[]

#### Defined in

Line.ts:211

___

### getNormalLineAtPoint

▸ **getNormalLineAtPoint**(): `void`

#### Returns

`void`

#### Defined in

Line.ts:296

___

### getPerpendicularLineWithPointOn

▸ **getPerpendicularLineWithPointOn**(`point`): ``null`` \| [`default`](Line.default.md)

过`直线this`上一点`点point`的垂线

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

``null`` \| [`default`](Line.default.md)

#### Defined in

Line.ts:303

___

### getPerpendicularPointWithPointNotOn

▸ **getPerpendicularPointWithPointNotOn**(`point`): ``null`` \| [`default`](Point.default.md)

`直线this`外一点`点point`到`直线this`的垂点（垂足）

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

``null`` \| [`default`](Point.default.md)

#### Defined in

Line.ts:327

___

### getRandomPointOnLine

▸ **getRandomPointOnLine**(): `void`

#### Returns

`void`

#### Defined in

Line.ts:156

___

### getSlope

▸ **getSlope**(): `number`

`直线this`的斜率

#### Returns

`number`

#### Defined in

Line.ts:132

___

### isIntersectedWithCircle

▸ **isIntersectedWithCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

`boolean`

#### Defined in

Line.ts:208

___

### isIntersectedWithLine

▸ **isIntersectedWithLine**(`line`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`default`](Line.default.md) |

#### Returns

`boolean`

#### Defined in

Line.ts:236

___

### isIntersectedWithRectangle

▸ **isIntersectedWithRectangle**(`rectangle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rectangle` | [`default`](Rectangle.default.md) |

#### Returns

`boolean`

#### Defined in

Line.ts:287

___

### isIntersectedWithSegment

▸ **isIntersectedWithSegment**(`segment`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`default`](Segment.default.md) |

#### Returns

`boolean`

#### Defined in

Line.ts:256

___

### isParallelToLine

▸ **isParallelToLine**(`line`): `boolean`

`直线this`与`直线line`是否平行（包括重合）

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`default`](Line.default.md) |

#### Returns

`boolean`

#### Defined in

Line.ts:347

___

### isSameAs

▸ **isSameAs**(`line`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`default`](Line.default.md) |

#### Returns

`boolean`

#### Defined in

Line.ts:64

___

### toArray

▸ **toArray**(): `number`[]

#### Returns

`number`[]

#### Overrides

[default](base_GeomObject.default.md).[toArray](base_GeomObject.default.md#toarray)

#### Defined in

Line.ts:404

___

### toObject

▸ **toObject**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `a` | `number` |
| `b` | `number` |
| `c` | `number` |

#### Overrides

[default](base_GeomObject.default.md).[toObject](base_GeomObject.default.md#toobject)

#### Defined in

Line.ts:407

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[default](base_GeomObject.default.md).[toString](base_GeomObject.default.md#tostring)

#### Defined in

Line.ts:410

___

### fromIntercepts

▸ `Static` **fromIntercepts**(`interceptX`, `interceptY`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `interceptX` | `number` |
| `interceptY` | `number` |

#### Returns

`void`

#### Defined in

Line.ts:109

___

### fromPointAndAngle

▸ `Static` **fromPointAndAngle**(`point`, `angle`): [`default`](Line.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |
| `angle` | `number` |

#### Returns

[`default`](Line.default.md)

#### Defined in

Line.ts:97

___

### fromPointAndSlope

▸ `Static` **fromPointAndSlope**(`point`, `slope`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |
| `slope` | `number` |

#### Returns

`void`

#### Defined in

Line.ts:101

___

### fromPoints

▸ `Static` **fromPoints**(`point1`, `point2`): [`default`](Line.default.md)

Determine a line from two points `point1` and `point2`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1` | [`default`](Point.default.md) |
| `point2` | [`default`](Point.default.md) |

#### Returns

[`default`](Line.default.md)

#### Defined in

Line.ts:76

___

### fromSegment

▸ `Static` **fromSegment**(`segment`): [`default`](Line.default.md)

Get the line where the `segment` lies.

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`default`](Segment.default.md) |

#### Returns

[`default`](Line.default.md)

#### Defined in

Line.ts:93

___

### fromSlopeAndInterceptX

▸ `Static` **fromSlopeAndInterceptX**(`slope`, `interceptX`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `slope` | `number` |
| `interceptX` | `number` |

#### Returns

`void`

#### Defined in

Line.ts:119

___

### fromSlopeAndInterceptY

▸ `Static` **fromSlopeAndInterceptY**(`slope`, `interceptY`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `slope` | `number` |
| `interceptY` | `number` |

#### Returns

`void`

#### Defined in

Line.ts:123

___

### fromVector

▸ `Static` **fromVector**(`vector`): [`default`](Line.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`default`](Vector.default.md) |

#### Returns

[`default`](Line.default.md)

#### Defined in

Line.ts:105

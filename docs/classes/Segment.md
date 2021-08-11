[Geomtoy](../README.md) / [Modules](../modules.md) / Segment

# Class: Segment

## Hierarchy

- [`GeomObject`](GeomObject.md)

  ↳ **`Segment`**

## Table of contents

### Constructors

- [constructor](Segment.md#constructor)

### Accessors

- [name](Segment.md#name)
- [uuid](Segment.md#uuid)
- [point1X](Segment.md#point1x)
- [point1Y](Segment.md#point1y)
- [point1Coordinate](Segment.md#point1coordinate)
- [point1](Segment.md#point1)
- [point2X](Segment.md#point2x)
- [point2Y](Segment.md#point2y)
- [point2Coordinate](Segment.md#point2coordinate)
- [point2](Segment.md#point2)
- [angle](Segment.md#angle)
- [length](Segment.md#length)

### Methods

- [isSameAs](Segment.md#issameas)
- [isSameAs2](Segment.md#issameas2)
- [getPerpendicularlyBisectingLine](Segment.md#getperpendicularlybisectingline)
- [getIntersectionPointWithLine](Segment.md#getintersectionpointwithline)
- [isPerpendicularWithSegment](Segment.md#isperpendicularwithsegment)
- [isParallelToSegment](Segment.md#isparalleltosegment)
- [isCollinearToSegment](Segment.md#iscollineartosegment)
- [isJointedWithSegment](Segment.md#isjointedwithsegment)
- [getJointPointWithSegment](Segment.md#getjointpointwithsegment)
- [isOverlappedWithSegment](Segment.md#isoverlappedwithsegment)
- [getOverlapSegmentWithSegment](Segment.md#getoverlapsegmentwithsegment)
- [isIntersectedWithSegment](Segment.md#isintersectedwithsegment)
- [getIntersectionPointWithSegment](Segment.md#getintersectionpointwithsegment)
- [getMiddlePoint](Segment.md#getmiddlepoint)
- [getLerpingPoint](Segment.md#getlerpingpoint)
- [getLerpingRatioByLine](Segment.md#getlerpingratiobyline)
- [getDivisionPoint](Segment.md#getdivisionpoint)
- [getDivisionRatioByLine](Segment.md#getdivisionratiobyline)
- [getGraphic](Segment.md#getgraphic)
- [toArray](Segment.md#toarray)
- [toObject](Segment.md#toobject)
- [toString](Segment.md#tostring)
- [apply](Segment.md#apply)
- [clone](Segment.md#clone)
- [fromPoints](Segment.md#frompoints)

## Constructors

### constructor

• **new Segment**(`point1X`, `point1Y`, `point2X`, `point2Y`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1X` | `number` |
| `point1Y` | `number` |
| `point2X` | `number` |
| `point2Y` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[constructor](GeomObject.md#constructor)

• **new Segment**(`point1Coordinate`, `point2Coordinate`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1Coordinate` | [`number`, `number`] |
| `point2Coordinate` | [`number`, `number`] |

#### Overrides

GeomObject.constructor

• **new Segment**(`point1`, `point2`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1` | [`Point`](Point.md) |
| `point2` | [`Point`](Point.md) |

#### Overrides

GeomObject.constructor

## Accessors

### name

• `get` **name**(): `string`

#### Returns

`string`

___

### uuid

• `get` **uuid**(): `string`

#### Returns

`string`

___

### point1X

• `get` **point1X**(): `number`

#### Returns

`number`

• `set` **point1X**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### point1Y

• `get` **point1Y**(): `number`

#### Returns

`number`

• `set` **point1Y**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### point1Coordinate

• `get` **point1Coordinate**(): [`number`, `number`]

#### Returns

[`number`, `number`]

• `set` **point1Coordinate**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`number`, `number`] |

#### Returns

`void`

___

### point1

• `get` **point1**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

• `set` **point1**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`Point`](Point.md) |

#### Returns

`void`

___

### point2X

• `get` **point2X**(): `number`

#### Returns

`number`

• `set` **point2X**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### point2Y

• `get` **point2Y**(): `number`

#### Returns

`number`

• `set` **point2Y**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### point2Coordinate

• `get` **point2Coordinate**(): [`number`, `number`]

#### Returns

[`number`, `number`]

• `set` **point2Coordinate**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`number`, `number`] |

#### Returns

`void`

___

### point2

• `get` **point2**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

• `set` **point2**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`Point`](Point.md) |

#### Returns

`void`

___

### angle

• `get` **angle**(): `number`

Get the angle of segment `this`, treated as a vector from `point1` to `point2`, the result is in the interval `(-Math.PI, Math.PI]`.

#### Returns

`number`

___

### length

• `get` **length**(): `number`

Get the length of segment `this`.

#### Returns

`number`

## Methods

### isSameAs

▸ **isSameAs**(`segment`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### isSameAs2

▸ **isSameAs2**(`segment`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### getPerpendicularlyBisectingLine

▸ **getPerpendicularlyBisectingLine**(): `void`

#### Returns

`void`

___

### getIntersectionPointWithLine

▸ **getIntersectionPointWithLine**(`line`): ``null`` \| [`Point`](Point.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

``null`` \| [`Point`](Point.md)

___

### isPerpendicularWithSegment

▸ **isPerpendicularWithSegment**(`segment`): `boolean`

Whether segment `this` is perpendicular to segment `segment`, regardless of whether they intersect.

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### isParallelToSegment

▸ **isParallelToSegment**(`segment`): `boolean`

Whether segment `this` is parallel to segment `segment`, regardless of whether they are collinear or even the same.

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### isCollinearToSegment

▸ **isCollinearToSegment**(`segment`): `boolean`

`线段this`与`线段s`是否共线，无论是否相接乃至相同

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### isJointedWithSegment

▸ **isJointedWithSegment**(`segment`): `boolean`

`线段this`与`线段s`是否相接，即有且只有一个端点被共用(若两个共用则相同)，无论夹角为多少

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

接点

___

### getJointPointWithSegment

▸ **getJointPointWithSegment**(`segment`): ``null`` \| [`Point`](Point.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

``null`` \| [`Point`](Point.md)

___

### isOverlappedWithSegment

▸ **isOverlappedWithSegment**(`segment`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### getOverlapSegmentWithSegment

▸ **getOverlapSegmentWithSegment**(`segment`): ``null`` \| [`Segment`](Segment.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

``null`` \| [`Segment`](Segment.md)

___

### isIntersectedWithSegment

▸ **isIntersectedWithSegment**(`segment`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### getIntersectionPointWithSegment

▸ **getIntersectionPointWithSegment**(`segment`): ``null`` \| [`Point`](Point.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

``null`` \| [`Point`](Point.md)

___

### getMiddlePoint

▸ **getMiddlePoint**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

___

### getLerpingPoint

▸ **getLerpingPoint**(`weight`): [`Point`](Point.md)

Get the lerping(**lerp** here means **linear interpolation and extrapolation**) point of segment `this`.

**`description`**
- When the `weight` is in the interval `[0, 1]`, it is interpolation:
     - If "weight=0", return `point1`.
     - If "weight=1", return `point2`.
     - If "0<weight<1", return a point between `point1` and `point2`.
- When the `weight` is in the interval `(-Infinity, 0)` and `(1, Infinity)`, it is extrapolation:
     - If "weight<0", return a point exterior of `point1`.
     - If "weight>1", return a point exterior of `point2`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `weight` | `number` |

#### Returns

[`Point`](Point.md)

___

### getLerpingRatioByLine

▸ **getLerpingRatioByLine**(`line`): `number`

Get the lerping ratio `weight` lerped by line `line `.

**`description`**
- When `line` is parallel to `this`, return `NaN`.
- When `line` is intersected with `this`, return a number in the interval `[0, 1]`:
     - If `line` passes through `point1`, return 0.
     - If `line` passes through `point2`, return 1.
- When `line` is not parallel to and not intersected with `this`, return a number in the interval `(-Infinity, 0)` and `(1, Infinity)`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

`number`

___

### getDivisionPoint

▸ **getDivisionPoint**(`lambda`): ``null`` \| [`Point`](Point.md)

Get the division point of segment `this`.

**`description`**
- When `lambda` is equal to -1, return `null`.
- When `lambda` is in the interval `[0, Infinity]`, return a internal division point, a point between `point1` and `point2`:
     - If "lambda=0", return `point1`.
     - If "lambda=Infinity", return `point2`.
- When `lambda` is in the interval `(-Infinity, -1)` and `(-1, 0)`, return a external division point:
     - If "-1<lambda<0", return a point exterior of `point1`.
     - If "lambda<-1", return a point exterior of `point2`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `lambda` | `number` |

#### Returns

``null`` \| [`Point`](Point.md)

___

### getDivisionRatioByLine

▸ **getDivisionRatioByLine**(`line`): `number`

Get the division ratio `lambda` divided by line `line `.

**`description`**
- When `line` is parallel to `this`, return `NaN`.
- When `line` is intersected with `this`, return a number in the interval `[0, Infinity]`:
     - If `line` passes through `point1`, return 0.
     - If `line` passes through `point2`, return `Infinity`.
- When `line` is not parallel to and not intersected with `this`, return a number in the interval `(-Infinity, -1)` and `(-1, 0)`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

`number`

___

### getGraphic

▸ **getGraphic**(`type`): ([`SvgDirective`](../modules.md#svgdirective) \| [`CanvasDirective`](../modules.md#canvasdirective))[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GraphicImplType`](../modules.md#graphicimpltype) |

#### Returns

([`SvgDirective`](../modules.md#svgdirective) \| [`CanvasDirective`](../modules.md#canvasdirective))[]

___

### toArray

▸ **toArray**(): `number`[]

#### Returns

`number`[]

#### Overrides

[GeomObject](GeomObject.md).[toArray](GeomObject.md#toarray)

___

### toObject

▸ **toObject**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `p1x` | `number` |
| `p1y` | `number` |
| `p2x` | `number` |
| `p2y` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[toObject](GeomObject.md#toobject)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[GeomObject](GeomObject.md).[toString](GeomObject.md#tostring)

___

### apply

▸ **apply**(`transformation`): [`GeomObject`](GeomObject.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `transformation` | [`Transformation`](Transformation.md) |

#### Returns

[`GeomObject`](GeomObject.md)

___

### clone

▸ **clone**(): [`GeomObject`](GeomObject.md)

#### Returns

[`GeomObject`](GeomObject.md)

#### Overrides

[GeomObject](GeomObject.md).[clone](GeomObject.md#clone)

___

### fromPoints

▸ `Static` **fromPoints**(`point1`, `point2`): [`Segment`](Segment.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1` | [`Point`](Point.md) |
| `point2` | [`Point`](Point.md) |

#### Returns

[`Segment`](Segment.md)

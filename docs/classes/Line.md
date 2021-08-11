[Geomtoy](../README.md) / [Modules](../modules.md) / Line

# Class: Line

## Hierarchy

- [`GeomObject`](GeomObject.md)

  ↳ **`Line`**

## Table of contents

### Constructors

- [constructor](Line.md#constructor)

### Accessors

- [name](Line.md#name)
- [uuid](Line.md#uuid)
- [a](Line.md#a)
- [b](Line.md#b)
- [c](Line.md#c)
- [angle](Line.md#angle)
- [slope](Line.md#slope)
- [yIntercept](Line.md#yintercept)
- [xIntercept](Line.md#xintercept)

### Methods

- [isSameAs](Line.md#issameas)
- [simplify](Line.md#simplify)
- [simplifySelf](Line.md#simplifyself)
- [getPointWhereYEqualTo](Line.md#getpointwhereyequalto)
- [getPointWhereXEqualTo](Line.md#getpointwherexequalto)
- [isParallelToLine](Line.md#isparalleltoline)
- [isPerpendicularToLine](Line.md#isperpendiculartoline)
- [isIntersectedWithLine](Line.md#isintersectedwithline)
- [getIntersectionPointWithLine](Line.md#getintersectionpointwithline)
- [isIntersectedWithCircle](Line.md#isintersectedwithcircle)
- [getIntersectionPointsWithCircle](Line.md#getintersectionpointswithcircle)
- [isTangentToCircle](Line.md#istangenttocircle)
- [getTangencyPointToCircle](Line.md#gettangencypointtocircle)
- [isSeparatedFromCircle](Line.md#isseparatedfromcircle)
- [isParallelToSegment](Line.md#isparalleltosegment)
- [isPerpendicularToSegment](Line.md#isperpendiculartosegment)
- [isCollinearWithSegment](Line.md#iscollinearwithsegment)
- [isSeparatedFromSegment](Line.md#isseparatedfromsegment)
- [isIntersectedWithSegment](Line.md#isintersectedwithsegment)
- [getIntersectionPointWithSegment](Line.md#getintersectionpointwithsegment)
- [isIntersectedWithPolygon](Line.md#isintersectedwithpolygon)
- [getIntersectionPointWithPolygon](Line.md#getintersectionpointwithpolygon)
- [getPerpendicularLineFromPoint](Line.md#getperpendicularlinefrompoint)
- [getPerpendicularPointFromPoint](Line.md#getperpendicularpointfrompoint)
- [getDistanceToParallelLine](Line.md#getdistancetoparallelline)
- [getGraphic](Line.md#getgraphic)
- [apply](Line.md#apply)
- [clone](Line.md#clone)
- [toString](Line.md#tostring)
- [toArray](Line.md#toarray)
- [toObject](Line.md#toobject)
- [yAxis](Line.md#yaxis)
- [xAxis](Line.md#xaxis)
- [yEqualPositiveX](Line.md#yequalpositivex)
- [yEqualNegativeX](Line.md#yequalnegativex)
- [fromPoints](Line.md#frompoints)
- [fromSegment](Line.md#fromsegment)
- [fromVector](Line.md#fromvector)
- [fromVector2](Line.md#fromvector2)
- [fromPointAndVector](Line.md#frompointandvector)
- [fromPointAndSlope](Line.md#frompointandslope)
- [fromPointAndAngle](Line.md#frompointandangle)
- [fromIntercepts](Line.md#fromintercepts)
- [fromSlopeAndXIntercept](Line.md#fromslopeandxintercept)
- [fromSlopeAndYIntercept](Line.md#fromslopeandyintercept)

## Constructors

### constructor

• **new Line**(`a`, `b`, `c`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number` |
| `b` | `number` |
| `c` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[constructor](GeomObject.md#constructor)

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

### a

• `get` **a**(): `number`

#### Returns

`number`

• `set` **a**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### b

• `get` **b**(): `number`

#### Returns

`number`

• `set` **b**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### c

• `get` **c**(): `number`

#### Returns

`number`

• `set` **c**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### angle

• `get` **angle**(): `number`

The angle between line `this` and the positive x-axis, the result is in the interval `(-Math.PI / 2, Math.PI / 2]`.

#### Returns

`number`

___

### slope

• `get` **slope**(): `number`

The slope of line `this`, the result is in the interval `(-Infinity, Infinity]`.

**`description`**
If "b=0", line `this` is perpendicular to the x-axis, the slope is `Infinity`.

#### Returns

`number`

___

### yIntercept

• `get` **yIntercept**(): `number`

The y-intercept of line `this`, the result is in the interval `(-Infinity, Infinity]`.

**`description`**
If "b=0", line `this` is perpendicular to the x-axis, the y-intercept is `Infinity`.

#### Returns

`number`

___

### xIntercept

• `get` **xIntercept**(): `number`

The x-intercept of line `this`, the result is in the interval `(-Infinity, Infinity]`.

**`description`**
If "a=0", line `this` is perpendicular to the y-axis, the x-intercept is `Infinity`.

#### Returns

`number`

## Methods

### isSameAs

▸ **isSameAs**(`line`): `boolean`

Whether line `this` is the same as line `line`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

`boolean`

___

### simplify

▸ **simplify**(): [`Line`](Line.md)

Simplify line `this`, convert `b` to 1, if "b=0", convert `a` to 1.

#### Returns

[`Line`](Line.md)

___

### simplifySelf

▸ **simplifySelf**(): [`Line`](Line.md)

#### Returns

[`Line`](Line.md)

___

### getPointWhereYEqualTo

▸ **getPointWhereYEqualTo**(`y`): ``null`` \| [`Point`](Point.md)

Get the point on line `this` where y is equal to `y`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `y` | `number` |

#### Returns

``null`` \| [`Point`](Point.md)

___

### getPointWhereXEqualTo

▸ **getPointWhereXEqualTo**(`x`): ``null`` \| [`Point`](Point.md)

Get the point on line `this` where x is equal to `x`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |

#### Returns

``null`` \| [`Point`](Point.md)

___

### isParallelToLine

▸ **isParallelToLine**(`line`): `boolean`

Whether line `this` is parallel(including identical) to line `line`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

`boolean`

___

### isPerpendicularToLine

▸ **isPerpendicularToLine**(`line`): `boolean`

Whether line `this` is perpendicular to line `line`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

`boolean`

___

### isIntersectedWithLine

▸ **isIntersectedWithLine**(`line`): `boolean`

Whether line `this` is intersected with line `line`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

`boolean`

___

### getIntersectionPointWithLine

▸ **getIntersectionPointWithLine**(`line`): ``null`` \| [`Point`](Point.md)

Get the intersection point with line `line`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

``null`` \| [`Point`](Point.md)

___

### isIntersectedWithCircle

▸ **isIntersectedWithCircle**(`circle`): `boolean`

Whether line `this` is intersected with circle `circle`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### getIntersectionPointsWithCircle

▸ **getIntersectionPointsWithCircle**(`circle`): ``null`` \| [[`Point`](Point.md), [`Point`](Point.md)]

Get the intersection points of line `this` and circle `circle`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

``null`` \| [[`Point`](Point.md), [`Point`](Point.md)]

___

### isTangentToCircle

▸ **isTangentToCircle**(`circle`): `boolean`

Whether line `this` is tangent to circle `circle`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### getTangencyPointToCircle

▸ **getTangencyPointToCircle**(`circle`): ``null`` \| [`Point`](Point.md)

Get the tangency point of line `this` and circle `circle`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

``null`` \| [`Point`](Point.md)

___

### isSeparatedFromCircle

▸ **isSeparatedFromCircle**(`circle`): `boolean`

Whether line `this` is separated from circle `circle`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### isParallelToSegment

▸ **isParallelToSegment**(`segment`): `boolean`

Whether line `this` is parallel to segment `segment`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### isPerpendicularToSegment

▸ **isPerpendicularToSegment**(`segment`): `boolean`

Whether line `this` is perpendicular to segment `segment`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### isCollinearWithSegment

▸ **isCollinearWithSegment**(`segment`): `boolean`

Whether line `this` is collinear with segment `segment`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### isSeparatedFromSegment

▸ **isSeparatedFromSegment**(`segment`): `boolean`

Whether line `this` is separated from segment `segment`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### isIntersectedWithSegment

▸ **isIntersectedWithSegment**(`segment`): `boolean`

Whether line `this` is intersected with segment `segment`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### getIntersectionPointWithSegment

▸ **getIntersectionPointWithSegment**(`segment`): ``null`` \| [`Point`](Point.md)

Get the intersection point of line `this` and segment `segment`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

``null`` \| [`Point`](Point.md)

___

### isIntersectedWithPolygon

▸ **isIntersectedWithPolygon**(`polygon`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `polygon` | [`Polygon`](Polygon.md) |

#### Returns

`boolean`

___

### getIntersectionPointWithPolygon

▸ **getIntersectionPointWithPolygon**(`polygon`): ``null`` \| ``true``

#### Parameters

| Name | Type |
| :------ | :------ |
| `polygon` | [`Polygon`](Polygon.md) |

#### Returns

``null`` \| ``true``

___

### getPerpendicularLineFromPoint

▸ **getPerpendicularLineFromPoint**(`point`): [`Line`](Line.md)

Find the perpendicular line of line `this` from point `point`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

[`Line`](Line.md)

___

### getPerpendicularPointFromPoint

▸ **getPerpendicularPointFromPoint**(`point`): [`Point`](Point.md)

Find the perpendicular point(the foot of the perpendicular) on line `this` from point `point`.

**`description`**
If point `point` is on line `line`, return itself(cloned).
If point `point` is not on line `line`, return the perpendicular point.

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

[`Point`](Point.md)

___

### getDistanceToParallelLine

▸ **getDistanceToParallelLine**(`line`): `number`

若`直线this`与`直线line`平行，则返回它们之间的距离，否则返回null

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

`number`

___

### getGraphic

▸ **getGraphic**(`type`): ([`SvgDirective`](../modules.md#svgdirective) \| [`CanvasDirective`](../modules.md#canvasdirective))[]

Get graphic object of `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GraphicImplType`](../modules.md#graphicimpltype) |

#### Returns

([`SvgDirective`](../modules.md#svgdirective) \| [`CanvasDirective`](../modules.md#canvasdirective))[]

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

▸ **clone**(): [`Line`](Line.md)

#### Returns

[`Line`](Line.md)

#### Overrides

[GeomObject](GeomObject.md).[clone](GeomObject.md#clone)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[GeomObject](GeomObject.md).[toString](GeomObject.md#tostring)

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
| `a` | `number` |
| `b` | `number` |
| `c` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[toObject](GeomObject.md#toobject)

___

### yAxis

▸ `Static` **yAxis**(): [`Line`](Line.md)

#### Returns

[`Line`](Line.md)

___

### xAxis

▸ `Static` **xAxis**(): [`Line`](Line.md)

#### Returns

[`Line`](Line.md)

___

### yEqualPositiveX

▸ `Static` **yEqualPositiveX**(): [`Line`](Line.md)

#### Returns

[`Line`](Line.md)

___

### yEqualNegativeX

▸ `Static` **yEqualNegativeX**(): [`Line`](Line.md)

#### Returns

[`Line`](Line.md)

___

### fromPoints

▸ `Static` **fromPoints**(`point1`, `point2`): [`Line`](Line.md)

Determine a line from two points `point1` and `point2`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1` | [`Point`](Point.md) |
| `point2` | [`Point`](Point.md) |

#### Returns

[`Line`](Line.md)

___

### fromSegment

▸ `Static` **fromSegment**(`segment`): [`Line`](Line.md)

Determine a line from segment `segment`, it is the underlying line of the segment.

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

[`Line`](Line.md)

___

### fromVector

▸ `Static` **fromVector**(`vector`): [`Line`](Line.md)

Determine a line from vector `vector` with initial point set to `Point.zero()`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`Vector`](Vector.md) |

#### Returns

[`Line`](Line.md)

___

### fromVector2

▸ `Static` **fromVector2**(`vector`): [`Line`](Line.md)

Determine a line from vector `vector` base on the initial and terminal point of it.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`Vector`](Vector.md) |

#### Returns

[`Line`](Line.md)

___

### fromPointAndVector

▸ `Static` **fromPointAndVector**(`point`, `vector`): [`Line`](Line.md)

Determine a line from point `point` and vector `vector`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |
| `vector` | [`Vector`](Vector.md) |

#### Returns

[`Line`](Line.md)

___

### fromPointAndSlope

▸ `Static` **fromPointAndSlope**(`point`, `slope`): [`Line`](Line.md)

Determine a line from point `point` and slope `slope`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |
| `slope` | `number` |

#### Returns

[`Line`](Line.md)

___

### fromPointAndAngle

▸ `Static` **fromPointAndAngle**(`point`, `angle`): [`Line`](Line.md)

Determine a line from point `point` and angle `angle`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |
| `angle` | `number` |

#### Returns

[`Line`](Line.md)

___

### fromIntercepts

▸ `Static` **fromIntercepts**(`xIntercept`, `yIntercept`): [`Line`](Line.md)

Determine a line from x-intercept `xIntercept` and y-intercept `yIntercept`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `xIntercept` | `number` |
| `yIntercept` | `number` |

#### Returns

[`Line`](Line.md)

___

### fromSlopeAndXIntercept

▸ `Static` **fromSlopeAndXIntercept**(`slope`, `xIntercept`): [`Line`](Line.md)

Determine a line from slope `slope` and x-intercept `xIntercept`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `slope` | `number` |
| `xIntercept` | `number` |

#### Returns

[`Line`](Line.md)

___

### fromSlopeAndYIntercept

▸ `Static` **fromSlopeAndYIntercept**(`slope`, `yIntercept`): [`Line`](Line.md)

Determine a line from slope `slope` and y-intercept `yIntercept`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `slope` | `number` |
| `yIntercept` | `number` |

#### Returns

[`Line`](Line.md)

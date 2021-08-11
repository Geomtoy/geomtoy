[Geomtoy](../README.md) / [Modules](../modules.md) / Point

# Class: Point

## Hierarchy

- [`GeomObject`](GeomObject.md)

  ↳ **`Point`**

## Implements

- [`Visible`](../interfaces/Visible.md)

## Table of contents

### Constructors

- [constructor](Point.md#constructor)

### Accessors

- [name](Point.md#name)
- [uuid](Point.md#uuid)
- [x](Point.md#x)
- [y](Point.md#y)
- [coordinate](Point.md#coordinate)

### Other Methods

- [isZero](Point.md#iszero)
- [isSameAs](Point.md#issameas)
- [move](Point.md#move)
- [moveSelf](Point.md#moveself)
- [moveAlongAngle](Point.md#movealongangle)
- [moveAlongAngleSelf](Point.md#movealongangleself)
- [getDistanceBetweenPoint](Point.md#getdistancebetweenpoint)
- [getSquaredDistanceBetweenPoint](Point.md#getsquareddistancebetweenpoint)
- [getDistanceBetweenLine](Point.md#getdistancebetweenline)
- [getSignedDistanceBetweenLine](Point.md#getsigneddistancebetweenline)
- [getSquaredDistanceBetweenLine](Point.md#getsquareddistancebetweenline)
- [getDistanceBetweenSegment](Point.md#getdistancebetweensegment)
- [getSignedDistanceBetweenSegment](Point.md#getsigneddistancebetweensegment)
- [getSquaredDistanceBetweenSegment](Point.md#getsquareddistancebetweensegment)
- [isBetweenPoints](Point.md#isbetweenpoints)
- [isOutsidePolygon](Point.md#isoutsidepolygon)
- [isInsidePolygon](Point.md#isinsidepolygon)
- [isOnPolygon](Point.md#isonpolygon)
- [isOnLine](Point.md#isonline)
- [isEndpointOfSegment](Point.md#isendpointofsegment)
- [isOnSegmentLyingLine](Point.md#isonsegmentlyingline)
- [isOnSegment](Point.md#isonsegment)
- [isOnCircle](Point.md#isoncircle)
- [isInsideCircle](Point.md#isinsidecircle)
- [isOutsideCircle](Point.md#isoutsidecircle)
- [getGraphic](Point.md#getgraphic)
- [apply](Point.md#apply)
- [clone](Point.md#clone)
- [toString](Point.md#tostring)
- [toArray](Point.md#toarray)
- [toObject](Point.md#toobject)
- [zero](Point.md#zero)

### Static Methods

- [fromCoordinate](Point.md#fromcoordinate)
- [fromVector](Point.md#fromvector)

## Constructors

### constructor

• **new Point**(`x`, `y`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[constructor](GeomObject.md#constructor)

• **new Point**(`position`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `position` | [`number`, `number`] |

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

### x

• `get` **x**(): `number`

#### Returns

`number`

• `set` **x**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### y

• `get` **y**(): `number`

#### Returns

`number`

• `set` **y**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### coordinate

• `get` **coordinate**(): [`number`, `number`]

#### Returns

[`number`, `number`]

• `set` **coordinate**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`number`, `number`] |

#### Returns

`void`

## Other Methods

### isZero

▸ **isZero**(): `boolean`

Whether point `this` is `Point.zero()`.

#### Returns

`boolean`

___

### isSameAs

▸ **isSameAs**(`point`): `boolean`

Whether point `this` is the same as point `point`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

`boolean`

___

### move

▸ **move**(`offsetX`, `offsetY`): [`Point`](Point.md)

Move point `this` by offsets `offsetX` and `offsetY`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `offsetX` | `number` |
| `offsetY` | `number` |

#### Returns

[`Point`](Point.md)

___

### moveSelf

▸ **moveSelf**(`offsetX`, `offsetY`): [`Point`](Point.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `offsetX` | `number` |
| `offsetY` | `number` |

#### Returns

[`Point`](Point.md)

___

### moveAlongAngle

▸ **moveAlongAngle**(`angle`, `distance`): [`Point`](Point.md)

Move point `this` with distance `distance` along angle `angle`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |
| `distance` | `number` |

#### Returns

[`Point`](Point.md)

___

### moveAlongAngleSelf

▸ **moveAlongAngleSelf**(`angle`, `distance`): [`Point`](Point.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |
| `distance` | `number` |

#### Returns

[`Point`](Point.md)

___

### getDistanceBetweenPoint

▸ **getDistanceBetweenPoint**(`point`): `number`

Get the distance between point `this` and point `point`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

`number`

___

### getSquaredDistanceBetweenPoint

▸ **getSquaredDistanceBetweenPoint**(`point`): `number`

Get the distance square between point `this` and point `point`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

`number`

___

### getDistanceBetweenLine

▸ **getDistanceBetweenLine**(`line`): `number`

Get the distance between point `this` and line `line`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

`number`

___

### getSignedDistanceBetweenLine

▸ **getSignedDistanceBetweenLine**(`line`): `number`

Get the signed distance between point `this` and line `line`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

`number`

___

### getSquaredDistanceBetweenLine

▸ **getSquaredDistanceBetweenLine**(`line`): `number`

Get the distance square between point `this` and line `line`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

`number`

___

### getDistanceBetweenSegment

▸ **getDistanceBetweenSegment**(`segment`): `number`

Get the distance between point `this` and segment `segment`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`number`

___

### getSignedDistanceBetweenSegment

▸ **getSignedDistanceBetweenSegment**(`segment`): `number`

Get the signed distance between point `this` and segment `segment`.

**`summary`** 

 

点到直线的带符号距离

设点$P(x,y)$和直线$ax+by+c=0$，则点到直线的带符号距离为
$$d=\frac{ax+by+c}{\sqrt{a^2+b^2}}$$

点到直线的距离

设点$P(x,y)$和直线$ax+by+c=0$，则点到直线的距离为
$$|d|=\frac{|ax+by+c|}{\sqrt{a^2+b^2}}$$

点到直线的垂足

设点$P(x_1,y_2)$和直线$ax+by+c=0$的垂足为点$Q(x_2,y_2)$，则
$$\frac{x_2-x_1}{a}=\frac{y_2-y_1}{b}=\frac{-(ax_1+by_1+c)}{a^2+b^2}$$
故
$$\begin{aligned}&x_2=\frac{-(ax_1+by_1+c)}{a^2+b^2}a+x_1\\&y_2=\frac{-(ax_1+by_1+c)}{a^2+b^2}b+y_1 \end{aligned}$$

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`number`

___

### getSquaredDistanceBetweenSegment

▸ **getSquaredDistanceBetweenSegment**(`segment`): `number`

Get the distance square between point `this` and segment `segment`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`number`

___

### isBetweenPoints

▸ **isBetweenPoints**(`point1`, `point2`, `allowEqual?`): `boolean`

Whether point `this` is on the same line determined by points `point1` and `point2`,
and point `this` is between points `point1` and `point2`

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `point1` | [`Point`](Point.md) | `undefined` |  |
| `point2` | [`Point`](Point.md) | `undefined` |  |
| `allowEqual` | `boolean` | `true` | Allow point `this` to be equal to point `point1` or `point2` |

#### Returns

`boolean`

___

### isOutsidePolygon

▸ **isOutsidePolygon**(): `void`

#### Returns

`void`

___

### isInsidePolygon

▸ **isInsidePolygon**(): `void`

#### Returns

`void`

___

### isOnPolygon

▸ **isOnPolygon**(): `void`

#### Returns

`void`

___

### isOnLine

▸ **isOnLine**(`line`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

`boolean`

___

### isEndpointOfSegment

▸ **isEndpointOfSegment**(`segment`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### isOnSegmentLyingLine

▸ **isOnSegmentLyingLine**(`segment`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### isOnSegment

▸ **isOnSegment**(`segment`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`Segment`](Segment.md) |

#### Returns

`boolean`

___

### isOnCircle

▸ **isOnCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### isInsideCircle

▸ **isInsideCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### isOutsideCircle

▸ **isOutsideCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

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

#### Implementation of

[Visible](../interfaces/Visible.md).[getGraphic](../interfaces/Visible.md#getgraphic)

___

### apply

▸ **apply**(`transformation`): [`Point`](Point.md)

apply the transformation

#### Parameters

| Name | Type |
| :------ | :------ |
| `transformation` | [`Transformation`](Transformation.md) |

#### Returns

[`Point`](Point.md)

#### Implementation of

[Visible](../interfaces/Visible.md).[apply](../interfaces/Visible.md#apply)

___

### clone

▸ **clone**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

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
| `x` | `number` |
| `y` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[toObject](GeomObject.md#toobject)

___

### zero

▸ `Static` **zero**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

___

## Static Methods

### fromCoordinate

▸ `Static` **fromCoordinate**(`coordinate`): [`Point`](Point.md)

Determine a point from a coordinate.

#### Parameters

| Name | Type |
| :------ | :------ |
| `coordinate` | [`number`, `number`] |

#### Returns

[`Point`](Point.md)

___

### fromVector

▸ `Static` **fromVector**(`vector`): [`Point`](Point.md)

Determine a point from vector `vector`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`Vector`](Vector.md) |

#### Returns

[`Point`](Point.md)

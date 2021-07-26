[geomtoy](../README.md) / [Exports](../modules.md) / [Point](../modules/Point.md) / default

# Class: default

[Point](../modules/Point.md).default

## Hierarchy

- [`default`](base_GeomObject.default.md)

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](Point.default.md#constructor)

### Properties

- [options](Point.default.md#options)

### Accessors

- [x](Point.default.md#x)
- [y](Point.default.md#y)
- [zero](Point.default.md#zero)

### Methods

- [apply](Point.default.md#apply)
- [clone](Point.default.md#clone)
- [getCoordinate](Point.default.md#getcoordinate)
- [getDistanceBetweenLine](Point.default.md#getdistancebetweenline)
- [getDistanceBetweenPoint](Point.default.md#getdistancebetweenpoint)
- [getDistanceSquareFromPoint](Point.default.md#getdistancesquarefrompoint)
- [getGraphic](Point.default.md#getgraphic)
- [getRelationshipToCircle](Point.default.md#getrelationshiptocircle)
- [getRelationshipToLine](Point.default.md#getrelationshiptoline)
- [getRelationshipToSegment](Point.default.md#getrelationshiptosegment)
- [getSignedDistanceBetweenLine](Point.default.md#getsigneddistancebetweenline)
- [isBetweenPoints](Point.default.md#isbetweenpoints)
- [isEndpointOfSegment](Point.default.md#isendpointofsegment)
- [isSameAs](Point.default.md#issameas)
- [isZero](Point.default.md#iszero)
- [move](Point.default.md#move)
- [moveSelf](Point.default.md#moveself)
- [toArray](Point.default.md#toarray)
- [toObject](Point.default.md#toobject)
- [toString](Point.default.md#tostring)
- [walk](Point.default.md#walk)
- [walkSelf](Point.default.md#walkself)
- [fromCoordinate](Point.default.md#fromcoordinate)
- [fromVector](Point.default.md#fromvector)

## Constructors

### constructor

• **new default**(`x`, `y`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Overrides

[default](base_GeomObject.default.md).[constructor](base_GeomObject.default.md#constructor)

#### Defined in

Point.ts:18

• **new default**(`position`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `position` | [`default`](Point.default.md) \| [`Coordinate`](../modules/types.md#coordinate) \| [`default`](Vector.default.md) |

#### Overrides

GeomObject.constructor

#### Defined in

Point.ts:19

• **new default**()

#### Overrides

GeomObject.constructor

#### Defined in

Point.ts:20

## Properties

### options

• **options**: [`Options`](../modules/types.md#options)

#### Inherited from

[default](base_GeomObject.default.md).[options](base_GeomObject.default.md#options)

#### Defined in

base/GeomObject.ts:5

## Accessors

### x

• `get` **x**(): `number`

#### Returns

`number`

#### Defined in

Point.ts:40

• `set` **x**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Point.ts:43

___

### y

• `get` **y**(): `number`

#### Returns

`number`

#### Defined in

Point.ts:47

• `set` **y**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Point.ts:50

___

### zero

• `Static` `get` **zero**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

Point.ts:54

## Methods

### apply

▸ **apply**(`t`): [`default`](Point.default.md)

apply the transformation

#### Parameters

| Name | Type |
| :------ | :------ |
| `t` | [`default`](transformation.default.md) |

#### Returns

[`default`](Point.default.md)

#### Overrides

[default](base_GeomObject.default.md).[apply](base_GeomObject.default.md#apply)

#### Defined in

Point.ts:282

___

### clone

▸ **clone**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Overrides

[default](base_GeomObject.default.md).[clone](base_GeomObject.default.md#clone)

#### Defined in

Point.ts:285

___

### getCoordinate

▸ **getCoordinate**(): [`Coordinate`](../modules/types.md#coordinate)

Get coordinate from point `this`

#### Returns

[`Coordinate`](../modules/types.md#coordinate)

#### Defined in

Point.ts:98

___

### getDistanceBetweenLine

▸ **getDistanceBetweenLine**(`line`): `number`

Get the distance between point `this` and line `line`

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`default`](Line.default.md) |

#### Returns

`number`

#### Defined in

Point.ts:154

___

### getDistanceBetweenPoint

▸ **getDistanceBetweenPoint**(`point`): `number`

Get the distance between point `this` and point `point`

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

`number`

#### Defined in

Point.ts:134

___

### getDistanceSquareFromPoint

▸ **getDistanceSquareFromPoint**(`point`): `number`

Get the distance square between point `this` and point `point`

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

`number`

#### Defined in

Point.ts:144

___

### getGraphic

▸ **getGraphic**(`type`): ([`SvgDirective`](../modules/types_graphic.md#svgdirective) \| [`CanvasDirective`](../modules/types_graphic.md#canvasdirective))[]

Get graphic object of `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GraphicImplType`](../modules/types_graphic.md#graphicimpltype) |

#### Returns

([`SvgDirective`](../modules/types_graphic.md#svgdirective) \| [`CanvasDirective`](../modules/types_graphic.md#canvasdirective))[]

#### Overrides

[default](base_GeomObject.default.md).[getGraphic](base_GeomObject.default.md#getgraphic)

#### Defined in

Point.ts:268

___

### getRelationshipToCircle

▸ **getRelationshipToCircle**(`circle`): [`RsPointToCircle`](../enums/types.RsPointToCircle.md)

Get the relationship of point `this` to circle `circle`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

[`RsPointToCircle`](../enums/types.RsPointToCircle.md)

#### Defined in

Point.ts:246

___

### getRelationshipToLine

▸ **getRelationshipToLine**(`line`): [`RsPointToLine`](../enums/types.RsPointToLine.md)

Get the relationship of point `this` to line `line`

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`default`](Line.default.md) |

#### Returns

[`RsPointToLine`](../enums/types.RsPointToLine.md)

#### Defined in

Point.ts:203

___

### getRelationshipToSegment

▸ **getRelationshipToSegment**(`segment`): [`RsPointToSegment`](../enums/types.RsPointToSegment.md)

Get the relationship of point `this` to segment `segment`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`default`](Segment.default.md) |

#### Returns

[`RsPointToSegment`](../enums/types.RsPointToSegment.md)

#### Defined in

Point.ts:227

___

### getSignedDistanceBetweenLine

▸ **getSignedDistanceBetweenLine**(`line`): `number`

Get the signed distance between point `this` and line `line`

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`default`](Line.default.md) |

#### Returns

`number`

#### Defined in

Point.ts:162

___

### isBetweenPoints

▸ **isBetweenPoints**(`point1`, `point2`, `allowedOn?`): `boolean`

Whether point `this` is inside an imaginary rectangle with diagonals of point `point1` and point `point2`,
the coordinate of point `this` will not be greater than the maximum value of point `point1` and point `point2`,
nor less than the minimum value

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `point1` | [`default`](Point.default.md) | `undefined` |  |
| `point2` | [`default`](Point.default.md) | `undefined` |  |
| `allowedOn` | `boolean` | `true` | Can it be on the rectangle, in other words, can it be equal to the maximum or minimum value |

#### Returns

`boolean`

#### Defined in

Point.ts:176

___

### isEndpointOfSegment

▸ **isEndpointOfSegment**(`segment`): `boolean`

Whether point `this` is an endpoint of segment `segment`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | [`default`](Segment.default.md) |

#### Returns

`boolean`

#### Defined in

Point.ts:219

___

### isSameAs

▸ **isSameAs**(`point`): `boolean`

Whether point `this` is the same as point `point`

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

`boolean`

#### Defined in

Point.ts:87

___

### isZero

▸ **isZero**(): `boolean`

Whether point `this` is `Point.zero`

#### Returns

`boolean`

#### Defined in

Point.ts:79

___

### move

▸ **move**(`offsetX`, `offsetY`): [`default`](Point.default.md)

Move point `this` by the offset

#### Parameters

| Name | Type |
| :------ | :------ |
| `offsetX` | `number` |
| `offsetY` | `number` |

#### Returns

[`default`](Point.default.md)

#### Defined in

Point.ts:121

___

### moveSelf

▸ **moveSelf**(`offsetX`, `offsetY`): [`default`](Point.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `offsetX` | `number` |
| `offsetY` | `number` |

#### Returns

[`default`](Point.default.md)

#### Defined in

Point.ts:124

___

### toArray

▸ **toArray**(): `number`[]

#### Returns

`number`[]

#### Overrides

[default](base_GeomObject.default.md).[toArray](base_GeomObject.default.md#toarray)

#### Defined in

Point.ts:288

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

[default](base_GeomObject.default.md).[toObject](base_GeomObject.default.md#toobject)

#### Defined in

Point.ts:291

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[default](base_GeomObject.default.md).[toString](base_GeomObject.default.md#tostring)

#### Defined in

Point.ts:294

___

### walk

▸ **walk**(`angle`, `distance`): [`default`](Point.default.md)

Walk point `this` with a `distance` towards the direction of the `angle`

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |
| `distance` | `number` |

#### Returns

[`default`](Point.default.md)

#### Defined in

Point.ts:107

___

### walkSelf

▸ **walkSelf**(`angle`, `distance`): [`default`](Point.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |
| `distance` | `number` |

#### Returns

[`default`](Point.default.md)

#### Defined in

Point.ts:110

___

### fromCoordinate

▸ `Static` **fromCoordinate**(`coordinate`): [`default`](Point.default.md)

Return a point from a coordinate

#### Parameters

| Name | Type |
| :------ | :------ |
| `coordinate` | [`Coordinate`](../modules/types.md#coordinate) |

#### Returns

[`default`](Point.default.md)

#### Defined in

Point.ts:63

___

### fromVector

▸ `Static` **fromVector**(`vector`): [`default`](Point.default.md)

Return a point from a vector

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`default`](Vector.default.md) |

#### Returns

[`default`](Point.default.md)

#### Defined in

Point.ts:71

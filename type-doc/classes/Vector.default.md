[geomtoy](../README.md) / [Exports](../modules.md) / [Vector](../modules/Vector.md) / default

# Class: default

[Vector](../modules/Vector.md).default

## Hierarchy

- [`default`](base_GeomObject.default.md)

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](Vector.default.md#constructor)

### Properties

- [options](Vector.default.md#options)

### Accessors

- [angle](Vector.default.md#angle)
- [magnitude](Vector.default.md#magnitude)
- [point1](Vector.default.md#point1)
- [point2](Vector.default.md#point2)
- [x](Vector.default.md#x)
- [y](Vector.default.md#y)
- [zero](Vector.default.md#zero)

### Methods

- [add](Vector.default.md#add)
- [angleTo](Vector.default.md#angleto)
- [apply](Vector.default.md#apply)
- [clone](Vector.default.md#clone)
- [crossProduct](Vector.default.md#crossproduct)
- [dotProduct](Vector.default.md#dotproduct)
- [getCoordinate](Vector.default.md#getcoordinate)
- [getGraphic](Vector.default.md#getgraphic)
- [isSameAngleAs](Vector.default.md#issameangleas)
- [isSameAs](Vector.default.md#issameas)
- [isSameMagnitudeAs](Vector.default.md#issamemagnitudeas)
- [isZero](Vector.default.md#iszero)
- [normalize](Vector.default.md#normalize)
- [reverse](Vector.default.md#reverse)
- [rotate](Vector.default.md#rotate)
- [scalarMultiply](Vector.default.md#scalarmultiply)
- [subtract](Vector.default.md#subtract)
- [toArray](Vector.default.md#toarray)
- [toObject](Vector.default.md#toobject)
- [toString](Vector.default.md#tostring)
- [fromAngleAndMagnitude](Vector.default.md#fromangleandmagnitude)
- [fromPoint](Vector.default.md#frompoint)
- [fromPoints](Vector.default.md#frompoints)
- [fromSegment](Vector.default.md#fromsegment)

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

Vector.ts:17

• **new default**(`point1X`, `point1Y`, `point2X`, `point2Y`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1X` | `number` |
| `point1Y` | `number` |
| `point2X` | `number` |
| `point2Y` | `number` |

#### Overrides

GeomObject.constructor

#### Defined in

Vector.ts:18

• **new default**(`position`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `position` | [`default`](Point.default.md) \| [`Coordinate`](../modules/types.md#coordinate) \| [`default`](Vector.default.md) |

#### Overrides

GeomObject.constructor

#### Defined in

Vector.ts:19

• **new default**(`point1Position`, `point2Position`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1Position` | [`default`](Point.default.md) \| [`Coordinate`](../modules/types.md#coordinate) \| [`default`](Vector.default.md) |
| `point2Position` | [`default`](Point.default.md) \| [`Coordinate`](../modules/types.md#coordinate) \| [`default`](Vector.default.md) |

#### Overrides

GeomObject.constructor

#### Defined in

Vector.ts:20

• **new default**()

#### Overrides

GeomObject.constructor

#### Defined in

Vector.ts:21

## Properties

### options

• **options**: [`Options`](../modules/types.md#options)

#### Inherited from

[default](base_GeomObject.default.md).[options](base_GeomObject.default.md#options)

#### Defined in

base/GeomObject.ts:5

## Accessors

### angle

• `get` **angle**(): `number`

The angle of vector `this`

**`see`** [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2)

#### Returns

`number`

#### Defined in

Vector.ts:95

___

### magnitude

• `get` **magnitude**(): `number`

The magnitude of vector `this`

#### Returns

`number`

#### Defined in

Vector.ts:104

___

### point1

• `get` **point1**(): [`default`](Point.default.md)

Initial point of vector `this`, usually `Point.zero`

#### Returns

[`default`](Point.default.md)

#### Defined in

Vector.ts:75

• `set` **point1**(`value`): `void`

Initial point of vector `this`, usually `Point.zero`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`default`](Point.default.md) |

#### Returns

`void`

#### Defined in

Vector.ts:78

___

### point2

• `get` **point2**(): [`default`](Point.default.md)

Terminal point of vector `this`

#### Returns

[`default`](Point.default.md)

#### Defined in

Vector.ts:84

___

### x

• `get` **x**(): `number`

#### Returns

`number`

#### Defined in

Vector.ts:58

• `set` **x**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Vector.ts:61

___

### y

• `get` **y**(): `number`

#### Returns

`number`

#### Defined in

Vector.ts:65

• `set` **y**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Vector.ts:68

___

### zero

• `Static` `get` **zero**(): [`default`](Vector.default.md)

#### Returns

[`default`](Vector.default.md)

#### Defined in

Vector.ts:109

## Methods

### add

▸ **add**(`v`): [`default`](Vector.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`default`](Vector.default.md) |

#### Returns

[`default`](Vector.default.md)

#### Defined in

Vector.ts:221

___

### angleTo

▸ **angleTo**(`vector`): `number`

`向量this`到`向量v`的角差，记作theta，(-Math.PI, Math.PI]
angle本身已经处理了顺时针/逆时针正角的问题

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`default`](Vector.default.md) |

#### Returns

`number`

#### Defined in

Vector.ts:168

___

### apply

▸ **apply**(`transformation`): [`default`](Vector.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `transformation` | [`default`](transformation.default.md) |

#### Returns

[`default`](Vector.default.md)

#### Overrides

[default](base_GeomObject.default.md).[apply](base_GeomObject.default.md#apply)

#### Defined in

Vector.ts:255

___

### clone

▸ **clone**(): [`default`](Vector.default.md)

#### Returns

[`default`](Vector.default.md)

#### Overrides

[default](base_GeomObject.default.md).[clone](base_GeomObject.default.md#clone)

#### Defined in

Vector.ts:246

___

### crossProduct

▸ **crossProduct**(`v`): `number`

`向量this`与`向量v`的叉乘（不考虑叉乘之后得到的向量方向）

**`summary`** V1(x1, y1) × V2(x2, y2) = x1 * y2 – y1 * x2

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`default`](Vector.default.md) |

#### Returns

`number`

#### Defined in

Vector.ts:212

___

### dotProduct

▸ **dotProduct**(`v`): `number`

`向量this`与`向量v`的点乘

**`summary`** V1(x1, y1) · V2(x2, y2) = x1 * x2 + y1 * y2

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`default`](Vector.default.md) |

#### Returns

`number`

#### Defined in

Vector.ts:203

___

### getCoordinate

▸ **getCoordinate**(): [`Coordinate`](../modules/types.md#coordinate)

#### Returns

[`Coordinate`](../modules/types.md#coordinate)

#### Defined in

Vector.ts:250

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

Vector.ts:263

___

### isSameAngleAs

▸ **isSameAngleAs**(`vector`): `boolean`

Whether the angle of vector `this` is the same as vector `vector`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`default`](Vector.default.md) |

#### Returns

`boolean`

#### Defined in

Vector.ts:151

___

### isSameAs

▸ **isSameAs**(`vector`): `boolean`

Whether vector `this` is the same as vector `vector`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`default`](Vector.default.md) |

#### Returns

`boolean`

#### Defined in

Vector.ts:142

___

### isSameMagnitudeAs

▸ **isSameMagnitudeAs**(`vector`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`default`](Vector.default.md) |

#### Returns

`boolean`

#### Defined in

Vector.ts:156

___

### isZero

▸ **isZero**(): `boolean`

Whether vector `this` is `Vector.zero`

#### Returns

`boolean`

#### Defined in

Vector.ts:132

___

### normalize

▸ **normalize**(): [`default`](Vector.default.md)

#### Returns

[`default`](Vector.default.md)

#### Defined in

Vector.ts:216

___

### reverse

▸ **reverse**(): [`default`](Vector.default.md)

#### Returns

[`default`](Vector.default.md)

#### Defined in

Vector.ts:238

___

### rotate

▸ **rotate**(`angle`): [`default`](Vector.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |

#### Returns

[`default`](Vector.default.md)

#### Defined in

Vector.ts:241

___

### scalarMultiply

▸ **scalarMultiply**(`scalar`): [`default`](Vector.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `scalar` | `number` |

#### Returns

[`default`](Vector.default.md)

#### Defined in

Vector.ts:233

___

### subtract

▸ **subtract**(`v`): [`default`](Vector.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`default`](Vector.default.md) |

#### Returns

[`default`](Vector.default.md)

#### Defined in

Vector.ts:227

___

### toArray

▸ **toArray**(): `never`[]

#### Returns

`never`[]

#### Overrides

[default](base_GeomObject.default.md).[toArray](base_GeomObject.default.md#toarray)

#### Defined in

Vector.ts:276

___

### toObject

▸ **toObject**(): `Object`

#### Returns

`Object`

#### Overrides

[default](base_GeomObject.default.md).[toObject](base_GeomObject.default.md#toobject)

#### Defined in

Vector.ts:279

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[default](base_GeomObject.default.md).[toString](base_GeomObject.default.md#tostring)

#### Defined in

Vector.ts:282

___

### fromAngleAndMagnitude

▸ `Static` **fromAngleAndMagnitude**(`angle`, `magnitude`): [`default`](Vector.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |
| `magnitude` | `number` |

#### Returns

[`default`](Vector.default.md)

#### Defined in

Vector.ts:119

___

### fromPoint

▸ `Static` **fromPoint**(`point`): [`default`](Vector.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

[`default`](Vector.default.md)

#### Defined in

Vector.ts:113

___

### fromPoints

▸ `Static` **fromPoints**(`point1`, `point2`): [`default`](Vector.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1` | [`default`](Point.default.md) |
| `point2` | [`default`](Point.default.md) |

#### Returns

[`default`](Vector.default.md)

#### Defined in

Vector.ts:116

___

### fromSegment

▸ `Static` **fromSegment**(`segment`, `reverse?`): [`default`](Vector.default.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `segment` | [`default`](Segment.default.md) | `undefined` |
| `reverse` | `boolean` | `false` |

#### Returns

[`default`](Vector.default.md)

#### Defined in

Vector.ts:124

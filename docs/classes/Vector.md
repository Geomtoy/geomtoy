[Geomtoy](../README.md) / [Modules](../modules.md) / Vector

# Class: Vector

## Hierarchy

- [`GeomObject`](GeomObject.md)

  ↳ **`Vector`**

## Table of contents

### Constructors

- [constructor](Vector.md#constructor)

### Accessors

- [x](Vector.md#x)
- [y](Vector.md#y)
- [coordinate](Vector.md#coordinate)
- [point](Vector.md#point)
- [point1X](Vector.md#point1x)
- [point1Y](Vector.md#point1y)
- [point1Coordinate](Vector.md#point1coordinate)
- [point1](Vector.md#point1)
- [point2X](Vector.md#point2x)
- [point2Y](Vector.md#point2y)
- [point2Coordinate](Vector.md#point2coordinate)
- [point2](Vector.md#point2)
- [angle](Vector.md#angle)
- [magnitude](Vector.md#magnitude)

### Methods

- [isZero](Vector.md#iszero)
- [isSameAs](Vector.md#issameas)
- [isSameAs2](Vector.md#issameas2)
- [isSameAngleAs](Vector.md#issameangleas)
- [isSameMagnitudeAs](Vector.md#issamemagnitudeas)
- [angleTo](Vector.md#angleto)
- [simplify](Vector.md#simplify)
- [simplifySelf](Vector.md#simplifyself)
- [dotProduct](Vector.md#dotproduct)
- [crossProduct](Vector.md#crossproduct)
- [normalize](Vector.md#normalize)
- [add](Vector.md#add)
- [subtract](Vector.md#subtract)
- [scalarMultiply](Vector.md#scalarmultiply)
- [negative](Vector.md#negative)
- [rotate](Vector.md#rotate)
- [clone](Vector.md#clone)
- [apply](Vector.md#apply)
- [getGraphic](Vector.md#getgraphic)
- [toArray](Vector.md#toarray)
- [toObject](Vector.md#toobject)
- [toString](Vector.md#tostring)
- [zero](Vector.md#zero)
- [fromPoint](Vector.md#frompoint)
- [fromPoints](Vector.md#frompoints)
- [fromAngleAndMagnitude](Vector.md#fromangleandmagnitude)
- [fromSegment](Vector.md#fromsegment)

## Constructors

### constructor

• **new Vector**(`x`, `y`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[constructor](GeomObject.md#constructor)

• **new Vector**(`point1X`, `point1Y`, `point2X`, `point2Y`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1X` | `number` |
| `point1Y` | `number` |
| `point2X` | `number` |
| `point2Y` | `number` |

#### Overrides

GeomObject.constructor

• **new Vector**(`coordinate`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `coordinate` | [`number`, `number`] |

#### Overrides

GeomObject.constructor

• **new Vector**(`point1Coordinate`, `point2Coordinate`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1Coordinate` | [`number`, `number`] |
| `point2Coordinate` | [`number`, `number`] |

#### Overrides

GeomObject.constructor

• **new Vector**(`point`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Overrides

GeomObject.constructor

• **new Vector**(`point1`, `point2`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1` | [`Point`](Point.md) |
| `point2` | [`Point`](Point.md) |

#### Overrides

GeomObject.constructor

## Accessors

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

___

### point

• `get` **point**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

• `set` **point**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`Point`](Point.md) |

#### Returns

`void`

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

Get the angle of vector `this`, the result is in the interval `(-Math.PI, Math.PI]`.

#### Returns

`number`

___

### magnitude

• `get` **magnitude**(): `number`

Get the magnitude of vector `this`.

#### Returns

`number`

## Methods

### isZero

▸ **isZero**(): `boolean`

Whether vector `this` is `Vector.zero()`

#### Returns

`boolean`

___

### isSameAs

▸ **isSameAs**(`vector`): `boolean`

Whether vector `this` is the same as vector `vector`, if they are all initialized from `Point.zero`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`Vector`](Vector.md) |

#### Returns

`boolean`

___

### isSameAs2

▸ **isSameAs2**(`vector`): `boolean`

Whether vector `this` is the same as vector `vector`, including the initial point

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`Vector`](Vector.md) |

#### Returns

`boolean`

___

### isSameAngleAs

▸ **isSameAngleAs**(`vector`): `boolean`

Whether the angle of vector `this` is the same as vector `vector`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`Vector`](Vector.md) |

#### Returns

`boolean`

___

### isSameMagnitudeAs

▸ **isSameMagnitudeAs**(`vector`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`Vector`](Vector.md) |

#### Returns

`boolean`

___

### angleTo

▸ **angleTo**(`vector`): `number`

Angle from vector `this` to vector `vector`, in the interval `(-Math.PI, Math.PI]`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`Vector`](Vector.md) |

#### Returns

`number`

___

### simplify

▸ **simplify**(): `void`

#### Returns

`void`

___

### simplifySelf

▸ **simplifySelf**(): `void`

#### Returns

`void`

___

### dotProduct

▸ **dotProduct**(`vector`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`Vector`](Vector.md) |

#### Returns

`number`

___

### crossProduct

▸ **crossProduct**(`vector`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`Vector`](Vector.md) |

#### Returns

`number`

___

### normalize

▸ **normalize**(): [`Vector`](Vector.md)

#### Returns

[`Vector`](Vector.md)

___

### add

▸ **add**(`vector`): [`Vector`](Vector.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`Vector`](Vector.md) |

#### Returns

[`Vector`](Vector.md)

___

### subtract

▸ **subtract**(`vector`): [`Vector`](Vector.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`Vector`](Vector.md) |

#### Returns

[`Vector`](Vector.md)

___

### scalarMultiply

▸ **scalarMultiply**(`scalar`): [`Vector`](Vector.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `scalar` | `number` |

#### Returns

[`Vector`](Vector.md)

___

### negative

▸ **negative**(): [`Vector`](Vector.md)

#### Returns

[`Vector`](Vector.md)

___

### rotate

▸ **rotate**(`angle`): [`Vector`](Vector.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |

#### Returns

[`Vector`](Vector.md)

___

### clone

▸ **clone**(): [`Vector`](Vector.md)

#### Returns

[`Vector`](Vector.md)

#### Overrides

[GeomObject](GeomObject.md).[clone](GeomObject.md#clone)

___

### apply

▸ **apply**(`transformation`): [`Vector`](Vector.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `transformation` | [`Transformation`](Transformation.md) |

#### Returns

[`Vector`](Vector.md)

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

### toArray

▸ **toArray**(): `never`[]

#### Returns

`never`[]

#### Overrides

[GeomObject](GeomObject.md).[toArray](GeomObject.md#toarray)

___

### toObject

▸ **toObject**(): `Object`

#### Returns

`Object`

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

### zero

▸ `Static` **zero**(): [`Vector`](Vector.md)

#### Returns

[`Vector`](Vector.md)

___

### fromPoint

▸ `Static` **fromPoint**(`point`): [`Vector`](Vector.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

[`Vector`](Vector.md)

___

### fromPoints

▸ `Static` **fromPoints**(`point1`, `point2`): [`Vector`](Vector.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1` | [`Point`](Point.md) |
| `point2` | [`Point`](Point.md) |

#### Returns

[`Vector`](Vector.md)

___

### fromAngleAndMagnitude

▸ `Static` **fromAngleAndMagnitude**(`angle`, `magnitude`): [`Vector`](Vector.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |
| `magnitude` | `number` |

#### Returns

[`Vector`](Vector.md)

___

### fromSegment

▸ `Static` **fromSegment**(`segment`, `reverse?`): [`Vector`](Vector.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `segment` | [`Segment`](Segment.md) | `undefined` |
| `reverse` | `boolean` | `false` |

#### Returns

[`Vector`](Vector.md)

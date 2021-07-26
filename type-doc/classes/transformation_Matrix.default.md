[geomtoy](../README.md) / [Exports](../modules.md) / [transformation/Matrix](../modules/transformation_Matrix.md) / default

# Class: default

[transformation/Matrix](../modules/transformation_Matrix.md).default

## Hierarchy

- **`default`**

  ↳ [`default`](transformation_LineReflection.default.md)

  ↳ [`default`](transformation_PointReflection.default.md)

  ↳ [`default`](transformation_Rotation.default.md)

  ↳ [`default`](transformation_Scaling.default.md)

  ↳ [`default`](transformation_Skewing.default.md)

  ↳ [`default`](transformation_Translation.default.md)

## Table of contents

### Constructors

- [constructor](transformation_Matrix.default.md#constructor)

### Accessors

- [a](transformation_Matrix.default.md#a)
- [b](transformation_Matrix.default.md#b)
- [c](transformation_Matrix.default.md#c)
- [d](transformation_Matrix.default.md#d)
- [e](transformation_Matrix.default.md#e)
- [f](transformation_Matrix.default.md#f)
- [identity](transformation_Matrix.default.md#identity)

### Methods

- [clone](transformation_Matrix.default.md#clone)
- [decompose](transformation_Matrix.default.md#decompose)
- [determinant](transformation_Matrix.default.md#determinant)
- [inverse](transformation_Matrix.default.md#inverse)
- [inverseSelf](transformation_Matrix.default.md#inverseself)
- [isIdentity](transformation_Matrix.default.md#isidentity)
- [isSameAs](transformation_Matrix.default.md#issameas)
- [pointAfterTransformed](transformation_Matrix.default.md#pointaftertransformed)
- [pointBeforeTransformed](transformation_Matrix.default.md#pointbeforetransformed)
- [postMultiply](transformation_Matrix.default.md#postmultiply)
- [postMultiplySelf](transformation_Matrix.default.md#postmultiplyself)
- [preMultiply](transformation_Matrix.default.md#premultiply)
- [preMultiplySelf](transformation_Matrix.default.md#premultiplyself)
- [toString](transformation_Matrix.default.md#tostring)
- [transformCoordinate](transformation_Matrix.default.md#transformcoordinate)
- [transformPoint](transformation_Matrix.default.md#transformpoint)
- [transformVector](transformation_Matrix.default.md#transformvector)
- [multiply](transformation_Matrix.default.md#multiply)

## Constructors

### constructor

• **new default**(`a`, `b`, `c`, `d`, `e`, `f`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number` |
| `b` | `number` |
| `c` | `number` |
| `d` | `number` |
| `e` | `number` |
| `f` | `number` |

#### Defined in

transformation/Matrix.ts:28

• **new default**(`m`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `m` | [`default`](transformation_Matrix.default.md) |

#### Defined in

transformation/Matrix.ts:29

• **new default**(`m`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `m` | [`default`](transformation_Translation.default.md) |

#### Defined in

transformation/Matrix.ts:30

• **new default**(`m`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `m` | [`default`](transformation_Rotation.default.md) |

#### Defined in

transformation/Matrix.ts:31

• **new default**(`m`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `m` | [`default`](transformation_Scaling.default.md) |

#### Defined in

transformation/Matrix.ts:32

• **new default**(`m`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `m` | [`default`](transformation_Skewing.default.md) |

#### Defined in

transformation/Matrix.ts:33

• **new default**(`m`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `m` | [`default`](transformation_LineReflection.default.md) |

#### Defined in

transformation/Matrix.ts:34

• **new default**(`m`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `m` | [`default`](transformation_PointReflection.default.md) |

#### Defined in

transformation/Matrix.ts:35

• **new default**()

#### Defined in

transformation/Matrix.ts:36

## Accessors

### a

• `get` **a**(): `number`

#### Returns

`number`

#### Defined in

transformation/Matrix.ts:49

• `set` **a**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

transformation/Matrix.ts:52

___

### b

• `get` **b**(): `number`

#### Returns

`number`

#### Defined in

transformation/Matrix.ts:56

• `set` **b**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

transformation/Matrix.ts:59

___

### c

• `get` **c**(): `number`

#### Returns

`number`

#### Defined in

transformation/Matrix.ts:63

• `set` **c**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

transformation/Matrix.ts:66

___

### d

• `get` **d**(): `number`

#### Returns

`number`

#### Defined in

transformation/Matrix.ts:70

• `set` **d**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

transformation/Matrix.ts:73

___

### e

• `get` **e**(): `number`

#### Returns

`number`

#### Defined in

transformation/Matrix.ts:77

• `set` **e**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

transformation/Matrix.ts:80

___

### f

• `get` **f**(): `number`

#### Returns

`number`

#### Defined in

transformation/Matrix.ts:84

• `set` **f**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

transformation/Matrix.ts:87

___

### identity

• `Static` `get` **identity**(): [`default`](transformation_Matrix.default.md)

#### Returns

[`default`](transformation_Matrix.default.md)

#### Defined in

transformation/Matrix.ts:103

## Methods

### clone

▸ **clone**(): [`default`](transformation_Matrix.default.md)

#### Returns

[`default`](transformation_Matrix.default.md)

#### Defined in

transformation/Matrix.ts:326

___

### decompose

▸ **decompose**(`matrix`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `rotation` | `undefined` \| `number` |
| `scaleX` | `number` |
| `scaleY` | `number` |
| `skewX` | `undefined` \| `number` |
| `skewY` | `undefined` \| `number` |
| `translateX` | `number` |
| `translateY` | `number` |

#### Defined in

transformation/Matrix.ts:132

___

### determinant

▸ **determinant**(): `number`

Find the determinant of a matrix

#### Returns

`number`

#### Defined in

transformation/Matrix.ts:234

___

### inverse

▸ **inverse**(): `boolean` \| [`default`](transformation_Matrix.default.md)

Find the inverse of a matrix

#### Returns

`boolean` \| [`default`](transformation_Matrix.default.md)

#### Defined in

transformation/Matrix.ts:266

___

### inverseSelf

▸ **inverseSelf**(): `boolean` \| [`default`](transformation_Matrix.default.md)

#### Returns

`boolean` \| [`default`](transformation_Matrix.default.md)

#### Defined in

transformation/Matrix.ts:269

___

### isIdentity

▸ **isIdentity**(): `boolean`

#### Returns

`boolean`

#### Defined in

transformation/Matrix.ts:107

___

### isSameAs

▸ **isSameAs**(`matrix`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

`boolean`

#### Defined in

transformation/Matrix.ts:91

___

### pointAfterTransformed

▸ **pointAfterTransformed**(`point`): [`default`](Point.default.md)

Convert the point with the current transformation
to the point corresponding to the identity matrix (in the initial state without transformation),
and the actual position of the point will not change

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

[`default`](Point.default.md)

#### Defined in

transformation/Matrix.ts:226

___

### pointBeforeTransformed

▸ **pointBeforeTransformed**(`point`): [`default`](Point.default.md)

Convert the point corresponding to the identity matrix (in the initial state without transformation)
to the point with the current transformation,
and the actual position of the point will not change

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

[`default`](Point.default.md)

#### Defined in

transformation/Matrix.ts:214

___

### postMultiply

▸ **postMultiply**(`matrix`): [`default`](transformation_Matrix.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

[`default`](transformation_Matrix.default.md)

#### Defined in

transformation/Matrix.ts:121

___

### postMultiplySelf

▸ **postMultiplySelf**(`matrix`): [`default`](transformation_Matrix.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

[`default`](transformation_Matrix.default.md)

#### Defined in

transformation/Matrix.ts:125

___

### preMultiply

▸ **preMultiply**(`matrix`): [`default`](transformation_Matrix.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

[`default`](transformation_Matrix.default.md)

#### Defined in

transformation/Matrix.ts:111

___

### preMultiplySelf

▸ **preMultiplySelf**(`matrix`): [`default`](transformation_Matrix.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

[`default`](transformation_Matrix.default.md)

#### Defined in

transformation/Matrix.ts:115

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

transformation/Matrix.ts:331

___

### transformCoordinate

▸ **transformCoordinate**(`coordinate`): [`Coordinate`](../modules/types.md#coordinate)

#### Parameters

| Name | Type |
| :------ | :------ |
| `coordinate` | [`Coordinate`](../modules/types.md#coordinate) |

#### Returns

[`Coordinate`](../modules/types.md#coordinate)

#### Defined in

transformation/Matrix.ts:188

___

### transformPoint

▸ **transformPoint**(`point`): [`default`](Point.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

[`default`](Point.default.md)

#### Defined in

transformation/Matrix.ts:195

___

### transformVector

▸ **transformVector**(`vector`): [`default`](Vector.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `vector` | [`default`](Vector.default.md) |

#### Returns

[`default`](Vector.default.md)

#### Defined in

transformation/Matrix.ts:199

___

### multiply

▸ `Static` **multiply**(`matrix1`, `matrix2`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix1` | [`default`](transformation_Matrix.default.md) |
| `matrix2` | [`default`](transformation_Matrix.default.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `a` | `number` |
| `b` | `number` |
| `c` | `number` |
| `d` | `number` |
| `e` | `number` |
| `f` | `number` |

#### Defined in

transformation/Matrix.ts:170

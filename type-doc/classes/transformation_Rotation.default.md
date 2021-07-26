[geomtoy](../README.md) / [Exports](../modules.md) / [transformation/Rotation](../modules/transformation_Rotation.md) / default

# Class: default

[transformation/Rotation](../modules/transformation_Rotation.md).default

## Hierarchy

- [`default`](transformation_Matrix.default.md)

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](transformation_Rotation.default.md#constructor)

### Accessors

- [a](transformation_Rotation.default.md#a)
- [angle](transformation_Rotation.default.md#angle)
- [b](transformation_Rotation.default.md#b)
- [c](transformation_Rotation.default.md#c)
- [d](transformation_Rotation.default.md#d)
- [e](transformation_Rotation.default.md#e)
- [f](transformation_Rotation.default.md#f)
- [origin](transformation_Rotation.default.md#origin)
- [identity](transformation_Rotation.default.md#identity)

### Methods

- [clone](transformation_Rotation.default.md#clone)
- [decompose](transformation_Rotation.default.md#decompose)
- [determinant](transformation_Rotation.default.md#determinant)
- [inverse](transformation_Rotation.default.md#inverse)
- [inverseSelf](transformation_Rotation.default.md#inverseself)
- [isIdentity](transformation_Rotation.default.md#isidentity)
- [isSameAs](transformation_Rotation.default.md#issameas)
- [pointAfterTransformed](transformation_Rotation.default.md#pointaftertransformed)
- [pointBeforeTransformed](transformation_Rotation.default.md#pointbeforetransformed)
- [postMultiply](transformation_Rotation.default.md#postmultiply)
- [postMultiplySelf](transformation_Rotation.default.md#postmultiplyself)
- [preMultiply](transformation_Rotation.default.md#premultiply)
- [preMultiplySelf](transformation_Rotation.default.md#premultiplyself)
- [toString](transformation_Rotation.default.md#tostring)
- [transformCoordinate](transformation_Rotation.default.md#transformcoordinate)
- [transformPoint](transformation_Rotation.default.md#transformpoint)
- [transformVector](transformation_Rotation.default.md#transformvector)
- [multiply](transformation_Rotation.default.md#multiply)

## Constructors

### constructor

• **new default**(`angle`, `origin`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |
| `origin` | [`default`](Point.default.md) |

#### Overrides

[default](transformation_Matrix.default.md).[constructor](transformation_Matrix.default.md#constructor)

#### Defined in

transformation/Rotation.ts:12

• **new default**(`angle`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |

#### Overrides

[default](transformation_Matrix.default.md).[constructor](transformation_Matrix.default.md#constructor)

#### Defined in

transformation/Rotation.ts:13

• **new default**()

#### Overrides

[default](transformation_Matrix.default.md).[constructor](transformation_Matrix.default.md#constructor)

#### Defined in

transformation/Rotation.ts:14

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

### angle

• `get` **angle**(): `number`

#### Returns

`number`

#### Defined in

transformation/Rotation.ts:31

• `set` **angle**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

transformation/Rotation.ts:34

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

### origin

• `get` **origin**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

transformation/Rotation.ts:39

• `set` **origin**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`default`](Point.default.md) |

#### Returns

`void`

#### Defined in

transformation/Rotation.ts:42

___

### identity

• `Static` `get` **identity**(): [`default`](transformation_Matrix.default.md)

#### Returns

[`default`](transformation_Matrix.default.md)

#### Defined in

transformation/Matrix.ts:103

## Methods

### clone

▸ **clone**(): [`default`](transformation_Rotation.default.md)

#### Returns

[`default`](transformation_Rotation.default.md)

#### Overrides

[default](transformation_Matrix.default.md).[clone](transformation_Matrix.default.md#clone)

#### Defined in

transformation/Rotation.ts:59

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

#### Inherited from

[default](transformation_Matrix.default.md).[decompose](transformation_Matrix.default.md#decompose)

#### Defined in

transformation/Matrix.ts:132

___

### determinant

▸ **determinant**(): `number`

Find the determinant of a matrix

#### Returns

`number`

#### Inherited from

[default](transformation_Matrix.default.md).[determinant](transformation_Matrix.default.md#determinant)

#### Defined in

transformation/Matrix.ts:234

___

### inverse

▸ **inverse**(): `boolean` \| [`default`](transformation_Matrix.default.md)

Find the inverse of a matrix

#### Returns

`boolean` \| [`default`](transformation_Matrix.default.md)

#### Inherited from

[default](transformation_Matrix.default.md).[inverse](transformation_Matrix.default.md#inverse)

#### Defined in

transformation/Matrix.ts:266

___

### inverseSelf

▸ **inverseSelf**(): `boolean` \| [`default`](transformation_Matrix.default.md)

#### Returns

`boolean` \| [`default`](transformation_Matrix.default.md)

#### Inherited from

[default](transformation_Matrix.default.md).[inverseSelf](transformation_Matrix.default.md#inverseself)

#### Defined in

transformation/Matrix.ts:269

___

### isIdentity

▸ **isIdentity**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[default](transformation_Matrix.default.md).[isIdentity](transformation_Matrix.default.md#isidentity)

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

#### Inherited from

[default](transformation_Matrix.default.md).[isSameAs](transformation_Matrix.default.md#issameas)

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

#### Inherited from

[default](transformation_Matrix.default.md).[pointAfterTransformed](transformation_Matrix.default.md#pointaftertransformed)

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

#### Inherited from

[default](transformation_Matrix.default.md).[pointBeforeTransformed](transformation_Matrix.default.md#pointbeforetransformed)

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

#### Inherited from

[default](transformation_Matrix.default.md).[postMultiply](transformation_Matrix.default.md#postmultiply)

#### Defined in

transformation/Matrix.ts:121

___

### postMultiplySelf

▸ **postMultiplySelf**(`matrix`): [`default`](transformation_Rotation.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

[`default`](transformation_Rotation.default.md)

#### Inherited from

[default](transformation_Matrix.default.md).[postMultiplySelf](transformation_Matrix.default.md#postmultiplyself)

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

#### Inherited from

[default](transformation_Matrix.default.md).[preMultiply](transformation_Matrix.default.md#premultiply)

#### Defined in

transformation/Matrix.ts:111

___

### preMultiplySelf

▸ **preMultiplySelf**(`matrix`): [`default`](transformation_Rotation.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

[`default`](transformation_Rotation.default.md)

#### Inherited from

[default](transformation_Matrix.default.md).[preMultiplySelf](transformation_Matrix.default.md#premultiplyself)

#### Defined in

transformation/Matrix.ts:115

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[default](transformation_Matrix.default.md).[toString](transformation_Matrix.default.md#tostring)

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

#### Inherited from

[default](transformation_Matrix.default.md).[transformCoordinate](transformation_Matrix.default.md#transformcoordinate)

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

#### Inherited from

[default](transformation_Matrix.default.md).[transformPoint](transformation_Matrix.default.md#transformpoint)

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

#### Inherited from

[default](transformation_Matrix.default.md).[transformVector](transformation_Matrix.default.md#transformvector)

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

#### Inherited from

[default](transformation_Matrix.default.md).[multiply](transformation_Matrix.default.md#multiply)

#### Defined in

transformation/Matrix.ts:170

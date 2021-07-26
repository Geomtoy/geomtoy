[geomtoy](../README.md) / [Exports](../modules.md) / [transformation/Skewing](../modules/transformation_Skewing.md) / default

# Class: default

[transformation/Skewing](../modules/transformation_Skewing.md).default

## Hierarchy

- [`default`](transformation_Matrix.default.md)

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](transformation_Skewing.default.md#constructor)

### Accessors

- [a](transformation_Skewing.default.md#a)
- [angleX](transformation_Skewing.default.md#anglex)
- [angleY](transformation_Skewing.default.md#angley)
- [b](transformation_Skewing.default.md#b)
- [c](transformation_Skewing.default.md#c)
- [d](transformation_Skewing.default.md#d)
- [e](transformation_Skewing.default.md#e)
- [f](transformation_Skewing.default.md#f)
- [origin](transformation_Skewing.default.md#origin)
- [identity](transformation_Skewing.default.md#identity)

### Methods

- [clone](transformation_Skewing.default.md#clone)
- [decompose](transformation_Skewing.default.md#decompose)
- [determinant](transformation_Skewing.default.md#determinant)
- [inverse](transformation_Skewing.default.md#inverse)
- [inverseSelf](transformation_Skewing.default.md#inverseself)
- [isIdentity](transformation_Skewing.default.md#isidentity)
- [isSameAs](transformation_Skewing.default.md#issameas)
- [pointAfterTransformed](transformation_Skewing.default.md#pointaftertransformed)
- [pointBeforeTransformed](transformation_Skewing.default.md#pointbeforetransformed)
- [postMultiply](transformation_Skewing.default.md#postmultiply)
- [postMultiplySelf](transformation_Skewing.default.md#postmultiplyself)
- [preMultiply](transformation_Skewing.default.md#premultiply)
- [preMultiplySelf](transformation_Skewing.default.md#premultiplyself)
- [toString](transformation_Skewing.default.md#tostring)
- [transformCoordinate](transformation_Skewing.default.md#transformcoordinate)
- [transformPoint](transformation_Skewing.default.md#transformpoint)
- [transformVector](transformation_Skewing.default.md#transformvector)
- [multiply](transformation_Skewing.default.md#multiply)

## Constructors

### constructor

• **new default**(`angleX`, `angleY`, `origin`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angleX` | `number` |
| `angleY` | `number` |
| `origin` | [`default`](Point.default.md) |

#### Overrides

[default](transformation_Matrix.default.md).[constructor](transformation_Matrix.default.md#constructor)

#### Defined in

transformation/Skewing.ts:13

• **new default**(`angleX`, `angleY`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angleX` | `number` |
| `angleY` | `number` |

#### Overrides

[default](transformation_Matrix.default.md).[constructor](transformation_Matrix.default.md#constructor)

#### Defined in

transformation/Skewing.ts:14

• **new default**()

#### Overrides

[default](transformation_Matrix.default.md).[constructor](transformation_Matrix.default.md#constructor)

#### Defined in

transformation/Skewing.ts:15

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

### angleX

• `get` **angleX**(): `number`

#### Returns

`number`

#### Defined in

transformation/Skewing.ts:33

• `set` **angleX**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

transformation/Skewing.ts:36

___

### angleY

• `get` **angleY**(): `number`

#### Returns

`number`

#### Defined in

transformation/Skewing.ts:41

• `set` **angleY**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

transformation/Skewing.ts:44

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

transformation/Skewing.ts:49

• `set` **origin**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`default`](Point.default.md) |

#### Returns

`void`

#### Defined in

transformation/Skewing.ts:52

___

### identity

• `Static` `get` **identity**(): [`default`](transformation_Matrix.default.md)

#### Returns

[`default`](transformation_Matrix.default.md)

#### Defined in

transformation/Matrix.ts:103

## Methods

### clone

▸ **clone**(): [`default`](transformation_Skewing.default.md)

#### Returns

[`default`](transformation_Skewing.default.md)

#### Overrides

[default](transformation_Matrix.default.md).[clone](transformation_Matrix.default.md#clone)

#### Defined in

transformation/Skewing.ts:67

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

▸ **postMultiplySelf**(`matrix`): [`default`](transformation_Skewing.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

[`default`](transformation_Skewing.default.md)

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

▸ **preMultiplySelf**(`matrix`): [`default`](transformation_Skewing.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

[`default`](transformation_Skewing.default.md)

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

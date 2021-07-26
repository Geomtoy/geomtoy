[geomtoy](../README.md) / [Exports](../modules.md) / [transformation/LineReflection](../modules/transformation_LineReflection.md) / default

# Class: default

[transformation/LineReflection](../modules/transformation_LineReflection.md).default

## Hierarchy

- [`default`](transformation_Matrix.default.md)

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](transformation_LineReflection.default.md#constructor)

### Accessors

- [a](transformation_LineReflection.default.md#a)
- [b](transformation_LineReflection.default.md#b)
- [c](transformation_LineReflection.default.md#c)
- [d](transformation_LineReflection.default.md#d)
- [e](transformation_LineReflection.default.md#e)
- [f](transformation_LineReflection.default.md#f)
- [line](transformation_LineReflection.default.md#line)
- [identity](transformation_LineReflection.default.md#identity)
- [xAxis](transformation_LineReflection.default.md#xaxis)
- [yAxis](transformation_LineReflection.default.md#yaxis)
- [yEqNegativeX](transformation_LineReflection.default.md#yeqnegativex)
- [yEqPositiveX](transformation_LineReflection.default.md#yeqpositivex)

### Methods

- [clone](transformation_LineReflection.default.md#clone)
- [decompose](transformation_LineReflection.default.md#decompose)
- [determinant](transformation_LineReflection.default.md#determinant)
- [inverse](transformation_LineReflection.default.md#inverse)
- [inverseSelf](transformation_LineReflection.default.md#inverseself)
- [isIdentity](transformation_LineReflection.default.md#isidentity)
- [isSameAs](transformation_LineReflection.default.md#issameas)
- [pointAfterTransformed](transformation_LineReflection.default.md#pointaftertransformed)
- [pointBeforeTransformed](transformation_LineReflection.default.md#pointbeforetransformed)
- [postMultiply](transformation_LineReflection.default.md#postmultiply)
- [postMultiplySelf](transformation_LineReflection.default.md#postmultiplyself)
- [preMultiply](transformation_LineReflection.default.md#premultiply)
- [preMultiplySelf](transformation_LineReflection.default.md#premultiplyself)
- [toString](transformation_LineReflection.default.md#tostring)
- [transformCoordinate](transformation_LineReflection.default.md#transformcoordinate)
- [transformPoint](transformation_LineReflection.default.md#transformpoint)
- [transformVector](transformation_LineReflection.default.md#transformvector)
- [multiply](transformation_LineReflection.default.md#multiply)

## Constructors

### constructor

• **new default**(`line`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`default`](Line.default.md) |

#### Overrides

[default](transformation_Matrix.default.md).[constructor](transformation_Matrix.default.md#constructor)

#### Defined in

transformation/LineReflection.ts:11

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

### line

• `get` **line**(): [`default`](Line.default.md)

#### Returns

[`default`](Line.default.md)

#### Defined in

transformation/LineReflection.ts:22

• `set` **line**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`default`](Line.default.md) |

#### Returns

`void`

#### Defined in

transformation/LineReflection.ts:25

___

### identity

• `Static` `get` **identity**(): [`default`](transformation_Matrix.default.md)

#### Returns

[`default`](transformation_Matrix.default.md)

#### Defined in

transformation/Matrix.ts:103

___

### xAxis

• `Static` `get` **xAxis**(): [`default`](transformation_LineReflection.default.md)

#### Returns

[`default`](transformation_LineReflection.default.md)

#### Defined in

transformation/LineReflection.ts:33

___

### yAxis

• `Static` `get` **yAxis**(): [`default`](transformation_LineReflection.default.md)

#### Returns

[`default`](transformation_LineReflection.default.md)

#### Defined in

transformation/LineReflection.ts:30

___

### yEqNegativeX

• `Static` `get` **yEqNegativeX**(): [`default`](transformation_LineReflection.default.md)

#### Returns

[`default`](transformation_LineReflection.default.md)

#### Defined in

transformation/LineReflection.ts:39

___

### yEqPositiveX

• `Static` `get` **yEqPositiveX**(): [`default`](transformation_LineReflection.default.md)

#### Returns

[`default`](transformation_LineReflection.default.md)

#### Defined in

transformation/LineReflection.ts:36

## Methods

### clone

▸ **clone**(): [`default`](transformation_LineReflection.default.md)

#### Returns

[`default`](transformation_LineReflection.default.md)

#### Overrides

[default](transformation_Matrix.default.md).[clone](transformation_Matrix.default.md#clone)

#### Defined in

transformation/LineReflection.ts:56

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

▸ **postMultiplySelf**(`matrix`): [`default`](transformation_LineReflection.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

[`default`](transformation_LineReflection.default.md)

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

▸ **preMultiplySelf**(`matrix`): [`default`](transformation_LineReflection.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

[`default`](transformation_LineReflection.default.md)

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

[geomtoy](../README.md) / [Exports](../modules.md) / [inversion/Inversion](../modules/inversion_Inversion.md) / default

# Class: default

[inversion/Inversion](../modules/inversion_Inversion.md).default

## Table of contents

### Constructors

- [constructor](inversion_Inversion.default.md#constructor)

### Properties

- [invertPower](inversion_Inversion.default.md#invertpower)
- [ix](inversion_Inversion.default.md#ix)
- [iy](inversion_Inversion.default.md#iy)

### Accessors

- [centerPoint](inversion_Inversion.default.md#centerpoint)

### Methods

- [invertCircle](inversion_Inversion.default.md#invertcircle)
- [invertLine](inversion_Inversion.default.md#invertline)
- [invertPoint](inversion_Inversion.default.md#invertpoint)

## Constructors

### constructor

• **new default**(`invertPower`, `point`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `invertPower` | `number` |
| `point` | [`default`](Point.default.md) |

#### Defined in

inversion/Inversion.ts:14

• **new default**(`invertPower`, `coordinate`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `invertPower` | `number` |
| `coordinate` | [`Coordinate`](../modules/types.md#coordinate) |

#### Defined in

inversion/Inversion.ts:15

## Properties

### invertPower

• **invertPower**: `number`

#### Defined in

inversion/Inversion.ts:12

___

### ix

• **ix**: `number`

#### Defined in

inversion/Inversion.ts:10

___

### iy

• **iy**: `number`

#### Defined in

inversion/Inversion.ts:11

## Accessors

### centerPoint

• `get` **centerPoint**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

inversion/Inversion.ts:34

## Methods

### invertCircle

▸ **invertCircle**(`circle`): [`default`](Circle.default.md) \| [`default`](Line.default.md)

求`圆circle`的反形，若圆过反演中心，则返回反形直线，若圆不过反演中心，则返回反形圆

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

[`default`](Circle.default.md) \| [`default`](Line.default.md)

#### Defined in

inversion/Inversion.ts:101

___

### invertLine

▸ **invertLine**(`line`): [`default`](Circle.default.md) \| [`default`](Line.default.md)

求`直线line`的反形，若直线过反演中心，则返回本身，若直线不过反演中心，则返回反形圆

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`default`](Line.default.md) |

#### Returns

[`default`](Circle.default.md) \| [`default`](Line.default.md)

#### Defined in

inversion/Inversion.ts:70

___

### invertPoint

▸ **invertPoint**(`point`): [`default`](Point.default.md)

求`点point`的反形

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

[`default`](Point.default.md)

#### Defined in

inversion/Inversion.ts:43

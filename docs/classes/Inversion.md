[Geomtoy](../README.md) / [Modules](../modules.md) / Inversion

# Class: Inversion

## Hierarchy

- [`GeomObject`](GeomObject.md)

  ↳ **`Inversion`**

## Table of contents

### Constructors

- [constructor](Inversion.md#constructor)

### Accessors

- [name](Inversion.md#name)
- [uuid](Inversion.md#uuid)
- [power](Inversion.md#power)
- [centerX](Inversion.md#centerx)
- [centerY](Inversion.md#centery)
- [centerCoordinate](Inversion.md#centercoordinate)
- [centerPoint](Inversion.md#centerpoint)

### Methods

- [invertPoint](Inversion.md#invertpoint)
- [invertLine](Inversion.md#invertline)
- [invertCircle](Inversion.md#invertcircle)
- [clone](Inversion.md#clone)
- [toString](Inversion.md#tostring)
- [toObject](Inversion.md#toobject)
- [toArray](Inversion.md#toarray)

## Constructors

### constructor

• **new Inversion**(`power`, `centerX`, `centerY`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `power` | `number` |
| `centerX` | `number` |
| `centerY` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[constructor](GeomObject.md#constructor)

• **new Inversion**(`power`, `centerCoordinate`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `power` | `number` |
| `centerCoordinate` | [`number`, `number`] |

#### Overrides

GeomObject.constructor

• **new Inversion**(`power`, `centerPoint`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `power` | `number` |
| `centerPoint` | [`Point`](Point.md) |

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

### power

• `get` **power**(): `number`

#### Returns

`number`

• `set` **power**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### centerX

• `get` **centerX**(): `number`

#### Returns

`number`

• `set` **centerX**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### centerY

• `get` **centerY**(): `number`

#### Returns

`number`

• `set` **centerY**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### centerCoordinate

• `get` **centerCoordinate**(): [`number`, `number`]

#### Returns

[`number`, `number`]

• `set` **centerCoordinate**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`number`, `number`] |

#### Returns

`void`

___

### centerPoint

• `get` **centerPoint**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

• `set` **centerPoint**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`Point`](Point.md) |

#### Returns

`void`

## Methods

### invertPoint

▸ **invertPoint**(`point`): [`Point`](Point.md)

Find the inversion of point `point`

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

[`Point`](Point.md)

___

### invertLine

▸ **invertLine**(`line`): [`Line`](Line.md) \| [`Circle`](Circle.md)

Find the inversion of line `line`.

**`description`**
If line `line` passes through the inversion center, return itself(cloned).
If line `line` does not pass through the inversion center, return the inverted circle.

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

[`Line`](Line.md) \| [`Circle`](Circle.md)

___

### invertCircle

▸ **invertCircle**(`circle`): [`Line`](Line.md) \| [`Circle`](Circle.md)

求`圆circle`的反形，若圆过反演中心，则返回反形直线，若圆不过反演中心，则返回反形圆

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

[`Line`](Line.md) \| [`Circle`](Circle.md)

___

### clone

▸ **clone**(): [`Inversion`](Inversion.md)

#### Returns

[`Inversion`](Inversion.md)

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

### toObject

▸ **toObject**(): `object`

#### Returns

`object`

#### Overrides

[GeomObject](GeomObject.md).[toObject](GeomObject.md#toobject)

___

### toArray

▸ **toArray**(): `any`[]

#### Returns

`any`[]

#### Overrides

[GeomObject](GeomObject.md).[toArray](GeomObject.md#toarray)

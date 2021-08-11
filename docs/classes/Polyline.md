[Geomtoy](../README.md) / [Modules](../modules.md) / Polyline

# Class: Polyline

## Hierarchy

- [`GeomObject`](GeomObject.md)

  ↳ **`Polyline`**

## Table of contents

### Constructors

- [constructor](Polyline.md#constructor)

### Accessors

- [name](Polyline.md#name)
- [uuid](Polyline.md#uuid)
- [points](Polyline.md#points)
- [pointCoordinates](Polyline.md#pointcoordinates)

### Methods

- [getPointCount](Polyline.md#getpointcount)
- [clone](Polyline.md#clone)
- [toString](Polyline.md#tostring)
- [toArray](Polyline.md#toarray)
- [toObject](Polyline.md#toobject)

## Constructors

### constructor

• **new Polyline**(`pointCoordinates`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `pointCoordinates` | [`number`, `number`][] |

#### Overrides

[GeomObject](GeomObject.md).[constructor](GeomObject.md#constructor)

• **new Polyline**(`points`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `points` | [`Point`](Point.md)[] |

#### Overrides

GeomObject.constructor

• **new Polyline**(...`pointCoordinates`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `...pointCoordinates` | [`number`, `number`][] |

#### Overrides

GeomObject.constructor

• **new Polyline**(...`points`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `...points` | [`Point`](Point.md)[] |

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

### points

• `get` **points**(): [`Point`](Point.md)[]

#### Returns

[`Point`](Point.md)[]

• `set` **points**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`Point`](Point.md)[] |

#### Returns

`void`

___

### pointCoordinates

• `get` **pointCoordinates**(): [`number`, `number`][]

#### Returns

[`number`, `number`][]

• `set` **pointCoordinates**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`number`, `number`][] |

#### Returns

`void`

## Methods

### getPointCount

▸ **getPointCount**(): `number`

#### Returns

`number`

___

### clone

▸ **clone**(): [`GeomObject`](GeomObject.md)

#### Returns

[`GeomObject`](GeomObject.md)

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

▸ **toArray**(): `any`[]

#### Returns

`any`[]

#### Overrides

[GeomObject](GeomObject.md).[toArray](GeomObject.md#toarray)

___

### toObject

▸ **toObject**(): `object`

#### Returns

`object`

#### Overrides

[GeomObject](GeomObject.md).[toObject](GeomObject.md#toobject)

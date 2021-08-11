[Geomtoy](../README.md) / [Modules](../modules.md) / Polygon

# Class: Polygon

## Hierarchy

- [`GeomObject`](GeomObject.md)

  ↳ **`Polygon`**

## Table of contents

### Constructors

- [constructor](Polygon.md#constructor)

### Accessors

- [name](Polygon.md#name)
- [uuid](Polygon.md#uuid)
- [points](Polygon.md#points)
- [pointCoordinates](Polygon.md#pointcoordinates)

### Methods

- [getPointCount](Polygon.md#getpointcount)
- [getPoint](Polygon.md#getpoint)
- [setPoint](Polygon.md#setpoint)
- [appendPoint](Polygon.md#appendpoint)
- [prependPoint](Polygon.md#prependpoint)
- [insertPoint](Polygon.md#insertpoint)
- [removePoint](Polygon.md#removepoint)
- [isPointsConcyclic](Polygon.md#ispointsconcyclic)
- [getPerimeter](Polygon.md#getperimeter)
- [getArea](Polygon.md#getarea)
- [getMeanPoint](Polygon.md#getmeanpoint)
- [getCentroidPoint](Polygon.md#getcentroidpoint)
- [getBoundingRectangle](Polygon.md#getboundingrectangle)
- [clone](Polygon.md#clone)
- [toString](Polygon.md#tostring)
- [toArray](Polygon.md#toarray)
- [toObject](Polygon.md#toobject)

## Constructors

### constructor

• **new Polygon**(`pointCoordinates`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `pointCoordinates` | [`number`, `number`][] |

#### Overrides

[GeomObject](GeomObject.md).[constructor](GeomObject.md#constructor)

• **new Polygon**(`points`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `points` | [`Point`](Point.md)[] |

#### Overrides

GeomObject.constructor

• **new Polygon**(...`pointCoordinates`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `...pointCoordinates` | [`number`, `number`][] |

#### Overrides

GeomObject.constructor

• **new Polygon**(...`points`)

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

### getPoint

▸ **getPoint**(`index`): ``null`` \| [`Point`](Point.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

#### Returns

``null`` \| [`Point`](Point.md)

___

### setPoint

▸ **setPoint**(`index`, `point`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |
| `point` | [`Point`](Point.md) |

#### Returns

`boolean`

___

### appendPoint

▸ **appendPoint**(`point`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

`void`

___

### prependPoint

▸ **prependPoint**(`point`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

`void`

___

### insertPoint

▸ **insertPoint**(`index`, `point`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |
| `point` | [`Point`](Point.md) |

#### Returns

`boolean`

___

### removePoint

▸ **removePoint**(`index`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

#### Returns

`boolean`

___

### isPointsConcyclic

▸ **isPointsConcyclic**(): `void`

#### Returns

`void`

___

### getPerimeter

▸ **getPerimeter**(): `number`

#### Returns

`number`

___

### getArea

▸ **getArea**(`signed?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `signed` | `boolean` | `false` |

#### Returns

`number`

___

### getMeanPoint

▸ **getMeanPoint**(): `number`[]

#### Returns

`number`[]

___

### getCentroidPoint

▸ **getCentroidPoint**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

___

### getBoundingRectangle

▸ **getBoundingRectangle**(): [`Rectangle`](Rectangle.md)

#### Returns

[`Rectangle`](Rectangle.md)

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

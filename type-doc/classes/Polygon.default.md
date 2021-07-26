[geomtoy](../README.md) / [Exports](../modules.md) / [Polygon](../modules/Polygon.md) / default

# Class: default

[Polygon](../modules/Polygon.md).default

## Table of contents

### Constructors

- [constructor](Polygon.default.md#constructor)

### Accessors

- [pointCount](Polygon.default.md#pointcount)
- [points](Polygon.default.md#points)

### Methods

- [getArea](Polygon.default.md#getarea)
- [getBoundingRectangle](Polygon.default.md#getboundingrectangle)
- [getCentroidPoint](Polygon.default.md#getcentroidpoint)
- [getMeanPoint](Polygon.default.md#getmeanpoint)
- [getPerimeter](Polygon.default.md#getperimeter)
- [getPoint](Polygon.default.md#getpoint)
- [isPointsConcyclic](Polygon.default.md#ispointsconcyclic)

## Constructors

### constructor

• **new default**(`points`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `points` | [`default`](Point.default.md)[] |

#### Defined in

Polygon.ts:10

• **new default**(`points`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `points` | [`Coordinate`](../modules/types.md#coordinate)[] |

#### Defined in

Polygon.ts:11

• **new default**(...`points`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `...points` | [`default`](Point.default.md)[] |

#### Defined in

Polygon.ts:12

• **new default**(...`points`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `...points` | [`Coordinate`](../modules/types.md#coordinate)[] |

#### Defined in

Polygon.ts:13

## Accessors

### pointCount

• `get` **pointCount**(): `number`

#### Returns

`number`

#### Defined in

Polygon.ts:34

___

### points

• `get` **points**(): [`default`](Point.default.md)[]

#### Returns

[`default`](Point.default.md)[]

#### Defined in

Polygon.ts:26

• `set` **points**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`default`](Point.default.md)[] |

#### Returns

`void`

#### Defined in

Polygon.ts:29

## Methods

### getArea

▸ **getArea**(`signed?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `signed` | `boolean` | `false` |

#### Returns

`number`

#### Defined in

Polygon.ts:64

___

### getBoundingRectangle

▸ **getBoundingRectangle**(): [`default`](Rectangle.default.md)

#### Returns

[`default`](Rectangle.default.md)

#### Defined in

Polygon.ts:108

___

### getCentroidPoint

▸ **getCentroidPoint**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

Polygon.ts:89

___

### getMeanPoint

▸ **getMeanPoint**(): `number`[]

#### Returns

`number`[]

#### Defined in

Polygon.ts:76

___

### getPerimeter

▸ **getPerimeter**(): `number`

#### Returns

`number`

#### Defined in

Polygon.ts:44

___

### getPoint

▸ **getPoint**(`index`): `undefined` \| [`default`](Point.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

#### Returns

`undefined` \| [`default`](Point.default.md)

#### Defined in

Polygon.ts:38

___

### isPointsConcyclic

▸ **isPointsConcyclic**(): `void`

#### Returns

`void`

#### Defined in

Polygon.ts:42

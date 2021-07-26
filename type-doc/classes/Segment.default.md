[geomtoy](../README.md) / [Exports](../modules.md) / [Segment](../modules/Segment.md) / default

# Class: default

[Segment](../modules/Segment.md).default

## Table of contents

### Constructors

- [constructor](Segment.default.md#constructor)

### Properties

- [getAngle](Segment.default.md#getangle)
- [p1](Segment.default.md#p1)
- [p2](Segment.default.md#p2)

### Methods

- [getDivisionRatioByLine](Segment.default.md#getdivisionratiobyline)
- [getInterpolatePoint](Segment.default.md#getinterpolatepoint)
- [getIntersectionPointWithLine](Segment.default.md#getintersectionpointwithline)
- [getIntersectionPointWithSegment](Segment.default.md#getintersectionpointwithsegment)
- [getJointPointWithSegment](Segment.default.md#getjointpointwithsegment)
- [getMiddlePoint](Segment.default.md#getmiddlepoint)
- [getOverlapSegmentWithSegment](Segment.default.md#getoverlapsegmentwithsegment)
- [isCollinearWithSegment](Segment.default.md#iscollinearwithsegment)
- [isIntersectedWithSegment](Segment.default.md#isintersectedwithsegment)
- [isJointedWithSegment](Segment.default.md#isjointedwithsegment)
- [isOverlappedWithSegment](Segment.default.md#isoverlappedwithsegment)
- [isParallelToSegment](Segment.default.md#isparalleltosegment)
- [isPerpendicularToSegment](Segment.default.md#isperpendiculartosegment)
- [isSameAs](Segment.default.md#issameas)
- [toArray](Segment.default.md#toarray)
- [toObject](Segment.default.md#toobject)
- [toString](Segment.default.md#tostring)
- [fromPoints](Segment.default.md#frompoints)

## Constructors

### constructor

• **new default**(`x1`, `y1`, `x2`, `y2`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `x1` | `any` |
| `y1` | `any` |
| `x2` | `any` |
| `y2` | `any` |

#### Defined in

Segment.js:10

## Properties

### getAngle

• **getAngle**: () => `number`

`线段this`与x轴正方向的夹角，范围[-Math.PI, Math.PI]

#### Type declaration

▸ (): `number`

`线段this`与x轴正方向的夹角，范围[-Math.PI, Math.PI]

##### Returns

`number`

#### Defined in

Segment.js:193

___

### p1

• **p1**: `any`

#### Defined in

Segment.js:7

___

### p2

• **p2**: `any`

#### Defined in

Segment.js:8

## Methods

### getDivisionRatioByLine

▸ **getDivisionRatioByLine**(`l`): `number`

`直线l`分线段成两部分之间的比例

#### Parameters

| Name | Type |
| :------ | :------ |
| `l` | [`default`](Line.default.md) |

#### Returns

`number`

#### Defined in

Segment.js:184

___

### getInterpolatePoint

▸ **getInterpolatePoint**(`lambda`): [`default`](Point.default.md)

获得从线段起点开始的lambda定比分点P

**`description`** 当P为内分点时，lambda > 0；当P为外分点时，lambda < 0 && lambda !== -1；当P与A重合时，lambda === 0,当P与B重合时，lambda===1

#### Parameters

| Name | Type |
| :------ | :------ |
| `lambda` | `number` |

#### Returns

[`default`](Point.default.md)

#### Defined in

Segment.js:172

___

### getIntersectionPointWithLine

▸ **getIntersectionPointWithLine**(`l`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `l` | `any` |

#### Returns

`void`

#### Defined in

Segment.js:199

___

### getIntersectionPointWithSegment

▸ **getIntersectionPointWithSegment**(`segment`): ``null`` \| ``true`` \| [`default`](Point.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | `any` |

#### Returns

``null`` \| ``true`` \| [`default`](Point.default.md)

#### Defined in

Segment.js:152

___

### getJointPointWithSegment

▸ **getJointPointWithSegment**(`s`): ``null`` \| ``true`` \| [`default`](Point.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `any` |

#### Returns

``null`` \| ``true`` \| [`default`](Point.default.md)

#### Defined in

Segment.js:89

___

### getMiddlePoint

▸ **getMiddlePoint**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

Segment.js:158

___

### getOverlapSegmentWithSegment

▸ **getOverlapSegmentWithSegment**(`s`): ``null`` \| ``true`` \| [`default`](Segment.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `any` |

#### Returns

``null`` \| ``true`` \| [`default`](Segment.default.md)

#### Defined in

Segment.js:118

___

### isCollinearWithSegment

▸ **isCollinearWithSegment**(`s`): `boolean`

`线段this`与`线段s`是否共线，无论是否相接乃至相同

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | [`default`](Segment.default.md) |

#### Returns

`boolean`

#### Defined in

Segment.js:62

___

### isIntersectedWithSegment

▸ **isIntersectedWithSegment**(`segment`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `segment` | `any` |

#### Returns

`boolean`

#### Defined in

Segment.js:149

___

### isJointedWithSegment

▸ **isJointedWithSegment**(`s`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `any` |

#### Returns

`boolean`

#### Defined in

Segment.js:86

___

### isOverlappedWithSegment

▸ **isOverlappedWithSegment**(`s`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `any` |

#### Returns

`boolean`

#### Defined in

Segment.js:115

___

### isParallelToSegment

▸ **isParallelToSegment**(`s`): `boolean`

`线段this`与`线段s`是否平行，无论是否共线乃至相同，夹角为0或者Math.PI

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | [`default`](Segment.default.md) |

#### Returns

`boolean`

#### Defined in

Segment.js:51

___

### isPerpendicularToSegment

▸ **isPerpendicularToSegment**(`s`): `boolean`

`线段this`与`线段s`是否垂直，无论是否相交，夹角为Math.PI / 2

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | [`default`](Segment.default.md) |

#### Returns

`boolean`

#### Defined in

Segment.js:40

___

### isSameAs

▸ **isSameAs**(`s`): `boolean`

`线段this`与`线段s`是否相同

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | [`default`](Segment.default.md) |

#### Returns

`boolean`

#### Defined in

Segment.js:32

___

### toArray

▸ **toArray**(): `any`[]

#### Returns

`any`[]

#### Defined in

Segment.js:201

___

### toObject

▸ **toObject**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `p1x` | `any` |
| `p1y` | `any` |
| `p2x` | `any` |
| `p2y` | `any` |

#### Defined in

Segment.js:204

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

Segment.js:207

___

### fromPoints

▸ `Static` **fromPoints**(`p1`, `p2`): [`default`](Segment.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `p1` | `any` |
| `p2` | `any` |

#### Returns

[`default`](Segment.default.md)

#### Defined in

Segment.js:23

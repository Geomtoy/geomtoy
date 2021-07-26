[geomtoy](../README.md) / [Exports](../modules.md) / [Circle](../modules/Circle.md) / default

# Class: default

[Circle](../modules/Circle.md).default

## Hierarchy

- [`default`](base_GeomObject.default.md)

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](Circle.default.md#constructor)

### Properties

- [options](Circle.default.md#options)

### Accessors

- [centerPoint](Circle.default.md#centerpoint)
- [cx](Circle.default.md#cx)
- [cy](Circle.default.md#cy)
- [radius](Circle.default.md#radius)

### Methods

- [apply](Circle.default.md#apply)
- [clone](Circle.default.md#clone)
- [getArcAngleBetween](Circle.default.md#getarcanglebetween)
- [getArcLengthBetween](Circle.default.md#getarclengthbetween)
- [getEccentricity](Circle.default.md#geteccentricity)
- [getExternallyTangentDataWithCircle](Circle.default.md#getexternallytangentdatawithcircle)
- [getGraphic](Circle.default.md#getgraphic)
- [getInscribedRegularPolygon](Circle.default.md#getinscribedregularpolygon)
- [getInternallyTangentDataWithCircle](Circle.default.md#getinternallytangentdatawithcircle)
- [getIntersectionPointsWithCircle](Circle.default.md#getintersectionpointswithcircle)
- [getPerimeter](Circle.default.md#getperimeter)
- [getPointAtAngle](Circle.default.md#getpointatangle)
- [getTangentLineAtPoint](Circle.default.md#gettangentlineatpoint)
- [getTangleLineDataWithPointOutside](Circle.default.md#gettanglelinedatawithpointoutside)
- [isExternallyTangentWithCircle](Circle.default.md#isexternallytangentwithcircle)
- [isInsideCircle](Circle.default.md#isinsidecircle)
- [isInternallyTangentWithCircle](Circle.default.md#isinternallytangentwithcircle)
- [isIntersectedWithCircle](Circle.default.md#isintersectedwithcircle)
- [isOrthogonalWithCircle](Circle.default.md#isorthogonalwithcircle)
- [isOutsideCircle](Circle.default.md#isoutsidecircle)
- [isSameAs](Circle.default.md#issameas)
- [isTangentWithCircle](Circle.default.md#istangentwithcircle)
- [toArray](Circle.default.md#toarray)
- [toObject](Circle.default.md#toobject)
- [toString](Circle.default.md#tostring)
- [getCommonTangentCirclesOfTwoCirclesThroughPointNotOn](Circle.default.md#getcommontangentcirclesoftwocirclesthroughpointnoton)
- [getCommonTangentDataOfTwoCircles](Circle.default.md#getcommontangentdataoftwocircles)

## Constructors

### constructor

• **new default**(`radius`, `centerX`, `centerY`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `radius` | `number` |
| `centerX` | `number` |
| `centerY` | `number` |

#### Overrides

[default](base_GeomObject.default.md).[constructor](base_GeomObject.default.md#constructor)

#### Defined in

Circle.ts:19

• **new default**(`radius`, `centerCoordinate`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `radius` | `number` |
| `centerCoordinate` | [`Coordinate`](../modules/types.md#coordinate) |

#### Overrides

GeomObject.constructor

#### Defined in

Circle.ts:20

• **new default**(`radius`, `centerPoint`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `radius` | `number` |
| `centerPoint` | [`default`](Point.default.md) |

#### Overrides

GeomObject.constructor

#### Defined in

Circle.ts:21

## Properties

### options

• **options**: [`Options`](../modules/types.md#options)

#### Inherited from

[default](base_GeomObject.default.md).[options](base_GeomObject.default.md#options)

#### Defined in

base/GeomObject.ts:5

## Accessors

### centerPoint

• `get` **centerPoint**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

Circle.ts:63

• `set` **centerPoint**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`default`](Point.default.md) |

#### Returns

`void`

#### Defined in

Circle.ts:66

___

### cx

• `get` **cx**(): `number`

#### Returns

`number`

#### Defined in

Circle.ts:49

• `set` **cx**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Circle.ts:52

___

### cy

• `get` **cy**(): `number`

#### Returns

`number`

#### Defined in

Circle.ts:56

• `set` **cy**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Circle.ts:59

___

### radius

• `get` **radius**(): `number`

#### Returns

`number`

#### Defined in

Circle.ts:42

• `set` **radius**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Circle.ts:45

## Methods

### apply

▸ **apply**(`transformation`): [`default`](base_GeomObject.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `transformation` | [`default`](transformation.default.md) |

#### Returns

[`default`](base_GeomObject.default.md)

#### Overrides

[default](base_GeomObject.default.md).[apply](base_GeomObject.default.md#apply)

#### Defined in

Circle.ts:362

___

### clone

▸ **clone**(): [`default`](base_GeomObject.default.md)

#### Returns

[`default`](base_GeomObject.default.md)

#### Overrides

[default](base_GeomObject.default.md).[clone](base_GeomObject.default.md#clone)

#### Defined in

Circle.ts:365

___

### getArcAngleBetween

▸ **getArcAngleBetween**(`p1`, `p2`, `clockwise?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `p1` | [`default`](Point.default.md) | `undefined` |
| `p2` | [`default`](Point.default.md) | `undefined` |
| `clockwise` | `boolean` | `false` |

#### Returns

`number`

#### Defined in

Circle.ts:114

___

### getArcLengthBetween

▸ **getArcLengthBetween**(`p1`, `p2`, `clockwise?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `p1` | [`default`](Point.default.md) | `undefined` |
| `p2` | [`default`](Point.default.md) | `undefined` |
| `clockwise` | `boolean` | `false` |

#### Returns

`number`

#### Defined in

Circle.ts:108

___

### getEccentricity

▸ **getEccentricity**(): `number`

#### Returns

`number`

#### Defined in

Circle.ts:74

___

### getExternallyTangentDataWithCircle

▸ **getExternallyTangentDataWithCircle**(`circle`): ``null`` \| { `line`: ``null`` \| [`default`](Line.default.md) ; `point`: [`default`](Point.default.md)  }

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

``null`` \| { `line`: ``null`` \| [`default`](Line.default.md) ; `point`: [`default`](Point.default.md)  }

#### Defined in

Circle.ts:187

___

### getGraphic

▸ **getGraphic**(`type`): ([`SvgDirective`](../modules/types_graphic.md#svgdirective) \| [`CanvasDirective`](../modules/types_graphic.md#canvasdirective))[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GraphicImplType`](../modules/types_graphic.md#graphicimpltype) |

#### Returns

([`SvgDirective`](../modules/types_graphic.md#svgdirective) \| [`CanvasDirective`](../modules/types_graphic.md#canvasdirective))[]

#### Overrides

[default](base_GeomObject.default.md).[getGraphic](base_GeomObject.default.md#getgraphic)

#### Defined in

Circle.ts:358

___

### getInscribedRegularPolygon

▸ **getInscribedRegularPolygon**(`sideCount`, `angle?`): [`default`](RegularPolygon.default.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `sideCount` | `number` | `undefined` |
| `angle` | `number` | `0` |

#### Returns

[`default`](RegularPolygon.default.md)

#### Defined in

Circle.ts:354

___

### getInternallyTangentDataWithCircle

▸ **getInternallyTangentDataWithCircle**(`circle`): `object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

`object`

#### Defined in

Circle.ts:178

___

### getIntersectionPointsWithCircle

▸ **getIntersectionPointsWithCircle**(`circle`): ``null`` \| [`default`](Point.default.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

``null`` \| [`default`](Point.default.md)[]

#### Defined in

Circle.ts:221

___

### getPerimeter

▸ **getPerimeter**(): `number`

#### Returns

`number`

#### Defined in

Circle.ts:104

___

### getPointAtAngle

▸ **getPointAtAngle**(`angle`): [`default`](Point.default.md)

获得圆上某个角度的点

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |

#### Returns

[`default`](Point.default.md)

#### Defined in

Circle.ts:83

___

### getTangentLineAtPoint

▸ **getTangentLineAtPoint**(`point`): ``null`` \| [`default`](Line.default.md)

若`点point`在`圆this`上，则求过`点point`的`圆this`的切线

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

``null`` \| [`default`](Line.default.md)

#### Defined in

Circle.ts:91

___

### getTangleLineDataWithPointOutside

▸ **getTangleLineDataWithPointOutside**(`point`): ``null`` \| `object`

若`点point`在`圆this`外，则求过`点point`的`圆this`的切线，一共有两个

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

``null`` \| `object`

#### Defined in

Circle.ts:139

___

### isExternallyTangentWithCircle

▸ **isExternallyTangentWithCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

`boolean`

#### Defined in

Circle.ts:174

___

### isInsideCircle

▸ **isInsideCircle**(`circle`): `boolean`

`圆this`是否在`圆circle`的内部，被circle包含

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

`boolean`

#### Defined in

Circle.ts:201

___

### isInternallyTangentWithCircle

▸ **isInternallyTangentWithCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

`boolean`

#### Defined in

Circle.ts:170

___

### isIntersectedWithCircle

▸ **isIntersectedWithCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

`boolean`

#### Defined in

Circle.ts:215

___

### isOrthogonalWithCircle

▸ **isOrthogonalWithCircle**(`circle`): `boolean`

是否与`圆this`正交，过其中一交点分别作两圆的切线，两切线夹角（圆的交角）为直角

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

`boolean`

#### Defined in

Circle.ts:238

___

### isOutsideCircle

▸ **isOutsideCircle**(`circle`): `boolean`

`圆this`是否在`圆circle`的外部，包含circle

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

`boolean`

#### Defined in

Circle.ts:211

___

### isSameAs

▸ **isSameAs**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

`boolean`

#### Defined in

Circle.ts:70

___

### isTangentWithCircle

▸ **isTangentWithCircle**(`circle`): `boolean`

`圆point`和`圆this`是否相切（内切、外切）

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`default`](Circle.default.md) |

#### Returns

`boolean`

#### Defined in

Circle.ts:167

___

### toArray

▸ **toArray**(): `number`[]

#### Returns

`number`[]

#### Overrides

[default](base_GeomObject.default.md).[toArray](base_GeomObject.default.md#toarray)

#### Defined in

Circle.ts:369

___

### toObject

▸ **toObject**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `cx` | `number` |
| `cy` | `number` |
| `radius` | `number` |

#### Overrides

[default](base_GeomObject.default.md).[toObject](base_GeomObject.default.md#toobject)

#### Defined in

Circle.ts:372

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[default](base_GeomObject.default.md).[toString](base_GeomObject.default.md#tostring)

#### Defined in

Circle.ts:375

___

### getCommonTangentCirclesOfTwoCirclesThroughPointNotOn

▸ `Static` **getCommonTangentCirclesOfTwoCirclesThroughPointNotOn**(`circle1`, `circle2`, `point`): ``null`` \| [`default`](Circle.default.md)[]

过不在两圆`circle1`和`circle2`上的一点`point`，求两圆的公切圆

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle1` | [`default`](Circle.default.md) |
| `circle2` | [`default`](Circle.default.md) |
| `point` | [`default`](Point.default.md) |

#### Returns

``null`` \| [`default`](Circle.default.md)[]

#### Defined in

Circle.ts:334

___

### getCommonTangentDataOfTwoCircles

▸ `Static` **getCommonTangentDataOfTwoCircles**(`circle1`, `circle2`): ``null`` \| { `line`: `any` ; `points`: `any`[]  }[]

获取`圆circle1`和`圆circle2`的公切线信息

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle1` | [`default`](Circle.default.md) |
| `circle2` | [`default`](Circle.default.md) |

#### Returns

``null`` \| { `line`: `any` ; `points`: `any`[]  }[]

#### Defined in

Circle.ts:255

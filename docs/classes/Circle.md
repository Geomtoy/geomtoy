[Geomtoy](../README.md) / [Modules](../modules.md) / Circle

# Class: Circle

## Hierarchy

- [`GeomObject`](GeomObject.md)

  ↳ **`Circle`**

## Table of contents

### Constructors

- [constructor](Circle.md#constructor)

### Accessors

- [name](Circle.md#name)
- [uuid](Circle.md#uuid)
- [radius](Circle.md#radius)
- [centerX](Circle.md#centerx)
- [centerY](Circle.md#centery)
- [centerCoordinate](Circle.md#centercoordinate)
- [centerPoint](Circle.md#centerpoint)

### Methods

- [isSameAs](Circle.md#issameas)
- [isConcentricWithCircle](Circle.md#isconcentricwithcircle)
- [isIntersectedWithCircle](Circle.md#isintersectedwithcircle)
- [isInternallyTangentToCircle](Circle.md#isinternallytangenttocircle)
- [isExternallyTangentToCircle](Circle.md#isexternallytangenttocircle)
- [isTangentToCircle](Circle.md#istangenttocircle)
- [isWrappingOutsideCircle](Circle.md#iswrappingoutsidecircle)
- [isWrappedInsideCircle](Circle.md#iswrappedinsidecircle)
- [isSeparatedFromCircle](Circle.md#isseparatedfromcircle)
- [getEccentricity](Circle.md#geteccentricity)
- [getPerimeter](Circle.md#getperimeter)
- [getArea](Circle.md#getarea)
- [getPointAtAngle](Circle.md#getpointatangle)
- [getAngleOfPoint](Circle.md#getangleofpoint)
- [getArcAngleBetweenPoints](Circle.md#getarcanglebetweenpoints)
- [getArcLengthBetweenPoints](Circle.md#getarclengthbetweenpoints)
- [getTangentLineAtPoint](Circle.md#gettangentlineatpoint)
- [getTangentLineAtAngle](Circle.md#gettangentlineatangle)
- [getTangleLineDataWithPointOutside](Circle.md#gettanglelinedatawithpointoutside)
- [getInternallyTangentDataWithCircle](Circle.md#getinternallytangentdatawithcircle)
- [getExternallyTangentDataWithCircle](Circle.md#getexternallytangentdatawithcircle)
- [isInsideCircle](Circle.md#isinsidecircle)
- [isOutsideCircle](Circle.md#isoutsidecircle)
- [getIntersectionPointsWithCircle](Circle.md#getintersectionpointswithcircle)
- [isOrthogonalWithCircle](Circle.md#isorthogonalwithcircle)
- [getInscribedRegularPolygon](Circle.md#getinscribedregularpolygon)
- [getGraphic](Circle.md#getgraphic)
- [apply](Circle.md#apply)
- [clone](Circle.md#clone)
- [toArray](Circle.md#toarray)
- [toObject](Circle.md#toobject)
- [toString](Circle.md#tostring)
- [getCommonTangentDataOfTwoCircles](Circle.md#getcommontangentdataoftwocircles)
- [getCommonTangentCirclesOfTwoCirclesThroughPointNotOn](Circle.md#getcommontangentcirclesoftwocirclesthroughpointnoton)

## Constructors

### constructor

• **new Circle**(`radius`, `centerX`, `centerY`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `radius` | `number` |
| `centerX` | `number` |
| `centerY` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[constructor](GeomObject.md#constructor)

• **new Circle**(`radius`, `centerCoordinate`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `radius` | `number` |
| `centerCoordinate` | [`number`, `number`] |

#### Overrides

GeomObject.constructor

• **new Circle**(`radius`, `centerPoint`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `radius` | `number` |
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

### radius

• `get` **radius**(): `number`

#### Returns

`number`

• `set` **radius**(`value`): `void`

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

### isSameAs

▸ **isSameAs**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### isConcentricWithCircle

▸ **isConcentricWithCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### isIntersectedWithCircle

▸ **isIntersectedWithCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### isInternallyTangentToCircle

▸ **isInternallyTangentToCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### isExternallyTangentToCircle

▸ **isExternallyTangentToCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### isTangentToCircle

▸ **isTangentToCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### isWrappingOutsideCircle

▸ **isWrappingOutsideCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### isWrappedInsideCircle

▸ **isWrappedInsideCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### isSeparatedFromCircle

▸ **isSeparatedFromCircle**(`circle`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### getEccentricity

▸ **getEccentricity**(): `number`

#### Returns

`number`

___

### getPerimeter

▸ **getPerimeter**(): `number`

#### Returns

`number`

___

### getArea

▸ **getArea**(): `number`

#### Returns

`number`

___

### getPointAtAngle

▸ **getPointAtAngle**(`angle`): [`Point`](Point.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |

#### Returns

[`Point`](Point.md)

___

### getAngleOfPoint

▸ **getAngleOfPoint**(`point`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

`number`

___

### getArcAngleBetweenPoints

▸ **getArcAngleBetweenPoints**(`point1`, `point2`, `positive?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `point1` | [`Point`](Point.md) | `undefined` |
| `point2` | [`Point`](Point.md) | `undefined` |
| `positive` | `boolean` | `true` |

#### Returns

`number`

___

### getArcLengthBetweenPoints

▸ **getArcLengthBetweenPoints**(`point1`, `point2`, `positive?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `point1` | [`Point`](Point.md) | `undefined` |
| `point2` | [`Point`](Point.md) | `undefined` |
| `positive` | `boolean` | `true` |

#### Returns

`number`

___

### getTangentLineAtPoint

▸ **getTangentLineAtPoint**(`point`): ``null`` \| [`Line`](Line.md)

若`点point`在`圆this`上，则求过`点point`的`圆this`的切线

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

``null`` \| [`Line`](Line.md)

___

### getTangentLineAtAngle

▸ **getTangentLineAtAngle**(`angle`): [`Line`](Line.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |

#### Returns

[`Line`](Line.md)

___

### getTangleLineDataWithPointOutside

▸ **getTangleLineDataWithPointOutside**(`point`): ``null`` \| `object`

若`点point`在`圆this`外，则求过`点point`的`圆this`的切线，一共有两个

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

``null`` \| `object`

___

### getInternallyTangentDataWithCircle

▸ **getInternallyTangentDataWithCircle**(`circle`): `object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`object`

___

### getExternallyTangentDataWithCircle

▸ **getExternallyTangentDataWithCircle**(`circle`): ``null`` \| { `point`: [`Point`](Point.md) ; `line`: ``null`` \| [`Line`](Line.md)  }

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

``null`` \| { `point`: [`Point`](Point.md) ; `line`: ``null`` \| [`Line`](Line.md)  }

___

### isInsideCircle

▸ **isInsideCircle**(`circle`): `boolean`

`圆this`是否在`圆circle`的内部，被circle包含

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### isOutsideCircle

▸ **isOutsideCircle**(`circle`): `boolean`

`圆this`是否在`圆circle`的外部，包含circle

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### getIntersectionPointsWithCircle

▸ **getIntersectionPointsWithCircle**(`circle`): ``null`` \| [`Point`](Point.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

``null`` \| [`Point`](Point.md)[]

___

### isOrthogonalWithCircle

▸ **isOrthogonalWithCircle**(`circle`): `boolean`

是否与`圆this`正交，过其中一交点分别作两圆的切线，两切线夹角（圆的交角）为直角

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle` | [`Circle`](Circle.md) |

#### Returns

`boolean`

___

### getInscribedRegularPolygon

▸ **getInscribedRegularPolygon**(`sideCount`, `angle?`): [`RegularPolygon`](RegularPolygon.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `sideCount` | `number` | `undefined` |
| `angle` | `number` | `0` |

#### Returns

[`RegularPolygon`](RegularPolygon.md)

___

### getGraphic

▸ **getGraphic**(`type`): ([`SvgDirective`](../modules.md#svgdirective) \| [`CanvasDirective`](../modules.md#canvasdirective))[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GraphicImplType`](../modules.md#graphicimpltype) |

#### Returns

([`SvgDirective`](../modules.md#svgdirective) \| [`CanvasDirective`](../modules.md#canvasdirective))[]

___

### apply

▸ **apply**(`transformation`): [`GeomObject`](GeomObject.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `transformation` | [`Transformation`](Transformation.md) |

#### Returns

[`GeomObject`](GeomObject.md)

___

### clone

▸ **clone**(): [`Circle`](Circle.md)

#### Returns

[`Circle`](Circle.md)

#### Overrides

[GeomObject](GeomObject.md).[clone](GeomObject.md#clone)

___

### toArray

▸ **toArray**(): `number`[]

#### Returns

`number`[]

#### Overrides

[GeomObject](GeomObject.md).[toArray](GeomObject.md#toarray)

___

### toObject

▸ **toObject**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `radius` | `number` |
| `centerX` | `number` |
| `centerY` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[toObject](GeomObject.md#toobject)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[GeomObject](GeomObject.md).[toString](GeomObject.md#tostring)

___

### getCommonTangentDataOfTwoCircles

▸ `Static` **getCommonTangentDataOfTwoCircles**(`circle1`, `circle2`): ``null`` \| { `line`: `any` ; `points`: `any`[]  }[]

获取`圆circle1`和`圆circle2`的公切线信息

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle1` | [`Circle`](Circle.md) |
| `circle2` | [`Circle`](Circle.md) |

#### Returns

``null`` \| { `line`: `any` ; `points`: `any`[]  }[]

___

### getCommonTangentCirclesOfTwoCirclesThroughPointNotOn

▸ `Static` **getCommonTangentCirclesOfTwoCirclesThroughPointNotOn**(`circle1`, `circle2`, `point`): ``null`` \| [`Circle`](Circle.md)[]

过不在两圆`circle1`和`circle2`上的一点`point`，求两圆的公切圆

#### Parameters

| Name | Type |
| :------ | :------ |
| `circle1` | [`Circle`](Circle.md) |
| `circle2` | [`Circle`](Circle.md) |
| `point` | [`Point`](Point.md) |

#### Returns

``null`` \| [`Circle`](Circle.md)[]

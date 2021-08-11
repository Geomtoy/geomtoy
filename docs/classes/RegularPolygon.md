[Geomtoy](../README.md) / [Modules](../modules.md) / RegularPolygon

# Class: RegularPolygon

## Hierarchy

- [`GeomObject`](GeomObject.md)

  ↳ **`RegularPolygon`**

## Implements

- [`AreaMeasurable`](../interfaces/AreaMeasurable.md)

## Table of contents

### Constructors

- [constructor](RegularPolygon.md#constructor)

### Accessors

- [centerX](RegularPolygon.md#centerx)
- [centerY](RegularPolygon.md#centery)
- [centerCoordinate](RegularPolygon.md#centercoordinate)
- [centerPoint](RegularPolygon.md#centerpoint)
- [radius](RegularPolygon.md#radius)
- [sideCount](RegularPolygon.md#sidecount)
- [rotation](RegularPolygon.md#rotation)
- [apothem](RegularPolygon.md#apothem)
- [sideLength](RegularPolygon.md#sidelength)
- [centralAngle](RegularPolygon.md#centralangle)
- [interiorAngle](RegularPolygon.md#interiorangle)
- [sumOfInteriorAngle](RegularPolygon.md#sumofinteriorangle)
- [exteriorAngle](RegularPolygon.md#exteriorangle)
- [sumOfExteriorAngle](RegularPolygon.md#sumofexteriorangle)
- [diagonalCount](RegularPolygon.md#diagonalcount)

### Methods

- [getPoints](RegularPolygon.md#getpoints)
- [getLines](RegularPolygon.md#getlines)
- [getCircumscribedCircle](RegularPolygon.md#getcircumscribedcircle)
- [getInscribedCircle](RegularPolygon.md#getinscribedcircle)
- [getPerimeter](RegularPolygon.md#getperimeter)
- [getArea](RegularPolygon.md#getarea)
- [apply](RegularPolygon.md#apply)
- [clone](RegularPolygon.md#clone)
- [toString](RegularPolygon.md#tostring)
- [toObject](RegularPolygon.md#toobject)
- [toArray](RegularPolygon.md#toarray)
- [getGraphic](RegularPolygon.md#getgraphic)
- [fromApothemEtc](RegularPolygon.md#fromapothemetc)
- [fromSideLengthEtc](RegularPolygon.md#fromsidelengthetc)

## Constructors

### constructor

• **new RegularPolygon**(`radius`, `centerX`, `centerY`, `sideCount`, `rotation?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `radius` | `number` |
| `centerX` | `number` |
| `centerY` | `number` |
| `sideCount` | `number` |
| `rotation?` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[constructor](GeomObject.md#constructor)

• **new RegularPolygon**(`radius`, `centerCoordinate`, `sideCount`, `rotation?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `radius` | `number` |
| `centerCoordinate` | [`number`, `number`] |
| `sideCount` | `number` |
| `rotation?` | `number` |

#### Overrides

GeomObject.constructor

• **new RegularPolygon**(`radius`, `centerPosition`, `sideCount`, `rotation?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `radius` | `number` |
| `centerPosition` | [`Point`](Point.md) |
| `sideCount` | `number` |
| `rotation?` | `number` |

#### Overrides

GeomObject.constructor

## Accessors

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

### sideCount

• `get` **sideCount**(): `number`

#### Returns

`number`

• `set` **sideCount**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### rotation

• `get` **rotation**(): `number`

#### Returns

`number`

• `set` **rotation**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### apothem

• `get` **apothem**(): `number`

#### Returns

`number`

___

### sideLength

• `get` **sideLength**(): `number`

#### Returns

`number`

___

### centralAngle

• `get` **centralAngle**(): `number`

#### Returns

`number`

___

### interiorAngle

• `get` **interiorAngle**(): `number`

#### Returns

`number`

___

### sumOfInteriorAngle

• `get` **sumOfInteriorAngle**(): `number`

#### Returns

`number`

___

### exteriorAngle

• `get` **exteriorAngle**(): `number`

#### Returns

`number`

___

### sumOfExteriorAngle

• `get` **sumOfExteriorAngle**(): `number`

#### Returns

`number`

___

### diagonalCount

• `get` **diagonalCount**(): `number`

#### Returns

`number`

## Methods

### getPoints

▸ **getPoints**(): [`Point`](Point.md)[]

#### Returns

[`Point`](Point.md)[]

___

### getLines

▸ **getLines**(): [`Line`](Line.md)[]

#### Returns

[`Line`](Line.md)[]

___

### getCircumscribedCircle

▸ **getCircumscribedCircle**(): [`Circle`](Circle.md)

#### Returns

[`Circle`](Circle.md)

___

### getInscribedCircle

▸ **getInscribedCircle**(): [`Circle`](Circle.md)

#### Returns

[`Circle`](Circle.md)

___

### getPerimeter

▸ **getPerimeter**(): `number`

#### Returns

`number`

#### Implementation of

[AreaMeasurable](../interfaces/AreaMeasurable.md).[getPerimeter](../interfaces/AreaMeasurable.md#getperimeter)

___

### getArea

▸ **getArea**(): `number`

#### Returns

`number`

#### Implementation of

[AreaMeasurable](../interfaces/AreaMeasurable.md).[getArea](../interfaces/AreaMeasurable.md#getarea)

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

▸ **clone**(): [`RegularPolygon`](RegularPolygon.md)

#### Returns

[`RegularPolygon`](RegularPolygon.md)

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

### fromApothemEtc

▸ `Static` **fromApothemEtc**(`apothem`, `centerPoint`, `sideCount`, `rotation?`): [`RegularPolygon`](RegularPolygon.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `apothem` | `number` | `undefined` |
| `centerPoint` | [`Point`](Point.md) | `undefined` |
| `sideCount` | `number` | `undefined` |
| `rotation` | `number` | `0` |

#### Returns

[`RegularPolygon`](RegularPolygon.md)

___

### fromSideLengthEtc

▸ `Static` **fromSideLengthEtc**(`sideLength`, `centerPoint`, `sideCount`, `rotation?`): [`RegularPolygon`](RegularPolygon.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `sideLength` | `number` | `undefined` |
| `centerPoint` | [`Point`](Point.md) | `undefined` |
| `sideCount` | `number` | `undefined` |
| `rotation` | `number` | `0` |

#### Returns

[`RegularPolygon`](RegularPolygon.md)

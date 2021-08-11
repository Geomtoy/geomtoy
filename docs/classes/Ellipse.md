[Geomtoy](../README.md) / [Modules](../modules.md) / Ellipse

# Class: Ellipse

## Hierarchy

- [`GeomObject`](GeomObject.md)

  ↳ **`Ellipse`**

## Implements

- [`AreaMeasurable`](../interfaces/AreaMeasurable.md)

## Table of contents

### Constructors

- [constructor](Ellipse.md#constructor)

### Accessors

- [name](Ellipse.md#name)
- [uuid](Ellipse.md#uuid)
- [centerX](Ellipse.md#centerx)
- [centerY](Ellipse.md#centery)
- [centerCoordinate](Ellipse.md#centercoordinate)
- [centerPoint](Ellipse.md#centerpoint)
- [radiusX](Ellipse.md#radiusx)
- [radiusY](Ellipse.md#radiusy)
- [rotation](Ellipse.md#rotation)

### Methods

- [getEccentricity](Ellipse.md#geteccentricity)
- [clone](Ellipse.md#clone)
- [toString](Ellipse.md#tostring)
- [toObject](Ellipse.md#toobject)
- [toArray](Ellipse.md#toarray)
- [getGraphic](Ellipse.md#getgraphic)
- [apply](Ellipse.md#apply)
- [getPerimeter](Ellipse.md#getperimeter)
- [getArea](Ellipse.md#getarea)
- [getGraphicAlt](Ellipse.md#getgraphicalt)
- [findTangentLineOfTwoEllipse](Ellipse.md#findtangentlineoftwoellipse)
- [findTangentLineOfEllipseAndParabola](Ellipse.md#findtangentlineofellipseandparabola)

## Constructors

### constructor

• **new Ellipse**(`centerX`, `centerY`, `radiusX`, `radiusY`, `rotation?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `centerX` | `number` |
| `centerY` | `number` |
| `radiusX` | `number` |
| `radiusY` | `number` |
| `rotation?` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[constructor](GeomObject.md#constructor)

• **new Ellipse**(`centerCoordinate`, `radiusX`, `radiusY`, `rotation?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `centerCoordinate` | [`number`, `number`] |
| `radiusX` | `number` |
| `radiusY` | `number` |
| `rotation?` | `number` |

#### Overrides

GeomObject.constructor

• **new Ellipse**(`centerPoint`, `radiusX`, `radiusY`, `rotation?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `centerPoint` | [`Point`](Point.md) |
| `radiusX` | `number` |
| `radiusY` | `number` |
| `rotation?` | `number` |

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

### radiusX

• `get` **radiusX**(): `number`

#### Returns

`number`

• `set` **radiusX**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### radiusY

• `get` **radiusY**(): `number`

#### Returns

`number`

• `set` **radiusY**(`value`): `void`

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

## Methods

### getEccentricity

▸ **getEccentricity**(): `void`

#### Returns

`void`

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

### apply

▸ **apply**(`transformation`): [`GeomObject`](GeomObject.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `transformation` | [`Transformation`](Transformation.md) |

#### Returns

[`GeomObject`](GeomObject.md)

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

### getGraphicAlt

▸ **getGraphicAlt**(`type`): ([`SvgDirective`](../modules.md#svgdirective) \| [`CanvasDirective`](../modules.md#canvasdirective))[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GraphicImplType`](../modules.md#graphicimpltype) |

#### Returns

([`SvgDirective`](../modules.md#svgdirective) \| [`CanvasDirective`](../modules.md#canvasdirective))[]

___

### findTangentLineOfTwoEllipse

▸ `Static` **findTangentLineOfTwoEllipse**(`ellipse1`, `ellipse2`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ellipse1` | [`Ellipse`](Ellipse.md) |
| `ellipse2` | [`Ellipse`](Ellipse.md) |

#### Returns

`void`

___

### findTangentLineOfEllipseAndParabola

▸ `Static` **findTangentLineOfEllipseAndParabola**(): `void`

#### Returns

`void`

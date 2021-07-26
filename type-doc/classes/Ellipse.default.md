[geomtoy](../README.md) / [Exports](../modules.md) / [Ellipse](../modules/Ellipse.md) / default

# Class: default

[Ellipse](../modules/Ellipse.md).default

## Hierarchy

- [`default`](base_GeomObject.default.md)

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](Ellipse.default.md#constructor)

### Properties

- [options](Ellipse.default.md#options)

### Accessors

- [centerPoint](Ellipse.default.md#centerpoint)
- [radiusX](Ellipse.default.md#radiusx)
- [radiusY](Ellipse.default.md#radiusy)
- [rotation](Ellipse.default.md#rotation)

### Methods

- [apply](Ellipse.default.md#apply)
- [clone](Ellipse.default.md#clone)
- [getEccentricity](Ellipse.default.md#geteccentricity)
- [getGraphic](Ellipse.default.md#getgraphic)
- [getGraphicAlt](Ellipse.default.md#getgraphicalt)
- [toArray](Ellipse.default.md#toarray)
- [toObject](Ellipse.default.md#toobject)
- [toString](Ellipse.default.md#tostring)
- [findTangentLineOfEllipseAndParabola](Ellipse.default.md#findtangentlineofellipseandparabola)
- [findTangentLineOfTwoEllipse](Ellipse.default.md#findtangentlineoftwoellipse)

## Constructors

### constructor

• **new default**(`centerPosition`, `radiusX`, `radiusY`, `rotation`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `centerPosition` | [`default`](Point.default.md) \| [`Coordinate`](../modules/types.md#coordinate) \| [`default`](Vector.default.md) |
| `radiusX` | `number` |
| `radiusY` | `number` |
| `rotation` | `number` |

#### Overrides

[default](base_GeomObject.default.md).[constructor](base_GeomObject.default.md#constructor)

#### Defined in

Ellipse.ts:19

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

Ellipse.ts:34

• `set` **centerPoint**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`default`](Point.default.md) |

#### Returns

`void`

#### Defined in

Ellipse.ts:37

___

### radiusX

• `get` **radiusX**(): `number`

#### Returns

`number`

#### Defined in

Ellipse.ts:41

• `set` **radiusX**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Ellipse.ts:44

___

### radiusY

• `get` **radiusY**(): `number`

#### Returns

`number`

#### Defined in

Ellipse.ts:48

• `set` **radiusY**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Ellipse.ts:51

___

### rotation

• `get` **rotation**(): `number`

#### Returns

`number`

#### Defined in

Ellipse.ts:55

• `set` **rotation**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Ellipse.ts:58

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

Ellipse.ts:103

___

### clone

▸ **clone**(): [`default`](base_GeomObject.default.md)

#### Returns

[`default`](base_GeomObject.default.md)

#### Overrides

[default](base_GeomObject.default.md).[clone](base_GeomObject.default.md#clone)

#### Defined in

Ellipse.ts:69

___

### getEccentricity

▸ **getEccentricity**(): `void`

#### Returns

`void`

#### Defined in

Ellipse.ts:63

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

Ellipse.ts:83

___

### getGraphicAlt

▸ **getGraphicAlt**(`type`): ([`SvgDirective`](../modules/types_graphic.md#svgdirective) \| [`CanvasDirective`](../modules/types_graphic.md#canvasdirective))[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GraphicImplType`](../modules/types_graphic.md#graphicimpltype) |

#### Returns

([`SvgDirective`](../modules/types_graphic.md#svgdirective) \| [`CanvasDirective`](../modules/types_graphic.md#canvasdirective))[]

#### Defined in

Ellipse.ts:108

___

### toArray

▸ **toArray**(): `any`[]

#### Returns

`any`[]

#### Overrides

[default](base_GeomObject.default.md).[toArray](base_GeomObject.default.md#toarray)

#### Defined in

Ellipse.ts:78

___

### toObject

▸ **toObject**(): `object`

#### Returns

`object`

#### Overrides

[default](base_GeomObject.default.md).[toObject](base_GeomObject.default.md#toobject)

#### Defined in

Ellipse.ts:75

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[default](base_GeomObject.default.md).[toString](base_GeomObject.default.md#tostring)

#### Defined in

Ellipse.ts:72

___

### findTangentLineOfEllipseAndParabola

▸ `Static` **findTangentLineOfEllipseAndParabola**(): `void`

#### Returns

`void`

#### Defined in

Ellipse.ts:101

___

### findTangentLineOfTwoEllipse

▸ `Static` **findTangentLineOfTwoEllipse**(`ellipse1`, `ellipse2`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ellipse1` | [`default`](Ellipse.default.md) |
| `ellipse2` | [`default`](Ellipse.default.md) |

#### Returns

`void`

#### Defined in

Ellipse.ts:96

[geomtoy](../README.md) / [Exports](../modules.md) / [Triangle](../modules/Triangle.md) / default

# Class: default

[Triangle](../modules/Triangle.md).default

## Hierarchy

- [`default`](base_GeomObject.default.md)

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](Triangle.default.md#constructor)

### Properties

- [options](Triangle.default.md#options)

### Accessors

- [point1](Triangle.default.md#point1)
- [point2](Triangle.default.md#point2)
- [point3](Triangle.default.md#point3)

### Methods

- [apply](Triangle.default.md#apply)
- [clone](Triangle.default.md#clone)
- [getArea](Triangle.default.md#getarea)
- [getCentroidPoint](Triangle.default.md#getcentroidpoint)
- [getCircumscribedCircle](Triangle.default.md#getcircumscribedcircle)
- [getCircumscribedCircleCenterPoint](Triangle.default.md#getcircumscribedcirclecenterpoint)
- [getEscribedCircles](Triangle.default.md#getescribedcircles)
- [getGraphic](Triangle.default.md#getgraphic)
- [getInscribedCircle](Triangle.default.md#getinscribedcircle)
- [getOrthoCenterPoint](Triangle.default.md#getorthocenterpoint)
- [toArray](Triangle.default.md#toarray)
- [toObject](Triangle.default.md#toobject)
- [toString](Triangle.default.md#tostring)

## Constructors

### constructor

• **new default**(`point1Position`, `point2Position`, `point3Position`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1Position` | [`default`](Point.default.md) \| [`Coordinate`](../modules/types.md#coordinate) |
| `point2Position` | [`default`](Point.default.md) \| [`Coordinate`](../modules/types.md#coordinate) |
| `point3Position` | [`default`](Point.default.md) \| [`Coordinate`](../modules/types.md#coordinate) |

#### Overrides

[default](base_GeomObject.default.md).[constructor](base_GeomObject.default.md#constructor)

#### Defined in

Triangle.ts:15

## Properties

### options

• **options**: [`Options`](../modules/types.md#options)

#### Inherited from

[default](base_GeomObject.default.md).[options](base_GeomObject.default.md#options)

#### Defined in

base/GeomObject.ts:5

## Accessors

### point1

• `get` **point1**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

Triangle.ts:33

• `set` **point1**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`default`](Point.default.md) |

#### Returns

`void`

#### Defined in

Triangle.ts:36

___

### point2

• `get` **point2**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

Triangle.ts:40

• `set` **point2**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`default`](Point.default.md) |

#### Returns

`void`

#### Defined in

Triangle.ts:43

___

### point3

• `get` **point3**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

Triangle.ts:47

• `set` **point3**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`default`](Point.default.md) |

#### Returns

`void`

#### Defined in

Triangle.ts:50

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

Triangle.ts:123

___

### clone

▸ **clone**(): [`default`](base_GeomObject.default.md)

#### Returns

[`default`](base_GeomObject.default.md)

#### Overrides

[default](base_GeomObject.default.md).[clone](base_GeomObject.default.md#clone)

#### Defined in

Triangle.ts:126

___

### getArea

▸ **getArea**(`signed?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `signed` | `boolean` | `false` |

#### Returns

`number`

#### Defined in

Triangle.ts:75

___

### getCentroidPoint

▸ **getCentroidPoint**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

Triangle.ts:83

___

### getCircumscribedCircle

▸ **getCircumscribedCircle**(): `void`

#### Returns

`void`

#### Defined in

Triangle.ts:73

___

### getCircumscribedCircleCenterPoint

▸ **getCircumscribedCircleCenterPoint**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

Triangle.ts:91

___

### getEscribedCircles

▸ **getEscribedCircles**(): `void`

#### Returns

`void`

#### Defined in

Triangle.ts:71

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

Triangle.ts:138

___

### getInscribedCircle

▸ **getInscribedCircle**(): [`default`](Circle.default.md)

#### Returns

[`default`](Circle.default.md)

#### Defined in

Triangle.ts:55

___

### getOrthoCenterPoint

▸ **getOrthoCenterPoint**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

Triangle.ts:107

___

### toArray

▸ **toArray**(): `any`[]

#### Returns

`any`[]

#### Overrides

[default](base_GeomObject.default.md).[toArray](base_GeomObject.default.md#toarray)

#### Defined in

Triangle.ts:135

___

### toObject

▸ **toObject**(): `object`

#### Returns

`object`

#### Overrides

[default](base_GeomObject.default.md).[toObject](base_GeomObject.default.md#toobject)

#### Defined in

Triangle.ts:132

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[default](base_GeomObject.default.md).[toString](base_GeomObject.default.md#tostring)

#### Defined in

Triangle.ts:129

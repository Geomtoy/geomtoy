[Geomtoy](../README.md) / [Modules](../modules.md) / Triangle

# Class: Triangle

## Hierarchy

- [`GeomObject`](GeomObject.md)

  ↳ **`Triangle`**

## Table of contents

### Constructors

- [constructor](Triangle.md#constructor)

### Accessors

- [name](Triangle.md#name)
- [uuid](Triangle.md#uuid)
- [point1X](Triangle.md#point1x)
- [point1Y](Triangle.md#point1y)
- [point1Coordinate](Triangle.md#point1coordinate)
- [point1](Triangle.md#point1)
- [point2X](Triangle.md#point2x)
- [point2Y](Triangle.md#point2y)
- [point2Coordinate](Triangle.md#point2coordinate)
- [point2](Triangle.md#point2)
- [point3X](Triangle.md#point3x)
- [point3Y](Triangle.md#point3y)
- [point3Coordinate](Triangle.md#point3coordinate)
- [point3](Triangle.md#point3)

### Methods

- [getInscribedCircle](Triangle.md#getinscribedcircle)
- [getEscribedCircles](Triangle.md#getescribedcircles)
- [getCircumscribedCircle](Triangle.md#getcircumscribedcircle)
- [getArea](Triangle.md#getarea)
- [getCentroidPoint](Triangle.md#getcentroidpoint)
- [getCircumscribedCircleCenterPoint](Triangle.md#getcircumscribedcirclecenterpoint)
- [getOrthoCenterPoint](Triangle.md#getorthocenterpoint)
- [apply](Triangle.md#apply)
- [clone](Triangle.md#clone)
- [toString](Triangle.md#tostring)
- [toObject](Triangle.md#toobject)
- [toArray](Triangle.md#toarray)
- [getGraphic](Triangle.md#getgraphic)

## Constructors

### constructor

• **new Triangle**(`point1X`, `point1Y`, `point2X`, `point2Y`, `point3X`, `point3Y`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1X` | `number` |
| `point1Y` | `number` |
| `point2X` | `number` |
| `point2Y` | `number` |
| `point3X` | `number` |
| `point3Y` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[constructor](GeomObject.md#constructor)

• **new Triangle**(`point1Coordinate`, `point2Coordinate`, `point3Coordinate`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1Coordinate` | [`number`, `number`] |
| `point2Coordinate` | [`number`, `number`] |
| `point3Coordinate` | [`number`, `number`] |

#### Overrides

GeomObject.constructor

• **new Triangle**(`point1`, `point2`, `point3`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1` | [`Point`](Point.md) |
| `point2` | [`Point`](Point.md) |
| `point3` | [`Point`](Point.md) |

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

### point1X

• `get` **point1X**(): `number`

#### Returns

`number`

• `set` **point1X**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### point1Y

• `get` **point1Y**(): `number`

#### Returns

`number`

• `set` **point1Y**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### point1Coordinate

• `get` **point1Coordinate**(): [`number`, `number`]

#### Returns

[`number`, `number`]

• `set` **point1Coordinate**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`number`, `number`] |

#### Returns

`void`

___

### point1

• `get` **point1**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

• `set` **point1**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`Point`](Point.md) |

#### Returns

`void`

___

### point2X

• `get` **point2X**(): `number`

#### Returns

`number`

• `set` **point2X**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### point2Y

• `get` **point2Y**(): `number`

#### Returns

`number`

• `set` **point2Y**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### point2Coordinate

• `get` **point2Coordinate**(): [`number`, `number`]

#### Returns

[`number`, `number`]

• `set` **point2Coordinate**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`number`, `number`] |

#### Returns

`void`

___

### point2

• `get` **point2**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

• `set` **point2**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`Point`](Point.md) |

#### Returns

`void`

___

### point3X

• `get` **point3X**(): `number`

#### Returns

`number`

• `set` **point3X**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### point3Y

• `get` **point3Y**(): `number`

#### Returns

`number`

• `set` **point3Y**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### point3Coordinate

• `get` **point3Coordinate**(): [`number`, `number`]

#### Returns

[`number`, `number`]

• `set` **point3Coordinate**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`number`, `number`] |

#### Returns

`void`

___

### point3

• `get` **point3**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

• `set` **point3**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`Point`](Point.md) |

#### Returns

`void`

## Methods

### getInscribedCircle

▸ **getInscribedCircle**(): [`Circle`](Circle.md)

#### Returns

[`Circle`](Circle.md)

___

### getEscribedCircles

▸ **getEscribedCircles**(): `void`

#### Returns

`void`

___

### getCircumscribedCircle

▸ **getCircumscribedCircle**(): `void`

#### Returns

`void`

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

### getCentroidPoint

▸ **getCentroidPoint**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

___

### getCircumscribedCircleCenterPoint

▸ **getCircumscribedCircleCenterPoint**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

___

### getOrthoCenterPoint

▸ **getOrthoCenterPoint**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

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

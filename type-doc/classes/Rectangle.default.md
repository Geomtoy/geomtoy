[geomtoy](../README.md) / [Exports](../modules.md) / [Rectangle](../modules/Rectangle.md) / default

# Class: default

[Rectangle](../modules/Rectangle.md).default

## Hierarchy

- [`default`](base_GeomObject.default.md)

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](Rectangle.default.md#constructor)

### Properties

- [options](Rectangle.default.md#options)

### Accessors

- [height](Rectangle.default.md#height)
- [originPoint](Rectangle.default.md#originpoint)
- [size](Rectangle.default.md#size)
- [width](Rectangle.default.md#width)
- [x](Rectangle.default.md#x)
- [y](Rectangle.default.md#y)

### Methods

- [apply](Rectangle.default.md#apply)
- [clone](Rectangle.default.md#clone)
- [getBounding](Rectangle.default.md#getbounding)
- [getCornerPoint](Rectangle.default.md#getcornerpoint)
- [getGraphic](Rectangle.default.md#getgraphic)
- [inflate](Rectangle.default.md#inflate)
- [inflateSelf](Rectangle.default.md#inflateself)
- [move](Rectangle.default.md#move)
- [moveSelf](Rectangle.default.md#moveself)
- [toArray](Rectangle.default.md#toarray)
- [toObject](Rectangle.default.md#toobject)
- [toString](Rectangle.default.md#tostring)
- [fromPoints](Rectangle.default.md#frompoints)

## Constructors

### constructor

• **new default**(`x`, `y`, `width`, `height`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |
| `width` | `number` |
| `height` | `number` |

#### Overrides

[default](base_GeomObject.default.md).[constructor](base_GeomObject.default.md#constructor)

#### Defined in

Rectangle.ts:15

• **new default**(`x`, `y`, `size`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |
| `size` | [`Size`](../modules/types.md#size) |

#### Overrides

GeomObject.constructor

#### Defined in

Rectangle.ts:16

• **new default**(`position`, `width`, `height`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `position` | [`default`](Point.default.md) \| [`Coordinate`](../modules/types.md#coordinate) |
| `width` | `number` |
| `height` | `number` |

#### Overrides

GeomObject.constructor

#### Defined in

Rectangle.ts:17

• **new default**(`position`, `size`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `position` | [`default`](Point.default.md) \| [`Coordinate`](../modules/types.md#coordinate) |
| `size` | [`Size`](../modules/types.md#size) |

#### Overrides

GeomObject.constructor

#### Defined in

Rectangle.ts:18

## Properties

### options

• **options**: [`Options`](../modules/types.md#options)

#### Inherited from

[default](base_GeomObject.default.md).[options](base_GeomObject.default.md#options)

#### Defined in

base/GeomObject.ts:5

## Accessors

### height

• `get` **height**(): `number`

#### Returns

`number`

#### Defined in

Rectangle.ts:79

• `set` **height**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Rectangle.ts:82

___

### originPoint

• `get` **originPoint**(): [`default`](Point.default.md)

#### Returns

[`default`](Point.default.md)

#### Defined in

Rectangle.ts:51

• `set` **originPoint**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`default`](Point.default.md) |

#### Returns

`void`

#### Defined in

Rectangle.ts:54

___

### size

• `get` **size**(): [`Size`](../modules/types.md#size)

#### Returns

[`Size`](../modules/types.md#size)

#### Defined in

Rectangle.ts:86

• `set` **size**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`Size`](../modules/types.md#size) |

#### Returns

`void`

#### Defined in

Rectangle.ts:89

___

### width

• `get` **width**(): `number`

#### Returns

`number`

#### Defined in

Rectangle.ts:72

• `set` **width**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Rectangle.ts:75

___

### x

• `get` **x**(): `number`

#### Returns

`number`

#### Defined in

Rectangle.ts:58

• `set` **x**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Rectangle.ts:61

___

### y

• `get` **y**(): `number`

#### Returns

`number`

#### Defined in

Rectangle.ts:65

• `set` **y**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

#### Defined in

Rectangle.ts:68

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

Rectangle.ts:191

___

### clone

▸ **clone**(`withTransformation?`): [`default`](Rectangle.default.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `withTransformation` | `boolean` | `true` |

#### Returns

[`default`](Rectangle.default.md)

#### Overrides

[default](base_GeomObject.default.md).[clone](base_GeomObject.default.md#clone)

#### Defined in

Rectangle.ts:188

___

### getBounding

▸ **getBounding**(`side`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `side` | ``"left"`` \| ``"right"`` \| ``"top"`` \| ``"bottom"`` |

#### Returns

`number`

#### Defined in

Rectangle.ts:133

___

### getCornerPoint

▸ **getCornerPoint**(`corner`): [`default`](Point.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `corner` | ``"leftTop"`` \| ``"rightTop"`` \| ``"rightBottom"`` \| ``"leftBottom"`` |

#### Returns

[`default`](Point.default.md)

#### Defined in

Rectangle.ts:108

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

Rectangle.ts:195

___

### inflate

▸ **inflate**(`size`): [`default`](Rectangle.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `size` | [`Size`](../modules/types.md#size) |

#### Returns

[`default`](Rectangle.default.md)

#### Defined in

Rectangle.ts:168

___

### inflateSelf

▸ **inflateSelf**(`size`): [`default`](Rectangle.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `size` | [`Size`](../modules/types.md#size) |

#### Returns

[`default`](Rectangle.default.md)

#### Defined in

Rectangle.ts:171

___

### move

▸ **move**(`offsetX`, `offsetY`): [`default`](Rectangle.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `offsetX` | `number` |
| `offsetY` | `number` |

#### Returns

[`default`](Rectangle.default.md)

#### Defined in

Rectangle.ts:159

___

### moveSelf

▸ **moveSelf**(`offsetX`, `offsetY`): [`default`](Rectangle.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `offsetX` | `number` |
| `offsetY` | `number` |

#### Returns

[`default`](Rectangle.default.md)

#### Defined in

Rectangle.ts:162

___

### toArray

▸ **toArray**(): `any`[]

#### Returns

`any`[]

#### Overrides

[default](base_GeomObject.default.md).[toArray](base_GeomObject.default.md#toarray)

#### Defined in

Rectangle.ts:204

___

### toObject

▸ **toObject**(): `object`

#### Returns

`object`

#### Overrides

[default](base_GeomObject.default.md).[toObject](base_GeomObject.default.md#toobject)

#### Defined in

Rectangle.ts:201

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[default](base_GeomObject.default.md).[toString](base_GeomObject.default.md#tostring)

#### Defined in

Rectangle.ts:198

___

### fromPoints

▸ `Static` **fromPoints**(`point1`, `point2`): [`default`](Rectangle.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1` | [`default`](Point.default.md) |
| `point2` | [`default`](Point.default.md) |

#### Returns

[`default`](Rectangle.default.md)

#### Defined in

Rectangle.ts:94

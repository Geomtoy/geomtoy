[Geomtoy](../README.md) / [Modules](../modules.md) / Rectangle

# Class: Rectangle

## Hierarchy

- [`GeomObject`](GeomObject.md)

  ↳ **`Rectangle`**

## Table of contents

### Constructors

- [constructor](Rectangle.md#constructor)

### Accessors

- [name](Rectangle.md#name)
- [uuid](Rectangle.md#uuid)
- [originX](Rectangle.md#originx)
- [originY](Rectangle.md#originy)
- [originCoordinate](Rectangle.md#origincoordinate)
- [originPoint](Rectangle.md#originpoint)
- [width](Rectangle.md#width)
- [height](Rectangle.md#height)
- [size](Rectangle.md#size)

### Methods

- [getCornerPoint](Rectangle.md#getcornerpoint)
- [getBounding](Rectangle.md#getbounding)
- [move](Rectangle.md#move)
- [moveSelf](Rectangle.md#moveself)
- [inflate](Rectangle.md#inflate)
- [inflateSelf](Rectangle.md#inflateself)
- [clone](Rectangle.md#clone)
- [apply](Rectangle.md#apply)
- [getGraphic](Rectangle.md#getgraphic)
- [toString](Rectangle.md#tostring)
- [toObject](Rectangle.md#toobject)
- [toArray](Rectangle.md#toarray)
- [fromPoints](Rectangle.md#frompoints)

## Constructors

### constructor

• **new Rectangle**(`originX`, `originY`, `width`, `height`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `originX` | `number` |
| `originY` | `number` |
| `width` | `number` |
| `height` | `number` |

#### Overrides

[GeomObject](GeomObject.md).[constructor](GeomObject.md#constructor)

• **new Rectangle**(`originX`, `originY`, `size`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `originX` | `number` |
| `originY` | `number` |
| `size` | [`number`, `number`] |

#### Overrides

GeomObject.constructor

• **new Rectangle**(`originCoordinate`, `width`, `height`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `originCoordinate` | [`number`, `number`] |
| `width` | `number` |
| `height` | `number` |

#### Overrides

GeomObject.constructor

• **new Rectangle**(`originCoordinate`, `size`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `originCoordinate` | [`number`, `number`] |
| `size` | [`number`, `number`] |

#### Overrides

GeomObject.constructor

• **new Rectangle**(`originPoint`, `width`, `height`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `originPoint` | [`Point`](Point.md) |
| `width` | `number` |
| `height` | `number` |

#### Overrides

GeomObject.constructor

• **new Rectangle**(`originPoint`, `size`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `originPoint` | [`Point`](Point.md) |
| `size` | [`number`, `number`] |

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

### originX

• `get` **originX**(): `number`

#### Returns

`number`

• `set` **originX**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### originY

• `get` **originY**(): `number`

#### Returns

`number`

• `set` **originY**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### originCoordinate

• `get` **originCoordinate**(): [`number`, `number`]

#### Returns

[`number`, `number`]

• `set` **originCoordinate**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`number`, `number`] |

#### Returns

`void`

___

### originPoint

• `get` **originPoint**(): [`Point`](Point.md)

#### Returns

[`Point`](Point.md)

• `set` **originPoint**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`Point`](Point.md) |

#### Returns

`void`

___

### width

• `get` **width**(): `number`

#### Returns

`number`

• `set` **width**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### height

• `get` **height**(): `number`

#### Returns

`number`

• `set` **height**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

`void`

___

### size

• `get` **size**(): [`number`, `number`]

#### Returns

[`number`, `number`]

• `set` **size**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`number`, `number`] |

#### Returns

`void`

## Methods

### getCornerPoint

▸ **getCornerPoint**(`corner`): [`Point`](Point.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `corner` | ``"leftTop"`` \| ``"rightTop"`` \| ``"rightBottom"`` \| ``"leftBottom"`` |

#### Returns

[`Point`](Point.md)

___

### getBounding

▸ **getBounding**(`side`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `side` | ``"left"`` \| ``"right"`` \| ``"top"`` \| ``"bottom"`` |

#### Returns

`number`

___

### move

▸ **move**(`offsetX`, `offsetY`): [`Rectangle`](Rectangle.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `offsetX` | `number` |
| `offsetY` | `number` |

#### Returns

[`Rectangle`](Rectangle.md)

___

### moveSelf

▸ **moveSelf**(`offsetX`, `offsetY`): [`Rectangle`](Rectangle.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `offsetX` | `number` |
| `offsetY` | `number` |

#### Returns

[`Rectangle`](Rectangle.md)

___

### inflate

▸ **inflate**(`size`): [`Rectangle`](Rectangle.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `size` | [`number`, `number`] |

#### Returns

[`Rectangle`](Rectangle.md)

___

### inflateSelf

▸ **inflateSelf**(`size`): [`Rectangle`](Rectangle.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `size` | [`number`, `number`] |

#### Returns

[`Rectangle`](Rectangle.md)

___

### clone

▸ **clone**(): [`Rectangle`](Rectangle.md)

#### Returns

[`Rectangle`](Rectangle.md)

#### Overrides

[GeomObject](GeomObject.md).[clone](GeomObject.md#clone)

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

### getGraphic

▸ **getGraphic**(`type`): ([`SvgDirective`](../modules.md#svgdirective) \| [`CanvasDirective`](../modules.md#canvasdirective))[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GraphicImplType`](../modules.md#graphicimpltype) |

#### Returns

([`SvgDirective`](../modules.md#svgdirective) \| [`CanvasDirective`](../modules.md#canvasdirective))[]

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

### fromPoints

▸ `Static` **fromPoints**(`point1`, `point2`): [`Rectangle`](Rectangle.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point1` | [`Point`](Point.md) |
| `point2` | [`Point`](Point.md) |

#### Returns

[`Rectangle`](Rectangle.md)

[geomtoy](../README.md) / [Exports](../modules.md) / [base/GeomObject](../modules/base_GeomObject.md) / default

# Class: default

[base/GeomObject](../modules/base_GeomObject.md).default

## Hierarchy

- **`default`**

  ↳ [`default`](Circle.default.md)

  ↳ [`default`](Ellipse.default.md)

  ↳ [`default`](Line.default.md)

  ↳ [`default`](Point.default.md)

  ↳ [`default`](Rectangle.default.md)

  ↳ [`default`](Triangle.default.md)

  ↳ [`default`](Vector.default.md)

## Table of contents

### Constructors

- [constructor](base_GeomObject.default.md#constructor)

### Properties

- [options](base_GeomObject.default.md#options)

### Methods

- [apply](base_GeomObject.default.md#apply)
- [clone](base_GeomObject.default.md#clone)
- [getGraphic](base_GeomObject.default.md#getgraphic)
- [toArray](base_GeomObject.default.md#toarray)
- [toObject](base_GeomObject.default.md#toobject)
- [toString](base_GeomObject.default.md#tostring)

## Constructors

### constructor

• **new default**()

## Properties

### options

• **options**: [`Options`](../modules/types.md#options)

#### Defined in

base/GeomObject.ts:5

## Methods

### apply

▸ `Abstract` **apply**(`transformation`): [`default`](base_GeomObject.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `transformation` | [`default`](transformation.default.md) |

#### Returns

[`default`](base_GeomObject.default.md)

#### Defined in

base/GeomObject.ts:7

___

### clone

▸ `Abstract` **clone**(): [`default`](base_GeomObject.default.md)

#### Returns

[`default`](base_GeomObject.default.md)

#### Defined in

base/GeomObject.ts:8

___

### getGraphic

▸ `Abstract` **getGraphic**(`type`): ([`SvgDirective`](../modules/types_graphic.md#svgdirective) \| [`CanvasDirective`](../modules/types_graphic.md#canvasdirective))[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GraphicImplType`](../modules/types_graphic.md#graphicimpltype) |

#### Returns

([`SvgDirective`](../modules/types_graphic.md#svgdirective) \| [`CanvasDirective`](../modules/types_graphic.md#canvasdirective))[]

#### Defined in

base/GeomObject.ts:13

___

### toArray

▸ `Abstract` **toArray**(): `any`[]

#### Returns

`any`[]

#### Defined in

base/GeomObject.ts:11

___

### toObject

▸ `Abstract` **toObject**(): `object`

#### Returns

`object`

#### Defined in

base/GeomObject.ts:10

___

### toString

▸ `Abstract` **toString**(): `string`

#### Returns

`string`

#### Defined in

base/GeomObject.ts:9

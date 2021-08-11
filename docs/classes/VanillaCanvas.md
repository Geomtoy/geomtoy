[Geomtoy](../README.md) / [Modules](../modules.md) / VanillaCanvas

# Class: VanillaCanvas

## Table of contents

### Constructors

- [constructor](VanillaCanvas.md#constructor)

### Properties

- [context](VanillaCanvas.md#context)
- [geomtoy](VanillaCanvas.md#geomtoy)

### Methods

- [setup](VanillaCanvas.md#setup)
- [draw](VanillaCanvas.md#draw)
- [clear](VanillaCanvas.md#clear)

## Constructors

### constructor

• **new VanillaCanvas**(`context`, `geomtoy`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | `any` |
| `geomtoy` | [`Geomtoy`](Geomtoy.md) |

## Properties

### context

• **context**: `CanvasRenderingContext2D` \| `OffscreenCanvasRenderingContext2D`

___

### geomtoy

• **geomtoy**: [`Geomtoy`](Geomtoy.md)

## Methods

### setup

▸ **setup**(): `void`

#### Returns

`void`

___

### draw

▸ **draw**(`object`): `CanvasRenderingContext2D` \| `OffscreenCanvasRenderingContext2D`

#### Parameters

| Name | Type |
| :------ | :------ |
| `object` | [`GeomObject`](GeomObject.md) & [`Visible`](../interfaces/Visible.md) |

#### Returns

`CanvasRenderingContext2D` \| `OffscreenCanvasRenderingContext2D`

___

### clear

▸ **clear**(): `CanvasRenderingContext2D` \| `OffscreenCanvasRenderingContext2D`

#### Returns

`CanvasRenderingContext2D` \| `OffscreenCanvasRenderingContext2D`

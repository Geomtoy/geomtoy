[Geomtoy](../README.md) / [Modules](../modules.md) / Transformation

# Class: Transformation

## Table of contents

### Constructors

- [constructor](Transformation.md#constructor)

### Methods

- [get](Transformation.md#get)
- [set](Transformation.md#set)
- [translate](Transformation.md#translate)
- [rotate](Transformation.md#rotate)
- [scale](Transformation.md#scale)
- [skew](Transformation.md#skew)
- [lineReflect](Transformation.md#linereflect)
- [pointReflect](Transformation.md#pointreflect)
- [transform](Transformation.md#transform)

## Constructors

### constructor

• **new Transformation**()

## Methods

### get

▸ **get**(): `Matrix`

#### Returns

`Matrix`

___

### set

▸ **set**(`transformation`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `transformation` | `Matrix` |

#### Returns

`void`

___

### translate

▸ **translate**(`deltaX`, `deltaY`): [`Transformation`](Transformation.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `deltaX` | `number` |
| `deltaY` | `number` |

#### Returns

[`Transformation`](Transformation.md)

___

### rotate

▸ **rotate**(`angle`, `origin`): [`Transformation`](Transformation.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |
| `origin` | [`Point`](Point.md) |

#### Returns

[`Transformation`](Transformation.md)

___

### scale

▸ **scale**(`factorX`, `factorY`, `origin`): [`Transformation`](Transformation.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `factorX` | `number` |
| `factorY` | `number` |
| `origin` | [`Point`](Point.md) |

#### Returns

[`Transformation`](Transformation.md)

___

### skew

▸ **skew**(`angleX`, `angleY`, `origin`): [`Transformation`](Transformation.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angleX` | `number` |
| `angleY` | `number` |
| `origin` | [`Point`](Point.md) |

#### Returns

[`Transformation`](Transformation.md)

___

### lineReflect

▸ **lineReflect**(`line`): [`Transformation`](Transformation.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`Line`](Line.md) |

#### Returns

[`Transformation`](Transformation.md)

___

### pointReflect

▸ **pointReflect**(`point`): [`Transformation`](Transformation.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`Point`](Point.md) |

#### Returns

[`Transformation`](Transformation.md)

___

### transform

▸ **transform**(`a`, `b`, `c`, `d`, `e`, `f`): [`Transformation`](Transformation.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number` |
| `b` | `number` |
| `c` | `number` |
| `d` | `number` |
| `e` | `number` |
| `f` | `number` |

#### Returns

[`Transformation`](Transformation.md)

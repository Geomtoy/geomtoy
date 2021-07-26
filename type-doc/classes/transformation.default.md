[geomtoy](../README.md) / [Exports](../modules.md) / [transformation](../modules/transformation.md) / default

# Class: default

[transformation](../modules/transformation.md).default

## Table of contents

### Constructors

- [constructor](transformation.default.md#constructor)

### Methods

- [get](transformation.default.md#get)
- [lineReflect](transformation.default.md#linereflect)
- [pointReflect](transformation.default.md#pointreflect)
- [rotate](transformation.default.md#rotate)
- [scale](transformation.default.md#scale)
- [set](transformation.default.md#set)
- [skew](transformation.default.md#skew)
- [transform](transformation.default.md#transform)
- [translate](transformation.default.md#translate)

## Constructors

### constructor

• **new default**()

## Methods

### get

▸ **get**(): [`default`](transformation_Matrix.default.md)

#### Returns

[`default`](transformation_Matrix.default.md)

#### Defined in

transformation/index.ts:14

___

### lineReflect

▸ **lineReflect**(`line`): [`default`](transformation.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `line` | [`default`](Line.default.md) |

#### Returns

[`default`](transformation.default.md)

#### Defined in

transformation/index.ts:45

___

### pointReflect

▸ **pointReflect**(`point`): [`default`](transformation.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | [`default`](Point.default.md) |

#### Returns

[`default`](transformation.default.md)

#### Defined in

transformation/index.ts:51

___

### rotate

▸ **rotate**(`angle`, `origin`): [`default`](transformation.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angle` | `number` |
| `origin` | [`default`](Point.default.md) |

#### Returns

[`default`](transformation.default.md)

#### Defined in

transformation/index.ts:27

___

### scale

▸ **scale**(`factorX`, `factorY`, `origin`): [`default`](transformation.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `factorX` | `number` |
| `factorY` | `number` |
| `origin` | [`default`](Point.default.md) |

#### Returns

[`default`](transformation.default.md)

#### Defined in

transformation/index.ts:33

___

### set

▸ **set**(`transformation`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `transformation` | [`default`](transformation_Matrix.default.md) |

#### Returns

`void`

#### Defined in

transformation/index.ts:17

___

### skew

▸ **skew**(`angleX`, `angleY`, `origin`): [`default`](transformation.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `angleX` | `number` |
| `angleY` | `number` |
| `origin` | [`default`](Point.default.md) |

#### Returns

[`default`](transformation.default.md)

#### Defined in

transformation/index.ts:39

___

### transform

▸ **transform**(`a`, `b`, `c`, `d`, `e`, `f`): [`default`](transformation.default.md)

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

[`default`](transformation.default.md)

#### Defined in

transformation/index.ts:57

___

### translate

▸ **translate**(`deltaX`, `deltaY`): [`default`](transformation.default.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `deltaX` | `number` |
| `deltaY` | `number` |

#### Returns

[`default`](transformation.default.md)

#### Defined in

transformation/index.ts:21

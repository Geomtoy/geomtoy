[geomtoy](../README.md) / [Exports](../modules.md) / decorator

# Module: decorator

## Table of contents

### Functions

- [is](decorator.md#is)
- [sealed](decorator.md#sealed)

## Functions

### is

▸ **is**(`type`): (`target`: `any`, `propertyKey`: `string`, `descriptor`: `PropertyDescriptor`) => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | ``"realNumber"`` \| ``"positiveNumber"`` \| ``"negativeNumber"`` \| ``"size"`` \| ``"boolean"`` \| ``"point"`` \| ``"line"`` \| ``"ellipse"`` |

#### Returns

`fn`

▸ (`target`, `propertyKey`, `descriptor`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `any` |
| `propertyKey` | `string` |
| `descriptor` | `PropertyDescriptor` |

##### Returns

`void`

#### Defined in

decorator/index.ts:14

___

### sealed

▸ **sealed**(`constructor`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `constructor` | (...`args`: `any`[]) => `any` |

#### Returns

`void`

#### Defined in

decorator/index.ts:6

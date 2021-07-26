[geomtoy](../README.md) / [Exports](../modules.md) / graphic/helper

# Module: graphic/helper

## Table of contents

### Functions

- [arcCenterToEndpointParameterization](graphic_helper.md#arccentertoendpointparameterization)
- [arcEndpointToCenterParameterization](graphic_helper.md#arcendpointtocenterparameterization)
- [correctRadii](graphic_helper.md#correctradii)

## Functions

### arcCenterToEndpointParameterization

▸ **arcCenterToEndpointParameterization**(`__namedParameters`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `largeArcFlag` | `boolean` |
| `rx` | `any` |
| `ry` | `any` |
| `sweepFlag` | `boolean` |
| `x1` | `any` |
| `x2` | `any` |
| `xAxisRotation` | `any` |
| `y1` | `any` |
| `y2` | `any` |

#### Defined in

graphic/helper.js:19

___

### arcEndpointToCenterParameterization

▸ **arcEndpointToCenterParameterization**(`__namedParameters`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `any` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `anticlockwise` | `boolean` |
| `cx` | `any` |
| `cy` | `any` |
| `endAngle` | `number` |
| `rx` | `any` |
| `ry` | `any` |
| `startAngle` | `number` |
| `xAxisRotation` | `any` |

#### Defined in

graphic/helper.js:59

___

### correctRadii

▸ **correctRadii**(`rx`, `ry`, `x1P`, `y1P`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `rx` | `any` |
| `ry` | `any` |
| `x1P` | `any` |
| `y1P` | `any` |

#### Returns

`any`[]

#### Defined in

graphic/helper.js:127

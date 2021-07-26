[geomtoy](../README.md) / [Exports](../modules.md) / [index](../modules/index.md) / default

# Class: default

[index](../modules/index.md).default

## Table of contents

### Constructors

- [constructor](index.default.md#constructor)

### Properties

- [height](index.default.md#height)
- [width](index.default.md#width)

### Accessors

- [Circle](index.default.md#circle)
- [Ellipse](index.default.md#ellipse)
- [Inversion](index.default.md#inversion)
- [Line](index.default.md#line)
- [Point](index.default.md#point)
- [Polygon](index.default.md#polygon)
- [Polyline](index.default.md#polyline)
- [Rectangle](index.default.md#rectangle)
- [RegularPolygon](index.default.md#regularpolygon)
- [Segment](index.default.md#segment)
- [Triangle](index.default.md#triangle)
- [Vector](index.default.md#vector)
- [options](index.default.md#options)

### Methods

- [getCoordinateSystem](index.default.md#getcoordinatesystem)
- [getGlobalTransformation](index.default.md#getglobaltransformation)
- [setCoordinateSystem](index.default.md#setcoordinatesystem)
- [setGlobalTransformation](index.default.md#setglobaltransformation)

## Constructors

### constructor

• **new default**(`width`, `height`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `width` | `number` |
| `height` | `number` |
| `options` | `object` |

#### Defined in

index.ts:32

## Properties

### height

• **height**: `number`

#### Defined in

index.ts:29

___

### width

• **width**: `number`

#### Defined in

index.ts:28

## Accessors

### Circle

• `get` **Circle**(): { `prototype`:   } & typeof [`default`](Circle.default.md)

#### Returns

{ `prototype`:   } & typeof [`default`](Circle.default.md)

#### Defined in

index.ts:64

___

### Ellipse

• `get` **Ellipse**(): { `prototype`:   } & typeof [`default`](Ellipse.default.md)

#### Returns

{ `prototype`:   } & typeof [`default`](Ellipse.default.md)

#### Defined in

index.ts:67

___

### Inversion

• `get` **Inversion**(): { `prototype`:   } & typeof [`default`](inversion_Inversion.default.md)

#### Returns

{ `prototype`:   } & typeof [`default`](inversion_Inversion.default.md)

#### Defined in

index.ts:79

___

### Line

• `get` **Line**(): { `prototype`:   } & typeof [`default`](Line.default.md)

#### Returns

{ `prototype`:   } & typeof [`default`](Line.default.md)

#### Defined in

index.ts:52

___

### Point

• `get` **Point**(): { `prototype`:   } & typeof [`default`](Point.default.md)

#### Returns

{ `prototype`:   } & typeof [`default`](Point.default.md)

#### Defined in

index.ts:49

___

### Polygon

• `get` **Polygon**(): { `prototype`:   } & typeof [`default`](Polygon.default.md)

#### Returns

{ `prototype`:   } & typeof [`default`](Polygon.default.md)

#### Defined in

index.ts:76

___

### Polyline

• `get` **Polyline**(): { `prototype`:   } & typeof [`default`](Polyline.default.md)

#### Returns

{ `prototype`:   } & typeof [`default`](Polyline.default.md)

#### Defined in

index.ts:73

___

### Rectangle

• `get` **Rectangle**(): { `prototype`:   } & typeof [`default`](Rectangle.default.md)

#### Returns

{ `prototype`:   } & typeof [`default`](Rectangle.default.md)

#### Defined in

index.ts:70

___

### RegularPolygon

• `get` **RegularPolygon**(): { `prototype`:   } & typeof [`default`](RegularPolygon.default.md)

#### Returns

{ `prototype`:   } & typeof [`default`](RegularPolygon.default.md)

#### Defined in

index.ts:82

___

### Segment

• `get` **Segment**(): { `prototype`:   } & typeof [`default`](Segment.default.md)

#### Returns

{ `prototype`:   } & typeof [`default`](Segment.default.md)

#### Defined in

index.ts:55

___

### Triangle

• `get` **Triangle**(): { `prototype`:   } & typeof [`default`](Triangle.default.md)

#### Returns

{ `prototype`:   } & typeof [`default`](Triangle.default.md)

#### Defined in

index.ts:61

___

### Vector

• `get` **Vector**(): { `prototype`:   } & typeof [`default`](Vector.default.md)

#### Returns

{ `prototype`:   } & typeof [`default`](Vector.default.md)

#### Defined in

index.ts:58

___

### options

• `get` **options**(): [`Options`](../modules/types.md#options)

#### Returns

[`Options`](../modules/types.md#options)

#### Defined in

index.ts:38

## Methods

### getCoordinateSystem

▸ **getCoordinateSystem**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `originX` | `number` |
| `originY` | `number` |
| `scale` | `number` |
| `xAxisPositiveOnRight` | `boolean` |
| `yAxisPositiveOnBottom` | `boolean` |

#### Defined in

index.ts:93

___

### getGlobalTransformation

▸ **getGlobalTransformation**(): [`default`](transformation_Matrix.default.md)

#### Returns

[`default`](transformation_Matrix.default.md)

#### Defined in

index.ts:121

___

### setCoordinateSystem

▸ **setCoordinateSystem**(`__namedParameters`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |

#### Returns

`void`

#### Defined in

index.ts:102

___

### setGlobalTransformation

▸ **setGlobalTransformation**(`matrix`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | [`default`](transformation_Matrix.default.md) |

#### Returns

`void`

#### Defined in

index.ts:124

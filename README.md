<p align="center"><img alt="Geomtoy logo" src="https://assets.geomtoy.com/icons/logo.svg" width="150"></p>
<h1 align="center">Geomtoy</h1>

> A 2D geometry responsive computing, visualizing and interacting library.

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
## Development

```sh
# run these below in the repo root directory:
# install `lerna` monorepo tool at the workspace `root`.
npm ci 
# install dependencies and symlinks for each `leaf` package.
npx lerna bootstrap --ci
```

## Installation
### Install all-in-one bundle package
```sh
npm i geomtoy
```
### Install scoped packages
```sh
npm i "@geomtoy/core"
npm i "@geomtoy/view"
npm i "@geomtoy/util"
```

## Usage
- [Examples](https://examples.geomtoy.com/)
- [Docs](https://docs.geomtoy.com/)
  
## Features

### @geomtoy/core
- Basic geometries and general geometries with usual functionality out of the box.
  - Support basic geometries: `Point`, `Vector`, `Rectangle`, `Circle`, `Ellipse`, `Line`, `Ray`, 
  `RegularPolygon`, `Triangle`, `LineSegment`, `QuadraticBezier`, `Bezier`.
  - Support general geometries: `Polygon`, `Path`, `Compound`. 
  - Support two non-geometric shape: `Image`, `Text`.
- Microtask based event system handling geometric associations.
- Browser independent and can run in all javascript environments.
- Multiple predicates for intersections between basic geometries. [More info](https://examples.geomtoy.com/intersection/index.html).
  - `Intersection` handles both proper intersections and coincidental intersections.
  - Support predicates: `equal`, `separate`, `intersect`, `strike`, `contact`, `cross`, `touch`, `block`, `blockedBy`, `connect`, `coincide`.
- Application of affine transformations returning the transformed geometry. [More info](https://examples.geomtoy.com/transformation/index.html).  
- Inversion of points, lines, and circles. [More info](https://examples.geomtoy.com/inversion/beauty-of-inversion.html).
- Full boolean operations respecting fill rules and area computation of complex general geometries. [More info](https://examples.geomtoy.com/boolean-operation/about.html).
  - Support boolean operations: `selfUnion`, `union`, `intersection`, `difference`, `differenceReverse`, `exclusion`.

### @geomtoy/view
- Interaction framework including most of the functionality.
  - Support dragging, panning, and zooming.
  - Support two kind, four activation modes.
  - Support three type view elements.
  - Support sub-views.
  - ...
- Microtask based rendering without user attention.
- Support both SVG and Canvas as renderers.
- Customizable boundless interface of the coordinate system.
- Support specifying the coordinate system and display status.
- View scope and view element scope interaction events.
- Support touch devices.

## License
Geomtoy is released under the [MIT License](https://github.com/Geomtoy/geomtoy/blob/master/LICENCE).

## Brief architecture
![Brief architecture](https://assets.geomtoy.com/images/architecture.png)

## Roadmap
- [ ] Support all conic curves.
- [ ] Support basic spirals.  
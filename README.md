<p align="center"><img alt="Geomtoy logo" src="./logo.svg" width="150"></p>
<h1 align="center">Geomtoy</h1>

> A 2D geometry responsive computing, visualizing and interacting library.

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
## Develop

```sh
# run these below in the repo root directory:
# install `lerna` monorepo tool at the workspace `root`.
npm ci 
# install dependencies for each `leaf` package.
npx lerna bootstrap --ci
```

## Install
### Install all packages
```sh
npm i geomtoy -S
```
### Install a specified package 
```sh
npm i "@geomtoy/core" -S
npm i "@geomtoy/view" -S
npm i "@geomtoy/util" -S
```

## Usage
- [Examples](https://examples.geomtoy.com/)
- [Documents](https://documents.geomtoy.com/)
  
## Features

### Core
- Support basic geometries: `Point`, `Vector`, `Rectangle`, `Circle`, `Ellipse`, `Line`, `Ray`, 
  `RegularPolygon`, `Triangle`, `LineSegment`, `QuadraticBezier`, `Bezier` and their commonly used methods.
- Support general geometries: `Polygon`, `Path`, `Compound`. 
- Support two non-geometric shape: `Image`, `Text`.
- A microtask based event system.
- `Intersection` to handle proper intersections and coincidental intersections. [More info](https://examples.geomtoy.com/intersection/index.html).
- `Transformation` to apply affine transformation to all geometries. [More info](https://examples.geomtoy.com/transformation/index.html). 
- `Inversion` of `Point`, `Line`, `Circle`. [More info](https://examples.geomtoy.com/inversion/beauty-of-inversion.html). 
- `BooleanOperation` to perform boolean operations(`selfUnion`, `union`, `intersection`, `difference`,
  `differenceReverse`, `exclusion`) of general geometries. [More info](https://examples.geomtoy.com/boolean-operation/about.html).

### View
- Support `<svg>` or `<canvas>` as renderer.
- Support custom coordinate system.
- A **Geogebra** like interface.
- Support interactions like dragging, panning, zooming.
- Support touch devices.
- Support a lot of options of `View`.
- Support `ViewElement`.
- Support `SubView`.
- ...

## Brief architecture
![Brief architecture](https://raw.githubusercontent.com/Geomtoy/geomtoy-assets/master/images/architecture.png)

## Roadmap && todo
- [ ] Support all conic curves.
- [ ] Support basic spirals.  
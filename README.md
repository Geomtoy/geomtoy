

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
```js
npm i geomtoy -S
```
### Install a specified package 
```js
npm i "@geomtoy/core" -S
npm i "@geomtoy/view" -S
npm i "@geomtoy/util" -S
```

## Usage 
- [Examples site]((https://examples.geomtoy.com/)) 
- [Documents site]((https://documents.geomtoy.com/))
  
## Features

### Core

- Supply a collection of commonly used 2D geometry.
- Support `Intersection` of all basic geometries.
- Support affine transformation `Transformation` to all the included 2D geometric objects.
- Support `Inversion` of `Point`, `Line`, `Circle`. 

- Support `BooleanOperation`
### View

- Support `<svg>` or `<canvas>` as renderer.

- Support coordinate system setting.

## Brief architecture
![Brief architecture](https://raw.githubusercontent.com/Geomtoy/geomtoy-assets/main/images/architecture.png)

## Roadmap && todo
- [ ] Support all conic curves.
- [ ] Support basic spirals.  
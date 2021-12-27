


// import Geomtoy from "../../src/geomtoy";
// import "./assets/default";
// import { colors, mathFont } from "./assets/assets";
// import Interact from "../../src/geomtoy-kit/frontend/Interact";
// import { Collection, Drawable, Touchable } from "./assets/GeomObjectWrapper";

// import type { EventObject, Text, Point } from "../../src/geomtoy/package"

// const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
// const svg = document.querySelector("#svg") as SVGSVGElement;
// const description = document.querySelector("#description") as HTMLElement;
// description.innerHTML = ``;
// canvas.style.display = "none";

// const G = new Geomtoy(100, 100, {
//     epsilon: 2 ** -32,
//     graphics: {
//         pointSize: 6,
//         arrow: {
//             width: 3,
//             length: 20,
//             foldback: 0,
//             noFoldback: false
//         }
//     }
// });
// G.yAxisPositiveOnBottom = false;
// G.scale = 10;

// const renderer = new Geomtoy.adapters.VanillaSvg(svg, G);
// renderer.lineJoin("round");
// const collection = new Collection();
// const interact = new Interact(renderer, collection);

// interact.startDragAndDrop();
// interact.startZoomAndPan();
// interact.startResponsive((width, height) => {
//     G.width = width;
//     G.height = height;
//     G.origin = [width / 2, height / 2];
// });

// const main = () => {
    
//     const vectorA = G.Vector(7,7)
//     vectorA.point1Coordinate = [2,2]


//     collection
//         .setDrawable("coordinateSystemOriginPoint", new Drawable(G.Point.zero(), true, colors.grey, undefined, 0))
//         .setTouchable("vectorA", new Touchable(vectorA, false, colors.black, colors.black, 3))
//         // .setTouchable("image", new Touchable(image, false, colors.purple, colors.purple, 3));
// };
// main();


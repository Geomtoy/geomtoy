import { Coordinates } from "@geomtoy/util";
import Arc from "../geometries/basic/Arc";
import Bezier from "../geometries/basic/Bezier";
import LineSegment from "../geometries/basic/LineSegment";
import QuadraticBezier from "../geometries/basic/QuadraticBezier";
import Compound from "../geometries/general/Compound";
import Path from "../geometries/general/Path";
import Polygon from "../geometries/general/Polygon";
import { eps } from "../geomtoy";
import Chain from "./Chain";

import type { FillDescription, FillRule } from "../types";

export default class Chainer {
    public chain(description: FillDescription) {
        const chains: Chain[] = [];

        for (const element of description.segmentWithFills) {
            const init = element.segment.point1Coordinates;
            const term = element.segment.point2Coordinates;
            const elementFill = element.thisFill;

            // *First, find two chains:
            // The first one matches not only the initial(init) coordinates of but also matches the fill.
            // The second one matches not only the terminal(term) coordinates of but also matches the fill.

            // Note:
            // Although it seems that we are looking for chains for the element to link on,
            // But the connotation is that we are looking for the fill regions(describe by these segments) for the boolean operation result geometry,
            // that is, where exactly does it have fill, this is more critical information.

            let initMatch: [chainIndex: number, atChainHead: boolean] | null = null;
            let termMatch: [chainIndex: number, atChainHead: boolean] | null = null;

            // The element should have one and only one of `thisFill.positive` and `thisFill.negative` to be true.
            // So we only need to determine equality of `positive` .
            for (let i = 0, l = chains.length; i < l && (initMatch === null || termMatch === null); i++) {
                const chain = chains[i];
                const head = chain.headCoordinates;
                const tail = chain.tailCoordinates;
                const chainFill = chain.fill;

                // We expect to get long chains, so do not match single chain twice at init and term respectively, we continue if a chain get a match.
                if (initMatch === null) {
                    if (Coordinates.equalTo(init, head, eps.epsilon) && chainFill.positive !== elementFill.positive) {
                        initMatch = [i, true];
                        continue;
                    }
                    if (Coordinates.equalTo(init, tail, eps.epsilon) && chainFill.positive === elementFill.positive) {
                        initMatch = [i, false];
                        continue;
                    }
                }
                if (termMatch === null) {
                    if (Coordinates.equalTo(term, head, eps.epsilon) && chainFill.positive === elementFill.positive) {
                        termMatch = [i, true];
                        continue;
                    }
                    if (Coordinates.equalTo(term, tail, eps.epsilon) && chainFill.positive !== elementFill.positive) {
                        termMatch = [i, false];
                        continue;
                    }
                }
            }

            // *Second, link the element and chain(s)
            // We do not match anything, so create a new chain.
            if (initMatch === null && termMatch === null) {
                chains.push(new Chain(element));
                continue;
            }
            // We match init.
            if (initMatch !== null && termMatch === null) {
                // Add the element to the matched chain
                chains[initMatch[0]].addElement(element, initMatch[1], true);
                continue;
            }
            // We match term.
            if (initMatch === null && termMatch !== null) {
                // Add the element to the matched chain
                chains[termMatch[0]].addElement(element, termMatch[1], false);
                continue;
            }
            // We match both term and init on two different chain.
            if (initMatch !== null && termMatch !== null) {
                chains[initMatch[0]].addElement(element, initMatch[1], true);
                chains[initMatch[0]].concat(chains[termMatch[0]], initMatch[1], termMatch[1]);
                chains.splice(termMatch[0], 1);
                continue;
            }
        }

        // * Last, adjust the winding of chains for fill rule `non-zero`(plus for safe insurance, we check if it is closable, although the chains can definitely be closed).
        chains.forEach(chain => {
            // Let us do some reverse thinking:
            // Assuming we've done all the adjustment, we should get chains like this:
            // - All the outer chains are positive winding as expected and from THE VIEW OF THE FINAL GEOMETRY(`fg`):
            //    - its positive fill=true
            //    - its negative fill=false
            //    Because it is the contour of `fg`, so its interior is the interior of `fg` and its exterior is the exterior of `fg`.
            //
            // - All the inner chains are negative winding as expected and from THE VIEW OF THE FINAL GEOMETRY(`fg`):
            //    - its negative fill=false
            //    - its positive fill=true
            //    Because it is a hole(or island-in-hole ...) of `fg`, so its interior is the exterior of `fg` and its exterior is the interior of `fg`.
            //
            // Then we were surprised to find that, whether it is the inner or outer chain, in the end we only need to make their fill to be:
            // positive fill=true and negative fill=false.
            // And our `SegmentWithFill` records everything, we just need reverse the chain whose positive fill is not true.
            chain.mergeRedundant();
            if (!chain.fill.positive) chain.reverse();
            if (!chain.isClosable()) {
                // Due to precision issues, very small chains will be unclosable, lowering the grade of this report.
                console.info("[G]Unclosable chain found.");
            }
        });

        // we follow the `fillRule` of description, which is the `fillRule` of the subject of boolean operation.
        return this._generateCompound(chains, description.fillRule);
    }

    private _generateCompound(chains: Chain[], fillRule: FillRule) {
        const items: (Path | Polygon)[] = [];

        for (const chain of chains) {
            const itemToBePolygon = chain.elements.every(sfa => sfa.segment instanceof LineSegment);
            let item: Polygon | Path;

            if (itemToBePolygon) {
                item = new Polygon(true);
                const l = chain.elements.length;
                //  first vertex
                item.appendVertex(Polygon.vertex(chain.elements[0].segment.point1Coordinates));
                // we do not add the last redundant line segment
                for (let i = 0; i < l - 1; i++) {
                    const segment = chain.elements[i].segment;
                    item.appendVertex(Polygon.vertex(segment.point2Coordinates));
                }
            } else {
                item = new Path(true);
                const l = chain.elements.length;
                // first `moveTo` command
                item.appendCommand(Path.moveTo(chain.elements[0].segment.point1Coordinates));
                for (let i = 0; i < l; i++) {
                    const segment = chain.elements[i].segment;
                    if (i === l - 1 && segment instanceof LineSegment) {
                        break; // we do not add the last redundant line segment
                    }
                    if (segment instanceof LineSegment) {
                        item.appendCommand(Path.lineTo(segment.point2Coordinates));
                    }
                    if (segment instanceof QuadraticBezier) {
                        item.appendCommand(Path.quadraticBezierTo(segment.controlPointCoordinates, segment.point2Coordinates));
                    }
                    if (segment instanceof Bezier) {
                        item.appendCommand(Path.bezierTo(segment.controlPoint1Coordinates, segment.controlPoint2Coordinates, segment.point2Coordinates));
                    }
                    if (segment instanceof Arc) {
                        item.appendCommand(Path.arcTo(segment.radiusX, segment.radiusY, segment.rotation, segment.largeArc, segment.positive, segment.point2Coordinates));
                    }
                }
            }
            items.push(item);
        }
        return new Compound(items, fillRule);
    }
}

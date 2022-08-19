import { Coordinates, Maths, Utility } from "@geomtoy/util";
import Path from "../geometries/advanced/Path";
import Polygon from "../geometries/advanced/Polygon";
import Compound from "../collection/Compound";
import Arc from "../geometries/basic/Arc";
import Bezier from "../geometries/basic/Bezier";
import LineSegment from "../geometries/basic/LineSegment";
import QuadraticBezier from "../geometries/basic/QuadraticBezier";
import { optioner } from "../geomtoy";
import SegmentFillAnnotator from "../helper/SegmentFillAnnotator";
import Description from "./Description";
import { FillRule } from "../types";
import Chain from "./Chain";
import LineSegmentLineSegment from "../relationship/classes/LineSegmentLineSegment";
import QuadraticBezierQuadraticBezier from "../relationship/classes/QuadraticBezierQuadraticBezier";
import BezierBezier from "../relationship/classes/BezierBezier";
import ArcArc from "../relationship/classes/ArcArc";
import FillRuleHelper from "../helper/FillRuleHelper";

export default class SegmentChainer {
    // private _chainHead(chain: SegmentFillAnnotator[]) {
    //     return chain[0].segment.point1Coordinates;
    // }
    // private _chainTail(chain: SegmentFillAnnotator[]) {
    //     return chain[chain.length - 1].segment.point2Coordinates;
    // }
    // private _elementInit(element: SegmentFillAnnotator) {
    //     return element.segment.point1Coordinates;
    // }
    // private _elementTerm(element: SegmentFillAnnotator) {
    //     return element.segment.point2Coordinates;
    // }

    // private _reverseChain(chains: SegmentFillAnnotator[][], match: Match) {
    //     const chain = chains[match.index];
    //     chain.forEach(element => element.reverse());
    //     chain.reverse();
    // }
    // private _concatChain(chains: SegmentFillAnnotator[][], matchA: Match, matchB: Match) {
    //     const chainA = chains[matchA.index];
    //     const chainB = chains[matchB.index];
    //     chains[matchA.index] = chainA.concat(chainB);
    //     chains.splice(matchB.index, 1);
    // }

    // private _addToChain(chains: SegmentFillAnnotator[][], match: Match, element: SegmentFillAnnotator) {
    //     const { index, atChainHead, atElementInit } = match;
    //     const chain = chains[index];
    //     if (atChainHead === atElementInit) element.reverse();
    //     atChainHead ? chain.unshift(element) : chain.push(element);
    // }
    // private _checkChainClosable(chains: SegmentFillAnnotator[][], match: Match) {
    //     const epsilon = optionerOf(this.owner).options.epsilon;
    //     const chain = chains[match.index];
    //     const head = this._chainHead(chain);
    //     const tail = this._chainTail(chain);
    //     return Coordinates.isEqualTo(head, tail, epsilon);
    // }

    private _segmentEqual(segmentA: LineSegment | QuadraticBezier | Bezier | Arc, segmentB: LineSegment | QuadraticBezier | Bezier | Arc) {
        if (segmentA instanceof LineSegment && segmentB instanceof LineSegment) {
            return new LineSegmentLineSegment(segmentA, segmentB).equal()!;
        }
        if (segmentA instanceof QuadraticBezier && segmentB instanceof QuadraticBezier) {
            return new QuadraticBezierQuadraticBezier(segmentA, segmentB).equal()!;
        }
        if (segmentA instanceof Bezier && segmentB instanceof Bezier) {
            return new BezierBezier(segmentA, segmentB).equal()!;
        }
        if (segmentA instanceof Arc && segmentB instanceof Arc) {
            return new ArcArc(segmentA, segmentB).equal()!;
        }
        return false;
    }

    private _consoleOutChainVertex(chain: Chain) {
        let ret = "";

        chain.elements.forEach(element => {
            ret += `[${element.segment.point1Coordinates.toString()}][${element.segment.point2Coordinates.toString()}]---->\n`;
        });
        console.log(ret);
    }

    public chain(description: Description) {
        const openChains: Chain[] = [];
        const closedChains: Chain[] = [];

        const epsilon = optioner.options.epsilon;

        description = description.clone();

        // This sort allows us to avoid taking the self-intersecting route when chaining elements.
        Utility.sortBy(description.annotators, [sfa => Maths.min(sfa.segment.point1X, sfa.segment.point2X), sfa => Maths.min(sfa.segment.point1Y, sfa.segment.point2Y)]);
        // This uniq removes the exact same element.
        description.annotators = Utility.uniqWith(description.annotators, (a, b) => this._segmentEqual(a.segment, b.segment));
        // Note: We have no way to prevent two contacting chains from being split into two, they could have been one.

        while (description.annotators.length > 0) {
            const element = description.annotators[0];
            const initCoordinates = element.segment.point1Coordinates;
            const termCoordinates = element.segment.point2Coordinates;

            const matches: [
                chainIndex: number,
                atChainHead: boolean /* true: match the chain head or false: match the chain tail */,
                atElementInit: boolean /* true: match the element initial or false: match the element terminal */
            ][] = [];

            for (let i = 0, l = openChains.length; i < l; i++) {
                const chain = openChains[i];
                const chainFill = chain.elements[0].thisFill;
                if (Coordinates.isEqualTo(chain.headCoordinates, initCoordinates, epsilon)) {
                    if (chainFill.positive !== element.thisFill.negative || chainFill.negative !== element.thisFill.positive) continue;

                    if (matches.push([i, true, true]) === 2) break;
                }
                if (Coordinates.isEqualTo(chain.headCoordinates, termCoordinates, epsilon)) {
                    if (chainFill.positive !== element.thisFill.positive || chainFill.negative !== element.thisFill.negative) continue;

                    if (matches.push([i, true, false]) === 2) break;
                }
                if (Coordinates.isEqualTo(chain.tailCoordinates, initCoordinates, epsilon)) {
                    if (chainFill.positive !== element.thisFill.positive || chainFill.negative !== element.thisFill.negative) continue;
                    if (matches.push([i, false, true]) === 2) break;
                }
                if (Coordinates.isEqualTo(chain.tailCoordinates, termCoordinates, epsilon)) {
                    if (chainFill.positive !== element.thisFill.negative || chainFill.negative !== element.thisFill.positive) continue;
                    if (matches.push([i, false, false]) === 2) break;
                }
            }

            // We do not match anything, so create a new chain.
            if (matches.length === 0) {
                openChains.push(new Chain(description.annotators.shift()!));
                continue;
            }
            // We match one chain.
            if (matches.length === 1) {
                // Add the element to the matched chain and check to see if we have a closed chain.
                const [chainIndex, atChainHead, atElementInit] = matches[0];
                const chain = openChains[chainIndex];
                chain.addElement(description.annotators.shift()!, atChainHead, atElementInit);
                if (chain.isClosable()) {
                    closedChains.push(chain);
                    openChains.splice(chainIndex, 1);
                }
                continue;
            }
            // We match two chain.
            if (matches.length === 2) {
                const [chainIndex1, atChainHead1, atElementInit1] = matches[0];
                const [chainIndex2, atChainHead2, atElementInit2] = matches[1];
                const chain1 = openChains[chainIndex1];
                const chain2 = openChains[chainIndex2];

                if (chainIndex1 === chainIndex2) {
                    chain1.addElement(description.annotators.shift()!, atChainHead1, atElementInit1);
                    if (chain1.isClosable()) {
                        closedChains.push(chain1);
                        openChains.splice(chainIndex1, 1);
                    }
                    continue;
                }

                // Now index1 !== index2, they are different chain.
                const chain1Longer = chain1.elements.length > chain2.elements.length;

                if (atElementInit1 === atElementInit2) {
                    if (chain1Longer) {
                        chain1.addElement(description.annotators.shift()!, atChainHead1, atElementInit1);
                        if (chain1.isClosable()) {
                            closedChains.push(chain1);
                            openChains.splice(chainIndex1, 1);
                        }
                    } else {
                        chain2.addElement(description.annotators.shift()!, atChainHead2, atElementInit2);
                        if (chain2.isClosable()) {
                            closedChains.push(chain2);
                            openChains.splice(chainIndex2, 1);
                        }
                    }
                    continue;
                }

                // console.log("before", description.annotators[0].segment.point1Coordinates, description.annotators[0].segment.point2Coordinates)

                // Two chain meet at this element(at different end of course)
                chain1Longer ? chain1.addElement(description.annotators.shift()!, atChainHead1, atElementInit1) : chain2.addElement(description.annotators.shift()!, atChainHead2, atElementInit2);

                chain1.concat(chain2, atChainHead1, atChainHead2);
                openChains.splice(chainIndex2, 1);

                // if (chain1.isClosable()) {
                //     closedChains.push(chain1);
                //     openChains.splice(chainIndex1, 1);
                // }
            }
        }

        console.log(openChains, closedChains);

        // description.annotators.forEach(element => {

        // });

        const allElements = closedChains.reduce((acc, chain) => {
            acc.push(...chain.elements);
            return acc;
        }, [] as SegmentFillAnnotator[]);

        const fillRuleHelper = new FillRuleHelper();

        // adjust the winding of chain for fill rule `non-zero`.
        closedChains.forEach(chain => {
            const testSegment = chain.elements[0].segment;
            const localWn = fillRuleHelper.windingNumbersOfSegment(testSegment, chain.elements);
            const globalWn = fillRuleHelper.windingNumbersOfSegment(testSegment, allElements);

            const localPositiveFill = localWn.positive !== 0;
            const localNegativeFill = localWn.negative !== 0;
            const globalPositiveFill = globalWn.positive !== 0;
            const globalNegativeFill = globalWn.negative !== 0;

            if (localPositiveFill === globalPositiveFill && localNegativeFill === globalNegativeFill) {
                // it is a exterior chain
                // make it positive winding
                if (!localPositiveFill) chain.reverse();
            } else {
                // it a interior chain
                // make it negative winding
                if (localPositiveFill) chain.reverse();
            }
        });

        return this._geometry(closedChains, description.fillRule);
    }

    private _geometry(chains: Chain[], fillRule: FillRule) {
        const items: (Path | Polygon)[] = [];
        chains.forEach(chain => {
            let item: Path | Polygon;
            const itemToBePolygon = chain.elements.every(sfa => sfa.segment instanceof LineSegment);
            item = itemToBePolygon ? new Polygon(true) : new Path(true);
            item.fillRule = fillRule;

            if (itemToBePolygon) {
                const polygon = item as Polygon;
                const l = chain.elements.length;
                chain.elements.forEach((sfa, index) => {
                    if (index === 0) {
                        polygon.appendVertex(Polygon.vertex(sfa.segment.point1Coordinates));
                    }
                    if (index === l - 1) {
                        return; // we do not add the last redundant line segment
                    }
                    polygon.appendVertex(Polygon.vertex(sfa.segment.point2Coordinates));
                });
            } else {
                const path = item as Path;
                const l = chain.elements.length;
                chain.elements.forEach((sfa, index) => {
                    if (index === 0) {
                        path.appendCommand(Path.moveTo(sfa.segment.point1Coordinates));
                    }
                    if (index === l - 1 && sfa.segment instanceof LineSegment) {
                        return; // we do not add the last redundant line segment
                    }
                    if (sfa.segment instanceof LineSegment) {
                        path.appendCommand(Path.lineTo(sfa.segment.point2Coordinates));
                    }
                    if (sfa.segment instanceof QuadraticBezier) {
                        path.appendCommand(Path.quadraticBezierTo(sfa.segment.controlPointCoordinates, sfa.segment.point2Coordinates));
                    }
                    if (sfa.segment instanceof Bezier) {
                        path.appendCommand(Path.bezierTo(sfa.segment.controlPoint1Coordinates, sfa.segment.controlPoint2Coordinates, sfa.segment.point2Coordinates));
                    }
                    if (sfa.segment instanceof Arc) {
                        path.appendCommand(Path.arcTo(sfa.segment.radiusX, sfa.segment.radiusY, sfa.segment.rotation, sfa.segment.largeArc, sfa.segment.positive, sfa.segment.point2Coordinates));
                    }
                });
            }
            items.push(item);
        });
        return new Compound(items);
    }
}

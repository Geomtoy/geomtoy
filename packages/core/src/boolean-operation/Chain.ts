import { Coordinates } from "@geomtoy/util";
import { optioner } from "../geomtoy";
import SegmentFillAnnotation from "./SegmentFillAnnotation";

export default class Chain {
    constructor(initialElement: SegmentFillAnnotation) {
        this.elements.push(initialElement);
    }

    elements: SegmentFillAnnotation[] = [];

    get headCoordinates() {
        return this.elements[0].segment.point1Coordinates;
    }
    get tailCoordinates() {
        return this.elements[this.elements.length - 1].segment.point2Coordinates;
    }
    get fill() {
        return this.elements[0].thisFill;
    }

    reverse() {
        this.elements.forEach(element => element.reverse());
        this.elements.reverse();
    }
    addElement(element: SegmentFillAnnotation, atChainHead: boolean, atElementInit: boolean) {
        if (atChainHead === atElementInit) element.reverse();
        atChainHead ? this.elements.unshift(element) : this.elements.push(element);
    }
    isClosable() {
        const epsilon = optioner.options.epsilon;
        return Coordinates.isEqualTo(this.headCoordinates, this.tailCoordinates, epsilon);
    }
    concat(chain2: Chain, atChainHead1: boolean, atChainHead2: boolean) {
        const chain1 = this;
        const chain1Longer = chain1.elements.length > chain2.elements.length; // reverse the shorter chain for performance, if needed

        if (atChainHead1) {
            if (atChainHead2) {
                if (chain1Longer) {
                    // <------ chain1 | chain2 -->
                    chain2.reverse();
                    // <------ chain1 | <-- chain2
                    this.elements = [...chain2.elements, ...chain1.elements];
                } else {
                    // <-- chain1 | chain2 ------>
                    chain1.reverse();
                    // chain1 --> | chain2 ------>
                    this.elements = [...chain1.elements, ...chain2.elements];
                }
            } else {
                // <-- chain1 | <-- chain2
                this.elements = [...chain2.elements, ...chain1.elements];
            }
        } else {
            if (atChainHead2) {
                // chain1 --> | chain2 -->
                this.elements = [...chain1.elements, ...chain2.elements];
            } else {
                if (chain1Longer) {
                    // chain1 ------> | <-- chain2
                    chain2.reverse();
                    // chain1 ------> | chain2 -->
                    this.elements = [...chain1.elements, ...chain2.elements];
                } else {
                    // chain1 --> | <------ chain2
                    chain1.reverse();
                    // <-- chain1 | <------ chain2
                    this.elements = [...chain2.elements, ...chain1.elements];
                }
            }
        }
    }
}

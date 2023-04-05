import { Coordinates } from "@geomtoy/util";
import { eps } from "../geomtoy";
import Merger from "./Merger";
import SegmentWithFill from "./SegmentWithFill";
import TrajectoryID from "./TrajectoryID";

export default class Chain {
    merger = new Merger();

    constructor(initialElement: SegmentWithFill) {
        this.elements.push(initialElement);
    }

    elements: SegmentWithFill[] = [];

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
    addElement(element: SegmentWithFill, atChainHead: boolean, atElementInit: boolean) {
        if (atChainHead === atElementInit) element.reverse();
        atChainHead ? this.elements.unshift(element) : this.elements.push(element);
    }
    mergeRedundant() {
        const newElements: SegmentWithFill[] = [this.elements[0]];
        let currentTrajectoryID: TrajectoryID = this.elements[0].trajectoryID;
        for (let i = 1, l = this.elements.length; i < l; i++) {
            const result = this.merger.merge(newElements[newElements.length - 1], this.elements[i]);
            if (result === null) {
                newElements.push(this.elements[i]);
                currentTrajectoryID = this.elements[i].trajectoryID;
            } else {
                newElements[newElements.length - 1] = result;
            }
        }
        const result = this.merger.merge(newElements[newElements.length - 1], newElements[0]);
        if (result !== null) {
            newElements[newElements.length - 1] = result;
            newElements.shift();
        }
        this.elements = newElements;
    }

    isClosable() {
        return Coordinates.equalTo(this.headCoordinates, this.tailCoordinates, eps.epsilon);
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

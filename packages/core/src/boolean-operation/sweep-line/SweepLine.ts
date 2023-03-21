import { Coordinates, Maths } from "@geomtoy/util";
import { eps } from "../../geomtoy";
import { FillRule } from "../../types";
import { LinkedList, LinkedListNode } from "./LinkedList";
import MonoSegment from "./MonoSegment";
import PriorityQueue from "./PriorityQueue";
import { relationResult } from "./relation";
import SweepEvent from "./SweepEvent";

export default class SweepLine {
    statusList = new LinkedList<SweepEvent>();
    eventQueue = new PriorityQueue<SweepEvent>([], SweepEvent.compare);
    relationSet = new Set<string>();

    primaryFillRule: FillRule = "nonzero";
    secondaryFillRule: FillRule = "nonzero";

    /**
     * Find the below event(mono segment) and the above event(mono segment) of sweep event `event` in the `statusList`.
     * @param event
     */
    findAboveAndBelow(event: SweepEvent) {
        // Find the first sweep event satisfy the conditions, it is the below, and its `prev` if existed is the above.
        const below = this.statusList.locate(node => {
            if (Coordinates.equalTo(event.coordinates, node.data.coordinates, eps.epsilon)) {
                return event.compareQuickY(node.data) >= 0;
            } else {
                const p = node.data.mono.segment.getClosestPointFromPoint(event.coordinates)[0];
                return event.coordinates[1] >= p.coordinates[1];
            }
        });
        return {
            above: below !== null ? below.prev : this.statusList.tail,
            below: below
        };
    }

    /**
     * * Note
     * Mono Segment Fill Determination
     * There are three aspects involved:
     * 1. winding merging
     * 2. snapshot
     * 3. imaginary straight line
     *
     * Since Geomtoy fully respects the fill-rule, but for higher efficiency, it is obvious that we should not do the ray-check directly like the `naive` algorithm.
     * At last, we found a way to combines the fill determining with the sweep line algorithm.
     *
     * 1. winding merging:
     * Mono segments has winding info: `thisWinding` and `thatWinding` to mark the winding number provided by the mono segment itself.
     * `thisWinding` represents winding number in its own general geometry;
     * `thatWinding` represents winding number in other general geometry;
     * When a mono segment do relation-calculating with other mono segment and coincidence occurs, the winding info will merge as the mono segments will merge.
     * This ensures that even if the duplicated mono segment is removed, we still get the complete winding number info.
     *
     * 2. snapshot:
     * When the main loop encounter a leave event, it means a certain mono segment will leave the `statusList`, so this is the time to determine its fill.
     * There may be multiple leave events at this same x-coordinate, so when the logic of the leave event is executed, a leave event(and its mono segment) will be removed from the `statusList`,
     * which will cause the current mono segments information to be incomplete(refer to 3.). In order to not miss any mono segment, the current `statusList` must be copied.
     * So when the first leave event occurs at a certain x-coordinate, we need to take a snapshot.
     * Since the determining method of the vertical mono segment is different from that of the non-vertical mono segment(refer to 3.), the snapshots are divided
     * into a horizontal snapshot `snapshotH` and a vertical snapshot `snapshotV`.
     *
     * 3. imaginary straight line:
     * We can assume that there is such a imaginary straight line - a line perpendicular to the x-axis (parallel to the sweep line), and its intercept on the x-axis is very very close
     * to the x-coordinate of the leave event.
     * This is equivalent to emit two rays from the leaving mono segments at this x-coordinate, one towards the positive direction of y-axis and one towards the negative direction of y-axis.
     * Then for the mono segments that leave at this x-coordinate, their positive and negative fills can be determined by counting:
     * - How many mono segments are above me and what are their windings;
     * - How many mono segments are below me and what are there windings;
     * Of course the segment to be determined is also in the snapshot, so we have to exclude itself.
     * In this way, all non-vertical mono segments can have their fill determined in this way and conform to the definition of fill rule.
     * (Or the extension of the fill rule, how to determine the fill of segments @see `crossingNumbersOfSegment` and `windingNumbersOfSegment` in `FillRuleHelper`)
     * Then how to determine the vertical mono segments? they obviously can't use this imaginary straight line directly.
     * Here is the trick of tricks:
     * We need to assume that there is a protrusion in the middle of the vertical mono segments, like this:
     *                 |
     *                 |
     * oblique part   /
     *              /__
     *                 |
     *                 |
     * (It can be small as possible, it will not intersect any other mono segment, think about it)
     * Then the fill of the oblique part should be the same as the fill of the vertical mono segment.
     * This oblique part can use the imaginary line now.
     * But we have to do one thing, that is to take into account the part horizontally below it - add the winding of this part to the below winding number.
     */

    snapshotH: SweepEvent[] = [];
    snapshotV: SweepEvent[] = [];
    x: number = -Infinity;

    /**
     * Take snapshot based on the x-coordinate of sweep event `event`.
     * @param event
     */
    takeSnapshot(event: SweepEvent) {
        const [x] = event.coordinates;
        // Take the horizontal snapshot first if necessary.
        if (!Maths.equalTo(x, this.x, eps.epsilon)) {
            this.x = x;
            this.snapshotH = this.statusList.toArray().filter(e => {
                // do not include the vertical segments
                if (e.mono.isVertical) return false;
                // do not include the enter event happened at this `x`,
                // the enter event happened at this `x` should be ignore(it is beyond the imaginary line)
                if (Maths.equalTo(e.coordinates[0], this.x, eps.epsilon)) return false;
                return true;
            });
        }
        // Take the vertical snapshot if this leave event is a vertical segment leave event.
        if (event.mono.isVertical) {
            const tempShot = this.statusList.toArray().filter(e => {
                // do include the vertical segment(event itself)
                if (e.mono.isVertical) return true;
                // do not include the enter event happened at this `x`,
                // the enter event happened at this `x` should be ignore(it is beyond the imaginary line)
                if (Maths.equalTo(e.coordinates[0], this.x, eps.epsilon)) return false;
                return true;
            });

            const index = tempShot.findIndex(e => e === event.otherEvent); // never -1
            // Because the leave event is from bottom to top, the position in `tempShot` is also the position where the current vertical segment leave event
            // should be inserted in `snapshotH`.
            let copy = [...this.snapshotH];
            copy.splice(index, 0, event.otherEvent);
            this.snapshotV = copy;
        }
    }
    /**
     * Determine the fill of mono segment in `LinkedListNode` status(enter event)
     * @param status
     */
    determineFill(status: LinkedListNode<SweepEvent>) {
        const curr = status.data;
        const number = {
            primary: [0, 0] as [above: number, below: number],
            secondary: [0, 0] as [above: number, below: number]
        };
        // primary count winding
        const pcw = this.primaryFillRule === "nonzero" ? true : false;
        // secondary count winding
        const scw = this.secondaryFillRule === "nonzero" ? true : false;
        // which side
        let w = 0; // above 0 , below 1
        let usedSnapshot: SweepEvent[];
        if (curr.mono.isVertical) {
            usedSnapshot = this.snapshotV;
            // handle the part horizontally below the oblique part
            if (curr.mono.isPrimary) {
                number.primary[1] += pcw ? curr.mono.thisWinding : Maths.abs(curr.mono.thisWinding);
                number.secondary[1] += scw ? curr.mono.thatWinding : Maths.abs(curr.mono.thatWinding);
            } else {
                number.secondary[1] += scw ? curr.mono.thisWinding : Maths.abs(curr.mono.thisWinding);
                number.primary[1] += pcw ? curr.mono.thatWinding : Maths.abs(curr.mono.thatWinding);
            }
        } else {
            usedSnapshot = this.snapshotH;
        }

        for (const event of usedSnapshot) {
            if (event === curr) {
                w = 1; // `statusList` is from top to bottom, so meet ourself, from now on, it is the below.
                continue; // we don't count ourself
            }
            if (event.mono.isPrimary) {
                number.primary[w] += pcw ? event.mono.thisWinding : Maths.abs(event.mono.thisWinding);
                number.secondary[w] += scw ? event.mono.thatWinding : Maths.abs(event.mono.thatWinding);
            } else {
                number.secondary[w] += scw ? event.mono.thisWinding : Maths.abs(event.mono.thisWinding);
                number.primary[w] += pcw ? event.mono.thatWinding : Maths.abs(event.mono.thatWinding);
            }
        }

        const primaryFill = {
            above: pcw ? number.primary[0] !== 0 : number.primary[0] % 2 !== 0,
            below: pcw ? number.primary[1] !== 0 : number.primary[1] % 2 !== 0
        };
        const secondaryFill = {
            above: scw ? number.secondary[0] !== 0 : number.secondary[0] % 2 !== 0,
            below: scw ? number.secondary[1] !== 0 : number.secondary[1] % 2 !== 0
        };
        // At this moment, the `thisFill` is in the view of primary general geometry:
        if (curr.mono.transposed) {
            curr.mono.thisFill.negative = primaryFill.above;
            curr.mono.thisFill.positive = primaryFill.below;
            curr.mono.thatFill.negative = secondaryFill.above;
            curr.mono.thatFill.positive = secondaryFill.below;
        } else {
            curr.mono.thisFill.positive = primaryFill.above;
            curr.mono.thisFill.negative = primaryFill.below;
            curr.mono.thatFill.positive = secondaryFill.above;
            curr.mono.thatFill.negative = secondaryFill.below;
        }
    }

    /**
     * * Memo
     * `SweepEvent` = event
     * Enter event = segment enter event, coordinates = `enterCoordinates` of `MonoSegment`
     *      `otherEvent` is leave event of the same `MonoSegment`
     * Leave event = segment leave event, coordinates = `leaveCoordinates` of `MonoSegment`
     *       `otherEvent` is enter event of the same `MonoSegment`
     * Segment event = enter event + leave event of this `MonoSegment`
     */

    clearEvents() {
        this.eventQueue.clear();
    }
    fillEvents(mss: MonoSegment[]) {
        for (const ms of mss) {
            this.addSegmentEvents(ms);
        }
    }
    addSegmentEvents(ms: MonoSegment) {
        const enterEvent = new SweepEvent(ms.enterCoordinates, ms, true, null as unknown as SweepEvent);
        const leaveEvent = new SweepEvent(ms.leaveCoordinates, ms, false, null as unknown as SweepEvent);
        enterEvent.otherEvent = leaveEvent;
        leaveEvent.otherEvent = enterEvent;
        this.eventQueue.enqueue(enterEvent);
        this.eventQueue.enqueue(leaveEvent);
    }

    updateSegmentEvents(event: SweepEvent, splittedMss: [null, ...MonoSegment[]] | MonoSegment[]) {
        // The first mono segment's enterCoordinates must equal to this event's coordinates.
        const [first, ...rest] = splittedMss;
        if (first === null) {
            // The `curr` is coincident with event in status, and the first part have been discarded, so remove it from the `eventQueue`.
            this.eventQueue.remove(event);
            this.eventQueue.remove(event.otherEvent);
        } else {
            // update the first mono segment's enter event
            event.mono = first;
            // update the first mono segment's leave event
            event.otherEvent.coordinates = first.leaveCoordinates;
            event.otherEvent.mono = first;
            event.otherEvent.quickY = NaN;
            // coordinates changed, so update the event in the `eventQueue`
            this.eventQueue.update(event.otherEvent);
        }

        // add the rest mono segments' events into `eventQueue`
        for (const ms of rest) {
            this.addSegmentEvents(ms!);
        }
    }
    relationId(idA: string, idB: string) {
        return idA > idB ? idA + "-" + idB : idB + "-" + idA;
    }

    calculateRelation(eventA: SweepEvent, eventB: SweepEvent) {
        // Check if their parents/or parents of parents... have already be relation-calculated, this is very important.
        // Do this to avoid redundant calculation to speed up.
        const aList = eventA.mono.ancestorIdList;
        const bList = eventB.mono.ancestorIdList;
        for (const a of aList) {
            for (const b of bList) {
                if (this.relationSet.has(this.relationId(a, b))) return null;
            }
        }
        const id = this.relationId(eventA.mono.segment.id, eventB.mono.segment.id);
        const result = relationResult(eventA.mono, eventB.mono);
        this.relationSet.add(id);
        return result;
    }

    private handleRelationResult(eventA: SweepEvent, eventB: SweepEvent, result: NonNullable<ReturnType<typeof this.calculateRelation>>) {
        const { a: splittedMssA, b: splittedMssB } = result;
        this.updateSegmentEvents(eventA, splittedMssA);
        this.updateSegmentEvents(eventB, splittedMssB);
    }

    launch() {
        const segments: MonoSegment[] = [];

        while (this.eventQueue.length !== 0) {
            const curr = this.eventQueue.peek();
            if (curr.isEnter) {
                const { above, below } = this.findAboveAndBelow(curr);

                let result = null;
                if (above !== null) {
                    result = this.calculateRelation(curr, above.data);
                    if (result !== null) this.handleRelationResult(curr, above.data, result);
                }
                if (below !== null) {
                    // if `curr` has no relation with `above`
                    // or `curr` has a relation with `above`, but not coincident with `above`
                    if (result === null || result.a[0] !== null) {
                        result = this.calculateRelation(curr, below.data);
                        if (result !== null) this.handleRelationResult(curr, below.data, result);
                    }
                }

                if (this.eventQueue.peek() !== curr) {
                    continue;
                }

                // Now add a new status of `curr` to `statusList` and let `curr.otherEvent.status` point to it.
                const status = new LinkedListNode(curr, this.statusList);
                if (below !== null) {
                    below.before(status);
                } else if (above !== null) {
                    above.after(status);
                } else {
                    this.statusList.push(status);
                }
                curr.otherEvent.status = status;
            } else {
                this.takeSnapshot(curr);
                const status = curr.status!;
                // Removing the status from `statusList` will create two new adjacent mono segments, so we'll need to check them.
                if (status.prev !== null && status.next !== null) {
                    const result = this.calculateRelation(status.prev.data, status.next.data);
                    if (result !== null) this.handleRelationResult(status.prev.data, status.next.data, result);
                }

                this.determineFill(status);
                // now remove it from `statusList`
                status.detach();
                segments.push(curr.mono);
            }

            this.eventQueue.dequeue();
        }
        return segments;
    }
}

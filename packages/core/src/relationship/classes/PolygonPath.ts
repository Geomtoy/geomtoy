import Path from "../../geometries/advanced/Path";
import Polygon from "../../geometries/advanced/Polygon";
import Arc from "../../geometries/basic/Arc";
import BaseRelationship from "../BaseRelationship";

export default class PolygonPath extends BaseRelationship<Polygon, Path> {
    // geometry1: polygon
    // geometry2: path

    cache = {} as Partial<{
        // c: coordinates of intersect
        intersect?: { c: [number, number] }[];
    }>;

    // intersect() {
    //     if (this.cache.intersect !== undefined) return this.cache.intersect;
    //     const intersect: { c: [number, number] }[] = [];
    //     const l1 = this.geometry1.vertexCount;
    //     const l2 = this.geometry2.commandCount;

    //     for (let i = this.geometry1.closed ? 0 : 1; i < l1; i++) {
    //         for(let j = this.geometry2.closed ? 0 : 1; j < l2; j++ ){
    //             const seg1 = this.geometry1.getSegment(i)!;
    //             const seg2 = this.geometry2.getSegment(j)!;
    //             if(seg2 instanceof Arc){
    //                 intersect.push(...new LineS(this.owner, this.geometry1, ls).intersect());
    //             }

    //         }

    //     }
    //     return (this.cache.intersect = intersect);
    // }

    // no equal
    // separate() {
    //     return this.intersect().length === 0;
    // }

    // merge() {
    //     const merge: LineSegment[] = [];
    //     const l = this.shape2.vertexCount;
    //     for (let i = this.shape2.closed ? 0 : 1; i < l; i++) {
    //         const ls = this.shape2.getSegment(i)!;
    //         merge.push(...new LineLineSegment(this.owner, this.shape1, ls).merge());
    //     }
    //     return merge;
    // }
    // cross() {
    //     const intersect = this.intersect();
    //     return intersect.map(i => new Point(this.owner, i.c));
    // }
    // // no touch
    // block() {
    //     const block: Point[] = [];
    //     const l = this.shape2.vertexCount;
    //     for (let i = this.shape2.closed ? 0 : 1; i < l; i++) {
    //         const ls = this.shape2.getSegment(i)!;
    //         block.push(...new LineLineSegment(this.owner, this.shape1, ls).block());
    //     }
    //     const epsilon = this.options_.epsilon;
    //     // remove duplicated points
    //     Utility.uniqWith(block, (a, b) => {
    //         return Coordinates.isEqualTo(a.coordinates, b.coordinates, epsilon);
    //     });
    //     return block;
    // }
    // no blockedBy
}

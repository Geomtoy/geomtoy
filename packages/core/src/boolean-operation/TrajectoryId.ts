export default class TrajectoryId {
    constructor(public id: string) {}

    negotiate(that: TrajectoryId) {
        const [thisType, thisNum] = this.id.split("-");
        const [thatType, thatNum] = that.id.split("-");
        if (thisType !== thatType) {
            throw new Error("[G]They are not the same type segments.");
        }

        if (parseInt(thisNum, 16) < parseInt(thatNum, 16)) {
            that.id = this.id;
        } else {
            this.id = that.id;
        }
    }
    equalTo(that: TrajectoryId) {
        return this.id === that.id;
    }
    clone() {
        return new TrajectoryId(this.id);
    }
}

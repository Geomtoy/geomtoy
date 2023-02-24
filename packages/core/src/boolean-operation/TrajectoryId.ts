export default class TrajectoryId {
    constructor(public uuid: string) {}

    negotiate(that: TrajectoryId) {
        if (this.uuid > that.uuid) {
            that.uuid = this.uuid;
        } else {
            this.uuid = that.uuid;
        }
    }
    equalTo(that: TrajectoryId) {
        return this.uuid === that.uuid;
    }
    clone() {
        return new TrajectoryId(this.uuid);
    }
}

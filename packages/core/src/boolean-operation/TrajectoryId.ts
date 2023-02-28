export default class TrajectoryId {
    constructor(public id: string) {}

    negotiate(that: TrajectoryId) {
        if (this.id > that.id) {
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

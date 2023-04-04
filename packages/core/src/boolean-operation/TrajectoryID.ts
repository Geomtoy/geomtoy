const ID_SYMBOL = Symbol("TrajectoryID.id");

export default class TrajectoryID {
    private _id: { [ID_SYMBOL]: string };

    constructor(id: string) {
        this._id = { [ID_SYMBOL]: id };
    }
    negotiate(that: TrajectoryID) {
        const [thisType, thisNum] = this._id[ID_SYMBOL].split("-");
        const [thatType, thatNum] = that._id[ID_SYMBOL].split("-");
        if (thisType !== thatType) {
            throw new Error("[G]They are not the same type segments.");
        }

        if (parseInt(thisNum, 16) < parseInt(thatNum, 16)) {
            that._id = this._id;
        } else {
            this._id = that._id;
        }
    }
    equalTo(that: TrajectoryID) {
        return this._id === that._id;
    }
    clone() {
        const ret = new TrajectoryID("");
        ret._id = this._id;
        return ret;
    }
}

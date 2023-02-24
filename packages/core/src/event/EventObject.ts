import EventTarget from "../base/EventTarget";
import EventSourceObject from "./EventSourceObject";

export default class EventObject<T extends EventTarget> {
    target: T;
    type: "empty" | "standard" | "composed" = "empty";
    event: string | undefined;
    trace: EventSourceObject<T>[] | null;
    original: (EventObject<T> & { trace: EventSourceObject<T>[] })[] | null;

    constructor(target: T, type: "empty" | "standard" | "composed") {
        this.target = target;
        this.type = type;
        this.event = undefined;
        this.trace = null;
        this.original = null;
    }

    static empty<ST extends EventTarget>(target: ST) {
        const ret = new EventObject(target, "empty");
        return ret;
    }
    static standard<ST extends EventTarget>(target: ST, event: string) {
        const ret = new EventObject(target, "standard");
        ret.event = event;
        ret.trace = [];
        return ret as EventObject<ST> & { event: string; trace: EventSourceObject<ST>[] };
    }
    static composed<ST extends EventTarget>(target: ST, event: string) {
        const ret = new EventObject(target, "composed");
        ret.event = event;
        ret.original = [];
        return ret as EventObject<ST> & { event: string; original: (EventObject<ST> & { trace: EventSourceObject<ST>[] })[] };
    }
}

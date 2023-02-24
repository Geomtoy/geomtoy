import { Utility } from "@geomtoy/util";
import EventTarget from "../base/EventTarget";

export default class EventSourceObject<T extends EventTarget> {
    timestamp = Utility.now();
    target: T;
    eventName: string;
    // todo check old value is passed by all classes
    oldValue?: any;
    indexOrKey?: number | string;
    uuid?: string;
    constructor(target: T, eventName: string, oldValue?: any, indexOrKey?: number | string, uuid?: string) {
        this.target = target;
        this.eventName = eventName;
        this.oldValue = oldValue;
        this.indexOrKey = indexOrKey;
        this.uuid = uuid;
    }
}

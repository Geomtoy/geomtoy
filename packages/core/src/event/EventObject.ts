import type EventTarget from "../base/EventTarget";

class EventObject<T extends EventTarget> {
    timestamp = Date.now();
    target: T;
    event?: string;
    index?: number;
    uuid?: string;
    original?: EventObject<T> | EventObject<T>[];

    constructor(target: T) {
        this.target = target;
    }

    static empty<ST extends EventTarget>(target: ST) {
        return new EventObject(target);
    }
    static simple<ST extends EventTarget>(target: ST, eventName: string) {
        const ret = new EventObject(target);
        ret.event = eventName;
        return ret;
    }
    static collection<ST extends EventTarget>(target: ST, eventName: string, index: number, uuid: string) {
        const ret = new EventObject(target);
        ret.event = eventName;
        ret.index = index;
        ret.uuid = uuid;
        return ret;
    }
    static composedAny<ST extends EventTarget>(target: ST, eventPattern: string, originalEventObject: EventObject<ST>) {
        const ret = new EventObject(target);
        ret.event = eventPattern;
        ret.original = originalEventObject;
        return ret;
    }

    static composedAll<ST extends EventTarget>(target: ST, eventPattern: string, originalEventObjects: EventObject<ST>[]) {
        const ret = new EventObject(target);
        ret.event = eventPattern;
        ret.original = originalEventObjects;
        return ret;
    }
}

function isSameEventObject<T extends EventTarget>(eventObject1: EventObject<T>, eventObject2: EventObject<T>) {
    if (eventObject1.target !== eventObject2.target) return false;
    if (eventObject1.event !== eventObject2.event) return false;
    if (eventObject1.index !== eventObject2.index) return false;
    if (eventObject1.uuid !== eventObject2.uuid) return false;
    if (eventObject1.original !== eventObject2.original) return false;
    return true;
}

export default EventObject;
export { isSameEventObject };

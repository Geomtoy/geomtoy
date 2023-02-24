import EventTarget from "../base/EventTarget";
import { EVENT_PATTERN_ALL_REG, EVENT_PATTERN_ALL_SPLITTER, EVENT_PATTERN_ANY_REG, EVENT_PATTERN_ANY_SPLITTER } from "./EventConst";
import EventObject from "./EventObject";
import EventSourceObject from "./EventSourceObject";

export default class EventCache<T extends EventTarget> {
    cache: {
        [eventName: string]: EventObject<T> & { trace: EventSourceObject<T>[] };
    } = {};

    constructor(public target: T) {}

    record(eso: EventSourceObject<T>) {
        const { eventName } = eso;
        if (this.cache[eventName] === undefined) this.cache[eventName] = EventObject.standard(this.target, eventName);
        this.cache[eventName].trace.push(eso);
    }

    query(event: string) {
        // composed any
        if (EVENT_PATTERN_ANY_REG.test(event)) {
            const composed = EventObject.composed(this.target, event);
            return event.split(EVENT_PATTERN_ANY_SPLITTER).some(eventName => {
                if (this.cache[eventName] !== undefined) {
                    composed.original.push(this.cache[eventName]);
                    return true;
                }
                return false;
            })
                ? composed
                : null;
        }
        // composed all
        if (EVENT_PATTERN_ALL_REG.test(event)) {
            const composed = EventObject.composed(this.target, event);
            return event.split(EVENT_PATTERN_ALL_SPLITTER).every(eventName => {
                if (this.cache[eventName] !== undefined) {
                    composed.original.push(this.cache[eventName]);
                    return true;
                }
                return false;
            })
                ? composed
                : null;
        }
        // standard
        if (this.cache[event] !== undefined) {
            return this.cache[event];
        }
        return null;
    }

    clear() {
        this.cache = {};
    }
}

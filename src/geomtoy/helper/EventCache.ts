import EventObject, { isSameEventObject } from "../event/EventObject";
import EventTarget from "../base/EventTarget";

class EventCache<T extends EventTarget> {
    objects: EventObject<T>[] = [];

    add(eventObject: EventObject<T>) {
        this.objects.push(eventObject);
    }
    has(eventObject: EventObject<T>) {
        return this.objects.findIndex(e => isSameEventObject(e, eventObject)) !== -1;
    }
    filter(event: string): EventObject<T>[] {
        return this.objects.filter(e => e.event === event);
    }
    clear() {
        this.objects = [];
    }
    forEach(callback: (eventObject: EventObject<T>, index: number) => void) {
        // Get length dynamically, to visit new added values before `for` loop has finished.
        for (let i = 0; i < this.objects.length; i++) {
            callback(this.objects[i], i);
        }
    }
}

export default EventCache;

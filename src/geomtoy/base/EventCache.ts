import { EventObject } from "../types"

class EventCache {
    private _eventNames: string[] = []
    private _eventObjects: EventObject[] = []
    constructor() {}
    add(eventName: string, eventObject: EventObject) {
        this._eventNames.push(eventName)
        this._eventObjects.push(eventObject)
    }
    delete(eventName: string) {
        const foundIndex = this._eventNames.findIndex(n => n === eventName)
        if (foundIndex !== -1) {
            this._eventNames.splice(foundIndex, 1)
            this._eventObjects.splice(foundIndex, 1)
        }
    }
    has(eventName: string) {
        return this._eventNames.findIndex(n => n === eventName) !== -1
    }
    clear() {
        this._eventNames = []
        this._eventObjects = []
    }
    forEach(callback: (eventName: string, eventObject: EventObject, index: number) => void) {
        for (let i = 0; i < this._eventNames.length; i++) {
            callback(this._eventNames[i], this._eventObjects[i], i)
        }
    }
}

export default EventCache

import Geomtoy from ".."
import assert from "../utility/assertion"
import util from "../utility"
import { EventHandler, EventHandlerType, EventObject, EventObjectType, GeomObjectEventNamesPair, GeomObjectFromPair, Options } from "../types"
import Scheduler, { schedulerOf } from "../helper/Scheduler"
import { optionerOf } from "../helper/Optioner"

// regular expression used to split event strings
const eventNameSplitter = /\s+/
const eventNameForAny = "*"

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

abstract class GeomObject {
    private _owner: Geomtoy = null as unknown as Geomtoy
    private _uuid = util.uuid()
    private _scheduler: Scheduler
    protected options_: Options
    private _muted: boolean = false
    //user-defined data
    private _data: { [key: string]: any } = {}

    constructor(owner: Geomtoy) {
        this.owner = owner
        this._scheduler = schedulerOf(this.owner)
        this.options_ = optionerOf(this.owner).options
    }

    get owner() {
        return this._owner
    }
    set owner(value: Geomtoy) {
        if (!(value instanceof Geomtoy)) throw new Error("[G]The `owner` of a `GeomObject` should be a `Geomtoy`.")
        this._owner = value
    }
    get name() {
        return this.constructor.name
    }
    get uuid() {
        return this._uuid
    }

    data(key: string, value: any): this
    data(key: string): any
    data(key: string, value?: any) {
        if (value === undefined) return this._data[key]
        this._data[key] = value
        return this
    }

    // #region Event
    // fake code, typescript do not support `abstract static`
    // static abstract readonly events: { [key: string]: string }

    mute() {
        this._muted = true
    }
    unmute() {
        this._muted = false
    }

    protected willTrigger_(oldValue: any, newValue: any, eventNames: (string | { eventName: string; uuid: string; index: number })[]) {
        if (oldValue === newValue) return

        if (util.isString(oldValue) || util.isBoolean(oldValue) || util.isNumber(oldValue)) {
            if (oldValue !== newValue) this.trigger(eventNames)
        }
        if (util.isPlainObject(oldValue)) {
            if (!util.compareDeep(oldValue, newValue)) this.trigger(eventNames)
        }
    }

    // event name-handlers map
    private _events: { [key: string]: EventHandler[] } = {}

    // event names holder to collect the event names triggered in each loop and automatically remove duplicates
    /* 
    We use a `Set` here not only for the auto removal of duplicates but also because the `forEach` method of `Set` 
    can visit the values newly added during the `forEach`. This is a significant and few people mentioned difference between `Set` and `Array`.
    @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach
    */
    private _eventCache: EventCache = new EventCache()

    // event scheduled flag to mark if we have told the scheduler ready to go(put the event handlers of triggered events of this `GeomObject` in its queue)
    private _eventScheduled: boolean = false

    // event handling flag to mark if the event handlers of triggered events of this `GeomObject` are now being invoked
    private _eventHandling: boolean = false

    private _getHandlers(eventName: string) {
        this._events[eventName] === undefined && (this._events[eventName] = [])
        return this._events[eventName]
    }

    private _addHandler(eventName: string, callback: (...args: any[]) => any, context: GeomObject, relatedGeomObjects: undefined | GeomObject[], priority: number) {
        const hs = this._getHandlers(eventName)
        let handler: EventHandler
        if (util.isArray(relatedGeomObjects)) {
            handler = { callback, context, relatedGeomObjects, priority, type: EventHandlerType.Bind }
        } else {
            handler = { callback, context, priority, type: EventHandlerType.On }
        }
        hs.push(handler)
        // From min to max according to priority, we will reverse while loop them later.
        hs.sort((a, b) => a.priority - b.priority)
    }
    private _removeHandler(eventName: string, callback: (...args: any[]) => any, context: GeomObject) {
        const hs = this._getHandlers(eventName)
        const index = hs.findIndex(h => h.callback === callback && h.context === context)
        if (index > -1) hs.splice(index, 1)
    }
    private _hasHandler(eventName: string, callback: (...args: any[]) => any, context: GeomObject) {
        const hs = this._getHandlers(eventName)
        const index = hs.findIndex(e => e.callback === callback && e.context === context)
        return index > -1
    }
    private _hasEvent(eventName: string) {
        if (eventName === eventNameForAny) return true
        //@ts-ignore
        return Object.values(this.constructor.events).includes(eventName)
    }
    private _parseEventNames(eventNames: string) {
        const ns = eventNames.split(eventNameSplitter).filter(n => n !== "")
        const ret: string[] = []
        ns.forEach(n => {
            if (this._hasEvent(n)) {
                ret.push(n)
            } else {
                console.warn(`[G]There is no event named \`${n}\` in \`${this.name}\` , so it will be ignored.`)
            }
        })
        return ret
    }

    on(eventNames: string, callback: (this: this) => any, priority = 1) {
        assert.isString(eventNames, "eventNames")
        assert.isFunction(callback, "callback")
        assert.isRealNumber(priority, "priority")

        const ns = this._parseEventNames(eventNames)
        if (ns.length === 0) return this
        ns.forEach(n => {
            if (this._hasHandler(n, callback, this)) {
                console.warn(`[G]An event handler with the same callback and the same context already exists in the event named \`${n}\` on \`${this}\`, so it will be ignored.`)
            } else {
                this._addHandler(n, callback, this, undefined, priority)
            }
        })
        return this
    }
    off(eventNames: string, callback: (...args: any[]) => any) {
        assert.isString(eventNames, "eventNames")
        assert.isFunction(callback, "callback")

        const ns = this._parseEventNames(eventNames)
        if (ns.length === 0) return this
        ns.forEach(n => {
            this._removeHandler(n, callback, this)
        })
        return this
    }
    clear(eventNames: string) {
        assert.isString(eventNames, "eventNames")

        const ns = this._parseEventNames(eventNames)
        if (ns.length === 0) return this
        ns.forEach(n => {
            const handlers = this._getHandlers(n)
            handlers.splice(0)
        })
        return this
    }

    private _schedule() {
        this._eventScheduled = true
        this._scheduler.queue(() => {
            // #region Event Handling Logic
            //
            // While an event handler of this `GeomObject` is being invoked:
            // Or we can also say —— While the scheduler is flushing the queue item of this `GeomObject` in current loop:
            // Add new event handlers to:
            //     - self:
            //         - same event:
            //             ! CAN be added, BUT NOT be invoked in current loop.
            //             Because before we invoke the event handlers of this event, we have copied the event handlers,
            //             so which event handlers will be invoked have be packaged.
            //             The newly added event handlers have lost the opportunity to be invoked. They have to wait for the next loop.
            //         - other events:
            //             ! CAN be added, whether to be invoked in current loop, it DEPENDS
            //             If other events have been handled before this event,
            //             the newly added event handlers have lost the opportunity to be invoked. They have to wait for the next loop,
            //             Otherwise, the newly added event handlers will be added and will be invoked in current loop.
            //
            //     - other `GeomObject`s:
            //         ! CAN be added, whether to be invoked in current loop, it DEPENDS
            //         If other `GeomObject`s have complete its event handling, the newly added event handlers have to wait for the next loop,
            //         otherwise the newly added event handlers will be added,
            //         and will be invoked when it is the turn of other `GeomObject`s to do their event handling in current loop.
            //
            // Remove event handlers to:
            //     - self:
            //         - same event:
            //             ! CAN be removed, BUT will still be invoked in current loop.
            //             Because before we invoke the event handlers of this event, we have copied the event handlers,
            //             so which event handlers will be invoked have be packaged.
            //         - other events:
            //             ! CAN be removed, whether to be invoked in current loop, it DEPENDS
            //             If other events have been handled before this event, the event handlers have already been invoked we can not do nothing,
            //             Otherwise, the event handlers will be removed and will not be invoked from current loop on.
            //     - other `GeomObject`s:
            //         ! CAN be remove, whether to be invoked in current loop, it DEPENDS
            //         If other `GeomObject`s have complete its event handling, the event handlers have already been invoked we can not do nothing,
            //         otherwise the event handlers will be removed, and will not be invoked from current loop on.

            // Trigger new events of(by setting the property):
            //     - self:
            //         - same event(same property):
            //             ! CAN NOT trigger, it will be ignored.
            //             The `_eventCache` has the same event in it, so the event will be ignored(the value of the property is changed).
            //             * DEEP
            //             If this kind of triggering is allowed, then it's an infinite loop.
            //         - other events(other properties):
            //             ! DEPENDS
            //             If the `_eventCache` does not have the event in it, the event will be added, and the event handlers of the event
            //             will be invoked in current loop(thx for `forEach` of `Set`). Otherwise, the event will be ignored(the value of the property is changed).
            //
            //     - other `GeomObject`:
            //         ! ALWAYS
            //         We must be able to trigger the events of other `GeomObject`s, otherwise it will not be responsive.
            //         But notice here: A-->B-x->A:
            //             The change of A causes the change of B,
            //             but the event handling of the change of B can no longer cause the same change of A,
            //             otherwise it will be an infinite loop. Don't worry, the scheduler will care about this.
            // #endregion

            this._eventHandling = true

            this._eventCache.forEach((eventName, eventObject) => {
                //Copy the event handlers of this event to solid/package it in order to make it unchangeable during the event handling.
                const hs = [...this._getHandlers(eventName)]
                let l = hs.length
                while (l--) {
                    const h = hs[l]
                    if (!this._scheduler.isCallbackInvokedBy(h.callback, h.context)) {
                        if (h.type === EventHandlerType.On) {
                            h.callback.call(h.context, eventObject)
                        } else {
                            h.callback.call(
                                h.context,
                                h.relatedGeomObjects.map(o => (eventObject.target === o ? eventObject : { target: o, type: EventObjectType.Empty }))
                            )
                        }
                        // So the same callback(such as in the `bind` method) bound to multiple events of multiple objects will not be invoked multiple times.
                        this._scheduler.markCallback(h.callback, h.context)
                    }
                }
            })
            this._eventCache.clear()
            this._eventHandling = false
            this._eventScheduled = false
        })
        if (!this._scheduler.flushed) this._scheduler.flushQueue()
    }

    trigger(eventNames: (string | { eventName: string; uuid: string; index: number })[]) {
        if (this._muted) return this
        if (eventNames.length === 0) return this

        eventNames.forEach(n => {
            let eventName = ""
            let eventCacheName = ""
            let eventObject: EventObject = {} as EventObject

            if (util.isString(n)) {
                if (!this._hasEvent(n)) return
                eventName = n
                eventCacheName = n
                eventObject = { type: EventObjectType.Simple, target: this, eventName: n }
            } else {
                if (!this._hasEvent(n.eventName)) return
                eventName = n.eventName
                eventCacheName = n.eventName + n.uuid
                eventObject = { type: EventObjectType.Collection, target: this, ...n }
            }

            const cached = this._eventCache.has(eventCacheName)
            // Here we put the triggering event name in to the `_eventCache` instead of directly invoking the event handlers in the event.
            // Doing so to avoid repeatedly invoking the event handlers in one loop.
            // No matter how many times an event of `GeomObject` is triggered,
            // we only need to record here, the event has been triggered, and the event handlers of it need to be invoked.
            if (!cached) this._eventCache.add(eventCacheName, eventObject)
            // If the event handling of this `GeomObject` is in progress,
            // only uncached events can have their callbacks unmarked.
            // We can't change the invoking status of the callbacks of cached event.
            if (this._eventHandling && cached) return
            this._getHandlers(eventName).forEach(h => {
                this._scheduler.unmarkCallback(h.callback, h.context)
            })
            // If the events of this `GeomObject` has not been scheduled, then schedule it.
            if (!this._eventScheduled) this._schedule()

            // The triggering of any event will immediately cause the triggering of `*`, except `*` itself
            // With the previous logic, we are not afraid that the callbacks of `*` will be invoked repeatedly.
            if (eventName !== eventNameForAny) {
                this._eventCache.add(eventNameForAny, { target: this, type: EventObjectType.Empty })
            }
        })
        return this
    }

    private _parseObjectEventNamesPairs(pairs: GeomObjectEventNamesPair[]) {
        let ret = {
            objects: [] as GeomObject[],
            pairs: [] as [GeomObject, string][]
        }
        pairs.forEach(pair => {
            if (pair instanceof GeomObject) {
                ret.objects.push(pair)
                ret.pairs.push([pair, eventNameForAny])
            } else if (util.head(pair) instanceof GeomObject && util.isString(util.last(pair))) {
                ret.objects.push(util.head(pair) as GeomObject)
                ret.pairs.push(pair)
            } else {
                console.warn(`[G]The \`objectEventNamesPairs\` contains a pair: \`${pair}\` which is not valid, so it will be ignored.`)
            }
        })
        return ret
    }

    bind<T extends GeomObjectEventNamesPair[]>(
        objectEventNamesPairs: [...T],
        callback: (this: this, args: [...GeomObjectFromPair<T>]) => any,
        immediately = true,
        priority = 1000
    ) {
        assert.isArray(objectEventNamesPairs, "objectEventNamesPairs")
        assert.isFunction(callback, "callback")
        assert.isBoolean(immediately, "immediately")
        assert.isRealNumber(priority, "priority")

        let immediatelyTriggered = false
        const { objects, pairs } = this._parseObjectEventNamesPairs(objectEventNamesPairs)

        if (pairs.length === 0) return this
        pairs.forEach(oe => {
            const [object, eventNames] = oe
            const ns = object._parseEventNames(eventNames)
            if (ns.length === 0) return
            ns.forEach(n => {
                if (object._hasHandler(n, callback, this)) {
                    console.warn(
                        `[G]An event handler with the same callback and the same context already exists in the event named \`${n}\` on \`${object}\`, so it will be ignored.`
                    )
                } else {
                    object._addHandler(n, callback, this, objects, priority)
                    if (immediately && !immediatelyTriggered) {
                        // object.trigger(n)
                        callback.call(this, objects)
                        immediatelyTriggered = true
                    }
                }
            })
        })

        return this
    }

    unbind(objectEventNamesPairs: GeomObjectEventNamesPair[], callback: (...args: any[]) => any) {
        assert.isArray(objectEventNamesPairs, "objectEventNamesPairs")
        assert.isFunction(callback, "callback")

        const { pairs } = this._parseObjectEventNamesPairs(objectEventNamesPairs)

        if (pairs.length === 0) return this
        pairs.forEach(oe => {
            const [object, eventNames] = oe
            const ns = object._parseEventNames(eventNames)

            if (ns.length === 0) return
            ns.forEach(n => {
                object._removeHandler(n, callback, this)
            })
        })

        return this
    }
    // #endregion

    abstract isValid(): boolean
    abstract clone(): GeomObject
    abstract copyFrom(object: GeomObject | null): this
    abstract toString(): string
    abstract toArray(): any[]
    abstract toObject(): object
}

/**
 * @category Base
 */
export default GeomObject

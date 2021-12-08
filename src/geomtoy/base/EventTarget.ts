import util from "../utility";
import assert from "../utility/assertion";

import { schedulerOf } from "../helper/Scheduler";

import BaseObject from "./BaseObject";
import EventCache from "../helper/EventCache";
import EventHandler from "../event/EventHandler";
import EventObject from "../event/EventObject";

import type Geomtoy from "..";
import type { EventTargetEventsPair, EventObjectFromPair } from "../types";

const eventsSplitterReg = /\s+/;
const eventPatternAnyReg = /^(\w+\|){1,}\w+$/i;
const eventPatternAnySplitter = "|";
const eventNameForAny = "any";

const eventPatternAllReg = /^(\w+\&){1,}\w+$/i;
const eventPatternAllSplitter = "&";
const eventNameForAll = "all";

const onEventHandlerDefaultPriority = 1;
const bindEventHandlerDefaultPriority = 1000;

// Below is a hack and not type strong way to achieve `abstract static` members which `Typescript` do not support now.
interface EventTarget {
    constructor: Function & {
        readonly events: {
            [key: string]: string;
        };
    };
}
abstract class EventTarget extends BaseObject {
    private _scheduler = schedulerOf(this.owner);
    private _muted = false;

    constructor(owner: Geomtoy) {
        super(owner);
    }

    get muted() {
        return this._muted;
    }
    mute() {
        this._muted = true;
    }
    unmute() {
        this._muted = false;
    }

    // event name-handlers map
    private _eventMap: EventHandler[] = [];

    // event names holder to collect the event names triggered in each loop and automatically remove duplicates
    /* 
    We use a `Set` here not only for the auto removal of duplicates but also because the `forEach` method of `Set` 
    can visit the values newly added during the `forEach`. This is a significant and few people mentioned difference between `Set` and `Array`.
    @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach
    */
    private _eventCache: EventCache<typeof this> = new EventCache();

    // event scheduled flag to mark if we have told the scheduler ready to go(put the event handlers of triggered events of this `EventTarget` in its queue)
    private _eventScheduled: boolean = false;

    // event handling flag to mark if the event handlers of triggered events of this `EventTarget` are now being invoked
    private _eventHandling: boolean = false;

    private _addHandler(eventPattern: string, callback: (...args: any[]) => void, context: EventTarget, relatedTargets: undefined | EventTarget[], priority: number, hasRecursiveEffect: boolean) {
        const hs = this._eventMap;
        const handler = new EventHandler(eventPattern, callback, context, relatedTargets, priority, hasRecursiveEffect);
        hs.push(handler);
        // From max to in according to priority.
        hs.sort((a, b) => b.priority - a.priority);
    }
    private _removeHandler(eventPattern: string, callback: (...args: any[]) => void, context: EventTarget) {
        const hs = this._eventMap;
        const index = hs.findIndex(h => h.eventPattern === eventPattern && h.callback === callback && h.context === context);
        if (index != -1) hs.splice(index, 1);
    }
    private _hasHandler(eventPattern: string, callback: (...args: any[]) => void, context: EventTarget) {
        const hs = this._eventMap;
        return hs.findIndex(h => h.eventPattern === eventPattern && h.callback === callback && h.context === context) != -1;
    }
    private _hasEvent(eventName: string) {
        if(eventName === eventNameForAll) return true
        if(eventName === eventNameForAny) return true

        return Object.values(this.constructor.events).includes(eventName);
    }

    // events: a string joint some event patterns like: "x|y radius"
    // eventPattern: a pure event name or a pattern of event name like: "x|y"
    // eventName: a pure event name like: "x"

    private _getEventObjectsFromCache(eventPattern: string) {
        if (eventPatternAnyReg.test(eventPattern)) {
            let origin: EventObject<typeof this> = undefined as unknown as EventObject<typeof this>;
            return eventPattern.split(eventPatternAnySplitter).some(n => {
                const objects = this._eventCache.filter(n);
                if (objects.length > 0) {
                    origin = util.head(objects)!;
                    return true;
                }
                return false;
            })
                ? [EventObject.composedAny(this, eventPattern, origin)]
                : null;
        }
        if (eventPatternAllReg.test(eventPattern)) {
            let origins: EventObject<typeof this>[] = [];
            return eventPattern.split(eventPatternAllSplitter).every(n => {
                const objects = this._eventCache.filter(n);
                if (objects.length > 0) {
                    origins.push(util.head(objects)!);
                    return true;
                }
                return false;
            })
                ? [EventObject.composedAll(this, eventPattern, origins)]
                : null;
        }

        const objects = this._eventCache.filter(eventPattern);
        return objects.length > 0 ? objects : null;
    }

    private _parseEvents(events: string) {
        const patterns = events.trim().split(eventsSplitterReg);

        return patterns.filter(p => {
            if (eventPatternAnyReg.test(p)) {
                return p.split(eventPatternAnySplitter).some(n => {
                    return !this._hasEvent(n) ? (console.warn(`[G]There is no event named \`${n}\` in \`${this.name}\` which is contained in \`${p}\`, so it will be ignored.`), true) : false;
                })
                    ? false
                    : true;
            }

            if (eventPatternAllReg.test(p)) {
                return p.split(eventPatternAllSplitter).some(n => {
                    return !this._hasEvent(n) ? (console.warn(`[G]There is no event named \`${n}\` in \`${this.name}\` which is contained in \`${p}\`, so it will be ignored.`), true) : false;
                })
                    ? false
                    : true;
            }

            return !this._hasEvent(p) ? (console.warn(`[G]There is no event named \`${p}\` in \`${this.name}\` , so it will be ignored.`), false) : true;
        });
    }

    on<T extends typeof this>(
        events: string,
        callback: (this: this, arg: EventObject<T>) => void,
        {
            priority = onEventHandlerDefaultPriority,
            hasRecursiveEffect = false
        }: Partial<{
            priority: number;
            hasRecursiveEffect: boolean;
        }> = {}
    ) {
        assert.isString(events, "events");
        assert.isFunction(callback, "callback");
        assert.isRealNumber(priority, "priority");
        assert.isBoolean(hasRecursiveEffect, "hasRecursiveEffect");

        this._parseEvents(events).forEach(p => {
            if (this._hasHandler(p, callback, this))
                return console.warn(`[G]An event handler with the same event pattern \`${p}\`, callback and context \`${this}\` already exists in \`${this}\`, so it will be ignored.`);
            this._addHandler(p, callback, this, undefined, priority, hasRecursiveEffect);
        });
        return this;
    }
    off(events: string, callback: (...args: any[]) => void) {
        assert.isString(events, "events");
        assert.isFunction(callback, "callback");

        this._parseEvents(events).forEach(p => {
            this._removeHandler(p, callback, this);
        });
        return this;
    }
    clear(events?: string) {
        events !== undefined && assert.isString(events, "events");

        if (events === undefined) {
            this._eventMap = [];
            return this;
        }

        const hs = this._eventMap;
        this._parseEvents(events).forEach(p => {
            const index = hs.findIndex(h => h.eventPattern === p);
            if (index != -1) hs.splice(index, 1);
        });
        return this;
    }

    private _translateAny() {
        return Object.values(this.constructor.events).join(eventPatternAnySplitter);
    }
    private _translateAll() {
        return Object.values(this.constructor.events).join(eventPatternAllSplitter);
    }

    private _schedule() {
        this._eventScheduled = true;
        this._scheduler.queue(() => {
            // #region Event Handling Logic
            //
            // While an event handler of this `EventTarget` is being invoked:
            // Or we can also say —— While the scheduler is flushing the queue item of this `EventTarget` in current loop:
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
            //     - other `EventTarget`s:
            //         ! CAN be added, whether to be invoked in current loop, it DEPENDS
            //         If other `EventTarget`s have complete its event handling, the newly added event handlers have to wait for the next loop,
            //         otherwise the newly added event handlers will be added,
            //         and will be invoked when it is the turn of other `EventTarget`s to do their event handling in current loop.
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
            //     - other `EventTarget`s:
            //         ! CAN be remove, whether to be invoked in current loop, it DEPENDS
            //         If other `EventTarget`s have complete its event handling, the event handlers have already been invoked we can not do nothing,
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
            //     - other `EventTarget`:
            //         ! ALWAYS
            //         We must be able to trigger the events of other `EventTarget`s, otherwise it will not be responsive.
            //         But notice here: A-->B-x->A:
            //             The change of A causes the change of B,
            //             but the event handling of the change of B can no longer cause the same change of A,
            //             otherwise it will be an infinite loop. Don't worry, the scheduler will care about this.
            // #endregion

            this._eventHandling = true;

            //Copy the event handlers in order to make it unchangeable during the event handling.
            const handlingCopy = [...this._eventMap];
            handlingCopy.forEach(h => {
                const pattern = h.eventPattern === eventNameForAny ? this._translateAny() : h.eventPattern === eventNameForAll ? this._translateAll() : h.eventPattern;

                let result = this._getEventObjectsFromCache(pattern);
                if (result !== null) {
                    // Handler with recursive effect will only be invoked once!
                    if (this._scheduler.isMarked(h.callback, h.context) && h.hasRecursiveEffect) return;

                    result.forEach(eo => {
                        if (h.relatedTargets !== undefined) {
                            h.callback.call(
                                h.context,
                                h.relatedTargets.map(target => (target === this ? eo : EventObject.empty(target)))
                            );
                        } else {
                            h.callback.call(h.context, eo);
                        }
                    });

                    // So the same callback(such as in the `bind` method) bound to multiple events of multiple objects will not be invoked multiple times.
                    this._scheduler.mark(h.callback, h.context);
                }
            });

            this._eventCache.clear();
            this._eventHandling = false;
            this._eventScheduled = false;
        });
        if (!this._scheduler.flushed) this._scheduler.flushQueue();
    }

    protected trigger_(eventObject: EventObject<typeof this>) {
        if (this._muted) return this;
        // Here we put the triggering event name in to the `_eventCache` instead of directly invoking the event handlers in the event.
        // Doing so to avoid repeatedly invoking the event handlers in one loop.
        // No matter how many times an event of `EventTarget` is triggered,
        // we only need to record here, the event has been triggered, and the event handlers of it need to be invoked.
        if (!this._eventCache.has(eventObject)) this._eventCache.add(eventObject);
        // If the event handling of this `EventTarget` is in progress,
        // only uncached events can have their callbacks unmarked.
        // We can't change the invoking status of the callbacks of cached event.

        // If the events of this `EventTarget` has not been scheduled, then schedule it.
        if (!this._eventScheduled) this._schedule();
        return this;
    }

    private _parsePairs(pairs: EventTargetEventsPair[]) {
        const ret = {
            targets: [] as EventTarget[],
            pairs: [] as [EventTarget, string][]
        };
        pairs.forEach(pair => {
            if (pair[0] instanceof EventTarget && util.isString(pair[1])) {
                ret.targets.push(pair[0]);
                ret.pairs.push(pair);
            } else {
                console.warn(`[G]The \`eventTargetEventsPair\` contains a pair: \`${pair}\` which is not valid, so it will be ignored.`);
            }
        });
        return ret;
    }

    bind<T extends EventTargetEventsPair[]>(
        eventTargetEventsPairs: [...T],
        callback: (this: this, arg: [...EventObjectFromPair<T>]) => void,
        {
            immediately = true,
            priority = bindEventHandlerDefaultPriority,
            hasRecursiveEffect = false
        }: Partial<{
            immediately: boolean;
            priority: number;
            hasRecursiveEffect: boolean;
        }> = {}
    ) {
        assert.isArray(eventTargetEventsPairs, "eventTargetEventsPairs");
        assert.isFunction(callback, "callback");
        assert.isBoolean(immediately, "immediately");
        assert.isRealNumber(priority, "priority");
        assert.isBoolean(hasRecursiveEffect, "hasRecursiveEffect");

        let immediatelyCalled = false;
        const { targets, pairs } = this._parsePairs(eventTargetEventsPairs);
        pairs.forEach(te => {
            const [target, events] = te;
            this._parseEvents(events).forEach(p => {
                if (target._hasHandler(p, callback, this)) {
                    return console.warn(`[G]An event handler with the same event pattern \`${p}\`, callback and context \`${this}\` already exists in \`${target}\`, so it will be ignored.`);
                }
                target._addHandler(p, callback, this, targets, priority, hasRecursiveEffect);

                if (immediately && !immediatelyCalled) {
                    callback.call(
                        this,
                        targets.map(target => EventObject.empty(target))
                    );
                    immediatelyCalled = true;
                }
            });
        });
        return this;
    }

    unbind(eventTargetEventsPairs: EventTargetEventsPair[], callback: (...args: any[]) => void) {
        assert.isArray(eventTargetEventsPairs, "eventTargetEventsPairs");
        assert.isFunction(callback, "callback");

        const { pairs } = this._parsePairs(eventTargetEventsPairs);
        pairs.forEach(te => {
            const [target, events] = te;
            this._parseEvents(events).forEach(p => {
                target._removeHandler(p, callback, this);
            });
        });
        return this;
    }
}

/**
 * @category Base
 */
export default EventTarget;

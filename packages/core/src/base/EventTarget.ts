import { Assert, Type, Utility } from "@geomtoy/util";
import EventCache from "../event/EventCache";
import { EVENT_ALL, EVENT_ANY, EVENT_PATTERN_ALL_REG, EVENT_PATTERN_ALL_SPLITTER, EVENT_PATTERN_ANY_REG, EVENT_PATTERN_ANY_SPLITTER } from "../event/EventConst";
import EventHandler from "../event/EventHandler";
import EventObject from "../event/EventObject";
import EventSourceObject from "../event/EventSourceObject";
import { scheduler } from "../geomtoy";
import { DISABLE_STATE_SYMBOL, STATE_IDENTIFIER_SYMBOL } from "../misc/decor-stated";
import type { BindParameters, EventHandlerOptions, EventObjectsFromPairs, EventPair } from "../types";
import BaseObject from "./BaseObject";

const ON_EVENT_HANDLER_DEFAULT_PRIORITY = 1;
const BIND_EVENT_HANDLER_DEFAULT_PRIORITY = 1000;

export default abstract class EventTarget extends BaseObject {
    private _muted = false;

    get muted() {
        return this._muted;
    }

    static readonly events: { [key: string]: string };
    static readonly eventAny = EVENT_ANY;
    static readonly eventAll = EVENT_ALL;

    /**
     * Disable the event triggering of EventTarget `this`.
     */
    mute() {
        this._muted = true;
    }
    /**
     * Enable the event triggering of EventTarget `this`.(default behavior)
     */
    unmute() {
        this._muted = false;
    }

    static composeAny(...eventNames: string[]) {
        return eventNames.join(EVENT_PATTERN_ANY_SPLITTER);
    }
    static composeAll(...eventNames: string[]) {
        return eventNames.join(EVENT_PATTERN_ALL_SPLITTER);
    }

    // event-handlers map
    private _eventMap: EventHandler[] = [];

    // event names holder to collect the event names triggered in each loop and automatically remove duplicates
    /* 
    We use a `Set` here not only for the auto removal of duplicates but also because the `forEach` method of `Set` 
    can visit the values newly added during the `forEach`. This is a significant and few people mentioned difference between `Set` and `Array`.
    @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach
    */
    private _eventCache: EventCache<this> = new EventCache(this);

    // event scheduled flag to mark if we have told the scheduler ready to go(put the event handlers of triggered events of this `EventTarget` in its queue)
    private _eventScheduled = false;

    private _addHandler(event: string, callback: (...args: any) => void, context: EventTarget, relatedTargets: null | EventTarget[], priority: number, debounce: number = 0) {
        const handler = new EventHandler(event, callback, context, relatedTargets, priority, debounce);
        this._eventMap.push(handler);
        // From max to min according to priority.
        this._eventMap.sort((a, b) => b.priority - a.priority);
    }
    private _removeHandler(event: string, callback: (...args: any) => void, context: EventTarget) {
        const index = this._eventMap.findIndex(h => h.event === event && h.callback === callback && h.context === context);
        if (index !== -1) this._eventMap.splice(index, 1);
    }
    private _hasHandler(event: string, callback: (...args: any) => void, context: EventTarget) {
        return this._eventMap.findIndex(h => h.event === event && h.callback === callback && h.context === context) !== -1;
    }

    private _parseEvent(event: string) {
        event = event.trim();

        const definedEventNames = Object.values((this.constructor as typeof EventTarget).events);

        // parse keyword "any" and "all"
        if (event === EVENT_ANY) return definedEventNames.join(EVENT_PATTERN_ANY_SPLITTER);
        if (event === EVENT_ALL) return definedEventNames.join(EVENT_PATTERN_ALL_SPLITTER);

        // parse logical pattern "any", and reorder the event names
        if (EVENT_PATTERN_ANY_REG.test(event)) {
            const eventNames = event.split(EVENT_PATTERN_ANY_SPLITTER);
            if (
                eventNames.some(n => {
                    return !definedEventNames.includes(n)
                        ? (console.warn(`[G]There is no event named \`${n}\` in \`${this.name}\` which is contained in \`${event}\`, so it will be ignored.`), true)
                        : false;
                })
            )
                return false;
            eventNames.sort((a, b) => definedEventNames.indexOf(a) - definedEventNames.indexOf(b));
            return eventNames.join(EVENT_PATTERN_ANY_SPLITTER);
        }

        // parse logical pattern "all", and reorder the event names
        if (EVENT_PATTERN_ALL_REG.test(event)) {
            const eventNames = event.split(EVENT_PATTERN_ALL_SPLITTER);
            if (
                eventNames.some(n => {
                    return !definedEventNames.includes(n)
                        ? (console.warn(`[G]There is no event named \`${n}\` in \`${this.name}\` which is contained in \`${event}\`, so it will be ignored.`), true)
                        : false;
                })
            )
                return false;
            eventNames.sort((a, b) => definedEventNames.indexOf(a) - definedEventNames.indexOf(b));
            return eventNames.join(EVENT_PATTERN_ALL_SPLITTER);
        }

        return !definedEventNames.includes(event) ? (console.warn(`[G]There is no event named \`${event}\` in \`${this.name}\` , so it will be ignored.`), false) : event;
    }

    on(onOptions: EventHandlerOptions, event: string, callback: (this: this, arg: EventObject<this>) => void): this;
    on(event: string, callback: (this: this, arg: EventObject<this>) => void): this;
    on(arg0: any, arg1: any, arg2?: any) {
        let priority = ON_EVENT_HANDLER_DEFAULT_PRIORITY;
        let debounce = 0;
        let immediately = true;

        let event: string;
        let callback: (this: this, arg: EventObject<this>) => void;

        if (Type.isPlainObject(arg0)) {
            if (arg0.priority !== undefined) {
                priority = arg0.priority;
                Assert.isRealNumber(priority, "priority");
            }
            if (arg0.debounce !== undefined) {
                debounce = arg0.debounce;
                Assert.isRealNumber(debounce, "debounce");
            }
            if (arg0.immediately !== undefined) {
                immediately = arg0.immediately;
            }

            event = arg1;
            callback = arg2;
        } else {
            event = arg0;
            callback = arg1;
        }

        const parsedEvent = this._parseEvent(event);
        if (!parsedEvent) return this;
        if (this._hasHandler(parsedEvent, callback, this))
            return console.warn(`[G]An event handler with the same event \`${parsedEvent}\`, callback and context \`${this}\` already exists in \`${this}\`, so it will be ignored.`), this;

        this._addHandler(parsedEvent, callback, this, null, priority, debounce);
        if (immediately) {
            callback.call(this, EventObject.empty(this));
        }
        return this;
    }
    off(event: string, callback?: (...args: any) => void) {
        const parsedEvent = this._parseEvent(event);
        if (!parsedEvent) return this;
        if (callback === undefined) {
            let l = this._eventMap.length - 1;
            while (l >= 0) {
                if (this._eventMap[l].event === parsedEvent && this._eventMap[l].context === this) {
                    this._eventMap.splice(l, 1);
                }
                l--;
            }
        } else {
            this._removeHandler(parsedEvent, callback, this);
        }
        return this;
    }
    clearOn() {
        let l = this._eventMap.length - 1;
        while (l >= 0) {
            if (this._eventMap[l].context === this) {
                this._eventMap.splice(l, 1);
            }
            l--;
        }
    }
    clearBind() {
        let l = this._eventMap.length - 1;
        while (l >= 0) {
            if (this._eventMap[l].context !== this) {
                this._eventMap.splice(l, 1);
            }
            l--;
        }
    }
    clear() {
        this._eventMap.length = 0;
    }

    private _schedule() {
        this._eventScheduled = true;
        scheduler.queue(() => {
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

            //Copy the event handlers in order to make it unchangeable during the event handling.
            const handlingCopy = [...this._eventMap];
            handlingCopy.forEach(h => {
                const eventObject = this._eventCache.query(h.event);
                if (eventObject !== null) {
                    // Handler with will only be invoked once during one loop!
                    if (scheduler.isMarked(h.callbackToInvoke, h.context)) return;

                    if (h.relatedTargets !== null) {
                        h.callbackToInvoke.call(h.context, ...h.relatedTargets.map(target => (target === this ? eventObject : EventObject.empty(target))));
                    } else {
                        h.callbackToInvoke.call(h.context, eventObject);
                    }
                    // So the same callback(such as in the `bind` method) bound to multiple events of multiple objects will not be invoked multiple times.
                    scheduler.mark(h.callbackToInvoke, h.context);
                }
            });

            this._eventCache.clear();
            this._eventScheduled = false;
        });
        scheduler.tick();
    }

    private [STATE_IDENTIFIER_SYMBOL]?: number;

    // concrete class should call this method in the end of its `constructor`
    protected initState_() {
        this[STATE_IDENTIFIER_SYMBOL] = Utility.now();
    }

    /** @internal */
    [DISABLE_STATE_SYMBOL] = false;

    protected trigger_<T extends EventTarget>(this: T, eso: EventSourceObject<T>) {
        // If we are constructing, then we have no state yet, so do nothing.
        if (this[STATE_IDENTIFIER_SYMBOL] === undefined) return this;

        // If we are muted, also need to change the our state.
        this[STATE_IDENTIFIER_SYMBOL] = eso.timestamp;
        // If we are muted, also need to tell that ourself is changed.
        scheduler.record(this);

        if (this._muted) return this;
        // Here we put the triggering event name in to the `_eventCache` instead of directly invoking the event handlers in the event.
        // Doing so to avoid repeatedly invoking the event handlers in one loop.
        // No matter how many times an event of `EventTarget` is triggered,
        // we only need to record here, the event has been triggered, and the event handlers of it need to be invoked.
        this._eventCache.record(eso);
        // If the event handling of this `EventTarget` is in progress,
        // only uncached events can have their callbacks unmarked.
        // We can't change the invoking status of the callbacks of cached event.

        // If the events of this `EventTarget` has not been scheduled, then schedule it.
        if (!this._eventScheduled) this._schedule();
        return this;
    }

    private _parsePairs(pairs: EventPair[]) {
        const ret = {
            targets: [] as EventTarget[],
            pairs: [] as [EventTarget, string][]
        };
        pairs.forEach(pair => {
            ret.targets.push(pair[0]);
            ret.pairs.push(pair);
        });
        return ret;
    }

    private _binding = new Set<EventTarget>();

    bind<T extends EventPair[]>(bindOptions: EventHandlerOptions, ...bindParameters: BindParameters<T, this>): this;
    bind<T extends EventPair[]>(...bindParameters: BindParameters<T, this>): this;
    bind<T extends EventPair[]>(...args: any) {
        let immediately = true;
        let priority = BIND_EVENT_HANDLER_DEFAULT_PRIORITY;
        let debounce = 0;

        let bindParameters: BindParameters<T, this>;

        if (Type.isPlainObject(args[0])) {
            const arg0 = Utility.head(args)! as EventHandlerOptions;
            if (arg0.priority !== undefined) {
                priority = arg0.priority;
                Assert.isRealNumber(priority, "priority");
            }
            if (arg0.debounce !== undefined) {
                debounce = arg0.debounce;
                Assert.isRealNumber(debounce, "debounce");
            }
            if (arg0.immediately !== undefined) {
                immediately = arg0.immediately;
            }

            bindParameters = Utility.tail(args) as BindParameters<T, this>;
        } else {
            bindParameters = args as BindParameters<T, this>;
        }

        const eventPairs = Utility.initial(bindParameters) as T;
        const callback = Utility.last(bindParameters)! as (this: this, ...args: EventObjectsFromPairs<T>) => void;

        let immediatelyCalled = false;
        const { targets, pairs } = this._parsePairs(eventPairs);

        pairs.forEach(te => {
            const [target, event] = te;
            const parsedEvent = target._parseEvent(event);

            if (!parsedEvent) return;

            if (target._hasHandler(parsedEvent, callback, this)) {
                return console.warn(`[G]An event handler with the same event \`${parsedEvent}\`, callback and context \`${this}\` already exists in \`${target}\`, so it will be ignored.`);
            }
            target._addHandler(parsedEvent, callback, this, targets, priority, debounce);
            this._binding.add(target);

            if (immediately && !immediatelyCalled) {
                callback.call(this, ...(targets.map(target => EventObject.empty(target)) as EventObjectsFromPairs<T>));
                immediatelyCalled = true;
            }
        });
        return this;
    }

    unbind(eventPair: EventPair[], callback?: (...args: any) => void) {
        const { pairs } = this._parsePairs(eventPair);
        pairs.forEach(te => {
            const [target, event] = te;
            const parsedEvent = target._parseEvent(event);
            if (!parsedEvent) return;
            if (callback === undefined) {
                let l = target._eventMap.length - 1;
                while (l >= 0) {
                    if (target._eventMap[l].event === parsedEvent && target._eventMap[l].context === this) {
                        target._eventMap.splice(l, 1);
                    }
                    l--;
                }
            } else {
                target._removeHandler(parsedEvent, callback, this);
            }
            if (target._eventMap.findIndex(h => h.context === this) === -1) {
                this._binding.delete(target);
            }
        });
        return this;
    }
    unbindAlt(eventTargets: EventTarget[], callback?: (...args: any) => void) {
        eventTargets.forEach(et => {
            if (callback === undefined) {
                let l = et._eventMap.length - 1;
                while (l >= 0) {
                    if (et._eventMap[l].context === this) {
                        et._eventMap.splice(l, 1);
                    }
                    l--;
                }
                this._binding.delete(et);
            } else {
                let l = et._eventMap.length - 1;
                while (l >= 0) {
                    if (et._eventMap[l].context === this && et._eventMap[l].callback === callback) {
                        et._eventMap.splice(l, 1);
                    }
                    l--;
                }
                if (et._eventMap.findIndex(h => h.context === this) === -1) this._binding.delete(et);
            }
        });
        return this;
    }
    unbindAll() {
        this.unbindAlt([...this._binding]);
    }
}

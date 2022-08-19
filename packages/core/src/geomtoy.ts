import { Utility } from "@geomtoy/util";
import EventTarget from "./base/EventTarget";
import { Options, RecursivePartial } from "./types";

const SCHEDULER_FLUSH_TIMEOUT = 1000; //1000ms
const DEFAULT_OPTIONS: Options = {
    epsilon: 2 ** -32,
    curveEpsilon: 2 ** -16,
    graphics: {
        point: {
            size: 6,
            appearance: "circle" // global default
        },
        arrow: {
            width: 5,
            length: 10,
            foldback: 0,
            noFoldback: true
        },
        lineArrow: true,
        vectorArrow: true,
        rayArrow: true,
        polygonSegmentArrow: true,
        pathSegmentArrow: true
    }
};

const optioner = {
    options: Utility.cloneDeep(DEFAULT_OPTIONS),

    getOptions() {
        return Utility.cloneDeep(this.options);
    },
    setOptions(options: RecursivePartial<Options>) {
        Utility.assignDeep(this.options, options);
        this.applyOptionsRules();
    },
    applyOptionsRules() {
        if (this.options.epsilon > 2 ** -16) this.options.epsilon = 2 ** -16;
        if (this.options.epsilon < 2 ** -52) this.options.epsilon = 2 ** -52;
    }
};

const scheduler = {
    callbackMarkMap: new Map<(...args: any[]) => void, WeakSet<EventTarget>>(),

    mark(callback: (...args: any[]) => void, context: EventTarget) {
        if (!this.callbackMarkMap.has(callback)) this.callbackMarkMap.set(callback, new WeakSet());
        const contexts = this.callbackMarkMap.get(callback)!;
        contexts.add(context);
    },

    isMarked(callback: (...args: any[]) => any, context: EventTarget) {
        if (!this.callbackMarkMap.has(callback)) return false;
        const contexts = this.callbackMarkMap.get(callback)!;
        return contexts.has(context);
    },

    clearMark() {
        this.callbackMarkMap.clear();
    },

    internalQueue: [] as ((...args: any) => any)[],
    externalQueue: [] as ((...args: any) => any)[],

    flushed: false,

    flushQueue() {
        // We now do the final flush the queue to end the current loop.
        // First set the flag.
        this.flushed = true;
        // Use a resolved `Promise` to do the microtask. Try queueMicrotask() ?
        Promise.resolve().then(() => {
            const timeOrigin = Utility.now();
            while (this.internalQueue.length !== 0) {
                this.internalQueue.shift()!();
                if (Utility.now() - timeOrigin > SCHEDULER_FLUSH_TIMEOUT) {
                    console.error(
                        "[G]Geomtoy stopped the event handling for there could be some mistakes in your code like circular event triggering causing an infinite recursion. Please check your code."
                    );
                    break;
                }
            }
            this.clearMark();
            while (this.externalQueue.length !== 0) {
                // We don’t care if there is an infinite recursion in `nextTick`.
                this.externalQueue.shift()!();
            }
            this.flushed = false;
        });
    },
    queue(objectSchedule: () => any) {
        this.internalQueue.push(objectSchedule);
        if (!this.flushed) this.flushQueue();
    },
    nextTick(todo: () => any) {
        if (this.externalQueue.includes(todo)) return;

        this.externalQueue.push(todo);
        if (!this.flushed) this.flushQueue();
    }
};

export { optioner, scheduler };

const getOptions = optioner.getOptions.bind(optioner);
const setOptions = optioner.setOptions.bind(optioner);
const nextTick = scheduler.nextTick.bind(scheduler);

export default {
    getOptions,
    setOptions,
    nextTick
};

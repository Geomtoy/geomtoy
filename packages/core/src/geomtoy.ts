import { Maths, Utility } from "@geomtoy/util";
import EventTarget from "./base/EventTarget";
import Shape from "./base/Shape";
import { Options, PointAppearance, RecursivePartial } from "./types";

const SCHEDULER_FLUSH_TIMEOUT = 1000; //1000ms
const DEFAULT_OPTIONS: Options = {
    epsilon: {
        epsilon: 2 ** -26, // coordinates, length, length square, size, etc. comparison
        coefficientEpsilon: 2 ** -12, // polynomial, parametric equation, implicit function coefficient comparison
        trigonometricEpsilon: 2 ** -16, // trigonometric function values comparison
        complexEpsilon: 2 ** -16, // complex parts comparison
        timeEpsilon: 2 ** -16, // nth bezier time comparison
        angleEpsilon: Maths.PI / 72000, // angle comparison
        vectorEpsilon: 2 ** -14 // cross product, dot product etc comparison
    },
    graphics: {
        point: {
            size: 6,
            appearance: "circle" as PointAppearance // global default
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
        polygonSegmentArrow: false,
        pathSegmentArrow: false
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
        if (this.options.epsilon.epsilon > 2 ** -16) this.options.epsilon.epsilon = 2 ** -16;
        if (this.options.epsilon.epsilon < 2 ** -52) this.options.epsilon.epsilon = 2 ** -52;
    }
};

const scheduler = {
    callbackMarkMap: new Map<(...args: any) => void, WeakSet<EventTarget>>(),
    presentShapeSet: new Set<Shape>(),

    mark(callback: (...args: any) => void, context: EventTarget) {
        if (!this.callbackMarkMap.has(callback)) this.callbackMarkMap.set(callback, new WeakSet());
        const contexts = this.callbackMarkMap.get(callback)!;
        contexts.add(context);
    },

    isMarked(callback: (...args: any) => void, context: EventTarget) {
        if (!this.callbackMarkMap.has(callback)) return false;
        const contexts = this.callbackMarkMap.get(callback)!;
        return contexts.has(context);
    },

    clearMark() {
        this.callbackMarkMap.clear();
    },

    record(et: EventTarget) {
        if (et instanceof Shape) this.presentShapeSet.add(et);
    },
    clearRecord() {
        this.presentShapeSet.clear();
    },

    // three queues
    // - Internal tasks that complete the entire computing process, and are executed and cleared on every tick.
    internalQueue: [] as (() => void)[],
    // - External "one-shot" tasks, and are executed and cleared in the next tick.
    externalQueueNext: [] as (() => void)[],
    externalQueueNextAlt: [] as (() => void)[],
    // - External tasks that are always executed on every tick and are never cleared.
    externalQueueAll: [] as ((presentShapeSet: Set<Shape>) => void)[],

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

            for (const fn of [...this.externalQueueAll]) fn(this.presentShapeSet);
            this.clearRecord();

            [this.externalQueueNextAlt, this.externalQueueNext] = [this.externalQueueNext, this.externalQueueNextAlt];
            while (this.externalQueueNextAlt.length !== 0) {
                this.externalQueueNextAlt.shift()!();
            }

            this.flushed = false;
        });
    },

    queue(fn: () => void) {
        this.internalQueue.push(fn);
    },
    tick() {
        if (!this.flushed) this.flushQueue();
    },
    nextTick(fn: () => void) {
        if (this.externalQueueNext.includes(fn)) return;
        this.externalQueueNext.push(fn);
    },
    allTick(fn: (presentShapeSet: Set<Shape>) => void, remove = false) {
        const index = this.externalQueueAll.indexOf(fn);
        if (index !== -1) {
            if (remove) this.externalQueueAll.splice(index, 1);
            return;
        }
        this.externalQueueAll.push(fn);
    }
};

const eps = optioner.options.epsilon;

export { optioner, eps, scheduler };

const getOptions = optioner.getOptions.bind(optioner);
const setOptions = optioner.setOptions.bind(optioner);
const nextTick = scheduler.nextTick.bind(scheduler);
const allTick = scheduler.allTick.bind(scheduler);
const tick = scheduler.tick.bind(scheduler);

export default {
    getOptions,
    setOptions,
    nextTick,
    allTick,
    tick
};

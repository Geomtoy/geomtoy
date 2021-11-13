import Geomtoy from ".."
import EventTarget from "../base/EventTarget"

const flushTimeout = 1000 //1000ms

const schedulerMap: WeakMap<Geomtoy, Scheduler> = new WeakMap()

class Scheduler {
    public callbacksMarker = new WeakMap<(...args: any[]) => any, WeakSet<EventTarget>>()

    public markCallback(callback: (...args: any[]) => any, context: EventTarget) {
        if (!this.callbacksMarker.has(callback)) this.callbacksMarker.set(callback, new WeakSet())
        const contexts = this.callbacksMarker.get(callback)!
        contexts.add(context)
    }
    public unmarkCallback(callback: (...args: any[]) => any, context: EventTarget) {
        if (!this.callbacksMarker.has(callback)) return
        const contexts = this.callbacksMarker.get(callback)!
        contexts.delete(context)
    }
    public isCallbackInvokedBy(callback: (...args: any[]) => any, context: EventTarget) {
        if (!this.callbacksMarker.has(callback)) return false
        const contexts = this.callbacksMarker.get(callback)!
        return contexts.has(context)
    }

    public internalQueue: ((...args: any) => any)[] = []
    public externalQueue: ((...args: any) => any)[] = []

    public flushed = false

    public flushQueue() {
        // We now do the final flush the queue to end the current loop.
        // First set the flag.
        this.flushed = true
        // Use a resolved `Promise` to do the `microtask`. Try queueMicrotask() ?
        Promise.resolve().then(() => {
            const timeOrigin = Date.now()
            while (this.internalQueue.length !== 0) {
                this.internalQueue.shift()!()
                if (Date.now() - timeOrigin > flushTimeout) {
                    console.error(
                        "[G]Geomtoy stopped the event handling for there could be some mistakes in your code like circular event triggering causing an infinite recursion. Please check your code."
                    )
                    break
                }
            }
            while (this.externalQueue.length !== 0) {
                // We don’t care if there is an infinite recursion in `nextTick`.
                this.externalQueue.shift()!()
            }
            this.flushed = false
        })
    }
    public queue(objectSchedule: () => any) {
        this.internalQueue.push(objectSchedule)
    }
    public nextTick(todo: () => any) {
        this.externalQueue.push(todo)
    }
}

export function schedulerOf(g: Geomtoy) {
    if(!schedulerMap.has(g)) schedulerMap.set(g, new Scheduler())
    return schedulerMap.get(g)!
}

export default Scheduler

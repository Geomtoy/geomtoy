import type EventTarget from "../base/EventTarget";

export default class EventHandler {
    callbackToInvoke: (...args: any) => void;

    constructor(
        public event: string,
        public callback: (...args: any) => void,
        public context: EventTarget,
        public relatedTargets: null | EventTarget[],
        public priority: number,
        public debounce: number
    ) {
        if (debounce === 0) {
            this.callbackToInvoke = callback;
        } else {
            this.callbackToInvoke = this._debounce(callback, debounce);
        }
    }
    // Delay the first execution and ensure the last execution.
    private _debounce(fn: (...args: any) => void, wait: number) {
        let timer: any;
        return function (this: any, ...args: any) {
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn.call(this, ...args);
            }, wait);
        };
    }
}

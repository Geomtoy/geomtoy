import type EventTarget from "../base/EventTarget";
export default class EventHandler {
    constructor(
        public eventPattern: string,
        public callback: (...args: any[]) => void,
        public context: EventTarget,
        public relatedTargets: undefined | EventTarget[],
        public priority: number,
        public hasRecursiveEffect: boolean
    ) {}
}

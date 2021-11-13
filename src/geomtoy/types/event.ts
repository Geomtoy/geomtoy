import EventTarget from "../base/EventTarget"

export type EventTargetEventNamesPair = EventTarget | [EventTarget, string]

export type EventTargetFromPair<T extends [...any[]]> = {
    [K in keyof T]: T[K] extends [infer R, string] ? R : T[K]
}

export const enum EventHandlerType {
    On = "on",
    Bind = "bind"
}

export type EventHandler = OnEventHandler | BindEventHandler

export type OnEventHandler = {
    callback: (e: SimpleEventObject | CollectionEventObject) => void
    context: EventTarget
    priority: number
    type: EventHandlerType.On
}
export type BindEventHandler = {
    callback: (e: EmptyEventObject | SimpleEventObject | CollectionEventObject[]) => void
    context: EventTarget
    relatedEventTargets: EventTarget[]
    priority: number
    type: EventHandlerType.Bind
}

export const enum EventObjectType {
    Empty = "empty",
    Simple = "simple",
    Collection = "collection"
}
export type EventObject = EmptyEventObject | SimpleEventObject | CollectionEventObject

export type EmptyEventObject = {
    target: EventTarget
    type: EventObjectType.Empty
}
export type SimpleEventObject = {
    target: EventTarget
    type: EventObjectType.Simple
    eventName: string
}
export type CollectionEventObject = {
    target: EventTarget
    type: EventObjectType.Collection
    eventName: string
    uuid: string
    index: number
}

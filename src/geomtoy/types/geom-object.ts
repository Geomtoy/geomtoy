import GeomObject from "../base/GeomObject"

export type GeomObjectEventNamesPair = GeomObject | [GeomObject, string]

export type GeomObjectFromPair<T extends [...any[]]> = {
    [K in keyof T]: T[K] extends [infer R, string] ? R : T[K]
}

export const enum EventHandlerType {
    On = "on",
    Bind = "bind"
}
export const OnEventHandlerDefaultPriority = 1
export const BindEventHandlerDefaultPriority = 1000

export type EventHandler = OnEventHandler | BindEventHandler

export type OnEventHandler = {
    callback: (e: SimpleEventObject | CollectionEventObject) => void
    context: GeomObject
    priority: number
    type: EventHandlerType.On
}
export type BindEventHandler = {
    callback: (e: EmptyEventObject | SimpleEventObject | CollectionEventObject[]) => void
    context: GeomObject
    relatedGeomObjects: GeomObject[]
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
    target: GeomObject
    type: EventObjectType.Empty
}
export type SimpleEventObject = {
    target: GeomObject
    type: EventObjectType.Simple
    eventName: string
}
export type CollectionEventObject = {
    target: GeomObject
    type: EventObjectType.Collection
    eventName: string
    uuid: string
    index: number
}

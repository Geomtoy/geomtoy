import ViewElement from "./ViewElement";
import ViewGroupElement from "./ViewGroupElement";

export const enum ViewEventType {
    DragStart = "dragStart",
    Dragging = "dragging",
    DragEnd = "dragEnd",
    PanStart = "panStart",
    Panning = "panning",
    PanEnd = "panEnd",
    ZoomStart = "zoomStart",
    Zooming = "zooming",
    ZoomEnd = "zoomEnd",

    PointerEnter = "pointerEnter",
    PointerMove = "pointerMove",
    PointerDown = "pointerDown",
    PointerUp = "pointerUp",
    PointerLeave = "pointerLeave"
}

export interface ViewEvent {
    isTouch: boolean;
    viewportX: number;
    viewportY: number;
    x: number;
    y: number;
}

export interface ViewDragStartEvent extends ViewEvent {
    elements: ViewElement;
}
export interface ViewDraggingEvent {
    elements: (ViewElement | ViewGroupElement)[];
}
export interface ViewDragEndEvent extends ViewEvent {
    elements: (ViewElement | ViewGroupElement)[];
}

export interface ViewPanStartEvent extends ViewEvent {}
export interface ViewPanningEvent extends ViewEvent {}
export interface ViewPanEndEvent extends ViewEvent {
    oldValue: number;
    newValue: number;
}

export interface ViewZoomStartEvent extends ViewEvent {}
export interface ViewZoomingEvent extends ViewEvent {}
export interface ViewZoomEndEvent extends ViewEvent {
    oldValue: number;
    newValue: number;
}

export interface ViewPointerEnterEvent extends ViewEvent {}

export interface ViewPointerDownEvent extends ViewEvent {
    element: null | ViewElement | ViewGroupElement;
}

export interface ViewPointerMoveEvent extends ViewEvent {
    element: null | ViewElement | ViewGroupElement;
}

export interface ViewPointerUpEvent extends ViewEvent {
    element: null | ViewElement | ViewGroupElement;
}

export interface ViewPointerLeaveEvent extends ViewEvent {}

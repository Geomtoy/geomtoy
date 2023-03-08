import ViewElement from "./ViewElement";

export const enum ViewEventType {
    PointerEnter = "pointerEnter",
    PointerLeave = "pointerLeave",
    PointerMove = "pointerMove",
    PointerDown = "pointerDown",
    PointerUp = "pointerUp",
    PointerCancel = "pointerCancel",
    Wheel = "wheel",

    DragStart = "dragStart",
    Dragging = "dragging",
    DragEnd = "dragEnd",
    PanStart = "panStart",
    Panning = "panning",
    PanEnd = "panEnd",
    ZoomStart = "zoomStart",
    Zooming = "zooming",
    ZoomEnd = "zoomEnd",

    Activate = "activate",
    Deactivate = "deactivate",
    Hover = "hover",
    Unhover = "unhover"
}
export interface ViewEvent {
    isTouch: boolean;
    viewportX: number;
    viewportY: number;
    x: number;
    y: number;
}
export function viewEvent(isTouch: boolean, viewportX: number, viewportY: number, x: number, y: number) {
    return { isTouch, viewportX, viewportY, x, y } as ViewEvent;
}

export interface ViewPointerEvent extends ViewEvent {
    original: PointerEvent | WheelEvent;
}
export function viewPointerEvent(viewEvent: ViewEvent, original: PointerEvent | WheelEvent) {
    return { ...viewEvent, original } as ViewPointerEvent;
}

// DragStart / Dragging / DragEnd
export interface ViewDragEvent extends ViewEvent {
    elements: ViewElement[];
}
export function viewDragEvent(viewEvent: ViewEvent, elements: ViewElement[]) {
    return { ...viewEvent, elements } as ViewDragEvent;
}

export interface ViewPanEvent extends ViewEvent {
    panX: number;
    panY: number;
}
export function viewPanEvent(viewEvent: ViewEvent, panX: number, panY: number) {
    return { ...viewEvent, panX, panY } as ViewPanEvent;
}

export interface ViewZoomEvent extends ViewEvent {
    zoom: number;
}
export function viewZoomEvent(viewEvent: ViewEvent, zoom: number) {
    return { ...viewEvent, zoom } as ViewZoomEvent;
}

export interface ViewHoverEvent extends ViewEvent {
    element: ViewElement;
}
export function viewHoverEvent(viewEvent: ViewEvent, element: ViewElement) {
    return { ...viewEvent, element } as ViewHoverEvent;
}

export interface ViewActivateEvent extends ViewEvent {
    elements: ViewElement[];
}
export function viewActivateEvent(viewEvent: ViewEvent, elements: ViewElement[]) {
    return { ...viewEvent, elements } as ViewActivateEvent;
}

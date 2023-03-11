import { Geomtoy, Image, SealedShapeArray, SealedShapeObject, Shape, ShapeArray, ShapeObject } from "@geomtoy/core";
import { Assert, Maths, TransformationMatrix } from "@geomtoy/util";
import PointChecker from "../helper/PointChecker";
import type Renderer from "../renderer/Renderer";
import type { Style } from "../types";
import Lasso from "./Lasso";
import SubView, { SV_VIEW_SYMBOL } from "./SubView";
import type ViewElement from "./ViewElement";
import { VE_SUB_VIEW_SYMBOL, VE_VIEW_SYMBOL } from "./ViewElement";
import {
    viewActivateEvent,
    ViewActivateEvent,
    viewDragEvent,
    ViewDragEvent,
    viewEvent,
    ViewEvent,
    ViewEventType,
    viewHoverEvent,
    ViewHoverEvent,
    viewPanEvent,
    ViewPanEvent,
    viewPointerEvent,
    ViewPointerEvent,
    viewZoomEvent,
    ViewZoomEvent
} from "./ViewEvents";

const VIEW_DEFAULTS = {
    hoverForemost: true,
    activeForemost: true,
    minZoom: 0.001,
    maxZoom: 1000,
    wheelZoomDeltaRate: 1.1,
    inverseWheelZoom: false,
    dragThrottleDistance: 10,
    maxTouchPointerCount: 2,
    resizeObserverDebouncingTime: 100, //ms
    lassoStyle: {
        paintOrder: "fill",
        noStroke: false,
        noFill: false,
        fill: "rgba(0,0,0,0.2)",
        stroke: "rgba(0,0,0,0.8)",
        strokeWidth: 1,
        strokeDash: [2],
        strokeDashOffset: 0,
        strokeLineJoin: "miter",
        strokeMiterLimit: 10,
        strokeLineCap: "butt"
    } as Style
};

export default class View {
    private _dragThrottleDistance = VIEW_DEFAULTS.dragThrottleDistance;
    private _minZoom = VIEW_DEFAULTS.minZoom;
    private _maxZoom = VIEW_DEFAULTS.maxZoom;
    private _wheelZoomDeltaRate = VIEW_DEFAULTS.wheelZoomDeltaRate;

    private _renderer!: Renderer;

    private _hasTouchDevice: boolean;
    private _touchPointers: { id: number; offset: [number, number] }[] = [];

    private _activeElements: ViewElement[] = [];
    private _hoverElement: ViewElement | null = null;
    private _indeterminateElements: ViewElement[] = [];
    private _isDragging: boolean = false;
    private _isPanning: boolean = false;
    private _isZooming: boolean = false;
    private _prepareDragging: boolean = false;
    private _preparePanning: boolean = false;
    private _prepareZooming: boolean = false;
    private _draggingOffset: [number, number] = [0, 0];
    private _panningOffset: [number, number] = [0, 0];
    private _zoomingDistance: number = 0;

    private _resizeObserver: ResizeObserver | null = null;
    private _resizeTimer = 0;

    private _elements: ViewElement[] = [];
    private _subViews: SubView[] = [];

    // The renderable `ViewElement`s are considered to be stored and arranged from the foremost to the backmost.
    private _renderables: ViewElement[] = [];
    private _interactables: ViewElement[] = [];

    private _rafTicking = false;

    constructor(
        {
            hoverForemost = VIEW_DEFAULTS.hoverForemost,
            activeForemost = VIEW_DEFAULTS.activeForemost,
            dragThrottleDistance = VIEW_DEFAULTS.dragThrottleDistance,
            minZoom = VIEW_DEFAULTS.minZoom,
            maxZoom = VIEW_DEFAULTS.maxZoom,
            wheelZoomDeltaRate = VIEW_DEFAULTS.wheelZoomDeltaRate,
            inverseWheelZoom = VIEW_DEFAULTS.inverseWheelZoom
        }: Partial<{
            hoverForemost: boolean;
            activeForemost: boolean;
            dragThrottleDistance: number;
            minZoom: number;
            maxZoom: number;
            wheelZoomDeltaRate: number;
            inverseWheelZoom: boolean;
        }>,
        renderer: Renderer
    ) {
        this.hoverForemost = hoverForemost;
        this.activeForemost = activeForemost;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.dragThrottleDistance = dragThrottleDistance;
        this.wheelZoomDeltaRate = wheelZoomDeltaRate;
        this.inverseWheelZoom = inverseWheelZoom;
        this.renderer = renderer;

        // execute rendering on every tick of `Geomtoy`
        Geomtoy.allTick(this._renderFunc);
        this._hasTouchDevice = window.matchMedia("(any-pointer: coarse)").matches || "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }

    dispose() {
        Geomtoy.allTick(this._renderFunc, true);
        this.stopResponsive();
        this.stopInteractive();
    }

    hoverForemost: boolean;
    activeForemost: boolean;
    inverseWheelZoom: boolean;

    // todo
    // snapToGrid: boolean = true;
    /**
     * *Memo
     * The `activeElements` modified not by the user interaction(`activate`, `deactivate` etc.) does not trigger an event.
     */
    /**
     * Active mode:
     *
     * `numerous`:(This requires a modifier key to do multiple activating, so it' not suitable for touch devices.)
     * - Click on a inactive element to activate it.
     * - Click on a element of active elements will deactivate active elements but this element unless start dragging.
     * - Click on another inactive element will deactivate active elements and activate the another element.
     * - Hold modifier key and click on a inactive element will activate this element and keep current active elements.
     * - Hold modifier key and click on a active element will remove this from active elements.
     * - Click on a blank area will deactivate all active elements.
     * - Hold modifier key and click on a blank area will do nothing.
     *
     * `continuous`:(This does not require extra actions to do multiple activating, so it suitable for touch devices.)
     * - Click on a inactive element to activate it.
     * - Click on a element of actives elements will deactivate this element but keep the rest active elements unless start dragging.
     * - Click on another inactive element will activate the another element and keep current active elements.
     * - Click on a blank area will deactivate all active elements.
     */
    activeMode: "numerous" | "continuous" = "continuous";
    modifierKey: "Alt" | "Shift" | "Control" = "Shift";
    // todo
    // autoSwitchActiveMode:
    // `numerous` does not suitable on touch devices, so `activeMode` will automatically switches to `continuous` if on touch devices,
    //  while if we are on PCs, `activeMode` will automatically switches to `numerous`.

    get minZoom() {
        return this._minZoom;
    }
    set minZoom(value) {
        Assert.isPositiveNumber(value, "minZoom");
        this._minZoom = value;
    }
    get maxZoom() {
        return this._maxZoom;
    }
    set maxZoom(value) {
        Assert.isPositiveNumber(value, "maxZoom");
        this._maxZoom = value;
    }
    get dragThrottleDistance() {
        return this._dragThrottleDistance;
    }
    set dragThrottleDistance(value) {
        Assert.isPositiveNumber(value, "dragThrottleDistance");
        this._dragThrottleDistance = value;
    }
    get wheelZoomDeltaRate() {
        return this._wheelZoomDeltaRate;
    }
    set wheelZoomDeltaRate(value) {
        Assert.isRealNumber(value, "wheelZoomDeltaRate");
        Assert.condition(value !== 1, "[G]The `wheelZoomDeltaRate` can not be 1.");
        this._wheelZoomDeltaRate = value;
    }
    get renderer() {
        return this._renderer;
    }
    set renderer(value) {
        this._renderer = value;
    }
    get elements() {
        return [...this._elements];
    }
    set elements(value) {
        this.empty();
        this.add(...value);
    }
    get subViews() {
        return [...this._subViews];
    }
    set subViews(value) {
        this.emptySubView();
        this.addSubView(...value);
    }

    get activeElements() {
        return [...this._activeElements];
    }
    get maxZIndex() {
        return this._renderables[0]?.zIndex ?? 0;
    }
    get minZIndex() {
        return this._renderables[this._renderables.length - 1]?.zIndex ?? 0;
    }

    use(renderer: Renderer, responsiveCallback: (width: number, height: number) => void) {
        this.stopInteractive();
        this.stopResponsive();
        this.renderer = renderer;
        this.startInteractive();
        this.startResponsive(responsiveCallback);
    }

    suspendRefreshRenderables = false;

    refreshRenderables() {
        if (this.suspendRefreshRenderables) return;
        this._renderables = [...this.elements, ...this._subViews.reduce((acc, subView) => acc.concat(subView.elements), [] as ViewElement[])];
        this.sortRenderables();
        this.refreshInteractables();
    }
    sortRenderables() {
        this._renderables.sort((a, b) => b.zIndex - a.zIndex);
    }
    refreshInteractables() {
        this._interactables = this._renderables.filter(el => el.interactable);
        if (this._hoverElement !== null && !this._interactables.includes(this._hoverElement)) {
            this._hoverElement = null;
        }
        if (this._indeterminateElements.length !== 0) {
            this._indeterminateElements = this._indeterminateElements.filter(el => this._interactables.includes(el));
        }
        if (this._activeElements.length !== 0) {
            this._activeElements = this._activeElements.filter(el => this._interactables.includes(el));
        }
    }

    requestRender() {
        Geomtoy.tick();
    }

    private _rafTick(callback: (...args: any[]) => void) {
        if (!this._rafTicking) {
            this._rafTicking = true;
            requestAnimationFrame(() => {
                callback();
                this._rafTicking = false;
            });
        }
    }
    private _isPointInElement(element: ViewElement, x: number, y: number) {
        return element.paths.some(pathInfo => {
            const [path, fillRule] = pathInfo;
            return PointChecker.isPointIn(x, y, path, fillRule, element.style(), this.renderer.display, this._hasTouchDevice);
        });
    }
    private _addTouch(id: number, offset: [number, number]) {
        if (this._touchPointers.length === VIEW_DEFAULTS.maxTouchPointerCount) return;
        this._touchPointers.push({ id, offset });
    }
    private _updateTouch(id: number, offset: [number, number]) {
        const index = this._touchPointers.findIndex(p => p.id === id);
        if (index !== -1) this._touchPointers[index].offset = offset;
    }
    private _hasTouch(id: number) {
        return this._touchPointers.findIndex(p => p.id === id) !== -1;
    }
    private _removeTouch(id: number) {
        const index = this._touchPointers.findIndex(p => p.id === id);
        if (index !== -1) this._touchPointers.splice(index, 1);
    }
    private _clearTouch() {
        this._touchPointers = [];
    }

    private _eventHandler: { [key: string]: { cb: (e: ViewEvent) => void; wait: boolean }[] } = {};

    on(
        eventType:
            | ViewEventType.PointerEnter
            | ViewEventType.PointerLeave
            | ViewEventType.PointerMove
            | ViewEventType.PointerUp
            | ViewEventType.PointerDown
            | ViewEventType.PointerCancel
            | ViewEventType.Wheel,

        callback: (e: ViewPointerEvent) => void
    ): this;
    on(eventType: ViewEventType.DragStart | ViewEventType.Dragging | ViewEventType.DragEnd, callback: (e: ViewDragEvent) => void, waitViewUpdate?: boolean): this;
    on(eventType: ViewEventType.PanStart | ViewEventType.Panning | ViewEventType.PanEnd, callback: (e: ViewPanEvent) => void, waitViewUpdate?: boolean): this;
    on(eventType: ViewEventType.ZoomStart | ViewEventType.Zooming | ViewEventType.ZoomEnd, callback: (e: ViewZoomEvent) => void, waitViewUpdate?: boolean): this;
    on(eventType: ViewEventType.Activate | ViewEventType.Deactivate, callback: (e: ViewActivateEvent) => void, waitViewUpdate?: boolean): this;
    on(eventType: ViewEventType.Hover | ViewEventType.Unhover, callback: (e: ViewHoverEvent) => void, waitViewUpdate?: boolean): this;
    on(eventType: ViewEventType, callback: (e: any) => void, waitViewUpdate = true) {
        if (this._eventHandler[eventType] === undefined) this._eventHandler[eventType] = [];
        this._eventHandler[eventType].push({
            cb: callback,
            wait: waitViewUpdate
        });
        return this;
    }
    off(eventType: ViewEventType, callback: (e: ViewEvent) => void) {
        if (this._eventHandler[eventType] === undefined) return this;
        const index = this._eventHandler[eventType].findIndex(h => h.cb === callback);
        this._eventHandler[eventType].splice(index, 1);
        return this;
    }
    clear(eventType?: ViewEventType) {
        if (eventType === undefined) {
            this._eventHandler = {};
        } else {
            delete this._eventHandler[eventType];
        }
        return this;
    }

    private _waitQueue: [cb: (e: any) => void, event: ViewEvent][] = [];
    private _waitEventScheduled = false;
    private _flushEvents() {
        if (this._waitEventScheduled) return;
        this._waitEventScheduled = true;
        Geomtoy.nextTick(() => {
            for (const [cb, object] of this._waitQueue) cb(object);
            this._waitEventScheduled = false;
            this._waitQueue = [];
        });
    }

    trigger(
        eventType:
            | ViewEventType.PointerEnter
            | ViewEventType.PointerLeave
            | ViewEventType.PointerMove
            | ViewEventType.PointerUp
            | ViewEventType.PointerDown
            | ViewEventType.PointerCancel
            | ViewEventType.Wheel,
        object: ViewPointerEvent
    ): this;
    trigger(eventType: ViewEventType.DragStart | ViewEventType.Dragging | ViewEventType.DragEnd, object: ViewDragEvent): this;
    trigger(eventType: ViewEventType.PanStart | ViewEventType.Panning | ViewEventType.PanEnd, object: ViewPanEvent): this;
    trigger(eventType: ViewEventType.ZoomStart | ViewEventType.Zooming | ViewEventType.ZoomEnd, object: ViewZoomEvent): this;
    trigger(eventType: ViewEventType.Activate | ViewEventType.Deactivate, object: ViewActivateEvent): this;
    trigger(eventType: ViewEventType.Hover | ViewEventType.Unhover, object: ViewHoverEvent): this;
    trigger(eventType: ViewEventType, object: ViewEvent) {
        if (this._eventHandler[eventType] === undefined) return this;
        for (const { cb, wait } of this._eventHandler[eventType]) {
            if (wait) {
                this._waitQueue.push([cb, object]);
                this._flushEvents();
            } else {
                cb(object);
            }
        }
        return this;
    }

    cursor(type: "default" | "pointer" | "all-scroll" | "move" | "grab" | "grabbing" | "zoom-in" | "zoom-out" | "crosshair") {
        this.renderer.container.style.cursor = type;
    }

    /**
     * Click on anywhere to start drag a lasso, and before drag, all active elements will be inactive.
     * Dragging a lasso.
     * Then stop drag, and after drag, elements hit the lasso will be active.
     */
    private _doLasso = false;
    private _prepareLasso = false;
    private _lassoing = false;
    private _lasso = new Lasso();
    startLasso() {
        this._doLasso = true;
        this.requestRender();
    }
    stopLasso() {
        this._doLasso = false;
        this.requestRender();
    }

    private _getAntiOffset(offset: [x: number, y: number]) {
        return TransformationMatrix.antitransformCoordinates(this.renderer.display.globalTransformation, offset);
    }
    private _getOffset(antiOffset: [x: number, y: number]) {
        return TransformationMatrix.transformCoordinates(this.renderer.display.globalTransformation, antiOffset);
    }

    private readonly _pointerEnterHandler = function (this: View, e: PointerEvent) {
        const isTouch = e.pointerType === "touch";
        // this touch is not our touch
        if (isTouch && !this._hasTouch(e.pointerId)) return;
        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];

        const atOffset = this._getAntiOffset(pointerOffset);
        const ve = viewEvent(isTouch, ...pointerOffset, ...atOffset);
        this.trigger(ViewEventType.PointerEnter, viewPointerEvent(ve, e));
    }.bind(this);

    private readonly _pointerLeaveHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        // this touch is not our touch
        if (isTouch && !this._hasTouch(e.pointerId)) return;
        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
        isTouch && this._removeTouch(e.pointerId);

        const atOffset = this._getAntiOffset(pointerOffset);
        const ve = viewEvent(isTouch, ...pointerOffset, ...atOffset);
        this.trigger(ViewEventType.PointerLeave, viewPointerEvent(ve, e));

        if (isMouse) {
            if (this._isDragging) {
                this.cursor("default");
                this._isDragging = false;
                this.trigger(ViewEventType.DragEnd, viewDragEvent(ve, this._activeElements));
            } else if (this._prepareDragging) {
                this.cursor("default");
                this._prepareDragging = false;

                if (this._indeterminateElements.length !== 0) {
                    this._deactivateInternal(...this._indeterminateElements);
                    this.trigger(ViewEventType.Deactivate, viewActivateEvent(ve, [...this._indeterminateElements]));
                    this.requestRender();
                    this._indeterminateElements = [];
                }
            } else if (this._isPanning) {
                this.cursor("default");
                this._isPanning = false;
                this.trigger(ViewEventType.PanEnd, viewPanEvent(ve, ...this.renderer.display.pan));
            } else if (this._preparePanning) {
                this.cursor("default");
                this._preparePanning = false;
            }
        }
        if (isTouch) {
            if (this._isDragging) {
                this.cursor("default");
                this._isDragging = false;
                this.trigger(ViewEventType.DragEnd, viewDragEvent(ve, this._activeElements));
            } else if (this._prepareDragging) {
                this.cursor("default");
                this._prepareDragging = false;
                if (this._indeterminateElements.length !== 0) {
                    this._deactivateInternal(...this._indeterminateElements);
                    this.trigger(ViewEventType.Deactivate, viewActivateEvent(ve, [...this._indeterminateElements]));
                    this.requestRender();
                    this._indeterminateElements = [];
                }
            } else if (this._isPanning || this._preparePanning || this._isZooming || this._prepareZooming) {
                this.cursor("default");
                this._isPanning = false;
                this._preparePanning = false;
                this._isZooming = false;
                this._prepareZooming = false;
                this.trigger(ViewEventType.PanEnd, viewPanEvent(ve, ...this.renderer.display.pan));
                this.trigger(ViewEventType.ZoomEnd, viewZoomEvent(ve, this.renderer.display.zoom));
                this._clearTouch();
            }
        }
    }.bind(this);

    private readonly _pointerCancelHandler = function (this: View, e: PointerEvent) {
        const isTouch = e.pointerType === "touch";
        // this touch is not our touch
        if (isTouch && !this._hasTouch(e.pointerId)) return;
        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];

        const atOffset = this._getAntiOffset(pointerOffset);
        const ve = viewEvent(isTouch, ...pointerOffset, ...atOffset);
        this.trigger(ViewEventType.PointerCancel, viewPointerEvent(ve, e));
    }.bind(this);

    private readonly _pointerDownHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
        isTouch && this._addTouch(e.pointerId, pointerOffset);
        // only allow the primary button of mouse
        if (isMouse && !e.isPrimary) return;

        const atOffset = this._getAntiOffset(pointerOffset);
        const ve = viewEvent(isTouch, ...pointerOffset, ...atOffset);
        this.trigger(ViewEventType.PointerDown, viewPointerEvent(ve, e));

        if (this._doLasso) {
            this.cursor("crosshair");
            this._lasso.init = atOffset;
            this._prepareLasso = true;
            return;
        }

        if (isMouse) {
            const foundIndex = this._interactables.findIndex(el => this._isPointInElement(el, ...atOffset));
            if (foundIndex !== -1) {
                this.cursor("all-scroll");
                if (this.activeMode === "continuous") {
                    if (!this._activeElements.includes(this._interactables[foundIndex])) {
                        this._activateInternal(this._interactables[foundIndex]);
                        this.trigger(ViewEventType.Activate, viewActivateEvent(ve, [this._interactables[foundIndex]]));
                        this.requestRender();
                    } else {
                        this._indeterminateElements = [this._interactables[foundIndex]];
                    }
                    this.trigger(ViewEventType.DragStart, viewDragEvent(ve, this._activeElements));
                    this._draggingOffset = atOffset;
                    this._prepareDragging = true;
                }
                if (this.activeMode === "numerous") {
                    if (e.getModifierState(this.modifierKey)) {
                        if (!this._activeElements.includes(this._interactables[foundIndex])) {
                            this._activateInternal(this._interactables[foundIndex]);
                            this.trigger(ViewEventType.Activate, viewActivateEvent(ve, [this._interactables[foundIndex]]));
                            this.requestRender();
                        } else {
                            this._deactivateInternal(this._interactables[foundIndex]);
                            this.trigger(ViewEventType.Deactivate, viewActivateEvent(ve, [this._interactables[foundIndex]]));
                            this.requestRender();
                        }
                    } else {
                        if (!this._activeElements.includes(this._interactables[foundIndex])) {
                            if (this._activeElements.length !== 0) this.trigger(ViewEventType.Deactivate, viewActivateEvent(ve, [...this._activeElements]));
                            this._activeElements = [this._interactables[foundIndex]];
                            this.trigger(ViewEventType.Activate, viewActivateEvent(ve, [this._interactables[foundIndex]]));
                            this.requestRender();
                        } else {
                            this._indeterminateElements = this._activeElements.filter(el => el !== this._interactables[foundIndex]);
                        }
                        this.trigger(ViewEventType.DragStart, viewDragEvent(ve, this._activeElements));
                        this._draggingOffset = atOffset;
                        this._prepareDragging = true;
                    }
                }
            } else {
                this.cursor("grab");
                this._preparePanning = true;
                this._panningOffset = pointerOffset;
                this.trigger(ViewEventType.PanStart, viewPanEvent(ve, this.renderer.display.pan[0], this.renderer.display.pan[1]));
                this._activeElements.length > 0 && this.requestRender();
                this._activeElements = [];
            }
        }
        if (isTouch) {
            if (this._touchPointers.length === 1) {
                const foundIndex = this._interactables.findIndex(el => this._isPointInElement(el, ...atOffset));
                if (foundIndex !== -1) {
                    this.cursor("all-scroll");

                    if (this.activeMode === "continuous") {
                        if (!this._activeElements.includes(this._interactables[foundIndex])) {
                            this._activeElements.push(this._interactables[foundIndex]);
                            this.trigger(ViewEventType.Activate, viewActivateEvent(ve, [this._interactables[foundIndex]]));
                            this.requestRender();
                        } else {
                            this._indeterminateElements = [this._interactables[foundIndex]];
                        }
                        this.trigger(ViewEventType.DragStart, viewDragEvent(ve, this._activeElements));
                        this._draggingOffset = atOffset;
                        this._prepareDragging = true;
                    }
                    if (this.activeMode === "numerous") {
                        if (e.getModifierState(this.modifierKey)) {
                            if (!this._activeElements.includes(this._interactables[foundIndex])) {
                                this._activateInternal(this._interactables[foundIndex]);
                                this.trigger(ViewEventType.Activate, viewActivateEvent(ve, [this._interactables[foundIndex]]));
                                this.requestRender();
                            } else {
                                this._deactivateInternal(this._interactables[foundIndex]);
                                this.trigger(ViewEventType.Deactivate, viewActivateEvent(ve, [this._interactables[foundIndex]]));
                                this.requestRender();
                            }
                        } else {
                            if (!this._activeElements.includes(this._interactables[foundIndex])) {
                                if (this._activeElements.length !== 0) this.trigger(ViewEventType.Deactivate, viewActivateEvent(ve, [...this._activeElements]));
                                this._activeElements = [this._interactables[foundIndex]];
                                this.trigger(ViewEventType.Activate, viewActivateEvent(ve, [this._interactables[foundIndex]]));
                                this.requestRender();
                            } else {
                                this._indeterminateElements = this._activeElements.filter(el => el !== this._interactables[foundIndex]);
                            }
                            this.trigger(ViewEventType.DragStart, viewDragEvent(ve, this._activeElements));
                            this._draggingOffset = atOffset;
                            this._prepareDragging = true;
                        }
                    }
                } else {
                    this.cursor("grab");
                    this._activeElements.length > 0 && this.requestRender();
                    this._activeElements = [];
                }
            } else if (this._touchPointers.length === 2) {
                this.cursor("default");
                const [offset1, offset2] = [this._touchPointers[0].offset, this._touchPointers[1].offset];
                const distance = Maths.hypot(offset2[0] - offset1[0], offset2[1] - offset1[1]);
                const centerOffset = [(offset2[0] + offset1[0]) / 2, (offset2[1] + offset1[1]) / 2] as [number, number];

                this._zoomingDistance = distance;
                this._panningOffset = centerOffset;

                this._prepareDragging = false;
                this._isDragging = false;
                this.trigger(ViewEventType.PanStart, viewPanEvent(ve, ...this.renderer.display.pan));
                this.trigger(ViewEventType.ZoomStart, viewZoomEvent(ve, this.renderer.display.zoom));
                this._activeElements.length > 0 && this.requestRender();
                this._activeElements = [];

                this._preparePanning = true;
                this._prepareZooming = true;
            }
        }
    }.bind(this);

    private readonly _pointerUpHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        // this touch is not our touch
        if (isTouch && !this._hasTouch(e.pointerId)) return;
        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
        isTouch && this._removeTouch(e.pointerId);

        const atOffset = this._getAntiOffset(pointerOffset);
        const ve = viewEvent(isTouch, ...pointerOffset, ...atOffset);
        this.trigger(ViewEventType.PointerUp, viewPointerEvent(ve, e));

        if (this._doLasso) {
            this.cursor("default");
            if (this._lassoing) {
                this._lassoing = false;
                this._lasso.term = atOffset;
                const hits = this._lasso.hit(this._interactables);
                if (this._activeElements.length !== 0) this.trigger(ViewEventType.Deactivate, viewActivateEvent(ve, [...this._activeElements]));
                this._activeElements = hits;
                if (this._activeElements.length !== 0) this.trigger(ViewEventType.Activate, viewActivateEvent(ve, [...this._activeElements]));
                this.requestRender();
            }
            if (this._prepareLasso) {
                this._prepareLasso = false;
                if (this._activeElements.length !== 0) this.trigger(ViewEventType.Deactivate, viewActivateEvent(ve, [...this._activeElements]));
                this._activeElements = [];
                this.requestRender();
            }
            return;
        }

        if (isMouse) {
            if (this._isDragging) {
                this.cursor("default");
                this._isDragging = false;
                this.trigger(ViewEventType.DragEnd, viewDragEvent(ve, this._activeElements));
            } else if (this._prepareDragging) {
                this.cursor("default");
                this._prepareDragging = false;

                if (this._indeterminateElements.length !== 0) {
                    this._deactivateInternal(...this._indeterminateElements);
                    this.trigger(ViewEventType.Deactivate, viewActivateEvent(ve, [...this._indeterminateElements]));
                    this.requestRender();
                    this._indeterminateElements = [];
                }
            } else if (this._isPanning) {
                this.cursor("default");
                this._isPanning = false;
                this.trigger(ViewEventType.PanEnd, viewPanEvent(ve, ...this.renderer.display.pan));
            } else if (this._preparePanning) {
                this.cursor("default");
                this._preparePanning = false;
            }
        }
        if (isTouch) {
            if (this._isDragging) {
                this.cursor("default");
                this._isDragging = false;
                this.trigger(ViewEventType.DragEnd, viewDragEvent(ve, this._activeElements));
            } else if (this._prepareDragging) {
                this.cursor("default");
                this._prepareDragging = false;
                if (this._indeterminateElements.length !== 0) {
                    this._deactivateInternal(...this._indeterminateElements);
                    this.trigger(ViewEventType.Deactivate, viewActivateEvent(ve, [...this._indeterminateElements]));
                    this.requestRender();
                    this._indeterminateElements = [];
                }
            } else if (this._isPanning || this._preparePanning || this._isZooming || this._prepareZooming) {
                this.cursor("default");
                this._isPanning = false;
                this._preparePanning = false;
                this._isZooming = false;
                this._prepareZooming = false;
                this.trigger(ViewEventType.PanEnd, viewPanEvent(ve, ...this.renderer.display.pan));
                this.trigger(ViewEventType.ZoomEnd, viewZoomEvent(ve, this.renderer.display.zoom));
                this._clearTouch();
            }
        }
    }.bind(this);

    private readonly _pointerMoveHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        if (isTouch && !this._hasTouch(e.pointerId)) return;

        this._rafTick(() => {
            const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
            isTouch && this._updateTouch(e.pointerId, pointerOffset);

            const atOffset = this._getAntiOffset(pointerOffset);
            const ve = viewEvent(isTouch, ...pointerOffset, ...atOffset);
            this.trigger(ViewEventType.PointerMove, viewPointerEvent(ve, e));

            if (this._doLasso) {
                if (this._prepareLasso || this._lassoing) {
                    this._prepareLasso = false;
                    this._lassoing = true;
                    this._lasso.term = atOffset;
                    this.requestRender();
                }
                return;
            }

            if (isMouse) {
                if (this._prepareDragging) {
                    const scale = this.renderer.display.density * this.renderer.display.zoom;
                    const dragDistance = Maths.hypot(atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]) * scale;
                    if (dragDistance < this.dragThrottleDistance) return;
                }

                if (this._prepareDragging || this._isDragging) {
                    this.cursor("move");
                    this._prepareDragging = false;
                    this._isDragging = true;

                    const [deltaX, deltaY] = [atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]];
                    this._draggingOffset = atOffset;
                    this._activeElements.forEach(el => el.move(deltaX, deltaY));
                    this.trigger(ViewEventType.Dragging, viewDragEvent(ve, this._activeElements));
                    // this.requestRender();
                } else if (this._preparePanning || this._isPanning) {
                    this.cursor("grabbing");
                    this._preparePanning = false;
                    this._isPanning = true;

                    const [deltaX, deltaY] = [pointerOffset[0] - this._panningOffset[0], pointerOffset[1] - this._panningOffset[1]];
                    this._panningOffset = pointerOffset;
                    this.renderer.display.pan = [this.renderer.display.pan[0] + deltaX, this.renderer.display.pan[1] + deltaY];
                    this.trigger(ViewEventType.Panning, viewPanEvent(ve, ...this.renderer.display.pan));
                    this.requestRender();
                } else {
                    const foundIndex = this._interactables.findIndex(el => this._isPointInElement(el, ...atOffset));
                    if (foundIndex !== -1) {
                        if (this._hoverElement !== this._interactables[foundIndex]) {
                            this.cursor("pointer");
                            this.trigger(ViewEventType.Hover, viewHoverEvent(ve, this._interactables[foundIndex]));
                            this._hoverElement = this._interactables[foundIndex];
                            this.requestRender();
                        } else {
                            // do nothing
                        }
                    } else {
                        if (this._hoverElement !== null) {
                            this.cursor("default");
                            this.trigger(ViewEventType.Unhover, viewHoverEvent(ve, this._hoverElement));
                            this._hoverElement = null;
                            this.requestRender();
                        } else {
                            // do nothing
                        }
                    }
                }
            }

            if (isTouch) {
                const atOffset = TransformationMatrix.antitransformCoordinates(this.renderer.display.globalTransformation, pointerOffset);
                if (this._prepareDragging) {
                    const scale = this.renderer.display.density * this.renderer.display.zoom;
                    const dragDistance = Maths.hypot(atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]) * scale;
                    if (dragDistance < this.dragThrottleDistance) return;
                }

                if (this._prepareDragging || this._isDragging) {
                    this.cursor("move");
                    this._prepareDragging = false;
                    this._isDragging = true;

                    const [deltaX, deltaY] = [atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]];
                    this._draggingOffset = atOffset;
                    this._activeElements.forEach(el => el.move(deltaX, deltaY));
                    this.trigger(ViewEventType.Dragging, viewDragEvent(ve, this._activeElements));
                    // this.requestRender();
                } else if (this._prepareZooming || this._isZooming || this._preparePanning || this._isPanning) {
                    this.cursor("default");
                    this._prepareZooming = false;
                    this._preparePanning = false;
                    this._isZooming = true;
                    this._isPanning = true;

                    const [offset1, offset2] = [this._touchPointers[0].offset, this._touchPointers[1].offset];
                    const distance = Maths.hypot(offset2[0] - offset1[0], offset2[1] - offset1[1]);
                    const centerOffset = [(offset2[0] + offset1[0]) / 2, (offset2[1] + offset1[1]) / 2] as [number, number];

                    const deltaZoom = distance / this._zoomingDistance;
                    const [deltaX, deltaY] = [centerOffset[0] - this._panningOffset[0], centerOffset[1] - this._panningOffset[1]];

                    this._panningOffset = centerOffset;
                    this._zoomingDistance = distance;

                    const display = this.renderer.display;
                    let zoom = display.zoom * deltaZoom;
                    zoom = zoom < this.minZoom ? this.minZoom : zoom > this.maxZoom ? this.maxZoom : zoom;

                    const atOffset = this._getAntiOffset(centerOffset);
                    display.zoom = zoom;
                    const [scaledOffsetX, scaledOffsetY] = this._getOffset(atOffset);
                    const [zoomOffsetX, zoomOffsetY] = [centerOffset[0] - scaledOffsetX, centerOffset[1] - scaledOffsetY];
                    display.pan = [display.pan[0] + deltaX + zoomOffsetX, display.pan[1] + deltaY + zoomOffsetY];
                    this.trigger(ViewEventType.Zooming, viewZoomEvent(ve, display.zoom));
                    this.trigger(ViewEventType.Panning, viewPanEvent(ve, ...display.pan));
                    this.requestRender();
                }
            }
        });
    }.bind(this);

    private readonly _wheelHandler = function (this: View, e: WheelEvent) {
        e.preventDefault();
        this._rafTick(() => {
            const mouseOffset = [e.offsetX, e.offsetY] as [number, number];
            const deltaY = e.deltaY;
            const display = this.renderer.display;
            let zoom: number;
            if (this.inverseWheelZoom) {
                zoom = deltaY < 0 ? display.zoom / this.wheelZoomDeltaRate : deltaY > 0 ? display.zoom * this.wheelZoomDeltaRate : display.zoom;
            } else {
                zoom = deltaY > 0 ? display.zoom / this.wheelZoomDeltaRate : deltaY < 0 ? display.zoom * this.wheelZoomDeltaRate : display.zoom;
            }
            zoom = Maths.clamp(zoom, this.minZoom, this.maxZoom);

            const atOffset = this._getAntiOffset(mouseOffset);
            const ve = viewEvent(false, ...mouseOffset, ...atOffset);
            this.trigger(ViewEventType.Wheel, viewPointerEvent(ve, e));

            display.zoom = zoom;
            const [scaledOffsetX, scaledOffsetY] = this._getOffset(atOffset);
            const [zoomOffsetX, zoomOffsetY] = [mouseOffset[0] - scaledOffsetX, mouseOffset[1] - scaledOffsetY];
            display.pan = [display.pan[0] + zoomOffsetX, display.pan[1] + zoomOffsetY];

            this.trigger(ViewEventType.Zooming, viewZoomEvent(ve, display.zoom));
            this.trigger(ViewEventType.Panning, viewPanEvent(ve, ...display.pan));
            this.requestRender();
        });
    }.bind(this);

    startInteractive() {
        this.renderer.container.addEventListener("pointerdown", this._pointerDownHandler as EventListener);
        this.renderer.container.addEventListener("pointerup", this._pointerUpHandler as EventListener);
        this.renderer.container.addEventListener("pointermove", this._pointerMoveHandler as EventListener);
        this.renderer.container.addEventListener("pointerenter", this._pointerEnterHandler as EventListener);
        this.renderer.container.addEventListener("pointerleave", this._pointerLeaveHandler as EventListener);
        this.renderer.container.addEventListener("pointercancel", this._pointerCancelHandler as EventListener);
        this.renderer.container.addEventListener("wheel", this._wheelHandler as EventListener);
    }
    stopInteractive() {
        this.renderer.container.removeEventListener("pointerdown", this._pointerDownHandler as EventListener);
        this.renderer.container.removeEventListener("pointerup", this._pointerUpHandler as EventListener);
        this.renderer.container.removeEventListener("pointermove", this._pointerMoveHandler as EventListener);
        this.renderer.container.removeEventListener("pointerenter", this._pointerEnterHandler as EventListener);
        this.renderer.container.removeEventListener("pointerleave", this._pointerLeaveHandler as EventListener);
        this.renderer.container.removeEventListener("pointercancel", this._pointerCancelHandler as EventListener);
        this.renderer.container.removeEventListener("wheel", this._wheelHandler as EventListener);
    }
    startResponsive(callback: (width: number, height: number) => void) {
        // immediately call by `ResizeObserver` initialization in the microtask queue
        let immediatelyFirstCalled = false;
        if (this._resizeObserver !== null) return;
        const ob = new ResizeObserver(entries => {
            for (let entry of entries) {
                const w = Maths.floor(entry.contentRect.width);
                const h = Maths.floor(entry.contentRect.height);
                if (!immediatelyFirstCalled) {
                    this.renderer.display.width = w;
                    this.renderer.display.height = h;
                    immediatelyFirstCalled = true;
                    callback(w, h);
                    this.requestRender();
                } else {
                    window.clearTimeout(this._resizeTimer);
                    this._resizeTimer = window.setTimeout(() => {
                        this.renderer.display.width = w;
                        this.renderer.display.height = h;
                        callback(w, h);
                        this.requestRender();
                    }, VIEW_DEFAULTS.resizeObserverDebouncingTime);
                }
            }
        });
        ob.observe(this.renderer.container.parentElement!);
        this._resizeObserver = ob;
    }
    stopResponsive() {
        if (this._resizeObserver !== null) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
    }

    zoom(zoom: number, keepViewCenter = true) {
        if (keepViewCenter) {
            const display = this.renderer.display;
            const box = display.globalViewBox;
            const [atCx, atCy] = [box[0] + box[2] / 2, box[1] + box[3] / 2];
            const [cx, cy] = [display.width / 2, display.height / 2];

            display.zoom = zoom;

            const [scaledOffsetX, scaledOffsetY] = TransformationMatrix.transformCoordinates(display.globalTransformation, [atCx, atCy]);
            const [zoomOffsetX, zoomOffsetY] = [cx - scaledOffsetX, cy - scaledOffsetY];
            display.pan = [display.pan[0] + zoomOffsetX, display.pan[1] + zoomOffsetY];
        } else {
            this.renderer.display.zoom = zoom;
        }
        this.requestRender();
    }
    pan(panX: number, panY: number) {
        this.renderer.display.pan = [this.renderer.display.pan[0] + panX, this.renderer.display.pan[1] + panY];
        this.requestRender();
    }

    add(...elements: ViewElement[]) {
        for (const el of elements) {
            if (el[VE_SUB_VIEW_SYMBOL] !== null) {
                if (el[VE_SUB_VIEW_SYMBOL]![SV_VIEW_SYMBOL] === this) {
                    this.suspendRefreshRenderables = true;
                    el[VE_SUB_VIEW_SYMBOL]!.remove(el);
                    this.suspendRefreshRenderables = false;
                } else {
                    el[VE_SUB_VIEW_SYMBOL]!.remove(el);
                }
                this._elements.push(el);
                el[VE_VIEW_SYMBOL] = this;
                continue;
            }
            if (el[VE_VIEW_SYMBOL] === this) continue;
            if (el[VE_VIEW_SYMBOL] !== null) el[VE_VIEW_SYMBOL]!.remove(el);
            this._elements.push(el);
            el[VE_VIEW_SYMBOL] = this;
        }
        this.refreshRenderables();
        this.requestRender();
        return this;
    }
    remove(...elements: ViewElement[]) {
        for (const el of elements) {
            // We do not directly remove the `ViewElement` in the `SubView`
            if (el[VE_SUB_VIEW_SYMBOL] !== null) continue;
            if (el[VE_VIEW_SYMBOL] !== this) continue;

            const index = this._elements.indexOf(el);
            if (index === -1) throw new Error("[G]Should not happened.");

            this._elements.splice(index, 1);
            el[VE_VIEW_SYMBOL] = null;
        }
        this.refreshRenderables();
        this.requestRender();
        return this;
    }
    empty() {
        for (const el of this._elements) {
            el[VE_VIEW_SYMBOL] = null;
        }
        this._elements = [];
        this.refreshRenderables();
        this.requestRender();
        return this;
    }
    has(element: ViewElement) {
        return this._elements.includes(element);
    }
    addSubView(...subViews: SubView[]) {
        for (const sv of subViews) {
            if (sv[SV_VIEW_SYMBOL] === this) continue;
            if (sv[SV_VIEW_SYMBOL] !== null) sv[SV_VIEW_SYMBOL]!.removeSubView(sv);
            this._subViews.push(sv);
            sv[SV_VIEW_SYMBOL] = this;
        }
        this.refreshRenderables();
        this.requestRender();
        return this;
    }
    removeSubView(...subViews: SubView[]) {
        for (const sv of subViews) {
            if (sv[SV_VIEW_SYMBOL] !== this) continue;

            const index = this._subViews.indexOf(sv);
            if (index === -1) throw new Error("[G]Should not happened.");

            this._subViews.splice(index, 1);
            sv[SV_VIEW_SYMBOL] = null;
        }
        this.refreshRenderables();
        this.requestRender();
        return this;
    }
    emptySubView() {
        for (const sv of this._subViews) {
            sv[SV_VIEW_SYMBOL] = null;
        }
        this._subViews = [];
        this.refreshRenderables();
        this.requestRender();
        return this;
    }
    hasSubView(subView: SubView) {
        return this._subViews.includes(subView);
    }
    emptyAll() {
        for (const el of this._elements) {
            el[VE_VIEW_SYMBOL] = null;
        }
        this._elements = [];
        for (const sv of this._subViews) {
            sv[SV_VIEW_SYMBOL] = null;
        }
        this._subViews = [];

        this._renderables = [];
        this._interactables = [];
        this._hoverElement = null;
        this._indeterminateElements = [];
        this._activeElements = [];
        this.requestRender();
        return this;
    }

    /* 
    Why these internal methods? 
    These methods we will call in the interaction, so the input elements are as expected. We just use the input elements without checking or additional operations.
    */
    private _activateInternal(...elements: ViewElement[]) {
        this._activeElements.push(...elements);
    }
    private _deactivateInternal(...elements: ViewElement[]) {
        elements.forEach(el => {
            this._activeElements.splice(this._activeElements.indexOf(el), 1);
        });
    }

    activate(...elements: ViewElement[]) {
        this._activeElements = [...elements.filter(el => !this._activeElements.includes(el)), ...this._activeElements].filter(el => this._interactables.includes(el));
        this.requestRender();
        return this;
    }
    deactivate(...elements: ViewElement[]) {
        this._activeElements = this._activeElements.filter(el => !elements.includes(el));
        this.requestRender();
        return this;
    }

    forward(element: ViewElement) {
        const index = this._renderables.indexOf(element);
        if (index !== -1 && index !== 0) {
            this._renderables[index].zIndex = this._renderables[index - 1].zIndex + 1;
            this.sortRenderables();
            this.requestRender();
        }
        return this;
    }
    foremost(element: ViewElement) {
        const index = this._renderables.indexOf(element);
        if (index !== -1 && index !== 0) {
            this._renderables[index].zIndex = this.maxZIndex + 1;
            this.sortRenderables();
            this.requestRender();
        }
        return this;
    }
    backward(element: ViewElement) {
        const index = this._renderables.indexOf(element);
        if (index !== -1 && index !== this._renderables.length - 1) {
            this._renderables[index].zIndex = this.elements[index + 1].zIndex - 1;
            this.sortRenderables();
            this.requestRender();
        }
        return this;
    }
    backmost(element: ViewElement) {
        const index = this._renderables.indexOf(element);
        if (index !== -1 && index !== this._renderables.length - 1) {
            this._renderables[index].zIndex = this.minZIndex - 1;
            this.sortRenderables();
            this.requestRender();
        }
        return this;
    }

    private _renderFunc = function (this: View) {
        const renderer = this.renderer;
        if (this._renderables.length === 0) renderer.clear();

        this._renderables.forEach(el => {
            if (el.shape instanceof Image) {
                const imageSource = el.shape.source;
                renderer.imageSourceManager.notLoaded(imageSource) && renderer.imageSourceManager.load(imageSource).then(this.requestRender.bind(this)).catch(console.error);
            }
            if (el.shape instanceof ShapeArray || el.shape instanceof SealedShapeArray) {
                ((el.shape.items as Shape[]).filter(shape => shape instanceof Image) as Image[]).forEach(image => {
                    const imageSource = image.source;
                    renderer.imageSourceManager.notLoaded(imageSource) && renderer.imageSourceManager.load(imageSource).then(this.requestRender.bind(this)).catch(console.error);
                });
            }
            if (el.shape instanceof ShapeObject || el.shape instanceof SealedShapeObject) {
                ((Object.values(el.shape.items) as Shape[]).filter(shape => shape instanceof Image) as Image[]).forEach(image => {
                    const imageSource = image.source;
                    renderer.imageSourceManager.notLoaded(imageSource) && renderer.imageSourceManager.load(imageSource).then(this.requestRender.bind(this)).catch(console.error);
                });
            }

            const s = el.style();
            const hs = el.hoverStyle();
            const as = el.activeStyle();

            const hover = this._hoverElement === el;
            const active = this._activeElements.includes(el);
            // `active` has a higher priority than `hover`

            renderer.paintOrder(s.paintOrder);
            renderer.noFill(s.noFill);
            renderer.fill((active && as.fill) || (hover && hs.fill) || s.fill);

            renderer.noStroke(s.noStroke);
            renderer.stroke((active && as.stroke) || (hover && hs.stroke) || s.stroke);
            renderer.strokeWidth((active && as.strokeWidth) || (hover && hs.strokeWidth) || s.strokeWidth);
            renderer.strokeDash(s.strokeDash);
            renderer.strokeDashOffset(s.strokeDashOffset);
            renderer.strokeLineJoin(s.strokeLineJoin);
            renderer.strokeLineCap(s.strokeLineCap);
            renderer.strokeMiterLimit(s.strokeMiterLimit);

            const onTop = (hover && this.hoverForemost) || (active && this.activeForemost);
            el.paths = renderer.draw(el.shape, onTop);
        });

        if (this._lassoing) {
            renderer.paintOrder(VIEW_DEFAULTS.lassoStyle.paintOrder);
            renderer.noFill(VIEW_DEFAULTS.lassoStyle.noFill);
            renderer.fill(VIEW_DEFAULTS.lassoStyle.fill);

            renderer.noStroke(VIEW_DEFAULTS.lassoStyle.noStroke);
            renderer.stroke(VIEW_DEFAULTS.lassoStyle.stroke);
            renderer.strokeWidth(VIEW_DEFAULTS.lassoStyle.strokeWidth);
            renderer.strokeDash(VIEW_DEFAULTS.lassoStyle.strokeDash);
            renderer.strokeDashOffset(VIEW_DEFAULTS.lassoStyle.strokeDashOffset);
            renderer.strokeLineJoin(VIEW_DEFAULTS.lassoStyle.strokeLineJoin);
            renderer.strokeLineCap(VIEW_DEFAULTS.lassoStyle.strokeLineCap);
            renderer.strokeMiterLimit(VIEW_DEFAULTS.lassoStyle.strokeMiterLimit);
            renderer.draw(this._lasso, true);
        }
    }.bind(this);
}

import { Geomtoy, Image, SealedShapeArray, SealedShapeObject, Shape, ShapeArray, ShapeObject } from "@geomtoy/core";
import { Assert, Maths, TransformationMatrix } from "@geomtoy/util";
import PointChecker from "../helper/PointChecker";
import type Renderer from "../renderer/Renderer";
import { Style, ViewElementEventType, ViewElementInteractMode, type ViewElementEvent } from "../types";
import Lasso from "./Lasso";
import SubView, { SV_VIEW_SYMBOL } from "./SubView";
import type ViewElement from "./ViewElement";
import { VE_EVENT_HANDLERS_SYMBOL, VE_SUB_VIEW_SYMBOL, VE_VIEW_SYMBOL } from "./ViewElement";

function viewElementEvent(isTouch: boolean, viewportX: number, viewportY: number, x: number, y: number) {
    return { isTouch, viewportX, viewportY, x, y } as ViewElementEvent;
}

const VIEW_DEFAULTS = {
    hoverForemost: true,
    clickForemost: true,
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
    private _indActiveElements: ViewElement[] = []; // indeterminate active elements
    private _operativeElement: ViewElement | null = null;
    private _hoverElement: ViewElement | null = null;

    private _isActiveDrag = false;
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
            clickForemost = VIEW_DEFAULTS.clickForemost,
            activeForemost = VIEW_DEFAULTS.activeForemost,
            dragThrottleDistance = VIEW_DEFAULTS.dragThrottleDistance,
            minZoom = VIEW_DEFAULTS.minZoom,
            maxZoom = VIEW_DEFAULTS.maxZoom,
            wheelZoomDeltaRate = VIEW_DEFAULTS.wheelZoomDeltaRate,
            inverseWheelZoom = VIEW_DEFAULTS.inverseWheelZoom
        }: Partial<{
            hoverForemost: boolean;
            clickForemost: boolean;
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
        this.clickForemost = clickForemost;
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
    clickForemost: boolean;
    activeForemost: boolean;
    inverseWheelZoom: boolean;

    // todo
    // snapToGrid: boolean = true;
    /**
     * *Memo
     * The `activeElements` modified not by the user interaction(`activate`, `deactivate` etc.) does not dispatch an event.
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
    get operativeElement() {
        return this._operativeElement;
    }
    get hoverElement() {
        return this._hoverElement;
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
        this._interactables = this._renderables.filter(el => el.interactMode !== ViewElementInteractMode.None);
        if (this._hoverElement !== null && !this._interactables.includes(this._hoverElement)) {
            this._hoverElement = null;
        }
        if (this._indActiveElements.length !== 0) {
            this._indActiveElements = this._indActiveElements.filter(el => this._interactables.includes(el));
        }
        if (this._operativeElement !== null && !this._interactables.includes(this._operativeElement)) {
            this._operativeElement = null;
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
        this._touchPointers.length = 0;
    }

    private _dispatch(viewElements: (ViewElement | null)[], eventType: ViewElementEventType, object: ViewElementEvent) {
        for (const viewElement of viewElements) {
            if (viewElement === null) continue;
            if (viewElement[VE_EVENT_HANDLERS_SYMBOL][eventType] === undefined) return;
            for (const cb of viewElement[VE_EVENT_HANDLERS_SYMBOL][eventType]) cb.call(viewElement, object);
        }
    }

    cursor(type: "default" | "pointer" | "move" | "grab" | "zoom-in" | "zoom-out" | "crosshair") {
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

    private readonly _pointerLeaveHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        // this touch is not our touch
        if (isTouch && !this._hasTouch(e.pointerId)) return;
        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
        isTouch && this._removeTouch(e.pointerId);

        const atOffset = this._getAntiOffset(pointerOffset);
        const vee = viewElementEvent(isTouch, ...pointerOffset, ...atOffset);

        if (isMouse) {
            if (this._isDragging) {
                this.cursor("default");
                this._isDragging = false;
                if (this._isActiveDrag) {
                    this._dispatch(this._activeElements, ViewElementEventType.DragEnd, vee);
                } else {
                    this._dispatch([this._operativeElement], ViewElementEventType.DragEnd, vee);
                    this._operativeElement = null;
                    this.requestRender();
                }
            } else if (this._prepareDragging) {
                this._prepareDragging = false;
                console.warn("[G]How can you make this happen?");
            } else if (this._isPanning) {
                this.cursor("default");
                this._isPanning = false;
            } else if (this._preparePanning) {
                this._preparePanning = false;
                console.warn("[G]How can you make this happen?");
            }
        }
        if (isTouch) {
            if (this._isDragging) {
                this.cursor("default");
                this._isDragging = false;
                if (this._isActiveDrag) {
                    this._dispatch(this._activeElements, ViewElementEventType.DragEnd, vee);
                } else {
                    this._dispatch([this._operativeElement], ViewElementEventType.DragEnd, vee);
                    this._operativeElement = null;
                    this.requestRender();
                }
            } else if (this._prepareDragging) {
                this._prepareDragging = false;
                console.warn("[G]How can you make this happen?");
            } else if (this._isPanning || this._isZooming) {
                this._isPanning = false;
                this._isZooming = false;
                this._clearTouch();
            } else if (this._preparePanning || this._prepareZooming) {
                this._preparePanning = false;
                this._prepareZooming = false;
                console.warn("[G]How can you make this happen?");
            }
        }
    }.bind(this);

    private readonly _pointerDownHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
        isTouch && this._addTouch(e.pointerId, pointerOffset);
        // only allow the primary button of mouse
        if (isMouse && !e.isPrimary) return;

        const atOffset = this._getAntiOffset(pointerOffset);

        if (this._doLasso) {
            this.cursor("crosshair");
            this._lasso.init = atOffset;
            this._prepareLasso = true;
            return;
        }

        const vee = viewElementEvent(isTouch, ...pointerOffset, ...atOffset);

        if (isMouse) {
            const foundIndex = this._interactables.findIndex(el => this._isPointInElement(el, ...atOffset));
            if (foundIndex !== -1) {
                // operativeElement
                if (this._interactables[foundIndex].interactMode === ViewElementInteractMode.Operation) {
                    this._isActiveDrag = false;
                    this._draggingOffset = atOffset;
                    this._prepareDragging = true;
                    this._operativeElement = this._interactables[foundIndex];
                    this.requestRender();
                }
                // activeElements
                if (this._interactables[foundIndex].interactMode === ViewElementInteractMode.Activation) {
                    // continuous
                    if (this.activeMode === "continuous") {
                        if (!this._activeElements.includes(this._interactables[foundIndex])) {
                            this._activateInternal(this._interactables[foundIndex]);
                            this._dispatch([this._interactables[foundIndex]], ViewElementEventType.Activate, vee);
                            this.requestRender();
                        } else {
                            this._indActiveElements = [this._interactables[foundIndex]];
                        }
                        this._isActiveDrag = true;
                        this._draggingOffset = atOffset;
                        this._prepareDragging = true;
                    }
                    // numerous
                    if (this.activeMode === "numerous") {
                        // with modifier key
                        if (e.getModifierState(this.modifierKey)) {
                            if (!this._activeElements.includes(this._interactables[foundIndex])) {
                                this._activateInternal(this._interactables[foundIndex]);
                                this._dispatch([this._interactables[foundIndex]], ViewElementEventType.Activate, vee);
                                this.requestRender();
                            } else {
                                this._deactivateInternal(this._interactables[foundIndex]);
                                this._dispatch([this._interactables[foundIndex]], ViewElementEventType.Deactivate, vee);
                                this.requestRender();
                            }
                        }
                        // without modifier key
                        else {
                            if (!this._activeElements.includes(this._interactables[foundIndex])) {
                                if (this._activeElements.length !== 0) {
                                    const temp = [...this._activeElements];
                                    this._activeElements.length = 0;
                                    this._dispatch(temp, ViewElementEventType.Deactivate, vee);
                                }
                                this._activateInternal(this._interactables[foundIndex]);
                                this._dispatch([this._interactables[foundIndex]], ViewElementEventType.Activate, vee);
                                this.requestRender();
                            } else {
                                this._indActiveElements = this._activeElements.filter(el => el !== this._interactables[foundIndex]);
                            }
                            this._isActiveDrag = true;
                            this._draggingOffset = atOffset;
                            this._prepareDragging = true;
                        }
                    }
                }
            } else {
                this._preparePanning = true;
                this._panningOffset = pointerOffset;
                if (this._activeElements.length !== 0) {
                    const temp = [...this._activeElements];
                    this._activeElements.length = 0;
                    this._dispatch(temp, ViewElementEventType.Deactivate, vee);
                    this.requestRender();
                }
            }
        }

        if (isTouch) {
            if (this._touchPointers.length === 1) {
                const foundIndex = this._interactables.findIndex(el => this._isPointInElement(el, ...atOffset));
                if (foundIndex !== -1) {
                    // operativeElement
                    if (this._interactables[foundIndex].interactMode === ViewElementInteractMode.Operation) {
                        this._isActiveDrag = false;
                        this._draggingOffset = atOffset;
                        this._prepareDragging = true;
                        this._operativeElement = this._interactables[foundIndex];
                        this.requestRender();
                    }
                    // activeElements
                    if (this._interactables[foundIndex].interactMode === ViewElementInteractMode.Activation) {
                        // continuous
                        if (this.activeMode === "continuous") {
                            if (!this._activeElements.includes(this._interactables[foundIndex])) {
                                this._activateInternal(this._interactables[foundIndex]);
                                this._dispatch([this._interactables[foundIndex]], ViewElementEventType.Activate, vee);
                                this.requestRender();
                            } else {
                                this._indActiveElements = [this._interactables[foundIndex]];
                            }
                            this._isActiveDrag = true;
                            this._draggingOffset = atOffset;
                            this._prepareDragging = true;
                        }
                        // numerous
                        if (this.activeMode === "numerous") {
                            // with modifier key, a touch device can also has a physical keyboard.
                            if (e.getModifierState(this.modifierKey)) {
                                if (!this._activeElements.includes(this._interactables[foundIndex])) {
                                    this._activateInternal(this._interactables[foundIndex]);
                                    this._dispatch([this._interactables[foundIndex]], ViewElementEventType.Activate, vee);
                                    this.requestRender();
                                } else {
                                    this._deactivateInternal(this._interactables[foundIndex]);
                                    this._dispatch([this._interactables[foundIndex]], ViewElementEventType.Deactivate, vee);
                                    this.requestRender();
                                }
                            }
                            // without modifier key
                            else {
                                if (!this._activeElements.includes(this._interactables[foundIndex])) {
                                    if (this._activeElements.length !== 0) {
                                        const temp = [...this._activeElements];
                                        this._activeElements.length = 0;
                                        this._dispatch(temp, ViewElementEventType.Deactivate, vee);
                                    }

                                    this._dispatch([this._interactables[foundIndex]], ViewElementEventType.Activate, vee);
                                    this.requestRender();
                                } else {
                                    this._indActiveElements = this._activeElements.filter(el => el !== this._interactables[foundIndex]);
                                }
                                this._isActiveDrag = true;
                                this._draggingOffset = atOffset;
                                this._prepareDragging = true;
                            }
                        }
                    }
                } else {
                    if (this._activeElements.length !== 0) {
                        const temp = [...this._activeElements];
                        this._activeElements.length = 0;
                        this._dispatch(temp, ViewElementEventType.Deactivate, vee);
                        this.requestRender();
                    }
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
                this._preparePanning = true;
                this._prepareZooming = true;
                if (this._activeElements.length !== 0) {
                    const temp = [...this._activeElements];
                    this._activeElements.length = 0;
                    this._dispatch(temp, ViewElementEventType.Deactivate, vee);
                    this.requestRender();
                }
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
        const vee = viewElementEvent(isTouch, ...pointerOffset, ...atOffset);

        if (this._doLasso) {
            this.cursor("default");
            if (this._lassoing) {
                this._lassoing = false;
                this._lasso.term = atOffset;
                const hits = this._lasso.hit(this._interactables);
                if (this._activeElements.length !== 0) {
                    const temp = [...this._activeElements];
                    this._activeElements.length = 0;
                    this._dispatch(temp, ViewElementEventType.Deactivate, vee);
                }
                if (hits.length !== 0) {
                    this._activateInternal(...hits);
                    this._dispatch(hits, ViewElementEventType.Activate, vee);
                }
                this.requestRender();
            }
            if (this._prepareLasso) {
                this._prepareLasso = false;
                if (this._activeElements.length !== 0) {
                    const temp = [...this._activeElements];
                    this._activeElements.length = 0;
                    this._dispatch(temp, ViewElementEventType.Deactivate, vee);
                }
                this.requestRender();
            }
            return;
        }

        if (isMouse) {
            if (this._isDragging) {
                this.cursor("pointer");
                this._isDragging = false;
                if (this._isActiveDrag) {
                    this._dispatch(this._activeElements, ViewElementEventType.DragEnd, vee);
                } else {
                    this._dispatch([this._operativeElement], ViewElementEventType.DragEnd, vee);
                    this._operativeElement = null;
                    this.requestRender();
                }
            } else if (this._prepareDragging) {
                this.cursor("pointer");
                this._prepareDragging = false;
                if (this._isActiveDrag) {
                    if (this._indActiveElements.length !== 0) {
                        this._deactivateInternal(...this._indActiveElements);
                        this._dispatch(this._indActiveElements, ViewElementEventType.Deactivate, vee);
                        this.requestRender();
                        this._indActiveElements.length = 0;
                    }
                } else {
                    this._dispatch([this._operativeElement], ViewElementEventType.Click, vee);
                    this._operativeElement = null;
                    this.requestRender();
                }
            } else if (this._isPanning) {
                this.cursor("default");
                this._isPanning = false;
            } else if (this._preparePanning) {
                this.cursor("default");
                this._preparePanning = false;
            }
        }
        if (isTouch) {
            if (this._isDragging) {
                this.cursor("pointer");
                this._isDragging = false;
                if (this._isActiveDrag) {
                    this._dispatch(this._activeElements, ViewElementEventType.DragEnd, vee);
                } else {
                    this._dispatch([this._operativeElement], ViewElementEventType.DragEnd, vee);
                    this._operativeElement = null;
                    this.requestRender();
                }
            } else if (this._prepareDragging) {
                this.cursor("pointer");
                this._prepareDragging = false;
                if (this._isActiveDrag) {
                    if (this._indActiveElements.length !== 0) {
                        this._deactivateInternal(...this._indActiveElements);
                        this._dispatch(this._indActiveElements, ViewElementEventType.Deactivate, vee);
                        this.requestRender();
                        this._indActiveElements.length = 0;
                    }
                } else {
                    this._dispatch([this._operativeElement], ViewElementEventType.Click, vee);
                    this._operativeElement = null;
                    this.requestRender();
                }
            } else if (this._prepareZooming || this._preparePanning) {
                this.cursor("default");
                this._preparePanning = false;
                this._prepareZooming = false;
                this._clearTouch();
            } else if (this._isPanning || this._isZooming) {
                this.cursor("default");
                this._isPanning = false;
                this._isZooming = false;
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

            if (this._doLasso) {
                if (this._prepareLasso || this._lassoing) {
                    this._prepareLasso = false;
                    this._lassoing = true;
                    this._lasso.term = atOffset;
                    this.requestRender();
                }
                return;
            }

            const vee = viewElementEvent(isTouch, ...pointerOffset, ...atOffset);

            if (isMouse) {
                if (this._prepareDragging) {
                    const scale = this.renderer.display.scale;
                    const dragDistance = Maths.hypot(atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]) * scale;
                    if (dragDistance < this.dragThrottleDistance) {
                        return;
                    } else {
                        this._isDragging = true;
                        this._prepareDragging = false;
                        if (this._isActiveDrag && this._indActiveElements.length !== 0) this._indActiveElements.length = 0;
                        this._dispatch(this._isActiveDrag ? this._activeElements : [this._operativeElement], ViewElementEventType.DragStart, vee);
                        return;
                    }
                }

                if (this._isDragging) {
                    this.cursor("move");
                    const [deltaX, deltaY] = [atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]];
                    this._draggingOffset = atOffset;
                    this._isActiveDrag ? this._activeElements.forEach(el => el.move(deltaX, deltaY)) : this._operativeElement?.move(deltaX, deltaY);
                    // this.requestRender();
                } else if (this._preparePanning) {
                    this._preparePanning = false;
                    this._isPanning = true;
                } else if (this._isPanning) {
                    this.cursor("grab");
                    const [deltaX, deltaY] = [pointerOffset[0] - this._panningOffset[0], pointerOffset[1] - this._panningOffset[1]];
                    this._panningOffset = pointerOffset;
                    this.renderer.display.pan = [this.renderer.display.pan[0] + deltaX, this.renderer.display.pan[1] + deltaY];
                    this.requestRender();
                } else {
                    const foundIndex = this._interactables.findIndex(el => this._isPointInElement(el, ...atOffset));
                    if (foundIndex !== -1) {
                        if (this._hoverElement !== this._interactables[foundIndex]) {
                            this.cursor("pointer");
                            this._dispatch([this._interactables[foundIndex]], ViewElementEventType.Hover, vee);
                            this._hoverElement = this._interactables[foundIndex];
                            this.requestRender();
                        } else {
                            // do nothing
                        }
                    } else {
                        if (this._hoverElement !== null) {
                            this.cursor("default");
                            this._dispatch([this._hoverElement], ViewElementEventType.Unhover, vee);
                            this._hoverElement = null;
                            this.requestRender();
                        } else {
                            // do nothing
                        }
                    }
                }
            }

            if (isTouch) {
                if (this._prepareDragging) {
                    const scale = this.renderer.display.density * this.renderer.display.zoom;
                    const dragDistance = Maths.hypot(atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]) * scale;
                    if (dragDistance < this.dragThrottleDistance) {
                        return;
                    } else {
                        this._isDragging = true;
                        this._prepareDragging = false;
                        if (this._isActiveDrag && this._indActiveElements.length !== 0) this._indActiveElements.length = 0;
                        this._dispatch(this._isActiveDrag ? this._activeElements : [this._operativeElement], ViewElementEventType.DragStart, vee);
                        return;
                    }
                }

                if (this._isDragging) {
                    this.cursor("move");
                    const [deltaX, deltaY] = [atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]];
                    this._draggingOffset = atOffset;
                    this._isActiveDrag ? this._activeElements.forEach(el => el.move(deltaX, deltaY)) : this._operativeElement?.move(deltaX, deltaY);
                    // this.requestRender();
                } else if (this._prepareZooming || this._preparePanning) {
                    this._prepareZooming = false;
                    this._preparePanning = false;
                    this._isZooming = true;
                    this._isPanning = true;
                } else if (this._isZooming || this._isPanning) {
                    this.cursor("default");
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
            display.zoom = zoom;
            const [scaledOffsetX, scaledOffsetY] = this._getOffset(atOffset);
            const [zoomOffsetX, zoomOffsetY] = [mouseOffset[0] - scaledOffsetX, mouseOffset[1] - scaledOffsetY];
            display.pan = [display.pan[0] + zoomOffsetX, display.pan[1] + zoomOffsetY];
            this.requestRender();
        });
    }.bind(this);

    startInteractive() {
        this.renderer.container.addEventListener("pointerdown", this._pointerDownHandler as EventListener);
        this.renderer.container.addEventListener("pointerup", this._pointerUpHandler as EventListener);
        this.renderer.container.addEventListener("pointermove", this._pointerMoveHandler as EventListener);
        this.renderer.container.addEventListener("pointerleave", this._pointerLeaveHandler as EventListener);
        this.renderer.container.addEventListener("wheel", this._wheelHandler as EventListener);
    }
    stopInteractive() {
        this.renderer.container.removeEventListener("pointerdown", this._pointerDownHandler as EventListener);
        this.renderer.container.removeEventListener("pointerup", this._pointerUpHandler as EventListener);
        this.renderer.container.removeEventListener("pointermove", this._pointerMoveHandler as EventListener);
        this.renderer.container.removeEventListener("pointerleave", this._pointerLeaveHandler as EventListener);
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
        this._elements.length = 0;
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
        this._subViews.length = 0;
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
        this._elements.length = 0;
        for (const sv of this._subViews) {
            sv[SV_VIEW_SYMBOL] = null;
        }
        this._subViews.length = 0;

        this._renderables.length = 0;
        this._interactables.length = 0;
        this._hoverElement = null;
        this._indActiveElements.length = 0;
        this._activeElements.length = 0;
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
        elements = elements.filter(el => {
            return (el[VE_VIEW_SYMBOL] ?? el[VE_SUB_VIEW_SYMBOL]?.[SV_VIEW_SYMBOL]) === this && el.interactMode === ViewElementInteractMode.Activation && !this._activeElements.includes(el);
        });
        this._activeElements.push(...elements);
        this.requestRender();
        return this;
    }
    deactivate(...elements: ViewElement[]) {
        this._activeElements = this._activeElements.filter(el => !elements.includes(el));
        this.requestRender();
        return this;
    }
    operate(element: ViewElement) {
        if ((element[VE_VIEW_SYMBOL] ?? element[VE_SUB_VIEW_SYMBOL]?.[SV_VIEW_SYMBOL]) === this && element.interactMode === ViewElementInteractMode.Operation) {
            this._operativeElement = element;
            this.requestRender();
        }
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
            const cs = el.clickStyle();
            const as = el.activeStyle();

            const hover = this._hoverElement === el;
            const click = this._operativeElement === el;
            const active = this._activeElements.includes(el);
            // `active` || `click` >`hover`

            renderer.paintOrder(s.paintOrder);
            renderer.noFill(s.noFill);
            renderer.fill((active && as.fill) || (click && cs.fill) || (hover && hs.fill) || s.fill);

            renderer.noStroke(s.noStroke);
            renderer.stroke((active && as.stroke) || (click && cs.stroke) || (hover && hs.stroke) || s.stroke);
            renderer.strokeWidth((active && as.strokeWidth) || (click && cs.strokeWidth) || (hover && hs.strokeWidth) || s.strokeWidth);

            renderer.strokeDash(s.strokeDash);
            renderer.strokeDashOffset(s.strokeDashOffset);
            renderer.strokeLineJoin(s.strokeLineJoin);
            renderer.strokeLineCap(s.strokeLineCap);
            renderer.strokeMiterLimit(s.strokeMiterLimit);

            const onTop = (hover && this.hoverForemost) || (click && this.clickForemost) || (active && this.activeForemost);
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

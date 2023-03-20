import { Geomtoy, Image, ParentShape, SealedShapeArray, SealedShapeObject, Shape, ShapeArray, ShapeObject } from "@geomtoy/core";
import { Assert, Maths, TransformationMatrix, Vector2 } from "@geomtoy/util";
import PointChecker from "../helper/PointChecker";
import type Renderer from "../renderer/Renderer";
import { Style, ViewElementEventType, ViewElementType, ViewEventType, type ViewEventObject } from "../types";
import Lasso from "./Lasso";
import SubView, { SV_VIEW_SYMBOL } from "./SubView";
import type ViewElement from "./ViewElement";
import { VE_EVENT_HANDLERS_SYMBOL, VE_SUB_VIEW_SYMBOL, VE_VIEW_SYMBOL } from "./ViewElement";

function viewEventObject(isTouch: boolean, viewportX: number, viewportY: number, x: number, y: number) {
    return { isTouch, viewportX, viewportY, x, y } as ViewEventObject;
}
function withElement(veo: ViewEventObject, el: ViewElement | null) {
    return { ...veo, currentElement: el } as ViewEventObject;
}

function isParentShape(v: Shape): v is Shape & ParentShape {
    return "items" in v;
}

const VIEW_DEFAULTS = {
    hoverForemost: true,
    operativeForemost: true,
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
    private _currentActivationElement: ViewElement | null = null;
    private _currentOperationElement: ViewElement | null = null;
    private _hoverElement: ViewElement | null = null;

    private _isActivationDrag = false;
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
            operativeForemost = VIEW_DEFAULTS.operativeForemost,
            activeForemost = VIEW_DEFAULTS.activeForemost,
            dragThrottleDistance = VIEW_DEFAULTS.dragThrottleDistance,
            minZoom = VIEW_DEFAULTS.minZoom,
            maxZoom = VIEW_DEFAULTS.maxZoom,
            wheelZoomDeltaRate = VIEW_DEFAULTS.wheelZoomDeltaRate,
            inverseWheelZoom = VIEW_DEFAULTS.inverseWheelZoom
        }: Partial<{
            hoverForemost: boolean;
            operativeForemost: boolean;
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
        this.operativeForemost = operativeForemost;
        this.activeForemost = activeForemost;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.dragThrottleDistance = dragThrottleDistance;
        this.wheelZoomDeltaRate = wheelZoomDeltaRate;
        this.inverseWheelZoom = inverseWheelZoom;
        this.renderer = renderer;

        // request render on every tick of Geomtoy
        Geomtoy.allTick(this._geomtoyRequestRender);
        this._hasTouchDevice = window.matchMedia("(any-pointer: coarse)").matches || "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }

    dispose() {
        Geomtoy.allTick(this._geomtoyRequestRender, true);
        this.stopResponsive();
        this.stopInteractive();
    }

    hoverForemost: boolean;
    operativeForemost: boolean;
    activeForemost: boolean;
    inverseWheelZoom: boolean;

    // todo
    // snapToGrid: boolean = true;
    /**
     * *Memo
     * The `activeElements` modified not by the user interaction does not trigger or dispatch events.
     */
    /**
     * Activation mode:
     *
     * numerous or numerousAlt: (This requires a modifier key to do multiple activating, so it' not suitable for touch devices.)
     *     Click on an inactive ac-element to activate it.
     *     numerous: Click on an ac-element of activeElements will do nothing.
     *     numerousAlt: Click on an ac-element of activeElements will deactivate all activeElements except this one, unless start dragging.
     *     Click on another inactive ac-element will deactivate all activeElements and activate the another ac-element.
     *     Click on a blank area will deactivate all activeElements.
     *     Hold modifier key and click on an inactive ac-element will activate this ac-element and keep current activeElements.
     *     Hold modifier key and click on an active ac-element will remove this from activeElements.
     *     Hold modifier key and click on a blank area will deactivate all activeElements.
     *
     * continuous or continuousAlt :(This does not require extra actions to do multiple activating, so it suitable for touch devices.)
     *     Click on an inactive ac-element to activate it.
     *     continuous: Click on an ac-element of activeElements will do nothing.
     *     continuousAlt: Click on an ac-element of activeElements will deactivate this ac-element but keep the rest activeElements, unless start dragging.
     *     Click on another inactive ac-element will activate the another ac-element and keep current activeElements.
     *     Click on a blank area will deactivate all activeElements.
     */
    //todo
    activationMode: "numerous" | "numerousAlt" | "continuous" | "continuousAlt" = "numerous";
    modifierKey: "Alt" | "Shift" | "Control" = "Shift";
    // todo
    // autoSwitchActivationMode:
    // `numerous` does not suitable on touch devices, so `activationMode` will automatically switches to `continuous` if on touch devices,
    //  while if we are on PCs, `activationMode` will automatically switches to `numerous`.

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
    get currentActivationElement() {
        return this._currentActivationElement;
    }
    get currentOperationElement() {
        return this._currentOperationElement;
    }
    get isActivationDrag() {
        return this._isActivationDrag;
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
        this._renderables.sort((a, b) => {
            const i = b.type - a.type;
            if (i !== 0) return i;
            return b.zIndex - a.zIndex;
        });
    }
    refreshInteractables() {
        this._interactables = this._renderables.filter(el => el.type !== ViewElementType.None);
        if (this._hoverElement !== null && !this._interactables.includes(this._hoverElement)) {
            this._hoverElement = null;
        }
        if (this._indActiveElements.length !== 0) {
            this._indActiveElements = this._indActiveElements.filter(el => this._interactables.includes(el));
        }
        if (this._currentOperationElement !== null && !this._interactables.includes(this._currentOperationElement)) {
            this._currentOperationElement = null;
        }
        if (this._activeElements.length !== 0) {
            this._activeElements = this._activeElements.filter(el => this._interactables.includes(el));
        }
        if (this._currentActivationElement !== null && !this._interactables.includes(this._currentActivationElement)) {
            this._currentActivationElement = null;
        }
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

    private _eventHandlers: { [key: string]: ((e: ViewEventObject) => void)[] } = {};

    on(eventType: ViewEventType, callback: (this: this, e: ViewEventObject) => void) {
        if (this._eventHandlers[eventType] === undefined) this._eventHandlers[eventType] = [];
        this._eventHandlers[eventType].push(callback);
        return this;
    }
    off(eventType: ViewEventType, callback: (this: this, e: ViewEventObject) => void) {
        if (this._eventHandlers[eventType] === undefined) return this;
        const index = this._eventHandlers[eventType].findIndex(h => h === callback);
        this._eventHandlers[eventType].splice(index, 1);
        return this;
    }
    clear(eventType?: ViewEventType) {
        if (eventType === undefined) {
            this._eventHandlers = {};
        } else {
            delete this._eventHandlers[eventType];
        }
        return this;
    }

    private _trigger(eventType: ViewEventType, object: ViewEventObject) {
        if (this._eventHandlers[eventType] === undefined) return;
        for (const cb of this._eventHandlers[eventType]) cb.call(this, object);
    }

    private _dispatch(viewElements: (ViewElement | null)[], eventType: ViewElementEventType, object: ViewEventObject) {
        for (const viewElement of viewElements) {
            if (viewElement === null) continue;
            if (viewElement[VE_EVENT_HANDLERS_SYMBOL][eventType] === undefined) return;
            for (const cb of viewElement[VE_EVENT_HANDLERS_SYMBOL][eventType]) cb.call(viewElement, object);
        }
    }

    get cursor() {
        return this.renderer.container.style.cursor as "default" | "pointer" | "move" | "grab" | "zoom-in" | "zoom-out" | "crosshair";
    }
    set cursor(value: "default" | "pointer" | "move" | "grab" | "zoom-in" | "zoom-out" | "crosshair") {
        this.renderer.container.style.cursor = value;
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
        this.cursor = "default";
        const veo = viewEventObject(isTouch, ...pointerOffset, ...atOffset);
        this._trigger(ViewEventType.PointerEnter, veo);
    }.bind(this);

    private readonly _pointerCancelHandler = function (this: View, e: PointerEvent) {
        const isTouch = e.pointerType === "touch";
        // this touch is not our touch
        if (isTouch && !this._hasTouch(e.pointerId)) return;
        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];

        const atOffset = this._getAntiOffset(pointerOffset);
        this.cursor = "default";
        const veo = viewEventObject(isTouch, ...pointerOffset, ...atOffset);
        this._trigger(ViewEventType.PointerCancel, veo);
    }.bind(this);

    private readonly _pointerLeaveHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        // this touch is not our touch
        if (isTouch && !this._hasTouch(e.pointerId)) return;
        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
        isTouch && this._removeTouch(e.pointerId);

        const atOffset = this._getAntiOffset(pointerOffset);
        const veo = viewEventObject(isTouch, ...pointerOffset, ...atOffset);
        this._trigger(ViewEventType.PointerLeave, veo);

        if (isMouse) {
            if (this._isDragging) {
                this.cursor = "default";
                this._isDragging = false;
                if (this._isActivationDrag) {
                    const temp = this._currentActivationElement;
                    this._currentActivationElement = null;
                    this._trigger(ViewEventType.DragEnd, withElement(veo, temp));
                    this._dispatch(this._activeElements, ViewElementEventType.DragEnd, withElement(veo, temp));
                    this.requestRender();
                } else {
                    const temp = this._currentOperationElement;
                    this._currentOperationElement = null;
                    this._trigger(ViewEventType.DragEnd, veo);
                    this._dispatch([temp], ViewElementEventType.DragEnd, withElement(veo, temp));
                    this.requestRender();
                }
            } else if (this._prepareDragging) {
                this.cursor = "default";
                this._prepareDragging = false;
            } else if (this._isPanning) {
                this.cursor = "default";
                this._isPanning = false;
                this._trigger(ViewEventType.PanEnd, veo);
            } else if (this._preparePanning) {
                this.cursor = "default";
                this._preparePanning = false;
            }
        }
        if (isTouch) {
            if (this._isDragging) {
                this.cursor = "default";
                this._isDragging = false;
                if (this._isActivationDrag) {
                    const temp = this._currentActivationElement;
                    this._currentActivationElement = null;
                    this._trigger(ViewEventType.DragEnd, withElement(veo, temp));
                    this._dispatch(this._activeElements, ViewElementEventType.DragEnd, withElement(veo, temp));
                    this.requestRender();
                } else {
                    const temp = this._currentOperationElement;
                    this._currentOperationElement = null;
                    this._trigger(ViewEventType.DragEnd, withElement(veo, temp));
                    this._dispatch([temp], ViewElementEventType.DragEnd, withElement(veo, temp));
                    this.requestRender();
                }
            } else if (this._prepareDragging) {
                this.cursor = "default";
                this._prepareDragging = false;
            } else if (this._isPanning || this._isZooming) {
                this._isPanning = false;
                this._isZooming = false;
                this._trigger(ViewEventType.ZoomEnd, veo);
                this._trigger(ViewEventType.PanEnd, veo);
                this._clearTouch();
            } else if (this._preparePanning || this._prepareZooming) {
                this._preparePanning = false;
                this._prepareZooming = false;
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
        const veo = viewEventObject(isTouch, ...pointerOffset, ...atOffset);
        this._trigger(ViewEventType.PointerDown, veo);

        if (this._doLasso) {
            this.cursor = "crosshair";
            this._lasso.init = atOffset;
            this._prepareLasso = true;
            return;
        }

        if (isMouse) {
            const foundIndex = this._interactables.findIndex(el => this._isPointInElement(el, ...atOffset));
            if (foundIndex !== -1) {
                const foundElement = this._interactables[foundIndex];
                // operativeElement
                if (foundElement.type === ViewElementType.Operation) {
                    this._isActivationDrag = false;
                    this._draggingOffset = atOffset;
                    this._prepareDragging = true;
                    this._currentOperationElement = foundElement;
                    this.requestRender();
                }
                // activeElements
                if (foundElement.type === ViewElementType.Activation) {
                    // continuous
                    if (this.activationMode === "continuous" || this.activationMode === "continuousAlt") {
                        if (!this._activeElements.includes(foundElement)) {
                            this._activateInternal(foundElement);
                            this._currentActivationElement = foundElement;
                            this._trigger(ViewEventType.Activate, withElement(veo, foundElement));
                            this._dispatch([foundElement], ViewElementEventType.Activate, withElement(veo, foundElement));
                            this.requestRender();
                        } else {
                            this._currentActivationElement = foundElement;
                            if (this.activationMode === "continuousAlt") this._indActiveElements = [foundElement];
                            this.requestRender();
                        }
                        this._isActivationDrag = true;
                        this._draggingOffset = atOffset;
                        this._prepareDragging = true;
                    }
                    // numerous
                    if (this.activationMode === "numerous" || this.activationMode === "numerousAlt") {
                        // with modifier key, can NOT continue with drag or click
                        if (e.getModifierState(this.modifierKey)) {
                            if (!this._activeElements.includes(foundElement)) {
                                this._activateInternal(foundElement);
                                this._currentActivationElement = foundElement;
                                this._trigger(ViewEventType.Activate, withElement(veo, foundElement));
                                this._dispatch([foundElement], ViewElementEventType.Activate, withElement(veo, foundElement));
                                this.requestRender();
                            } else {
                                this._deactivateInternal(foundElement);
                                this._currentActivationElement = foundElement;
                                this._trigger(ViewEventType.Deactivate, withElement(veo, foundElement));
                                this._dispatch([foundElement], ViewElementEventType.Deactivate, withElement(veo, foundElement));
                                this.requestRender();
                            }
                        }
                        // without modifier key
                        else {
                            if (!this._activeElements.includes(foundElement)) {
                                if (this._activeElements.length !== 0) {
                                    const temp = [...this._activeElements];
                                    this._activeElements.length = 0;
                                    this._trigger(ViewEventType.Deactivate, withElement(veo, foundElement));
                                    this._dispatch(temp, ViewElementEventType.Deactivate, withElement(veo, foundElement));
                                }
                                this._activateInternal(foundElement);
                                this._currentActivationElement = foundElement;
                                this._trigger(ViewEventType.Activate, withElement(veo, foundElement));
                                this._dispatch([foundElement], ViewElementEventType.Activate, withElement(veo, foundElement));
                                this.requestRender();
                            } else {
                                this._currentActivationElement = foundElement;
                                if (this.activationMode === "numerousAlt") this._indActiveElements = this._activeElements.filter(el => el !== foundElement);
                            }
                            this._isActivationDrag = true;
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
                    this._trigger(ViewEventType.Deactivate, withElement(veo, null));
                    this._dispatch(temp, ViewElementEventType.Deactivate, withElement(veo, null));
                    this.requestRender();
                }
            }
        }

        if (isTouch) {
            if (this._touchPointers.length === 1) {
                const foundIndex = this._interactables.findIndex(el => this._isPointInElement(el, ...atOffset));
                if (foundIndex !== -1) {
                    const foundElement = this._interactables[foundIndex];
                    // operativeElement
                    if (foundElement.type === ViewElementType.Operation) {
                        this._isActivationDrag = false;
                        this._draggingOffset = atOffset;
                        this._prepareDragging = true;
                        this._currentOperationElement = foundElement;
                        this.requestRender();
                    }
                    // activeElements
                    if (foundElement.type === ViewElementType.Activation) {
                        // continuous
                        if (this.activationMode === "continuous" || this.activationMode === "continuousAlt") {
                            if (!this._activeElements.includes(foundElement)) {
                                this._activateInternal(foundElement);
                                this._currentActivationElement = foundElement;
                                this._trigger(ViewEventType.Activate, withElement(veo, foundElement));
                                this._dispatch([foundElement], ViewElementEventType.Activate, withElement(veo, foundElement));
                                this.requestRender();
                            } else {
                                this._currentActivationElement = foundElement;
                                if (this.activationMode === "continuousAlt") this._indActiveElements = [foundElement];
                            }
                            this._isActivationDrag = true;
                            this._draggingOffset = atOffset;
                            this._prepareDragging = true;
                        }
                        // numerous
                        if (this.activationMode === "numerous" || this.activationMode === "numerousAlt") {
                            // with modifier key, can NOT continue with drag or click. A touch device may also has a physical keyboard.
                            if (e.getModifierState(this.modifierKey)) {
                                if (!this._activeElements.includes(foundElement)) {
                                    this._activateInternal(foundElement);
                                    this._currentActivationElement = foundElement;
                                    this._trigger(ViewEventType.Activate, withElement(veo, foundElement));
                                    this._dispatch([foundElement], ViewElementEventType.Activate, withElement(veo, foundElement));
                                    this.requestRender();
                                } else {
                                    this._deactivateInternal(foundElement);
                                    this._currentActivationElement = foundElement;
                                    this._trigger(ViewEventType.Deactivate, withElement(veo, foundElement));
                                    this._dispatch([foundElement], ViewElementEventType.Deactivate, withElement(veo, foundElement));
                                    this.requestRender();
                                }
                            }
                            // without modifier key
                            else {
                                if (!this._activeElements.includes(foundElement)) {
                                    if (this._activeElements.length !== 0) {
                                        const temp = [...this._activeElements];
                                        this._activeElements.length = 0;
                                        this._trigger(ViewEventType.Deactivate, withElement(veo, foundElement));
                                        this._dispatch(temp, ViewElementEventType.Deactivate, withElement(veo, foundElement));
                                    }
                                    this._activateInternal(foundElement);
                                    this._currentActivationElement = foundElement;
                                    this._trigger(ViewEventType.Activate, withElement(veo, foundElement));
                                    this._dispatch([foundElement], ViewElementEventType.Activate, withElement(veo, foundElement));
                                    this.requestRender();
                                } else {
                                    this._currentActivationElement = foundElement;
                                    if (this.activationMode === "numerousAlt") this._indActiveElements = this._activeElements.filter(el => el !== foundElement);
                                }
                                this._isActivationDrag = true;
                                this._draggingOffset = atOffset;
                                this._prepareDragging = true;
                            }
                        }
                    }
                } else {
                    if (this._activeElements.length !== 0) {
                        const temp = [...this._activeElements];
                        this._activeElements.length = 0;
                        this._trigger(ViewEventType.Deactivate, withElement(veo, null));
                        this._dispatch(temp, ViewElementEventType.Deactivate, withElement(veo, null));
                        this.requestRender();
                    }
                }
            } else if (this._touchPointers.length === 2) {
                this.cursor = "default";
                const offsetVec = Vector2.from(this._touchPointers[0].offset, this._touchPointers[1].offset);
                const distance = Vector2.magnitude(offsetVec);
                const centerOffset = Vector2.add(this._touchPointers[0].offset, Vector2.scalarMultiply(offsetVec, 0.5));

                this._zoomingDistance = distance;
                this._panningOffset = centerOffset;
                this._prepareDragging = false;
                this._isDragging = false;
                this._preparePanning = true;
                this._prepareZooming = true;
                if (this._activeElements.length !== 0) {
                    const temp = [...this._activeElements];
                    this._activeElements.length = 0;
                    this._trigger(ViewEventType.Deactivate, withElement(veo, null));
                    this._dispatch(temp, ViewElementEventType.Deactivate, withElement(veo, null));
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
        const veo = viewEventObject(isTouch, ...pointerOffset, ...atOffset);
        this._trigger(ViewEventType.PointerUp, veo);

        if (this._doLasso) {
            this.cursor = "default";
            if (this._lassoing) {
                this._lassoing = false;
                this._lasso.term = atOffset;
                const hits = this._lasso.hit(this._interactables);
                if (this._activeElements.length !== 0) {
                    const temp = [...this._activeElements];
                    this._activeElements.length = 0;
                    this._trigger(ViewEventType.Deactivate, withElement(veo, null));
                    this._dispatch(temp, ViewElementEventType.Deactivate, withElement(veo, null));
                }
                if (hits.length !== 0) {
                    this._activateInternal(...hits);
                    this._trigger(ViewEventType.Activate, withElement(veo, null));
                    this._dispatch(hits, ViewElementEventType.Activate, withElement(veo, null));
                }
                this.requestRender();
            }
            if (this._prepareLasso) {
                this._prepareLasso = false;
                if (this._activeElements.length !== 0) {
                    const temp = [...this._activeElements];
                    this._activeElements.length = 0;
                    this._trigger(ViewEventType.Deactivate, withElement(veo, null));
                    this._dispatch(temp, ViewElementEventType.Deactivate, withElement(veo, null));
                }
                this.requestRender();
            }
            return;
        }

        if (isMouse) {
            if (this._isDragging) {
                this.cursor = "pointer";
                this._isDragging = false;
                if (this._isActivationDrag) {
                    const temp = this._currentOperationElement;
                    this._currentActivationElement = null;
                    this._trigger(ViewEventType.DragEnd, withElement(veo, temp));
                    this._dispatch(this._activeElements, ViewElementEventType.DragEnd, withElement(veo, temp));
                    this.requestRender();
                } else {
                    const temp = this._currentOperationElement;
                    this._currentOperationElement = null;
                    this._trigger(ViewEventType.DragEnd, withElement(veo, temp));
                    this._dispatch([temp], ViewElementEventType.DragEnd, withElement(veo, temp));
                    this.requestRender();
                }
            } else if (this._prepareDragging) {
                this.cursor = "pointer";
                this._prepareDragging = false;
                if (this._isActivationDrag) {
                    const temp = this._currentActivationElement;
                    this._currentActivationElement = null;
                    this._trigger(ViewEventType.Click, withElement(veo, temp));
                    this._dispatch([temp], ViewElementEventType.Click, withElement(veo, temp));
                    this.requestRender();
                    if (this.activationMode === "continuousAlt" || this.activationMode === "numerousAlt") {
                        if (this._indActiveElements.length !== 0) {
                            this._deactivateInternal(...this._indActiveElements);
                            this._trigger(ViewEventType.Deactivate, withElement(veo, temp));
                            this._dispatch(this._indActiveElements, ViewElementEventType.Deactivate, withElement(veo, temp));
                            this._indActiveElements.length = 0;
                            this.requestRender();
                        }
                    }
                } else {
                    const temp = this._currentOperationElement;
                    this._currentOperationElement = null;
                    this._trigger(ViewEventType.Click, withElement(veo, temp));
                    this._dispatch([temp], ViewElementEventType.Click, withElement(veo, temp));
                    this.requestRender();
                }
            } else if (this._isPanning) {
                this.cursor = "default";
                this._isPanning = false;
                this._trigger(ViewEventType.PanEnd, veo);
            } else if (this._preparePanning) {
                this.cursor = "default";
                this._preparePanning = false;
            }
        }
        if (isTouch) {
            if (this._isDragging) {
                this.cursor = "pointer";
                this._isDragging = false;
                if (this._isActivationDrag) {
                    const temp = this._currentActivationElement;
                    this._currentActivationElement = null;
                    this._trigger(ViewEventType.DragEnd, withElement(veo, temp));
                    this._dispatch(this._activeElements, ViewElementEventType.DragEnd, withElement(veo, temp));
                    this.requestRender();
                } else {
                    const temp = this._currentOperationElement;
                    this._currentOperationElement = null;
                    this._trigger(ViewEventType.DragEnd, withElement(veo, temp));
                    this._dispatch([temp], ViewElementEventType.DragEnd, withElement(veo, temp));
                    this.requestRender();
                }
            } else if (this._prepareDragging) {
                this.cursor = "pointer";
                this._prepareDragging = false;
                if (this._isActivationDrag) {
                    const temp = this._currentActivationElement;
                    this._currentActivationElement = null;
                    this._trigger(ViewEventType.Click, withElement(veo, temp));
                    this._dispatch([temp], ViewElementEventType.Click, withElement(veo, temp));
                    this.requestRender();
                    if (this.activationMode === "continuousAlt" || this.activationMode === "numerousAlt") {
                        if (this._indActiveElements.length !== 0) {
                            this._deactivateInternal(...this._indActiveElements);
                            this._trigger(ViewEventType.Deactivate, withElement(veo, temp));
                            this._dispatch(this._indActiveElements, ViewElementEventType.Deactivate, withElement(veo, temp));
                            this._indActiveElements.length = 0;
                            this.requestRender();
                        }
                    }
                } else {
                    const temp = this._currentOperationElement;
                    this._currentOperationElement = null;
                    this._trigger(ViewEventType.Click, withElement(veo, temp));
                    this._dispatch([temp], ViewElementEventType.Click, withElement(veo, temp));
                    this.requestRender();
                }
            } else if (this._prepareZooming || this._preparePanning) {
                this.cursor = "default";
                this._preparePanning = false;
                this._prepareZooming = false;
                this._clearTouch();
            } else if (this._isPanning || this._isZooming) {
                this.cursor = "default";
                this._isPanning = false;
                this._isZooming = false;
                this._trigger(ViewEventType.ZoomEnd, veo);
                this._trigger(ViewEventType.PanEnd, veo);
                this._clearTouch();
            }
        }
    }.bind(this);

    private readonly _pointerMoveHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        if (isTouch && !this._hasTouch(e.pointerId)) return;
        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
        // We must update touch here, `_rafTick` definitely causes storing of pointer old offset.
        isTouch && this._updateTouch(e.pointerId, pointerOffset);

        this._rafTick(() => {
            const atOffset = this._getAntiOffset(pointerOffset);
            const veo = viewEventObject(isTouch, ...pointerOffset, ...atOffset);
            this._trigger(ViewEventType.PointerMove, veo);

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
                    const scale = this.renderer.display.scale;
                    const dragDistance = Maths.hypot(atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]) * scale;
                    if (dragDistance < this.dragThrottleDistance) {
                        return;
                    } else {
                        this._isDragging = true;
                        this._prepareDragging = false;
                        if (this._isActivationDrag && this._indActiveElements.length !== 0) this._indActiveElements.length = 0;
                        if (this._isActivationDrag) {
                            this._trigger(ViewEventType.DragStart, withElement(veo, this._currentActivationElement));
                            this._dispatch(this._activeElements, ViewElementEventType.DragStart, withElement(veo, this._currentActivationElement));
                        } else {
                            this._trigger(ViewEventType.DragStart, withElement(veo, this._currentOperationElement));
                            this._dispatch([this._currentOperationElement], ViewElementEventType.DragStart, withElement(veo, this._currentOperationElement));
                        }
                        return;
                    }
                }

                if (this._isDragging) {
                    this.cursor = "move";
                    const [deltaX, deltaY] = [atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]];
                    this._draggingOffset = atOffset;
                    if (this._isActivationDrag) {
                        this._activeElements.forEach(el => !el.noDrag && el.move(deltaX, deltaY));
                        this._trigger(ViewEventType.Dragging, withElement(veo, this._currentActivationElement));
                    } else {
                        !this._currentOperationElement!.noDrag && this._currentOperationElement!.move(deltaX, deltaY);
                        this._trigger(ViewEventType.Dragging, withElement(veo, this._currentOperationElement));
                    }
                } else if (this._preparePanning) {
                    this._preparePanning = false;
                    this._isPanning = true;
                    this._trigger(ViewEventType.PanStart, veo);
                } else if (this._isPanning) {
                    this.cursor = "grab";
                    const [deltaX, deltaY] = [pointerOffset[0] - this._panningOffset[0], pointerOffset[1] - this._panningOffset[1]];
                    this._panningOffset = pointerOffset;
                    this.renderer.display.pan = [this.renderer.display.pan[0] + deltaX, this.renderer.display.pan[1] + deltaY];
                    this._trigger(ViewEventType.Panning, veo);
                    this.requestRender();
                } else {
                    const foundIndex = this._interactables.findIndex(el => this._isPointInElement(el, ...atOffset));
                    if (foundIndex !== -1) {
                        const foundElement = this._interactables[foundIndex];
                        if (this._hoverElement !== null) {
                            if (this._hoverElement !== foundElement) {
                                const temp = this._hoverElement;
                                this._hoverElement = null;
                                this._trigger(ViewEventType.Unhover, withElement(veo, foundElement));
                                this._dispatch([temp], ViewElementEventType.Unhover, withElement(veo, foundElement));
                                if (!foundElement.noHover) {
                                    this._hoverElement = foundElement;
                                    this._trigger(ViewEventType.Hover, withElement(veo, foundElement));
                                    this._dispatch([foundElement], ViewElementEventType.Hover, withElement(veo, foundElement));
                                } else {
                                    this.cursor = "default";
                                }
                                this.requestRender();
                            } else {
                                if (this._hoverElement.noHover) {
                                    this.cursor = "default";
                                    this._hoverElement = null;
                                    this.requestRender();
                                } else {
                                    if (this.cursor !== "pointer") this.cursor = "pointer";
                                }
                            }
                        } else {
                            if (!foundElement.noHover) {
                                this.cursor = "pointer";
                                this._hoverElement = foundElement;
                                this._trigger(ViewEventType.Hover, withElement(veo, foundElement));
                                this._dispatch([foundElement], ViewElementEventType.Hover, withElement(veo, foundElement));
                                this.requestRender();
                            }
                        }
                    } else {
                        if (this._hoverElement !== null) {
                            this.cursor = "default";
                            this._hoverElement = null;
                            this._trigger(ViewEventType.Unhover, withElement(veo, null));
                            this._dispatch([this._hoverElement], ViewElementEventType.Unhover, withElement(veo, null));
                            this.requestRender();
                        } else {
                            if (this.cursor !== "default") this.cursor = "default";
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
                        if (this._isActivationDrag && this._indActiveElements.length !== 0) this._indActiveElements.length = 0;
                        if (this._isActivationDrag) {
                            this._trigger(ViewEventType.DragStart, withElement(veo, this._currentActivationElement));
                            this._dispatch(this._activeElements, ViewElementEventType.DragStart, withElement(veo, this._currentActivationElement));
                        } else {
                            this._trigger(ViewEventType.DragStart, withElement(veo, this._currentOperationElement));
                            this._dispatch([this._currentOperationElement], ViewElementEventType.DragStart, withElement(veo, this._currentOperationElement));
                        }
                        return;
                    }
                }

                if (this._isDragging) {
                    this.cursor = "move";
                    const [deltaX, deltaY] = [atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]];
                    this._draggingOffset = atOffset;
                    if (this._isActivationDrag) {
                        this._activeElements.forEach(el => !el.noDrag && el.move(deltaX, deltaY));
                        this._trigger(ViewEventType.Dragging, withElement(veo, this._currentActivationElement));
                    } else {
                        !this._currentOperationElement!.noDrag && this._currentOperationElement!.move(deltaX, deltaY);
                        this._trigger(ViewEventType.Dragging, withElement(veo, this._currentOperationElement));
                    }
                } else if (this._prepareZooming || this._preparePanning) {
                    this._prepareZooming = false;
                    this._preparePanning = false;
                    this._isZooming = true;
                    this._isPanning = true;
                    this._trigger(ViewEventType.ZoomStart, veo);
                    this._trigger(ViewEventType.PanStart, veo);
                } else if (this._isZooming || this._isPanning) {
                    this.cursor = "default";

                    const offsetVec = Vector2.from(this._touchPointers[0].offset, this._touchPointers[1].offset);
                    const distance = Vector2.magnitude(offsetVec);
                    const centerOffset = Vector2.add(this._touchPointers[0].offset, Vector2.scalarMultiply(offsetVec, 0.5));

                    const deltaZoom = distance / this._zoomingDistance;
                    const [deltaX, deltaY] = [centerOffset[0] - this._panningOffset[0], centerOffset[1] - this._panningOffset[1]];

                    this._panningOffset = centerOffset;
                    this._zoomingDistance = distance;

                    const display = this.renderer.display;
                    let zoom = display.zoom * deltaZoom;
                    zoom = Maths.clamp(zoom, this.minZoom, this.maxZoom);

                    const atOffset = this._getAntiOffset(centerOffset);
                    display.zoom = zoom;
                    this._trigger(ViewEventType.Zooming, veo);
                    const [scaledOffsetX, scaledOffsetY] = this._getOffset(atOffset);
                    const [zoomOffsetX, zoomOffsetY] = [centerOffset[0] - scaledOffsetX, centerOffset[1] - scaledOffsetY];
                    display.pan = [display.pan[0] + deltaX + zoomOffsetX, display.pan[1] + deltaY + zoomOffsetY];
                    this._trigger(ViewEventType.Panning, veo);
                    this.requestRender();
                }
            }
        });
    }.bind(this);

    private readonly _wheelHandler = function (this: View, e: WheelEvent) {
        e.preventDefault();
        this._rafTick(() => {
            const mouseOffset = [e.offsetX, e.offsetY] as [number, number];
            const atOffset = this._getAntiOffset(mouseOffset);
            const veo = viewEventObject(false, ...mouseOffset, ...atOffset);
            this._trigger(ViewEventType.Wheel, veo);
            this._trigger(ViewEventType.ZoomStart, veo);
            this._trigger(ViewEventType.PanStart, veo);

            const deltaY = e.deltaY;
            const display = this.renderer.display;
            let zoom: number;
            if (this.inverseWheelZoom) {
                zoom = deltaY < 0 ? display.zoom / this.wheelZoomDeltaRate : deltaY > 0 ? display.zoom * this.wheelZoomDeltaRate : display.zoom;
            } else {
                zoom = deltaY > 0 ? display.zoom / this.wheelZoomDeltaRate : deltaY < 0 ? display.zoom * this.wheelZoomDeltaRate : display.zoom;
            }
            zoom = Maths.clamp(zoom, this.minZoom, this.maxZoom);
            display.zoom = zoom;
            this._trigger(ViewEventType.Zooming, veo);

            const [scaledOffsetX, scaledOffsetY] = this._getOffset(atOffset);
            const [zoomOffsetX, zoomOffsetY] = [mouseOffset[0] - scaledOffsetX, mouseOffset[1] - scaledOffsetY];
            display.pan = [display.pan[0] + zoomOffsetX, display.pan[1] + zoomOffsetY];
            this._trigger(ViewEventType.Panning, veo);
            this._trigger(ViewEventType.ZoomEnd, veo);
            this._trigger(ViewEventType.PanEnd, veo);
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
            return (el[VE_VIEW_SYMBOL] ?? el[VE_SUB_VIEW_SYMBOL]?.[SV_VIEW_SYMBOL]) === this && el.type === ViewElementType.Activation && !this._activeElements.includes(el);
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
        if ((element[VE_VIEW_SYMBOL] ?? element[VE_SUB_VIEW_SYMBOL]?.[SV_VIEW_SYMBOL]) === this && element.type === ViewElementType.Operation) {
            this._currentOperationElement = element;
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

    private _shouldRender(presentShapeSet: Set<Shape>) {
        function _shapeDeepIn(shape: Shape & ParentShape): boolean {
            for (const item of Object.values(shape.items)) {
                if (isParentShape(item)) return _shapeDeepIn(item);
                if (presentShapeSet.has(item)) return true;
            }
            return false;
        }
        for (const ve of this._renderables) {
            if (isParentShape(ve.shape)) {
                if (_shapeDeepIn(ve.shape)) return true;
            } else {
                if (presentShapeSet.has(ve.shape)) return true;
            }
        }
        return false;
    }

    private _renderLasso() {
        const renderer = this.renderer;
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

    private _renderScheduled = false;
    requestRender() {
        if (this._renderScheduled) return;
        this._renderScheduled = true;

        Promise.resolve().then(() => {
            this._renderFunc();
            this._renderScheduled = false;
        });
    }
    private _geomtoyRequestRender = function (this: View, presentShapeSet: Set<Shape>) {
        if (!this._shouldRender(presentShapeSet)) return;
        this._renderFunc();
    }.bind(this);

    private _renderFunc() {
        const renderer = this.renderer;

        renderer.clear();

        const renderList = sortToRender(
            this._renderables,
            this.hoverForemost,
            this.operativeForemost,
            this.activeForemost,
            this._hoverElement,
            this._currentOperationElement,
            this._currentActivationElement,
            this._activeElements
        );

        renderList.forEach(el => {
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
            const click = this._currentOperationElement === el || this._currentActivationElement == el;
            const active = this._activeElements.includes(el);
            // `click` > `active` >`hover`

            renderer.paintOrder(s.paintOrder);
            renderer.noFill(s.noFill);
            renderer.fill((click && cs.fill) || (active && as.fill) || (hover && hs.fill) || s.fill);

            renderer.noStroke(s.noStroke);
            renderer.stroke((click && cs.stroke) || (active && as.stroke) || (hover && hs.stroke) || s.stroke);
            renderer.strokeWidth((click && cs.strokeWidth) || (active && as.strokeWidth) || (hover && hs.strokeWidth) || s.strokeWidth);

            renderer.strokeDash(s.strokeDash);
            renderer.strokeDashOffset(s.strokeDashOffset);
            renderer.strokeLineJoin(s.strokeLineJoin);
            renderer.strokeLineCap(s.strokeLineCap);
            renderer.strokeMiterLimit(s.strokeMiterLimit);

            el.paths = renderer.draw(el.shape, false);
        });

        this._lassoing && this._renderLasso();
    }
}

function sortToRender(
    renderables: ViewElement[], // pre sorted with  [...Operation desc, ...Activation desc, ...None desc]
    hoverForemost: boolean,
    operativeForemost: boolean,
    activeForemost: boolean,
    hoverElement: ViewElement | null,
    currentOperationElement: ViewElement | null,
    currentActivationElement: ViewElement | null,
    activeElements: ViewElement[]
) {
    /**
     * from the top to bottom
     * Operation      operativeForemost ? `currentOperationElement`
     *                hoverForemost ? hovered `Operation` - `hoverElement`
     *                other `Operation`s ordered by z-index desc
     * Activation     activeForemost ? `currentActivationElement`
     *                activeForemost ? `activeElements` ordered by z-index desc
     *                hoverForemost ? hovered `Activation` - `hoverElement`
     *                other `Activation`s ordered by z-index desc
     * None           all `None`s ordered by z-index desc
     */
    let hoverOperation: ViewElement | undefined;
    let operatingOperation: ViewElement | undefined;
    const plainOperations: ViewElement[] = [];

    let hoverActivation: ViewElement | undefined;
    let activatingActivation: ViewElement | undefined;
    const activeActivations: ViewElement[] = [];
    const plainActivations: ViewElement[] = [];

    const nones: ViewElement[] = [];

    for (const ve of renderables) {
        if (ve.type === ViewElementType.Operation) {
            if (hoverForemost && hoverElement === ve) hoverOperation = ve;
            else if (operativeForemost && currentOperationElement === ve) operatingOperation = ve;
            else plainOperations.push(ve);
        }
        if (ve.type === ViewElementType.Activation) {
            if (hoverForemost && hoverElement === ve) hoverActivation = ve;
            else if (activeForemost && currentActivationElement === ve) activatingActivation = ve;
            else if (activeForemost && activeElements.includes(ve)) activeActivations.push(ve);
            else plainActivations.push(ve);
        }
        if (ve.type === ViewElementType.None) {
            nones.push(ve);
        }
    }
    return [
        ...(operatingOperation ? [operatingOperation] : []),
        ...(hoverOperation ? [hoverOperation] : []),
        ...plainOperations,
        ...(activatingActivation ? [activatingActivation] : []),
        ...activeActivations,
        ...(hoverActivation ? [hoverActivation] : []),
        ...plainActivations,
        ...nones
    ];
}

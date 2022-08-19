import { Maths, Assert, TransformationMatrix } from "@geomtoy/util";
import PointChecker from "../helper/PointChecker";
import ViewElement from "./ViewElement";
import { Image } from "@geomtoy/core";

import type Renderer from "../renderer/Renderer";
import { Geomtoy } from "@geomtoy/core";
import ViewGroupElement from "./ViewGroupElement";
import { ViewEventType } from "./ViewEvents";

const VIEW_DEFAULTS = {
    hoverForemost: true,
    activeForemost: true,
    minZoom: 0.001,
    maxZoom: 1000,
    wheelZoomDeltaRate: 1.1,
    inverseWheelZoom: false,
    dragThrottleDistance: 10,
    maxTouchPointerCount: 2,
    resizeObserverDebouncingTime: 100 //ms
};

export default class View {
    private _dragThrottleDistance = VIEW_DEFAULTS.dragThrottleDistance;
    private _minZoom = VIEW_DEFAULTS.minZoom;
    private _maxZoom = VIEW_DEFAULTS.maxZoom;
    private _wheelZoomDeltaRate = VIEW_DEFAULTS.wheelZoomDeltaRate;

    private _renderer: Renderer = null as unknown as Renderer;

    private _hasTouchDevice: boolean;
    private _touchPointers: { id: number; offset: [number, number] }[] = [];

    private _hoverElement: ViewElement | ViewGroupElement | null = null;
    private _activeElements: (ViewElement | ViewGroupElement)[] = [];
    private _deactivatingElement: ViewElement | ViewGroupElement | null = null;
    private _isDragging: boolean = false;
    private _isPanning: boolean = false;
    private _isZooming: boolean = false;
    private _preparingDragging: boolean = false;
    private _preparingPanning: boolean = false;
    private _preparingZooming: boolean = false;
    private _draggingOffset: [number, number] = [0, 0];
    private _panningOffset: [number, number] = [0, 0];
    private _zoomingDistance: number = 0;

    private _resizeObserver: ResizeObserver | null = null;
    private _resizeTimer = 0;

    // The `elements` are considered to be stored and arranged from the foremost to the backmost.
    private _elements: (ViewElement | ViewGroupElement)[] = [];
    private _interactables: (ViewElement | ViewGroupElement)[] = [];

    private _renderScheduled: boolean = false;
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
        renderer?: Renderer
    ) {
        this.hoverForemost = hoverForemost;
        this.activeForemost = activeForemost;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.dragThrottleDistance = dragThrottleDistance;
        this.wheelZoomDeltaRate = wheelZoomDeltaRate;
        this.inverseWheelZoom = inverseWheelZoom;
        renderer && (this.renderer = renderer);

        this._hasTouchDevice = window.matchMedia("(any-pointer: coarse)").matches || "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }

    hoverForemost: boolean;
    activeForemost: boolean;
    inverseWheelZoom: boolean;

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
        Assert.condition(this._renderer !== null, "[G]You should set the `renderer` property of the `View` first.");
        return this._renderer;
    }
    set renderer(value) {
        this._renderer = value;
        value.view = this;
    }

    get elements() {
        return [...this._elements];
    }

    use(renderer: Renderer, responsiveCallback: (width: number, height: number) => void) {
        if (this._renderer !== null) {
            this.stopInteractive();
            this.stopResponsive();
        }
        this.renderer = renderer;
        this.startInteractive();
        this.startResponsive(responsiveCallback);
    }
    refreshInteractables() {
        this._interactables = this._elements.filter(el => el.interactable);
    }

    private _requestRAFTick(callback: (...args: any[]) => void) {
        if (!this._rafTicking) {
            this._rafTicking = true;
            requestAnimationFrame(() => {
                callback();
                this._rafTicking = false;
            });
        }
    }
    private _isPointInElement(element: ViewElement | ViewGroupElement, x: number, y: number) {
        if (element instanceof ViewElement) {
            if (element.path === undefined) return false;
            return PointChecker.isPointIn(x, y, element.path!, element.style(), this._hasTouchDevice);
        } else {
            if (element.paths === undefined) return false;
            return element.paths.some((_, index) => PointChecker.isPointIn(x, y, element.paths![index], element.style(), this._hasTouchDevice));
        }
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

    private _eventHandler: { [key: string]: ((...args: any[]) => any)[] } = {};

    on(eventType: ViewEventType, handler: (...args: any[]) => any) {
        if(this._eventHandler[eventType] === undefined) this._eventHandler[eventType] = []
        this._eventHandler[eventType].push(handler);
    }
    off(eventType: ViewEventType, handler: (...args: any[]) => any) {
        const index = this._eventHandler[eventType].findIndex(h => h === handler);
        this._eventHandler[eventType].splice(index, 1);
    }
    clear(eventType?: ViewEventType) {
        if (eventType === undefined) {
            this._eventHandler = {};
        } else {
            this._eventHandler[eventType] = [];
        }
    }

    cursor(type: "default" | "pointer" | "move" | "grab" | "grabbing" | "zoom-in" | "zoom-out") {
        this.renderer.container.style.cursor = type;
    }

    // todo view will still need emit some event.
    private readonly _pointerDownHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
        isTouch && this._addTouch(e.pointerId, pointerOffset);
        // only allow the primary button of mouse
        if (isMouse && e.buttons !== 1) return;

        if (isMouse) {
            const atOffset = TransformationMatrix.antitransformCoordinates(this.renderer.display.globalTransformation, pointerOffset);
            const foundIndex = this._interactables.findIndex(element => this._isPointInElement(element, ...atOffset));
            if (foundIndex !== -1) {
                this.cursor("pointer");
                if (!this._activeElements.includes(this._interactables[foundIndex])) {
                    this._activeElements.push(this._interactables[foundIndex]);
                    this.render();
                } else {
                    this._deactivatingElement = this._interactables[foundIndex];
                }
                this._draggingOffset = atOffset;
                this._preparingDragging = true;
            } else {
                this.cursor("grab");
                this._preparingPanning = true;
                this._panningOffset = pointerOffset;
                this._activeElements.length > 0 && this.render();
                this._activeElements = [];
            }
        }
        if (isTouch) {
            if (this._touchPointers.length === 1) {
                const atOffset = TransformationMatrix.antitransformCoordinates(this.renderer.display.globalTransformation, pointerOffset);
                const foundIndex = this._interactables.findIndex(element => this._isPointInElement(element, ...atOffset));
                if (foundIndex !== -1) {
                    this.cursor("pointer");
                    if (!this._activeElements.includes(this._interactables[foundIndex])) {
                        this._activeElements.push(this._interactables[foundIndex]);
                        this.render();
                    } else {
                        this._deactivatingElement = this._interactables[foundIndex];
                    }
                    this._draggingOffset = atOffset;
                    this._preparingDragging = true;
                } else {
                    this.cursor("grab");
                    this._activeElements.length > 0 && this.render();
                    this._activeElements = [];
                }
            } else if (this._touchPointers.length === 2) {
                this.cursor("default");

                const [offset1, offset2] = [this._touchPointers[0].offset, this._touchPointers[1].offset];
                const distance = Maths.hypot(offset2[0] - offset1[0], offset2[1] - offset1[1]);
                const centerOffset = [(offset2[0] + offset1[0]) / 2, (offset2[1] + offset1[1]) / 2] as [number, number];

                this._zoomingDistance = distance;
                this._panningOffset = centerOffset;

                this._preparingDragging = false;
                this._isDragging = false;
                this._activeElements.length > 0 && this.render();
                this._activeElements = [];

                this._preparingPanning = true;
                this._preparingZooming = true;
            }
        }
        if (this._eventHandler[ViewEventType.PointerDown]?.length) {
            this._nextTick(() => this._eventHandler[ViewEventType.PointerDown].forEach(cb => cb()));
        }
    }.bind(this);
    private readonly _pointerUpHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        if (isTouch && !this._hasTouch(e.pointerId)) return;
        isTouch && this._removeTouch(e.pointerId);

        if (isMouse) {
            if (this._isDragging) {
                this.cursor("default");
                this._isDragging = false;
            } else if (this._preparingDragging) {
                this.cursor("default");
                this._preparingDragging = false;

                if (this._deactivatingElement !== null) {
                    const index = this._activeElements.indexOf(this._deactivatingElement);
                    index !== -1 && this._activeElements.splice(index, 1);
                    this.render();
                    this._deactivatingElement = null;
                }
            } else if (this._isPanning) {
                this.cursor("default");
                this._isPanning = false;
            } else if (this._preparingPanning) {
                this.cursor("default");
                this._preparingPanning = false;
            }
        }
        if (isTouch) {
            if (this._isDragging) {
                this.cursor("default");
                this._isDragging = false;
            } else if (this._preparingDragging) {
                this.cursor("default");
                this._preparingDragging = false;
                if (this._deactivatingElement !== null) {
                    const index = this._activeElements.indexOf(this._deactivatingElement);
                    index !== -1 && this._activeElements.splice(index, 1);
                    this.render();
                    this._deactivatingElement = null;
                }
            } else if (this._isPanning || this._preparingPanning || this._isZooming || this._preparingZooming) {
                this.cursor("default");
                this._isPanning = false;
                this._preparingPanning = false;
                this._isZooming = false;
                this._preparingZooming = false;
                this._clearTouch();
            }
        }
    }.bind(this);
    private readonly _pointerLeaveHandler = this._pointerUpHandler;
    private readonly _pointerMoveHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        if (isTouch && !this._hasTouch(e.pointerId)) return;
        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
        isTouch && this._updateTouch(e.pointerId, pointerOffset);

        if (isMouse) {
            this._requestRAFTick(() => {
                const atOffset = TransformationMatrix.antitransformCoordinates(this.renderer.display.globalTransformation, pointerOffset);
                if (this._preparingDragging) {
                    const scale = this.renderer.display.density * this.renderer.display.zoom;
                    const dragDistance = Maths.hypot(atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]) * scale;
                    if (dragDistance < this.dragThrottleDistance) return;
                }

                if (this._preparingDragging || this._isDragging) {
                    this.cursor("move");
                    this._preparingDragging = false;
                    this._isDragging = true;

                    const [deltaX, deltaY] = [atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]];
                    this._draggingOffset = atOffset;
                    this._activeElements.forEach(element => element.move(deltaX, deltaY));
                    this.render();
                } else if (this._preparingPanning || this._isPanning) {
                    this.cursor("grabbing");
                    this._preparingPanning = false;
                    this._isPanning = true;

                    const [deltaX, deltaY] = [pointerOffset[0] - this._panningOffset[0], pointerOffset[1] - this._panningOffset[1]];
                    this._panningOffset = pointerOffset;
                    this.renderer.display.pan = [this.renderer.display.pan[0] + deltaX, this.renderer.display.pan[1] + deltaY];
                    this.render();
                } else {
                    const foundIndex = this._interactables.findIndex(element => this._isPointInElement(element, ...atOffset));
                    if (foundIndex !== -1) {
                        this.cursor("pointer");
                        this._hoverElement = this._interactables[foundIndex];
                        this.render();
                    } else {
                        if (this._hoverElement !== null) {
                            this.cursor("default");
                            this._hoverElement = null;
                            this.render();
                        } else {
                            // do nothing
                        }
                    }
                }
            });
        }

        if (isTouch) {
            this._requestRAFTick(() => {
                const atOffset = TransformationMatrix.antitransformCoordinates(this.renderer.display.globalTransformation, pointerOffset);
                if (this._preparingDragging) {
                    const scale = this.renderer.display.density * this.renderer.display.zoom;
                    const dragDistance = Maths.hypot(atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]) * scale;
                    if (dragDistance < this.dragThrottleDistance) return;
                }

                if (this._preparingDragging || this._isDragging) {
                    this.cursor("move");
                    this._preparingDragging = false;
                    this._isDragging = true;

                    const [deltaX, deltaY] = [atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]];
                    this._draggingOffset = atOffset;
                    this._activeElements.forEach(element => element.move(deltaX, deltaY));
                    this.render();
                } else if (this._preparingZooming || this._isZooming || this._preparingPanning || this._isPanning) {
                    this.cursor("default");
                    this._preparingZooming = false;
                    this._preparingPanning = false;
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

                    const [atOffsetX, atOffsetY] = TransformationMatrix.antitransformCoordinates(display.globalTransformation, centerOffset);
                    display.zoom = zoom;
                    const [scaledOffsetX, scaledOffsetY] = TransformationMatrix.transformCoordinates(display.globalTransformation, [atOffsetX, atOffsetY]);
                    const [zoomOffsetX, zoomOffsetY] = [centerOffset[0] - scaledOffsetX, centerOffset[1] - scaledOffsetY];
                    display.pan = [display.pan[0] + deltaX + zoomOffsetX, display.pan[1] + deltaY + zoomOffsetY];
                    this.render();
                }
            });
        }
    }.bind(this);
    private readonly _wheelHandler = function (this: View, e: WheelEvent) {
        e.preventDefault();
        const mouseOffset = [e.offsetX, e.offsetY] as [number, number];
        const deltaY = e.deltaY;
        this._requestRAFTick(() => {
            const display = this.renderer.display;
            let zoom: number;
            if (this.inverseWheelZoom) {
                zoom = deltaY < 0 ? display.zoom / this.wheelZoomDeltaRate : deltaY > 0 ? display.zoom * this.wheelZoomDeltaRate : display.zoom;
            } else {
                zoom = deltaY > 0 ? display.zoom / this.wheelZoomDeltaRate : deltaY < 0 ? display.zoom * this.wheelZoomDeltaRate : display.zoom;
            }
            zoom = zoom < this.minZoom ? this.minZoom : zoom > this.maxZoom ? this.maxZoom : zoom;

            const [atOffsetX, atOffsetY] = TransformationMatrix.antitransformCoordinates(display.globalTransformation, mouseOffset);
            display.zoom = zoom;
            const [scaledOffsetX, scaledOffsetY] = TransformationMatrix.transformCoordinates(display.globalTransformation, [atOffsetX, atOffsetY]);
            const [zoomOffsetX, zoomOffsetY] = [mouseOffset[0] - scaledOffsetX, mouseOffset[1] - scaledOffsetY];
            display.pan = [display.pan[0] + zoomOffsetX, display.pan[1] + zoomOffsetY];

            this.render();
        });
    }.bind(this);

    startInteractive() {
        this.renderer.container.addEventListener("pointerdown", this._pointerDownHandler as EventListener);
        this.renderer.container.addEventListener("pointerup", this._pointerUpHandler as EventListener);
        this.renderer.container.addEventListener("pointerleave", this._pointerLeaveHandler as EventListener);
        this.renderer.container.addEventListener("pointermove", this._pointerMoveHandler as EventListener);
        this.renderer.container.addEventListener("wheel", this._wheelHandler as EventListener);
    }
    stopInteractive() {
        this.renderer.container.removeEventListener("pointerdown", this._pointerDownHandler as EventListener);
        this.renderer.container.removeEventListener("pointerup", this._pointerUpHandler as EventListener);
        this.renderer.container.addEventListener("pointerleave", this._pointerLeaveHandler as EventListener);
        this.renderer.container.removeEventListener("pointermove", this._pointerMoveHandler as EventListener);
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
                    this.render();
                } else {
                    window.clearTimeout(this._resizeTimer);
                    this._resizeTimer = window.setTimeout(() => {
                        this.renderer.display.width = w;
                        this.renderer.display.height = h;
                        callback(w, h);
                        this.render();
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
        this.render();
    }
    pan(panX: number, panY: number) {
        this.renderer.display.pan = [this.renderer.display.pan[0] + panX, this.renderer.display.pan[1] + panY];
        this.render();
    }

    add(element: ViewElement | ViewGroupElement, forward = false) {
        const index = this._elements.findIndex(el => el.uuid === element.uuid);
        if (index !== -1) return console.warn(`[G]The \`View\` already has a element with \`uuid\`: ${element.uuid}`), this;
        // set `parent` of element to `this`
        element.parent = this;
        if (forward) {
            this._elements.unshift(element);
        } else {
            this._elements.push(element);
        }
        this.refreshInteractables();
        this.render();
        return this;
    }
    addBatch(elements: (ViewElement | ViewGroupElement)[], forward = false) {
        elements.forEach(element => {
            const index = this._elements.findIndex(el => el.uuid === element.uuid);
            if (index !== -1) return console.warn(`[G]The \`View\` already has a element with \`uuid\`: ${element.uuid}`), this;
            // set `parent` of element to `this`
            element.parent = this;
            if (forward) {
                this._elements.unshift(element);
            } else {
                this._elements.push(element);
            }
        });
        this.refreshInteractables();
        this.render();
        return this;
    }

    remove(uuid: string): this;
    remove(element: ViewElement | ViewGroupElement): this;
    remove(arg: string | ViewElement | ViewGroupElement) {
        const uuid = arg instanceof ViewElement || arg instanceof ViewGroupElement ? arg.uuid : arg;
        const index = this._elements.findIndex(el => el.uuid === uuid);
        if (index === -1) return this;
        const element = this._elements.splice(index, 1)[0];
        // set `parent` of element to `undefined`
        element.parent = undefined;
        this.refreshInteractables();
        // clear state
        if (this._hoverElement === element) this._hoverElement = null;
        if (this._deactivatingElement === element) this._deactivatingElement = null;
        const index2 = this._activeElements.indexOf(element);
        if (index2 !== -1) this._activeElements.splice(1, 0);

        this.render();
        return this;
    }

    removeBatch(uuids: string[]): this;
    removeBatch(elements: (ViewElement | ViewGroupElement)[]): this;
    removeBatch(args: string[] | (ViewElement | ViewGroupElement)[]) {
        args.forEach(arg => {
            const uuid = arg instanceof ViewElement || arg instanceof ViewGroupElement ? arg.uuid : arg;
            const index = this._elements.findIndex(el => el.uuid === uuid);
            if (index === -1) return this;
            const element = this._elements.splice(index, 1)[0];
            // set `parent` of element to `undefined`
            element.parent = undefined;
            this.refreshInteractables();
            // clear state
            if (this._hoverElement === element) this._hoverElement = null;
            if (this._deactivatingElement === element) this._deactivatingElement = null;
            const index2 = this._activeElements.indexOf(element);
            if (index2 !== -1) this._activeElements.splice(1, 0);
        });
        this.render();
        return this;
    }

    activate(uuid: string): this;
    activate(element: ViewElement): this;
    activate(arg: string | ViewElement) {
        const uuid = arg instanceof ViewElement ? arg.uuid : arg;
        const index = this._interactables.findIndex(el => el.uuid === uuid);
        const index2 = this._activeElements.findIndex(el => el.uuid === uuid);
        if (index !== -1 && index2 === -1) {
            this._activeElements.push(this._interactables[index]);
            this.render();
        }
        return this;
    }
    deactivate(uuid: string): this;
    deactivate(element: ViewElement): this;
    deactivate(arg: string | ViewElement) {
        const uuid = arg instanceof ViewElement ? arg.uuid : arg;
        const index = this._interactables.findIndex(el => el.uuid === uuid);
        const index2 = this._activeElements.findIndex(el => el.uuid === uuid);
        if (index !== -1 && index2 !== -1) {
            this._activeElements.splice(index2, 1);
            this.render();
        }
        return this;
    }
    forward(uuid: string): this;
    forward(element: ViewElement): this;
    forward(arg: string | ViewElement) {
        const uuid = arg instanceof ViewElement ? arg.uuid : arg;
        const index = this._elements.findIndex(el => el.uuid === uuid);
        if (index !== -1 && index !== 0) {
            [this._elements[index], this._elements[index - 1]] = [this._elements[index - 1], this._elements[index]];
            this.render();
        }
        return this;
    }
    foremost(uuid: string): this;
    foremost(element: ViewElement): this;
    foremost(arg: string | ViewElement) {
        const uuid = arg instanceof ViewElement ? arg.uuid : arg;
        const index = this._elements.findIndex(el => el.uuid === uuid);
        if (index !== -1 && index !== 0) {
            this._elements.unshift(...this._elements.splice(index, 1));
            this.render();
        }
        return this;
    }
    backward(uuid: string): this;
    backward(element: ViewElement): this;
    backward(arg: string | ViewElement) {
        const uuid = arg instanceof ViewElement ? arg.uuid : arg;
        const index = this._elements.findIndex(el => el.uuid === uuid);
        if (index !== -1 && index !== this._elements.length - 1) {
            [this._elements[index], this._elements[index + 1]] = [this._elements[index + 1], this._elements[index]];
            this.render();
        }
        return this;
    }
    backmost(uuid: string): this;
    backmost(element: ViewElement): this;
    backmost(arg: string | ViewElement) {
        const uuid = arg instanceof ViewElement ? arg.uuid : arg;
        const index = this._elements.findIndex(el => el.uuid === uuid);
        if (index !== -1 && index !== this._elements.length - 1) {
            this._elements.push(...this._elements.splice(index, 1));
            this.render();
        }
        return this;
    }

    private _nextTick = Geomtoy.nextTick;

    render() {
        if (this._renderScheduled) return;
        this._renderScheduled = true;

        this._nextTick(() => {
            const renderer = this.renderer;
            this._elements.forEach(el => {
                const isGroup = el instanceof ViewGroupElement;

                if (!isGroup) {
                    if (el.shape instanceof Image) {
                        const imageSource = el.shape.imageSource;
                        renderer.imageSourceManager.notLoaded(imageSource) && renderer.imageSourceManager.load(imageSource).then(this.render.bind(this)).catch(console.error);
                    }
                } else {
                    (el.shapes.filter(shape => shape instanceof Image) as Image[]).forEach(image => {
                        const imageSource = image.imageSource;
                        renderer.imageSourceManager.notLoaded(imageSource) && renderer.imageSourceManager.load(imageSource).then(this.render.bind(this)).catch(console.error);
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
                if (isGroup) {
                    el.paths = renderer.drawBatch(el.shapes, onTop);
                } else {
                    el.path = renderer.draw(el.shape, onTop);
                }
            });
            this._renderScheduled = false;
        });
    }
}

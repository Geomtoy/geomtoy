import Shape from "../../geomtoy/base/Shape";
import Group from "../../geomtoy/group";
import Image from "../../geomtoy/shapes/basic/Image";

import Renderer from "../renderer/Renderer";
import PointChecker from "../helper/PointChecker";
import ViewElement from "./ViewElement";

import type { Style } from "../types";
import type Geomtoy from "../../geomtoy";


const defaultDefaultStyle: Style = {
    fill: "transparent",
    stroke: "transparent",
    strokeWidth: 1,
    strokeDash: [],
    strokeDashOffset: 0,
    lineJoin: "miter",
    lineCap: "butt",
    miterLimit: 10
};
const defaultMinZoom = 0.00000000001;
const defaultMaxZoom = 1000000000000;
const defaultWheelZoomDeltaRate = 1.1;
const maxTouchPointerCount = 2;
const extraStrokeWidthForTouch = 5;
const defaultDragThrottleDistance = 10;

class View {
    geomtoy: Geomtoy;
    minZoom: number;
    maxZoom: number;

    dragThrottleDistance: number;
    hoverForemost: boolean;
    activeForemost: boolean;

    private _wheelZoomDeltaRate: number = defaultWheelZoomDeltaRate;
    private _renderer: Renderer = null as unknown as Renderer;
    private _defaultStyle: Style = { ...defaultDefaultStyle, ...{ strokeDash: [...defaultDefaultStyle.strokeDash] } };
    private _pointChecker = new PointChecker();

    private _hasTouchDevice: boolean;
    private _touchPointers: { id: number; offset: [number, number] }[] = [];

    private _hoverElement: ViewElement | null = null;
    private _activeElements: ViewElement[] = [];
    private _deactivatingElement: ViewElement | null = null;
    private _isDragging: boolean = false;
    private _isPanning: boolean = false;
    private _isZooming: boolean = false;
    private _preparingDragging: boolean = false;
    private _preparingPanning: boolean = false;
    private _preparingZooming: boolean = false;
    private _draggingOffset: [number, number] = [0, 0];
    private _panningOffset: [number, number] = [0, 0];
    private _zoomingDistance: number = 0;

    private _resizeObserver?: ResizeObserver;
    private _resizeTimer: number = 0;

    private _elements: ViewElement[] = [];
    private _interactables: ViewElement[] = [];

    private _renderScheduled: boolean = false;
    private _rafTicking = false;

    constructor(
        geomtoy: Geomtoy,
        renderer: Renderer,
        hoverForemost = true,
        activeForemost = true,
        dragThrottleDistance = defaultDragThrottleDistance,
        minZoom = defaultMinZoom,
        maxZoom = defaultMaxZoom,
        wheelZoomDeltaRate = defaultWheelZoomDeltaRate,
        defaultStyle: Partial<Style> = {}
    ) {
        this.geomtoy = geomtoy;
        this.renderer = renderer;
        this.hoverForemost = hoverForemost;
        this.activeForemost = activeForemost;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.dragThrottleDistance = dragThrottleDistance;
        this.wheelZoomDeltaRate = wheelZoomDeltaRate;
        this.defaultStyle = defaultStyle;

        this._hasTouchDevice = window.matchMedia("(any-pointer: coarse)").matches || "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }

    get wheelZoomDeltaRate() {
        return this._wheelZoomDeltaRate;
    }
    set wheelZoomDeltaRate(value) {
        if (value === 1) {
            throw new Error("[G]The `wheelZoomDeltaRate` can not be 1.");
        }
        this._wheelZoomDeltaRate = value;
    }

    //todo !!!
    // use(renderer:Renderer){
    //     if(renderer.geomtoy !== this.geomtoy){
    //         throw new Error("[G]The `geomoty` of `renderer` should be the same as that of the `View`.")
    //     }
    //     this._renderer = renderer
    // }

    get renderer() {
        return this._renderer;
    }
    set renderer(value) {
        if (this.geomtoy !== value.geomtoy) {
            throw new Error("[G]A `View` can only be present by a `Renderer` with the same `geomtoy`.");
        }
        this._renderer = value;
    }
    get defaultStyle(): Style {
        return { ...this._defaultStyle, ...{ strokeDash: [...this._defaultStyle.strokeDash] } };
    }
    set defaultStyle(value: Partial<Style>) {
        this._defaultStyle = {
            ...this._defaultStyle,
            ...value,
            ...(value.strokeDash ? { strokeDash: [...value.strokeDash] } : {})
        };
    }

    public refreshInteractables() {
        this._interactables = this._elements.filter(el => el.interactable);
    }

    private _requestRAFTick(callback: (...args: any[]) => void) {
        if (!this._rafTicking) {
            this._rafTicking = true;
            requestAnimationFrame(callback);
        }
    }

    private _isPointInElement(element: ViewElement, x: number, y: number) {
        const path = element.path!;
        let strokeWidth = element.style().strokeWidth || this._defaultStyle.strokeWidth;
        strokeWidth = this._hasTouchDevice ? strokeWidth + extraStrokeWidthForTouch : strokeWidth;
        //prettier-ignore
        return Array.isArray(path) 
            ? path.some(p => this._pointChecker.isPointIn(x, y, p, strokeWidth, true)) 
            : this._pointChecker.isPointIn(x, y, path, strokeWidth, true);
    }

    private _addTouch(id: number, offset: [offsetX: number, offsetY: number]) {
        if (this._touchPointers.length === maxTouchPointerCount) return;
        this._touchPointers.push({ id, offset });
    }
    private _updateTouch(id: number, offset: [offsetX: number, offsetY: number]) {
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

    private readonly _pointerDownHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
        isTouch && this._addTouch(e.pointerId, pointerOffset);
        // only allow the primary button of mouse
        if (isMouse && e.buttons !== 1) return;

        if (isMouse) {
            const atOffset = this.renderer.display.globalTransformation.antitransformCoordinates(pointerOffset);
            const foundIndex = this._interactables.findIndex(element => this._isPointInElement(element, ...atOffset));
            if (foundIndex !== -1) {
                if (!this._activeElements.includes(this._interactables[foundIndex])) {
                    this._activeElements.push(this._interactables[foundIndex]);
                    this.render();
                } else {
                    this._deactivatingElement = this._interactables[foundIndex];
                }
                this._draggingOffset = atOffset;
                this._preparingDragging = true;
                this.renderer.container.style.cursor = "pointer";
            } else {
                this._preparingPanning = true;
                this._panningOffset = pointerOffset;
                this._activeElements.length > 0 && this.render();
                this._activeElements = [];
                this.renderer.container.style.cursor = "grab";
            }
        }
        if (isTouch) {
            if (this._touchPointers.length === 1) {
                const atOffset = this.renderer.display.globalTransformation.antitransformCoordinates(pointerOffset);
                const foundIndex = this._interactables.findIndex(element => this._isPointInElement(element, ...atOffset));
                if (foundIndex !== -1) {
                    if (!this._activeElements.includes(this._interactables[foundIndex])) {
                        this._activeElements.push(this._interactables[foundIndex]);
                        this.render();
                    } else {
                        this._deactivatingElement = this._interactables[foundIndex];
                    }
                    this._draggingOffset = atOffset;
                    this._preparingDragging = true;
                    this.renderer.container.style.cursor = "pointer";
                } else {
                    this._activeElements.length > 0 && this.render();
                    this._activeElements = [];
                    this.renderer.container.style.cursor = "grab";
                }
            } else if (this._touchPointers.length === 2) {
                const [offset1, offset2] = [this._touchPointers[0].offset, this._touchPointers[1].offset];
                const distance = Math.hypot(offset2[0] - offset1[0], offset2[1] - offset1[1]);
                const centerOffset = [(offset2[0] + offset1[0]) / 2, (offset2[1] + offset1[1]) / 2] as [number, number];

                this._zoomingDistance = distance;
                this._panningOffset = centerOffset;

                this._preparingDragging = false;
                this._isDragging = false;
                this._activeElements.length > 0 && this.render();
                this._activeElements = [];

                this._preparingPanning = true;
                this._preparingZooming = true;
                this.renderer.container.style.cursor = "default";
            }
        }
    }.bind(this);

    private readonly _pointerUpHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        if (isTouch && !this._hasTouch(e.pointerId)) return;
        isTouch && this._removeTouch(e.pointerId);

        if (isMouse) {
            if (this._isDragging) {
                this._isDragging = false;
                this.renderer.container.style.cursor = "default";
            } else if (this._preparingDragging) {
                this._preparingDragging = false;
                if (this._deactivatingElement !== null) {
                    const index = this._activeElements.indexOf(this._deactivatingElement);
                    index !== -1 && this._activeElements.splice(index, 1);
                    this.render();
                    this._deactivatingElement = null;
                }
            } else if (this._isPanning) {
                this._isPanning = false;
                this.renderer.container.style.cursor = "default";
            } else if (this._preparingPanning) {
                this._preparingPanning = false;
                this.renderer.container.style.cursor = "default";
            }
        }
        if (isTouch) {
            if (this._isDragging) {
                this._isDragging = false;
                this.renderer.container.style.cursor = "default";
            } else if (this._preparingDragging) {
                this._preparingDragging = false;
                if (this._deactivatingElement !== null) {
                    const index = this._activeElements.indexOf(this._deactivatingElement);
                    index !== -1 && this._activeElements.splice(index, 1);
                    this.render();
                    this._deactivatingElement = null;
                }
            } else if (this._isPanning || this._preparingPanning || this._isZooming || this._preparingZooming) {
                this._isPanning = false;
                this._preparingPanning = false;
                this._isZooming = false;
                this._preparingZooming = false;
                this._clearTouch();
                this.renderer.container.style.cursor = "default";
            }
        }
    }.bind(this);

    private readonly _pointerLeaveHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        if (isTouch && !this._hasTouch(e.pointerId)) return;

        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
        isTouch && this._removeTouch(e.pointerId);

        if (isMouse) {
            const coord = this.renderer.display.globalTransformation.antitransformCoordinates(pointerOffset);
            if (this._isDragging) {
                this._isDragging = false;
                this.renderer.container.style.cursor = "default";
            } else if (this._preparingDragging) {
                this._preparingDragging = false;
                this.renderer.container.style.cursor = "default";
            } else if (this._isPanning) {
                this._isPanning = false;
                this.renderer.container.style.cursor = "default";
            } else if (this._preparingPanning) {
                this._preparingPanning = false;
                this.renderer.container.style.cursor = "default";
            }
        }
        if (isTouch) {
            const coord = this.renderer.display.globalTransformation.antitransformCoordinates(pointerOffset);
            if (this._isDragging) {
                this._isDragging = false;
                this.renderer.container.style.cursor = "default";
            } else if (this._preparingDragging) {
                this._preparingDragging = false;
                this.renderer.container.style.cursor = "default";
            } else if (this._isPanning) {
                this._isPanning = false;
                this.renderer.container.style.cursor = "default";
            } else if (this._preparingPanning) {
                this._preparingPanning = false;
                this.renderer.container.style.cursor = "default";
            } else if (this._isZooming) {
                this._isZooming = false;
                if (this._touchPointers.length < 2) {
                    this._touchPointers.forEach(p => {
                        this.renderer.container.releasePointerCapture(p.id);
                        this._removeTouch(p.id);
                    });
                }
            } else if (this._preparingZooming) {
                this._preparingZooming = false;
                if (this._touchPointers.length < 2) {
                    this._touchPointers.forEach(p => {
                        this.renderer.container.releasePointerCapture(p.id);
                        this._removeTouch(p.id);
                    });
                }
            }
        }
    }.bind(this);
    private readonly _pointerCancelHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        if (isTouch && !this._hasTouch(e.pointerId)) return;
    }.bind(this);

    private readonly _pointerMoveHandler = function (this: View, e: PointerEvent) {
        const isMouse = e.pointerType === "mouse";
        const isTouch = e.pointerType === "touch";

        if (isTouch && !this._hasTouch(e.pointerId)) return;
        const pointerOffset = [e.offsetX, e.offsetY] as [number, number];
        isTouch && this._updateTouch(e.pointerId, pointerOffset);

        if (isMouse) {
            this._requestRAFTick(() => {
                const atOffset = this.renderer.display.globalTransformation.antitransformCoordinates(pointerOffset);
                if (this._preparingDragging) {
                    const scale = this.renderer.display.density * this.renderer.display.zoom;
                    const dragDistance = Math.hypot(atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]) * scale;
                    if (dragDistance < this.dragThrottleDistance) return (this._rafTicking = false);
                }

                if (this._preparingDragging || this._isDragging) {
                    this._preparingDragging = false;
                    this._isDragging = true;

                    const [deltaX, deltaY] = [atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]];
                    this._draggingOffset = atOffset;
                    this._activeElements.forEach(element => element.move(deltaX, deltaY));
                    this.render();
                } else if (this._preparingPanning || this._isPanning) {
                    this._preparingPanning = false;
                    this._isPanning = true;
                    this.renderer.container.style.cursor = "grabbing";

                    const [deltaX, deltaY] = [pointerOffset[0] - this._panningOffset[0], pointerOffset[1] - this._panningOffset[1]];
                    this._panningOffset = pointerOffset;
                    this.renderer.display.pan = [this.renderer.display.pan[0] + deltaX, this.renderer.display.pan[1] + deltaY];
                    this.render();
                } else {
                    const foundIndex = this._interactables.findIndex(element => this._isPointInElement(element, ...atOffset));
                    if (foundIndex !== -1) {
                        if (this._hoverElement === null) {
                            this._hoverElement = this._interactables[foundIndex];
                            this.render();
                            this.renderer.container.style.cursor = "pointer";
                        }
                    } else {
                        if (this._hoverElement !== null) {
                            this._hoverElement = null;
                            this.render();
                            this.renderer.container.style.cursor = "default";
                        }
                    }
                }
                this._rafTicking = false;
            });
        }

        if (isTouch) {
            this._requestRAFTick(() => {
                const atOffset = this.renderer.display.globalTransformation.antitransformCoordinates(pointerOffset);
                if (this._preparingDragging) {
                    const scale = this.renderer.display.density * this.renderer.display.zoom;
                    const dragDistance = Math.hypot(atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]) * scale;
                    if (dragDistance < this.dragThrottleDistance) return (this._rafTicking = false);
                }

                if (this._preparingDragging || this._isDragging) {
                    this._preparingDragging = false;
                    this._isDragging = true;

                    const [deltaX, deltaY] = [atOffset[0] - this._draggingOffset[0], atOffset[1] - this._draggingOffset[1]];
                    this._draggingOffset = atOffset;
                    this._activeElements.forEach(element => element.move(deltaX, deltaY));
                    this.render();
                } else if (this._preparingZooming || this._isZooming || this._preparingPanning || this._isPanning) {
                    this._preparingZooming = false;
                    this._preparingPanning = false;
                    this._isZooming = true;
                    this._isPanning = true;

                    const [offset1, offset2] = [this._touchPointers[0].offset, this._touchPointers[1].offset];
                    const distance = Math.hypot(offset2[0] - offset1[0], offset2[1] - offset1[1]);
                    const centerOffset = [(offset2[0] + offset1[0]) / 2, (offset2[1] + offset1[1]) / 2] as [number, number];

                    const deltaZoom = distance / this._zoomingDistance;
                    const [deltaX, deltaY] = [centerOffset[0] - this._panningOffset[0], centerOffset[1] - this._panningOffset[1]];

                    this._panningOffset = centerOffset;
                    this._zoomingDistance = distance;

                    const display = this.renderer.display;
                    let zoom = display.zoom * deltaZoom;
                    zoom = zoom < this.minZoom ? this.minZoom : zoom > this.maxZoom ? this.maxZoom : zoom;

                    const [atOffsetX, atOffsetY] = display.globalTransformation.antitransformCoordinates(centerOffset);
                    display.zoom = zoom;
                    const [scaledOffsetX, scaledOffsetY] = display.globalTransformation.transformCoordinates([atOffsetX, atOffsetY]);
                    const [zoomOffsetX, zoomOffsetY] = [centerOffset[0] - scaledOffsetX, centerOffset[1] - scaledOffsetY];
                    display.pan = [display.pan[0] + deltaX + zoomOffsetX, display.pan[1] + deltaY + zoomOffsetY];
                    this.render();
                }

                this._rafTicking = false;
            });
        }
    }.bind(this);

    private readonly _wheelHandler = function (this: View, e: WheelEvent) {
        const mouseOffset = [e.offsetX, e.offsetY] as [number, number];
        const deltaY = e.deltaY;
        this._requestRAFTick(() => {
            const display = this.renderer.display;
            let zoom = deltaY < 0 ? display.zoom / this.wheelZoomDeltaRate : deltaY > 0 ? display.zoom * this.wheelZoomDeltaRate : display.zoom;

            zoom = zoom < this.minZoom ? this.minZoom : zoom > this.maxZoom ? this.maxZoom : zoom;

            const [atOffsetX, atOffsetY] = display.globalTransformation.antitransformCoordinates(mouseOffset);
            display.zoom = zoom;
            const [scaledOffsetX, scaledOffsetY] = display.globalTransformation.transformCoordinates([atOffsetX, atOffsetY]);
            const [zoomOffsetX, zoomOffsetY] = [mouseOffset[0] - scaledOffsetX, mouseOffset[1] - scaledOffsetY];
            display.pan = [display.pan[0] + zoomOffsetX, display.pan[1] + zoomOffsetY];

            this.render();

            this._rafTicking = false;
        });
    }.bind(this);

    startInteractive() {
        this.renderer.container.addEventListener("pointerdown", this._pointerDownHandler);
        this.renderer.container.addEventListener("pointerup", this._pointerUpHandler);
        this.renderer.container.addEventListener("pointercancel", this._pointerUpHandler);
        this.renderer.container.addEventListener("pointermove", this._pointerMoveHandler);
        this.renderer.container.addEventListener("wheel", this._wheelHandler);
    }
    stopInteractive() {
        this.renderer.container.removeEventListener("pointerdown", this._pointerDownHandler);
        this.renderer.container.removeEventListener("pointerup", this._pointerUpHandler);
        this.renderer.container.addEventListener("pointercancel", this._pointerUpHandler);
        this.renderer.container.removeEventListener("pointermove", this._pointerMoveHandler);
        this.renderer.container.removeEventListener("wheel", this._wheelHandler);
    }
    startResponsive(callback: (...args: any[]) => void) {
        // immediately call by `ResizeObserver` initialization in microtask queue
        let immediatelyFirstCalled = false;
        if (this._resizeObserver !== undefined) return;
        const ob = new ResizeObserver(entries => {
            for (let entry of entries) {
                this.renderer.display.width = entry.contentRect.width;
                this.renderer.display.height = entry.contentRect.height;
                if (!immediatelyFirstCalled) {
                    immediatelyFirstCalled = true;
                    callback(entry.contentRect.width, entry.contentRect.height);
                    this.render();
                } else {
                    window.clearTimeout(this._resizeTimer);
                    this._resizeTimer = window.setTimeout(
                        function (this: View) {
                            callback(entry.contentRect.width, entry.contentRect.height);
                            this.render();
                        }.bind(this),
                        100
                    );
                }
            }
        });
        ob.observe(this.renderer.container.parentElement!);
        this._resizeObserver = ob;
    }
    stopResponsive() {
        if (this._resizeObserver !== undefined) {
            this._resizeObserver.disconnect();
            this._resizeObserver = undefined;
        }
    }

    zoom(zoom: number, keepViewCenter: boolean) {
        if (keepViewCenter) {
            const display = this.renderer.display;
            const box = display.globalViewBox;
            const [atCx, atCy] = [box[0] + box[2] / 2, box[1] + box[3] / 2];
            const [cx, cy] = [display.width / 2, display.height / 2];

            display.zoom = zoom;
            const [scaledOffsetX, scaledOffsetY] = display.globalTransformation.transformCoordinates([atCx, atCy]);
            const [zoomOffsetX, zoomOffsetY] = [cx - scaledOffsetX, cy - scaledOffsetY];
            display.pan = [display.pan[0] + zoomOffsetX, display.pan[1] + zoomOffsetY];
        } else {
            this.renderer.display.zoom = zoom;
        }
        this.render();
    }
    pan(pan: [deltaX: number, deltaY: number]) {
        this.renderer.display.pan = [this.renderer.display.pan[0] + pan[0], this.renderer.display.pan[1] + pan[1]];
        this.render();
    }

    add(element: ViewElement) {
        const index = this._elements.findIndex(el => el.uuid === element.uuid);
        if (index !== -1) return console.warn(`[G]The \`View\` already has a \`ViewElement\` with \`uuid\`: ${element.uuid}`), this;
        this._elements.push(element);
        this.refreshInteractables();
        this.render();
        return this;
    }

    remove(uuid: string): this;
    remove(element: ViewElement): this;
    remove(arg: string | ViewElement) {
        const uuid = arg instanceof ViewElement ? arg.uuid : arg;
        const index = this._elements.findIndex(el => el.uuid === uuid);
        if (index === -1) return this;
        const element = this._elements.splice(index, 1)[0];
        this.refreshInteractables();
        // clear state collection reference
        if (this._hoverElement === element) this._hoverElement = null;
        if (this._deactivatingElement === element) this._deactivatingElement = null;
        const index2 = this._activeElements.indexOf(element);
        if (index2 !== -1) this._activeElements.splice(1, 0);

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
        if (index !== -1 && index !== this._elements.length - 1) {
            [this._elements[index], this._elements[index + 1]] = [this._elements[index + 1], this._elements[index]];
            this.render();
        }
        return this;
    }

    foremost(uuid: string): this;
    foremost(element: ViewElement): this;
    foremost(arg: string | ViewElement) {
        const uuid = arg instanceof ViewElement ? arg.uuid : arg;
        const index = this._elements.findIndex(el => el.uuid === uuid);
        if (index !== -1 && index !== this._elements.length - 1) {
            this._elements.push(...this._elements.splice(index, 1));
            this.render();
        }
        return this;
    }

    backward(uuid: string): this;
    backward(element: ViewElement): this;
    backward(arg: string | ViewElement) {
        const uuid = arg instanceof ViewElement ? arg.uuid : arg;
        const index = this._elements.findIndex(el => el.uuid === uuid);
        if (index !== -1 && index !== 0) {
            [this._elements[index], this._elements[index - 1]] = [this._elements[index - 1], this._elements[index]];
            this.render();
        }
        return this;
    }

    backmost(uuid: string): this;
    backmost(element: ViewElement): this;
    backmost(arg: string | ViewElement) {
        const uuid = arg instanceof ViewElement ? arg.uuid : arg;
        const index = this._elements.findIndex(el => el.uuid === uuid);
        if (index !== -1 && index !== 0) {
            this._elements.unshift(...this._elements.splice(index, 1));
            this.render();
        }
        return this;
    }

    render() {
        if (this._renderScheduled) return;
        this._renderScheduled = true;
        const renderer = this.renderer;
        this.geomtoy.nextTick(() => {
            this._elements.forEach(el => {
                if (el.object instanceof Image && renderer.imageSourceManager.notLoaded(el.object.imageSource)) {
                    const imageSource = el.object.imageSource;
                    renderer.imageSourceManager
                        .load(imageSource)
                        .then(() => {
                            this.render();
                        })
                        .catch(() => {
                            console.warn(`[G]Failed to get image: ${imageSource}`);
                        });
                }

                const s = el.style();
                renderer.fill(s.fill || this._defaultStyle.fill);
                renderer.stroke(s.stroke || this._defaultStyle.stroke);
                renderer.strokeWidth(s.strokeWidth || this._defaultStyle.strokeWidth);

                const hover = this._hoverElement === el;
                const active = this._activeElements.includes(el);

                if (hover) {
                    const s = el.hoverStyle();
                    s.fill && renderer.fill(s.fill || this._defaultStyle.fill);
                    s.stroke && renderer.stroke(s.stroke || this._defaultStyle.stroke);
                    s.strokeWidth && renderer.strokeWidth(s.strokeWidth || this._defaultStyle.strokeWidth);
                }
                // `active` has a higher priority than `hover`
                if (active) {
                    const s = el.activeStyle();
                    s.fill && renderer.fill(s.fill || this._defaultStyle.fill);
                    s.stroke && renderer.stroke(s.stroke || this._defaultStyle.stroke);
                    s.strokeWidth && renderer.strokeWidth(s.strokeWidth || this._defaultStyle.strokeWidth);
                }

                renderer.strokeDash(s.strokeDash || this._defaultStyle.strokeDash);
                renderer.strokeDashOffset(s.strokeDashOffset || this._defaultStyle.strokeDashOffset);
                renderer.lineJoin(s.lineJoin || this._defaultStyle.lineJoin);
                renderer.lineCap(s.lineCap || this._defaultStyle.lineCap);
                renderer.miterLimit(s.miterLimit || this._defaultStyle.miterLimit);

                let path;
                if (el.object instanceof Shape) {
                    path = renderer.draw(el.object, (hover && this.hoverForemost) || (active && this.activeForemost) ? false : true);
                }
                if (el.object instanceof Group) {
                    path = renderer.drawBatch(el.object.items, (hover && this.hoverForemost) || (active && this.activeForemost) ? false : true);
                }
                el.path = path;
            });
            this._renderScheduled = false;
        });
    }
}

export default View;

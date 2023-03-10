import type View from "./View";
import type ViewElement from "./ViewElement";
import { VE_SUB_VIEW_SYMBOL, VE_VIEW_SYMBOL } from "./ViewElement";

const SV_VIEW_SYMBOL = Symbol("SubView.view");
export { SV_VIEW_SYMBOL };

export default class SubView {
    private _elements: ViewElement[] = [];

    // @internal
    [SV_VIEW_SYMBOL]: View | null = null;

    get view() {
        return this[SV_VIEW_SYMBOL];
    }
    get elements() {
        return [...this._elements];
    }
    set elements(value: ViewElement[]) {
        this.empty();
        this.add(...value);
    }

    add(...elements: ViewElement[]) {
        for (const el of elements) {
            if (el[VE_VIEW_SYMBOL] !== null) {
                if (el[VE_VIEW_SYMBOL]! === this[SV_VIEW_SYMBOL]) {
                    el[VE_VIEW_SYMBOL]!.suspendRefreshRenderables = true;
                    el[VE_VIEW_SYMBOL]!.remove(el);
                    el[VE_VIEW_SYMBOL]!.suspendRefreshRenderables = false;
                } else {
                    el[VE_VIEW_SYMBOL]!.remove(el);
                }
                this._elements.push(el);
                el[VE_SUB_VIEW_SYMBOL] = this;
                continue;
            }
            if (el[VE_SUB_VIEW_SYMBOL] === this) continue;
            if (el[VE_SUB_VIEW_SYMBOL] !== null) {
                if (el[VE_SUB_VIEW_SYMBOL]![SV_VIEW_SYMBOL] !== null && el[VE_SUB_VIEW_SYMBOL]![SV_VIEW_SYMBOL]! === this[SV_VIEW_SYMBOL]) {
                    el[VE_SUB_VIEW_SYMBOL]![SV_VIEW_SYMBOL]!.suspendRefreshRenderables = true;
                    el[VE_SUB_VIEW_SYMBOL]!.remove(el);
                    el[VE_SUB_VIEW_SYMBOL]![SV_VIEW_SYMBOL]!.suspendRefreshRenderables = false;
                } else {
                    el[VE_SUB_VIEW_SYMBOL]!.remove(el);
                }
            }
            this._elements.push(el);
            el[VE_SUB_VIEW_SYMBOL] = this;
        }
        this[SV_VIEW_SYMBOL]?.refreshRenderables();
        this[SV_VIEW_SYMBOL]?.requestRender();
        return this;
    }
    remove(...elements: ViewElement[]) {
        for (const el of elements) {
            // We do not directly remove the `ViewElement` in the `View`
            if (el[VE_VIEW_SYMBOL] !== null) continue;
            if (el[VE_SUB_VIEW_SYMBOL] !== this) continue;
            const index = this._elements.indexOf(el);
            if (index === -1) throw new Error("[G]Should not happen.");
            this._elements.splice(index, 1);
            el[VE_SUB_VIEW_SYMBOL] = null;
        }
        this[SV_VIEW_SYMBOL]?.refreshRenderables();
        this[SV_VIEW_SYMBOL]?.requestRender();
        return this;
    }
    empty() {
        for (const el of this._elements) {
            el[VE_SUB_VIEW_SYMBOL] = null;
        }
        this._elements = [];
        this[SV_VIEW_SYMBOL]?.refreshRenderables();
        this[SV_VIEW_SYMBOL]?.requestRender();
        return this;
    }
    has(element: ViewElement) {
        return this._elements.includes(element);
    }
}

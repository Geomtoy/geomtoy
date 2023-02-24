import type View from "./View";
import type ViewElement from "./ViewElement";

export default class SubView {
    private _elements: ViewElement[] = [];
    private _view: View;

    constructor(view: View) {
        this._view = view;
    }

    get view() {
        return this._view;
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
            if (el.subView !== this) {
                el.subView?.remove(el);
            }
            if (el.view !== this.view) {
                el.view?.remove(el);
            }
            this._elements.push(el);
            el.subView = this;
        }
        this.view.add(...elements);
        return this;
    }

    remove(...elements: ViewElement[]) {
        for (const el of elements) {
            if (el.subView !== this) continue;
            const index = this._elements.indexOf(el);
            if (index === -1) {
                throw new Error("[G]Should not happened.");
            }
            this._elements.splice(index, 1);
            el.subView = null;
        }
        this.view.remove(...elements);
        return this;
    }

    empty() {
        for (const el of this._elements) {
            el.subView = null;
        }
        this.view.remove(...this._elements);
        this._elements = [];
    }
}

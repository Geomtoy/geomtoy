// Min Priority Queue
export default class PriorityQueue<T extends any> {
    private _data: T[] = [];
    private _compareFn: (a: T, b: T) => number;

    constructor(compareFn: (a: T, b: T) => number) {
        this._compareFn = compareFn;
    }

    get size() {
        return this._data.length;
    }

    static fromArray<ST extends any>(arr: ST[], compareFn: (a: ST, b: ST) => number) {
        const ret = new PriorityQueue(compareFn);
        ret._data = [...arr];
        if (ret._data.length > 0) {
            for (let i = ret._data.length >> 1; i >= 0; i--) ret._siftDown(i);
        }
        return ret;
    }
    toArray() {
        const copy = new PriorityQueue(this._compareFn);
        copy._data = [...this._data];
        const ret: T[] = [];
        while (copy._data.length > 0) {
            ret.push(copy.dequeue()!);
        }
        return ret;
    }

    peek() {
        return this._data[0];
    }

    dequeue() {
        if (this._data.length === 0) return undefined;
        const ret = this._data[0];
        const bItem = this._data.pop()!;
        if (this._data.length > 0) {
            this._data[0] = bItem;
            this._siftDown(0);
        }
        return ret;
    }
    enqueue(item: T) {
        this._data.push(item);
        this._siftUp(this._data.length - 1);
    }

    update(item: T) {
        let pos = this._data.indexOf(item);
        if (pos === -1) return false;

        const p = (pos - 1) >> 1; // parent
        if (p < 0) {
            this._siftDown(pos);
            return true;
        }
        if (this._compareFn(item, this._data[p]) < 0) {
            this._siftUp(pos);
        } else {
            this._siftDown(pos);
        }
        return true;
    }
    remove(item: T) {
        let pos = this._data.indexOf(item);
        if (pos === -1) return false;
        // force up the item to top
        this._siftUp(pos, true);
        this.dequeue();
        return true;
    }

    clear() {
        this._data = [];
    }

    private _siftUp(pos: number, force = false) {
        const item = this._data[pos];

        while (pos > 0) {
            const p = (pos - 1) >> 1; // parent
            if (!force && this._compareFn(item, this._data[p]) >= 0) break;
            this._data[pos] = this._data[p];
            pos = p;
        }
        this._data[pos] = item;
    }
    private _siftDown(pos: number) {
        const item = this._data[pos];
        const h = this._data.length >> 1;

        while (pos < h) {
            const l = (pos << 1) + 1; // left child
            const r = (pos + 1) << 1; // right child
            let m = l; // min of left and right child, initially left child
            if (r < this._data.length && this._compareFn(this._data[r], this._data[l]) < 0) {
                m = r;
            }
            if (this._compareFn(this._data[m], item) >= 0) break;
            this._data[pos] = this._data[m];
            pos = m;
        }
        this._data[pos] = item;
    }
}

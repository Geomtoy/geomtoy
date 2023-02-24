export default class PriorityQueue<T extends object> {
    length;

    constructor(public data: T[] = [], public compareFn: (a: T, b: T) => -1 | 0 | 1) {
        this.length = this.data.length;

        if (this.length > 0) {
            for (let i = (this.length >> 1) - 1; i >= 0; i--) this._down(i);
        }
    }
    peek() {
        return this.data[0];
    }
    dequeue() {
        if (this.length === 0) return undefined;

        const top = this.data[0];
        const bottom = this.data.pop()!;

        if (--this.length > 0) {
            this.data[0] = bottom;
            this._down(0);
        }
        return top;
    }
    enqueue(item: T) {
        this.data.push(item);
        this._up(this.length++);
    }
    update(item: T) {
        const { data, compareFn } = this;
        const pos = data.findIndex(i => item === i);
        if (pos === -1) return false;
        const current = data[pos];
        if (pos > 0) {
            const parent = data[(pos - 1) >> 1];
            if (compareFn(current, parent) < 0) {
                this._up(pos);
            } else {
                this._down(pos);
            }
        } else {
            this._down(pos);
        }
        return true;
    }
    remove(item: T) {
        const { data } = this;
        let pos = data.findIndex(i => item === i);
        if (pos === -1) return false;
        // force up the item to top
        while (pos > 0) {
            const parent = (pos - 1) >> 1;
            const current = data[parent];
            data[pos] = current;
            pos = parent;
        }
        data[pos] = item;
        this.dequeue();
        return true;
    }

    clear() {
        this.data = [];
    }
    _up(pos: number) {
        const { data, compareFn } = this;
        const item = data[pos];

        while (pos > 0) {
            const parent = (pos - 1) >> 1;
            const current = data[parent];
            if (compareFn(item, current) >= 0) break;
            data[pos] = current;
            pos = parent;
        }
        data[pos] = item;
    }
    _down(pos: number) {
        const { data, compareFn } = this;
        const halfLength = this.length >> 1;
        const item = data[pos];

        while (pos < halfLength) {
            let bestChild = (pos << 1) + 1; // initially it is the left child
            const right = bestChild + 1;

            if (right < this.length && compareFn(data[right], data[bestChild]) < 0) {
                bestChild = right;
            }
            if (compareFn(data[bestChild], item) >= 0) break;

            data[pos] = data[bestChild];
            pos = bestChild;
        }

        data[pos] = item;
    }
}

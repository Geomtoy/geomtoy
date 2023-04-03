import { Assert } from "@geomtoy/util";

export type LinkedListNode<T extends object> = {
    prev: LinkedListNode<T> | null;
    next: LinkedListNode<T> | null;
    data: T;
    list: LinkedList<T>;
};

// Doubly Linked List
export class LinkedList<T extends object> {
    head: LinkedListNode<T> | null = null;
    tail: LinkedListNode<T> | null = null;

    static fromArray<ST extends object>(arr: ST[]) {
        const ret = new LinkedList<ST>();
        arr.forEach(elem => ret.push(ret.createNode(elem)));
        return ret;
    }

    toArray() {
        const ret: T[] = [];
        for (const node of this) {
            ret.push(node.data);
        }
        return ret;
    }

    private _size = 0;
    get size() {
        return this._size;
    }

    [Symbol.iterator]() {
        const head = this.head;
        const tail = this.tail;
        let node = head;
        return {
            next(): { value: LinkedListNode<T>; done: false } | { value: null; done: true } {
                if (node === null) return { value: null, done: true };
                const ret = {
                    value: node,
                    done: false
                };
                node = node !== tail ? node.next : null;
                return ret as ReturnType<typeof this.next>;
            }
        };
    }
    /**
     * Find the first node satisfies the provided predicate function.
     * @param predicate
     */
    find(predicate: (node: LinkedListNode<T>) => boolean) {
        let curr: LinkedListNode<T> | null = this.head;
        while (curr !== null) {
            if (predicate(curr)) {
                break;
            }
            curr = curr.next;
        }
        return curr;
    }

    filter(predicate: (node: LinkedListNode<T>) => boolean) {
        const ret = new LinkedList<T>();
        for (const node of this) {
            if (predicate(node)) {
                ret.push({ ...node });
            }
        }
        return ret;
    }

    reverse() {
        const head = this.head;
        const tail = this.tail;
        let node = tail;
        while (node !== null) {
            const prev = node.prev;
            [node.next, node.prev] = [node.prev, node.next];
            node = node !== head ? prev : null;
        }
        [this.head, this.tail] = [this.tail, this.head];
        return this;
    }

    private _assertIsProperNode(value: LinkedListNode<T>, p: string) {
        Assert.condition(value.list === this, `[G]The \`${p}\` should be a \`LinkedListNode\` properly affiliated with the list.`);
    }

    push(node: LinkedListNode<T>): LinkedListNode<T> {
        this._assertIsProperNode(node, "node");

        if (this.head === null || this.tail === null) {
            node.prev = null;
            node.next = null;
            this.head = node;
            this.tail = node;
        } else {
            node.prev = this.tail;
            node.next = null;
            this.tail.next = node;
            this.tail = node;
        }
        this._size++;
        return node;
    }
    pop() {
        if (this.head === null || this.tail === null) return undefined;
        this._size--;
        return this.remove(this.tail);
    }
    unshift(node: LinkedListNode<T>): LinkedListNode<T> {
        this._assertIsProperNode(node, "node");
        if (this.head === null || this.tail === null) {
            node.prev = null;
            node.next = null;
            this.head = node;
            this.tail = node;
        } else {
            node.prev = null;
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
        }
        this._size++;
        return node;
    }
    shift() {
        if (this.head === null || this.tail === null) return undefined;
        this._size--;
        return this.remove(this.head);
    }

    clear() {
        if (this.head === null && this.tail === null) return;

        let next;
        let curr = this.head;

        while (curr !== null) {
            next = curr.next;
            curr.prev = null;
            curr.next = null;
            curr = next;
        }
        this.head = null;
        this.tail = null;
        this._size = 0;
    }

    createNode(data: T) {
        return {
            data,
            prev: null,
            next: null,
            list: this
        } as LinkedListNode<T>;
    }

    insertBefore(node: LinkedListNode<T>, insertion: LinkedListNode<T>) {
        this._assertIsProperNode(node, "node");
        this._assertIsProperNode(insertion, "insertion");

        insertion.prev = node.prev;
        insertion.next = node;

        node.prev !== null && (node.prev.next = insertion);
        node.prev = insertion;

        if (node === this.head) this.head = insertion;

        this._size++;
        return insertion;
    }
    insertAfter(node: LinkedListNode<T>, insertion: LinkedListNode<T>) {
        this._assertIsProperNode(node, "node");
        this._assertIsProperNode(insertion, "insertion");

        insertion.next = node.next;
        insertion.prev = node;

        node.next !== null && (node.next.prev = insertion);
        node.next = insertion;

        if (node === this.tail) this.tail = insertion;

        this._size++;
        return insertion;
    }
    remove(node: LinkedListNode<T>) {
        this._assertIsProperNode(node, "node");
        node.prev !== null && (node.prev.next = node.next);
        node.next !== null && (node.next.prev = node.prev);

        if (this.size === 1) {
            this.head = null;
            this.tail = null;
        } else {
            if (node === this.head) {
                this.head = node.next;
            }
            if (node === this.tail) {
                this.tail = node.prev;
            }
        }
        this._size--;
        node.prev = null;
        node.next = null;
        return node;
    }
}

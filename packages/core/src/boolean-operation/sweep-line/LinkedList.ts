export class LinkedList<E extends object> {
    head: LinkedListNode<E> | null = null;
    tail: LinkedListNode<E> | null = null;
    size = 0;

    static fromArray<SE extends object>(arr: SE[]) {
        const list = new LinkedList<SE>();
        arr.forEach(elem => list.push(new LinkedListNode(elem, list)));
        return list;
    }

    toArray() {
        const head = this.head;
        const tail = this.tail;

        let node = head;
        const ret = [];
        while (node !== null) {
            ret.push(node.data);
            node = node !== tail ? node.next : null;
        }
        return ret;
    }

    [Symbol.iterator]() {
        const head = this.head;
        const tail = this.tail;
        let node = head;
        return {
            next(): { value: LinkedListNode<E>; done: false } | { value: null; done: true } {
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

    forEach(fn: (value: LinkedListNode<E>, index: number, list: LinkedList<E>) => void, thisArg?: any) {
        let i = 0;
        for (const node of this) {
            fn.call(thisArg, node, i, this);
            i++;
        }
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

    isEmpty() {
        return this.head === null || this.tail === null; // or this.size === 0
    }

    push(node: LinkedListNode<E>): LinkedListNode<E> {
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
        this.size++;
        return node;
    }
    pop() {
        if (this.head === null || this.tail === null) return undefined;
        return this.tail.detach();
    }
    unshift(node: LinkedListNode<E>): LinkedListNode<E> {
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
        this.size++;
        return node;
    }
    shift() {
        if (this.head === null || this.tail === null) return undefined;
        return this.head.detach();
    }
    /**
     * Find the first node matches `locateFn`(`locateFn` returns true)
     * @param locateFn
     */
    locate(locateFn: (node: LinkedListNode<E>) => boolean) {
        let curr: LinkedListNode<E> | null = this.head;
        while (curr !== null) {
            if (locateFn(curr)) {
                break;
            }
            curr = curr.next;
        }
        return curr;
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
        this.size = 0;
    }
}

export class LinkedListNode<E extends object> {
    prev: LinkedListNode<E> | null = null;
    next: LinkedListNode<E> | null = null;

    constructor(public data: E, public list: LinkedList<E>) {}

    before(node: LinkedListNode<E>): LinkedListNode<E> {
        node.prev = this.prev;
        node.next = this;

        this.prev !== null && (this.prev.next = node);
        this.prev = node;

        if (this === this.list.head) this.list.head = node;

        this.list.size++;
        return node;
    }

    after(node: LinkedListNode<E>): LinkedListNode<E> {
        node.next = this.next;
        node.prev = this;

        this.next !== null && (this.next.prev = node);
        this.next = node;

        if (this === this.list.tail) this.list.tail = node;

        this.list.size++;
        return node;
    }

    detach(): LinkedListNode<E> {
        this.prev !== null && (this.prev.next = this.next);
        this.next !== null && (this.next.prev = this.prev);

        if (this.list.size === 1) {
            this.list.head = null;
            this.list.tail = null;
        } else {
            if (this === this.list.head) {
                this.list.head = this.next;
            }
            if (this === this.list.tail) {
                this.list.tail = this.prev;
            }
        }
        this.list.size--;
        this.prev = null;
        this.next = null;
        return this;
    }
}

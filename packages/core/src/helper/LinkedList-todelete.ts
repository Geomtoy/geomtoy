abstract class LinkedList<E extends object> {
    abstract head: LinkedListNode<E> | null;
    abstract tail: LinkedListNode<E> | null;
    size = 0;

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
    forEach(fn: (value: LinkedListNode<E>, index: number, list: typeof this) => void, thisArg?: any) {
        let i = 0;
        for (let node of this) {
            fn.call(thisArg, node, i, this);
        }
    }

    isEmpty() {
        return this.size === 0;
        // return this.head === null || this.tail === null;
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
    pop() {
        if (this.head === null || this.tail === null) return undefined;
        return this.tail.detach();
    }
    shift() {
        if (this.head === null || this.tail === null) return undefined;
        return this.head.detach();
    }
    clear() {
        for (let node of this) {
            node.prev = null;
            node.next = null;
        }
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
}

abstract class LinkedListNode<E extends object> {
    // Users cannot change two properties below, or these two properties are read-only for users.
    // If users changes them casually, the `list` will be messed up.

    abstract prev: LinkedListNode<E> | null;
    abstract next: LinkedListNode<E> | null;

    constructor(public data: E, public list: LinkedList<E>) {}

    before(node: typeof this): typeof this;
    before(data: E): typeof this;
    before(arg: any): typeof this {
        let node: typeof this;

        if (arg instanceof Object.getPrototypeOf(this).constructor) {
            assertDetachedNodeOfList(arg, this.list, "node");
            node = arg;
        } else {
            node = new (Object.getPrototypeOf(this).constructor)(arg, this.list);
        }

        node.prev = this.prev;
        node.next = this;

        this.prev !== null && (this.prev.next = node);
        this.prev = node;

        if (this === this.list.head) this.list.head = node;

        this.list.size++;
        return node;
    }

    after(node: typeof this): typeof this;
    after(data: E): typeof this;
    after(arg: any): typeof this {
        let node: typeof this;

        if (arg instanceof Object.getPrototypeOf(this).constructor) {
            assertDetachedNodeOfList(arg, this.list, "node");
            node = arg;
        } else {
            node = new (Object.getPrototypeOf(this).constructor)(arg, this.list);
        }

        node.next = this.next;
        node.prev = this;

        this.next !== null && (this.next.prev = node);
        this.next = node;

        if (this === this.list.tail) this.list.tail = node;

        this.list.size++;
        return node;
    }
    detach(): typeof this {
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
        if (this.list instanceof SequentialLinkedList) {
            this.prev = null;
            this.next = null;
        }
        if (this.list instanceof CircularLinkedList) {
            this.prev = this;
            this.next = this;
        }

        return this;
    }
}

function assertDetachedNodeOfList<E extends object>(node: LinkedListNode<E>, list: LinkedList<E>, p: string) {
    if (node.list !== list) {
        throw new Error(`[G]The \`${p}\`is not a detached node of the list.`);
    }
    if (list instanceof SequentialLinkedList) {
        // "null - node - null" when size = 1
        if (list.size === 1) {
            if (node === list.head || node === list.tail) throw new Error(`[G]The \`${p}\`is not a detached node of the list.`);
        } else {
            if (node.prev !== null || node.next !== null) throw new Error(`[G]The \`${p}\`is not a detached node of the list.`);
        }
    }
    if (list instanceof CircularLinkedList) {
        // "this - node - this" when size = 1
        if (list.size === 1) {
            if (node === list.head || node === list.tail) throw new Error(`[G]The \`${p}\`is not a detached node of the list.`);
        } else {
            if (node.prev !== node || node.next !== node) throw new Error(`[G]The \`${p}\`is not a detached node of the list.`);
        }
    }
}
function assertAttachedNodeOfList<E extends object>(node: LinkedListNode<E>, list: LinkedList<E>, p: string) {
    if (node.list !== list) {
        throw new Error(`[G]The \`${p}\`is not a attached node of the list.`);
    }

    if (list instanceof SequentialLinkedList) {
        // "null - node - null" when size = 1
        if (list.size === 1) {
            if (node !== list.head && node !== list.tail) throw new Error(`[G]The \`${p}\`is not a attached node of the list.`);
        } else {
            if (node.prev === null && node.next === null) throw new Error(`[G]The \`${p}\`is not a attached node of the list.`);
        }
    }
    if (list instanceof CircularLinkedList) {
        // "this - node - this" when size = 1
        if (list.size === 1) {
            if (node !== list.head && node !== list.tail) throw new Error(`[G]The \`${p}\`is not a attached node of the list.`);
        } else {
            if (node.prev === node && node.next === node) throw new Error(`[G]The \`${p}\`is not a attached node of the list.`);
        }
    }
}

export class SequentialLinkedList<E extends object> extends LinkedList<E> {
    head: SequentialLinkedListNode<E> | null = null;
    tail: SequentialLinkedListNode<E> | null = null;

    static fromArray<SE extends object>(arr: SE[]) {
        const list = new SequentialLinkedList<SE>();
        arr.forEach(elem => list.push(elem));
        return list;
    }

    push(node: SequentialLinkedListNode<E>): SequentialLinkedListNode<E>;
    push(data: E): SequentialLinkedListNode<E>;
    push(arg: any): SequentialLinkedListNode<E> {
        let node: SequentialLinkedListNode<E>;
        if (arg instanceof SequentialLinkedListNode) {
            assertDetachedNodeOfList(arg, this, "node");
            node = arg;
        } else {
            node = new SequentialLinkedListNode(arg, this);
        }
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
        return super.pop() as SequentialLinkedListNode<E>;
    }
    unshift(node: SequentialLinkedListNode<E>): SequentialLinkedListNode<E>;
    unshift(data: E): SequentialLinkedListNode<E>;
    unshift(arg: any): SequentialLinkedListNode<E> {
        let node: SequentialLinkedListNode<E>;
        if (arg instanceof SequentialLinkedListNode) {
            assertDetachedNodeOfList(arg, this, "node");
            node = arg;
        } else {
            node = new SequentialLinkedListNode(arg, this);
        }
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
        return super.shift() as SequentialLinkedListNode<E>;
    }
    /**
     * Returns a new linked list by concatenating linked list `this` and `list`.
     * @param list
     */
    concat(list: SequentialLinkedList<E>) {
        const ret = new SequentialLinkedList<E>();
        for (let node of this) {
            ret.push(node.data);
        }
        for (let node of list) {
            ret.push(node.data);
        }
        return ret;
    }
}

export class CircularLinkedList<E extends object> extends LinkedList<E> {
    head: CircularLinkedListNode<E> | null = null;
    tail: CircularLinkedListNode<E> | null = null;

    static fromArray<SE extends object>(arr: SE[]) {
        const list = new CircularLinkedList<SE>();
        arr.forEach(elem => list.push(elem));
        return list;
    }

    push(node: CircularLinkedListNode<E>): CircularLinkedListNode<E>;
    push(data: E): CircularLinkedListNode<E>;
    push(arg: any): CircularLinkedListNode<E> {
        let node: CircularLinkedListNode<E>;
        if (arg instanceof CircularLinkedListNode) {
            assertDetachedNodeOfList(arg, this, "node");
            node = arg;
        } else {
            node = new CircularLinkedListNode(arg, this);
        }

        if (this.head === null || this.tail === null) {
            node.prev = node;
            node.next = node;

            this.head = node;
            this.tail = node;
        } else {
            node.prev = this.tail;
            node.next = this.head;

            this.head.prev = node;
            this.tail.next = node;

            this.tail = node;
        }
        this.size++;
        return node;
    }
    pop() {
        return super.pop() as CircularLinkedListNode<E>;
    }
    unshift(node: CircularLinkedListNode<E>): CircularLinkedListNode<E>;
    unshift(data: E): CircularLinkedListNode<E>;
    unshift(arg: any): CircularLinkedListNode<E> {
        let node: CircularLinkedListNode<E>;
        if (arg instanceof CircularLinkedListNode) {
            assertDetachedNodeOfList(arg, this, "node");
            node = arg;
        } else {
            node = new CircularLinkedListNode(arg, this);
        }

        if (this.head === null || this.tail === null) {
            node.prev = node;
            node.next = node;

            this.head = node;
            this.tail = node;
        } else {
            node.prev = this.tail;
            node.next = this.head;

            this.head.prev = node;
            this.tail.next = node;

            this.head = node;
        }
        this.size++;
        return node;
    }
    shift() {
        return super.shift() as CircularLinkedListNode<E>;
    }
    take(fromNode: CircularLinkedListNode<E>, toNode: CircularLinkedListNode<E>): CircularLinkedList<E> {
        assertAttachedNodeOfList(fromNode, this, "fromNode");
        assertAttachedNodeOfList(toNode, this, "toNode");

        const ret = new CircularLinkedList<E>();

        if (this.size === 0) return ret;

        let node = fromNode;
        while (true) {
            ret.push(node.data);
            if (node === toNode) break;
            node = node.next!;
            node.detach();
        }
        return ret;
    }
}

export class SequentialLinkedListNode<E extends object> extends LinkedListNode<E> {
    prev: SequentialLinkedListNode<E> | null = null;
    next: SequentialLinkedListNode<E> | null = null;
    constructor(data: E, list: SequentialLinkedList<E>) {
        super(data, list);
    }
}

export class CircularLinkedListNode<E extends object> extends LinkedListNode<E> {
    prev: CircularLinkedListNode<E> = this;
    next: CircularLinkedListNode<E> = this;
    constructor(data: E, list: CircularLinkedList<E>) {
        super(data, list);
    }
}

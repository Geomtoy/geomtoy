export class LinkedList<E extends object> {
    head: LinkedListNode<E> | null = null;
    tail: LinkedListNode<E> | null = null;
    size = 0;

    private _circular: boolean;

    get circular() {
        return this._circular;
    }
    set circular(value: boolean) {
        const oldValue = this._circular;
        if (value === oldValue) return;
        if (oldValue) {
            // change from circular linked list to sequential linked list
            if (this.head !== null) this.head.prev = null;
            if (this.tail !== null) this.tail.next = null;
        } else {
            // change from sequential linked list to circular linked list
            if (this.head !== null) this.head.prev = this.tail;
            if (this.tail !== null) this.tail.next = this.head;
        }
        this._circular = value;
    }

    constructor(circular: boolean) {
        this._circular = circular;
    }

    static fromArray<SE extends object>(arr: SE[], circular: boolean) {
        const list = new LinkedList<SE>(circular);
        arr.forEach(elem => list.push(elem));
        return list;
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

    push(node: LinkedListNode<E>): LinkedListNode<E>;
    push(data: E): LinkedListNode<E>;
    push(arg: any): LinkedListNode<E> {
        let node: LinkedListNode<E>;
        if (arg instanceof LinkedListNode) {
            assertDetachedNodeOfList(arg, this, "node");
            node = arg;
        } else {
            node = new LinkedListNode(arg, this);
        }
        if (this.head === null || this.tail === null) {
            node.prev = this.circular ? node : null;
            node.next = this.circular ? node : null;
            this.head = node;
            this.tail = node;
        } else {
            node.prev = this.tail;
            node.next = this.circular ? this.head : null;
            this.circular && (this.head.prev = node);
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

    unshift(node: LinkedListNode<E>): LinkedListNode<E>;
    unshift(data: E): LinkedListNode<E>;
    unshift(arg: any): LinkedListNode<E> {
        let node: LinkedListNode<E>;
        if (arg instanceof LinkedListNode) {
            assertDetachedNodeOfList(arg, this, "node");
            node = arg;
        } else {
            node = new LinkedListNode(arg, this);
        }
        if (this.head === null || this.tail === null) {
            node.prev = this.circular ? node : null;
            node.next = this.circular ? node : null;
            this.head = node;
            this.tail = node;
        } else {
            node.prev = this.circular ? this.tail : null;
            node.next = this.head;
            this.head.prev = node;
            this.circular && (this.tail.next = node);
            this.head = node;
        }
        this.size++;
        return node;
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

    /**
     * Returns a new linked list by concatenating linked list `this` and `list`.
     * @param list
     */
    concat(list: LinkedList<E>) {
        if (this.circular || list.circular) {
            throw new Error("[G]Circular linked lists being concated.");
        }
        const ret = new LinkedList<E>(false);
        for (let node of this) {
            ret.push(node.data);
        }
        for (let node of list) {
            ret.push(node.data);
        }
        return ret;
    }
    take(fromNode: LinkedListNode<E>, toNode: LinkedListNode<E>) {
        assertAttachedNodeOfList(fromNode, this, "fromNode");
        assertAttachedNodeOfList(toNode, this, "toNode");
        if (!this.circular) {
            throw new Error("[G]Sequential linked list being taken.");
        }
        const ret = new LinkedList<E>(true);
        if (this.size === 0) return ret;

        let node = fromNode;
        while (node !== toNode.next) {
            ret.push(node.data);
            const next = node.next!;
            node.detach();
            node = next;
        }
        return ret;
    }
}

export class LinkedListNode<E extends object> {
    // Users cannot change two properties below, or these two properties are read-only for users.
    // If users changes them casually, the `list` will be messed up.
    prev: LinkedListNode<E> | null = null;
    next: LinkedListNode<E> | null = null;

    constructor(public data: E, public list: LinkedList<E>) {}

    beforeMany(arg: LinkedListNode<E>[] | E[]): LinkedListNode<E> {
        let node: LinkedListNode<E> = this;
        let i = arg.length - 1;
        do {
            node = node.before(arg[i]);
            i--;
        } while (i >= 0);
        return node;
    }

    before(arg: LinkedListNode<E> | E): LinkedListNode<E> {
        let node: LinkedListNode<E>;

        if (arg instanceof LinkedListNode) {
            assertDetachedNodeOfList(arg, this.list, "node");
            node = arg;
        } else {
            node = new LinkedListNode(arg, this.list);
        }

        node.prev = this.prev;
        node.next = this;

        this.prev !== null && (this.prev.next = node);
        this.prev = node;

        if (this === this.list.head) this.list.head = node;

        this.list.size++;
        return node;
    }

    afterMany(arg: LinkedListNode<E>[] | E[]): LinkedListNode<E> {
        let node: LinkedListNode<E> = this;
        let i = 0;
        do {
            node = node.after(arg[i]);
            i++;
        } while (i <= arg.length - 1);
        return node;
    }

    after(arg: LinkedListNode<E> | E): LinkedListNode<E> {
        let node: LinkedListNode<E>;
        if (arg instanceof LinkedListNode) {
            assertDetachedNodeOfList(arg, this.list, "node");
            node = arg;
        } else {
            node = new LinkedListNode(arg, this.list);
        }

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

function assertDetachedNodeOfList<E extends object>(node: LinkedListNode<E>, list: LinkedList<E>, p: string) {
    if (node.list !== list) {
        throw new Error(`[G]The \`${p}\`is not a detached node of the list.`);
    }
    if (!list.circular && list.size === 1) {
        // "null - node - null" when not circular and size = 1
        if (node === list.head || node === list.tail) throw new Error(`[G]The \`${p}\`is not a detached node of the list.`);
    }
    if (node.prev !== null || node.next !== null) throw new Error(`[G]The \`${p}\`is not a detached node of the list.`);
}
function assertAttachedNodeOfList<E extends object>(node: LinkedListNode<E>, list: LinkedList<E>, p: string) {
    if (node.list !== list) {
        throw new Error(`[G]The \`${p}\`is not a attached node of the list.`);
    }
    if (!list.circular && list.size === 1) {
        // "null - node - null" when not circular and size = 1
        if (node !== list.head && node !== list.tail) throw new Error(`[G]The \`${p}\`is not a attached node of the list.`);
    }
    if (node.prev === null && node.next === null) throw new Error(`[G]The \`${p}\`is not a attached node of the list.`);
}

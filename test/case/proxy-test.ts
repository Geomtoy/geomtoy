class GeomObject {
    #proxyHandler = {
        set: (object: any, key: string, value: any) => {
            object[key] = value
            console.log("PROXY SET")
            return true
        },
        get(target: any, p: string, receiver: any) {
            // console.log(target)
            // return target[p]
            if (p in target) {
                if (typeof target[p] === "function" &&  target[p].name !=="isEmpty" ) {

                    if (target["isEmpty"]()) {
                        return function () {
                            return `Calling \'${p}\' on empty \`Test\`.`
                         }
                    } else {
                        return target[p].bind(target)
                    }
                } else {
                    return target[p]
                }
            } else {
                // console.error(`No such member \`${p}\` in \`${Object.getPrototypeOf(target).constructor.name}\``)
            }
        }
    }

    constructor() {}
    get proxyHandler(){
        return this.#proxyHandler
    }

}
 


class Test extends GeomObject {
    #x: number | undefined
    #y: number | undefined
    constructor(x: number, y: number)
    constructor()
    constructor(x?: number, y?: number) {
        // this.__proto__ =
        super()
        this.#x = x
        this.#y = y
        return new (class Test {
            constructor(target: Test, handler: ProxyHandler<Test>) {
                Object.setPrototypeOf(this, new Proxy(target, handler))
            }
        })(this, this.proxyHandler) as Test
        // return new Proxy(this,this.proxyHandler)
    }
    get x() {
        return this.#x
    }
    set x(value) {
        this.#x = value
    }

    get y() {
        return this.#y
    }
    set y(value) {
        this.#y = value
    }

    isEmpty() {
        return this.x === NaN || this.x === undefined || this.y === NaN || this.y === undefined
    }
    // #nidaye() {
    //     console.log(this)
    //     return this.x
    // }
    // nainai() {
    //     console.log(this)
    //     return this.#nidaye()
    // }

    toArray() {
        return [this.x, this.y]
    }
}
 
// let a = new Test(1, 2)
let b = new Test()

// console.log(a.toArray())


// b.x=122
b.y=1111

// console.log(a.getHeheda())
console.log(b.heheda= 1)
console.log(b)
// console.log(b.nainai())
// console.log(b)

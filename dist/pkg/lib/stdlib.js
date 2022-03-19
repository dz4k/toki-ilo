
export const builtinFunctions = {
    "mu"() {
        console.log("mu")
    },

    "toki,"(a) {
        console.log(a)
    },
    
    "pana,,tawa"(a, dest) {
        if (Array.isArray(dest)) {
            dest.push(a)
            return dest
        } else if (typeof dest === "number" || typeof dest === "string") {
            return dest + a
        }
    },

    "kipisi,,tawa"(num, denom, ctx) {
        ctx["awen ni"] = num % denom
        return num / denom
    }
}

export const makeContext = (functions = {}) => ({
    [functionContext]: Object.assign(Object.create(builtinFunctions), functions),
    "ala": 0,
    "wan": 1,
    "tu": 2,
    get "kulupu sin"() {
        return []
    },
    get "nanpa nasa"() {
        return Math.random()
    },
})

export const functionContext = Symbol()

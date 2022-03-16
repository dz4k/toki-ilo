
export const functions = {
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
    
}

export const makeContext = () => ({
    [functionContext]: Object.create(functions),
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

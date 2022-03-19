/**
 * @typedef {import("./lex.mjs").Token} Token
 * @typedef {import("./lex.mjs").TokenType} TokenType
 * @typedef {import("./util.mjs").Error} Error
 * 
 * @typedef {Object} ASTNode
 * @property {String} t
 * @property {Token} startToken
 * @property {Token} endToken
 * @property {ASTNode[]} [children]
 * @property {String} [data]
 */

import { indent } from "./util.js"

/**
 * 
 * @param {Token[]} tokens 
 * @returns {{ ast: ASTNode[], errors: Error[] }}
 */
const parse = tokens => {
    const errors = []

    const parseError = msg => {
        const { offset, row, col } = current
        errors.push({ msg, offset, row, col })
    }

    const it = tokens[Symbol.iterator]()
    let next = it.next()
    let current
    let last
    
    const eat = () => {
        if (next.done) return null

        last = current
        current = next.value
        next = it.next()
        return current
    }

    /** 
     * @param {(t: Token) => Boolean} pred
     * @returns {Token | null}
     */
    const match = pred => (!next.done && pred(next.value)) ? eat() : null

    /** 
     * @param {TokenType} t
     * @returns {Token | null}
     */
    const matchType = t => (!next.done && next.value.t === t) ? eat() : null

    /**
     * 
     * @param {String} v 
     * @returns {Token | null}
     */
    const matchIdent = v => (!next.done && next.value.t === "identifier" && next.value.v == v) ? eat() : null
 
    /**
     * @template {Array} T
     * @param {(...args: T) => Pick<ASTNode, ("t"|"data"|"children")>} fn 
     * @param  {T} args 
     * @returns {ASTNode | null}
     */
    const parseRule = (fn, ...args) => {
        const startToken = next.value
        const node = fn(...args)
        const endToken = current
        if (!node) return null
        return { ...node, startToken, endToken }
    }

    // BEGIN GRAMMAR
    
    /**
     * @returns {ASTNode[]}
     */
    const statements = () => {
        /** @type {ASTNode[]} */
        const rv = []
        let stmt
        while (!next.done && !matchType("dot")) {
            const stmt = parseRule(statement)
            if (!stmt) {
                parseError("Expected statement")
                return rv
            }
            rv.push(stmt)
        }
        return rv
    }

    const statement = () => {
        if (matchType("colon")) return block()

        const nud = simpleStatement()

        if (!nud) return null


        if (matchType("la")) {
            const body = parseRule(statement)
            if (!body) parseError("la statement has no body")
            return { t: "la statement", children: [nud, body] }
        }

        if (!matchType("dot")) parseError("Unterminated statement")

        return nud
    }

    /* Null denotation */
    const simpleStatement = () => {
        if (matchType("o")) return funcall()
        
        const lhs = parseRule(expression)

        if (!lhs) return null

        if (matchType("o")) return assignment(lhs)

        if (matchType("li")) return assertion(lhs)

        return { t: "expression statement", children: [lhs] }
    }
    
    const funcall = () => {
        let funcName, args = []
        funcName = parseRule(name)
        if (!funcName) parseError("Expected function name.")
    
        while (matchType("e")) {
            args.push(parseRule(expression) || parseError("Expected argument"))
        }
    
        while (matchType("comma")) {
            args.push(parseRule(prepositional) || parseError("Expected preposition argument"))
        }
    
        return { t: "funcall statement", children: [funcName, ...args] }
    }

    const block = () => {
        const children = statements()
        return { t: "block statement", children }
    }

    const assignment = lhs => {
        const rhs = parseRule(expression)
        if (!rhs) {
            parseError("Expected value to assign")
            return null
        }
        return { t: "assignment statement", children: [lhs, rhs] }
    }

    const assertion = lhs => {
        const rhs = parseRule(expression)

        if (!rhs) {
            parseError("Expected right-hand side")
            return lhs
        }

        return { t: "equality statement", children: [lhs, rhs] }
    }

    const expression = () => {
        const nud = parseRule(name)
        if (!nud) return null
        const led = parseRule(stringLiteral, nud) || parseRule(numberLiteral, nud) || nud
        return led
    }

    const prepositional = () => {
        const preposition = (
            matchIdent("lon")
            || matchIdent("kepeken")
            || matchIdent("tawa")
            || matchIdent("sama")
            || matchIdent("tan")
        )

        if (!preposition) {
            parseError("Expected preposition")
            return null
        }

        const expr = parseRule(expression)

        return { t: "prepositional", data: preposition.v, children: [expr] }
    }

    const name = () => {
        const rv = []
        while (matchType("identifier")) {
            rv.push(current)
        }
        if (rv.length === 0) return null
        return { t: "name expression", data: rv.map(e => e.v).join(" ") }
    }

    const stringLiteral = lhs => {
        if (lhs.t !== "name expression") return null
        const lit = matchType("string literal")
        if (!lit) return null

        return { t: "string expression", data: lit.v, children: [lhs] }
    }

    const numberLiteral = lhs => {
        if (lhs.t !== "name expression") return null
        const lit = matchType("number literal")
        if (!lit) return null

        return { t: "number expression", data: lit.v, children: [lhs] }
    }

    return { errors, ast: statements() }
}

export default parse

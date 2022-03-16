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

import { BlockList } from "net"

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
        while (!next.done && !matchType("dot")) rv.push(parseRule(statement))
        return rv
    }

    const statement = () => {
        if (matchType("colon")) return block()

        const nud = simpleStatement()

        if (!nud) return null

        if (matchType("dot")) {
            return nud
        }

        if (matchType("la")) {
            const body = parseRule(statement)
            if (!body) parseError("la statement has no body")
            matchType("dot")
            return { t: "la statement", children: [nud, body] }
        }

        parseError("Unterminated statement")
    }

    /* Null denotation */
    const simpleStatement = () => {
        if (matchType("o")) return funcall()
        
        const lhs = parseRule(expression)

        if (!lhs) return null

        if (matchType("o")) return assignment(lhs)

        return { t: "expression statement", children: [lhs] }
    }
    
    const funcall = () => {
        let funcName, args = []
        funcName = parseRule(name)
        if (!funcName) parseError("Expected function name.")
    
        while (matchType("e")) {
            args.push(parseRule(expression))
        }
    
        while (matchType("comma")) {
            args.push(parseRule(prepositional))
        }
    
        return { t: "funcall statement", children: [funcName, ...args] }
    }

    const block = () => {
        const children = statements()
        return { t: "block statement", children }
    }

    const assignment = lhs => {
        const rhs = parseRule(expression)
        return { t: "assignment statement", children: [lhs, rhs] }
    }

    const expression = () => {
        return parseRule(name)
    }

    const prepositional = () => {
        const preposition = (
            matchIdent("lon")
            || matchIdent("kepeken")
            || matchIdent("tawa")
            || matchIdent("sama")
            || matchIdent("tan")
        )

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

    return { errors, ast: statements() }
}

export default parse

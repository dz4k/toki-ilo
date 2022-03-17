
import { makeContext, functionContext } from "./stdlib.mjs"

/**
 * @typedef {import("./parse.mjs").ASTNode} ASTNode
 * 
 * @typedef {Object & { [functionContext]: Object }} Context
 */

/** 
 * @param {ASTNode[]} ast 
 * @returns {Promise<Object>}
 */
const run = async ast => {
    const context = makeContext()

    for (const node of ast) {
        await runNode(node, context)
    }

    return context
}

/**
 * 
 * @param {ASTNode} node 
 * @param {Context} ctx 
 * @returns {Promise<any>}
 */
const runNode = async (node, ctx) => {
    switch (node.t) {
    
    // Statements

    case "block statement": {
        for (const stmt of node.children) {
            await runNode(stmt, ctx)
        }
        break
    }

    case "assignment statement": {
        const [lhs, rhs] = node.children
        switch (lhs.t) {

        case "name expression":
            ctx[lhs.data] = await runNode(rhs, ctx)
            break

        default:
            err("Cannot assign to " + lhs.t)
        }
        break
    }

    case "equality statement": {
        const [lhs, rhs] = await Promise.all(
            node.children.map(child => runNode(child, ctx))
        )
        ctx.ni = lhs == rhs
        break
    }

    case "funcall statement": {
        const [nameNode, ...args] = node.children
        const funcName = mangleFunctionName(nameNode.data, args)
        const rv = ctx[functionContext][funcName](
            ...await Promise.all(args.map(arg => runNode(arg, ctx))),
            ctx
        )
        if (rv !== undefined) ctx.ni = rv
        break
    }
    
    case "expression statement": {
        ctx.ni = await runNode(node.children[0], ctx)
        break
    }
    
    case "la statement": {
        const [lhs, rhs] = node.children
        switch (lhs.t) {
        default:
            await runNode(lhs, ctx)
            const value = ctx.ni

            if (Array.isArray(value)) {
                let i = 0
                for (const elem of value) {
                    ctx.ni = elem
                    ctx["ni ale"] = value
                    ctx["nanpa ni"] = i++
                    await runNode(rhs, ctx)
                }
            } else if (typeof value === "number") {
                for (let i = 0; i < value; i++) {
                    ctx.ni = ctx["nanpa ni"] = i
                    ctx["ni ale"] = value
                    await runNode(rhs, ctx)
                }
            } else {
                if (value) {
                    await runNode(rhs, ctx)
                }
            }
        }
        break
    }

    // Expressions

    case "prepositional": {
        return runNode(node.children[0], ctx)
    }

    case "name expression": {
        return ctx[node.data]
    }

    case "string expression": {
        if (node.children[0].data !== "nimi") err("Unknown textual type " + node.children[0].data)
        return node.data
    }

    case "number expression": {
        if (node.children[0].data !== "nanpa") err("Unknown numeric type " + node.children[0].data)
        return Number(node.data)
    }

    default: err("Unknown node type " + node.t + ". This is a bug in toki ilo.")
    }
}

const err = msg => {
    throw msg
}

/**
 * 
 * @param {String} name 
 * @param {ASTNode[]} args 
 */
const mangleFunctionName = (name, args) => {
    for (const arg of args) {
        name += ","
        if (arg.t === "prepositional") name += arg.data
    }
    return name
}

export default run

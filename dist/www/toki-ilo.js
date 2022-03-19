
import { pad } from "./util.js"
import lex from "./lex.js"
import parse from "./parse.js"
import run from "./run.js"

const toki_ilo = (src, functions = {}) => {
    const { tokens, errors: lexErrors } = lex(src)
    if (lexErrors.length > 0) {
        for (const error of lexErrors) console.log(
            `ERR Ln ${pad(error.row, 4)} Col ${pad(error.col, 4)}: ${error.msg}`
        )
        return
    }

    const { ast, errors: parseErrors } = parse(tokens)
    if (parseErrors.length > 0) {
        for (const error of parseErrors) console.log(
            `ERR Ln ${pad(error.row, 4)} Col ${pad(error.col, 4)}: ${error.msg}`
        )
        return
    }

    return run(ast, functions)
}

export default toki_ilo
export { lex, parse, run }

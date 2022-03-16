
import { pad } from "./util.mjs"
import lex from "./lex.mjs"
import parse from "./parse.mjs"
import run from "./run.mjs"

const toki_ilo = src => {
    const { tokens, errors: lexErrors } = lex(src)
    if (lexErrors.length > 0) {
        for (const error of lexErrors) console.log(
            `ERR Ln ${pad(error.row, 4)} Col ${pad(error.col, 4)}: ${error.msg}`
        )
        return
    }

    const { ast, errors: parseErrors } = parse(tokens)
    if (parseErrors.length > 0) {
        for (const error of lexErrors) console.log(
            `ERR sLn ${pad(error.row, 4)} Col ${pad(error.col, 4)}: ${error.msg}`
        )
        return
    }

    return run(ast)
}

export default toki_ilo
export { lex, parse, run }

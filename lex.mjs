
/**
 * @typedef {import("./util.mjs").Error} Error
 * 
 * @typedef {Object} Token
 * @property {TokenType} t
 * @property {String} v
 * @property {Number} offset
 * @property {Number} row
 * @property {Number} col
 * 
 * @typedef {(
 *        "o"
 *      | "la"
 *      | "li"
 *      | "e"
 *      | "dot"
 *      | "colon"
 *      | "comma"
 *      | "identifier"
 *      | "stringLiteral"
 *      | "numberLiteral"
 * )} TokenType
 * @extends {String}
 */

/**
 * 
 * @param {string} src source code
 * @returns {{
 * 		tokens: Token[],
 * 		errors: Error[]
 * }}
 */
const lex = src => {
	const tokens = []
	const errors = []

	/**
	 * Emit a token
	 * @param {TokenType} t The type of the token
	 * @param {String} v The data associated with the token
	 */
	const emit = (t, v) => tokens.push({ t, v, offset, row, col })

	/**
	 * Add a lex error
	 * @param {string} msg 
	 */
	const lexError = msg => errors.push({ msg, offset, row, col })

	const it = src[Symbol.iterator]()
	let next = it.next()
	let ch, offset = 0, row = 1, col = 1
	
	/**
	 * Consumes a character.
	 * @returns {String} The consumed character.
	 */
	const eat = () => {
		if (next.done) return null
		
		ch = next.value
		next = it.next()
		
		offset += ch.length
		col    += ch.length
		if (ch === "\n") {
			row++
			col = 1
		}

		return ch
	}

	/**
	 * 
	 * @param {(ch: String) => Boolean} pred A character predicate.
	 * @returns {String | null} The matched character, if any.
	 */
	const match = pred => !next.done && pred(next.value) ? eat() : null

	/**
	 * @param {String} start
	 */
	const identifier = start => {
		let ident = start
		while (match(isAlpha)) {
			ident += ch
		}
		if (keywords.includes(/** @type {TokenType} */ (ident)))
			emit(/** @type {TokenType} */ (ident), ident)
		else emit("identifier", ident)
	}

	const numberLiteral = start => {
		let num = start
		while (match(isDigit)) {
			num += ch
		}
		emit("numberLiteral", num)
	}

	const stringLiteral = start => {
		let str = ""
		while (eat() && ch !== start) {
			if (ch === "\n") {
				lexError("Unterminated string")
				break
			}
			if (ch === "\\") {
				eat()
			}
			str += ch
		}
		emit("stringLiteral", str)
	}

	while (eat()) {
		switch (true) {
			case isWS(ch):
			break
			case isAlpha(ch): identifier(ch)
			break
			case isDigit(ch): numberLiteral(ch)
			break
			case ch === "\"": stringLiteral(ch)
			break
			case ch === "\'": stringLiteral(ch)
			break
			case ch === ".": emit("dot", ch)
			break
			case ch === ":": emit("colon", ch)
			break
			case ch === ",": emit("comma", ch)
			break
			default: lexError("Unexpected character: " + ch)
		}
	}

	return { tokens, errors }
}

const isWS = ch => /[ \n\t]/.test(ch)
const isAlpha = ch => /[aeijklmnopstuw]/.test(ch)
const isDigit = ch => /[0-9]/.test(ch)

/**
 * @type {TokenType[]}
 */
const keywords = ["o", "li", "e", "la"]

export default lex

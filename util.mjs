

/**
 * 
 * @typedef {Object} Error
 * @property {String} msg
 * @property {Number} offset
 * @property {Number} row
 * @property {Number} col
 */

/**
 * 
 * @param {*} n 
 * @param {Number} width 
 * @returns {String}
 */
export const pad = (n, width) => {
    n = String(n)
    return n.length >= width
        ? n
        : new Array(width - n.length + 1).join(" ") + n
}

export const printToken = token => console.log(
    `Ln ${pad(token.row, 4)} Col ${pad(token.col, 4)}:  ${pad(token.t, 20)}  ${token.v}`)

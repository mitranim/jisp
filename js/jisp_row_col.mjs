import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'

export class RowCol extends ji.MixInsp.goc(a.Emp) {
  #row = undefined
  setRow(val) {return this.#row = a.reqNat(val), this}
  ownRow() {return this.#row}

  #col = undefined
  setCol(val) {return this.#col = a.reqNat(val), this}
  ownCol() {return this.#col}

  strShort() {
    const row = this.ownRow()
    const col = this.ownCol()
    return row && col ? (row + `:` + col) : ``
  }

  /*
  Regular JS strings are encoded as UTF-16. The indexing syntax `str[ind]`
  and various methods such as `.slice` use UTF-16 code points, not Unicode
  characters. However, the `for..of` loop iterates Unicode characters, not
  UTF-16 points. Each chunk may have `.length > 1`. This method takes a
  UTF-16 position and returns row and col in Unicode characters.
  */
  fromUtf16(src, pos) {
    a.reqStr(src)
    a.reqNat(pos)

    let off = 0
    let row = 0
    let col = 0

    for (const char of src) {
      if (off >= pos) break
      off += char.length

      if (char === `\r` && (src.length > off+1) && (src[off] === `\n`)) {
        continue
      }

      if (char === `\r` || char === `\n`) {
        row++
        col = 0
        continue
      }

      col++
    }

    row++
    col++
    return this.setRow(row).setCol(col)
  }

  [ji.symInspMod](tar) {return tar.funs(this.ownRow, this.ownCol)}
}

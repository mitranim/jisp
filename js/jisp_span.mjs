import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as je from './jisp_err.mjs'
import * as jm from './jisp_misc.mjs'
import * as jrc from './jisp_row_col.mjs'

/*
Describes a range spanning from position A to position B in some outer
collection, which may be either a string or a JS array.

This is a base class. For specialized implementations, see `StrSpan` and
`ArrSpan`.

Technical note on length. For both array spans and string spans, the property
`.getLen`/`.ownLen` must use the native property `.length` of the underlying
source. JS strings use UTF-16, and `.length` counts UTF-16 code units, not
characters. For simplicity and performance, we use the "native" length for most
operations. We count characters only when really needed, such as for row/col
positioning. See `Span.prototype.init`.
*/
export class Span extends ji.MixInsp.goc(a.Emp) {
  #src = ``
  setSrc(val) {return this.#src = jm.reqStrOrArr(val), this}
  withSrc(val) {return this.clone().setSrc(val)}
  ownSrc() {return this.#src}

  #pos = 0
  setPos(val) {return this.#pos = a.reqNat(val), this}
  withPos(val) {return this.clone().setPos(val)}
  ownPos() {return this.#pos}
  nextPos() {return this.#pos + this.#len}

  #len = 0
  setLen(val) {return this.#len = a.reqNat(val), this}
  withLen(val) {return this.clone().setLen(val)}
  ownLen() {return this.#len}
  hasLen() {return this.#len > 0}
  isEmpty() {return !this.hasLen()}

  init(src) {return this.setSrc(src).setPos(0).setLen(src.length)}

  // TODO consider moving to `StrSpan`.
  // This interface is expected to always return a string.
  decompile() {return this.#src.slice(this.#pos, this.#pos + this.#len)}

  hasMore() {return this.#pos < this.#src.length}
  skip(len) {return this.#pos += a.reqNat(len), this}

  // Short for "remainder" or "remaining".
  rem() {return this.#src.slice(this.#pos)}
  remAt(pos) {return this.#src.slice(a.reqNat(pos))}

  clone() {
    return new this.constructor()
      .setSrc(this.#src)
      .setPos(this.#pos)
      .setLen(this.#len)
  }

  static range(begin, end) {
    return new this()
      .setSrc(begin.ownSrc())
      .setPos(begin.ownPos())
      .setLen(end.nextPos() - begin.ownPos())
  }

  static optRange(begin, end) {
    return a.isSome(begin) && a.isSome(end) ? this.range(begin, end) : undefined
  }

  [ji.symInsp](tar) {
    return tar.funs(this.decompile, this.ownPos, this.ownLen)
  }
}

export class StrSpan extends Span {
  setSrc(val) {return super.setSrc(a.reqStr(val))}
  rowCol() {return new jrc.RowCol().fromUtf16(this.ownSrc(), this.ownPos())}

  /*
  FIXME:

    * Consider including preceding code (requires highlighting).
    * Consider indentation.
    * Consider colors.
    * Consider highlighting specific region with carets.
  */
  context() {
    return jm.joinLines(
      // `position (UTF-16): ` + this.ownPos(),
      `row:col: ` + this.rowCol().strShort(),
      `source:\n\n` + jm.preview(this.rem()),
    )
  }
}

export class ArrSpan extends Span {
  setSrc(val) {return super.setSrc(a.reqArr(val))}
  optHead() {return this.at(this.ownPos())}
  at(ind) {return this.ownSrc()[a.reqNat(ind)]}
  atRel(off) {return this.at(this.ownPos() + a.reqNat(off))}
  optLast() {return a.last(this.ownSrc())}
  reqLast() {return this.optLast() ?? a.panic(new je.Err(`missing last element for span ${a.show(this)}`))}

  popHead() {
    const tar = this.optHead()
    this.skip(1)
    return tar
  }

  findHead(fun, ctx) {
    a.reqFun(fun)

    const src = this.ownSrc()
    let ind = this.ownPos() - 1

    while (++ind < src.length) {
      const val = src[ind]
      if (fun.call(ctx, val)) return val
    }
    return undefined
  }

  skipWhile(fun) {
    a.reqFun(fun)
    while (this.hasMore()) {
      if (!fun(this.optHead())) return this
      this.skip(1)
    }
    return this
  }
}

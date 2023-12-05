import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as je from './jisp_err.mjs'
import * as jm from './jisp_misc.mjs'

/*
Base class that describes a range spanning from position A to position B in some
outer collection, which may be either a string or a JS array.
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
  decompile() {return this.#src.slice(this.#pos, this.#pos + this.#len)}
  more() {return this.#pos < this.#src.length}
  inc() {return this.#pos++, this}
  skip(len) {return this.#pos += a.reqNat(len), this}
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

  [ji.symInspMod](tar) {
    return tar.funs(this.decompile, this.ownPos, this.ownLen)
  }
}

export class StrSpan extends Span {
  setSrc(val) {return super.setSrc(a.reqStr(val))}
  rowCol() {return new RowCol().fromUtf16(this.ownSrc(), this.ownPos())}

  /*
  FIXME:

    * Consider including preceding code (requires highlighting).
    * Consider indentation.
    * Consider colors.
    * Consider highlighting specific region with carets.
  */
  context() {
    return joinLines(
      // `position (UTF-16): ` + this.ownPos(),
      `row:col: ` + this.rowCol().strShort(),
      `source ↓:\n` + jm.preview(this.rem()),
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
    this.inc()
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

  skipWhile(fun, ctx) {
    a.reqFun(fun)
    while (this.more()) {
      if (fun.call(ctx, this.optHead())) this.inc()
      else return this
    }
    return this
  }

  skipMeaningless() {return this.skipWhile(jm.isCosmetic)}
}

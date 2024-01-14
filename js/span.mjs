import {a} from './dep.mjs'
import * as ji from './insp.mjs'
import * as je from './err.mjs'
import * as jm from './misc.mjs'
import * as jre from './repr.mjs'
import * as jpa from './pathed.mjs'
import * as jrc from './row_col.mjs'

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
  #src = undefined
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

  init(src, pos, len) {
    return this.setSrc(src).setPos(pos ?? 0).setLen(len ?? src.length)
  }

  isEmpty() {return !this.hasMore()}
  hasMore() {return this.#pos < this.#src.length}
  skip(len) {return this.#pos += a.reqNat(len), this}
  view() {return this.#src.slice(this.#pos, this.#pos + this.#len)}

  // Short for "remainder" or "remaining".
  rem() {return this.#src.slice(this.#pos)}
  remAt(pos) {return this.#src.slice(a.reqNat(pos))}

  clone() {
    return new this.constructor()
      .setSrc(this.#src)
      .setPos(this.#pos)
      .setLen(this.#len)
  }

  setFrom(src) {
    a.reqInst(src, Span)
    return this.setSrc(src.ownSrc()).setPos(src.ownPos()).setLen(src.ownLen())
  }

  setRange(begin, end) {
    const beginSrc = begin.ownSrc()
    const endSrc = end.ownSrc()

    // TODO: consider including a preview of the two sources.
    if (beginSrc !== endSrc) {
      throw Error(`unable to create range from spans ${a.show(begin)} and ${a.show(end)} with mismatching source`)
    }

    /*
    Minor cautionary note. We must read all properties before we start writing
    any properties because one of the provided spans may be the current span.
    Writing before reading would produce an inconsistent state.
    */
    const beginPos = begin.ownPos()
    const nextPos = end.nextPos()

    return this.setSrc(beginSrc).setPos(beginPos).setLen(nextPos - beginPos)
  }

  static optRange(begin, end) {
    return a.isSome(begin) && a.isSome(end) ? new this().setRange(begin, end) : undefined
  }

  [ji.symInsp](tar) {
    return tar.funs(this.decompile, this.ownPos, this.ownLen)
  }
}

export class StrSpan extends jpa.MixPathed.goc(Span) {
  setSrc(val) {return super.setSrc(a.reqStr(val))}
  rowCol() {return new jrc.RowCol().fromUtf16(this.ownSrc(), this.ownPos())}

  /*
  This uses the format `path:row:col` which is well-known and supported by
  various external tools such as terminals and code editors. Examples:

    some/path:123:456
    /some/path:123:456
    file:///some/path:123:456

  TODO:

    * Consider including preceding code (requires highlighting).
    * Consider indentation.
    * Consider colors.
    * Consider highlighting specific region with carets.
  */
  context() {
    const rowCol = this.rowCol()
    const preview = jm.preview(this.rem())

    return jm.joinParagraphs(
      a.laxStr(this.optPath()) + `:` + rowCol.strShort(),
      preview,
    )
  }
}

export class ReprStrSpan extends jre.MixRepr.goc(StrSpan) {
  // Override for `MixRepr`.
  compileRepr() {
    let out = a.reqStr(super.compileRepr())

    const pat = this.optReprPathName()
    if (pat) out += `.setPath(${pat})`

    const src = this.reqReprSrcName()
    if (src) out += `.setSrc(${src})`

    const pos = this.ownPos()
    if (pos) out += `.setPos(${pos})`

    const len = this.ownLen()
    if (len) out += `.setLen(${len})`

    return out
  }

  // Must be set by callers such as `Node`.
  #reprPathName = undefined
  setReprPathName(val) {return this.#reprPathName = this.req(val, a.isValidStr), this}
  optReprPathName() {return this.#reprPathName}
  reqReprPathName() {return this.optReprPathName() ?? this.throw(`missing name of path string at ${a.show(this)}`)}

  // Must be set by callers such as `Node`.
  #reprSrcName = undefined
  setReprSrcName(val) {return this.#reprSrcName = this.req(val, a.isValidStr), this}
  optReprSrcName() {return this.#reprSrcName}
  reqReprSrcName() {return this.optReprSrcName() ?? this.throw(`missing name of source string at ${a.show(this)}`)}

  static {this.setReprModuleUrl(import.meta.url)}
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

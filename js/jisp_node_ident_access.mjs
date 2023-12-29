import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jp from './jisp_parent.mjs'
import * as jni from './jisp_node_ident.mjs'

/*
Represents an expression like `.someIdent` combined with a preceding source
expression. The dot-access syntax is identical in Jisp and JS. When tokenizing,
the resulting token is just the dot-ident, without the preceding source
expression. When lexing, this node takes over the preceding source expression,
if any, becoming its parent.

TODO generalize. Currently this supports only the following style:

  .someProperty

At the time of writing, JS has the following:

  .someProperty
  ?.someProperty
  [`someProperty`]
  ?.[`someProperty`]

This class may be extended to support `?.`. The "square brackets" version
requires a different class, because square brackets are useful when the "key"
is an arbitrary expression, not a hardcoded identifier.
*/
export class IdentAccess extends jp.MixParentOneToOne.goc(jni.Ident) {
  /*
  Used by `Ident..parse`, which is called by the tokenizer. We parse text like
  `.someIdent` as its own atomic token. We combine it with the preceding
  expression when lexing, see below.
  */
  static regexp() {return this.regexpIdentAccess()}

  /*
  Should be called by the lexer. Should `IdentAccess` with the preceding
  expression. This is right-associative, which is arguably somewhat heretical
  as far as Lisp syntax is concerned.
  */
  static lexNext(lex, prev) {
    const span = lex.reqSpan()

    /*
    This skipping is a symptom that our lexing interface is imperfect.
    Ideally, we would reorder nodes, moving cosmetic nodes to just before
    this expression.
    */
    span.skipWhile(jm.isCosmetic)

    const next = span.optHead()
    if (!a.isInst(next, this)) return prev

    span.skip(1)
    next.setChild(prev)

    return this.lexNext(lex, next)
  }

  // Override for `MixNamed`.
  optName() {return a.stripPre(this.decompileOwn(), this.separator())}

  decompileOwn() {return super.decompile()}

  // Override for `Node`.
  decompile() {
    return (
      a.laxStr(this.optFirstChild()?.decompile()) +
      a.reqStr(this.decompileOwn())
    )
  }

  /*
  TODO consistent naming scheme for spans generated from combining expressions.
  It would be simpler to just override `.optSpan` or replace `.ownSpan`, but we
  ALSO need access to the original `.ownSpan`.
  */
  optSpanRange() {
    const spanSrc = this.optFirstChild()?.optSpan()
    const spanOwn = this.ownSpan()
    if (spanSrc && spanOwn) return this.Span.range(spanSrc, spanOwn)
    return spanOwn
  }

  // Override for `Ident..optResolveLiveVal`.
  optResolveLiveVal() {
    return this.optDerefLiveVal(this.optResolveLiveValSrc())
  }

  // Override for `Ident..optResolveLiveValSrc`.
  optResolveLiveValSrc() {
    return (
      this.optFirstChild()
      ? this.optResolveLiveValSrcFromChild()
      : this.reqResolveLiveValSrcFromAnc()
    )
  }

  optResolveLiveValSrcFromChild() {
    return this.optFirstChild()?.asOnlyInst(jni.Ident)?.optResolveLiveVal()
  }

  optResolveLiveValSrcFromAnc() {
    const key = this.optName()
    if (!key) return undefined
    return this.optParent()?.optAncFind(function test(val) {return key in val})
  }

  // Override for `Ident..reqResolveLiveVal`.
  reqResolveLiveVal() {return this.reqDerefLiveVal(this.reqResolveLiveValSrc())}

  // Override for `Ident..reqResolveLiveValSrc`.
  reqResolveLiveValSrc() {
    return (
      this.optFirstChild()
      ? this.reqResolveLiveValSrcFromChild()
      : this.reqResolveLiveValSrcFromAnc()
    )
  }

  reqResolveLiveValSrcFromChild() {
    return this.reqFirstChild().asReqInst(jni.Ident).reqResolveLiveVal()
  }

  reqResolveLiveValSrcFromAnc() {
    const key = this.reqName()
    return (
      this.optResolveLiveValSrcFromAnc() ??
      this.throw(`unable to find ancestor with property ${a.show(key)} at descendant ${a.show(this)}`)
    )
  }

  macroImpl() {
    const val = this.optResolveLiveVal()
    if (a.isSome(val)) return this.macroWithLiveVal(val)
    this.setChild(this.constructor.macroNodeSync(this.reqFirstChild()))
    return this
  }

  compile() {
    return (
      a.reqStr(this.reqFirstChild().compile()) +
      a.reqStr(this.decompileOwn())
    )
  }

  [ji.symInsp](tar) {return super[ji.symInsp](tar).funs(this.optFirstChild)}
}

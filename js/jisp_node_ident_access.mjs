import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jp from './jisp_parent.mjs'
import * as jni from './jisp_node_ident.mjs'

/*
Represents an expression like `.someIdent` combined with a preceding source
expression. The dot-access syntax is identical in Jisp and JS. When tokenizing,
the resulting token is just the dot-ident, without the preceding source
expression. When lexing, we combine this with the preceding source expression,
and this becomes its parent.

TODO generalize. Currently this supports only access via dot operator with
hardcoded identifier. In a more general case, the "key" could be an arbitrary
expression, and compiled code may need to use square brackets. When the key
expression is not a hardcoded identifier, this precludes us from compile-time
lookup, but is otherwise valid. Due to syntactic and semantic differences, that
probably requires a different class.
*/
export class IdentAccess extends jp.MixParentOneToOne.goc(jni.Ident) {
  // Allows the tokenizer to parse text like `.someIdent` into this, but without
  // the preceding source expression.
  static regexp() {return this.regexpIdentAccess()}

  static lexNext(lex, prev) {
    const span = lex.reqSpan()

    // This skipping is a symptom that our lexing interface is imperfect.
    // Ideally, we would reorder nodes, moving cosmetic nodes to just before
    // this expression.
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
  optResolveLiveVal() {return this.optDerefLiveVal(this.optResolveLiveValSrc())}

  // Override for `Ident..optResolveLiveValSrc`.
  optResolveLiveValSrc() {
    return this.optFirstChild()?.asOnlyInst(jni.Ident)?.optResolveLiveVal()
  }

  // Override for `Ident..reqResolveLiveVal`.
  reqResolveLiveVal() {return this.reqDerefLiveVal(this.reqResolveLiveValSrc())}

  // Override for `Ident..reqResolveLiveValSrc`.
  reqResolveLiveValSrc() {
    return this.reqFirstChild().asReqInst(jni.Ident).reqResolveLiveVal()
  }

  macroImpl() {
    const chi = this.reqFirstChild()
    const val = jm.optResolveLiveValCall(chi)

    if (a.isSome(val)) {
      return this.macroWithLiveVal(this.reqDerefLiveVal(val))
    }

    this.setChild(this.constructor.macroNode(this.reqFirstChild()))
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

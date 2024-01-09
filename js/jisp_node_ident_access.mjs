import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jpn from './jisp_parent_node.mjs'
import * as jn from './jisp_node.mjs'
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

In the future, this class may be extended / subclassed to support `?.`.
The "square brackets" version requires a different class, because square
brackets are useful when the "key" is an arbitrary expression, not a hardcoded
identifier.
*/
export class IdentAccess extends jpn.MixParentNodeOneToOne.goc(jni.Ident) {
  /*
  Used by `Ident..parse`, which is called by the tokenizer. We parse text like
  `.someIdent` as its own atomic token. We combine it with the preceding
  expression when lexing, see below.
  */
  static regexp() {return this.regexpIdentAccess()}

  /*
  Should be called by the lexer. Should `IdentAccess` with the preceding
  expression. This is right-associative, which is arguably somewhat heretical
  in a Lispy syntax.
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
  optName() {return a.stripPre(this.optDecompileOwn(), this.constructor.separator())}

  macro() {
    const chi = this.optFirstChild()
    if (a.isNil(chi)) return this.macroOrphan()

    const src = this.optResolveLiveValFromChild()
    if (a.isSome(src)) return this.macroWithLiveValSrc(src)

    return this.setChild(jn.macroNodeSync(chi))
  }

  /*
  TODO better naming. This is used when the current node doesn't have a child,
  which is the exact opposite of having no parent, which is the meaning of the
  term "orphan".
  */
  macroOrphan() {
    return this.macroWithLiveValSrc(this.reqResolveLiveValFromAnc())
  }

  compile() {
    return (
      ``
      + jn.reqCompileNode(this.reqFirstChild())
      + a.reqStr(this.reqDecompileOwn())
    )
  }

  // Override for `Node`.
  decompile() {
    return this.optDecompileSrcNode() ?? (
      a.laxStr(this.optFirstChild()?.decompile()) +
      a.reqStr(this.reqDecompileOwn())
    )
  }

  /*
  Unused, TODO drop.

  TODO consistent naming scheme for spans generated from combining expressions.
  It would be simpler to just override `.optSpan` or replace `.ownSpan`, but we
  ALSO need access to the original `.ownSpan`.
  */
  optSpanRange() {
    const spanOwn = this.ownSpan()
    if (!spanOwn) return undefined

    const spanSrc = this.optFirstChild()?.optSpan()
    if (!spanSrc) return spanOwn

    return this.Span.range(spanSrc, spanOwn)
  }

  /*
  Override for `Ident..optLiveVal`. This override changes where we resolve the
  name. The base method is meant for unqualified identifiers, which are always
  resolved from lexical namespaces. In contrast, qualified identifiers are
  never resolved from lexical namespaces.
  */
  optLiveVal() {return this.optDerefLiveVal(this.optLiveValSrc())}

  // Override for `Ident..optLiveValSrc`. See the comment on `.optLiveVal`.
  optLiveValSrc() {
    return (
      this.optFirstChild()
      ? this.optResolveLiveValFromChild()
      : this.reqResolveLiveValFromAnc()
    )
  }

  optResolveLiveValFromChild() {
    return this.optFirstChild()?.asOnlyInst(jni.Ident)?.optLiveVal()
  }

  optResolveLiveValFromAnc() {
    const key = this.optName()
    if (!key) return undefined

    return this.optParent()?.optAncProcure(function optResolveLiveVal(val) {
      /*
      This questionable special case prevents infinite recursion when an orphan
      `IdentAccess` is a child of another `IdentAccess`, like this:

        [.inner.outer]

      TODO more general solution.
      */
      if (a.isInst(val, jni.Ident)) return undefined

      val = jm.optLiveValInnerCall(val)
      if (a.isComp(val) && key in val) return val

      return undefined
    })
  }

  // Override for `Ident..reqLiveVal`. See the comment on `.optLiveVal`.
  reqLiveVal() {return this.reqDerefLiveVal(this.reqLiveValSrc())}

  // Override for `Ident..reqLiveValSrc`. See the comment on `.optLiveVal`.
  reqLiveValSrc() {
    return (
      this.optFirstChild()
      ? this.reqResolveLiveValFromChild()
      : this.reqResolveLiveValFromAnc()
    )
  }

  reqResolveLiveValFromChild() {
    return this.reqFirstChild().asReqInst(jni.Ident).reqLiveVal()
  }

  reqResolveLiveValFromAnc() {
    const key = this.reqName()
    return (
      this.optResolveLiveValFromAnc() ??
      this.throw(`unable to find ancestral live value with property ${a.show(key)} at descendant ${a.show(this)}`)
    )
  }

  static moduleUrl = import.meta.url
}

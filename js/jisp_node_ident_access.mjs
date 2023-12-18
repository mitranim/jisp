import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jp from './jisp_parent.mjs'
import * as jn from './jisp_node.mjs'
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

  /*
  FIXME:

    * The source expression may resolve to a declaration.

    * The source declaration may provide no further information.

    * The source declaration may dereference to a "live value". We may inspect
      that value to determine if the given identifier is present as a property.
      We may also obtain a property value for the purpose of compile-time
      execution, node replacement, macroing. This must happen for declarations
      created by `Use`.

    * The source declaration may provide a way to validate presence of
      identifiers / properties / fields without obtaining live values, whether
      or not it's secretly backed by a live value. This would be a primitive
      form of static analysis. In a more general case, it could provide
      comprehensive type information for the value that the source expression
      would have at runtime, but which does not exist at compile time. This may
      happen for declarations created by `Import`.

  FIXME (outdated):

    * Each name may resolve to compile-time val.
      * Unqual name may resolve to native module val.
      * Qual name may resolve to something inside module.
      * We may evaluate this at compile time for sanity checking.
      * Even when declarations are unavailable, or especially when declarations
        are unavailable, we may dynamically inspect the _runtime_ values of
        objects addressed by a path at _compile time_, and sanity-check them.
  */
  optDecl() {
    // const name = this.optName()
    // if (!name) return undefined
    // return this.reqFirstChild().optDecl()?.optDeref()?.optScope()?.optPubNs()?.resolve(name)
  }

  macroImpl() {
    // FIXME revise.
    const decl = this.optDecl()
    if (decl?.isMacroBare()) return decl.macroNode(this)

    this.setChild(jn.Node.macroNode(this.reqFirstChild()))

    return this
  }

  compile() {
    return (
      a.reqStr(this.reqFirstChild().compile()) +
      a.reqStr(this.decompileOwn())
    )
  }

  [ji.symInsp](tar) {
    return super[ji.symInsp](tar).funs(this.optFirstChild, this.ownName)
  }
}

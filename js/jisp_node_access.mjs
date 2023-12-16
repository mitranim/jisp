import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jp from './jisp_parent.mjs'
import * as jn from './jisp_node.mjs'
import * as jni from './jisp_node_ident.mjs'
import * as jnk from './jisp_node_key.mjs'

/*
Combines an arbitrary expression with a subsequent `.key` expression, unifying
them into one. Supports finding declarations in namespaces.

FIXME convert this to abstract base class for `Key` and other "access" style
nodes. Instead of `Access` having two expressions, it will become just an outer
key-reading expression that has an inner source expression.
*/
export class Access extends jp.MixParent.goc(jni.Ident) {
  static lexNext(lex, prev) {
    const span = lex.reqSpan()
    span.skipMeaningless()

    const next = span.optHead()
    if (!a.isInst(next, jnk.Key)) return prev
    span.inc()

    const tar = new this().setExpr(prev).setKey(next)
    tar.setSpan(tar.Span.range(prev.reqSpan(), next.reqSpan()))

    return this.lexNext(lex, tar)
  }

  #expr = undefined
  ownExpr() {return this.#expr}
  optExpr() {return this.#expr}
  setExpr(val) {return this.#expr = this.reqInst(val, jn.Node).setParent(this), this}
  reqExpr() {return this.optExpr() ?? this.throw(`missing left-side expression at ${a.show(this)}`)}

  #key = undefined
  ownKey() {return this.#key}
  optKey() {return this.#key}
  setKey(val) {return this.#key = this.reqInst(val, jnk.Key).setParent(this), this}
  reqKey() {return this.optKey() ?? this.throw(`missing right-side key at ${a.show(this)}`)}

  /*
  FIXME:

    * Each name may resolve to compile-time val.
      * Unqual name may resolve to native module val.
      * Qual name may resolve to something inside module.
      * We may evaluate this at compile time for sanity checking.
      * Even when declarations are unavailable, or especially when declarations
        are unavailable, we may dynamically inspect the _runtime_ values of
        objects addressed by a path at _compile time_, and sanity-check them.
  */
  optDecl() {
    return this.reqExpr().optDecl()?.optDeref()?.optScope()?.optPubNs()?.resolveNode(this.reqKey())
  }

  macroImpl() {
    this.setExpr(jn.Node.macroNode(this.reqExpr()))
    const decl = this.optDecl()
    if (decl?.isMacroBare()) return decl.macroNode(this)
    return this
  }

  compile() {
    const prn = this.reqCodePrinter()
    return (
      a.reqStr(prn.compile(this.reqExpr())) +
      a.reqStr(prn.compile(this.reqKey()))
    )
  }

  [ji.symInsp](tar) {
    return super[ji.symInsp](tar).funs(this.ownExpr, this.ownKey)
  }
}

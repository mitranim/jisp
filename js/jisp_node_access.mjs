import * as a from '/Users/m/code/m/js/all.mjs'
import * as jp from './jisp_parent.mjs'
import * as jn from './jisp_node.mjs'
import * as jni from './jisp_node_ident.mjs'

/*
Combines an arbitrary expression with a subsequent `.key` expression, unifying
them into one. Supports finding definitions in namespaces.
*/
export class Access extends jp.MixParent.goc(jni.Ident) {
  static lexNext(lex, prev) {
    const span = lex.reqSpan()
    span.skipMeaningless()

    const next = span.optHead()
    if (!a.isInst(next, Key)) return prev
    span.inc()

    return this.lexNext(
      lex,
      new this()
        .setExpr(prev)
        .setKey(next)
        .setSpan(this.Span.range(
          prev.reqSpan(),
          next.reqSpan(),
        ),
    ))
  }

  #expr = undefined
  ownExpr() {return this.#expr}
  optExpr() {return this.#expr}
  setExpr(val) {return this.#expr = this.toValidChild(this.reqInst(val, jn.Node)), this}
  reqExpr() {return this.optExpr() ?? this.throw(`missing left-side expression at ${a.show(this)}`)}

  #key = undefined
  ownKey() {return this.#key}
  optKey() {return this.#key}
  setKey(val) {return this.#key = this.toValidChild(this.reqInst(val, Key)), this}
  reqKey() {return this.optKey() ?? this.throw(`missing right-side key at ${a.show(this)}`)}

  /*
  FIXME:

    * Each name may resolve to compile-time val.
      * Unqual name may resolve to native module val.
      * Qual name may resolve to something inside module.
      * We may evaluate this at compile time for sanity checking.
      * Even when definitions are unavailable, or especially when definitions
        are unavailable, we may dynamically inspect the _runtime_ values of
        objects addressed by a path at _compile time_, and sanity-check them.
  */
  optDef() {
    return this.reqExpr().optDef()?.optDeref()?.optScope()?.optPubNs()?.resolveNode(this.reqKey())
  }

  macroImpl() {
    this.setExpr(jn.Node.macroNode(this.reqExpr()))
    const def = this.optDef()
    if (def?.isMacroBare()) return def.macroNode(this)
    return this
  }

  compile() {
    const prn = this.reqCodePrinter()
    return (
      a.reqStr(prn.compile(this.reqExpr())) +
      a.reqStr(prn.compile(this.reqKey()))
    )
  }

  [ji.symInspMod](tar) {
    return super[ji.symInspMod](tar).funs(this.ownExpr, this.ownKey)
  }
}

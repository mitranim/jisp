import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as je from './jisp_err.mjs'
import * as jr from './jisp_ref.mjs'
import * as ji from './jisp_insp.mjs'
import * as jch from './jisp_child.mjs'
import * as jsp from './jisp_span.mjs'
import * as jsn from './jisp_spanned.mjs'
import * as jns from './jisp_node_sourced.mjs'
import * as jcp from './jisp_code_printed.mjs'
import * as jsc from './jisp_scoped.mjs'

/*
Base class for all AST nodes.

----

Before macro replacement, parent-child relation is bilateral:

             parent
  role=child ↓    ↑ role=parent
             child0

After macro replacement:

  * The parent acquires a new child, bilaterally.
  * The old child unilaterally remembers the parent.
  * The new child unilaterally remembers the old child.

             parent
  role=child ↓    ↑ role=parent
             child1

             parent
                  ↑ role=parent
             child0

             child1 → child0
                role=src

Note: while the AST relations are by definition cyclic, parent→child relations
must avoid cycles, forming a tree. At the time of writing, `MixChild` and
`MixOwnNodeSourced` prevent cycles. If we add more common interfaces between
nodes, they must prevent cycles too.
*/
export class Node extends jsc.MixScoped.goc(jr.MixRef.goc(jcp.MixCodePrinted.goc(
  jns.MixOwnNodeSourced.goc(jsn.MixOwnSpanned.goc(jch.MixChild.goc(ji.MixInsp.goc(a.Emp))))
))) {
  // For `MixOwnSpanned`.
  static get Span() {return jsp.StrSpan}
  optSpan() {return super.optSpan() || this.optSrcNode()?.optSpan()}

  fromNode(src) {
    this.setParent(src.reqParent())
    this.setSrcNode(src)
    return this
  }

  err(msg, cause) {return new je.CodeErr({msg, span: this.optSpan(), cause})}

  toErr(err) {
    if (a.isInst(err, je.CodeErr) || !this.optSpan()) return err
    return this.err(jm.renderErrLax(err), err)
  }

  // FIXME implement or move.
  isExpression() {return false}
  isStatement() {return !this.isExpression()}
  isInModuleRoot() {return false}
  isExportable() {return this.isStatement() && this.isInModuleRoot()}
  isCalled() {return false}

  /*
  Defines the current node in the lexical namespace of the nearest available
  parent scope. The node must implement method `.pk`, which must return a local
  identifier string. Method `.pk` must be implemented by `UnqualName` and all
  node subclasses that represent a named declaration such as `Const` or `Fn`.
  For other node classes, this should cause an exception.

  Explicitly uses parent's scope because some macro nodes, such as `Fn`, define
  their own scope. If we didn't use the parent here, the default behavior would
  be to add the definition to own scope, not to parent scope, and the
  definition would be unknown/unavailable to sibling nodes, breaking a lot of
  code. Macro nodes may override this behavior. For example, when `Fn` is used
  as an expression, it should add itself to own scope, but NOT to parent
  scope.

  TODO consider "optX" version.
  TODO consider renaming to "reqX".

  FIXME: add combined versions:

    * "req lex", "opt pub". Use this by default.
  */
  defineLex() {return this.defineIn(this.reqParent().reqScope().reqLexNs())}

  // TODO consider "optX" version.
  // TODO consider renaming to "reqX".
  definePub() {return this.defineIn(this.reqParent().reqScope().reqPubNs())}

  defineIn(nsp) {
    a.reqInst(nsp, Ns)
    const def = new NodeDef().setSrcNode(this)
    try {nsp.add(def)}
    catch (err) {throw this.err(`unable to register definition with name ${a.show(def?.pk())}`, err)}
    return def
  }

  optDef() {}
  reqDef() {return this.optDef() ?? this.throw(`missing definition at ${a.show(this)}`)}

  macro() {
    try {
      const val = this.macroImpl()
      if (a.isPromise(val)) return this.errFromAsync(val)
      return val
    }
    catch (err) {throw this.toErr(err)}
  }

  // Override in subclass.
  macroImpl() {throw jm.errMeth(`macroImpl`, this)}

  async errFromAsync(val) {
    try {return await val}
    catch (err) {throw this.toErr(err)}
  }

  compile() {throw jm.errMeth(`compile`, this)}

  decompile() {
    return a.laxStr(
      this.optSrcNode()?.decompile() ??
      this.optSpan()?.decompile()
    )
  }

  // Override in subclass.
  // Must take an instance of `StrSpan` and advance its position.
  static parse() {throw jm.errMeth(`parse`, this)}

  static macroNode(node) {
    while (node) {
      const next = node.macro()
      if (node === next) break
      node = this.replace(node, next)
    }
    return node
  }

  static async macroNodeAsync(node) {
    while (node) {
      let next = node.macro()
      if (a.isPromise(next)) next = await next
      if (node === next) break
      node = this.replace(node, next)
    }
    return node
  }

  static replace(node, next) {
    next = (next ?? new Empty()).fromNode(node)
    node.setParent(next)
    return next
  }

  // Some node types may override this to indicate that they may be safely
  // elided from the AST when tokenizing or lexing.
  isCosmetic() {return false}

  [ji.symInspMod](tar) {return tar.funs(this.optSpan)}
}

import * as a from '/Users/m/code/m/js/all.mjs'
import * as jns from './jisp_node_sourced.mjs'
import * as jd from './jisp_def.mjs'

/*
Variant of `Def` used for definitions generated from AST nodes, mostly by macros
that add identifiers to scope, such as `Use`, `Const`, `Fn`.

The use of `MixOwnNodeSourced` is tentative here. We may reserve that mixin for
nodes replacing other nodes in the macroexpansion process. A `NodeDef`
currently does not replace the node responsible for it. However, SOME way of
setting the source node is mandatory. An instance of `NodeDef` added to a scope
must ALWAYS have a source node, and its methods should assert this.
*/
export class NodeDef extends jns.MixOwnNodeSourced.goc(jd.Def) {
  // For `Def..pk`.
  ownName() {return super.ownName() ?? a.pk(this.reqSrcNode())}

  // Override for `MixRef`. Allows tracing definitions back to sources.
  ownDeref() {return this.reqSrcNode()}

  // Override for `MixValued`.
  optVal() {return a.onlyFun(optVal(this.reqSrcNode()))}

  macroNode(node) {
    const fun = this.optVal()
    if (fun) return this.macroNodeWith(node, fun)
    throw node.err(`unable to execute macro ${a.show(this.ownName())}: definition not yet evaluated; tip: for technical reasons, macros can be used only by other modules, for example module "A" defines macro "B" and module "C" uses "A.B"`)
  }
}

function optVal(src) {
  return a.isObj(src) && `optVal` in src ? src.optVal() : undefined
}

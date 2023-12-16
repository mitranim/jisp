import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jr from './jisp_ref.mjs'
import * as jv from './jisp_valued.mjs'
import * as jnd from './jisp_named.mjs'
import * as jch from './jisp_child.mjs'
import * as jco from './jisp_call_opt.mjs'
import * as jns from './jisp_ns.mjs'
import * as jnsd from './jisp_node_sourced.mjs'
import * as jnun from './jisp_node_unqual_name.mjs'

/*
TODO rename this and similarly-named classes to "decl". The term "definition"
tends to refer to complete definitions, while the term "declaration" may
describe incomplete definitions, like declaring a function's type signature but
not the body. We may choose to support forward declarations, which would be
similar to the latter.

FIXME: must be child of `Ns`.
*/
export class Def extends (
  jr.MixRef.goc(jv.MixValued.goc(jnd.MixOwnNamed.goc(jch.MixChild.goc(jco.CallOpt))))
) {
  #uses = undefined
  ownUses() {return this.#uses ??= new jnun.UnqualNameSet()}
  addUse(val) {return this.ownUses().add(val), this}

  pk() {return this.ownName()}
  reqValidParent(val) {return super.reqValidParent(a.reqInst(val, jns.Ns))}

  // Must override in subclass. Must return a function or class.
  ownVal() {throw jm.errMeth(`ownVal`, this)}

  /*
  TODO: JS reserved words must be detected contextually, only when used as bare
  names. They are allowed as method names and property names (i.e. `Key`).

  TODO: implement automatic renaming. Possible causes:

    * Avoiding conflicts with JS reserved words.
    * Module merging.
  */
  compileName(node) {
    const name = this.ownName()
    if (jnun.UnqualName.isJsReservedWord(name)) {
      throw node.err(`${a.show(name)} is a reserved keyword in JS; this would generate invalid JS that doesn't run; please rename`)
    }
    return name
  }

  [ji.symInsp](tar) {return super[ji.symInsp](tar.funs(this.ownName))}
}

export class FunDef extends jv.MixOwnValued.goc(Def) {
  setVal(val) {return super.setVal(this.req(val, a.isFun))}
  macroNode(node) {return this.macroNodeWith(node, this.ownVal())}
}

/*
Variant of `Def` used for definitions generated from AST nodes, mostly by macros
that add identifiers to scope, such as `Use`, `Const`, `Fn`.

The use of `MixOwnNodeSourced` is tentative here. We may reserve that mixin for
nodes replacing other nodes in the macroexpansion process. A `NodeDef`
currently does not replace the node responsible for it. However, SOME way of
setting the source node is mandatory. An instance of `NodeDef` added to a scope
must ALWAYS have a source node, and its methods should assert this.

TODO `.setSrcNode` should validate that the node defines valid `.pk`.
*/
export class NodeDef extends jnsd.MixOwnNodeSourced.goc(Def) {
  pk() {return this.ownName() ?? a.pk(this.reqSrcNode())}

  // Override for `MixRef`. Allows tracing definitions back to sources.
  ownDeref() {return this.reqSrcNode()}

  // Override for `MixValued`.
  optVal() {return a.onlyFun(optVal(this.reqSrcNode()))}

  macroNode(node) {
    const fun = this.optVal()
    if (fun) return this.macroNodeWith(node, fun)
    throw node.err(`unable to execute macro ${a.show(this.pk())}: definition not yet evaluated; tip: for technical reasons, macros can be used only by other modules, for example module "A" defines macro "B" and module "C" uses "A.B"`)
  }
}

function optVal(src) {
  return a.isObj(src) && `optVal` in src ? src.optVal() : undefined
}

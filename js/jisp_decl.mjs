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
Base class for declarations. Should typically belong to a namespace (`Ns`).
Declarations may be either lexical (local variables), or public (properties
of a module object, class, class instance, etc.).
*/
export class Decl extends (
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

export class FunDecl extends jv.MixOwnValued.goc(Decl) {
  setVal(val) {return super.setVal(this.req(val, a.isFun))}
  macroNode(node) {return this.macroNodeWith(node, this.ownVal())}
}

/*
Variant of `Decl` used for declarations generated from AST nodes, mostly by
macros that add identifiers to scope, such as `Use`, `Const`, `Fn`.

The use of `MixOwnNodeSourced` is tentative here. We may reserve that mixin for
nodes replacing other nodes in the macroexpansion process. A `NodeDecl`
currently does not replace the node responsible for it. However, SOME way of
setting the source node is mandatory. An instance of `NodeDecl` added to a
scope must ALWAYS have a source node, and its methods should assert this.

TODO `.setSrcNode` should validate that the node defines valid `.pk`.

Placed in the same file as `Decl` because otherwise we have module initialization
exceptions due to cyclic dependencies between modules.
*/
export class NodeDecl extends jnsd.MixOwnNodeSourced.goc(Decl) {
  pk() {return this.ownName() ?? a.pk(this.reqSrcNode())}

  // Override for `MixRef`. Allows tracing declarations back to sources.
  ownDeref() {return this.reqSrcNode()}

  // Override for `MixValued`.
  optVal() {return a.onlyFun(optVal(this.reqSrcNode()))}

  // FIXME deprecated.
  macroNode(node) {
    const fun = this.optVal()
    if (fun) return this.macroNodeWith(node, fun)
    throw node.err(`unable to execute macro ${a.show(this.pk())}: declaration not yet evaluated; tip: for technical reasons, macros can be used only by other modules, for example module "A" defines macro "B" and module "C" uses "A.B"`)
  }
}

function optVal(src) {
  return a.isObj(src) && `optVal` in src ? src.optVal() : undefined
}

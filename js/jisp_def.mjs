import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jr from './jisp_ref.mjs'
import * as jv from './jisp_valued.mjs'
import * as jna from './jisp_named.mjs'
import * as jch from './jisp_child.mjs'
import * as jco from './jisp_call_opt.mjs'
import * as jnun from './jisp_node_unqual_name.mjs'

/*
TODO rename this and similarly-named classes to "decl". The term "definition"
tends to refer to complete definitions, while the term "declaration" may
describe incomplete definitions, like declaring a function's type signature but
not the body. We may choose to support forward declarations, which would be
similar to the latter.
*/
export class Def extends (
  jr.MixRef.goc(jv.MixValued.goc(jna.MixOwnNamed.goc(jch.MixChild.goc(jco.CallOpt))))
) {
  #uses = undefined
  ownUses() {return this.#uses ??= new jnun.UnqualNameSet()}
  addUse(val) {return this.ownUses().add(val), this}

  pk() {return this.ownName()}
  setParent(val) {return super.setParent(a.reqInst(val, Ns))}

  // Must override in subclass. Must return a function or class.
  ownVal() {throw errMeth(`ownVal`, this)}

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

  [ji.symInspMod](tar) {return super[ji.symInspMod](tar.funs(this.ownName))}
}

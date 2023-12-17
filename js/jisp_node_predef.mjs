import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jn from './jisp_node.mjs'
import * as jco from './jisp_call_opt.mjs'
import * as jd from './jisp_decl.mjs'

/*
Common superclass for predeclared-identifier classes and macro classes.

TODO better name.

FIXME consolidate with `Predecl`.

FIXME simplify due to removal of `CallOpt`. Consolidate with how the prelude
is used by `Use` / `Ident` / `IdentAccess`, and other similar cases.
*/
export class Predef extends jn.Node {
  static getSrcName() {throw jm.errMeth(`getSrcName`, this)}
  getSrcName() {return this.constructor.getSrcName()}

  static decl() {
    return new jd.FunDecl()
      .setName(this.getSrcName())
      .setCallStyle(jco.CallStyle.bare)
      .setCallTime(jco.CallTime.macro)
      .setCallSyntax(jco.CallSyntax.new)
      .setCallOut(jco.CallOut.ast)
      .setVal(this)
  }
}

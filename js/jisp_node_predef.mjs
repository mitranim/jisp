import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jn from './jisp_node.mjs'
import * as jco from './jisp_call_opt.mjs'
import * as jfd from './jisp_fun_def.mjs'

// Common superclass for predeclared-identifier classes and macro classes.
// TODO better name.
export class Predef extends jn.Node {
  static getSrcName() {throw jm.errMeth(`getSrcName`, this)}

  static def() {
    return new jfd.FunDef()
      .setName(this.getSrcName())
      .setCallStyle(jco.CallStyle.bare)
      .setCallTime(jco.CallTime.macro)
      .setCallSyntax(jco.CallSyntax.new)
      .setCallOut(jco.CallOut.ast)
      .setVal(this)
  }

  getSrcName() {return this.constructor.getSrcName()}
}

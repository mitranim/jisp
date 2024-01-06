import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnc from './jisp_node_const.mjs'

export class Let extends jnc.Const {
  optVal() {return this.optChildAt(2)}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(2, 3)
    this.reqIdent().reqCanDeclare()
    this.reqDeclareLex()
    return this.macroFrom(2)
  }

  compile() {
    this.reqStatement()
    if (this.optVal()) return this.compileAssign()
    return this.compileDeclare()
  }

  compileAssign() {return super.compile()}

  compileDeclare() {
    return a.spaced(
      a.reqStr(this.compileExportPrefix()),
      a.reqStr(this.compilePrefix()),
      a.reqStr(this.compileName()),
    )
  }

  compilePrefix() {return `let`}
}

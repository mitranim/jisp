import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnc from './node_const.mjs'

export class Let extends jnc.Const {
  optVal() {return this.optChildAt(1)}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(1, 2)
    this.reqDeclareLex()
    return this.macroFrom(1)
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

  static {this.setReprModuleUrl(import.meta.url)}
}

import * as a from '/Users/m/code/m/js/all.mjs'
import * as jmo from './jisp_module.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jni from './jisp_node_ident.mjs'

export class DebugListMacro extends jnlm.ListMacro {
  log(msg, ...src) {
    console.log(`[${this.constructor.name}] ` + a.reqStr(msg), ...src)
  }

  compile() {
    this.reqStatement()
    return ``
  }
}

/*
Semi-placeholder. Needs improvements. When inspecting AST nodes, we should print
their original code context, and we should dereference them to declaration
sites and source nodes as much as possible, printing each step.
*/
export class Inspect extends DebugListMacro {
  reqVal() {return this.reqChildAt(1)}

  macro() {
    this.reqChildCount(2)
    const val = this.reqVal()
    this.inspect(val)
    return val
  }

  inspect(val) {
    this.log(`received input:`, val)
    if (a.isInst(val, jni.Ident)) this.inspectIdent(val)
  }

  inspectIdent(val) {
    const key = val.reqName()
    const nsp = val.optResolveNs()
    this.log(`identifier ${a.show(key)} is found in namespace:`, nsp)
    this.log(`identifier ${a.show(key)} resolves to declaration:`, nsp?.optGet(key))
    this.log(`identifier ${a.show(key)} resolves to live value:`, val.optLiveVal())
  }
}

export class Compiling extends DebugListMacro {
  optModule() {return this.optAncMatch(jmo.Module)}
  reqModule() {return this.reqAncMatch(jmo.Module)}

  macro() {
    this.log(`compiling module:`, a.pkOpt(this.optModule()))
    this.reqChildCount(1)
    return this
  }
}
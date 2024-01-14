import {a} from './dep.mjs'
import * as jnlm from './node_list_macro.mjs'
import * as jni from './node_ident.mjs'

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
sites as much as possible, printing each step.
*/
export class Inspected extends DebugListMacro {
  macro() {
    this.reqChildCount(1)
    const val = this.reqFirstChild()
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

export class Inspect extends Inspected {
  macro() {
    super.macro()
    return this
  }
}

export class Compiling extends DebugListMacro {
  macro() {
    this.log(`compiling module:`, a.pkOpt(this.optModule()))
    this.reqChildCount(0)
    return this
  }
}

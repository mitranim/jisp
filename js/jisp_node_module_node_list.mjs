import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as je from './jisp_err.mjs'
import * as jns from './jisp_ns.mjs'
import * as jl from './jisp_lexer.mjs'
import * as jnnl from './jisp_node_node_list.mjs'
import * as jnu from './jisp_node_use.mjs'

export class ModuleNodeList extends jns.MixOwnNsLexed.goc(jnnl.NodeList) {
  /*
  Override for `MixLiveValued`. Any live properties added here are contextually
  available to all code in all modules, by using the orphan form of
  `IdentAccess`. The typical use case is the following:

    [.use `jisp:prelude.mjs` *]
  */
  static makeLiveVal() {
    const tar = a.npo()
    tar.use = jnu.Use
    return tar
  }

  // This lacks a type assertion because it would involve cyclic imports.
  optModule() {return this.optParent()}
  reqModule() {return this.reqParent()}

  // Used by `.parse`. May override in subclass.
  get Lexer() {return jl.Lexer}

  parse(src) {
    this.initSpan().init(src)
    this.setChildren(...new this.Lexer().initFromStr(src))
    return this
  }

  /*
  Immediate children of a module typically begin with `Use`, whose macro
  implementation is async. As a result, module macroing is almost always
  asynchronous. We prefer synchronous macroing whenever possible, due to
  huge overheads of async/await, but we should also automatically switch
  into async mode when necessary. The super method `NodeList..macroFrom`
  should support both modes.
  */
  macro() {return this.macroFrom(0)}
  compile() {return this.reqPrn().compileStatements(this.childIter())}
  isChildStatement() {return true}

  /*
  Override for `Node..err` to avoid using `CodeErr`. A module span always points
  to `row:col = 1:1`, which is not very useful. More importantly, `Node..toErr`
  preserves instances of `CodeErr` as-is. Without this override, sometimes we
  would generate module-level `CodeErr` with `row:col = 1:1`, which would be
  preserved as-is by caller nodes which would otherwise generate a more specific
  `CodeErr` pointing to the actual relevant place in the code.
  */
  err(...val) {return new je.Err(...val)}

  [ji.symInsp](tar) {
    return super[ji.symInsp](tar.funs(this.optModule, this.optNsLex))
  }
}

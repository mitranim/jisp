import * as a from '/Users/m/code/m/js/all.mjs'
import * as je from './jisp_err.mjs'
import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jnf from './jisp_node_func.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'
import * as jnl from './jisp_node_let.mjs'
import * as jnb from './jisp_node_block.mjs'

/*
Macro that implements definition and compilation of JS classes.

Defining a class requires using contextual sub-macros, which are available on
this AST node as properties or methods. Descendant code can access them via the
orphan form of `IdentAccess`. Examples:

  [class SomeSubClass
    [.extend SomeSuperClass]
    [.func someMethod []]
    [.let someField someValue]
  ]
*/
export class Class extends jnlm.ListMacro {
  // Used by `a.pk` and `a.Coll`.
  pk() {return this.reqIdent().reqName()}
  reqIdent() {return this.reqChildInstAt(1, jniu.IdentUnqual)}

  // Override for `MixLiveValuedInner`. Provides access to contextual sub-macros.
  static makeLiveValInner() {
    const tar = a.npo()
    tar.static = ClassStatic
    tar.extend = ClassExtend
    tar.func = jnf.MethodFunc
    tar.let = ClassLet
    return tar
  }

  #extend = undefined
  setExtend(val) {return this.#extend = this.reqInst(val, ClassExtend), this}
  optExtend() {return this.#extend}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(2)
    this.reqIdent().reqCanDeclare()
    this.reqDeclareLex()
    return this.macroFrom(2)
  }

  // Override for `Node..reqDeclareLex`.
  reqDeclareLex() {return jnf.Func.prototype.reqDeclareLex.call(this)}

  compile() {
    return a.spaced(
      a.reqStr(this.compileExportPrefix()),
      a.reqStr(this.compilePrefix()),
      a.reqStr(this.compileName()),
      a.reqStr(this.compileExtend()),
      a.reqStr(this.compileBody()),
    )
  }

  compileExportPrefix() {return this.isExportable() ? `export` : ``}
  compilePrefix() {return `class`}
  compileName() {return jn.optCompileNode(this.reqIdent())}
  compileExtend() {return a.laxStr(this.optExtend()?.compileExtend())}
  compileBody() {return this.reqPrn().compileBracesWithStatements(this.optChildSlice(2))}
  isChildStatement() {return true}
}

export class ClassExtend extends jnlm.ListMacro {
  macro() {
    this.reqParentMatch(Class)
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(2)
    this.macroSyncFrom(1)
    this.reqAncFindInst(Class).setExtend(this)
    return this
  }

  compile() {
    this.reqStatement()
    return ``
  }

  compileExtend() {
    let prev = ``
    let ind = 0
    while (++ind < this.childCount()) {
      const next = jn.reqCompileNode(this.reqChildAt(ind))
      prev = prev ? (next + `(` + prev + `)`) : next
    }
    return a.optPre(prev, `extends `)
  }

  static reprModuleUrl = import.meta.url
}

export class ClassLetBase extends jnl.Let {
  macro() {
    this.reqParentMatch(Class)
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(2, 3)
    this.reqIdent()
    return this.macroFrom(2)
  }

  // Override for `Node..reqDeclareLex`.
  reqDeclareLex() {}

  static reprModuleUrl = import.meta.url
}

export class ClassLet extends ClassLetBase {
  compilePrefix() {return ``}
  static reprModuleUrl = import.meta.url
}

export class ClassLetStatic extends ClassLetBase {
  compilePrefix() {return `static`}
  static reprModuleUrl = import.meta.url
}

export class ClassStatic extends jnb.Block {
  static get func() {return jnf.MethodFuncStatic}
  static get let() {return ClassLetStatic}

  macro() {
    this.reqParentMatch(Class)
    return super.macro()
  }

  compile() {
    this.reqStatement()
    return `static ` + a.reqStr(this.compileStatement())
  }

  static reprModuleUrl = import.meta.url
}

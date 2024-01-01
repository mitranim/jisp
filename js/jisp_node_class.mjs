import * as a from '/Users/m/code/m/js/all.mjs'
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
  pk() {return this.reqIdent().reqCanDeclare().reqName()}
  reqIdent() {return this.reqChildInstAt(1, jniu.IdentUnqual)}

  /*
  Override for `MixLiveValued`. Indirectly used by the orphan form of
  `IdentAccess` to obtain contextual sub-macros.
  */
  static makeLiveVal() {
    const tar = a.npo()
    tar.func = jnf.MethodFunc
    tar.let = ClassLet
    tar.do = ClassBlock
    tar.extend = ClassExtend
    return tar
  }

  #extend = undefined
  setExtend(val) {return this.#extend = this.reqInst(val, jn.Node), this}
  optExtend() {return this.#extend}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(2)
    this.reqDeclareLex()
    return this.macroFrom(2)
  }

  // Override for `Node..reqDeclareLex`.
  reqDeclareLex() {return jnf.Func.prototype.reqDeclareLex.call(this)}

  compile() {
    return a.spaced(
      a.reqStr(this.compilePrefix()),
      a.reqStr(this.compileName()),
      a.reqStr(this.compileExtend()),
      a.reqStr(this.compileBody()),
    )
  }

  compilePrefix() {return `class`}
  compileName() {return jn.compileNode(this.reqIdent())}
  compileExtend() {return a.optPre(jn.compileNode(this.optExtend()), `extends `)}
  compileBody() {return this.reqPrn().compileBracesWithStatements(this.optChildSlice(2))}
  isChildStatement() {return true}
}

export class ClassExtend extends jnlm.ListMacro {
  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(2)
    this.macroSyncFrom(1)
    this.reqAncMatch(Class).setExtend(this.reqChildAt(1))
    return this
  }

  /*
  Note: the compilation of the JS "extends" clause is handled by `Class`.
  This macro is used purely for side effects.
  */
  compile() {return ``}
}

export class ClassLet extends jnl.Let {
  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(2, 3)
    this.reqIdent()
    return this.macroFrom(2)
  }

  compilePrefix() {return ``}
}

export class ClassBlock extends jnb.Block {
  macro() {
    this.reqStatement()
    return super.macro()
  }

  compile() {return `static ` + a.reqStr(this.compileStatement())}
}

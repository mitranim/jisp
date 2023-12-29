import * as a from '/Users/m/code/m/js/all.mjs'
import * as jns from './jisp_ns.mjs'
import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jnf from './jisp_node_fn.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'
import * as jnl from './jisp_node_let.mjs'
import * as jnb from './jisp_node_block.mjs'
import * as jnp from './jisp_node_predecl.mjs'

export class Class extends jnlm.ListMacro {
  /*
  These properties provide contextual access to sub-macros specific to `Class`.
  Child nodes and descendant nodes can access these sub-macros by using the
  orphan form of `IdentAccess`. Examples:

    [class SomeSubClass
      [.extend SomeSuperClass]
      [.fn someMethod []]
    ]
  */
  get extend() {return ClassExtend}
  get fn() {return ClassFn}
  get let() {return ClassLet}
  get do() {return ClassBlock}

  pk() {return this.reqIdent().reqCanDeclare().reqName()}
  reqIdent() {return this.reqChildInstAt(1, jniu.IdentUnqual)}

  #extend = undefined
  setExtend(val) {return this.#extend = this.reqInst(val, jn.Node), this}
  optExtend() {return this.#extend}

  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(2)
    this.reqDeclareLex()
    return this.macroFrom(2)
  }

  // Override for `Node..reqDeclareLex`.
  reqDeclareLex() {return jnf.Fn.prototype.reqDeclareLex.call(this)}

  compile() {
    return a.spaced(
      a.reqStr(this.compilePrefix()),
      a.reqStr(this.compileName()),
      a.reqStr(this.compileExtend()),
      a.reqStr(this.compileBody()),
    )
  }

  compilePrefix() {return `class`}

  compileName() {return this.reqIdent().compile()}

  compileExtend() {
    return a.optPre(this.optExtend()?.compile(), `extends `)
  }

  compileBody() {
    return this.reqCodePrinter().compileBracesWithStatements(
      this.optChildSlice(2)
    )
  }

  isChildStatement() {return true}
}

export class ClassExtend extends jnlm.ListMacro {
  macroImpl() {
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

// TODO: add "super" to scope.
export class ClassFn extends jnf.Fn {
  compilePrefix() {return ``}

  makeNsLiveVal() {
    const tar = super.makeNsLiveVal()
    tar.super = Super
    return tar
  }
}

/*
TODO: after we define `Let`, switch the base class to `Let` and drop the
overrides other than `macroImpl`.
*/
export class ClassLet extends jnl.Let {
  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(2, 3)
    this.reqIdent()
    return this.macroFrom(2)
  }

  compilePrefix() {return ``}
}

export class ClassBlock extends jnb.Block {
  macroImpl() {
    this.reqStatement()
    return super.macroImpl()
  }

  compile() {return `static ` + a.reqStr(this.compileStatement())}
}

/*
This involves a macro, instead of an empty declaration like for `arguments` and
`this`, because `super` is a keyword in JS.
*/
export class Super extends jnp.Predecl {
  getCompiledName() {return `super`}
}

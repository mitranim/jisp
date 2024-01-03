import * as a from '/Users/m/code/m/js/all.mjs'
import * as jns from './jisp_ns.mjs'
import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jnnl from './jisp_node_node_list.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

export class Func extends jns.MixOwnNsLexed.goc(jnlm.ListMacro) {
  static get async() {return FuncAsync}

  // Used by `a.pk` and `a.Coll`.
  pk() {return this.reqIdent().reqCanDeclare().reqName()}
  reqIdent() {return this.reqChildInstAt(1, jniu.IdentUnqual)}
  reqParams() {return this.reqChildInstAt(2, jnnl.NodeList)}
  body() {return this.optChildSlice(3)}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(3)
    this.reqDeclareLex()
    this.declareParams()
    return this.macroFrom(3)
  }

  // Override for `Node..reqDeclareLex`.
  reqDeclareLex() {
    if (this.isStatement()) {
      return this.reqParent().reqNsLex().addNode(this)
    }
    return this.initNsLex().addNode(this)
  }

  declareParams() {
    for (const val of this.reqParams().childIter()) {
      val.asReqInst(jniu.IdentUnqual).reqDeclareLex()
    }
  }

  compile() {
    return a.spaced(
      a.reqStr(this.compilePrefix()),
      a.reqStr(this.compileName()),
      a.reqStr(this.compileParams()),
      a.reqStr(this.compileBody()),
    )
  }

  compilePrefix() {return `function`}

  compileName() {return jn.compileNode(this.reqIdent())}

  compileParams() {
    return this.reqPrn().compileParensWithExpressions(this.reqParams().childIter())
  }

  compileBody() {
    return this.reqPrn().compileBracesWithStatements(this.body())
  }

  isChildStatement(val) {
    super.isChildStatement(val)

    return val.optParent() === this && (
      true
      && val !== this.optChildAt(0)
      && val !== this.optChildAt(1)
      && val !== this.optChildAt(2)
    )
  }
}

export class FuncAsync extends Func {
  compilePrefix() {return `async function`}
}

/*
Intended for class instance methods and for object literal methods.
For our purposes, they're identical.
*/
export class MethodFunc extends Func {
  static get async() {return MethodFuncAsync}
  compilePrefix() {return ``}
}

export class MethodFuncAsync extends MethodFunc {
  compilePrefix() {return `async`}
}

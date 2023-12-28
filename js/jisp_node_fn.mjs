import * as a from '/Users/m/code/m/js/all.mjs'
import * as jns from './jisp_ns.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jnnl from './jisp_node_node_list.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'
import * as jnr from './jisp_node_ret.mjs'

export class Fn extends jns.MixOwnNsLexed.goc(jnlm.ListMacro) {
  pk() {return this.reqIdent().reqName()}
  reqIdent() {return this.reqChildInstAt(1, jniu.IdentUnqual)}
  reqParams() {return this.reqChildInstAt(2, jnnl.NodeList)}
  body() {return this.optChildSlice(3)}

  // Override for `MixOwnNsLexed`.
  makeNsLex() {return super.makeNsLex().addMixin(this.makeNsMixin())}

  makeNsMixin() {
    const tar = a.npo()
    tar.ret = jnr.Ret

    /*
    In a "live" namespace, nil values act as predeclarations without live
    semantics. Unlike `ret` which must be a macro, these names only need to be
    predeclared, but don't need to be macros. We compile them as-is.

    TODO consider adding these names to the own lexical namespace created by
    `Fn`, instead of using a quirk of `NsLive`. At the time of writing, `NsLex`
    requires its entries to be instances of `Node`. We may have to change that.
    */
    tar.this = undefined
    tar.arguments = undefined

    return new jns.NsLive().setVal(tar)
  }

  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(3)
    this.reqIdent().reqCanDeclare()
    this.reqDeclareLex()
    this.declareParams()
    return this.macroFrom(3)
  }

  // Override for `Node..reqDeclareLex`.
  reqDeclareLex() {
    if (this.isExpression()) {
      return this.ownNsLex().addNode(this)
    }
    return this.reqParent().reqNsLex().addNode(this)
  }

  declareParams() {
    for (const val of this.reqParams().childIter()) {
      val.asReqInst(jniu.IdentUnqual).reqDeclareLex()
    }
  }

  compile() {
    const prn = this.reqCodePrinter()

    return (
      ``
      + `function `
      + a.reqStr(this.reqIdent().compile())
      + a.reqStr(prn.compileParensWithExpressions(this.reqParams().childIter()))
      + ` `
      + a.reqStr(prn.compileBracesWithStatements(this.body()))
    )
  }

  isChildStatement(val) {
    super.isChildStatement(val)

    return val.ownParent() === this && (
      true
      && val !== this.optChildAt(0)
      && val !== this.optChildAt(1)
      && val !== this.optChildAt(2)
    )
  }
}

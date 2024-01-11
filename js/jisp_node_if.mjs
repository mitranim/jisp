import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jns from './jisp_ns.mjs'
import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

/*
This node can be used either as expression or as statement. Depending on how
it's used, it compiles either to the JS ternary expression `?:`, or to the JS
statement `if`.

The branches of JS `if` can optionally be blocks. At the time of writing, this
node doesn't have special support for that, because just like in JS, branch
blocks are opt-in. We should implement a separate macro for blocks.

This node does not declare a lexical namespace because the JS `if` doesn't
either. Branch blocks, if they exist, would have their own lexical namespaces,
which is a feature shared by all blocks. However, branches without blocks do
not have their own lexical namespaces. This is consistent with JS.
*/
export class If extends jns.MixOwnNsLexed.goc(jnlm.ListMacro) {
  reqTest() {return this.optChildAt(1)}
  optThen() {return this.optChildAt(2)}
  optElse() {return this.optChildAt(3)}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(2, 4)
    return this.macroFrom(1)
  }

  compile() {
    if (this.isStatement()) return this.compileStatement()
    return this.compileExpression()
  }

  compileStatement() {
    return jm.joinLines(
      a.spaced(this.compileStatementTest(), this.compileStatementThen()),
      this.compileStatementElse(),
    )
  }

  compileStatementTest() {
    return `if (` + a.reqStr(this.compileExpressionTest()) + `)`
  }

  compileStatementThen() {
    return this.reqPrn().compileStatement(this.optThen())
  }

  compileStatementElse() {
    const tar = a.reqStr(this.reqPrn().compileStatement(this.optElse()))
    return tar && (`else ` + tar)
  }

  compileExpression() {
    return (
      ``
      + `(`
      + a.reqValidStr(this.compileExpressionTest())
      + ` ? `
      + a.reqValidStr(this.compileExpressionThen())
      + ` : `
      + a.reqValidStr(this.compileExpressionElse())
      + `)`
    )
  }

  // TODO consider additional parentheses.
  compileExpressionTest() {return jn.optCompileNode(this.reqTest())}

  // TODO consider additional parentheses.
  compileExpressionThen() {return jn.optCompileNode(this.optThen()) || `undefined`}

  // TODO consider additional parentheses.
  compileExpressionElse() {return jn.optCompileNode(this.optElse()) || `undefined`}

  isChildStatement(val) {
    super.isChildStatement(val)

    return this.isStatement() && (
      false
      || val === this.optThen()
      || val === this.optElse()
    )
  }

  static reprModuleUrl = import.meta.url
}

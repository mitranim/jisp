import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jns from './jisp_ns.mjs'
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

  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(2, 4)
    this.macroFrom(1)
    return this
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
    return this.reqCodePrinter().compileStatement(this.optThen())
  }

  compileStatementElse() {
    const tar = a.reqStr(this.reqCodePrinter().compileStatement(this.optElse()))
    return tar && (`else ` + tar)
  }

  compileExpression() {
    return a.spaced(
      a.reqValidStr(this.compileExpressionTest()),
      `?`,
      a.reqValidStr(this.compileExpressionThen()),
      `:`,
      a.reqValidStr(this.compileExpressionElse()),
    )
  }

  // TODO consider additional parentheses.
  compileExpressionTest() {return this.reqTest().compile()}

  // TODO consider additional parentheses.
  compileExpressionThen() {return this.optThen()?.compile() ?? `undefined`}

  // TODO consider additional parentheses.
  compileExpressionElse() {return this.optElse()?.compile() ?? `undefined`}

  isChildStatement(val) {
    super.isChildStatement(val)

    return this.isStatement() && (
      false
      || val === this.optThen()
      || val === this.optElse()
    )
  }
}
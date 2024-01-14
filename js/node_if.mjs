import {a} from './dep.mjs'
import * as jm from './misc.mjs'
import * as jns from './ns.mjs'
import * as jn from './node.mjs'
import * as jnlm from './node_list_macro.mjs'
import * as jnb from './node_block.mjs'

/*
This node can be used either as expression or as statement. Depending on how
it's used, it compiles either to the JS ternary expression `?:`, or to the JS
statement `if`.

In statement mode, we implicitly ensure that branches are always blocks, with
their own lexical namespaces. This is different from regular JS `if`, where
branches can be single non-block statements, which can easily lead to
surprising behaviors like the examples below.

Without block wrapping: invalid syntax that doesn't parse:

  [if condition [const someName someVal]]

  if (condition) const someName = someVal;

With block wrapping: valid behavior:

  [if condition [const someName someVal]]

  if (condition) {
    const someName = someVal;
  }

Without block wrapping: when using `Statements`, we could accidentally splice
multiple statements into one branch. In the resulting code, only the first
statement would be part of `if`. The subsequent statements would be outside,
and execute unconditionally.

  [if condition [some_macro_that_uses_Statements]]

  if (condition)
    statement;
    statement;
    statement;

With block wrapping: splicing multiple statements into one branch has the
correct behavior of keeping them in that branch.

  [if condition [some_macro_that_uses_Statements]]

  if (condition) {
    statement;
    statement;
    statement;
  }
*/
export class If extends jns.MixOwnNsLexed.goc(jnlm.ListMacro) {
  reqTest() {return this.reqChildAt(0)}
  optThen() {return this.optChildAt(1)}
  optElse() {return this.optChildAt(2)}

  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(1, 3)
    if (this.isStatement()) return this.macroStatement()
    return this.macroFrom(0)
  }

  macroStatement() {
    this.optBlockAt(1)
    this.optBlockAt(2)
    return this.macroFrom(0)
  }

  /*
  Known issue: when the child is already a block, this causes double block
  wrapping. This has no effect on correctness, but generates unnecessary code.

  We're not checking if the child is already a block because we can't. If we're
  going to ensure that each branch is a block, we must wrap each branch before
  macroing it. That's because branches may contain declarations, which must be
  block-scoped. At the time of macroing a branch, it must already be inside a
  block with its lexical namespace. This means even if the child represents an
  eventual call to the `Block` macro or another similar macro, at this point
  it's still an instance of generic `DelimNodeList`.
  */
  optBlockAt(ind) {
    const chi = this.optChildAt(ind)
    if (a.isNil(chi)) return

    this.replaceChildAt(
      ind,
      new jnb.Block().setSpan(chi.optSpan()).setChild(chi),
    )
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
    return jn.optCompileNode(this.optThen())
  }

  compileStatementElse() {
    const out = jn.optCompileNode(this.optElse())
    return out && (`else ` + out)
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

  static {this.setReprModuleUrl(import.meta.url)}
}

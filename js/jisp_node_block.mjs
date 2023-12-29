import * as a from '/Users/m/code/m/js/all.mjs'
import * as jns from './jisp_ns.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

/*
TODO: this should declare a namespace only in statement mode, but not in
expression mode, unless it uses an IIFE. See `.compileExpression` below.
*/
export class Block extends jns.MixOwnNsLexed.goc(jnlm.ListMacro) {
  macroImpl() {
    this.reqEveryChildNotCosmetic()
    return this.macroFrom(1)
  }

  compile() {
    if (this.isStatement()) return this.compileStatement()
    return this.compileExpression()
  }

  compileStatement() {
    return this.reqCodePrinter().compileBracesWithStatements(
      this.optChildSlice(1)
    )
  }

  /*
  Incomplete. The current implementation uses a JS comma-separated sequence,
  which can only contain expressions. It would be nice if when some children
  are statements, we could switch to using an IIFE, wrapping all children into
  an immediately-invoked function. The difficulty with the IIFE approach is
  that it may accidentally break `return` statements used in the body of the
  block, with no clear, simple, efficient way to detect such breakage.
  */
  compileExpression() {
    const len = this.childCount()

    if (len <= 1) return `undefined`

    if (len === 2) return this.reqChildAt(1).compile()

    return this.reqCodePrinter().compileParensWithExpressions(
      this.optChildSlice(1),
    )
  }

  isChildStatement() {return this.isStatement()}
}

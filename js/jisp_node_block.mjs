import * as a from '/Users/m/code/m/js/all.mjs'
import * as jns from './jisp_ns.mjs'
import * as jn from './jisp_node.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

/*
TODO: this should declare a namespace only in statement mode, but not in
expression mode, unless it uses an IIFE. See `.compileExpression` below.
*/
export class Block extends jns.MixOwnNsLexed.goc(jnlm.ListMacro) {
  macro() {
    this.reqEveryChildNotCosmetic()
    return this.macroFrom(1)
  }

  compile() {
    if (this.isStatement()) return this.compileStatement()
    return this.compileExpression()
  }

  compileStatement() {
    return this.reqPrn().compileBracesWithStatements(this.optChildSlice(1))
  }

  /*
  Incomplete. The current implementation uses a JS comma-separated sequence,
  which can only contain expressions. See the comment on `.isChildStatement`.
  */
  compileExpression() {
    const len = this.childCount()
    if (len <= 1) return `undefined`
    if (len === 2) return jn.optCompileNode(this.reqChildAt(1))
    return this.reqPrn().compileParensWithExpressions(this.optChildSlice(1))
  }

  /*
  When the block is an expression, children must be expressions.
  This is an unfortunate limitation that we would like to lift.

  When the block is an expression, allowing children to be statements requires
  an IIFE. Ideally, we would use an IIFE only when some of the children are
  statements, and avoid it when all children are expressions. This detection
  may require us to add a new method to the `Node` interface that answers the
  question whether the node can compile to an expression (default `false`),
  which would be overridden to return `true` on various expression-supporting
  nodes.

  The difficulty with the IIFE approach is that it would accidentally and
  quietly override the behavior of pre-existing `return` statements everywhere
  in the block, with no clear, simple, efficient way to detect such breakage.
  Without the ability to detect this, it seems preferable to err on the side of
  correctness and forbid statements in expression-like blocks.
  */
  isChildStatement() {return this.isStatement()}

  static reprModuleUrl = import.meta.url
}

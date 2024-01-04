import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'

/*
A code printer should be owned by an ancestor of the AST hierarchy, such as
`Root`. Descendant nodes should access it by searching through the ancestors.
See `MixCodePrinted` and `MixOwnCodePrinted`. This may allow to change how code
is printed by reconfiguring the printer at the top level.

Methods with names "compileX" where "X" is singular assume that the input is a
`Node`. Methods with names "compileX" where "X" is plural assume that the input
is an iterable sequence of `Node`. However, the printer uses only a limited
subset of the `Node` interface. Inputs may be arbitrary objects that implement
the correct methods.
*/
export class CodePrinter extends a.Emp {
  mapCompact(src, fun) {return a.compact(a.arr(src).map(fun, this))}

  /*
  Similar to `jisp_node.mjs` → `optCompileNode`.
  Duplicated here to minimize cyclic imports.
  TODO consider deduping.
  */
  optCompile(src) {
    if (a.isNil(src)) return ``
    try {return a.reqStr(src.compile())}
    catch (err) {throw src.toErr(err)}
  }

  /*
  Similar to `jisp_node.mjs` → `reqCompileNode`.
  Duplicated here to minimize cyclic imports.
  TODO consider deduping.
  */
  reqCompile(src) {
    try {return a.reqValidStr(src.compile())}
    catch (err) {throw src.toErr(err)}
  }

  mapCompile(src) {return this.mapCompact(src, this.optCompile)}

  optCompileNotCosmetic(src) {
    if (a.isNil(src) || src.isCosmetic()) return ``
    return this.optCompile(src)
  }

  mapCompileNotCosmetic(src) {
    return this.mapCompact(src, this.optCompileNotCosmetic)
  }

  compileExpressions(src) {
    return this.mapCompileNotCosmetic(src).join(`, `)
  }

  compileStatement(src) {
    return this.optTerminateStatement(this.optCompileNotCosmetic(src))
  }

  optTerminateStatement(src) {return a.optSuf(src, `;`)}

  mapCompileStatements(src) {
    return this.mapCompact(src, this.compileStatement)
  }

  compileStatements(src) {
    return this.mapCompileStatements(src).join(`\n`)
  }

  compileParensWithExpressions(src) {
    return this.wrapParens(this.compileExpressions(src))
  }

  compileBracesWithStatements(src) {
    return this.wrapBraces(this.compileStatements(src))
  }

  reqCompileReturn(src) {return this.optCompileReturn(src) || `return;`}

  optCompileReturn(src) {
    if (a.isNil(src)) return ``
    return this.optTerminateStatement(a.optPre(this.optCompile(src), `return `))
  }

  wrapBraces(src) {return this.wrap(`{`, src, `}`)}
  wrapBrackets(src) {return this.wrap(`[`, src, `]`)}
  wrapParens(src) {return `(` + a.reqStr(src) + `)`}

  wrap(pre, inf, suf) {
    a.reqStr(pre)
    a.reqStr(inf)
    a.reqStr(suf)
    if (inf) return pre + `\n` + inf + `\n` + suf
    return pre + suf
  }
}

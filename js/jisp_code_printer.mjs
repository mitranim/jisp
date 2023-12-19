import * as a from '/Users/m/code/m/js/all.mjs'

/*
A code printer should be owned by an ancestor of the AST hierarchy, such as
`Root`. Descendant nodes should access it by searching through the ancestors.
See `MixCodePrinted` and `MixOwnCodePrinted`. This allows to change how code is
printed by reconfiguring the printer at the top level.

Methods with names "compileX" where "X" is singular assume that the input is a
`Node`. Methods with names "compileX" where "X" is plural assume that the input
is an iterable sequence of `Node`. However, the printer uses only a limited
subset of the `Node` interface. Inputs may be arbitrary objects that implement
the correct methods.
*/
export class CodePrinter extends a.Emp {
  compile(src) {
    if (a.isNil(src)) return ``
    return a.reqStr(src.compile())
  }

  mapCompile(src) {
    return a.compact(a.arr(src).map(this.compile, this))
  }

  compileNotCosmetic(src) {
    if (a.isNil(src) || src.isCosmetic()) return ``
    return a.reqStr(src.compile())
  }

  mapCompileNotCosmetic(src) {
    return a.compact(a.arr(src).map(this.compileNotCosmetic, this))
  }

  compileExpressions(src) {
    return this.mapCompileNotCosmetic(src).join(`, `)
  }

  compileStatements(src) {
    const tar = this.mapCompileNotCosmetic(src).join(`;\n`)
    return tar && (`\n` + tar + `;\n`)
  }

  compileParensWithExpressions(src) {
    return `(` + a.reqStr(this.compileExpressions(src)) + `)`
  }

  compileBracesWithStatements(src) {
    return `{` + a.reqStr(this.compileStatements(src)) + `}`
  }
}

import * as a from '/Users/m/code/m/js/all.mjs'

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
  Same as `jisp_node.mjs` → `optCompileNode`.
  Duplicated here to minimize cyclic imports.
  TODO consider deduping.
  */
  compile(src) {
    if (a.isNil(src)) return ``
    try {return a.reqStr(src.compile())}
    catch (err) {throw src.toErr(err)}
  }

  mapCompile(src) {return this.mapCompact(src, this.compile)}

  compileNotCosmetic(src) {
    if (a.isNil(src) || src.isCosmetic()) return ``
    return this.compile(src)
  }

  mapCompileNotCosmetic(src) {
    return this.mapCompact(src, this.compileNotCosmetic)
  }

  compileExpressions(src) {
    return this.mapCompileNotCosmetic(src).join(`, `)
  }

  compileStatement(src) {
    const out = a.reqStr(this.compileNotCosmetic(src))
    return out && (out + `;`)
  }

  mapCompileStatements(src) {
    return this.mapCompact(src, this.compileStatement)
  }

  compileStatements(src) {
    const tar = this.mapCompileStatements(src).join(`\n`)
    return tar && (`\n` + tar + `\n`)
  }

  compileParensWithExpressions(src) {
    return `(` + a.reqStr(this.compileExpressions(src)) + `)`
  }

  compileBracesWithStatements(src) {
    return `{` + a.reqStr(this.compileStatements(src)) + `}`
  }
}

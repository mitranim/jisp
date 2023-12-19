import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jnib from './jisp_node_import_base.mjs'

/*
Somewhat similar to `Use`, but for runtime-only imports, rather than for
compile-time evaluation.

FIXME support optional compile-time importing, controlled by additional
configuration property on `Conf.main`. When enabled, causes `Import` to import
target module at compile time and validate that all referenced identifiers are
actually exported by target module.

FIXME support "mixin" imports. They should cause `Import` to import target
module at compile time regardless of `Conf.main` configuration, in order to
obtain knowledge of exported identifiers, which allows us to resolve
unqualified names.

  * Perform an actual import similarly to what `Use` does.
  * Create a special namespace and add it to the nearest lexical namespace as a
    mixin.
    * Must use something similar to `NsLive`, but NOT considered live.
    * No static declarations are available. We use normal JS runtime inspection
      on the evaluated module object.
*/
export class Import extends jnib.ImportBase {
  macroDestMixin() {
    throw this.err(`mixin-style imports (star-imports) are not yet supported by ${a.show(this)}`)
  }

  compile() {
    if (this.isExpression()) return this.compileExpression()
    return this.compileStatement()
  }

  compileExpression() {
    return `import(` + a.reqStr(this.reqAddr().compile()) + `)`
  }

  compileStatement() {
    const name = this.optDest()

    /*
    Normalize quotes for compatibility with the native import statement syntax,
    which currently allows only single and double quotes, but not backtick
    quotes.
    */
    const addr = JSON.stringify(a.reqStr(this.reqAddr().reqVal()))

    if (name) return `import * as ${a.reqStr(name.compile())} from ${a.reqStr(addr)}`
    return `import ${a.reqStr(addr)}`
  }
}

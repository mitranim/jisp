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
  async macroDestNil() {
    await this.resolve()
    return super.macroDestNil()
  }

  async macroDestName() {
    await this.resolve()
    return super.macroDestName()
  }

  macroDestMixin() {
    throw this.err(`mixin-style imports (star-imports) are not yet supported by ${a.show(this)}`)
  }

  compile() {
    if (this.isExpression()) return this.compileExpression()
    return this.compileStatement()
  }

  /*
  Technical note. Regardless of the quote syntax found in `.reqAddr`, this is
  allowed to output only double quotes or single quotes, for compatibility with
  the JS `import` statement, which allows only double quotes or single quotes.
  The JS pseudo-function `import` allows an arbitrary expression which may be a
  backtick-quoted string, but it's simpler to always use quotes compatible with
  the `import` statement.
  */
  compileAddr() {
    return JSON.stringify(a.reqStr(
      this.optTarPathRel() ?? this.optTarPathAbs() ?? this.reqSrcPath()
    ))
  }

  compileExpression() {return `import(` + a.reqStr(this.compileAddr()) + `)`}

  compileStatement() {
    const name = this.optDest()
    const addr = this.compileAddr()
    if (name) return `import * as ${a.reqStr(name.compile())} from ${a.reqStr(addr)}`
    return `import ${a.reqStr(addr)}`
  }

  async resolve() {
    await super.resolve()

    const mod = this.optModule()
    if (!mod) return this

    const dep = this.optDepModule()
    if (!dep) return this

    mod.addDep(dep)
    return this
  }
}

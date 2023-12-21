import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jnib from './jisp_node_import_base.mjs'
import * as jnm from './jisp_node_module.mjs'

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
    await this.optResolveTarAddr()
    return super.macroDestNil()
  }

  async macroDestName() {
    await this.optResolveTarAddr()
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
  Technical note. Regardless of the quote syntax found in `.reqAddr`, this
  should normalize quotes into single quotes or double quotes for compatibility
  with the `import` statement, which allow only single and double quotes. The
  JS pseudo-function `import` allows all quotes, but it's simpler to always use
  quotes compatible with the `import` statement.
  */
  compileAddr() {
    return JSON.stringify(a.reqStr(
      this.optTarAddr() ?? this.reqAddr().reqVal()
    ))
  }

  compileExpression() {return `import(` + a.reqStr(this.compileAddr()) + `)`}

  compileStatement() {
    const name = this.optDest()
    const addr = this.compileAddr()
    if (name) return `import * as ${a.reqStr(name.compile())} from ${a.reqStr(addr)}`
    return `import ${a.reqStr(addr)}`
  }

  #tarAddr = undefined
  setTarAddr(val) {return this.#tarAddr = a.optValidStr(val), this}
  optTarAddr() {return this.#tarAddr}

  async optResolveTarAddr() {
    const mod = this.optAncMatch(jnm.Module)
    if (!mod) return this

    const moduleTarUrl = await mod.optTarUrl()
    if (!moduleTarUrl) return this

    const importSrcStr = this.reqAddr().reqVal()
    const importSrcUrl = mod.optImportSrcPathToImportSrcUrl(importSrcStr)
    if (!importSrcUrl) return this

    // FIXME unfuck.
    // Incomplete stopgap solution.
    // This is in the wrong place, and prevents cyclic dependencies between modules.
    if (importSrcUrl.hasExtSrc()) {
      await this.reqResolveImport()
    }

    const importTarUrl = await mod.srcUrlToTarUrl(importSrcUrl)
    const importTarRel = jm.toPosixRel(importTarUrl.optRelTo(moduleTarUrl.clone().toDir()))
    this.setTarAddr(importTarRel)
    return this
  }

  async _optResolveTarAddr() {
    const mod = this.optAncMatch(jnm.Module)
    if (!mod) return this

    const moduleTarUrl = await mod.optTarUrl()
    if (!moduleTarUrl) return this

    const importSrcStr = this.reqAddr().reqVal()
    const importSrcUrl = mod.optImportSrcPathToImportSrcUrl(importSrcStr)
    if (!importSrcUrl) return this

    // Incomplete stopgap solution.
    if (importSrcUrl.hasExtSrc()) {

    }

    const importTarUrl = await mod.srcUrlToTarUrl(importSrcUrl)
    const importTarRel = jm.toPosixRel(importTarUrl.optRelTo(moduleTarUrl.clone().toDir()))
    this.setTarAddr(importTarRel)
    return this
  }
}

import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jns from './jisp_ns.mjs'
import * as jnib from './jisp_node_import_base.mjs'

/*
Somewhat similar to `Use`, but for runtime-only imports, rather than for
compile-time evaluation.

FIXME support optional compile-time importing, controlled by an additional
configuration property on `Conf.main`. When enabled, causes `Import` to import
the target module at compile time and validate that all referenced identifiers
are actually exported. This should piggyback on the mechanism already used
for "star" / "mixin" imports.
*/
export class Import extends jnib.ImportBase {
  async macroModeUnnamed() {
    await this.resolve()
    return super.macroModeUnnamed()
  }

  async macroModeNamed() {
    await this.resolve()
    return super.macroModeNamed()
  }

  // TODO maybe dedup with equivalent code in `Use`.
  async macroModeMixin() {
    await this.reqImport()
    this.reqNsLex().addMixin(this.reqNsLive())
    return this
  }

  // Involved in `.macroModeMixin`.
  get NsLive() {return jns.NsLivePseudo}

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
    const prn = this.reqCodePrinter()
    const name = this.optDestName()
    const addr = this.compileAddr()
    const refs = jm.mapUniq(this.optNsLive()?.optRefs(), a.pk).join(`, `)

    const named = name ? (
      `import * as ${a.reqStr(name.compile())} from ${a.reqStr(addr)}`
    ) : ``

    const reffed = refs ? (
      `import {${a.reqStr(refs)}} from ${a.reqStr(addr)}`
    ) : ``

    if (named && reffed) return named + `\n` + reffed
    if (named) return named
    if (reffed) return reffed
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

import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jns from './jisp_ns.mjs'
import * as jn from './jisp_node.mjs'
import * as jnib from './jisp_node_import_base.mjs'
import * as jnp from './jisp_node_predecl.mjs'

/*
Somewhat similar to `Use`, but for runtime-only imports, rather than for
macro-time evaluation.

FIXME support verifying exports at macro time for the "named" form of this
macro, similarly to what is done by the "star" form of this macro. It should be
opt-in, and might be controlled by an additional configuration property on
`Conf.main`, or simply by a static boolean property on this class. When
enabled, it should cause `Import` to import the target module at macro time
and use `NsLivePseudo` to create a namespace for it, which should allow our
system to validate that all references to the names in this module / properties
of this module refer to its actual exports.
*/
export class Import extends jnib.ImportBase {
  static get meta() {return ImportMeta}

  async macroModeUnnamed() {
    await this.optResolve()
    return super.macroModeUnnamed()
  }

  async macroModeNamed() {
    await this.optResolve()
    return super.macroModeNamed()
  }

  // Involved in `.macroModeMixin`.
  get NsLive() {return jns.NsLivePseudo}

  compile() {
    if (this.isStatement()) return this.compileStatement()
    return this.compileExpression()
  }

  compileStatement() {
    const name = this.optDestName()
    const addr = this.compileAddr()
    const refs = jm.mapUniq(this.optNsLive()?.optRefs(), a.pk).join(`, `)

    const named = name ? (
      `import * as ${a.reqStr(jn.compileNode(name))} from ${a.reqStr(addr)}`
    ) : ``

    /*
    Known bug: when ref names are JS keywords such as `null`, this generates
    invalid code that causes a syntax error. TODO where should we handle this?
    */
    const reffed = refs ? (
      `import {${a.reqStr(refs)}} from ${a.reqStr(addr)}`
    ) : ``

    if (named && reffed) return named + `\n` + reffed
    if (named) return named
    if (reffed) return reffed
    return `import ${a.reqStr(addr)}`
  }

  compileExpression() {
    const path = this.optTarPathRel() ?? this.optTarPathAbs()

    return (
      ``
      + `import(`
      + a.reqStr(
        a.isSome(path)
        ? JSON.stringify(a.reqStr(path))
        : jn.compileNode(this.reqAddr())
      )
      + `)`
    )
  }

  /*
  Intended for statement mode only. This should output a double-quoted or
  single-quoted string for compatibility with the JS `import` statement, which
  allows only double quotes or single quotes.

  Compare with the JS pseudo-function `import`, where the address may be an
  arbitrary expression.
  */
  compileAddr() {
    return JSON.stringify(a.reqStr(
      this.optTarPathRel() ?? this.optTarPathAbs() ?? this.reqSrcPath()
    ))
  }

  /*
  Compare `Use..reqResolve` which registers the imported module as a
  dependency of the source file, not a dependency of the target file.
  */
  async reqResolve() {
    await super.reqResolve()
    this.reqModule().addTarDep(this.reqDepModule())
    return this
  }
}

export class ImportMeta extends jnp.Predecl {
  getCompiledName() {return `import.meta`}
}

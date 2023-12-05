import * as a from '/Users/m/code/m/js/all.mjs'
import * as jv from './jisp_valued.mjs'
import * as jnmo from './jisp_node_module.mjs'
import * as jnm from './jisp_node_macro.mjs'
import * as jnst from './jisp_node_str.mjs'
import * as jnun from './jisp_node_unqual_name.mjs'

/*
This must be the ONLY member of the "predeclared" scope. All other identifiers
provided by the language must be part of the "prelude" module/scope which must
be imported explicitly.

TODO:

  * Provide a similar macro that does not import the module at compile time,
    and therefore does not support using macros from that module. Useful for
    non-Jisp modules. Avoids the overhead of unnecessary compile-time imports.
    More importantly, avoids exceptions in JS libraries that assume a browser.

  * Instead of `"*"`, use `*` or `...` without quotes. Requires tokenizer
    changes.

FIXME:

  * When "*":
    * Generate a unique name.
      * Consult current scope to avoid conflicts.
    * When compiling:
      * Every `UnqualName` from this module must be qualified, using this name.
        * `UnqualName..macroImpl`.
        * Requires access from scope to `Use`.
  * Forbid use as expression.
*/
export class Use extends jv.MixOwnValued.goc(jnm.Macro) {
  static getSrcName() {return `use`}
  static getTarName() {return this.getSrcName()}

  pk() {return a.pk(this.reqDestName())}
  // FIXME: inner or outer or both?
  setVal(val) {return super.setVal(a.reqInst(val, jnmo.Module))}
  strAll() {return `*`}
  addr() {return this.reqSrcInstAt(1, jnst.Str)}
  dest() {return this.optSrcInstAt(2, jnun.UnqualName, jnst.Str)}
  destName() {return a.onlyInst(this.dest(), jnun.UnqualName)}
  reqDestName() {return a.reqInst(this.dest(), jnun.UnqualName)}

  destStr() {
    const src = a.onlyInst(this.dest(), jnst.Str)
    if (!src) return undefined

    const str = src.ownVal()
    const exp = this.strAll()
    if (str !== exp) {
      throw this.err(`macro ${a.show(this.getSrcName())} requires argument at index 2 to be either a name or a string containing exactly ${a.show(exp)}, found invalid string ${a.show(str)}`)
    }
    return src
  }

  reqVal() {
    return (
      this.optVal() ??
      this.throw(`missing imported module at ${a.show(this)}; possible cause: module got requested before executing import`)
    )
  }

  macroImpl() {
    this.reqSrcList().reqEveryMeaningful().reqLenBetween(2, 3)
    this.addr()
    if (this.destStr()) return this.macroAll()
    return this.macroName()
  }

  async import() {
    this.setVal(await this.reqModule().import(this.addr().reqVal()))
  }

  async macroAll() {
    await this.import()
    this.reqScope().reqLexNs().addMixin(this)
    return undefined
  }

  async macroName() {
    await this.import()
    this.defineLex()
    return this
  }

  // Allows this object to be a namespace mixin. Required for `.macroAll`.
  optNs() {return this.reqVal().optNs()}

  // Override for `MixRef`. Returns AST node responsible for this definition.
  ownDeref() {return this.reqVal()}

  compile() {
    this.reqStatement()
    const prn = this.reqCodePrinter()

    if (!this.dest()) return `import ${a.reqStr(this.compileAddr(prn))}`

    const name = this.destName()
    if (!name) {
      throw this.err(`internal error: unable to compile ${a.show(this.getSrcName())} because it uses an import format incompatible with JS; must be elided from the AST before compiling to JS`)
    }

    return `import * as ${prn.compile(name)} from ${a.reqStr(this.compileAddr(prn))}`
  }

  // Normalizes quotes for compatibility with the JS syntax, which currently
  // allows only single and double quotes for imports, not backtick quotes.
  compileAddr(prn) {
    return prn.compile(JSON.stringify(this.addr().reqVal()))
  }
}

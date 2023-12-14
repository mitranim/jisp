import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jv from './jisp_valued.mjs'
import * as jmo from './jisp_module.mjs'
import * as jnm from './jisp_node_macro.mjs'
import * as jnst from './jisp_node_str.mjs'
import * as jnun from './jisp_node_unqual_name.mjs'

/*
Compile-time-only import, used for compile-time evaluation. Compare macro
`Import` which is used for runtime-only imports.

This must be the ONLY member of the "predeclared" scope. All other identifiers
provided by the language must be part of the "prelude" module/scope which must
be imported explicitly.

TODO:

  * Instead of `"*"`, use `*` or `...` without quotes. Requires tokenizer
    changes.

FIXME:

  * Forbid as expression. Must be statement.
*/
export class Use extends jv.MixOwnValued.goc(jnm.Macro) {
  static getSrcName() {return `use`}
  static getTarName() {return this.getSrcName()}

  pk() {return a.pk(this.reqDestName())}

  // FIXME unfuck. The evaluated target must be a "compiled" module or otherwise
  // usable / evaluatable JS module with Jisp metadata, not an AST module.
  setVal(val) {return super.setVal(this.reqInst(val, jmo.Module))}

  strAll() {return `*`}
  reqAddr() {return this.reqSrcInstAt(1, jnst.Str)}
  optDest() {return this.optSrcInstAt(2, jnun.UnqualName, jnst.Str)}
  optDestName() {return a.onlyInst(this.optDest(), jnun.UnqualName)}
  reqDestName() {return a.reqInst(this.optDest(), jnun.UnqualName)}

  destStr() {
    const src = a.onlyInst(this.optDest(), jnst.Str)
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
    this.reqSrcList().reqEveryNotCosmetic().reqLenBetween(2, 3)
    this.reqAddr()
    if (this.destStr()) return this.macroAll()
    return this.macroName()
  }

  /*
  We must access the parent via `.reqParent()` because otherwise `jm.isImporter`
  would match the current node and cause `.reqAncFind` to recur indefinitely,
  causing stack overflow.
  */
  async import() {
    const importer = this.reqParent().reqAncFind(jm.isImporter)
    this.setVal(await importer.import(this.reqAddr().reqVal()))
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

  // Return nil. This node is intended only for compile-time imports.
  compile() {}
}

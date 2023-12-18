import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jv from './jisp_valued.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jnst from './jisp_node_str.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

const IS_STAR_IMPORT_SUPPORTED = false

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

  * Support both named and star forms.
  * In named form, add itself to ancestral `NsLex`.
  * In star form, add own `NsLive` to mixins of ancestral `NsLex`.
*/
export class Use extends jv.MixOwnValued.goc(jnlm.ListMacro) {
  pk() {return a.pk(this.reqDestName())}

  // FIXME unfuck. The evaluated target must be a "compiled" module or otherwise
  // usable / evaluatable JS module with Jisp metadata, not an AST module.
  setVal(val) {return super.setVal(this.reqInst(val, Module))}

  strAll() {return `*`}
  reqAddr() {return this.reqSrcInstAt(1, jnst.Str)}
  optDest() {return this.optSrcInstAt(2, jniu.IdentUnqual, jnst.Str)}
  optDestName() {return this.optSrcInstAt(2, jniu.IdentUnqual)}
  reqDestName() {return this.reqSrcInstAt(2, jniu.IdentUnqual)}

  destStr() {
    const src = this.optDest()?.asOnlyInst(jnst.Str)
    if (!src) return undefined

    const str = src.ownVal()
    const exp = this.strAll()
    if (str !== exp) {
      throw this.err(`macro ${a.show(this)} requires argument at index 2 to be either a name or a string containing exactly ${a.show(exp)}, found invalid string ${a.show(str)}`)
    }
    return src
  }

  reqVal() {
    return (
      this.optVal() ??
      this.throw(`missing imported module at ${a.show(this)}; possible cause: module got requested before executing import`)
    )
  }

  // FIXME: also support anonymous form which imports the target purely for side
  // effects.
  macroImpl() {
    this.reqStatement()

    if (!IS_STAR_IMPORT_SUPPORTED) {
      this.reqSrcList().reqEveryChildNotCosmetic().reqChildCount(3)
      this.reqAddr()
      this.reqDestName()
      return this.macroName()
    }

    this.reqSrcList().reqEveryChildNotCosmetic().reqChildCountBetween(2, 3)
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

    // FIXME NYI. This node should initialize and store `NsLive` referring to
    // imported module.
    this.reqNsLex().addMixin(this.initNsLive())

    return undefined
  }

  async macroName() {
    await this.import()
    this.declareLex()
    return this
  }

  // Return nil. This node is intended only for compile-time imports.
  compile() {}
}

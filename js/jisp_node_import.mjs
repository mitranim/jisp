import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jv from './jisp_valued.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jnst from './jisp_node_str.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

/*
Somewhat similar to `Use`, but for runtime-only imports, rather than for
compile-time evaluation.

FIXME support optional compile-time importing, controlled by additional
configuration property on `Conf.main`. When enabled, causes `Import` to import
target module at compile time and validate that all referenced identifiers are
actually exported by target module.

FIXME support "star" imports. They should cause `Import` to import target module
at compile time regardless of `Conf.main` configuration, in order to obtain
knowledge of exported identifiers, which allows us to resolve unqualified
names.
*/
export class Import extends jv.MixOwnValued.goc(jnlm.ListMacro) {
  pk() {return a.pk(this.reqDest())}
  reqAddr() {return this.reqSrcInstAt(1, jnst.Str)}
  optDest() {return this.optSrcInstAt(2, jniu.IdentUnqual)}
  reqDest() {return this.reqSrcInstAt(2, jniu.IdentUnqual)}

  macroImpl() {
    if (this.isExpression()) {
      this.reqSrcList().reqEveryChildNotCosmetic().reqChildCount(2)
      this.reqAddr()
    }
    else {
      this.reqSrcList().reqEveryChildNotCosmetic().reqChildCountBetween(2, 3)
      this.reqAddr()
      this.declareLex()
    }
    return this
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

import * as jd from './jisp_decl.mjs'

/*
FIXME:

  * Created by `Import` when target module is actually imported at compile time.
    * When target module is not imported at compile time, use a more basic decl
      class that doesn't support NS-like features.
  * When `Import` is in named form, add to lex NS under that name.
  * When `Import` is in star form, add to lex NS as mixin.
  * This must refer to evaluated JS module object.
  * This must behave kinda as a namespace.
    * No declarations are available. We use normal JS runtime inspection on
      evaluated module object.
  * Should probably share a base class with `UseDecl`.
  * Unlike `UseDecl`, this doesn't force node replacement during macroing.
*/
class ImportDecl extends jd.Decl {}

import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jnst from './jisp_node_str.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

// Base class for node subclasses that deal with imports. See `Use` and `Import`.
export class ImportBase extends jnlm.ListMacro {
  pk() {return this.reqDestName().reqName()}

  /*
  Indicates the expected string content used for the "star" / "mixin" import
  form. Some other languages use special syntax, such as unquoted asterisk,
  dot, triple dot. We use a string with a star because at the time of writing,
  our tokenizer and AST don't have a way of parsing and representing special
  symbols such as an unquoted star. Note that unlike traditional Lisps, we
  restrict our identifiers to the format of valid JS identifiers. See
  `Ident.regexpIdentUnqual`.
  */
  mixinStr() {return `*`}

  reqAddr() {return this.reqChildInstAt(1, jnst.Str)}
  reqDest() {return this.reqChildAt(2)}
  optDest() {return this.optChildAt(2)}
  optDestName() {return this.optChildAt(2)?.asOnlyInst(jniu.IdentUnqual)}
  reqDestName() {return this.reqChildInstAt(2, jniu.IdentUnqual)}
  optDestStr() {return this.optChildAt(2)?.asOnlyInst(jnst.Str)}
  reqDestStr() {return this.reqChildInstAt(2, jnst.Str)}

  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(2, 3)
    this.reqAddr()

    if (!this.optDest()) return this.macroDestNil()
    if (this.optDestName()) return this.macroDestName()
    if (this.optDestStr()) return this.macroDestStr()

    throw this.err(`${a.reqStr(this.msgArgDest())}; found unrecognized node ${a.show(this.reqDest())}`)
  }

  macroDestNil() {return this}

  macroDestName() {
    this.declareLex()
    return this
  }

  macroDestStr() {
    const val = this.reqDestStr().ownVal()
    const exp = this.mixinStr()
    if (val !== exp) {
      throw this.err(`${a.reqStr(this.msgArgDest())}; found unsupported string ${a.show(val)}`)
    }
    return this.macroDestMixin()
  }

  macroDestMixin() {throw jm.errMeth(`macroDestMixin`, this)}

  msgArgDest() {
    return `macro ${a.show(this)} requires the argument at index 2 to be one of the following: missing; unqualified identifier; string containing exactly ${a.show(this.mixinStr())}`
  }

  async reqResolveImport() {
    const srcPath = this.reqAddr().reqVal()

    // This is typically a `Module`.
    const resolver = this.reqParent().reqAncFind(jm.isImportResolver)

    /*
    Import resolving is asynchronous because it may involve converting a Jisp
    file to a JS file, or finding an already-existing compiled file.
    Compilation is async because it may involve native imports, and FS
    operations are async in the general case (varies by platform).
    */
    const tarUrl = await resolver.resolveImport(srcPath)

    if (!a.isInst(tarUrl, URL)) {
      throw this.err(`expected import resolver ${a.show(resolver)} to resolve import path ${a.show(srcPath)} to URL object, but it resolved to ${a.show(tarUrl)}`)
    }
    return tarUrl
  }
}

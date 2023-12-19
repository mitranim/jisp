import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jv from './jisp_valued.mjs'
import * as jns from './jisp_ns.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jnst from './jisp_node_str.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'

/*
This class implements compile-time imports, which are used for compile-time
replacement of AST nodes, also known as macroing. Compare macro `Import` which
is used for runtime-only imports.

This should be the ONLY member of the "predeclared" scope. All other identifiers
provided by the language must be part of the "prelude" module which must be
imported via `Use`.

TODO:

  * Instead of `"*"`, use `*` or `...` (without quotes). Requires tokenizer
    changes. At the time of writing, the syntax used in these examples is not
    supported by our tokenizer at all.

FIXME:

  * Move common code to base class shared with `Import`.
  * Support both named and star forms.
  * In named form, add itself to ancestral `NsLex`.
  * In star form, add own `NsLive` to mixins of ancestral `NsLex`.
*/
export class Use extends jns.MixOwnNsLived.goc(jv.MixOwnValued.goc(jnlm.ListMacro)) {
  pk() {return this.reqDestName().reqName()}
  mixinStr() {return `*`}

  // Override for `MixOwnValued`.
  setVal(val) {return super.setVal(this.req(val, jm.isNativeModule))}

  // Override for `MixValued` used by `MixOwnValued`.
  reqVal() {
    return (
      this.optVal() ??
      this.throw(`missing imported module at ${a.show(this)}; possible cause: module got requested before executing import`)
    )
  }

  // Override for `MixOwnNsLived`.
  ownNsLive() {return this.optNsLive()}

  /*
  Override for `MixOwnNsLived`. Requires `.reqImport` to be fully executed
  first, otherwise this produces an exception.
  */
  makeNsLive() {return new jns.NsLive().setVal(this.reqVal())}

  /*
  May be used by `IdentAccess` and `DelimNodeList` when this node is used as an
  expression rather than a module-level statement. At the time of writing, such
  usage would generate an exception during macroing, because this node's method
  `.macro` returns a promise, and async macroing is supported only at the
  module level. However, we may be able to lift that limitation in the future.
  */
  optResolveLiveVal() {return this.optVal()}
  reqResolveLiveVal() {return this.reqVal()}

  reqAddr() {return this.reqSrcInstAt(1, jnst.Str)}
  reqDest() {return this.reqSrcAt(2)}
  optDest() {return this.optSrcAt(2)}
  optDestName() {return this.onlySrcInstAt(2, jniu.IdentUnqual)}
  reqDestName() {return this.reqSrcInstAt(2, jniu.IdentUnqual)}
  optDestStr() {return this.onlySrcInstAt(2, jnst.Str)}
  reqDestStr() {return this.reqSrcInstAt(2, jnst.Str)}

  macroImpl() {
    this.reqSrcList().reqEveryChildNotCosmetic().reqChildCountBetween(2, 3)
    this.reqAddr()

    if (!this.optDest()) return this.macroDestNil()
    if (this.optDestName()) return this.macroDestName()
    if (this.optDestStr()) return this.macroDestStr()

    throw this.err(`${a.reqStr(this.msgArgDest())}; found unrecognized node ${a.show(this.reqDest())}`)
  }

  async macroDestNil() {
    await this.reqImport()
    return this
  }

  async macroDestName() {
    await this.reqImport()

    /*
    Technical note. When reading this code, it may be unclear how this allows
    identifiers referencing our declaration to gain access to the live value of
    the imported module. This works because this class implements the method
    `.optResolveLiveVal`, which is a common interface used by various other
    classes. When an identifier finds this node in a lexical namespace, it will
    call this to obtain the live value. See `Ident..optResolveLiveVal`.
    */
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

  async macroDestMixin() {
    await this.reqImport()
    this.reqNsLex().addMixin(this.initNsLive())
    return this
  }

  msgArgDest() {
    return `macro ${a.show(this)} requires the argument at index 2 to be one of the following: missing; unqualified identifier; string containing exactly ${a.show(this.mixinStr())}`
  }

  async reqImport() {
    const addr = this.reqAddr().reqVal()

    /*
    We must start this search on the parent, because otherwise the combination
    of `.reqAncFind` and `isReqImporter` would match the current node and recur
    indefinitely, causing stack overflow.
    */
    const importer = this.reqParent().reqAncFind(jm.isReqImporter)

    this.setVal(await importer.reqImport(addr))
    return this
  }

  /*
  This node is for compile-time imports only. When used as a statement, we can
  simply exclude it from the compiled code. Also, this may be used as an
  expression, if the parent node avoids calling this node's compilation method,
  and excludes it from the compiled code in some other way. Otherwise, an
  exception is the only sensible option left.
  */
  compile() {
    if (this.isStatement()) return undefined
    throw this.err(`unexpected attempt to compile macro node ${a.show(this)} in an expression position`)
  }
}

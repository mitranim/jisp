import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jv from './jisp_valued.mjs'
import * as jns from './jisp_ns.mjs'
import * as jnib from './jisp_node_import_base.mjs'

/*
This class implements compile-time imports, which are used for compile-time
replacement of AST nodes, also known as macroing. Compare macro `Import` which
is used for runtime-only imports.

This should be the ONLY member of the "predeclared" scope. All other identifiers
provided by the language must be part of the "prelude" module which must be
imported via `Use`.
*/
export class Use extends jns.MixOwnNsLived.goc(jv.MixOwnValued.goc(jnib.ImportBase)) {
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

  async macroDestNil() {
    await this.reqImport()
    return this
  }

  /*
  Technical note. When reading this code, it may be unclear how this allows
  identifiers referencing our declaration to gain access to the live value of
  the imported module. This works because this code indirectly invokes
  `Node..declareLex`, which adds the current node to the nearest lexical
  namespace, and because this class implements the method `.optResolveLiveVal`,
  which is a common interface used by various other classes, particularly by
  `Ident`. When an identifier finds this node `Use` in a lexical namespace, it
  will call `Use..optResolveLiveVal` to obtain the live value. Also see
  `Ident..optResolveLiveVal`.
  */
  async macroDestName() {
    await this.reqImport()
    return super.macroDestName()
  }

  async macroDestMixin() {
    await this.reqImport()
    this.reqNsLex().addMixin(this.initNsLive())
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
    if (this.isStatement()) return ``
    throw this.err(`unexpected attempt to compile macro node ${a.show(this)} in an expression position`)
  }

  async reqImport() {
    await this.resolve()
    await this.ready()
    return this.setVal(await import(this.reqTarPathAbs()))
  }

  [ji.symInsp](tar) {return super[ji.symInsp](tar).funs(this.optVal)}
}

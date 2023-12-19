import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
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

TODO:

  * Instead of `"*"`, consider using `*` without quotes. Requires tokenizer
    changes. At the time of writing, this syntax is not supported by our
    tokenizer at all. Note that unlike traditional Lisps, we restrict our
    identifiers to the format of valid JS identifiers. See
    `Ident.regexpIdentUnqual`.

      [use `some_path` `*`]
      ↓
      [use `some_path` *]
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
    return super.macroDestName()
  }

  async macroDestMixin() {
    await this.reqImport()
    this.reqNsLex().addMixin(this.initNsLive())
    return this
  }

  async reqImport() {
    return this.setVal(await import(await this.resolveImport()))
  }

  async resolveImport() {
    const srcPath = this.reqAddr().reqVal()

    // This is typically a `Module`.
    const resolver = this.reqParent().reqAncFind(jm.isImportResolver)

    /*
    Import resolving is asynchronous because it may involve converting a Jisp
    file to a JS file, or finding an already-existing compiled file.
    Compilation is async because it may involve native imports, and FS
    operations are async in the general case (varies by platform).
    */
    const tarPath = await resolver.resolveImport(srcPath)

    if (!a.isInst(tarPath, URL)) {
      throw this.err(`expected import resolver ${a.show(resolver)} to resolve import path ${a.show(srcPath)} to URL object, but it resolved to ${a.show(tarPath)}`)
    }
    return tarPath
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
}

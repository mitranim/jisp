import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './insp.mjs'
import * as jm from './misc.mjs'
import * as jns from './ns.mjs'
import * as jl from './lexer.mjs'
import * as jn from './node.mjs'
import * as jnnl from './node_node_list.mjs'
import * as jnu from './node_use.mjs'
import * as jnc from './node_const.mjs'
import * as jniu from './node_ident_unqual.mjs'
import * as jnst from './node_str.mjs'
import * as jnim from './node_import.mjs'
import * as jnv from './node_val.mjs'

export class ModuleNodeList extends jns.MixOwnNsLexed.goc(jnnl.NodeList) {
  /*
  Optional override for `MixLiveValuedInner`. If this code is uncommented, any
  live properties added here are contextually available to all code in all
  modules, by using the orphan form of `IdentAccess`. The typical use case is
  the following: `[.use `jisp:prelude.mjs` *]`.

  static makeLiveValInner() {
    const tar = a.npo()
    tar.use = jnu.Use
    return tar
  }
  */

  // Used by `.parse`. May override in subclass.
  get Lexer() {return jl.Lexer}

  parse(src) {
    this.initSpan().init(src)
    this.setChildren(...new this.Lexer().initFromStr(src))
    return this
  }

  /*
  Immediate children of a module typically begin with `Use`, whose macro
  implementation is async. As a result, module macroing is almost always
  asynchronous. We prefer synchronous macroing whenever possible, due to
  huge overheads of async/await, but we should also automatically switch
  into async mode when necessary. The super method `NodeList..macroFrom`
  should support both modes.
  */
  macro() {return this.macroFrom(0)}

  compile() {return this.reqPrn().compileStatements(this.optChildArr())}

  // Override for `Node..isChildStatement`.
  isChildStatement() {return true}

  /*
  Override for `Node..isModuleRoot`. Enables features that work only in module
  root due to JS limitations.
  */
  isModuleRoot() {return true}

  /*
  Override for `Node..err` to avoid appending source code context to error
  messages. A module derives its source span from the source spans of its first
  and last child nodes. Typically, this means that the module's source context
  points to `1:1`, which is not very useful. Without this override, sometimes
  we would generate module-level errors with source code context for `1:1`,
  which would be preserved as-is by caller nodes which would otherwise generate
  a more specific error pointing to the actual relevant place in the code.
  */
  err(...val) {return Error(...val)}

  /*
  Counter used for automatically generated names. The counter is per module,
  rather than per some hypothetical descendant, because within one module, all
  auto-generated names need to be unique. That's because we need to avoid
  collisions between generated names at the module root level and generated
  names in inner scopes.
  */
  #gen = 0
  genInc() {return ++this.#gen}
  genName() {return `$_gen_` + this.genInc()}

  /*
  Takes an import address, ensures that the current module has an automatically
  generated import statement with this address that uses a "named" form, and
  returns the name declared by that import statement. Useful when implicitly
  adding imports. See the macro `Quote` and associated tests.
  */
  reqAutoImportName(src) {return a.pk(this.reqAutoImport(src))}

  reqAutoImport(src) {
    const tar = this.initAutoImports()
    return tar.get(src) ?? tar.setted(src, this.addAutoImport(src))
  }

  #autoImports = undefined
  initAutoImports() {return this.#autoImports ??= new ImportMap()}
  optAutoImports() {return this.#autoImports}

  /*
  Known issue: the resulting node has no reference to source code.
  Any exceptions that may occur during its macroing or compilation
  would have only an error message, without associated source code.
  */
  addAutoImport(src) {
    const tar = new jnim.Import().setChildren(
      new jnst.StrBacktick().setVal(src),
      new jniu.IdentUnqual().setName(this.genName()),
    )
    this.appendChild(tar)
    return tar
  }

  /*
  Takes an arbitrary JS value, which must be serializable via `Val`, ensures
  that the current module has an automatically generated variable with this
  value assigned, and returns the name declared by that variable.
  */
  reqAutoValName(src) {return a.pk(this.reqAutoVal(src))}

  reqAutoVal(src) {
    const tar = this.initAutoVals()
    return tar.get(src) ?? tar.setted(src, this.addAutoVal(src))
  }

  #autoVals = undefined
  initAutoVals() {return this.#autoVals ??= new ConstPrivateMap()}
  optAutoVals() {return this.#autoVals}

  /*
  Known issue: the resulting node has no reference to source code.
  Any exceptions that may occur during its macroing or compilation
  would have only an error message, without associated source code.
  */
  addAutoVal(src) {
    const tar = new ConstPrivate().setChildren(
      new jniu.IdentUnqual().setName(this.genName()),
      new jnv.Val().setVal(jnv.Val.reqValid(src)),
    )
    this.appendChild(tar)
    return tar
  }

  get [jm.symType]() {return jm.symTypeModuleNodeList}

  [ji.symInsp](tar) {
    return super[ji.symInsp](tar.funs(this.optModule, this.optNsLex))
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

class ImportMap extends a.TypedMap {
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return a.reqInst(val, jnim.Import)}
}

class ConstPrivateMap extends a.TypedMap {
  reqKey(key) {return key}
  reqVal(val) {return a.reqInst(val, ConstPrivate)}
}

class ConstPrivate extends jnc.Const {
  isExportable() {return false}
}

import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as je from './jisp_err.mjs'
import * as jns from './jisp_ns.mjs'
import * as jl from './jisp_lexer.mjs'
import * as jv from './jisp_valued.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

export class Module extends jv.MixOwnValued.goc(jns.MixOwnNsLexed.goc(jnnl.NodeList)) {
  // FIXME consider using `Url`.
  #url = undefined
  setUrl(val) {return this.#url = this.req(val, jm.isCanonicalModuleUrlStr), this}
  ownUrl() {return this.#url}
  reqUrl() {return this.ownUrl() ?? this.throw(`missing module URL at ${a.show(this)}`)}

  pk() {return this.ownUrl()}
  setVal(val) {return super.setVal(jm.reqNativeModule(val))}

  /*
  FIXME:

    * Handle `jisp:` scheme specially, by calling root method that imports
      relatively to compiler source code.

    * If path is `URL`, or string with scheme, or string and absolute
      (starts with `/`), then convert to `URL` and call root method that
      performs FS-based import.

    * If path is relative, then resolve to absolute `URL`, then see above.

    * Current module URL should be required ONLY when the import is relative.

    * Reconsider the return value.
  */
  import(val) {
    return this.reqAncFind(jm.isImporterRel).importRel(val, this.reqUrl())
  }

  // Used by `.parse`.
  get Lexer() {return jl.Lexer}

  parse(src) {
    this.initSpan().init(src)
    this.setChildren(...new this.Lexer().initFromStr(src))
    return this
  }

  /*
  Async version of `NodeList..macroImpl` without support for "list call" syntax.
  This let us support async macros in module root, such as `Use`, which has to
  be asynchronous because it uses native JS imports, which return promises.
  Other macro implementations must be synchronous for simplicity and speed.
  */
  async macroImpl() {
    const tar = this.childArr()
    let ind = -1
    while (++ind < tar.length) {
      let val = this.constructor.macroNodeAsync(tar[ind])
      if (a.isPromise(val)) val = await val
      tar[ind] = val
    }
    return this
  }

  compile() {return this.compileBody()}
  compileBody() {return this.reqCodePrinter().compileStatements(this.childIter())}

/*
  // FIXME: generate header file.
  compile() {return jm.joinLines(this.compileBody(), this.compileHead())}
  compileHead() {return `export default ` + JSON.stringify(this.header())}
  // FIXME implement.
  header() {}
*/

  /*
  Override for `Node..err` to avoid using `CodeErr`. A module span always points
  to `row:col = 1:1`, which is not very useful. More importantly, `Node..toErr`
  preserves instances of `CodeErr` as-is. Without this override, sometimes we
  would generate module-level `CodeErr` with `row:col = 1:1`, which would be
  preserved as-is by caller nodes which would otherwise generate a more
  specific `CodeErr` pointing to the actual relevant place in the code.
  */
  err(...val) {return new je.Err(...val)}

  // FIXME drop. You can't make this from a native module.
  //
  // static fromNative(key, src) {
  //   a.req(key, jm.isAbsUrlStr)
  //   jm.reqNativeModule(src)
  //
  //   return (
  //     a.onlyInst(src.default, Module) ??
  //     this.makeFromNative(src)
  //   ).setVal(src).setUrl(key)
  // }

  // FIXME drop. You can't make this from a native module.
  //
  // static makeFromNative(src) {
  //   const tar = new this()
  //   tar.ownScope().setPubNs(new jns.Ns().addFromNativeModule(src))
  //   return tar
  // }

  [ji.symInsp](tar) {
    return super[ji.symInsp](tar).funs(this.optSpan, this.optNsLex)
  }
}

/*
export class ModuleColl extends a.Coll {
  // For `a.TypedMap` used by `a.Coll`.
  reqKey(key) {return jm.reqCanonicalModuleUrlStr(key)}
  reqVal(val) {return a.reqInst(val, Module)}
}

export class ModuleColl extends jp.MixParent(jch.MixChild(a.Coll)) {
  // For `a.TypedMap` used by `a.Coll`.
  reqKey(key) {return jm.reqCanonicalModuleUrlStr(key)}
  reqVal(val) {return a.reqInst(val, Module).setParent(this)}
}

export class MixOwnModuleColld extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnModuleColld extends jp.MixParent.goc(cls) {
      #moduleColl = undefined
      ownModuleColl() {return this.#moduleColl ??= new ModuleColl().setParent(this)}
    }
  }
}
*/

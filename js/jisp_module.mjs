import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jns from './jisp_ns.mjs'
import * as jn from './jisp_node.mjs'
import * as jl from './jisp_lexer.mjs'
import * as jv from './jisp_valued.mjs'
import * as jsc from './jisp_scoped.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

/*
FIXME rework: split into `SrcModule` and `TarModule`.
*/
export class Module extends jv.MixOwnValued.goc(jsc.MixOwnScoped.goc(jnnl.NodeList)) {
  // FIXME consider using `Url`.
  #url = undefined
  ownUrl() {return this.#url}
  setUrl(val) {return this.#url = this.req(val, jm.isCanonicalModuleUrlStr), this}
  reqUrl() {return this.ownUrl() ?? this.throw(`missing module URL at ${a.show(this)}`)}

  pk() {return this.ownUrl()}
  setVal(val) {return super.setVal(jm.reqNativeModule(val))}
  fromStr(val) {return this.setNodes(jl.Lexer.nodesFromStr(val))}
  import(val) {return this.reqRoot().importRel(val, this.reqUrl())}
  makeScope() {return this.constructor.makeScope()}
  static makeScope() {return new ModuleScope()}
  // Used by namespace mixins.
  optNs() {return this.ownScope().optPubNs()}
  toValidChild(val) {return this.toValidChildBase(val)}

  /*
  Async version of `NodeList..macroImpl` without support for "list call" syntax.
  This let us support `Use`, which uses dynamic/async imports, in module root.
  Other macro implementations must be synchronous for simplicity and speed.
  */
  async macroImpl() {
    const tar = this.ownNodes()
    let ind = -1
    while (++ind < tar.length) {
      tar[ind] = await jn.Node.macroNodeAsync(tar[ind])
    }
    return this
  }

  // FIXME: generate header file.
  compile() {return jm.joinLines(this.compileBody(), this.compileHead())}

  compileBody() {return this.reqCodePrinter().compileStatements(this)}

  compileHead() {return `export default ` + JSON.stringify(this.header())}

  // FIXME implement.
  header() {}

  static fromNative(key, src) {
    a.req(key, jm.isAbsUrlStr)
    jm.reqNativeModule(src)

    return (
      a.onlyInst(src.default, Module) ??
      new this().setScope(
        this.makeScope().setPubNs(new jns.Ns().addFromNativeModule(src))
      )
    ).setVal(src).setUrl(key)
  }

  [ji.symInspMod](tar) {return tar.funs(this.optSpan, this.optScope)}
}

export class ModuleColl extends a.Coll {
  // For `a.TypedMap` used by `a.Coll`.
  reqKey(key) {return jm.reqCanonicalModuleUrlStr(key)}
  reqVal(val) {return a.reqInst(val, Module)}
}

import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jns from './jisp_ns.mjs'
import * as jn from './jisp_node.mjs'
import * as jl from './jisp_lexer.mjs'
import * as jv from './jisp_valued.mjs'
import * as jsc from './jisp_scope.mjs'
import * as jscd from './jisp_scoped.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

/*
FIXME rework: split into `SrcModule` and `TarModule`.
*/
export class Module extends jv.MixOwnValued.goc(jscd.MixOwnScoped.goc(jnnl.NodeList)) {
  // FIXME consider using `Url`.
  #url = undefined
  ownUrl() {return this.#url}
  setUrl(val) {return this.#url = this.req(val, jm.isCanonicalModuleUrlStr), this}
  reqUrl() {return this.ownUrl() ?? this.throw(`missing module URL at ${a.show(this)}`)}

  pk() {return this.ownUrl()}
  setVal(val) {return super.setVal(jm.reqNativeModule(val))}
  toValidChild(val) {return this.toValidChildBase(val)}
  import(val) {return this.reqAncFind(jm.isImporterRel).importRel(val, this.reqUrl())}

  // Override for `MixOwnScoped`.
  get Scope() {return jsc.ModuleScope}

  // Used by namespace mixins.
  optNs() {return this.ownScope().optPubNs()}

  get Lexer() {return jl.Lexer}
  parse(src) {return this.setNodes(this.Lexer.nodesFromStr(src))}

  /*
  Async version of `NodeList..macroImpl` without support for "list call" syntax.
  This let us support async macros in module root, such as `Use`, which has to
  be asynchronous because it uses native JS imports, which return promises.
  Other macro implementations must be synchronous for simplicity and speed.
  */
  async macroImpl() {
    const tar = this.ownNodes()
    let ind = -1
    while (++ind < tar.length) {
      let val = this.macroNodeAsync(tar[ind])
      if (a.isPromise(val)) val = await val
      tar[ind] = val
    }
    return this
  }

  get Node() {return jn.Node}
  macroNode(val) {return this.Node.macroNode(val)}
  macroNodeAsync(val) {return this.Node.macroNodeAsync(val)}

  compile() {return this.compileBody()}
  compileBody() {return this.reqCodePrinter().compileStatements(this)}

/*
  // FIXME: generate header file.
  compile() {return jm.joinLines(this.compileBody(), this.compileHead())}
  compileHead() {return `export default ` + JSON.stringify(this.header())}
  // FIXME implement.
  header() {}
*/

  static fromNative(key, src) {
    a.req(key, jm.isAbsUrlStr)
    jm.reqNativeModule(src)

    return (
      a.onlyInst(src.default, Module) ??
      this.makeFromNative(src)
    ).setVal(src).setUrl(key)
  }

  static makeFromNative(src) {
    const tar = new this()
    tar.ownScope().setPubNs(new jns.Ns().addFromNativeModule(src))
    return tar
  }

  [ji.symInspInit](tar) {return tar.funs(this.optSpan, this.optScope)}
}

export class ModuleColl extends a.Coll {
  // For `a.TypedMap` used by `a.Coll`.
  reqKey(key) {return jm.reqCanonicalModuleUrlStr(key)}
  reqVal(val) {return a.reqInst(val, Module)}
}

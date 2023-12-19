import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as jc from './jisp_conf.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as je from './jisp_err.mjs'
import * as jns from './jisp_ns.mjs'
import * as jl from './jisp_lexer.mjs'
import * as jv from './jisp_valued.mjs'
import * as jnnl from './jisp_node_node_list.mjs'

export class Module extends jns.MixOwnNsLexed.goc(jnnl.NodeList) {
  pk() {return this.reqUrl()}

  #url = undefined
  setUrl(val) {return this.#url = this.req(val, jm.isCanonicalModuleUrlStr), this}
  ownUrl() {return this.#url}
  reqUrl() {return this.ownUrl() ?? this.throw(`missing module URL at ${a.show(this)}`)}

  // Used by `.parse`. May be overridden by subclasses.
  get Lexer() {return jl.Lexer}

  parse(src) {
    this.initSpan().init(src)
    this.setChildren(...new this.Lexer().initFromStr(src))
    return this
  }

  /*
  Async override of `NodeList..macroImpl`. This let us support, in module root
  only, async macros such as `Use`. Import macros have to be asynchronous
  because of native JS imports, which return promises. Other macros must be
  synchronous for simplicity and speed.
  */
  async macroImpl() {
    let ind = -1
    while (++ind < this.childCount()) {
      let val = this.constructor.macroNode(this.reqChildAt(ind))
      if (a.isPromise(val)) val = await val
      this.replaceChildAt(ind, val)
    }
    return this
  }

  compile() {return this.compileBody()}
  compileBody() {return this.reqCodePrinter().compileStatements(this.childIter())}

  /*
  Override for `Node..err` to avoid using `CodeErr`. A module span always points
  to `row:col = 1:1`, which is not very useful. More importantly, `Node..toErr`
  preserves instances of `CodeErr` as-is. Without this override, sometimes we
  would generate module-level `CodeErr` with `row:col = 1:1`, which would be
  preserved as-is by caller nodes which would otherwise generate a more
  specific `CodeErr` pointing to the actual relevant place in the code.
  */
  err(...val) {return new je.Err(...val)}

  /*
  Import resolution should be implemented at two levels: `Module` and `Root`.

  At the level of `Root`, we should accept only absolute file URLs, and handle
  only conversion of Jisp files to JS files, which involves deduplication,
  deadlock prevention, and caching.

  At the level of `Module`, we should handle all other cases, including but not
  limited to the following:

    * Handling `jisp:`-scheme imports, which allow user code to import arbitrary
      files from the Jisp compiler.
    * Converting relative paths to absolute paths.
    * Handling any non-Jisp imports.
    * Detecting Jisp imports and using `Root` for those.
  */
  resolveImport(src) {
    src = this.importPathToUrl(src)
    this.reqInst(src, URL)

    if (jm.optUrlFileExt(src) === jc.conf.getFileExtSrc()) {
      throw this.err(`FIXME NYI: need to use root to convert Jisp to JS and resolve to a URL of the resulting JS file`)
      // return this.reqAncFind(jm.blahBlaher).blahBlah(src)
    }

    return src
  }

  importPathToUrl(src) {
    if (a.isInst(src, URL)) return src
    this.req(src, a.isStr)

    const compilerUrl = jm.optCompilerImportPathToCompilerUrl(src)
    if (compilerUrl) return compilerUrl

    if (jm.hasScheme(src)) return new URL(src)
    if (p.posix.isAbs(src)) return new URL(src, `file:`)

    /*
    Handling other special cases first allows us to require the module URL only
    when it's actually needed. This is also convenient for testing.
    */
    return new URL(src, this.reqUrl())
  }

  [ji.symInsp](tar) {
    return super[ji.symInsp](tar).funs(this.optSpan, this.optNsLex)
  }
}

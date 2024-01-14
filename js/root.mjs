import {a, p} from './dep.mjs'
import * as ji from './insp.mjs'
import * as jc from './conf.mjs'
import * as jm from './misc.mjs'
import * as jp from './parent.mjs'
import * as jfs from './fs.mjs'
import * as jns from './ns.mjs'
import * as jcpd from './code_printed.mjs'
import * as jnu from './node_use.mjs'
import * as jmo from './module.mjs'

export class Root extends (
  jns.MixOwnNsLexed.goc(
    jfs.MixOwnFsed.goc(
      jcpd.MixOwnCodePrinted.goc(
        jp.MixParent.goc(
          ji.MixInsp.goc(
            a.Emp
          )
        )
      )
    )
  )
) {
  /*
  Used for parsing and compiling Jisp sources.
  May override in superclass.
  */
  get Module() {return jmo.Module}

  /*
  Must synchronously return a `Module` corresponding to this source URL string,
  if one has already been created and cached. Must not create any new objects.
  */
  optModule(src) {
    this.opt(src, jm.isCanonicalModulePath)
    return src && this.#optModuleColl()?.get(src)
  }

  /*
  Must synchronously return a `Module` corresponding to this source URL string,
  creating and caching one if necessary. Must always return the same value for
  the same key.
  */
  reqModule(src) {
    return (
      this.optModule(src) ??
      this.#initModuleColl().setted(src, this.makeModule().setSrcPathAbs(src))
    )
  }

  makeModule() {return new this.Module().setParent(this)}

  reqModuleNorm(val) {
    this.reqInst(val, this.Module)
    const tar = this.#initModuleColl()
    const key = a.pk(val)
    return tar.get(key) ?? tar.setted(key, val.setParent(this))
  }

  #moduleColl = undefined
  #initModuleColl() {return this.#moduleColl ??= new jmo.ModuleColl()}
  #optModuleColl() {return this.#moduleColl}

  async reqModuleReadyPath(src) {
    return (await this.reqModule(src).ready()).reqTarPathAbs()
  }

  /*
  Takes an absolute URL string pointing to the source location of an imported
  file. Returns an absolute URL string pointing to the eventual target location
  of the imported file.

  For non-Jisp files, this returns the source URL as-is. Non-Jisp files stay
  where they are.

  For Jisp files, the source URL may point to an arbitrary location, and must
  have the extension `.jisp`. The target URL points to a location inside the
  target directory provided to `Fs` provided to `Root`, and the file extension
  is changed to `.mjs`.

  This involves caching, and more specifically promise caching, for several
  reasons.

    * Caching potentially allows the algorithm that converts source URLs to
      target URLs to be non-deterministic, for example by using random salts
      rather than hashes. Storing the mapping from source URLs to target URLs
      allows us to pretend that this conversion is a pure function.

    * Promises are forced here by the native crypto API, which we use for
      hashing.

    * This conversion involves the native crypto API and multiple operations
      with the native `URL` API. All of those are on a slow side.
  */
  srcUrlStrToTarUrlStr(src) {
    this.req(src, jm.isCanonicalModuleUrlStr)
    const tar = this.#initSrcUrlStrToTarUrlStr()
    return tar.get(src) ?? tar.setted(src, this.srcUrlStrToTarUrlStrUncached(src))
  }

  /*
  Mostly for private use. May also be overridden by subclasses. Callers should
  use `.srcUrlStrToTarUrlStr`.

  FIXME: opt-in overrides: mapping specific source dirs or paths to specific
  intermediary paths, replacing the default hash.
  */
  async srcUrlStrToTarUrlStrUncached(src) {
    this.req(src, jm.isCanonicalModuleUrlStr)

    /*
    For non-Jisp files, absolute source URL and absolute target URL are always
    the same. For Jisp files, they're always different.
    */
    if (!jm.isCanonicalModuleSrcUrlStr(src)) return src

    src = new jm.Url(src)
    const tarUrl = this.reqFs().reqTarUrl()

    // FIXME move to smaller method to make it easier to implement overrides.
    const hash = await jm.strToHash(
      src.clone().toDir().optRelTo(tarUrl) ??
      src.href
    )

    const tarName = src.getBaseNameWithoutExt() + a.reqStr(jc.conf.getFileExtTar())
    const tarPath = p.posix.join(hash, tarName)

    return new jm.Url(tarPath, tarUrl).href
  }

  #srcUrlStrToTarUrlStr = undefined
  #initSrcUrlStrToTarUrlStr() {return this.#srcUrlStrToTarUrlStr ??= new jm.PromiseMap()}

  /*
  Override for `MixOwnNsLexed`. The resulting lexical namespace is inherited
  by all modules in this root. This is where we add globally predeclared names.
  The default implementation should contain exactly one declaration: `use`.
  Other common built-ins should be provided by the prelude module, which should
  be imported via `use`.
  */
  makeNsLex() {return super.makeNsLex().addMixin(this.makeNsLive())}

  makeNsLive() {return new jns.NsLiveUnref().setLiveVal(this.makeNsLiveVal())}

  makeNsLiveVal() {
    const tar = a.npo()
    tar.use = jnu.Use
    return tar
  }

  get [jm.symType]() {return jm.symTypeRoot}
  [ji.symInsp](tar) {return tar.funs(this.ownFs)}
}

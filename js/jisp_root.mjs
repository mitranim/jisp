import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as ji from './jisp_insp.mjs'
import * as jc from './jisp_conf.mjs'
import * as jm from './jisp_misc.mjs'
import * as je from './jisp_err.mjs'
import * as jp from './jisp_parent.mjs'
import * as jfs from './jisp_fs.mjs'
import * as jns from './jisp_ns.mjs'
import * as jcp from './jisp_code_printer.mjs'
import * as jcpd from './jisp_code_printed.mjs'
import * as jnu from './jisp_node_use.mjs'
import * as jnm from './jisp_node_module.mjs'

/*
TODO:

  * Module dependency graphs (acyclic).
  * Checksums (ƒ of path).
  * Use header files.
  * Use cached files, invalidate by own and dependency checksums.
*/
export class Root extends jns.MixOwnNsLexed.goc(jfs.MixOwnFsed.goc(jcpd.MixOwnCodePrinted.goc(jp.MixParent.goc(ji.MixInsp.goc(a.Emp))))) {
  /*
  Used for parsing and compiling Jisp sources.
  May override in superclass.
  */
  get Module() {return jnm.Module}

  /*
  Override for `MixOwnNsLexed`. The resulting lexical namespace is inherited by
  all modules in this root. This is where we add globally predeclared names.
  The default implementation should contain exactly one declaration: `use`.
  Other common built-ins should be provided by the prelude module, which should
  be imported via `use`.
  */
  makeNsLex() {return super.makeNsLex().addMixin(this.makeNsMixin())}

  makeNsMixin() {
    const tar = a.npo()
    tar.use = jnu.Use
    return new jns.NsLive().setVal(tar)
  }

  /*
  FIXME:

    * Deadlock detection.
    * Persistent FS caching. (Reused between different `Root` runs.)
      * Requires dependency graph for detecting outdated.
  */
  resolveLangFile(src) {
    src = new jm.Url(src).toCanonical()
    const key = src.href
    const tar = this.initImportCache()
    return tar.get(key) ?? tar.setted(key, this.resolveLangFileUncached(src))
  }

  async resolveLangFileUncached(srcUrl) {
    const tarUrl = await this.srcUrlToTarUrl(srcUrl)
    const fs = this.reqFs()
    const srcText = await fs.read(srcUrl)

    const mod = new this.Module()
      .setParent(this)
      .setUrl(srcUrl.href)
      .parse(srcText)

    await mod.macro()
    const tarText = mod.compile()

    await fs.write(tarUrl, tarText)
    return tarUrl
  }

  srcUrlToTarUrl(src) {
    src = new jm.Url(src).toCanonical()
    const key = src.href
    const tar = this.#initSrcUrlToTarUrl()
    return tar.get(key) ?? tar.setted(key, this.srcUrlToTarUrlUncached(src))
  }

  /*
  Mostly for private use. May also be overridden by subclasses. Callers should
  use `.srcUrlToTarUrl`.

  FIXME consider returning string instead of URL object to avoid accidental
  mutation by errant callers.

  FIXME: opt-in overrides: mapping specific source dirs or paths to specific
  intermediary paths, replacing the default hash.
  */
  async srcUrlToTarUrlUncached(src) {
    this.reqInst(src, jm.Url)
    if (!src.hasExtSrc()) return src

    const tarUrl = this.reqFs().reqTarUrl()

    const hash = await jm.strToHash(
      src.clone().toDir().optRelTo(tarUrl) ??
      src.href
    )

    const tarName = src.getBaseNameWithoutExt() + a.reqStr(jc.conf.getFileExtTar())
    const tarPath = p.posix.join(hash, tarName)

    return new jm.Url(tarPath, tarUrl)
  }

  /*
  This caching is used for several reasons.

  This potentially allows the algorithm that converts source URLs to target URLs
  to be non-deterministic, for example by using random salts rather than
  hashes. Storing the mapping from source URLs to target URLs allows us to
  pretend that this conversion is a pure function.

  This conversion may involve using the native crypto API for hashing, and many
  operations wiht the native `URL` API, all of which are on a slow side.
  */
  #srcUrlToTarUrl = undefined
  #initSrcUrlToTarUrl() {return this.#srcUrlToTarUrl ??= new jm.PromiseMap()}

  #importCache = undefined
  initImportCache() {return this.#importCache ??= new jm.PromiseMap()}
  optImportCache() {return this.#importCache}

/*
  async resolveLangFileUncached(key) {
    const nativeUrl = new jm.Url(a.reqStr(key) + `.native` + jc.conf.getFileExtTar())
    const headerUrl = new jm.Url(a.reqStr(key) + `.header` + jc.conf.getFileExtTar())

    // FIXME skip on 404.
    const [native, header] = await Promise.all([
      this.reqFs().read(nativeUrl),
      this.reqFs().read(headerUrl),
    ])

    if (native && header) {
      // FIXME cache invalidation:
      //   * Header stores checksums.
      //   * Header stores dependency list.
      //   * Compare to checksums for:
      //     * Requested module.
      //     * Dependencies.
    }
  }
*/

  [ji.symInsp](tar) {return tar.funs(this.ownFs)}
}

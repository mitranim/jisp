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
First approximation:

  * Pluggable FS implementation, read-only.
  * RAM-only caching.
  * Dedup imports.
  * No disk writes.

TODO second approximation:

  * Disk writes.
  * Disk/net caching.
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

    * Promise dedup.
    * Deadlock detection.
    * Persistent FS caching.
      * Requires dependency graph for detecting outdated.
  */
  resolveLangFile(src) {
    this.reqInst(src, URL)
    src = jm.urlWithoutDecorations(src)
    const key = this.req(src.href, a.isValidStr)
    const tar = this.initImportCache()
    return tar.get(key) ?? tar.setted(key, this.resolveLangFileUncached(src))
  }

  async resolveLangFileUncached(srcUrl) {
    this.req(srcUrl, jm.isCanonicalModuleUrl)

    const srcStr = this.req(srcUrl.href, a.isValidStr)
    const srcExt = p.posix.ext(srcUrl.pathname)
    const expExtSrc = a.reqValidStr(jc.conf.getFileExtSrc())

    if (srcExt !== expExtSrc) {
      throw this.err(`expected import path with extension ${a.show(expExtSrc)}, got import path ${a.show(srcStr)}`)
    }

    const fs = this.reqFs()

    const tarRel = (
      a.stripSuf(fs.relTar(srcStr), expExtSrc) +
      a.reqValidStr(jc.conf.getFileExtOut())
    )

    // TODO: stricter validation: ensure that the resolved target path is
    // actually a subpath of `fs.reqTar()`.
    if (!jm.isStrictRelPathStr(tarRel)) {
      throw this.err(`expected FS ${a.show(fs)} of ${a.show(this)} to resolve import URL ${a.show(srcStr)} to relative path, got ${a.show(tarRel)}`)
    }

    const tarUrl = new URL(fs.toAbs(tarRel), `file:`)

    /*
    We pass `URL` here, rather than a string, for compatibility with Deno, where
    string paths are interpreted as filesystem paths, whereas `URL` objects
    enable support for file URLs.
    */
    const srcText = await fs.read(srcUrl)

    const mod = new this.Module().setParent(this).setUrl(srcStr).parse(srcText)
    await mod.macro()
    const tarText = this.req(mod.compile(), a.isStr)

    await fs.write(tarUrl, tarText)
    return tarUrl
  }

  #importCache = undefined
  initImportCache() {return this.#importCache ??= new jm.PromiseMap()}
  optImportCache() {return this.#importCache}

/*
  async resolveLangFileUncached(key) {
    const nativeUrl = new URL(a.reqStr(key) + `.native` + jc.conf.getFileExtOut())
    const headerUrl = new URL(a.reqStr(key) + `.header` + jc.conf.getFileExtOut())

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

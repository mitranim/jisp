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
export class Root extends jns.MixOwnLexNsed.goc(jfs.MixOwnFsed.goc(jcpd.MixOwnCodePrinted.goc(jp.MixParent.goc(ji.MixInsp.goc(a.Emp))))) {
  /*
  Override for `MixOwnLexNsed`. The resulting lexical namespace is inherited by
  all modules in this root. This is where we add globally predeclared names.
  The default implementation should contain exactly one declaration: `use`.
  Other common built-ins should be provided by the prelude module, which should
  be imported via `use`.

  FIXME: it might be ideal to get rid of "declarations" here, and use an
  approach based on "live values", same as used by `Use` in star-import mode.
  We could use that by adding a mixin to this lexical namespace, just like a
  star-import.
  */
  makeLexNs() {return super.makeLexNs().add(jnu.Use.decl())}

  // #nativeModuleCache = undefined
  // ownNativeModuleCache() {return this.#nativeModuleCache ??= new NativeModuleCache().setParent(this)}
  // setNativeModuleCache(val) {return this.#nativeModuleCache = this.reqInst(val, NativeModuleCache).setParent(this), this}

/*
  // FIXME: src module vs tar module.
  #moduleColl = undefined
  ownModuleColl() {return this.#moduleColl ??= new jnm.ModuleColl()}
  setModuleColl(val) {return this.#moduleColl = this.reqInst(val, jnm.ModuleColl), this}

  #importPromiseCache = undefined
  ownImportPromiseCache() {return this.#importPromiseCache ??= new jm.PromiseCache()}
  setImportPromiseCache(val) {return this.#importPromiseCache = this.reqInst(val, jm.PromiseCache), this}
*/

  // // Override for `MixOwnCodePrinted`.
  // get CodePrinter() {return jcp.CodePrinter}

  // // Override for `MixOwnCodePrinted`.
  // optCodePrinter() {
  //   return (
  //     super.optCodePrinter() ??
  //     this.setCodePrinter(new this.CodePrinter()).optCodePrinter()
  //   )
  // }

  /*
  FIXME:

    * Split this method in two.

      * One always takes a `URL` and uses `.ownFs` to load file and header (if any).

      * The other takes a file name (validate relative path without `..`) and
        loads a compiler source file, relative to this file, using the native
        import expression.

      * No special support for the `jisp:` scheme. That's handled at the level
        of `Module..import`, and calls the method above that natively imports a
        compiler source file.

    * Handle self-import.

    * Reconsider the return value. In the current implementation, the return
      value resolves to `Module`, which is WILDLY wrong.

  Somewhat similar to the JS built-in dynamic `import`, with various differences:

    * The output type is our own `Module` which combines a native JS module with
      our own metadata.

    * If the target is a Jisp file, we automatically convert it to JS, reusing
      from cache if possible.

    * If the target is available synchronously, returns `Module` rather than
      `Promise<Module>`. (Tentative, TODO split off to separate method.)
  */
  importRel(key, modUrl) {
    key = jm.unparametrize(key)
    this.req(modUrl, jm.isCanonicalModuleUrlStr)

    if (key.startsWith(jc.conf.getUrlScheme())) {
      return this.importComp(key.slice(jc.conf.getUrlScheme().length))
    }

    if (!jm.hasScheme(key)) {
      // TODO revise. URLs don't always end with a file name we can strip off.
      const dir = p.posix.dir(modUrl)
      key = p.posix.join(dir, key)
    }

    // this.req(key, jm.isCanonicalModuleUrlStr)
    if (key.endsWith(jc.conf.getFileExtSrc())) return this.importLang(key)
    return this.importNative(key)
  }

  importComp(key) {return this.importNative(jm.toCompFileUrl(key))}

  importNative(key) {
    return this.importCached(key, this.importNativeUncached)
  }

  async importNativeUncached(key) {
    this.req(key, jm.isCanonicalModuleUrlStr)
    return this.ownModuleColl().added(jnm.Module.fromNative(key, await import(key)))
  }

  importLang(key) {return this.importCached(key, this.importLangUncached)}

  // FIXME actual shit!
  async importLangUncached(key) {
    this.req(key, jm.isCanonicalModuleUrlStr)
    console.log(`importing:`, key)

    /*
    FIXME disk caching. Requires cache invalidation via checksums stored in
    header file and calculated from both the requested file and all its
    dependencies, which requires a module dependency graph.
    */
    if (jc.conf.getFsCaching()) {
      const nativeUrl = new URL(a.reqStr(key) + `.native` + jc.conf.getFileExtOut())
      const headerUrl = new URL(a.reqStr(key) + `.header` + jc.conf.getFileExtOut())

      // FIXME skip on 404.
      const [native, header] = await Promise.all([
        this.reqFs().read(nativeUrl),
        this.reqFs().read(headerUrl),
      ])

      if (native && header) {
        /*
        FIXME cache invalidation:
          * Header stores checksums.
          * Header stores dependency list.
          * Compare to checksums for:
            * Requested module.
            * Dependencies.
        */
      }
    }

    const srcUrl = new URL(a.reqStr(key))
    const src = await this.reqFs().read(srcUrl)

    // FIXME perhaps module requires path and registers in root immediately.
    // Allows self-import.
    //
    // Root may cache both lang modules and native modules???
    //
    // Separate lang modules from native modules?
    const mod = new jnm.Module().setParent(this).parse(src).setUrl(srcUrl.href)
    await mod.macro()

    const out = mod.compile()
    console.log(`out:`, out)

    const url = a.pk(mod)
    console.log(`url:`, url)

    const fs = this.ownFs()
    await fs.mock(a.pk(mod))

    // mod.toJSON() -> header data

    // FIXME:
    // * Module:
    //   * Compile to native.
    //   * Compile to header.
    //   * Write both to disk.
    //   * Import both.
    //   * Generate module from imported.

    FIXME
  }

  importCached(key, fun) {
    a.reqStr(key)
    a.reqFun(fun)
    return (
      this.ownModuleColl().get(key) ||
      this.ownImportPromiseCache().goc(key, fun, this)
    )
  }

  [ji.symInsp](tar) {return tar.funs(this.ownFs)}
}

/*
FIXME use or remove.

Intended for module imports. Probably don't need because we're going to use only
native imports, which are already deduplicated internally by every JS runtime.
*/
/*
export class MixPromiseCached extends a.DedupMixinCache {
  static make(cls) {
    return class MixPromiseCached extends je.MixErrer.goc(cls) {
      #promiseCache = undefined
      ownPromiseCache() {return this.#promiseCache ??= new jm.PromiseCache()}
      setPromiseCache(val) {return this.#promiseCache = this.reqInst(val, jm.PromiseCache), this}
    }
  }
}
*/

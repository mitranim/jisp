import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as jc from './jisp_conf.mjs'
import * as je from './jisp_err.mjs'
import * as jp from './jisp_parent.mjs'
import * as jfs from './jisp_fs.mjs'
import * as jcp from './jisp_code_printed.mjs'
import * as jnmo from './jisp_node_module.mjs'

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
export class Root extends jcp.MixOwnCodePrinted.goc(jp.MixParent.goc(je.MixErrer.goc(a.Emp))) {
  #fs = undefined
  setFs(val) {return this.#fs = this.toValidChild(a.reqInst(val, jfs.Fs)), this}
  ownFs() {return this.#fs}
  optFs() {return this.#fs}
  reqFs() {return this.optFs() ?? this.throw(`missing FS at ${a.show(this)}`)}

  // #nativeModuleCache = undefined
  // ownNativeModuleCache() {return this.#nativeModuleCache ??= this.toValidChild(new NativeModuleCache())}
  // setNativeModuleCache(val) {return this.#nativeModuleCache = this.toValidChild(this.reqInst(val, NativeModuleCache)), this}

  // FIXME: src module vs tar module.
  #moduleColl = undefined
  ownModuleColl() {return this.#moduleColl ??= new jnmo.ModuleColl()}
  setModuleColl(val) {return this.#moduleColl = this.reqInst(val, jnmo.ModuleColl), this}

  #importPromiseCache = undefined
  ownImportPromiseCache() {return this.#importPromiseCache ??= new jm.PromiseCache()}
  setImportPromiseCache(val) {return this.#importPromiseCache = this.reqInst(val, jm.PromiseCache), this}

  // Override for `MixOwnCodePrinted`.
  optCodePrinter() {return super.optCodePrinter() ?? (this.setCodePrinter(new CodePrinter()), super.optCodePrinter())}

  /*
  FIXME: handle self-import.

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

    if (key.startsWith(jc.Conf.main.SCHEME)) {
      return this.importComp(key.slice(jc.Conf.main.SCHEME.length))
    }

    if (!jm.hasScheme(key)) {
      // TODO revise. URLs don't always end with a file name we can strip off.
      const dir = p.posix.dir(modUrl)
      key = p.posix.join(dir, key)
    }

    // this.req(key, jm.isCanonicalModuleUrlStr)
    if (key.endsWith(jc.Conf.main.EXT_LANG)) return this.importLang(key)
    return this.importNative(key)
  }

  importComp(key) {return this.importNative(jm.toCompFileUrl(key))}

  importNative(key) {
    return this.importCached(key, this.importNativeUncached)
  }

  async importNativeUncached(key) {
    this.req(key, jm.isCanonicalModuleUrlStr)
    return this.ownModuleColl().added(jnmo.Module.fromNative(key, await import(key)))
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
    if (jc.Conf.main.DISK_CACHING) {
      const nativeUrl = new URL(a.reqStr(key) + `.native` + jc.Conf.main.EXT_NATIVE)
      const headerUrl = new URL(a.reqStr(key) + `.header` + jc.Conf.main.EXT_NATIVE)

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
    const mod = new jnmo.Module().setParent(this).fromStr(src).setUrl(srcUrl.href)
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
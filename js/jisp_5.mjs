/* eslint-disable no-unused-vars */

import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'

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
export class Root extends MixOwnCodePrinted.goc(MixParent.goc(MixErrer.goc(a.Emp))) {
  #fs = undefined
  ownFs() {return this.#fs}
  setFs(val) {return this.#fs = this.toValidChild(a.reqInst(val, Fs)), this}
  optFs() {return this.#fs}
  reqFs() {return this.optFs() ?? this.throw(`missing FS at ${a.show(this)}`)}

  // #nativeModuleCache = undefined
  // ownNativeModuleCache() {return this.#nativeModuleCache ??= this.toValidChild(new NativeModuleCache())}
  // setNativeModuleCache(val) {return this.#nativeModuleCache = this.toValidChild(this.reqInst(val, NativeModuleCache)), this}

  // FIXME: src module vs tar module.
  #moduleColl = undefined
  ownModuleColl() {return this.#moduleColl ??= new ModuleColl()}
  setModuleColl(val) {return this.#moduleColl = this.reqInst(val, ModuleColl), this}

  #importPromiseCache = undefined
  ownImportPromiseCache() {return this.#importPromiseCache ??= new PromiseCache()}
  setImportPromiseCache(val) {return this.#importPromiseCache = this.reqInst(val, PromiseCache), this}

  // Override for `MixOwnPrinted`.
  optPrn() {return super.optPrn() ?? (this.setPrn(new Prn()), super.optPrn())}

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
    key = unparametrize(key)
    this.req(modUrl, isCanonicalModuleUrlStr)

    if (key.startsWith(SCHEME)) {
      return this.importComp(key.slice(SCHEME.length))
    }

    if (!hasScheme(key)) {
      // TODO revise. URLs don't always end with a file name we can strip off.
      const dir = p.posix.dir(modUrl)
      key = p.posix.join(dir, key)
    }

    // this.req(key, isCanonicalModuleUrlStr)
    if (key.endsWith(EXT_LANG)) return this.importLang(key)
    return this.importNative(key)
  }

  importComp(key) {return this.importNative(toCompFileUrl(key))}

  importNative(key) {
    return this.importCached(key, this.importNativeUncached)
  }

  async importNativeUncached(key) {
    this.req(key, isCanonicalModuleUrlStr)
    return this.ownModuleColl().added(Module.fromNative(key, await import(key)))
  }

  importLang(key) {return this.importCached(key, this.importLangUncached)}

  // FIXME actual shit!
  async importLangUncached(key) {
    this.req(key, isCanonicalModuleUrlStr)
    console.log(`importing:`, key)

    /*
    FIXME disk caching. Requires cache invalidation via checksums stored in
    header file and calculated from both the requested file and all its
    dependencies, which requires a module dependency graph.
    */
    if (DISK_CACHING) {
      const nativeUrl = new URL(a.reqStr(key) + `.native` + EXT_NATIVE)
      const headerUrl = new URL(a.reqStr(key) + `.header` + EXT_NATIVE)

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
    const mod = new Module().setParent(this).fromStr(src).setUrl(srcUrl.href)
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

export class Prn extends a.Emp {
  compile(src) {return a.laxStr(src.compile())}
  compileDense(src) {return this.joinInf(src, ``)}
  compileSpaced(src) {return this.joinInf(src, ` `)}
  compileCommaSingleLine(src) {return this.joinInf(src, `, `)}
  compileCommaMultiLine(src) {return this.joinInf(src, `,\n`)}
  compileParensCommaMultiLine(src) {return this.wrapMulti(this.compileCommaMultiLine(src), `(`, `)`)}
  compileStatements(src) {return this.joinSuf(src, `;\n`)}
  compileBracesStatementsMultiLine(src) {return this.wrapMulti(this.compileStatements(src), `{`, `}`)}
  joinInf(src, sep) {return this.fold(src, this.addInf, sep)}
  joinSuf(src, suf) {return this.fold(src, this.addSuf, suf)}

  fold(src, fun, arg) {
    a.reqIter(src)
    a.reqFun(fun)

    let acc = ``
    for (src of src) {
      if (!Node.isMeaningful(src)) continue

      const val = a.reqStr(this.compile(src))
      if (!val) continue

      acc = a.reqStr(fun.call(this, acc, val, arg))
    }
    return acc
  }

  addInf(acc, val, sep) {
    a.reqStr(sep)
    return a.reqStr(acc) + (acc ? sep : ``) + a.reqStr(val)
  }

  addSuf(acc, val, suf) {
    return a.reqStr(acc) + a.reqStr(val) + a.reqStr(suf)
  }

  wrapMulti(src, pre, suf) {
    a.reqStr(src)
    a.reqStr(pre)
    a.reqStr(suf)
    return src ? (pre + `\n` + src + `\n` + suf) : (pre + suf)
  }
}


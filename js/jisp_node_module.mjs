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
  // Used by `.parse`. May be overridden by subclasses.
  get Lexer() {return jl.Lexer}

  pk() {return this.reqSrcUrlStr()}

  // Stored as string, rather than `URL` object, to avoid mutation by errant callers.
  #srcUrlStr = undefined
  setSrcUrlStr(val) {return this.#srcUrlStr = this.req(val, jm.isCanonicalModuleUrlStr), this}
  optSrcUrlStr() {return this.#srcUrlStr}
  reqSrcUrlStr() {return this.optSrcUrlStr() ?? this.throw(`missing module source URL at ${a.show(this)}`)}

  optSrcUrl() {return jm.Url.opt(this.optSrcUrlStr())}
  reqSrcUrl() {return new jm.Url(this.reqSrcUrlStr())}

  // Stored as string, rather than `URL` object, to avoid mutation by errant callers.
  #tarUrlStr = undefined
  setTarUrlStr(val) {return this.#tarUrlStr = this.req(val, jm.isCanonicalModuleUrlStr), this}
  optTarUrlStr() {return this.#tarUrlStr}
  reqTarUrlStr() {return this.optTarUrlStr() ?? this.throw(`missing module target URL at ${a.show(this)}`)}

  optTarUrl() {return jm.Url.opt(this.optTarUrlStr())}
  reqTarUrl() {return new jm.Url(this.reqTarUrlStr())}

  /*
  Semi-placeholder. TODO better ancestor search or better assertion.
  This doesn't search by instance of `Root` because it would involve
  an import cycle, which is likely to cause issues.
  */
  reqRoot() {return this.reqParent()}
  optRoot() {return this.optParent()}

  /*
  Caution: this doesn't wait for dependencies. FIXME wait for dependencies.
  Requires us to register dependency information during macroing. Detecting
  cycles and deadlocks can be done at the step of "waiting for dependencies".

  FIXME: if possible, detect if the module is already cached to disk and fresh,
  and avoid performing the read-macro-compile-write-wait-for-deps sequence if so.

  Determining freshness:

  * Own target timestamp > own source timestamp.

  * Own target timestamp > target timestamp of each compile-time dependency
    (dependencies used by `Use`) and their runtime dependencies. In other
    words, it's `>` than each compile-time dependency's total timestamp or
    biggest timestamp.

  For dependencies (any dependencies), we only check target timestamps, not
  source timestamps. If target file does not exist (typically because it comes
  from a Jisp source), then timestamp is `undefined`.

  Concept: "timestamp max". Equals:

    bigger(
      "timestamp tar",
      (select max("timestamp max") from dependencies)
    )

  "Max timestamp" can be determined for any target. It's determined only from
  target files, and never from source files. However, this does require access
  to source URLs of dependencies where possible, because that's how we obtain
  their own dependency info. For targets with no dependencies of their own
  (typically when the target doesn't have a corresponding Jisp source), it's
  just the timestamp of the target file. If the target has some dependencies,
  it's the max of any of the max timestamps, recursively.
  */
  ready() {return this.#ready ??= this.readyUncached()}
  #ready = undefined

  async readyUncached() {
    await this.init()
    await this.read()
    await this.macro()
    await this.write()

    // await this.initOnce()
    // await this.readOnce()
    // await this.macroOnce()
    // await this.compileOnce()
    // await this.writeOnce()

    return this
  }

  // initOnce() {return this.#init ??= this.init()}
  // #init = undefined

  async init() {
    return this.setTarUrlStr(await this.reqRoot().srcUrlStrToTarUrlStr(this.reqSrcUrlStr()))
  }

  // readOnce() {return this.#read ??= this.read()}
  // #read = undefined

  async read() {
    return this.parse(await this.reqRoot().reqFs().read(this.reqSrcUrl()))
  }

  parse(src) {
    this.initSpan().init(src)
    this.setChildren(...new this.Lexer().initFromStr(src))
    return this
  }

  // macroOnce() {return this.#macro ??= this.macro()}
  // #macro = undefined

  /*
  Immediate children of a module typically begin with `Use`, whose macro
  implementation is async. As a result, module macroing is almost always
  asynchronous. We prefer synchronous macroing whenever possible, due to
  huge overheads of async/await, but we should also automatically switch
  into async mode when necessary. The super method `NodeList..macroFrom`
  should support both modes.
  */
  macroImpl() {return this.macroFrom(0)}

  // compileOnce() {return this.#compile ??= this.compile()}
  // #compile = undefined

  compile() {return this.reqCodePrinter().compileStatements(this.childIter())}

  // writeOnce() {return this.#write ??= this.write()}
  // #write = undefined

  // async write() {
  //   await this.reqRoot().reqFs().write(this.reqTarUrl(), this.compileOnce())
  //   return this
  // }

  async write() {
    await this.reqRoot().reqFs().write(this.reqTarUrl(), this.compile())
    return this
  }

  /*
  Override for `Node..err` to avoid using `CodeErr`. A module span always points
  to `row:col = 1:1`, which is not very useful. More importantly, `Node..toErr`
  preserves instances of `CodeErr` as-is. Without this override, sometimes we
  would generate module-level `CodeErr` with `row:col = 1:1`, which would be
  preserved as-is by caller nodes which would otherwise generate a more
  specific `CodeErr` pointing to the actual relevant place in the code.
  */
  err(...val) {return new je.Err(...val)}

  isChildStatement() {return true}

  /*
  Takes an import address string, the kind that would occur in import
  expressions in the source code of the current module, and returns an
  absolute URL for the same import. If the import address was already
  absolute, then it's returned as-is. If the import address was relative,
  it's resolved against the URL of the current module. Note that for
  modules in the OS filesystem, URLs have the scheme `file:`.

  This should NOT rewrite Jisp extensions to JS extensions, and should NOT
  trigger compilation of Jisp files at the level of `Root`. If the import
  address points to a Jisp file, then it requires additional processing which
  is out of scope for this function. For non-Jisp imports, the resulting URL
  should be suitable for use with the native pseudo-function `import`.

  The following examples assume that the current module URL is
  `file:///project/module.jisp`:

    ./file.jisp                     -> file:///project/file.jisp
    ./file.mjs                      -> file:///project/file.mjs
    ../file.jisp                    -> file:///file.jisp
    ../file.mjs                     -> file:///file.mjs
    ./subdir/file.jisp              -> file:///project/subdir/file.jisp
    ./subdir/file.mjs               -> file:///project/subdir/file.mjs
    file:///project/file.jisp       -> (unchanged)
    file:///other_project/file.jisp -> (unchanged)
    https://example.com/file.mjs    -> (unchanged)

  The scheme `jisp:` is treated specially. It resolves to the directory
  containing the source files of the Jisp compiler. In other words, to the
  directory containing this very source file. The returned URL should be
  suitable for use with the native pseudo-function `import`. The examples
  below assume that the compiler code is located at the example location
  `file:///jisp`.

    `jisp:prelude.mjs`   -> `file:///jisp/js/prelude.mjs`
    `jisp:one/two.three` -> `file:///jisp/js/one/two.three`

  TODO convert examples to tests.
  */
  reqImportSrcPathToImportSrcUrl(src) {
    // If a URL is provided, assume it's already absolute.
    if (a.isInst(src, URL)) return src
    this.req(src, a.isStr)

    {
      const tar = jm.optCompilerImportUrl(src)
      if (tar) return tar
    }

    if (jm.hasScheme(src)) return new jm.Url(src)

    /*
    Note: JS imports always use Posix-style paths, even on Windows systems.
    If the user wishes to use an absolute FS path on Windows, they have to
    describe it similarly to a Posix path, without a volume letter.
    */
    if (p.posix.isAbs(src)) return new jm.Url(src, `file:`)

    /*
    At this step, we're resolving a relative path, so we actually require the
    module URL. Other cases that don't require the module URL should be handled
    first. This is convenient for testing, and may be useful in some other
    cases.
    */
    return new jm.Url(src, this.reqSrcUrlStr())
  }

  optTarUrlToTarAddr(src) {
    this.reqInst(src, jm.Url)
    return jm.toPosixRel(src.optRelTo(this.optTarUrl()?.toDir()))
  }

  // Unused, TODO drop.
  reqTarUrlToTarAddr(src) {
    this.reqInst(src, jm.Url)
    return jm.toPosixRel(src.reqRelTo(this.reqTarUrl().toDir()))
  }

  /*
  Standard JS interface.
  Should be used for serializing module metadata to disk.
  FIXME: should we bother storing timestamps? Which: source or target or both?
  */
  toJSON() {
    return {
      srcUrlStr: this.optSrcUrlStr(),
      tarUrlStr: this.optTarUrlStr(),
      deps: a.map(this.optDeps(), jm.toJSON),
    }
  }

  /*
  Not a standard JS interface.
  Should be used when deserializing module metadata from disk.
  */
  fromJSON(src) {
    this.req(src, a.isDict)
    {
      const val = src.srcUrlStr
      if (a.isSome(val)) this.setSrcUrlStr(val)
    }
    {
      const val = src.tarUrlStr
      if (a.isSome(val)) this.setTarUrlStr(val)
    }
    {
      const val = src.deps
      if (a.isSome(val)) this.setDeps(val)
    }
    return this
  }


  [ji.symInsp](tar) {
    return super[ji.symInsp](tar.funs(this.optSrcUrlStr, this.optNsLex))
  }
}

export class ModuleColl extends a.Coll {
  // These methods are invoked by `a.TypedMap` used by `a.Coll`.
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return a.reqInst(val, Module)}
}

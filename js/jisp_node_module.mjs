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
import * as jnu from './jisp_node_use.mjs'

export class Module extends jns.MixOwnNsLexed.goc(jnnl.NodeList) {
  /*
  Override for `MixLiveValued`. Any live properties added here are contextually
  available to all code in all modules, by using the orphan form of
  `IdentAccess`. The typical use case is the following:

    [.use `jisp:prelude.mjs` *]
  */
  static makeLiveVal() {
    const tar = a.npo()
    tar.use = jnu.Use
    return tar
  }

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
  This doesn't search by instance of `Root` because importing `Root`
  into this file would involve an import cycle, which is likely to
  cause issues.
  */
  reqRoot() {return this.reqParent()}
  optRoot() {return this.optParent()}

  ready() {return this.#ready ??= this.readyUncached()}
  #ready = undefined

  async readyUncached() {
    await this.readySelf()

    /*
    Note: this must be invoked sequentually after `.readySelf`, not concurrently
    with it, because dependencies are found while macroing the current module,
    which is done as part of `.readySelf`.
    */
    return this.readyDeps()
  }

  /*
  FIXME: if possible, detect if the module is already cached to disk and fresh,
  and avoid performing the read-macro-compile-write sequence if so. Note that
  we would still have to wait for runtime dependencies to be ready before this
  module is considered ready.

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
  readySelf() {return this.#readySelf ??= this.readySelfUncached()}
  #readySelf = undefined

  async readySelfUncached() {
    await this.init()
    await this.read()
    await this.macro()
    await this.write()
    return this
  }

  async readyDeps() {
    const deps = this.#optDeps()
    if (deps) await Promise.all(a.map(deps, jm.readyCall))
    return this
  }

  // Short for "dependencies".
  #deps = undefined
  #initDeps() {return this.#deps ??= new ModuleSet()}
  #optDeps() {return this.#deps}

  hasDep(val) {
    this.optInst(val, Module)
    return !!this.#optDeps()?.has(val)
  }

  addDep(val) {
    this.reqInst(val, Module)

    /*
    Self-dependency is the unspoken implicit default. Of course any module
    depends on itself. More to the point, this method may be called with the
    current module as the input in case of explicit self-imports, which are
    valid and sometimes useful.
    */
    if (val === this) return this

    if (this.hasDep(val)) return this

    // FIXME also prevent indirect import cycles.
    if (val.hasDep(this)) {
      throw this.err(`unexpected direct import cycle between module ${a.show(this.optSrcUrlStr())} and module ${a.show(val.optSrcUrlStr())}`)
    }

    this.#initDeps().add(val)
    return this
  }

  async init() {
    if (!this.optTarUrlStr()) {
      this.setTarUrlStr(await this.reqRoot().srcUrlStrToTarUrlStr(this.reqSrcUrlStr()))
    }
    return this
  }

  async read() {
    return this.parse(await this.reqRoot().reqFs().read(this.reqSrcUrl()))
  }

  parse(src) {
    this.initSpan().init(src)
    this.setChildren(...new this.Lexer().initFromStr(src))
    return this
  }

  /*
  Immediate children of a module typically begin with `Use`, whose macro
  implementation is async. As a result, module macroing is almost always
  asynchronous. We prefer synchronous macroing whenever possible, due to
  huge overheads of async/await, but we should also automatically switch
  into async mode when necessary. The super method `NodeList..macroFrom`
  should support both modes.
  */
  macroImpl() {return this.macroFrom(0)}

  compile() {return this.reqPrn().compileStatements(this.childIter())}

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
  See the comment on `ImportBase` for the explanation of various import paths
  and how we handle them.
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
      deps: a.map(this.optDeps(), jm.toJsonCall),
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

export class ModuleSet extends a.TypedSet {
  reqVal(val) {return a.reqInst(val, Module)}
}

export class ModuleColl extends a.Coll {
  // These methods are invoked by `a.TypedMap` used by `a.Coll`.
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return a.reqInst(val, Module)}
}

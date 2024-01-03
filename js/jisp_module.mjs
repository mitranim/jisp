import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as jc from './jisp_conf.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as je from './jisp_err.mjs'
import * as jch from './jisp_child.mjs'
import * as jpa from './jisp_pathed.mjs'
import * as jnmnl from './jisp_node_module_node_list.mjs'

/*
Describes either a Jisp module with its "source" and "target" components,
or an arbitrary non-Jisp module importable via JS `import`.

When this describes a Jisp module, then the source URL must be non-empty, the
target URL may be derived from the source URL by consulting `Root`, and it's
valid to call the various methods for reading, parsing, macroing, compiling,
writing, and dependency tracking.

When this describes a non-Jisp module, then the target URL must be non-empty,
other fields must be empty, and it's invalid to call various methods related
to processing Jisp code.

This type is used to describe both Jisp and non-Jisp modules because this
simplifies book-keeping and deserialization.
*/
export class Module extends (
  jpa.MixTarPathAbsed.goc(
    jpa.MixSrcPathAbsed.goc(
      jch.MixChild.goc(
        ji.MixInsp.goc(
          a.Emp
        )
      )
    )
  )
) {
  // Used by `a.pk` and `a.Coll`.
  pk() {return this.reqSrcPathAbs()}

  /*
  Standard JS interface. Should be used for serializing to disk.

  This doesn't include timestamps because they may change afterwards.
  More specifically, they may change between compilation passes.

  During a single compilation pass, each module should be generated 0 or 1
  times. 0 times is when the given module is used as-is. 1 time is when the
  given module requires compilation or recompilation. This means once a
  timestamp of some target module is obtained, it doesn't change during that
  compilation pass.

  A target timestamp from a previous compilation pass is invalid for the next
  compilation pass. It may change if the target was originally generated from
  a Jisp module which became outdated and needs to be recompiled. It may also
  change if the target is NOT generated from a Jisp module, for example written
  directly in JS, but was nevertheless modified, typically by hand. It may also
  NOT change. During the next compilation pass, we must recheck.
  */
  toJSON() {
    return {
      srcPathAbs: this.optSrcPathAbs(),
      tarPathAbs: this.optTarPathAbs(),
      srcDeps: a.map(this.optSrcDeps(), a.pk),
      tarDeps: a.map(this.optTarDeps(), a.pk),

      // srcDeps: this.optSrcDeps(),
      // tarDeps: this.optTarDeps(),
    }
  }

  /*
  Not a standard JS interface. Should be used when deserializing from disk.
  Note: must also normalize through `Root` after deserializing. See `.reqNorm`.
  */
  fromJSON(src) {
    if (a.isNil(src)) return this
    this.req(src, a.isDict)
    {
      const val = src.srcPathAbs
      if (a.isSome(val)) this.setSrcPathAbs(val)
    }
    {
      const val = src.tarPathAbs
      if (a.isSome(val)) this.setTarPathAbs(val)
    }
    for (const val of a.values(src.srcDeps)) {
      this.addSrcDep(this.reqRoot().reqModule(val))
    }
    for (const val of a.values(src.tarDeps)) {
      this.addTarDep(this.reqRoot().reqModule(val))
    }
    // for (const val of a.values(src.srcDeps)) this.addSrcDep(this.reqFromJson(val))
    // for (const val of a.values(src.tarDeps)) this.addTarDep(this.reqFromJson(val))
    return this
  }

  reqValid() {
    this.reqSrcPathAbs()
    this.reqTarPathAbs()

    // const src = this.reqTarUrlStr()
    // const tar = this.reqTarUrlStr()

    // if (a.isSome(src)) {
    //   const exp = jc.conf.getFileExtTar()
    //   const act = p.posix.exp(tar)
    //   if (act !== exp) {
    //     throw this.err(`unexpected extension in ${a.show(this)} with target URL ${a.show(tar)} and source URL ${a.show(src)}; expected extension ${a.show(exp)}, got extension ${a.show(act)}`)
    //   }
    // }

    return this
  }

  // reqNorm() {return this.reqRoot().reqModuleNorm(this)}

  // reqFromJson(val) {
  //   return new this.constructor()
  //     .setParent(this.reqParent())
  //     .fromJSON(val)
  //     .reqValid()
  //     .reqNorm()
  // }

  // This lacks a type assertion because it would involve cyclic imports.
  optRoot() {return this.optParent()}
  reqRoot() {return this.reqParent()}

  #nodeList = undefined
  optNodeList() {return this.#nodeList}
  reqNodeList() {return this.initNodeList()}
  initNodeList() {return this.#nodeList ??= this.makeNodeList()}
  makeNodeList() {return new this.NodeList().setParent(this)}
  get NodeList() {return jnmnl.ModuleNodeList}

  /*
  Caching this promise allows callers to idempotently wait until the module
  is ready before importing it. For any given module, there may be multiple
  consumers importing this module during a single compilation pass.
  */
  #ready = undefined
  ready() {return this.#ready ??= this.readyAsync()}

  /*
  This is sequential, not concurrent, because because dependencies are found
  while macroing the current module.
  */
  async readyAsync() {
    await this.readySelf()
    return this.readyTarDeps()
  }

  async readySelf() {
    await this.init()

    if (!await this.isUpToDate()) {
      await this.read()
      await this.macro()
      await this.write()
    }

    return this
  }

  /*
  This promise is cached because this may be invoked repeatedly and from
  multiple places.
  */
  init() {return this.#init ??= this.initAsync()}
  #init = undefined

  async initAsync() {
    if (this.optTarPathAbs()) return this

    const src = this.optSrcUrlStr()
    if (!src) return this

    const root = this.reqRoot()
    this.setTarPathAbs(await root.srcUrlStrToTarUrlStr(src))
    this.fromJSON(a.jsonDecode(await root.optFs()?.readOpt(this.reqMetaUrl())))
    return this
  }

  /*
  A module is up to date when its target file is newer than its compile-time
  dependencies, which includes its source file and any files it imports for
  macro-time usage, directly or indirectly.

  Updates in runtime dependencies do not make a module outdated. That's because
  runtime dependencies don't affect the compiled code of the current module,
  only its eventual runtime behavior.

  For dependencies, we only check target timestamps, not source timestamps.
  If a target file does not exist, then the timestamp is `undefined`, which
  means it's outdated.

  Known issue: we currently don't bother finding runtime dependencies of JS
  files used as dependencies of Jisp files. It would require parsing JS.
  */
  async isUpToDate() {
    if (this.optTarPathAbs() && !this.optTarUrlStr()) return true

    const srcTime = this.opt((await this.optSrcTime()), a.isFin)
    if (a.isNil(srcTime)) return true

    const tarTime = this.opt((await this.optTarTime()), a.isFin)
    if (a.isNil(tarTime)) return false
    if (!(tarTime > srcTime)) return false

    const deps = this.optSrcDeps()
    if (a.isEmpty(deps)) return true

    /*
    Technical note.

    Even though we're looking at source dependencies, we care about their target
    timestamps, not their source timestamps.

    The given target file is invalidated if there is a more recent change in any
    target file among its direct or indirect "source dependencies". Note the
    "indirect" part. It's not enough to check the timestamps of its direct
    dependencies. We also need the largest timestamp from among all transitive
    dependencies.
    */
    const times = await Promise.all(a.map(deps, timeMaxCall))

    /*
    If the target timestamps of any direct or indirect dependencies are missing,
    `Math.max` returns `NaN` and the current module's target file is considered
    to be outdated. That's what we want. Missing timestamps mean that their
    target files are not ready. In that case, the current module must wait for
    them to be ready, and recompile its own target file.
    */
    return tarTime >= Math.max(...times)
  }

  async read() {
    this.parse(await this.reqRoot().reqFs().read(this.reqSrcUrl()))
    return this
  }

  parse(src) {
    this.clear()
    this.reqNodeList().parse(src)
    return this
  }

  compile() {return this.reqNodeList().compile()}

  async write() {
    const fs = this.reqRoot().reqFs()
    const tarUrl = this.reqTarUrl()
    const metaUrl = this.reqMetaUrl()
    const tarBody = this.compile()
    const metaBody = a.jsonEncode(this)

    await Promise.all([
      fs.write(tarUrl, tarBody),
      fs.write(metaUrl, metaBody),
    ])
    this.setTarTime(await fs.timestamp(tarUrl))
    return this
  }

  async macro() {
    await this.optNodeList()?.macro()
    return this
  }

  // FIXME consider if this is where we should detect cycles.
  async readyTarDeps() {
    await Promise.all(a.map(this.optTarDeps(), jm.readyCall))
    return this
  }

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
  Short for "source dependencies". Must be used for dependencies which are
  imported by the current module's source file (at macro time), but not
  necessarily by its target file (at runtime). The most typical examples
  are imports via `Use` and `Declare`.
  */
  #srcDeps = undefined
  optSrcDeps() {return this.#srcDeps}
  reqSrcDeps() {return this.initSrcDeps()}
  initSrcDeps() {return this.#srcDeps ??= new ModuleSet()}

  /*
  Short for "target dependencies". Must be used for dependencies which are
  imported by the current module's target file (at runtime), but not
  necessarily by its source file (at macro time). The most typical example
  is imports via `Import`.
  */
  #tarDeps = undefined
  optTarDeps() {return this.#tarDeps}
  reqTarDeps() {return this.initTarDeps()}
  initTarDeps() {return this.#tarDeps ??= new ModuleSet()}

  addSrcDep(mod) {return this.addDep(mod, this.initSrcDeps())}
  addTarDep(mod) {return this.addDep(mod, this.initTarDeps())}

  // Semi-placeholder, lacks cycle detection. See below.
  addDep(mod, deps) {
    this.reqInst(mod, Module)
    if (mod === this || deps.has(mod)) return this

    // FIXME detect dependency cycles (direct or indirect), report import path.
    const path = undefined
    if (a.hasLen(path)) throw this.err(this.msgImportCycle(mod, path))

    deps.add(mod)
    return this
  }

  msgImportCycle(mod, path) {
    return `unexpected import cycle between module ${a.show(a.pkOpt(this))} and module ${a.show(a.pkOpt(mod))}; import path: ${a.show(path)}`
  }

  /*
  This field is cached because it's used repeatedly by direct and indirect
  dependents during the same compilation pass, and repeatedly requesting the
  timestamp from the FS might add measurable latency. Might be a premature
  optimization. TODO check the costs.

  Type: `isFin | Promise<isFin>`.
  */
  #tarTime = undefined
  setTarTime(val) {return this.#tarTime = this.req(val, a.isFin), this}
  optTarTime() {return this.#tarTime ??= this.optTarTimeAsync()}

  async optTarTimeAsync() {
    await this.init()
    return this.reqRoot().reqFs().timestamp(this.reqTarUrl())
  }

  optSrcTime() {
    if (this.hasSrc()) return this.reqRoot().reqFs().timestamp(this.reqSrcUrl())
    return undefined
  }

  // TODO reconsider if we can cache this value.
  async timeMax() {
    return a.onlyFin(Math.max(
      (await this.optTarTime()),
      ...await Promise.all(a.map(this.optTarDeps(), timeMaxCall)),
    ))
  }

  reqMetaUrl() {return this.reqTarUrl().clone().setExt(`.meta.json`)}

  clear() {
    this.optSrcDeps()?.clear()
    this.optTarDeps()?.clear()
    return this
  }

  [ji.symInsp](tar) {
    return tar.funs(this.optSrcPathAbs, this.optTarPathAbs, this.optNodeList)
  }
}

export class ModuleSet extends a.TypedSet {
  reqVal(val) {return a.reqInst(val, Module)}
}

export class ModuleColl extends a.Coll {
  reqKey(key) {return a.reqValidStr(key)}
  reqVal(val) {return a.reqInst(val, Module)}
}

function timeMaxCall(val) {return val.timeMax()}

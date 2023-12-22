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

  pk() {return this.reqUrl()}

  // TODO rename from "url" to "url str" for consistency with other code.
  #url = undefined
  setUrl(val) {return this.#url = this.req(val, jm.isCanonicalModuleUrlStr), this}
  optUrl() {return this.#url}
  reqUrl() {return this.optUrl() ?? this.throw(`missing module URL at ${a.show(this)}`)}

  #optTarUrlPromise = undefined
  optTarUrl() {return this.#optTarUrlPromise ??= this.#optTarUrl()}

  #reqTarUrlPromise = undefined
  reqTarUrl() {return this.#reqTarUrlPromise ??= this.#reqTarUrl()}

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

  compile() {return this.reqCodePrinter().compileStatements(this.childIter())}

  isChildStatement() {return true}

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
    const url = this.reqImportSrcPathToImportSrcUrl(src)
    this.reqInst(url, jm.Url)
    if (url.hasExtSrc()) {
      return this.reqAncFind(jm.isLangFileResolver).resolveLangFile(url)
    }
    return url
  }

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
  is out of scope for this function. See `.resolveLangFile`. For non-Jisp
  imports, the resulting URL should be suitable for use with the native
  pseudo-function `import`.

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
  directory containing this very source file. If the compiler code is located
  at the example location `file:///jisp`, then see the examples below. The
  returned URL should be suitable for use with the native pseudo-function
  `import`.

    `jisp:prelude`   -> `file:///jisp/js/prelude.mjs`
    `jisp:jisp_misc` -> `file:///jisp/js/jisp_misc.mjs`

  TODO convert examples to tests.
  */
  reqImportSrcPathToImportSrcUrl(src) {
    return (
      this.optImportSrcPathToImportSrcUrl(src) ??
      /*
      At this step, we're resolving a relative path, so we actually require
      the module URL. Other cases that don't require the module URL should
      be handled first. This is convenient for testing, and may be useful
      in some other cases.
      */
      new jm.Url(src, this.reqUrl())
    )
  }

  optImportSrcPathToImportSrcUrl(src) {
    /*
    Assume that the URL is already absolute. This may mishandle relative file
    URLs. However, that's a user mistake. Avoid relative file URLs.
    */
    if (a.isInst(src, URL)) return src
    this.req(src, a.isStr)

    {
      const tar = jm.optCompilerImportPathToCompilerUrl(src)
      if (tar) return tar
    }

    if (jm.hasScheme(src)) return new jm.Url(src)
    if (p.posix.isAbs(src)) return new jm.Url(src, `file:`)

    const url = this.optUrl()
    return url && new jm.Url(src, url)
  }

  /*
  Takes an absolute URL pointing to the source location of an imported file, the
  kind that is returned by `.reqImportSrcPathToImportSrcUrl`. Returns an
  absolute URL pointing to the eventual target location of the imported file.

  For non-Jisp files, this returns the source URL as-is. Non-Jisp files stay
  where they are.

  For Jisp files, the source URL may point to an arbitrary location, and must
  have the extension `.jisp`. The target URL points to a location inside the
  target directory provided to `Fs`, and the file extension is changed to
  `.mjs`. (`Fs` is obtained from an ancestor, typically from `Root`.)
  */
  srcUrlToTarUrl(src) {
    return this.reqParent().srcUrlToTarUrl(src)
  }

  // Parent must be `Root`. TODO consider using `.optAncFind`.
  async #optTarUrl() {
    const src = this.optUrl()
    return src && this.optParent()?.srcUrlToTarUrl(src)
  }

  // Parent must be `Root`. TODO consider using `.reqAncFind`.
  async #reqTarUrl() {
    return this.reqParent().srcUrlToTarUrl(this.reqUrl())
  }

  [ji.symInsp](tar) {
    return super[ji.symInsp](tar.funs(this.optUrl, this.optNsLex))
  }
}

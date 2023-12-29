import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as jm from './jisp_misc.mjs'
import * as ji from './jisp_insp.mjs'
import * as jns from './jisp_ns.mjs'
import * as jnm from './jisp_node_module.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'
import * as jnst from './jisp_node_str.mjs'
import * as jniu from './jisp_node_ident_unqual.mjs'
import * as jnio from './jisp_node_ident_oper.mjs'

/*
Base class for node classes that deal with imports. See subclasses `Use` and
`Import`.

---

We need to support many forms of import paths, including but not limited to the
following:

  * Path starting with the special URL scheme `jisp:`.
  * Path ending with the `.jisp` extension.
  * Path not ending with the `.jisp` extension.
  * Absolute file URL.
  * Absolute network URL.
  * Absolute FS path. (Always in Posix form.)
  * Explicitly relative FS path. (Always in Posix form.)
  * Implicitly relative FS path. (Always in Posix form.)

For any import path with the scheme `jisp:`, we resolve it relatively to the
directory containing the source files of the Jisp compiler. In other words,
relative to the same directory where you're reading this. The resolved URL
should be suitable for use with the native pseudo-function `import`. This is
intended only for compile-time importing, and should not be included in any
compiled code. See the class `Use` which performs immediate compile-time
imports and does not generate runtime import statements. The examples below
assume that the compiler repo is located at example location `file:///jisp`.

  import path        | target absolute path
  --------------------------------------------------
  jisp:prelude.mjs   | file:///jisp/js/prelude.mjs
  jisp:one/two.three | file:///jisp/js/one/two.three

Implicitly relative import paths must be preserved and used as-is. In native JS
modules, implicitly relative paths are resolved by using an importmap; this
also affects the behavior of the pseudo-function `import`. For example, if the
current importmap has an entry for `blah`, then the call `import("blah")` is
valid and may resolve to a native module. Implicitly relative paths without
importmap entries are considered invalid and cause exceptions when executed.
In legacy JS modules such as CommonJS, implicitly relative paths are resolved
relatively to a local directory of dependencies such as `node_modules`; unlike
the importmap approach, this does not natively modify the behavior of the
pseudo-function `import`, but bundlers such as Esbuild and Webpack have special
support for rewriting those calls when bundling the code. In either case, for
our intents and purposes, implicitly relative paths are equivalent to absolute
paths.

  import path  | target path
  ---------------------------
  one          | one
  one/two      | one/two
  one.mjs      | one.mjs
  one.jisp     | one.jisp
  one/two.mjs  | one/two.mjs
  one/two.jisp | one/two.jisp

All further examples assume that the current module URL is
`file:///project/some_module.jisp`.

For any import path with the `.jisp` extension (except for implicitly relative
paths), we must resolve it to an absolute URL of the source file, idempotently
trigger its compilation, and rewrite the import path, using a relative path
from the target location of the current module (where the compiled code of the
current module will be written) to the target location of the imported module
(where the compiled code of the imported module will be written), replacing the
extension `.jisp` with `.mjs`. Jisp files must be reachable via the FS
implementation provided to `Root`. In Deno, Jisp files must be reachable on the
local filesystem. See `DenoFs`. Other FS implementations may also support
network URLs.

  import path              | source absolute path         | target relative path
  ------------------------------------------------------------------------------
  ./one.jisp               | file:///project/one.jisp     | ./one.mjs
  ./one/two.jisp           | file:///project/one/two.jisp | ../some_dir/two.mjs
  ../one.jisp              | file:///one.jisp             | ../some_dir/one.mjs
  file:///project/one.jisp | file:///project/one.jisp     | ./one.mjs

If the import path is on the same filesystem or network host as the current
module, we must rewrite it, using a relative path from the absolute target URL
of the current module (where the compiled code of the current module will be
written) to the absolute URL of the imported file. If the import path is
explicitly relative, we also convert it to an absolute URL, resolving it
relatively to the source URL of the current module.

  import path             | target absolute path        | target relative path
  ----------------------------------------------------------------------------
  ./one.mjs               | file:///project/one.mjs     | ./one.mjs
  ./one/two.mjs           | file:///project/one/two.mjs | ../some_dir/two.mjs
  ../one.mjs              | file:///one.mjs             | ../some_dir/one.mjs
  /project/one.mjs        | file:///project/one.mjs     | ./one.mjs
  file:///project/one.mjs | file:///project/one.mjs     | ./one.mjs

If the import path is an absolute URL which can't be made relative to the
absolute URL of the current module, it must be preserved as-is in the compiled
code:

  import path               | target path
  -----------------------------------------------------
  https://one.two/three.mjs | https://one.two/three.mjs

Any other formats of import paths, which don't fall into the categories above,
are unforeseen and may cause undefined behavior.

TODO convert examples to tests.

---

Import resolution should be implemented at several levels:

  * `ImportBase`
  * `Module`
  * `Root`

At the level of `Root`, we should accept only absolute source URLs for Jisp
files, and handle conversion of Jisp files to JS files, which involves
deduplication, deadlock prevention, and caching. `Root` has no business with
non-Jisp files.

At the level of `ImportBase`, we should handle implicitly-relative import paths,
which are equivalent to absolute paths in JS modules, and delegate resolution
of other paths to `Module`.

At the level of `Module`, we should handle all other cases, including but not
limited to the following:

  * Handling `jisp:`-scheme imports, which allow user code to import arbitrary
    files from the Jisp compiler.

  * Converting relative paths to absolute paths.

  * Handling any non-Jisp imports.

  * Detecting Jisp imports and using `Root` for those.

---

FIXME when used in expression mode, enforce exactly 2 children, not 3.
*/
export class ImportBase extends jns.MixOwnNsLived.goc(jnlm.ListMacro) {
  pk() {return this.reqDestName().reqName()}

  /*
  TODO: when this is used in expression mode, allow the address to be an
  arbitrary expression. Requiring the address to be a literal string should be
  done only in statement mode.
  */
  reqAddr() {return this.reqChildAt(1)}
  optAddrStr() {return a.onlyInst(this.optChildAt(1), jnst.Str)}
  reqAddrStr() {return this.reqChildInstAt(1, jnst.Str)}
  optSrcPath() {return this.optAddrStr()?.reqVal()}
  reqSrcPath() {return this.reqAddrStr().reqVal()}
  optDest() {return this.optChildAt(2)}
  reqDest() {return this.reqChildAt(2)}
  optDestName() {return this.optChildAt(2)?.asOnlyInst(jniu.IdentUnqual)}
  reqDestName() {return this.reqChildInstAt(2, jniu.IdentUnqual)}
  optDestOper() {return this.optChildAt(2)?.asOnlyInst(jnio.IdentOper)}
  reqDestOper() {return this.reqChildInstAt(2, jnio.IdentOper)}

  // Indicates the expected operator name used for the "star" / "mixin" form.
  mixinName() {return `*`}

  /*
  When the import source path is for a Jisp file (has extension `.jisp`), then
  this should eventually contain a URL of that Jisp file, typically a file URL
  such as `file:///one/two/three.jisp`. The resulting URL must be in canonical
  form; see the function `isCanonicalModuleUrlStr`.

  When the import source path is not for a Jisp file, or is implicitly relative,
  then this should be nil. We could also say that in all such cases, the source
  URL is the same as the target URL, but skipping it is more convenient for
  code that only wants this URL for Jisp source files.

  This URL may be used to obtain the corresponding `Module` object from `Root`.
  The resulting module object, if found, allows us to wait until it's compiled
  to disk, along with its runtime dependencies, and ready to be imported. This
  functionality is necessary for the subclass `Use`, which wants to import the
  target immediately at compile time, but may have to trigger the target's
  compilation and wait until it's compiled.

  In principle, the target `Module` may also be used to obtain metadata such as
  the set of exported identifiers. In the future, we may use this to detect
  missing exports.

  Should be generated and set by one of the internal methods in this node class,
  typically when macroing it.
  */
  #srcUrlStr = undefined
  setSrcUrlStr(val) {return this.#srcUrlStr = a.optValidStr(val), this}
  optSrcUrlStr() {return this.#srcUrlStr}
  reqSrcUrlStr() {return this.optSrcUrlStr() ?? this.throw(`missing source URL string at ${a.show(this)}`)}

  /*
  Should contain a rewritten import path intended for compilation into the final
  JS code of this module. Whenever possible, the resulting path must be
  relative. Compiling imports to relative paths, rather than absolute paths,
  potentially makes our modules usable directly in browsers. Absolute
  filesystem paths such as `/one/two` or absolute file URLs such as
  `file:///one/two` would prevent our modules from being directly usable in
  browsers.

  Should be generated and set by one of the internal methods in this node class,
  typically when macroing it.
  */
  #tarPathRel = undefined
  setTarPathRel(val) {return this.#tarPathRel = a.optValidStr(val), this}
  optTarPathRel() {return this.#tarPathRel}
  reqTarPathRel() {return this.optTarPathRel() ?? this.throw(`missing relative target path at ${a.show(this)}`)}

  /*
  Should contain a rewritten import path intended for dynamic imports at compile
  time. In other words, intended for use with the native pseudo-function
  `import`. This must be one of: absolute URL; absolute FS path; implicitly
  relative path such as `blah`. See the main comment on `ImportBase` for an
  explanation on why implicitly relative paths are considered equivalent to
  absolute paths.

  Should be generated and set by one of the internal methods in this node class,
  typically when macroing it.
  */
  #tarPathAbs = undefined
  setTarPathAbs(val) {return this.#tarPathAbs = a.optValidStr(val), this}
  optTarPathAbs() {return this.#tarPathAbs}
  reqTarPathAbs() {return this.optTarPathAbs() ?? this.throw(`missing absolute target path at ${a.show(this)}`)}

  macroImpl() {
    this.reqEveryChildNotCosmetic()

    if (this.isStatement()) this.validateStatement()
    else this.validateExpression()

    if (!this.optDest()) return this.macroModeUnnamed()
    if (this.optDestName()) return this.macroModeNamed()
    if (this.optDestOper()) return this.macroModeOper()

    throw this.err(`${a.reqStr(this.msgArgDest())}; found unrecognized node ${a.show(this.reqDest())}`)
  }

  /*
  In statement mode, the address must be a literal string, because that's the
  only syntax supported by JS import statements.
  */
  validateStatement() {
    this.reqChildCountBetween(2, 3)
    this.reqAddrStr()
  }

  /*
  In expression mode, we don't validate the type of the child in the address
  position, because it's allowed to be an arbitrary expression. If the address
  is a literal string, we should handle it exactly like in statement mode.
  Otherwise we should leave the address expression as-is.
  */
  validateExpression() {
    this.reqChildCount(2)
    this.reqAddr()
  }

  macroModeUnnamed() {return this}

  macroModeNamed() {
    this.reqDeclareLex()
    return this
  }

  macroModeOper() {
    const src = this.reqDestOper()
    const key = src.reqName()
    const exp = this.mixinName()

    if (key !== exp) {
      throw this.err(`${a.reqStr(this.msgArgDest())}; found unsupported string ${a.show(key)}`)
    }
    return this.macroModeMixin()
  }

  macroModeMixin() {throw this.errMeth(`macroModeMixin`)}

  msgArgDest() {
    return `${a.show(this)} expected the argument at index 2 to be one of the following: missing; unqualified identifier; operator ${a.show(this.mixinName())}`
  }

  /*
  This is implemented here rather than in `Node` because moving this to `Node`
  would create an import cycle, which would cause module initialization issues,
  and most node subclasses don't need this.
  */
  optModule() {return this.optAncMatch(jnm.Module)}
  reqModule() {return this.reqAncMatch(jnm.Module)}

  /*
  Short for "optional dependency module". Returns a module corresponding to the
  imported Jisp module, if any. Returns nil if the import does not point at a
  Jisp file, or has not yet been resolved via `ImportBase..resolve`.
  */
  optDepModule() {
    const key = a.optValidStr(this.optSrcUrlStr())
    return key && this.optModule()?.optRoot()?.reqModule(key)
  }

  /*
  Waits until the target is importable. Non-Jisp targets are importable
  immediately. Jisp targets are importable after they're compiled to disk,
  along with their runtime dependencies. Intended mainly for compile-time
  imports.
  */
  ready() {return this.optDepModule()?.ready()}

  async resolve() {
    const srcPath = this.optSrcPath()
    if (a.isNil(srcPath)) return this

    /*
    See the comment on `.setTarPathAbs` for an explanation on implicitly
    relative import paths, and why they're considered to be equivalent to
    absolute paths in JS modules.
    */
    if (!jm.hasScheme(srcPath) && p.posix.isRelImplicit(srcPath)) {
      this.setTarPathAbs(srcPath)
      return this
    }

    const mod = this.optModule()
    if (!mod) return this

    const srcUrl = mod.reqImportSrcPathToImportSrcUrl(srcPath)
    if (srcUrl.hasExtSrc()) return this.resolveExtSrc(srcUrl)
    return this.resolveExtAny(srcUrl)
  }

  async resolveExtSrc(srcUrl) {
    const srcUrlStr = srcUrl.href
    this.setSrcUrlStr(srcUrlStr)

    const mod = this.reqModule()

    const tarUrlStr = (
      srcUrlStr === mod.optSrcUrlStr()
      /*
      In case of self-import, short-circuit to a known target URL. Technically
      this should be unnecessary, and the result should be equivalent in all
      real-world cases. This is done mainly for testing, where modules and
      roots are sometimes used without FS access. May be useful in other
      similar edge cases.
      */
      ? mod.reqTarUrlStr()
      : await mod.reqRoot().srcUrlStrToTarUrlStr(srcUrlStr)
    )

    this.setTarPathAbs(tarUrlStr)
    this.setTarPathRel(mod.optTarUrlToTarAddr(new jm.Url(tarUrlStr)))
    return this
  }

  resolveExtAny(srcUrl) {
    this.setTarPathAbs(srcUrl.href)
    this.setTarPathRel(this.optModule()?.optTarUrlToTarAddr(srcUrl))
    return this
  }

  /*
  These methods are an interface known to some other code. May be used by
  `IdentAccess` and `DelimNodeList` when this node is used as an expression
  rather than a module-level statement. At the time of writing, such usage
  would generate an exception during macroing, because this node's method
  `.macro` returns a promise, and async macroing is supported only at the
  module level. However, we may be able to lift that limitation in the future.
  Maybe we already have. TODO write a test.
  */
  optResolveLiveVal() {return this.optNsLive()?.optVal()}
  reqResolveLiveVal() {return this.reqNsLive().reqVal()}

  /*
  May be used by subclasses to import the target at compile time.
  The imported module may be considered "live" and used for immediate
  compile-time evaluation / node replacement, also known as macroing.
  The imported module may also be considered non-live and used for
  compile-time validation of imported and exported names. Subclasses
  are free to override the getter `.NsLive` to modify the behavior
  of the resulting namespace.

  Should be kept in sync with `.optImport`.
  */
  async reqImport() {
    await this.resolve()
    await this.ready()

    const val = await import(this.reqTarPathAbs())
    this.initNsLive().setVal(val)

    return this
  }

  // Should be kept in sync with `.reqImport`.
  async optImport() {
    await this.resolve()
    await this.ready()

    const tar = this.optTarPathAbs()
    if (!tar) return this

    const val = await import(tar)
    this.initNsLive().setVal(val)

    return this
  }

  [ji.symInsp](tar) {return super[ji.symInsp](tar).funs(this.optNsLive)}
}

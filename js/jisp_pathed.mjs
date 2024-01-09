import * as a from '/Users/m/code/m/js/all.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as jc from './jisp_conf.mjs'
import * as jm from './jisp_misc.mjs'
import * as je from './jisp_err.mjs'

/*
Should store a canonical path to a module source file, the same path which is
used as the primary key of `Module`, and which is used to store and obtain
cached modules in `Root`.

A canonical module path may be one of the following.

For Jisp files: absolute URL without search or hash. The URL must be reachable
via the FS provided to `Root`, which typically means file URL.

  file:///one/two/three.jisp

For non-Jisp files: absolute URL without search or hash, or implicitly
relative path.

  https:///one/two/three.mjs
  file:///one/two/three.mjs
  one/two/three

TODO getter error messages should report `.optSrcPathAbs` if any.
*/
export class MixSrcPathAbsed extends a.DedupMixinCache {
  static make(cls) {
    return class MixSrcPathAbsed extends je.MixErrer.goc(cls) {
      #srcPathAbs = undefined
      setSrcPathAbs(val) {return this.#srcPathAbs = this.req(val, jm.isCanonicalModulePath), this}
      optSrcPathAbs() {return this.#srcPathAbs}
      reqSrcPathAbs() {return this.optSrcPathAbs() ?? this.throw(`missing source path in ${a.show(this)}`)}

      optSrcUrlStr() {return a.only(this.optSrcPathAbs(), jm.hasScheme)}
      reqSrcUrlStr() {return this.optSrcUrlStr() ?? this.throw(`missing source URL in ${a.show(this)}`)}

      optSrcUrl() {return jm.Url.opt(this.optSrcUrlStr())}
      reqSrcUrl() {return new jm.Url(this.reqSrcUrlStr())}

      // TODO more specific name. We have a lexicon collision.
      hasSrc() {
        const val = this.optSrcUrlStr()
        return a.isSome(val) && p.posix.ext(val) === jc.conf.getFileExtSrc()
      }
    }
  }
}

/*
Should contain an import path suitable for the native `import` statement or the
native pseudo-function `import`. More concretely, this should be either an
absolute URL or an implicitly relative path. Example:

  https:///one/two/three.mjs
  file:///one/two/three.mjs
  one/two/three

See the main comment on `ImportBase` for an explanation on why implicitly
relative paths are considered equivalent to absolute paths.

TODO getter error messages should report `.optTarPathAbs` if any.
*/
export class MixTarPathAbsed extends a.DedupMixinCache {
  static make(cls) {
    return class MixTarPathAbsed extends je.MixErrer.goc(cls) {
      #tarPathAbs = undefined
      setTarPathAbs(val) {return this.#tarPathAbs = this.req(val, jm.isCanonicalModulePath), this}
      optTarPathAbs() {return this.#tarPathAbs}
      reqTarPathAbs() {return this.optTarPathAbs() ?? this.throw(`missing target path in ${a.show(this)}`)}

      optTarUrlStr() {return a.only(this.optTarPathAbs(), jm.hasScheme)}
      reqTarUrlStr() {return this.optTarUrlStr() ?? this.throw(`missing target URL in ${a.show(this)}`)}

      optTarUrl() {return jm.Url.opt(this.optTarUrlStr())}
      reqTarUrl() {return new jm.Url(this.reqTarUrlStr())}
    }
  }
}
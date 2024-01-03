import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as je from './jisp_err.mjs'
import * as jch from './jisp_child.mjs'

/*
Abstract base class for various FS implementations. We intend to support
different runtime environments. In Deno and Node, we intend to use the actual
filesystem. In browsers, the current plan is to use an emulated filesystem
backed by a service worker.

The methods `.read`, `.write`, and so on, are expected to support two types of
paths: strings and `URL` objects. An FS implementation that deals with a
regular disk filesystem is expected to support only file URLs. An in-browser
emulated FS may also support network URLs.

For a working implementation, see `DenoFs`.
*/
export class Fs extends a.Emp {
  optTarUrlStr() {throw jm.errMeth(`optTarUrlStr`, this)}

  reqTarUrlStr() {
    const tar = this.optTarUrlStr()
    if (a.isNil(tar)) {
      throw Error(`missing target URL in FS ${a.show(this)}`)
    }
    if (!jm.isAbsUrlStrDirLike(tar)) {
      throw Error(`target URL in FS ${a.show(this)} must be an absolute URL string ending with the directory separator, got ${a.show(tar)}`)
    }
    return tar
  }

  async read() {throw jm.errMeth(`read`, this)}

  // TODO consider renaming to `optRead` for consistency.
  async readOpt() {throw jm.errMeth(`readOpt`, this)}

  async write() {throw jm.errMeth(`write`, this)}

  // TODO rename to `optTimestamp` for consistency.
  async timestamp() {throw jm.errMeth(`timestamp`, this)}
}

export class MixOwnFsed extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnFsed extends je.MixErrer.goc(cls) {
      #fs = undefined
      setFs(val) {return this.#fs = this.reqInst(val, Fs), this}
      ownFs() {return this.#fs}
      optFs() {return this.#fs}
      reqFs() {return this.ownFs() ?? this.throw(`missing FS at ${a.show(this)}`)}
    }
  }
}

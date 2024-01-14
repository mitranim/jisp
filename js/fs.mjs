import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './misc.mjs'
import * as je from './err.mjs'

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

  async reqRead() {throw jm.errMeth(`reqRead`, this)}
  async optRead() {throw jm.errMeth(`optRead`, this)}

  async reqWrite() {throw jm.errMeth(`reqWrite`, this)}

  async optTimestamp() {throw jm.errMeth(`optTimestamp`, this)}
  async reqTimestamp() {throw jm.errMeth(`reqTimestamp`, this)}
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

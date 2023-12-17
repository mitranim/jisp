import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jch from './jisp_child.mjs'

/*
Abstract base class for various FS implementations. We intend to support
different runtime environments. In Deno and Node, we intend to use the actual
filesystem. In browsers, the current plan is to use an emulated filesystem,
which may have to be backed by a service worker for storing and importing
modules that we generate.

For an actual implementation, see `DenoFs`.
*/
export class Fs extends a.Emp {
  async read() {throw jm.errMeth(`read`, this)}
  async checksum() {throw jm.errMeth(`checksum`, this)}
}

export class MixOwnFsed extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnFsed extends cls {
      get Fs() {return Fs}
      #fs = undefined
      setFs(val) {return this.#fs = a.reqInst(val, this.Fs), this}
      ownFs() {return this.#fs}
      optFs() {return this.#fs}
      reqFs() {return this.optFs() ?? this.throw(`missing FS at ${a.show(this)}`)}
    }
  }
}

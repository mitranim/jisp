import * as a from '/Users/m/code/m/js/all.mjs'
import * as jch from './jisp_child.mjs'

/*
Short for "mixin: lexically namespaced". Should be used by AST node classes,
namely by `Node`.

Placed in its own file to avoid cyclic dependencies leading to exceptions during
module evaluation.

Also see `MixOwnLexNsed` in a different file.
*/
export class MixLexNsed extends a.DedupMixinCache {
  static make(cls) {
    return class MixLexNsed extends jch.MixChild.goc(cls) {
      optLexNs() {return this.optAncProcure(ownLexNsCall)}

      reqLexNs() {
        return (
          this.optLexNs() ??
          this.throw(`missing lexical namespace at ${a.show(this)}`)
        )
      }
    }
  }
}

export function ownLexNsCall(src) {
  return a.isObj(src) && `ownLexNs` in src ? src.ownLexNs() : undefined
}

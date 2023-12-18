import * as a from '/Users/m/code/m/js/all.mjs'
import * as jch from './jisp_child.mjs'

/*
Short for "mixin: namespaced lexically". Should be used by AST node classes,
namely by `Node`.

Placed in its own file to avoid cyclic dependencies leading to exceptions during
module evaluation.

Also see `MixOwnNsLexed` in a different file.
*/
export class MixNsLexed extends a.DedupMixinCache {
  static make(cls) {
    return class MixNsLexed extends jch.MixChild.goc(cls) {
      optNsLex() {return this.optAncProcure(ownNsLexCall)}

      reqNsLex() {
        return (
          this.optNsLex() ??
          this.throw(`missing lexical namespace at ${a.show(this)}`)
        )
      }
    }
  }
}

export function ownNsLexCall(src) {
  return a.isObj(src) && `ownNsLex` in src ? src.ownNsLex() : undefined
}

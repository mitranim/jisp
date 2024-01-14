import {a} from './dep.mjs'
import * as jm from './misc.mjs'
import * as jch from './child.mjs'

/*
Short for "mixin: namespaced lexically". Should be used by AST node classes,
namely by `Node`.

Placed in its own file to avoid cyclic dependencies leading to exceptions during
module evaluation.

Also see `MixOwnNsLexed`.
*/
export class MixNsLexed extends a.DedupMixinCache {
  static make(cls) {
    return class MixNsLexed extends jch.MixChild.goc(cls) {
      optNsLex() {return this.optAncProcure(jm.ownNsLexCall)}

      reqNsLex() {
        return (
          this.optNsLex() ??
          this.throw(`missing lexical namespace at ${a.show(this)}`)
        )
      }
    }
  }
}

import * as a from '/Users/m/code/m/js/all.mjs'
import * as je from './jisp_err.mjs'
import * as jp from './jisp_parent.mjs'

/*
FIXME consider:

  * More specialized methods for acquiring lex/pub scope, with better error
    messages about missing scopes, at the current node.
*/
export class MixScoped extends a.DedupMixinCache {
  static make(cls) {
    return class MixScoped extends je.MixErrer.goc(cls) {
      ownScope() {}
      optScope() {return this.ancProcure(ownScope)}
      reqOwnScope() {return this.ownScope() ?? this.throw(`missing own scope at ${a.show(this)}`)}
      reqScope() {return this.optScope() ?? this.throw(`missing scope at ${a.show(this)}`)}
    }
  }
}

export class MixOwnScoped extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnScoped extends jp.MixParent.goc(MixScoped.goc(cls)) {
      #scope = undefined
      ownScope() {return this.#scope ??= this.toValidChild(this.makeScope())}
      setScope(val) {return this.#scope = this.toValidChild(this.reqInst(val, Scope)), this}
      optScope() {return this.#scope ?? super.optScope()}
      makeScope() {return new Scope()}
    }
  }
}

import * as a from '/Users/m/code/m/js/all.mjs'
import * as je from './jisp_err.mjs'

/*
Useful for "named" nodes that derive their name from an ancestor, such as
identifier declarations derived from an AST node.
*/
export class MixNamed extends a.DedupMixinCache {
  static make(cls) {
    return class MixNamed extends je.MixErrer.goc(cls) {
      ownName() {}
      optName() {}
      reqName() {
        return (
          this.optName() ??
          this.throw(`missing name at ${a.show(this)}`)
        )
      }
    }
  }
}

/*
Useful for "named" nodes that declare their name directly, such as AST nodes
describing an identifier declaration.
*/
export class MixOwnNamed extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnNamed extends MixNamed.goc(cls) {
      #name = undefined
      setName(val) {return this.#name = this.req(val, a.isValidStr), this}
      ownName() {return this.#name}
      optName() {return this.#name}
      reqName() {
        return (
          this.ownName() ??
          this.throw(`missing own name at ${a.show(this)}`)
        )
      }
    }
  }
}

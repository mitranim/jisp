import * as a from '/Users/m/code/m/js/all.mjs'
import * as je from './jisp_err.mjs'

/*
Useful for nodes that may be "evaluated" during compiler execution to produce a
usable value, particularly for those which derive their value from an ancestor.
*/
export class MixValued extends a.DedupMixinCache {
  static make(cls) {
    return class MixValued extends je.MixErrer.goc(cls) {
      optVal() {}
      reqVal() {
        return (
          this.optVal() ??
          this.throw(`missing value at ${a.show(this)}`)
        )
      }
    }
  }
}

/*
Useful for nodes that may be "evaluated" during compiler execution to produce a
usable value, such as AST nodes describing a JS primitive value.
*/
export class MixOwnValued extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnValued extends MixValued.goc(cls) {
      #val = undefined
      setVal(val) {return this.#val = val, this}
      ownVal() {return this.#val}
      optVal() {return this.#val}
      reqVal() {
        return (
          this.ownVal() ??
          this.throw(`missing own value at ${a.show(this)}`)
        )
      }
    }
  }
}

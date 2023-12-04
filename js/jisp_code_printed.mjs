import * as a from '/Users/m/code/m/js/all.mjs'
import * as jch from './jisp_child.mjs'
import * as jcp from './jisp_code_printer.mjs'

// Provides shortcuts for accessing a code printer from an ancestor.
export class MixCodePrinted extends a.DedupMixinCache {
  static make(cls) {
    return class MixCodePrinted extends jch.MixChild.goc(cls) {
      ownCodePrinter() {}
      optCodePrinter() {return this.ownCodePrinter() || optCodePrinter(this.optParent())}
      reqCodePrinter() {
        return (
          this.optCodePrinter() ??
          this.throw(`missing printer at ${a.show(this)}`)
        )
      }
    }
  }
}

function optCodePrinter(src) {
  return a.isObj(src) && `optCodePrinter` in src ? src.optCodePrinter() : undefined
}

/*
Provides shortcuts for storing and providing a code printer object.
Used by ancestors of a node hierarchy.
*/
export class MixOwnCodePrinted extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnCodePrinted extends MixCodePrinted.goc(cls) {
      #prn = undefined
      setCodePrinter(val) {return this.#prn = this.reqInst(val, jcp.CodePrinter), this}
      ownCodePrinter() {return this.#prn}
      optCodePrinter() {return this.#prn}
    }
  }
}

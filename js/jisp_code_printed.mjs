import * as a from '/Users/m/code/m/js/all.mjs'
import * as jch from './jisp_child.mjs'
import * as jcp from './jisp_code_printer.mjs'

// Provides shortcuts for accessing a code printer from an ancestor.
export class MixCodePrinted extends a.DedupMixinCache {
  static make(cls) {
    return class MixCodePrinted extends jch.MixChild.goc(cls) {
      optCodePrinter() {return this.optAncProcure(ownCodePrinterCall)}

      reqCodePrinter() {
        return (
          this.optCodePrinter() ??
          this.throw(`missing code printer at ${a.show(this)}`)
        )
      }
    }
  }
}

function ownCodePrinterCall(src) {
  return a.isObj(src) && `ownCodePrinter` in src ? src.ownCodePrinter() : undefined
}

/*
Provides shortcuts for storing and providing a code printer object.
Used by ancestors of a node hierarchy.
*/
export class MixOwnCodePrinted extends a.DedupMixinCache {
  static make(cls) {
    return class MixOwnCodePrinted extends MixCodePrinted.goc(cls) {
      get CodePrinter() {return jcp.CodePrinter}
      #prn = undefined
      setCodePrinter(val) {return this.#prn = this.reqInst(val, this.CodePrinter), this}
      ownCodePrinter() {return this.#prn ??= new this.CodePrinter()}
      optCodePrinter() {return this.#prn}
    }
  }
}

import {a} from './dep.mjs'
import * as jch from './child.mjs'
import * as jcp from './code_printer.mjs'

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

      reqPrn() {return this.reqCodePrinter()}
    }
  }
}

function ownCodePrinterCall(src) {
  return a.isComp(src) && `ownCodePrinter` in src ? src.ownCodePrinter() : undefined
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
      initCodePrinter() {return this.#prn ??= new this.CodePrinter()}
      ownCodePrinter() {return this.initCodePrinter()}
      optCodePrinter() {return this.#prn}
      reqCodePrinter() {return this.initCodePrinter()}
    }
  }
}
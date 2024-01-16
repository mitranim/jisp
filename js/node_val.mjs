import {a} from './dep.mjs'
import * as ji from './insp.mjs'
import * as jn from './node.mjs'
import * as jv from './valued.mjs'
import * as jni from './node_ident.mjs'

/*
Intended for serializing JS values into the AST. May be useful for implementing
macros where input and output are JS values rather than AST nodes. Currently
unused, but this may change in the future.
*/
export class Val extends jv.MixOwnValued.goc(jn.Node) {
  macro() {return this}
  compile() {return this.constructor.compile(this, this.ownVal())}

  static reqValid(val) {
    if (this.isValid(val)) return val
    throw TypeError(this.msgInvalid(val))
  }

  static msgInvalid(val) {
    return `${a.show(this)} is unable to completely represent ${a.show(val)} in compiled JS code; currently supported types: undefined, null, bool, num, str, plain array, plain dict`
  }

  // SYNC[node_val_encode]
  static isValid(val) {
    return (
      false
      || a.isNil(val)
      || a.isBool(val)
      || a.isNum(val)
      || a.isStr(val)
      || (a.isTrueArr(val) && val.every(this.isValid, this))
      || (a.isDict(val) && this.isValid(Object.values(val)))
    )
  }

  // SYNC[node_val_encode]
  static compile(node, val) {
    if (a.isNil(val) || a.isBool(val) || a.isNum(val)) return String(val)
    if (a.isStr(val)) return a.jsonEncode(val)
    if (a.isArr(val)) return this.compileArr(node, val)
    if (a.isDict(val)) return this.compileDict(node, val)
    throw node.err(this.msgInvalid(val))
  }

  static compileArr(node, val) {
    let out = `[`
    let first = true

    for (val of a.reqTrueArr(val)) {
      if (first) first = false
      else out += `, `

      out += this.compile(node, val)
    }

    out += `]`
    return out
  }

  static compileDict(node, val) {
    let out = `{`
    let first = true

    for (const key of Object.keys(a.reqDict(val))) {
      if (first) first = false
      else out += `, `

      out += jni.Ident.toValidDictKey(key)
      out += `: `
      out += this.compile(node, val[key])
    }

    out += `}`
    return out
  }

  static from(val) {return new this().setVal(val)}
  static {this.setReprModuleUrl(import.meta.url)}
  [ji.symInsp](tar) {return super[ji.symInsp](tar).funs(this.optVal)}
}

import * as a from '/Users/m/code/m/js/all.mjs'
import * as jn from './jisp_node.mjs'
import * as jv from './jisp_valued.mjs'
import * as jnun from './jisp_node_unqual_name.mjs'

/*
Intended for serializing JS values into the AST. This is particularly useful
when calling macros with `CallOut.val`, or more generally, whenever
compile-time evaluation produces a value that must be eventually serialized
into the compiled code as a JS value.

FIXME consider if this should be a superclass of all `Node` subclasses
compatible with compile-time evaluation.
*/
export class Val extends jv.MixOwnValued.goc(jn.Node) {
  compile() {return this.constructor.compile(this, this.ownVal())}

  // Must match `.compile`.
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

  // Must match `.isValid`.
  static compile(node, val) {
    if (a.isNil(val) || a.isBool(val) || a.isNum(val)) return String(val)
    if (a.isStr(val)) return JSON.stringify(val)
    if (a.isTrueArr(val)) return this.compileArr(node, val)
    if (a.isDict(val)) return this.compileDict(node, val)
    throw node.err(`unable to encode ${a.show(val)} as JS code; currently supported types: undefined, null, bool, num, str, plain array, plain dict`)
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

      out += jnun.UnqualName.toValidDictKey(key)
      out += `: `
      out += this.compile(node, val[key])
    }

    out += `}`
    return out
  }
}

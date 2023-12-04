import * as a from '/Users/m/code/m/js/all.mjs'
import * as jn from './jisp_node.mjs'
import * as jv from './jisp_valued.mjs'

/*
FIXME consider using, fixing, consolidating, or removing.

Supposed (but unused) superclass for all nodes that may represent a JS value
evaluatable at compile time.
*/
export class ValNode extends jv.MixOwnValued.goc(jn.Node) {
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

      out += UnqualName.toValidDictKey(key)
      out += `: `
      out += this.compile(node, val[key])
    }

    out += `}`
    return out
  }
}

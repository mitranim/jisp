import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './insp.mjs'
import * as jnt from './node_text.mjs'
import * as jv from './valued.mjs'

/*
TODO:

  * Consider supporting arbitrary radix.
    * Possible syntax (from Clojure):
      * `2r01`
      * `10r0123456789`
      * `16r0123456789abcdef`
    * May define a subclass with arbitrary radix support, and leave `Num` for
      the default case of implicit radix 10.
  * Consider separate classes and parsing for float literals (naming "float" or
    "fract") and integer literals (naming "int").

TODO: support for JS bigints (new node class).
*/
export class Num extends jv.MixOwnValued.goc(jnt.Text) {
  static regexp() {return /^-?\d+(_\d+)*(?:[.]\d+(_\d+)*)?(?![\w$])/}

  /*
  Should be used to store a string representation of a numeric literal when
  parsing this node from source code. This may be seen as redundant with
  `.setVal` / `.reqVal` which is used for actual numeric values. Instead of
  storing this string, we could always decode numbers when parsing, and always
  encode them when compiling. However, the decoding / encoding approach seems
  less reliable, and also slightly more costly. Preserving numeric literals
  as-is guarantees that we avoid number corruption resulting from roundtrip
  conversion.
  */
  #strVal = undefined
  setStrVal(val) {return this.#strVal = this.req(val, a.isValidStr), this}
  ownStrVal() {return this.#strVal}
  reqStrVal() {return this.ownStrVal() ?? this.throw(`missing string representation of numeric literal at ${a.show(this)}`)}

  setVal(val) {return super.setVal(this.req(val, a.isFin))}

  ownVal() {
    let out = super.ownVal()
    if (a.isSome(out)) return out

    const src = this.ownStrVal()
    if (a.isNil(src)) return undefined

    out = this.constructor.parseFloat(src)
    this.setVal(out)
    return out
  }

  // Override for `Text..setMatch`.
  setMatch(mat) {
    super.setMatch(mat)
    this.setStrVal(mat[0])
    return this
  }

  macro() {return this}

  compile() {
    const str = this.ownStrVal()
    if (a.isSome(str)) return str

    const num = this.ownVal()
    if (a.isSome(num)) return String(num)

    throw this.err(`unable to compile ${a.show(this)}: missing string representation and missing numeric value`)
  }

  compileRepr() {
    let out = super.compileRepr()

    const str = a.optStr(this.ownStrVal())
    if (a.isSome(str)) out += `.setStrVal(${a.jsonEncode(str)})`

    const num = a.optFin(this.ownVal())
    if (a.isSome(num)) out += `.setVal(${num})`

    return out
  }

  static parseFloat(src) {
    a.reqStr(src)
    // Workaround for the lack of underscore support in `Number.parseFloat`.
    if (src.includes(`_`)) src = src.replace(/_/g, ``)
    return Number.parseFloat(src)
  }

  static {this.setReprModuleUrl(import.meta.url)}

  [ji.symInsp](tar) {return super[ji.symInsp](tar).funs(this.ownVal)}
}

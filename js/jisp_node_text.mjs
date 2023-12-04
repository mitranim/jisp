import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jn from './jisp_node.mjs'

export class Text extends jn.Node {
  // Override in subclass. Must return a regex.
  static reg() {throw jm.errMeth(`reg`, this)}

  static match(src) {return this.reg().exec(a.reqStr(src))}

  static parse(span) {
    const mat = this.match(span.rem())
    if (!mat) return undefined

    const tar = new this().setSpan(span.withLen(0)).fromMatch(mat)
    span.skip(tar.reqSpan().ownLen())
    return tar
  }

  static isValid(val) {return jm.isFullMatch(val, this.reg())}

  fromMatch(mat) {return this.reqSpan().setLen(mat[0].length), this}
}

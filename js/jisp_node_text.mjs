import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jn from './jisp_node.mjs'

export class Text extends jn.Node {
  // Override in subclass. Must return a regex.
  static regexp() {throw jm.errMeth(`regexp`, this)}

  static match(src) {return this.regexp().exec(a.reqStr(src))}

  static parse(span) {
    const mat = this.match(span.rem())
    if (!mat) return undefined

    const tar = new this()
    tar.initSpan().setFrom(span).setLen(0)
    tar.setMatch(mat)
    span.skip(tar.reqSpan().ownLen())
    return tar
  }

  static isValid(val) {return jm.isFullMatch(val, this.regexp())}

  setMatch(mat) {
    this.reqSpan().setLen(a.reqStr(mat[0]).length)
    return this
  }

  static reprModuleUrl = import.meta.url
}

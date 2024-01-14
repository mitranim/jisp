import {a} from './dep.mjs'
import * as jm from './misc.mjs'
import * as je from './err.mjs'
import * as jn from './node.mjs'

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
    this.validateSuffix(span)

    return tar
  }

  static isValid(val) {return jm.isFullMatch(val, this.regexp())}

  static validateSuffix() {}

  static validateNoPrefix(span, pre) {
    a.reqValidStr(pre)
    if (span.rem().startsWith(pre)) {
      throw je.TokenizerErr.fromSpan(span, `unexpected ${a.show(pre)}`)
    }
  }

  setMatch(mat) {
    this.reqSpan().setLen(a.reqStr(mat[0]).length)
    return this
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

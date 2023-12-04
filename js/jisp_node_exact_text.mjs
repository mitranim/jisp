import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jnt from './jisp_node_text.mjs'

export class ExactText extends jnt.Text {
  // Override in subclass.
  static src() {throw jm.errMeth(`src`, this)}

  static parse(span) {
    const pre = a.reqValidStr(this.src())
    if (!span.rem().startsWith(pre)) return undefined

    const tar = new this().setSpan(span.withLen(pre.length))
    span.skip(pre.length)
    return tar
  }

  macro() {return this}
}

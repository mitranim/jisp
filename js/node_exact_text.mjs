import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './misc.mjs'
import * as jnt from './node_text.mjs'

export class ExactText extends jnt.Text {
  // Override in subclass.
  static src() {throw jm.errMeth(`src`, this)}

  static parse(span) {
    const pre = a.reqValidStr(this.src())
    if (!span.rem().startsWith(pre)) return undefined

    const tar = new this()
    tar.initSpan().setFrom(span).setLen(pre.length)
    span.skip(pre.length)
    return tar
  }

  macro() {return this}

  static {this.setReprModuleUrl(import.meta.url)}
}

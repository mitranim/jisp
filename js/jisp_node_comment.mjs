import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnt from './jisp_node_text.mjs'

/*
FIXME:

  * Make comment character configurable.

  * Switch from line comment support to fence comment support.

    * Requires handling JS comment delimiters in Jisp comment body, or compiling
      into single line comments.
*/
export class Comment extends jnt.Text {
  static regexp() {return /^;([^\n\r]*)(\r\n|\r|\n|$)/}
  static prefix() {return `;`}
  prefix() {return this.constructor.prefix()}

  #body = ``
  ownBody() {return this.#body}
  setBody(val) {return this.#body = this.req(val, a.isStr), this}

  #delim = ``
  ownDelim() {return this.#delim}
  setDelim(val) {return this.#delim = this.req(val, a.isStr), this}

  setMatch(mat) {
    super.setMatch(mat)
    this.setBody(mat[1])
    this.setDelim(mat[2])
    return this
  }

  isCosmetic() {return true}
  macro() {return this}
  compile() {return `//` + a.reqStr(this.#body) + a.reqStr(this.#delim)}
  static moduleUrl = import.meta.url
}

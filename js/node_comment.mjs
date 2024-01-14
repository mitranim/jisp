import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnt from './node_text.mjs'

export class CommentBase extends jnt.Text {
  #body = undefined
  setBody(val) {return this.#body = this.req(val, a.isStr), this}
  optBody() {return this.#body}

  isCosmetic() {return true}
  macro() {return this}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class CommentFenced extends CommentBase {
  static regexp() {return /^(;{2,})(?!;)([^]*?)\1/}
  static validateSuffix(span) {this.validateNoPrefix(span, `;`)}

  // Override for `Text..setMatch`.
  setMatch(mat) {
    super.setMatch(mat)
    this.setBody(mat[2])
    return this
  }

  compile() {
    return (
      ``
      + `/*`
      + a.laxStr(this.optBody()).replaceAll(/[*][/]/g, `\\*/`)
      + `*/`
    )
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

/*
Unused. We're still considering whether to use fenced comments or single-line
comments. Using both would be unwise.
*/
export class CommentSingleLine extends jnt.Text {
  static regexp() {return /^;([^\n\r]*)(\r\n|\r|\n|$)/}

  #term = undefined
  setTerm(val) {return this.#term = this.req(val, a.isStr), this}
  ownTerm() {return this.#term}

  // Override for `Text..setMatch`.
  setMatch(mat) {
    super.setMatch(mat)
    this.setBody(mat[1])
    this.setTerm(mat[2])
    return this
  }

  compile() {
    return `//` + a.laxStr(this.optBody()) + a.laxStr(this.optTerm())
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

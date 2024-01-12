import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnt from './jisp_node_text.mjs'

export class CommentBase extends jnt.Text {
  #body = undefined
  setBody(val) {return this.#body = this.req(val, a.isStr), this}
  optBody() {return this.#body}

  isCosmetic() {return true}
  macro() {return this}
  static reprModuleUrl = import.meta.url
}

export class CommentFenced extends CommentBase {
  static regexp() {return /^(;{2,})(?!;)([^]*?)(?<!;)(\1)(?!;)/}

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

  static reprModuleUrl = import.meta.url
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

  setMatch(mat) {
    super.setMatch(mat)
    this.setBody(mat[1])
    this.setTerm(mat[2])
    return this
  }

  compile() {
    return `//` + a.laxStr(this.optBody()) + a.laxStr(this.optTerm())
  }

  static reprModuleUrl = import.meta.url
}

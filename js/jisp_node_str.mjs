import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jnt from './jisp_node_text.mjs'
import * as jv from './jisp_valued.mjs'

export class Str extends jv.MixOwnValued.goc(jnt.Text) {
  ownVal() {return a.laxStr(super.ownVal())}
  setVal(val) {return super.setVal(this.req(val, a.isStr))}
  macro() {return this}
  [ji.symInspMod](tar) {return super[ji.symInspMod](tar).funs(this.ownVal)}
}

/*
Represents a "raw" string, like backtick strings in Go. Unlike JS, but like Go,
Jisp needs raw string syntax. Partially because it lacks special syntax for
regexes, and instead must use a regex-generating macro where the input is a raw
string. There may be other use cases.

FIXME: support resizable fences. Raw strings are unusable without that.

FIXME: escape when encoding.
*/
export class StrBacktick extends Str {
  static reg() {return /^`([^`]*)`/}

  fromMatch(mat) {
    super.fromMatch(mat)
    this.setVal(mat[1])
    return this
  }

  // FIXME implement. Must escape backticks and backslashes. Should not need
  // to escape anything else.
  // compile() {}
}

export class StrDouble extends Str {
  static reg() {return /^"((?:\\.|[^"])*)"/}

  optVal() {
    let val = super.optVal()
    if (a.isNil(val)) {
      val = this.constructor.decode(this.decompile())
      this.setVal(val)
    }
    return val
  }

  /*
  Semi-placeholder. This supports some common escape sequences in JS strings,
  such as `\n`. But this also lacks support for some newer escape sequences
  which are not supported in JSON. This may produce outputs which are not
  equivalent to the result of evaluating the given string in JS.
  */
  static decode(val) {return JSON.parse(a.reqStr(val))}

  compile() {return this.decompile()}
}

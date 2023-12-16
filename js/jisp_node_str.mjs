import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jnt from './jisp_node_text.mjs'
import * as jv from './jisp_valued.mjs'

export class Str extends jv.MixOwnValued.goc(jnt.Text) {
  setVal(val) {return super.setVal(this.req(val, a.isStr))}
  macro() {return this}
  [ji.symInsp](tar) {return super[ji.symInsp](tar).funs(this.ownVal)}
}

/*
Represents a "raw" string, like backtick strings in Go. Unlike JS, but like Go,
Jisp needs raw string syntax. Part of the reason is that unlike JS, but like Go,
Jisp doesn't have special syntax for regexes, and instead must use a macro that
takes a raw string and eventually compiles to JS regex syntax. There may be
other cases.

FIXME: support resizable fences. Raw strings are unusable without that.
*/
export class StrBacktick extends Str {
  static regexp() {return /^`([^`]*)`/}

  setMatch(mat) {
    super.setMatch(mat)
    this.setVal(mat[1])
    return this
  }

  compile() {
    return (
      ``
      + '`'
      + this.ownVal()
        // Included for completeness. This should never occur in instances
        // parsed from source code, but may occur if the value is set
        // programmatically during macroing.
        .replaceAll('`', '\\`')
        .replaceAll(`\\`, `\\\\`)
      + '`'
    )
  }
}

export class StrDouble extends Str {
  static regexp() {return /^"(?:\\"|[^"])*"/}

  ownVal() {
    return (
      super.ownVal() ??
      this.setVal(this.constructor.decode(this.decompile())).ownVal()
    )
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

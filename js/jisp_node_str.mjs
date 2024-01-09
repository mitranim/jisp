import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jnt from './jisp_node_text.mjs'
import * as jv from './jisp_valued.mjs'

export class Str extends jv.MixOwnValued.goc(jnt.Text) {
  setVal(val) {return super.setVal(this.req(val, a.isStr))}
  macro() {return this}
  static moduleUrl = import.meta.url;
  [ji.symInsp](tar) {return super[ji.symInsp](tar).funs(this.ownVal)}
}

/*
Represents a "raw" string delimited by backticks. Supports resizable delimiters:
groups of subsequent backticks form "fences" of arbitrary length.

A "raw" string has no support for escape sequences. All inner content is taken
as-is, exactly, without any special conversion or interpretation. Compare
`StrDouble` which supports escape sequences.

Motives for "raw" strings:

  * As a general case, raw strings with resizable fences are convenient for
    embedding arbitrary syntaxes / languages. The most common example is regexp
    syntax, see below.

  * As a special case, they're convenient for regexps. Unlike JS, Jisp doesn't
    have a built-in syntax for regexp literals. Instead, it has to use a macro
    that takes a raw string and eventually compiles to a JS regexp literal. Go
    and Python use similar solutions, although with runtime functions rather
    than macros.
*/
export class StrBacktick extends Str {
  static regexp() {return /^(?:`()`(?!`)|(`+)(?!`)([^]*?)(?<!`)(\2)(?!`))/}

  setMatch(mat) {
    super.setMatch(mat)

    const body = mat[1] ?? mat[3]
    if (a.isNil(body)) {
      throw this.err(`internal error: regexp match was found but captured content was nil`)
    }

    this.setVal(body)
    return this
  }

  compile() {
    return (
      ``
      + '`'
      + this.ownVal()
        .replaceAll(`\\`, `\\\\`)
        .replaceAll('`', '\\`')
      + '`'
    )
  }

  static moduleUrl = import.meta.url
}

/*
Represents a double-quoted non-raw string with support for escape sequences.
TODO: consider supporting resizable fences, just like in `StrBacktick`.
*/
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

  static moduleUrl = import.meta.url
}

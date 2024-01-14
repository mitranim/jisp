import * as a from '/Users/m/code/m/js/all.mjs'
import * as ji from './jisp_insp.mjs'
import * as jnt from './jisp_node_text.mjs'
import * as jv from './jisp_valued.mjs'

/*
Base class for all our strings. String representations in source code support
resizable fences. The parsed content should be obtained with `.reqVal`.
*/
export class Str extends jv.MixOwnValued.goc(jnt.Text) {
  setVal(val) {return super.setVal(this.req(val, a.isStr))}

  macro() {return this}

  compileRepr() {
    const val = this.reqVal()
    if (val) return super.compileRepr() + `.setVal(${a.jsonEncode(val)})`
    return super.compileRepr()
  }

  static {this.setReprModuleUrl(import.meta.url)}

  [ji.symInsp](tar) {return super[ji.symInsp](tar).funs(this.ownVal)}
}

/*
Represents a string without support for escape sequences. In some languages,
such as Go and Python, this would be called a "raw" string. All inner content
is taken as-is, exactly, without any special conversion or interpretation.
Compare `StrDouble` which supports escape sequences.

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
  static regexp() {return /^(?:``(?!`)|(`+)(?!`)([^]*?)\1)/}
  static validateSuffix(span) {this.validateNoPrefix(span, '`')}

  // Override for `Text..setMatch`.
  setMatch(mat) {
    super.setMatch(mat)
    this.setVal(a.laxStr(mat[2]))
    return this
  }

  compile() {
    return (
      ``
      + '`'
      + this.reqVal()
        .replaceAll(`\\`, `\\\\`)
        .replaceAll('`', '\\`')
      + '`'
    )
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

// Represents a string with support for escape sequences.
export class StrDouble extends Str {
  static regexp() {return /^(?:""(?!")|("+)(?!")((?:\\[^]|[^])*?)\1)/}
  static validateSuffix(span) {this.validateNoPrefix(span, `"`)}

  // Override for `Text..setMatch`.
  setMatch(mat) {
    super.setMatch(mat)
    this.setVal(this.decode(a.laxStr(mat[2])))
    return this
  }

  compile() {return a.jsonEncode(this.reqVal())}

  /*
  Semi-placeholder. This supports some common escape sequences in JS strings,
  such as `\n`. But this also lacks support for some newer escape sequences
  which are not supported in JSON. This may produce outputs which are not
  equivalent to the result of evaluating the given string in JS.
  */
  decode(val) {
    a.reqStr(val)
    if (val.includes(`\\`)) return JSON.parse(`"` + a.reqStr(val) + `"`)
    return val
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

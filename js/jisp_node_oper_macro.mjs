import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

/*
Base class for macros that implement JS operators.

JS operators tend to be unary or binary. Our equivalent macros tend to be
variadic. This class supports unary and variadic forms. Nullary forms are not
supported because they're not particularly useful, and for some JS operators,
there is no sensible "fallback" value.
*/
export class OperMacro extends jnlm.ListMacro {
  macroImpl() {
    this.reqChildCountMin(2)
    return this.macroFrom(1)
  }

  compile() {
    const out = a.reqStr(
      this.childCount() === 2
      ? this.compileUnary(this.reqChildAt(1))
      : this.compileVariadic(this.optChildSlice(1))
    )
    return this.isExpression() ? `(` + out + `)` : out
  }

  compileUnary() {throw jm.errMeth(`compileUnary`, this)}
  compileVariadic() {throw jm.errMeth(`compileVariadic`, this)}
}

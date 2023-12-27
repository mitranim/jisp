import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

/*
Base class for macros that implement JS infix operators.

Note that many such operators can be either unary or binary in JS, and in our
system, they tend to be variadic. This class supports both unary and binary
modes.

For some JS operators, JS supports only the binary mode (2 or more operands),
but we also support an unary mode (1 operand), if we can define a sensible
behavior. However, we usually can't define a sensible default behavior with 0
operands.
*/
export class OperInfix extends jnlm.ListMacro {
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

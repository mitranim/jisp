import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnom from './jisp_node_oper_macro.mjs'

export class Plus extends jnom.OperMacro {
  /*
  In unary mode, explicit `+` ensures that the operand is converted to a number.
  This would be unnecessary if the operand was always a number, but JS allows
  to convert an arbitrary expression to a number by using `+`, invoking
  `.valueOf` methods where relevant, parsing numeric strings, and falling back
  on `0` when everything else fails. Some consider this an anti-pattern. Some
  encourage this. Our job is to make this possible to use.

  The preceding space prevents the operator from accidentally merging with the
  compiled child expression. If the child expression also begins with an unary
  operator, then without a delimiter, we might get a JS syntax error.
  */
  compileUnary(src) {
    return `+ ` + a.reqStr(src.compile())
  }

  compileVariadic(src) {
    return this.reqCodePrinter().mapCompile(src).join(` + `)
  }
}

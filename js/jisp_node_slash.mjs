import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnom from './jisp_node_oper_macro.mjs'

/*
Unlike the other arithmetic operator macros, this macro does not have an unary
form. It must be binary or higher. That's because there is more than one way to
define its unary behavior, with no obvious, objective way to choose one. In
traditional Lisps, `(/ N)` becomes `1/N`, but we could also define it as `N/1`.
Both approaches have various issues, and for the language users reading the code
involving this macro, there would be no single, obvious way to guess which
approach is used. It seems better to avoid implementing the unary form.
*/
export class Slash extends jnom.OperMacro {
  macroImpl() {
    this.reqChildCountMin(3)
    return this.macroFrom(1)
  }

  compileVariadic(src) {
    return this.reqCodePrinter().mapCompile(src).join(` / `)
  }
}

import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnom from './jisp_node_oper_macro.mjs'

export class Slash extends jnom.OperMacro {
  /*
  Our behavior is inconsistent with tarditional Lisps, where unary division
  `(/ N)` is implicitly equivalent to binary division `(/ 1 N)`.

  The traditional definition makes no sense. In the unary form, and ONLY in the
  unary form, it treats the first argument as a divisor for the implicit
  divisible `1`, while in all other forms, it treats the first argument as the
  divisible. Compare the following cases. The first one is traditional. The
  second one is ours.

    (/ 10)          -> (/ 1 10)
       ↑ divisible?
                            ↑ divisor!

    [/ 10]          -> [/ 10 1]
       ↑ divisible        ↑ still divisible!

  Compare non-unary cases, which are equivalent in both systems.

    [/ 10 20]
       ↑ divisible
          ↑ divisor

    [/ 10 20 30]
       ↑ divisible
          ↑  ↑ divisors

    [/ 10 20 30 40]
       ↑ divisible
          ↑  ↑  ↑ divisors

  Our behavior treats the first argument more consistently: it's ALWAYS the
  divisible.
  */
  compileUnary(src) {
    return a.reqStr(src.compile()) + ` / 1`
  }

  compileVariadic(src) {
    return this.reqCodePrinter().mapCompile(src).join(` / `)
  }
}

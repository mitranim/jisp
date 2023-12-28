import * as a from '/Users/m/code/m/js/all.mjs'
import * as jm from './jisp_misc.mjs'
import * as jnlm from './jisp_node_list_macro.mjs'

/*
Base class for macros that represent and compile to JS expressions that use JS
operators or keywords.

For JS operators and keywords, arity tends to be fixed: unary, binary, or
ternary. None of them are variadic. Some of them are overloaded: `-` and `+`
can be either unary or binary.

In our system, arity is more flexible. For unary JS operators, our equivalent
macros may also support a nullary form. For binary JS operators, our equivalent
macros may support arities 0-N, 1-N, or 2-N, depending on the semantics of the
target operator.

This base class assumes arity 0-N, and provides various shortcuts for subclasses
that may want to specialize.
*/
export class KeywordExprMacro extends jnlm.ListMacro {
  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(1)
    return this.macroFrom(1)
  }

  compile() {
    const len = this.childCount()

    return this.compileStatementOrExpression(
      len === 1
      ? this.compileNullary()
      : len === 2
      ? this.compileUnary(this.reqChildAt(1))
      : this.compileVariadic(this.optChildSlice(1))
    )
  }

  compileNullary() {throw this.errMeth(`compileNullary`)}

  compileUnary(src) {
    return a.spaced(
      a.reqStr(this.unaryPrefix()),
      a.reqStr(src.compile()),
      a.reqStr(this.unarySuffix()),
    )
  }

  compileVariadic(src) {
    return this.reqCodePrinter()
      .mapCompile(src)
      .join(` ` + a.reqStr(this.binaryInfix()) + ` `)
  }

  unaryPrefix() {throw this.errMeth(`unaryPrefix`)}
  unarySuffix() {throw this.errMeth(`unarySuffix`)}
  binaryInfix() {throw this.errMeth(`binaryInfix`)}
}

export class KeywordExprMacro_0_1 extends KeywordExprMacro {
  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(1, 2)
    return this.macroFrom(1)
  }
}

export class KeywordExprMacro_1 extends KeywordExprMacro {
  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(2)
    return this.macroFrom(1)
  }
}

export class KeywordExprMacro_1_N extends KeywordExprMacro {
  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(2)
    return this.macroFrom(1)
  }
}

export class KeywordExprMacro_2_N extends KeywordExprMacro {
  macroImpl() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(3)
    return this.macroFrom(1)
  }
}

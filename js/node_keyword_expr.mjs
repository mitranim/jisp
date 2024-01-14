import {a} from './dep.mjs'
import * as jn from './node.mjs'
import * as jnlm from './node_list_macro.mjs'

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
export class KeywordExpr extends jnlm.ListMacro {
  macro() {
    this.reqEveryChildNotCosmetic()
    return this.macroFrom(0)
  }

  compile() {
    const len = this.childCount()

    return this.compileStatementOrExpression(
      len === 0
      ? this.compileNullary()
      : len === 1
      ? this.compileUnary()
      : this.compileVariadic()
    )
  }

  compileNullary() {throw this.errMeth(`compileNullary`)}

  compileUnary() {
    return a.spaced(
      a.reqStr(this.unaryPrefix()),
      jn.optCompileNode(this.reqFirstChild()),
      a.reqStr(this.unarySuffix()),
    )
  }

  compileVariadic() {
    return this.reqPrn()
      .mapCompile(this.optChildArr())
      .join(` ` + a.reqStr(this.binaryInfix()) + ` `)
  }

  unaryPrefix() {throw this.errMeth(`unaryPrefix`)}
  unarySuffix() {throw this.errMeth(`unarySuffix`)}
  binaryInfix() {throw this.errMeth(`binaryInfix`)}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class KeywordExpr_0_1 extends KeywordExpr {
  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(0, 1)
    return this.macroFrom(0)
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

export class KeywordExpr_1 extends KeywordExpr {
  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(1)
    return this.macroFrom(0)
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

export class KeywordExpr_0_2 extends KeywordExpr {
  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountBetween(0, 2)
    return this.macroFrom(0)
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

export class KeywordExpr_2 extends KeywordExpr {
  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCount(2)
    return this.macroFrom(0)
  }

  compile() {
    return this.compileStatementOrExpression(a.spaced(
      jn.optCompileNode(this.reqChildAt(0)),
      a.reqStr(this.binaryInfix()),
      jn.optCompileNode(this.reqChildAt(1)),
    ))
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

export class KeywordExpr_1_N extends KeywordExpr {
  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(1)
    return this.macroFrom(0)
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

export class KeywordExpr_2_N extends KeywordExpr {
  macro() {
    this.reqEveryChildNotCosmetic()
    this.reqChildCountMin(2)
    return this.macroFrom(0)
  }

  static {this.setReprModuleUrl(import.meta.url)}
}

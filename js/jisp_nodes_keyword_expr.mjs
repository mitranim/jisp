import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnkem from './jisp_node_keyword_expr_macro.mjs'

/*
This supports unary, binary, and variadic modes, because in JS, the operator `+`
is also overloaded to have both unary and binary modes. In unary mode, explicit
`+` ensures that the operand is converted to a number. This would be
unnecessary if the operand was always a number, but JS allows to convert an
arbitrary expression to a number by using `+`, invoking `.valueOf` methods
where relevant, parsing numeric strings, and falling back on `NaN` when
conversion fails. Some consider this an anti-pattern. Some encourage this. Our
job is to make this possible to use.
*/
export class Plus extends jnkem.KeywordExprMacro_1_N {
  unaryPrefix() {return `+`}
  unarySuffix() {return ``}
  binaryInfix() {return `+`}
}

// See `Plus` for some comments and explanations.
export class Minus extends jnkem.KeywordExprMacro_1_N {
  unaryPrefix() {return `-`}
  unarySuffix() {return ``}
  binaryInfix() {return `-`}
}

export class Aster extends jnkem.KeywordExprMacro_1_N {
  unaryPrefix() {return `1 *`}
  unarySuffix() {return ``}
  binaryInfix() {return `*`}
}

/*
Unlike the other arithmetic operator macros, this macro does not have an unary
form. It must be binary or higher. That's because there is more than one way to
define its unary behavior, with no obvious, objective way to choose one. In
traditional Lisps, `(/ N)` becomes `1/N`, but we could also define it as `N/1`.
Both approaches have various issues, and for the language users reading the code
involving this macro, there would be no single, obvious way to guess which
approach is used. It seems better to avoid implementing the unary form.
*/
export class Slash extends jnkem.KeywordExprMacro_2_N {
  binaryInfix() {return `/`}
}

export class Bang extends jnkem.KeywordExprMacro_1 {
  unaryPrefix() {return `!`}
  unarySuffix() {return ``}
}

export class BitNot extends jnkem.KeywordExprMacro_1 {
  unaryPrefix() {return `~`}
  unarySuffix() {return ``}
}

export class BitAnd extends jnkem.KeywordExprMacro_2_N {
  binaryInfix() {return `&`}
}

export class BitOr extends jnkem.KeywordExprMacro_2_N {
  binaryInfix() {return `|`}
}

export class BitXor extends jnkem.KeywordExprMacro_2_N {
  binaryInfix() {return `^`}
}

export class And extends jnkem.KeywordExprMacro {
  compileNullary() {return `true`}
  unaryPrefix() {return ``}
  unarySuffix() {return ``}
  binaryInfix() {return `&&`}
}

export class Or extends jnkem.KeywordExprMacro {
  compileNullary() {return `false`}
  unaryPrefix() {return ``}
  unarySuffix() {return ``}
  binaryInfix() {return `||`}
}

export class Typeof extends jnkem.KeywordExprMacro_1 {
  unaryPrefix() {return `typeof`}
  unarySuffix() {return ``}
}

export class Await extends jnkem.KeywordExprMacro_0_1 {
  compileNullary() {return `undefined`}
  unaryPrefix() {return `await`}
  unarySuffix() {return ``}
}

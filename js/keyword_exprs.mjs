import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnke from './node_keyword_expr.mjs'

/*
This file should contain macros that implement simple JS expressions that use
operators or keywords. In other words, it should contain subclasses of
`KeywordExpr`.

Macros that can't be easily expressed in terms of `KeywordExpr` should be
placed in their own files. For example, that would include keywords that
declare new names or modify the namespace of a declaration, such as `async`.

Non-exhaustive list of missing keywords and operators:

  Assignments:

    ++   (assign increment)
    --   (assign decrement)
    +=   (assign add)
    -=   (assign subtract)
    *=   (assign multiply)
    %=   (assign remainder)
    <<=  (assign left shift)
    >>=  (assign right shift)
    >>>= (assign right shift unsigned)
    &&=  (assign and)
    ||=  (assign or)
    ??=  (assign coalesce)

  Misc:

    async
    async*
    yield
    yield*
*/

export class Assign extends jnke.KeywordExpr_2 {
  binaryInfix() {return `=`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Equal extends jnke.KeywordExpr_2 {
  binaryInfix() {return `===`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class NotEqual extends jnke.KeywordExpr_2 {
  binaryInfix() {return `!==`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Greater extends jnke.KeywordExpr_2 {
  binaryInfix() {return `>`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class GreaterOrEqual extends jnke.KeywordExpr_2 {
  binaryInfix() {return `>=`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Lesser extends jnke.KeywordExpr_2 {
  binaryInfix() {return `<`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class LesserOrEqual extends jnke.KeywordExpr_2 {
  binaryInfix() {return `<=`}
  static {this.setReprModuleUrl(import.meta.url)}
}

/*
The Jisp version of `+` can be unary, binary, and variadic, but not nullary.
In JS, the operator `+` is overloaded on both arity and types.

The unary mode of the `+` operator converts the operand to a floating point
number, using a variety of special cases like invoking `.valueOf` methods,
parsing numeric strings, and more. Pretty much a stereotypical example of weak
typing in action. Many programmers consider this an anti-pattern. In any case,
this is part of JS and sometimes useful, so we support the unary form.

The binary form of the `+` operator supports at least the following:

  * Concatenating strings.
  * Adding floating point numbers.
  * Adding big integers.
  * (Secretly) Adding 32-bit integers.

The type overloads prevent us from having a nullary form of this macro, because
there is no single sensible fallback value.
*/
export class Add extends jnke.KeywordExpr_1_N {
  unaryPrefix() {return `+`}
  unarySuffix() {return ``}
  binaryInfix() {return `+`}
  static {this.setReprModuleUrl(import.meta.url)}
}

// See `Add` for some comments and explanations.
export class Subtract extends jnke.KeywordExpr_1_N {
  unaryPrefix() {return `-`}
  unarySuffix() {return ``}
  binaryInfix() {return `-`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Multiply extends jnke.KeywordExpr_1_N {
  unaryPrefix() {return `1 *`}
  unarySuffix() {return ``}
  binaryInfix() {return `*`}
  static {this.setReprModuleUrl(import.meta.url)}
}

/*
Unlike the other arithmetic operator macros, this macro does not have an unary
form. It must be binary or higher. That's because there is more than one way to
define its unary behavior, with no obvious, objective way to choose one.

In traditional Lisps, `(/ N)` becomes `1/N`, but we could also define it as
`N/1`. Both approaches have benefits and drawbacks, and for the users reading
the code involving this macro, there would be no single, obvious way to guess
which approach is used. It seems better to avoid implementing the unary form.
*/
export class Divide extends jnke.KeywordExpr_2_N {
  binaryInfix() {return `/`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Exponentiate extends jnke.KeywordExpr_1_N {
  unaryPrefix() {return ``}
  unarySuffix() {return `** 1`}
  binaryInfix() {return `**`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Remainder extends jnke.KeywordExpr_2_N {
  binaryInfix() {return `%`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Not extends jnke.KeywordExpr_0_1 {
  compileNullary() {return `false`}
  unaryPrefix() {return `!`}
  unarySuffix() {return ``}
  static {this.setReprModuleUrl(import.meta.url)}
}

/*
Technical note.

In JS, `!!` is a combination of two occurrences of the operator `!`, and JS does
not have operators `!!`, `!!!`, etc. That works in JS because operator parsing
is based on a whitelist of special cases of "known" operators, which sometimes
allows to stack unary operators without intermediary delimiters.

In Jisp, operator parsing is generalized. We define a set of "operator
characters", and any sequence of those characters without intervening
delimiters is parsed as a single operator. At the parser level, there is no
whitelist of "known" operators. Once parsed, operators act as regular
identifiers, with regular declaration lookup. See `IdentOper`. As a result, if
we want to use `!!` in our code, it has to be declared separately in addition
to `!`.
*/
export class NotNot extends jnke.KeywordExpr_0_1 {
  compileNullary() {return `true`}
  unaryPrefix() {return `!!`}
  unarySuffix() {return ``}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class BitNot extends jnke.KeywordExpr_1 {
  unaryPrefix() {return `~`}
  unarySuffix() {return ``}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class BitAnd extends jnke.KeywordExpr_2_N {
  binaryInfix() {return `&`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class BitOr extends jnke.KeywordExpr_2_N {
  binaryInfix() {return `|`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class BitXor extends jnke.KeywordExpr_2_N {
  binaryInfix() {return `^`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class BitShiftLeft extends jnke.KeywordExpr_2_N {
  binaryInfix() {return `<<`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class BitShiftRight extends jnke.KeywordExpr_2_N {
  binaryInfix() {return `>>`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class BitShiftRightUnsigned extends jnke.KeywordExpr_2_N {
  binaryInfix() {return `>>>`}
  static {this.setReprModuleUrl(import.meta.url)}
}

/*
The fallback on `true` is very questionable.
The JS operator `&&` supports arbitrary types.
We may consider changing the fallback to `undefined`.
*/
export class And extends jnke.KeywordExpr {
  compileNullary() {return `true`}
  unaryPrefix() {return ``}
  unarySuffix() {return ``}
  binaryInfix() {return `&&`}
  static {this.setReprModuleUrl(import.meta.url)}
}

/*
The fallback on `false` is very questionable.
The JS operator `||` supports arbitrary types.
We may consider changing the fallback to `undefined`.
*/
export class Or extends jnke.KeywordExpr {
  compileNullary() {return `false`}
  unaryPrefix() {return ``}
  unarySuffix() {return ``}
  binaryInfix() {return `||`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Coalesce extends jnke.KeywordExpr {
  compileNullary() {return `undefined`}
  unaryPrefix() {return ``}
  unarySuffix() {return ``}
  binaryInfix() {return `??`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class In extends jnke.KeywordExpr_2 {
  binaryInfix() {return `in`}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Typeof extends jnke.KeywordExpr_1 {
  unaryPrefix() {return `typeof`}
  unarySuffix() {return ``}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Instanceof extends jnke.KeywordExpr_2 {
  binaryInfix() {return `instanceof`}
  static {this.setReprModuleUrl(import.meta.url)}
}

// TODO: support bare and 0-N variadic.
export class Void extends jnke.KeywordExpr_0_1 {
  compileNullary() {return `undefined`}
  unaryPrefix() {return `void`}
  unarySuffix() {return ``}
  static {this.setReprModuleUrl(import.meta.url)}
}

export class Await extends jnke.KeywordExpr_0_1 {
  compileNullary() {return `undefined`}
  unaryPrefix() {return `await`}
  unarySuffix() {return ``}
  static {this.setReprModuleUrl(import.meta.url)}
}

/*
This is the only half-decent use of the `==` operator. We provide this
as a special case to avoid providing `==` which is too easy to misuse.
*/
export class IsNil extends jnke.KeywordExpr_1 {
  unaryPrefix() {return `null ==`}
  unarySuffix() {return ``}
  static {this.setReprModuleUrl(import.meta.url)}
}

/*
This is the only half-decent use of the `!=` operator. We provide this
as a special case to avoid providing `!=` which is too easy to misuse.
*/
export class IsSome extends jnke.KeywordExpr_1 {
  unaryPrefix() {return `null !=`}
  unarySuffix() {return ``}
  static {this.setReprModuleUrl(import.meta.url)}
}

import * as a from '/Users/m/code/m/js/all.mjs'
import * as jnkem from './jisp_node_keyword_expr_macro.mjs'

/*
This file should contain macros that implement simple JS expressions that use
operators or keywords. In other words, it should contain subclasses of
`KeywordExprMacro`.

Macros that can't be easily expressed in terms of `KeywordExprMacro` should be
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

export class Assign extends jnkem.KeywordExprMacro_2 {
  binaryInfix() {return `=`}
}

export class Equal extends jnkem.KeywordExprMacro_2 {
  binaryInfix() {return `===`}
}

export class NotEqual extends jnkem.KeywordExprMacro_2 {
  binaryInfix() {return `!==`}
}

export class Greater extends jnkem.KeywordExprMacro_2 {
  binaryInfix() {return `>`}
}

export class GreaterOrEqual extends jnkem.KeywordExprMacro_2 {
  binaryInfix() {return `>=`}
}

export class Lesser extends jnkem.KeywordExprMacro_2 {
  binaryInfix() {return `<`}
}

export class LesserOrEqual extends jnkem.KeywordExprMacro_2 {
  binaryInfix() {return `<=`}
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
export class Add extends jnkem.KeywordExprMacro_1_N {
  unaryPrefix() {return `+`}
  unarySuffix() {return ``}
  binaryInfix() {return `+`}
}

// See `Add` for some comments and explanations.
export class Subtract extends jnkem.KeywordExprMacro_1_N {
  unaryPrefix() {return `-`}
  unarySuffix() {return ``}
  binaryInfix() {return `-`}
}

export class Multiply extends jnkem.KeywordExprMacro_1_N {
  unaryPrefix() {return `1 *`}
  unarySuffix() {return ``}
  binaryInfix() {return `*`}
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
export class Divide extends jnkem.KeywordExprMacro_2_N {
  binaryInfix() {return `/`}
}

export class Exponentiate extends jnkem.KeywordExprMacro_1_N {
  unaryPrefix() {return ``}
  unarySuffix() {return `** 1`}
  binaryInfix() {return `**`}
}

export class Remainder extends jnkem.KeywordExprMacro_2_N {
  binaryInfix() {return `%`}
}

export class Not extends jnkem.KeywordExprMacro_0_1 {
  compileNullary() {return `false`}
  unaryPrefix() {return `!`}
  unarySuffix() {return ``}
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
export class NotNot extends jnkem.KeywordExprMacro_0_1 {
  compileNullary() {return `true`}
  unaryPrefix() {return `!!`}
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

export class BitShiftLeft extends jnkem.KeywordExprMacro_2_N {
  binaryInfix() {return `<<`}
}

export class BitShiftRight extends jnkem.KeywordExprMacro_2_N {
  binaryInfix() {return `>>`}
}

export class BitShiftRightUnsigned extends jnkem.KeywordExprMacro_2_N {
  binaryInfix() {return `>>>`}
}

/*
The fallback on `true` is very questionable.
The JS operator `&&` supports arbitrary types.
We may consider changing the fallback to `undefined`.
*/
export class And extends jnkem.KeywordExprMacro {
  compileNullary() {return `true`}
  unaryPrefix() {return ``}
  unarySuffix() {return ``}
  binaryInfix() {return `&&`}
}

/*
The fallback on `false` is very questionable.
The JS operator `||` supports arbitrary types.
We may consider changing the fallback to `undefined`.
*/
export class Or extends jnkem.KeywordExprMacro {
  compileNullary() {return `false`}
  unaryPrefix() {return ``}
  unarySuffix() {return ``}
  binaryInfix() {return `||`}
}

export class Coalesce extends jnkem.KeywordExprMacro {
  compileNullary() {return `undefined`}
  unaryPrefix() {return ``}
  unarySuffix() {return ``}
  binaryInfix() {return `??`}
}

export class In extends jnkem.KeywordExprMacro_2 {
  binaryInfix() {return `in`}
}

export class Typeof extends jnkem.KeywordExprMacro_1 {
  unaryPrefix() {return `typeof`}
  unarySuffix() {return ``}
}

export class Instanceof extends jnkem.KeywordExprMacro_2 {
  binaryInfix() {return `instanceof`}
}

// TODO: support bare and 0-N variadic.
export class Void extends jnkem.KeywordExprMacro_0_1 {
  compileNullary() {return `undefined`}
  unaryPrefix() {return `void`}
  unarySuffix() {return ``}
}

export class Await extends jnkem.KeywordExprMacro_0_1 {
  compileNullary() {return `undefined`}
  unaryPrefix() {return `await`}
  unarySuffix() {return ``}
}

/*
This is the only half-decent use of the `==` operator. We provide this
as a special case to avoid providing `==` which is too easy to misuse.
*/
export class IsNil extends jnkem.KeywordExprMacro_1 {
  unaryPrefix() {return `null ==`}
  unarySuffix() {return ``}
}

/*
This is the only half-decent use of the `!=` operator. We provide this
as a special case to avoid providing `!=` which is too easy to misuse.
*/
export class IsSome extends jnkem.KeywordExprMacro_1 {
  unaryPrefix() {return `null !=`}
  unarySuffix() {return ``}
}

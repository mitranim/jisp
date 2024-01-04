/*
This file should export only "operator"-style names. Other common macros
that ship with the language should be exported by `prelude.mjs`, using
regular names.

This file is separate from `prelude.mjs` to allow different import styles for
`prelude.mjs` and `ops.mjs`. The "prelude" module exports regular names, which
can be used unqualified or qualified. The "ops" module exports operator-style
names, for which the qualified form is not particularly convenient. In fact,
it's not even supported by our tokenizer at the time of writing. The "ops"
module should be used with a mixin-style import (star-import), while the
"prelude" module can be used either with a mixin-style import or with a
"named" import.
*/

/*
TODO choose better character. The colon character is more suited for the object
literal macro.
*/
export {Arr as ':'} from './jisp_node_arr.mjs'

export {
  Assign                as '=',
  Equal                 as '===',
  NotEqual              as '!==',
  Greater               as '>',
  GreaterOrEqual        as '>=',
  Lesser                as '<',
  LesserOrEqual         as '<=',
  Add                   as '+',
  Subtract              as '-',
  Divide                as '/',
  Multiply              as '*',
  Exponentiate          as '**',
  Remainder             as '%',
  Not                   as '!',
  NotNot                as '!!',
  BitNot                as '~',
  BitAnd                as '&',
  BitOr                 as '|',
  BitXor                as '^',
  BitShiftLeft          as '<<',
  BitShiftRight         as '>>',
  BitShiftRightUnsigned as '>>>',
  And                   as '&&',
  Or                    as '||',
  Coalesce              as '??',
} from './jisp_keyword_exprs.mjs'

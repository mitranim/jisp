/*
This file should export only "operator"-style names. For other common macros
that ship with the language, see `prelude.mjs`.

This file is separate from `prelude.mjs` because for operators, it's much more
convenient to use a mixin-style import (star-import), while for regular names,
namespacing is more viable. This way, user code can choose to use a mixin-style
import only for operators.
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
  BoolNot               as '!',
  BoolNotNot            as '!!',
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
} from './jisp_nodes_keyword_expr.mjs'

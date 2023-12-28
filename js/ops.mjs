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
  Plus   as '+',
  Minus  as '-',
  Slash  as '/',
  Aster  as '*',
  Bang   as '!',
  BitNot as '~',
  BitXor as '^',
} from './jisp_nodes_keyword_expr.mjs'

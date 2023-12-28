/*
This file should export only "operator"-style names. For other common macros
that ship with the language, see `prelude.mjs`.

This file is separate from `prelude.mjs` because for operators, it's much more
convenient to use a mixin-style import (star-import), while for regular names,
namespacing is more viable. This way, user code can choose to use a mixin-style
import only for operators.
*/

export {Plus   as '+'} from './jisp_node_plus.mjs'
export {Minus  as '-'} from './jisp_node_minus.mjs'
export {Slash  as '/'} from './jisp_node_slash.mjs'
export {Aster  as '*'} from './jisp_node_aster.mjs'
export {Bang   as '!'} from './jisp_node_bang.mjs'
export {Arr    as ':'} from './jisp_node_arr.mjs'
export {BitNot as '~'} from './jisp_node_bit_not.mjs'
export {BitXor as '^'} from './jisp_node_bit_xor.mjs'

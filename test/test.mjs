import * as ti from './test_init.mjs'

import './jisp_misc_test.mjs'
import './jisp_parent_test.mjs'
import './jisp_deno_fs_test.mjs'
import './jisp_tokenizer_test.mjs'
import './jisp_lexer_test.mjs'
import './jisp_node_test.mjs'
import './jisp_node_fn_test.mjs'
import './jisp_node_module_test.mjs'
import './jisp_root_test.mjs'

if (import.meta.main) ti.flush()

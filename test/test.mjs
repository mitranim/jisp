import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'

// TODO move to `./test_init.mjs`.
tu.clearTar()

await import(`./jisp_misc_test.mjs`)
await import(`./jisp_parent_test.mjs`)
await import(`./jisp_deno_fs_test.mjs`)
await import(`./jisp_tokenizer_test.mjs`)
await import(`./jisp_lexer_test.mjs`)
await import(`./jisp_node_test.mjs`)
await import(`./jisp_node_module_node_list_test.mjs`)
await import(`./jisp_root_test.mjs`)
await import(`./jisp_node_block_test.mjs`)
await import(`./jisp_node_func_test.mjs`)
await import(`./jisp_node_import_test.mjs`)
await import(`./jisp_node_if_test.mjs`)
await import(`./jisp_node_const_test.mjs`)
await import(`./jisp_node_let_test.mjs`)
await import(`./jisp_node_new_test.mjs`)
await import(`./jisp_node_add_test.mjs`)
await import(`./jisp_node_subtract_test.mjs`)
await import(`./jisp_node_divide_test.mjs`)
await import(`./jisp_node_multiply_test.mjs`)
await import(`./jisp_node_bool_not_test.mjs`)
await import(`./jisp_node_and_test.mjs`)
await import(`./jisp_node_or_test.mjs`)
await import(`./jisp_node_arr_test.mjs`)
await import(`./jisp_keyword_exprs_test.mjs`)
await import(`./jisp_node_class_test.mjs`)

if (import.meta.main) ti.flush()

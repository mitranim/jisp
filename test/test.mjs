import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'

// TODO move to `./test_init.mjs`.
tu.clearTar()

await import(`./misc_test.mjs`)
await import(`./parent_test.mjs`)
await import(`./deno_fs_test.mjs`)
await import(`./tokenizer_test.mjs`)
await import(`./lexer_test.mjs`)
await import(`./node_test.mjs`)
await import(`./node_module_node_list_test.mjs`)
await import(`./root_test.mjs`)
await import(`./compilation_test.mjs`)
await import(`./node_comment_test.mjs`)
await import(`./node_num_test.mjs`)
await import(`./node_val_test.mjs`)
await import(`./node_ident_unqual_test.mjs`)
await import(`./node_ident_access_test.mjs`)
await import(`./predecl_test.mjs`)
await import(`./node_block_test.mjs`)
await import(`./node_func_test.mjs`)
await import(`./node_import_test.mjs`)
await import(`./node_if_test.mjs`)
await import(`./node_const_test.mjs`)
await import(`./node_let_test.mjs`)
await import(`./node_new_test.mjs`)
await import(`./node_list_test.mjs`)
await import(`./node_dict_test.mjs`)
await import(`./keyword_exprs_test.mjs`)
await import(`./node_class_test.mjs`)
await import(`./node_export_test.mjs`)
await import(`./node_quoting_test.mjs`)

if (import.meta.main) ti.flush()

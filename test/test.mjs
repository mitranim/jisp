import * as ti from './test_init.mjs'

await import(`./test_deno.mjs`)
await import(`./test_node.mjs`)
await import(`./test_misc.mjs`)
await import(`./test_span.mjs`)
await import(`./test_delim_reader.mjs`)
await import(`./test_indent_reader.mjs`)
await import(`./test_macro.mjs`)
await import(`./test_compile.mjs`)
await import(`./test_module.mjs`)
await import(`./test_module_caching.mjs`)
await import(`./test_import.mjs`)
await import(`./test_prelude.mjs`)
await import(`./test_bench.mjs`)

if (import.meta.main) ti.flush()

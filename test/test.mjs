import * as ti from './test_init.mjs'

await import(`./test_deno.mjs`)
await import(`./test_node.mjs`)
await import(`./test_misc.mjs`)
await import(`./test_read.mjs`)
await import(`./test_macro.mjs`)
await import(`./test_compile.mjs`)
await import(`./test_module.mjs`)
await import(`./test_module_caching.mjs`)
await import(`./test_import.mjs`)
await import(`./test_prelude.mjs`)
await import(`./test_bench.mjs`)

if (import.meta.main) ti.flush()

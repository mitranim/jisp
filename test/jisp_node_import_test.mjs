import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_Import_as_statement() {
  await jrt.testModuleCompile(`
[use "jisp:prelude" "*"]
[import "./some_other_module"]
[import "./some_other_module" mod]
`,
`
import "./some_other_module";
import * as mod from "./some_other_module";
`)
})

// FIXME unfuck: requires nested async macroing.
await t.test(async function test_Import_as_expression() {
  return

  await jrt.testModuleCompile(`
[use "jisp:prelude" "*"]
[const someVal [import "./some_other_module"]]
`,
`
const someVal = import("./some_other_module");
`)
})

if (import.meta.main) ti.flush()

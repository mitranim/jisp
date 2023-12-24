import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_Import_as_statement() {
  await jrt.testModuleCompile(`
[use "jisp:prelude.mjs" "*"]

[import "./some_other_module"]

[import "./some_other_module" mod0]

[import "https://example.com/some_file"]

[import "https://example.com/some_file" mod1]
`,
`
import "./some_other_module";
import * as mod0 from "./some_other_module";
import "https://example.com/some_file";
import * as mod1 from "https://example.com/some_file";
`)
})

await t.test(async function test_Import_as_expression() {
  await jrt.testModuleCompile(`
[use "jisp:prelude.mjs" "*"]

[const someVal [import "./some_other_module"]]
`,
`
const someVal = import("./some_other_module");
`)
})

/*
FIXME test: clear target folder, have two modules where one imports another,
ensure that both are compiled, test different types of import promises
available from modules.
*/

if (import.meta.main) ti.flush()

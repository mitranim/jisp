import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_Or() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[or]
[or 10]
[or 10 20]
[or 10 20 30]
`,
`
false;
10;
10 || 20;
10 || 20 || 30;
`)
})

if (import.meta.main) ti.flush()

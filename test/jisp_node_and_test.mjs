import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_And() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[and]
[and 10]
[and 10 20]
[and 10 20 30]
`,
`
true;
10;
10 && 20;
10 && 20 && 30;
`)
})

if (import.meta.main) ti.flush()

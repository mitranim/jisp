import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as jrt from './root_test.mjs'

await t.test(async function test_List_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[list [const someName 10]]
`,
    `[object Const] can only be used as a statement`,
  )
})

await t.test(async function test_List_valid() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[list]
[list [list]]
[list [list [list]]]
[list 10]
[list 10 20]
[list 10 20 30]
[list [list 10]]
[list 10 [list 20]]
[list 10 [list 20 [list 30]]]
`,
`
[];
[[]];
[[[]]];
[10];
[10, 20];
[10, 20, 30];
[[10]];
[10, [20]];
[10, [20, [30]]];
`)
})

if (import.meta.main) ti.flush()

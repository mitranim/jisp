import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'
import * as je from '../js/jisp_err.mjs'

await t.test(async function test_Const() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]
[const]
`,
    `[object Const] expected exactly 3 children, got 1`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]
[const one]
`,
    `[object Const] expected exactly 3 children, got 2`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]
[const one two three]
`,
    `[object Const] expected exactly 3 children, got 4`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]
[const 10 20]
`,
    `[object Const] expected the child node at index 1 to be an instance of [function IdentUnqual], found [object Num]`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]
[const one 10]
`,
`
const one = 10;
`,
  )
})

if (import.meta.main) ti.flush()

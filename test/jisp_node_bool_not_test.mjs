import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_BoolNot() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:ops.mjs" *]

[! 10 20]
`,
    `[object BoolNot] expected between 1 and 2 children, got 3 children`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:ops.mjs" *]

[!]
[! 10]
[! [!]]
[! [! 10]]
[! [! [! 10]]]
`,
`
false;
! 10;
! (false);
! (! 10);
! (! (! 10));
`,
  )
})

if (import.meta.main) ti.flush()

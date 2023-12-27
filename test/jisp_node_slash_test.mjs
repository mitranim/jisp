import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_Slash() {
  await jrt.testModuleFail(
      jrt.makeModule(),
`
[use "jisp:ops.mjs" "*"]

[/]
`,
    `[object Slash] expects at least 3 children, got 1 children`,
  )

  await jrt.testModuleFail(
      jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]
[use "jisp:ops.mjs" "*"]

[const someConst [/]]
`,
    `[object Slash] expects at least 3 children, got 1 children`,
  )

  await jrt.testModuleFail(
      jrt.makeModule(),
`
[use "jisp:ops.mjs" "*"]

[/ 10]
`,
    `[object Slash] expects at least 3 children, got 2 children`,
  )

  await jrt.testModuleCompile(
      jrt.makeModule(),
`
[use "jisp:ops.mjs" "*"]

[/ 10 20]
[/ 10 20 30]

[/ [/ 10 20] [/ 30 40]]
[/ [/ 10 20 30] [/ 40 50 60]]

[/ 10 [/ 20 30]]
[/ 10 20 [/ 30 40]]
`,
`
10 / 20;
10 / 20 / 30;
(10 / 20) / (30 / 40);
(10 / 20 / 30) / (40 / 50 / 60);
10 / (20 / 30);
10 / 20 / (30 / 40);
`,
  )
})

if (import.meta.main) ti.flush()

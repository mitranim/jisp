import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_Fn() {
  await t.test(async function test_with_ret_predeclared() {
    await jrt.testModuleCompile(
      `
[use "jisp:prelude" "*"]

[fn someFunc []
  [ret 10]
]
      `,
      `
function someFunc() {
return 10;
};
      `,
    )
  })

  await t.test(async function test_with_ret_shadowed() {
    await jrt.testModuleCompile(
`
[use "jisp:prelude" "*"]

[fn someFunc []
  [const ret 10]
  [ret 20]
]
`,
`
function someFunc() {
const ret = 10;
ret(20);
};
`)
  })
})

if (import.meta.main) ti.flush()

import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'
import * as je from '../js/jisp_err.mjs'

await t.test(async function test_Let() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[let]
`,
    `[object Let] expected between 2 and 3 children, got 1`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[let one two three]
`,
    `[object Let] expected between 2 and 3 children, got 4`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[let 10 someName]
`,
    `[object Let] expected the child node at index 1 to be an instance of [function IdentUnqual], found [object Num]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[let 10 20]
`,
    `[object Let] expected the child node at index 1 to be an instance of [function IdentUnqual], found [object Num]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[let one]
[let one]
`,
    `redundant declaration of "one" in namespace [object NsLex]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[let one 10]
[let one 20]
`,
    `redundant declaration of "one" in namespace [object NsLex]`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[let one]
[let two 10]

[do
  [let one]
  [let two 20]
]
`,
`
export let one;
export let two = 10;
{
let one;
let two = 20;
};
`,
  )
})

if (import.meta.main) ti.flush()

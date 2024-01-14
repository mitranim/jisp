import {a} from '../js/dep.mjs'
import {t} from './test_dep.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './root_test.mjs'
import * as je from '../js/err.mjs'

await t.test(async function test_Const() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[const]
`,
    `[object Const] expected exactly 2 children, got 0`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[const one]
`,
    `[object Const] expected exactly 2 children, got 1`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[const one two three]
`,
    `[object Const] expected exactly 2 children, got 3`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[const 10 20]
`,
    `[object Const] expected the child node at index 0 to be an instance of [function IdentUnqual], found [object Num]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[const one 10]
[const one 20]
`,
    `redundant declaration of "one" in namespace [object NsLex]`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[const one 10]

[do
  [const one 20]
  [const two 30]
]
`,
`
export const one = 10;
{
const one = 20;
const two = 30;
};
`)
})

if (import.meta.main) ti.flush()

import {a} from '../js/dep.mjs'
import {t} from './test_dep.mjs'
import * as ti from './test_init.mjs'
import * as jrt from './root_test.mjs'

// FIXME drop

await t.test(async function test_Not() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[! 10 20]
`,
    `[object Not] expected between 0 and 1 children, got 2 children`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

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
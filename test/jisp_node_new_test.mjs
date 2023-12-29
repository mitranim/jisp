import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_New() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[new]
`,
    `[object New] expected at least 2 children, got 1`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[new SomeName]
`,
    `unable to find declaration of "SomeName" at [object IdentUnqual]`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[new nil]
[new 10]
[new 10 20]
[new 10 20 30]

[fn SomeName []]

[new SomeName]
[new SomeName 10 ]
[new SomeName 10 20 ]
[new SomeName 10 20 30]

[new SomeName.OtherName]
[new SomeName.OtherName 10 ]
[new SomeName.OtherName 10 20 ]
[new SomeName.OtherName 10 20 30]
`,
`
new undefined();
new 10();
new 10(20);
new 10(20, 30);
function SomeName () {};
new SomeName();
new SomeName(10);
new SomeName(10, 20);
new SomeName(10, 20, 30);
new SomeName.OtherName();
new SomeName.OtherName(10);
new SomeName.OtherName(10, 20);
new SomeName.OtherName(10, 20, 30);
`,
  )
})

if (import.meta.main) ti.flush()

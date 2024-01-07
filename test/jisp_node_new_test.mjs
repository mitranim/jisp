import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_New() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[new]
`,
    `[object New] expected at least 2 children, got 1`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[new SomeName]
`,
    `unable to find declaration of "SomeName" at [object IdentUnqual]`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[new 10]
[new 10 20]
[new 10 20 30]

[func SomeName []]

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
new 10();
new 10(20);
new 10(20, 30);
export function SomeName () {};
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

/*
Imperfect behavior. In Jisp, this requires a function call, whereas in JS, it
doesn't. Ideally, this would not require a function call in Jisp. Solving this
may require restoring support for "bare" macro calls, which has been removed.
*/
await t.test(async function test_New_target() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[new.target]
[const someConst [new.target]]
`,
`
new.target;
export const someConst = new.target;
`)
})

await t.test(async function test_New_unknown_field() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

new.unknownField
`,
    `missing property "unknownField" in live value [function New]`,
  )
})

if (import.meta.main) ti.flush()

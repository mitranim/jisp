import {a} from '../js/dep.mjs'
import {t} from './test_dep.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './root_test.mjs'

await t.test(async function test_New() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[new]
`,
    `[object New] expected at least 1 children, got 0 children`,
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

await t.test(async function test_New_target() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

new.target
[new.target]
[const someConst0 new.target]
[const someConst1 [new.target]]
`,
`
new.target;
new.target();
export const someConst0 = new.target;
export const someConst1 = new.target();
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

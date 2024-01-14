import {a} from '../js/dep.mjs'
import {t} from './test_dep.mjs'
import * as ti from './test_init.mjs'
import * as jrt from './root_test.mjs'

await t.test(async function test_Dict_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[dict "10"]
`,
    `[object Dict] requires an even number of children, got 1 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[dict "10" "20" "30"]
`,
    `[object Dict] requires an even number of children, got 3 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[dict [const someConst "10"] "20"]
`,
    `[object Const] can only be used as a statement`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[dict "10" [const someConst "20"]]
`,
    `[object Const] can only be used as a statement`,
  )
})

await t.test(async function test_Dict_valid() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[dict]
[dict 10 20]
[dict 10 20 30 40]
[dict "10" "20"]
[dict "10" "20" "30" "40"]
[dict \`10\` \`20\`]
[dict \`10\` \`20\` \`30\` \`40\`]
[dict "someMethod" [func someName [] "some_value"]]
[dict 10 20 "someMethod" [func someName [] "some_value"] 30 40]
`,
`
{};
{[10]: 20};
{[10]: 20, [30]: 40};
{10: "20"};
{10: "20", 30: "40"};
{10: \`20\`};
{10: \`20\`, 30: \`40\`};
{someMethod: function someName () {
return "some_value";
}};
{[10]: 20, someMethod: function someName () {
return "some_value";
}, [30]: 40};
`)
})

if (import.meta.main) ti.flush()

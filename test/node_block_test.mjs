import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './root_test.mjs'

await t.test(async function test_Block_statement() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[do]

[do 10]

[do 10 20]

[do 10 20 30]

[do
  [const someConst0 10]
  [const someConst1 20]
]
`,
`
{};
{
10;
};
{
10;
20;
};
{
10;
20;
30;
};
{
const someConst0 = 10;
const someConst1 = 20;
};
`,
  )
})

await t.test(async function test_Block_expression() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[const someConst0 [do]]

[const someConst1 [do 10]]

[const someConst2 [do 10 20]]

[const someConst3 [do 10 20 30]]
`,
`
export const someConst0 = undefined;
export const someConst1 = 10;
export const someConst2 = (10, 20);
export const someConst3 = (10, 20, 30);
`,
  )
})

/*
This test describes a limitation that we would like to lift. See comments in
`Block`.
*/
await t.test(async function test_Block_expression_with_statements() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[const someConst [do
  [let someLet 10]
]]
`,
    `[object Let] can only be used as a statement`,
  )
})

if (import.meta.main) ti.flush()

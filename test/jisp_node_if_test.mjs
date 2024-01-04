import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_If_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]
[if]
`,
    `[object If] expected between 2 and 4 children, got 1`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]
[const someConst [if]]
`,
    `[object If] expected between 2 and 4 children, got 1`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]
[if 10 20 30 40]
`,
    `[object If] expected between 2 and 4 children, got 5`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]
[const someConst [if 10 20 30 40]]
`,
    `[object If] expected between 2 and 4 children, got 5`,
  )
})

await t.test(async function test_If_as_statement() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[if 10]
[if 10 20]
[if 10 20 30]
`,
`
if (10);
if (10) 20;
if (10) 20;
else 30;
`)
})

await t.test(async function test_If_as_expression() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[const someConst1 [if 10]]
[const someConst2 [if 10 20]]
[const someConst3 [if 10 20 30]]
`,
`
const someConst1 = (10 ? undefined : undefined);
const someConst2 = (10 ? 20 : undefined);
const someConst3 = (10 ? 20 : 30);
`)
})

await t.test(async function test_If_implicit_return() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc0 [] [if 10]]
[func someFunc1 [] [if 10 20]]
[func someFunc2 [] [if 10 20 30]]
[func someFunc3 [] 10 [if 20]]
[func someFunc4 [] 10 [if 20 30]]
[func someFunc5 [] 10 [if 20 30 40]]
`,
`
function someFunc0 () {
if (10) return;
return;
};
function someFunc1 () {
if (10) return 20;
return;
};
function someFunc2 () {
if (10) return 20;
return 30;
};
function someFunc3 () {
10;
if (20) return;
return;
};
function someFunc4 () {
10;
if (20) return 30;
return;
};
function someFunc5 () {
10;
if (20) return 30;
return 40;
};
`)
})

if (import.meta.main) ti.flush()

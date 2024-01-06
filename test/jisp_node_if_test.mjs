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
export const someConst1 = (10 ? undefined : undefined);
export const someConst2 = (10 ? 20 : undefined);
export const someConst3 = (10 ? 20 : 30);
`)
})

/*
Design note.

Currently, implicit return requires the last element in a function body to be an
expression. We could support statements in this position, by adding an internal
interface that allows a given node to compile in "return mode", using the JS
`return` statement inside. In the `If` macro, when compiling in this mode, each
branch would have to use `return`. This makes it possible to get return values
out of certain macros which normally must be statements.

In fact, we did implement that feature, and then ripped it out. It complicates
the internals, and more importantly, it comes with edge cases and gotchas.
Implementing this mode correctly requires more than just adding a method. It
requires modifying the statement / expression mode of the last child in each
branch in the `If` statement, the last child in the `Block` statement, and so
on. The motivation for that feature is also shaky. Every use case that seems to
require this feature is better solved with early return macros, which do not
require any of this complexity.
*/
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
export function someFunc0 () {
return (10 ? undefined : undefined);
};
export function someFunc1 () {
return (10 ? 20 : undefined);
};
export function someFunc2 () {
return (10 ? 20 : 30);
};
export function someFunc3 () {
10;
return (20 ? undefined : undefined);
};
export function someFunc4 () {
10;
return (20 ? 30 : undefined);
};
export function someFunc5 () {
10;
return (20 ? 30 : 40);
};
`)
})

if (import.meta.main) ti.flush()

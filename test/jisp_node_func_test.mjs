import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_Func_arguments() {
  /*
  We don't automatically declare `arguments` in function scope.
  For the explanation why, see the comment on `jsReservedNames`.
  */
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [] arguments]
`,
    `unable to find declaration of "arguments" at [object IdentUnqual]`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]
[declare "jisp:global.mjs"]

[func someFunc [] arguments]
`,
`
function someFunc () {
arguments;
};
`,
  )
})

await t.test(async function test_Func_arguments_redeclaration() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc []
  [const arguments 10]
]
`,
    `"arguments" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`,
  )
})

await t.test(async function test_Func_this() {
  /*
  We don't automatically declare `this` in function scope.
  For the explanation why, see the comment on `jsReservedNames`.
  */
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [] this]
`,
    `unable to find declaration of "this" at [object IdentUnqual]`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]
[declare "jisp:global.mjs"]

[func someFunc [] this]
`,
`
function someFunc () {
this;
};
`,
  )
})

await t.test(async function test_Func_this_redeclaration() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc []
  [const this 10]
]
`,
    `"this" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`,
  )
})

/*
Declaring `ret` in prelude may seem dirty. It would seem more natural to declare
it in function scope. However, we should avoid implicitly adding names to scopes
because of possible collisions. See the comment on `jsReservedNames` for
explanations.
*/
await t.test(async function test_Func_ret() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[ret]
[ret 10]
[func someFunc0 [] [ret]]
[func someFunc1 [] [ret 10]]
`,
`
return;
return 10;
function someFunc0 () {
return;
};
function someFunc1 () {
return 10;
};
`,
  )
})

await t.test(async function test_Func_ret_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [] [ret 10 20]]
`,
    `[object Ret] expected between 1 and 2 children, got 3 children`,
  )
})

/*
We allow redeclaration of `ret` because it's just a regular name in JS. This
differs from our handling of `arguments` where we prevent redeclaration because
it would generate invalid JS.
*/
await t.test(async function test_Func_redeclare_ret() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc []
  [const ret 10]
  [ret 20]
]
`,
`
function someFunc () {
const ret = 10;
ret(20);
};
`)
})

await t.test(async function test_Func_with_parameters() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one]]
`,
`
function someFunc (one) {};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one] one]
`,
`
function someFunc (one) {
one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one] one one]
`,
`
function someFunc (one) {
one;
one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one] [ret one]]
`,
`
function someFunc (one) {
return one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one] [ret one] one]
`,
`
function someFunc (one) {
return one;
one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one] one [ret one]]
`,
`
function someFunc (one) {
one;
return one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one two]]
`,
`
function someFunc (one, two) {};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one two] one]
`,
`
function someFunc (one, two) {
one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one two] two]
`,
`
function someFunc (one, two) {
two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one two] one two]
`,
`
function someFunc (one, two) {
one;
two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one two] one one two]
`,
`
function someFunc (one, two) {
one;
one;
two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one two] one one two two]
`,
`
function someFunc (one, two) {
one;
one;
two;
two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one two] [ret one] one two two]
`,
`
function someFunc (one, two) {
return one;
one;
two;
two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one two] one [ret one] two two]
`,
`
function someFunc (one, two) {
one;
return one;
two;
two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one two] one one [ret two] two]
`,
`
function someFunc (one, two) {
one;
one;
return two;
two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func someFunc [one two] one one two [ret two]]
`,
`
function someFunc (one, two) {
one;
one;
two;
return two;
};
`)
})

await t.test(async function test_Func_name_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func await []]
`,
    `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func eval []]
`,
    `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`,
  )
})

await t.test(async function test_Func_async() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[func.async someFunc []
  [await 10]
  [ret 20]
  [ret [await 30]]
]
`,
`
async function someFunc () {
await 10;
return 20;
return (await 30);
};
`,
  )
})

if (import.meta.main) ti.flush()

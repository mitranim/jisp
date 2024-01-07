import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_Func_implicit_return() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc0 []]
[func someFunc1 [] 10]
[func someFunc2 [] 10 20]
[func someFunc3 [] 10 20 30]
`,
`
export function someFunc0 () {};
export function someFunc1 () {
return 10;
};
export function someFunc2 () {
10;
return 20;
};
export function someFunc3 () {
10;
20;
return 30;
};
`,
  )
})

await t.test(async function test_Func_arguments() {
  /*
  We don't automatically declare `arguments` in function scope.
  For the explanation why, see the comment on `jsReservedNames`.
  */
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [] arguments]
`,
    `unable to find declaration of "arguments" at [object IdentUnqual]`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[declare "jisp:global.mjs"]

[func someFunc [] arguments]
`,
`
export function someFunc () {
return arguments;
};
`,
  )
})

await t.test(async function test_Func_arguments_redeclaration() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

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
[use "jisp:prelude.mjs" *]

[func someFunc [] this]
`,
    `unable to find declaration of "this" at [object IdentUnqual]`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[declare "jisp:global.mjs"]

[func someFunc [] this]
`,
`
export function someFunc () {
return this;
};
`,
  )
})

await t.test(async function test_Func_this_redeclaration() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

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
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[.ret 10]
`,
    `unable to find ancestral live value with property "ret" at descendant [object IdentAccess]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [] [.ret 10 20]]
`,
    `[object Ret] expected between 1 and 2 children, got 3 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [] [.ret]]
`,
    `[object Ret] can only be used as a statement`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [] [.ret 10]]
`,
    `[object Ret] can only be used as a statement`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc []
  [const someConst [.ret 10]]
  20
]
`,
    `[object Ret] can only be used as a statement`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc0 [] [.ret] 10]
[func someFunc1 [] 10 [.ret] 20]
[func someFunc2 [] [.ret 10] 20]
[func someFunc3 [] 10 [.ret 20] 30]
[func someFunc4 [] [.ret 10] [.ret 20] 30]
`,
`
export function someFunc0 () {
return;
return 10;
};
export function someFunc1 () {
10;
return;
return 20;
};
export function someFunc2 () {
return 10;
return 20;
};
export function someFunc3 () {
10;
return 20;
return 30;
};
export function someFunc4 () {
return 10;
return 20;
return 30;
};
`,
  )
})

/*
The contextual sub-macro `.ret` is accessed through an entirely different
mechanism than an unqualified identifier `ret`. There should be no collision.
This test verifies that.
*/
await t.test(async function test_Func_declare_ret() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc []
  [func ret []]
  [ret 20]
  [.ret [ret 30]]
  [ret 40]
]
`,
`
export function someFunc () {
function ret () {};
ret(20);
return ret(30);
return ret(40);
};
`)
})

await t.test(async function test_Func_valid() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc []]
`,
`
export function someFunc () {};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc []]
someFunc
[someFunc]
`,
`
export function someFunc () {};
someFunc;
someFunc();
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one]]
`,
`
export function someFunc (one) {};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one] one]
`,
`
export function someFunc (one) {
return one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one] one one]
`,
`
export function someFunc (one) {
one;
return one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one] [.ret one] one]
`,
`
export function someFunc (one) {
return one;
return one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one two]]
`,
`
export function someFunc (one, two) {};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one two] one]
`,
`
export function someFunc (one, two) {
return one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one two] two]
`,
`
export function someFunc (one, two) {
return two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one two] one two]
`,
`
export function someFunc (one, two) {
one;
return two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one two] one one two]
`,
`
export function someFunc (one, two) {
one;
one;
return two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one two] one one two two]
`,
`
export function someFunc (one, two) {
one;
one;
two;
return two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one two] [.ret one] one two two]
`,
`
export function someFunc (one, two) {
return one;
one;
two;
return two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one two] one [.ret one] two two]
`,
`
export function someFunc (one, two) {
one;
return one;
two;
return two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [one two] one one [.ret two] two]
`,
`
export function someFunc (one, two) {
one;
one;
return two;
return two;
};
`)
})

await t.test(async function test_Func_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func await []]
`,
    `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func eval []]
`,
    `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc []]
[func someFunc []]
`,
    `redundant declaration of "someFunc" in namespace [object NsLex]`,
  )
})

await t.test(async function test_Func_async() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func.async someFunc []
  [await 10]
  [.ret 20]
  [.ret [await 30]]
  [await 40]
]
`,
`
export async function someFunc () {
await 10;
return 20;
return (await 30);
return (await 40);
};
`,
  )
})

if (import.meta.main) ti.flush()

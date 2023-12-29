import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_Fn_arguments_not_predecladed_in_root_scope() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

arguments
`,
    `unable to find declaration of "arguments"`,
)
})

await t.test(async function test_Fn_arguments_predeclared() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc [] arguments]
`,
`
function someFunc () {
arguments;
};
`)
})

await t.test(async function test_Fn_arguments_redeclaration() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc []
  [const arguments 10]
]
`,
    `"arguments" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`,
)
})

await t.test(async function test_Fn_ret_not_predecladed_in_root_scope() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

ret
`,
    `unable to find declaration of "ret" at [object IdentUnqual]`,
  )
})

await t.test(async function test_Fn_ret_predecladed() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc0 [] [ret]]
[fn someFunc1 [] [ret 10]]
`,
`
function someFunc0 () {
return;
};
function someFunc1 () {
return 10;
};
`)
})

await t.test(async function test_Fn_ret_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc [] [ret 10 20]]
`,
    `[object Ret] expected between 1 and 2 children, got 3 children`,
  )
})

/*
We allow redeclaration of `ret` because it's just a regular name in JS. This
differs from our handling of `arguments` where we prevent redeclaration because
it would generate invalid JS.
*/
await t.test(async function test_Fn_redeclare_ret() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc []
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

await t.test(async function test_Fn_this_not_predecladed_in_root_scope() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

this
`,
    `unable to find declaration of "this"`,
)
})

await t.test(async function test_Fn_this_predeclared() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc [] this]
`,
`
function someFunc () {
this;
};
`)
})

await t.test(async function test_Fn_this_redeclaration() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc []
  [const this 10]
]
`,
    `"this" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`,
)
})

await t.test(async function test_Fn_with_parameters() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one]]
`,
`
function someFunc (one) {};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one] one]
`,
`
function someFunc (one) {
one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one] one one]
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
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one] [ret one]]
`,
`
function someFunc (one) {
return one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one] [ret one] one]
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
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one] one [ret one]]
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
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one two]]
`,
`
function someFunc (one, two) {};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one two] one]
`,
`
function someFunc (one, two) {
one;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one two] two]
`,
`
function someFunc (one, two) {
two;
};
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one two] one two]
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
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one two] one one two]
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
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one two] one one two two]
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
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one two] [ret one] one two two]
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
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one two] one [ret one] two two]
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
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one two] one one [ret two] two]
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
[use "jisp:prelude.mjs" "*"]

[fn someFunc [one two] one one two [ret two]]
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

await t.test(async function test_Fn_name_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn await []]
`,
    `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" "*"]

[fn eval []]
`,
    `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`,
  )
})

if (import.meta.main) ti.flush()

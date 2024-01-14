import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

await t.test(async function test_Assign_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[=]
`,
    `[object Assign] expected exactly 2 children, got 0 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[= someName]
`,
    `[object Assign] expected exactly 2 children, got 1 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[= someName "some_value" "other_value"]
`,
    `[object Assign] expected exactly 2 children, got 3 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[= someName "some_value"]
`,
    `unable to find declaration of "someName" at [object IdentUnqual]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[let someName]

[= someName otherName]
`,
    `unable to find declaration of "otherName" at [object IdentUnqual]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[= unqualName.qualName "some_value"]
`,
    `unable to find declaration of "unqualName" at [object IdentUnqual]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[= [const someName 10] 20]
`,
    `[object Const] can only be used as a statement`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[let someName]

[= someName [const otherName 10]]
`,
    `[object Const] can only be used as a statement`,
  )
})

/*
This test contains variable declarations because using missing names with
`Assign` would generate macro-time exceptions. See the corresponding test
for "invalid behavior" that verifies this.

Some of the generated code, such as `30 = 40` or `(one = 10) = (two = 20)`,
is syntactically invalid JS. That's because we allow arbitrary expressions
in both LHS and RHS. In the future, we may consider allowing only valid
assignable expressions in LHS. This requires more code.
*/
await t.test(async function test_Assign_valid() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[let one 10]
[let two 20]

[= 30 40]
[= 30 one]
[= one 30]
[= one two]
[= one.two 30]
[= 30 one.two]
[= one.two two.three]
[= [= one 10] [= two 20]]
`,
`
export let one = 10;
export let two = 20;
30 = 40;
30 = one;
one = 30;
one = two;
one.two = 30;
30 = one.two;
one.two = two.three;
(one = 10) = (two = 20);
`,
  )
})

await t.test(async function test_Not() {
  await testKeyword_0_1_invalid(`!`)
  await testKeyword_1_valid(`!`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[!]
[! [!]]
`,
`
false;
! (false);
`)
})

await t.test(async function test_NotNot() {
  await testKeyword_0_1_invalid(`!!`)
  await testKeyword_1_valid(`!!`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[!!]
[!! [!!]]
`,
`
true;
!! (true);
`)
})

await t.test(async function test_Void() {
  await testKeyword_0_1_invalid(`void`)
  await testKeyword_1_valid(`void`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[void]
[void [void]]
`,
`
undefined;
void (undefined);
`)
})

await t.test(async function test_Await() {
  await testKeyword_0_1_invalid(`await`)
  await testKeyword_1_valid(`await`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[await]
[await [await]]
`,
`
undefined;
await (undefined);
`)
})

await t.test(async function test_BitNot() {
  await testKeyword_1_invalid(`~`)
  await testKeyword_1_valid(`~`)
})

await t.test(async function test_Typeof() {
  await testKeyword_1_invalid(`typeof`)
  await testKeyword_1_valid(`typeof`)
})

await t.test(async function test_IsNil() {
  await testKeyword_1_invalid(`isNil`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[isNil 10]
[isNil [isNil 10]]
`,
`
null == 10;
null == (null == 10);
`)
})

await t.test(async function test_IsSome() {
  await testKeyword_1_invalid(`isSome`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[isSome 10]
[isSome [isSome 10]]
`,
`
null != 10;
null != (null != 10);
`)
})

await t.test(async function test_Equal() {
  await testKeyword_2_invalid(`===`)
  await testKeyword_2_valid(`===`)
})

await t.test(async function test_NotEqual() {
  await testKeyword_2_invalid(`!==`)
  await testKeyword_2_valid(`!==`)
})

await t.test(async function test_Greater() {
  await testKeyword_2_invalid(`>`)
  await testKeyword_2_valid(`>`)
})

await t.test(async function test_GreaterOrEqual() {
  await testKeyword_2_invalid(`>=`)
  await testKeyword_2_valid(`>=`)
})

await t.test(async function test_Lesser() {
  await testKeyword_2_invalid(`<`)
  await testKeyword_2_valid(`<`)
})

await t.test(async function test_LesserOrEqual() {
  await testKeyword_2_invalid(`<=`)
  await testKeyword_2_valid(`<=`)
})

await t.test(async function test_In() {
  await testKeyword_2_invalid(`in`)
  await testKeyword_2_valid(`in`)
})

await t.test(async function test_Instanceof() {
  await testKeyword_2_invalid(`instanceof`)
  await testKeyword_2_valid(`instanceof`)
})

await t.test(async function test_Divide() {
  await testKeyword_2_N_invalid(`/`)
  await testKeyword_2_N_valid(`/`)
})

await t.test(async function test_Remainder() {
  await testKeyword_2_N_invalid(`/`)
  await testKeyword_2_N_valid(`/`)
})

await t.test(async function test_BitAnd() {
  await testKeyword_2_N_invalid(`/`)
  await testKeyword_2_N_valid(`/`)
})

await t.test(async function test_BitOr() {
  await testKeyword_2_N_invalid(`|`)
  await testKeyword_2_N_valid(`|`)
})

await t.test(async function test_BitXor() {
  await testKeyword_2_N_invalid(`^`)
  await testKeyword_2_N_valid(`^`)
})

await t.test(async function test_BitShiftLeft() {
  await testKeyword_2_N_invalid(`<<`)
  await testKeyword_2_N_valid(`<<`)
})

await t.test(async function test_BitShiftRight() {
  await testKeyword_2_N_invalid(`>>`)
  await testKeyword_2_N_valid(`>>`)
})

await t.test(async function test_BitShiftRightUnsigned() {
  await testKeyword_2_N_invalid(`>>>`)
  await testKeyword_2_N_valid(`>>>`)
})

await t.test(async function test_Add() {
  await testKeyword_1_N_invalid(`+`)
  await testKeyword_2_N_valid(`+`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[+ 10]
[+ [+ 10]]
`,
`
+ 10;
+ (+ 10);
`)
})

await t.test(async function test_Subtract() {
  await testKeyword_1_N_invalid(`-`)
  await testKeyword_2_N_valid(`-`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[- 10]
[- [- 10]]
`,
`
- 10;
- (- 10);
`)
})

await t.test(async function test_Multiply() {
  await testKeyword_1_N_invalid(`*`)
  await testKeyword_2_N_valid(`*`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[* 10]
[* [* 10]]
`,
`
1 * 10;
1 * (1 * 10);
`)
})

await t.test(async function test_Exponentiate() {
  await testKeyword_1_N_invalid(`**`)
  await testKeyword_2_N_valid(`**`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[** 10]
[** [** 10]]
`,
`
10 ** 1;
(10 ** 1) ** 1;
`)
})

await t.test(async function test_And() {
  await testKeywordUnaryStatement(`&&`)
  await testKeyword_2_N_valid(`&&`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[&&]
[&& 10]
[&& [&&]]
[&& [&& 10]]
`,
`
true;
10;
(true);
(10);
`)
})

await t.test(async function test_Or() {
  await testKeywordUnaryStatement(`||`)
  await testKeyword_2_N_valid(`||`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[||]
[|| 10]
[|| [||]]
[|| [|| 10]]
`,
`
false;
10;
(false);
(10);
`)
})

await t.test(async function test_Coalesce() {
  await testKeywordUnaryStatement(`??`)
  await testKeyword_2_N_valid(`??`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:ops.mjs" *]

[??]
[?? 10]
[?? [??]]
[?? [?? 10]]
`,
`
undefined;
10;
(undefined);
(10);
`)
})

async function testKeyword_0_1_invalid(name) {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} 10 20]
`,
    `expected between 0 and 1 children, got 2 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} 10 20 30]
`,
    `expected between 0 and 1 children, got 3 children`,
  )

  await testKeywordUnaryStatement(name)
}

async function testKeyword_1_invalid(name) {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name}]
`,
    `expected exactly 1 children, got 0 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} 10 20]
`,
    `expected exactly 1 children, got 2 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} 10 20 30]
`,
    `expected exactly 1 children, got 3 children`,
  )

  testKeywordUnaryStatement(name)
}

async function testKeyword_1_valid(name) {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} 10]
[${name} [${name} 10]]
`,
`
${name} 10;
${name} (${name} 10);
`)
}

async function testKeywordUnaryStatement(name) {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} [const someName 10]]
`,
    `[object Const] can only be used as a statement`,
  )
}

async function testKeyword_2_invalid(name) {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name}]
`,
    `expected exactly 2 children, got 0 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} 10]
`,
    `expected exactly 2 children, got 1 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} 10 20 30]
`,
    `expected exactly 2 children, got 3 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} [const someName 10] 20]
`,
    `[object Const] can only be used as a statement`,
  )
}

async function testKeyword_2_valid(name) {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} 10 20]
[${name} [${name} 10 20] [${name} 30 40]]
`,
`
10 ${name} 20;
(10 ${name} 20) ${name} (30 ${name} 40);
`)
}

async function testKeyword_2_N_invalid(name) {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name}]
`,
    `expected at least 2 children, got 0 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} 10]
`,
    `expected at least 2 children, got 1 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} [const someName 10] 20]
`,
    `[object Const] can only be used as a statement`,
  )
}

async function testKeyword_2_N_valid(name) {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} 10 20]
[${name} 10 20 30]
[${name} 10 20 30 40]
[${name} [${name} 10 20] [${name} 30 40]]
[${name} [${name} 10 20 30] [${name} 40 50 60]]
[${name} [${name} 10 20 30] [${name} 40 50 60] [${name} 70 80 90]]
`,
`
10 ${name} 20;
10 ${name} 20 ${name} 30;
10 ${name} 20 ${name} 30 ${name} 40;
(10 ${name} 20) ${name} (30 ${name} 40);
(10 ${name} 20 ${name} 30) ${name} (40 ${name} 50 ${name} 60);
(10 ${name} 20 ${name} 30) ${name} (40 ${name} 50 ${name} 60) ${name} (70 ${name} 80 ${name} 90);
`)
}

async function testKeyword_1_N_invalid(name) {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name}]
`,
    `expected at least 1 children, got 0 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]
[use "jisp:ops.mjs" *]

[${name} [const someName 10] 20]
`,
    `[object Const] can only be used as a statement`,
  )
}

if (import.meta.main) ti.flush()

import {a} from '../js/dep.mjs'
import {t} from './test_dep.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './root_test.mjs'

await t.test(async function test_Class_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class]
`,
    `[object Class] expected at least 1 children, got 0 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class 10]
`,
    `[object Class] expected the child node at index 0 to be an instance of [function IdentUnqual], found [object Num]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass]
[class SomeClass]
`,
    `redundant declaration of "SomeClass" in namespace [object NsLex]`,
  )
})

await t.test(async function test_Class_extend_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass [.extend]]
`,
    `[object ClassExtend] expected at least 1 children, got 0 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass [.extend OtherClass]]
`,
    `unable to find declaration of "OtherClass" at [object IdentUnqual]`,
  )
})

await t.test(async function test_Class_extend_valid() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass0 [.extend 10]]
[class SomeClass1 [.extend 10 20]]
[class SomeClass2 [.extend 10 20 30]]
[class SomeClass3 [.extend SomeClass2 SomeClass1.someMethod]]
`,
`
export class SomeClass0 extends 10 {};
export class SomeClass1 extends 20(10) {};
export class SomeClass2 extends 30(20(10)) {};
export class SomeClass3 extends SomeClass1.someMethod(SomeClass2) {};
`)
})

await t.test(async function test_Class_func_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass [.func]]
`,
    `[object MethodFunc] expected at least 1 children, got 0 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass [.func 10 []]]
`,
    `[object MethodFunc] expected the child node at index 0 to be an instance of [function IdentUnqual], found [object Num]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass [.func someMethod 10]]
`,
    `[object MethodFunc] expected the child node at index 1 to be either nil or an instance of [function NodeList], found [object Num]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass [.func.unknown someMethod 10]]
`,
    `missing property "unknown" in live value [function MethodFunc]`,
  )
})

await t.test(async function test_Class_func_valid() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass0
  [.func someMethod []]
]

[class SomeClass1
  [.func someMethod []]
  [.func someMethod []]
]

[class SomeClass2
  [.extend SomeClass1]
  [.func someMethod []]
  [.func someMethod []]
]

[class SomeClass3
  [.func someMethod []]
  [.func.async someMethod []]
  [.static.func someMethod []]
  [.static.func.async someMethod []]
]
`,
`
export class SomeClass0 {
someMethod () {};
};
export class SomeClass1 {
someMethod () {};
someMethod () {};
};
export class SomeClass2 extends SomeClass1 {
someMethod () {};
someMethod () {};
};
export class SomeClass3 {
someMethod () {};
async someMethod () {};
static someMethod () {};
static async someMethod () {};
};
`)
})

await t.test(async function test_Class_let_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass [.let]]
`,
    `[object ClassLet] expected between 1 and 2 children, got 0 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass [.let 10]]
`,
    `[object ClassLet] expected the child node at index 0 to be an instance of [function IdentUnqual], found [object Num]`,
  )
})

await t.test(async function test_Class_let_valid() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass0
  [.let someField]
]

[class SomeClass1
  [.let someField 10]
  [.let someField 20]
  [.let someField0 30]
  [.let someField1 40]
]

[class SomeClass2
  [.extend SomeClass1]
  [.let someField 10]
  [.static.let someField 20]
]
`,
`
export class SomeClass0 {
someField;
};
export class SomeClass1 {
someField = 10;
someField = 20;
someField0 = 30;
someField1 = 40;
};
export class SomeClass2 extends SomeClass1 {
someField = 10;
static someField = 20;
};
`)
})

await t.test(async function test_Class_block_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass [.static [.static]]]
`,
    `[object ClassStatic] requires its immediate parent to be an instance of [function Class], got parent [object ClassStatic]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass [.static [do [.static]]]]
`,
    `[object ClassStatic] requires its immediate parent to be an instance of [function Class], got parent [object Block]`,
  )
})

await t.test(async function test_Class_block() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass
  [.static]
  [.static 10]
  [.static 10 20]
  [.static 10 20 30]
  [.static [do]]
  [.static [do 10]]
  [.static [do 10 20]]
  [.static [do 10 20 30]]
]
`,
`
export class SomeClass {
static {};
static {
10;
};
static {
10;
20;
};
static {
10;
20;
30;
};
static {
{};
};
static {
{
10;
};
};
static {
{
10;
20;
};
};
static {
{
10;
20;
30;
};
};
};
`)
})

await t.test(async function test_Class_export() {
    await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[class SomeClass [.static [class SomeClass]]]

[do [class SomeClass]]
`,
`
export class SomeClass {
static {
class SomeClass {};
};
};
{
class SomeClass {};
};
`)
})

if (import.meta.main) ti.flush()

import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jdft from './jisp_deno_fs_test.mjs'
import * as jrt from './jisp_root_test.mjs'
import * as jm from '../js/jisp_misc.mjs'
import * as jr from '../js/jisp_root.mjs'

await t.test(async function test_Import_statement_unnamed() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[import "some_import_path"]
[import "one://two/three.four"]
`,
`
import "some_import_path";
import "one://two/three.four";
`)
})

await t.test(async function test_Import_statement_named() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[import "some_import_path" mod0]
[import "one://two/three.four" mod1]
`,
`
import * as mod0 from "some_import_path";
import * as mod1 from "one://two/three.four";
`)
})

await t.test(async function test_Import_statement_mixin() {
  if (ti.WATCH) return

  await t.test(async function test_invalid() {
    const mod = jrt.makeModule().parse(`
[use "jisp:prelude.mjs" *]

[import "some_import_path" *]
`)

    /*
    This failure and corresponding error message verifies that our *-style
    import statement actually does try to import the target at macro time.
    */
    await t.throws(async () => mod.macro(), Error, `Relative import path "some_import_path" not prefixed`)
  })

  await jrt.testSingleFileCompilation(
    new URL(`test_import_star_empty.jisp`, tu.TEST_SRC_URL),
    new URL(`test_import_star_empty.mjs`,  tu.TEST_SRC_URL),
  )

  await jrt.testSingleFileCompilation(
    new URL(`test_import_star_using_one.jisp`, tu.TEST_SRC_URL),
    new URL(`test_import_star_using_one.mjs`,  tu.TEST_SRC_URL),
  )

  await jrt.testSingleFileCompilation(
    new URL(`test_import_star_using_two.jisp`, tu.TEST_SRC_URL),
    new URL(`test_import_star_using_two.mjs`,  tu.TEST_SRC_URL),
  )

  await jrt.testSingleFileCompilation(
    new URL(`test_import_star_using_two_repeatedly.jisp`, tu.TEST_SRC_URL),
    new URL(`test_import_star_using_two_repeatedly.mjs`,  tu.TEST_SRC_URL),
  )
})

await t.test(async function test_Import_expression() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[const someVal [import failingExpression]]
`,
    `unable to find declaration of "failingExpression" at [object IdentUnqual]`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[const someVal0 [import "some_import_path"]]
[const someVal1 [import "one://two/three.four"]]
[const someVal2 [import someVal1.someAddress]]
`,
`
export const someVal0 = import("some_import_path");
export const someVal1 = import("one://two/three.four");
export const someVal2 = import(someVal1.someAddress);
`)
})

/*
Incomplete. See the comment on `ImportBase` for various other cases we need to
test.
*/
await t.test(async function test_Import_rewriting_non_jisp() {
  await jrt.testModuleCompile(
    jrt.makeModuleAddressed(),
`
[use "jisp:prelude.mjs" *]

[import "./some_other_module"]
[const someConst [import "./some_other_module"]]
`,
`
import "../test_files/some_other_module";
export const someConst = import("../test_files/some_other_module");
`)

  await jrt.testModuleCompile(
    jrt.makeModuleAddressed(),
`
[use "jisp:prelude.mjs" *]
[import "./some_other_module.mjs"]
`,
`
import "../test_files/some_other_module.mjs";
`)

  await jrt.testModuleCompile(
    jrt.makeModuleAddressed(),
`
[use "jisp:prelude.mjs" *]
[import "../some_other_module.mjs"]
`,
`
import "../some_other_module.mjs";
`)
})

/*
This test is incomplete. TODO verify the following:

  * Self-import is allowed and doesn't cause exceptions.
  * Self-import doesn't cause additional FS operations.
  * Self-import doesn't cause `Module..ready` to deadlock.
*/
await t.test(async function test_Import_self() {
  await jrt.testModuleCompile(
    jrt.makeModuleAddressed(),
`
[use "jisp:prelude.mjs" *]

[import "./test.jisp"]
[import "./test.jisp" self]
`,
`
import "./test.mjs";
import * as self from "./test.mjs";
`)
})

/*
This test should compile and JS-import Jisp file A which Jisp-imports Jisp file
B. Attempting to JS-import the compiled file A should fail if B hasn't been
compiled to disk. The test should succeed if our request to resolve / compile A
waits until its dependency B is also resolved / compiled to disk, and fail if
it doesn't wait for dependencies.
*/
await t.test(async function test_Import_transitive() {
  const fs = jdft.makeTestFs()
  const root = new jr.Root().setFs(fs)

  await import(
    await root.reqModuleReadyPath(
      new URL(`test_import_one.jisp`, tu.TEST_SRC_URL).href,
    )
  )
})

await t.test(async function test_Import_unknown_field() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

import.unknownField
`,
    `missing property "unknownField" in live value [function Import]`,
  )
})

await t.test(async function test_Import_meta() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

import.meta
[import.meta]
[const someConst0 import.meta]
[const someConst1 [import.meta]]

import.meta.url
[import.meta.url]
[const someConst2 import.meta.url]
[const someConst3 [import.meta.url]]
`,
`
import.meta;
import.meta();
export const someConst0 = import.meta;
export const someConst1 = import.meta();
import.meta.url;
import.meta.url();
export const someConst2 = import.meta.url;
export const someConst3 = import.meta.url();
`)
})

if (import.meta.main) ti.flush()

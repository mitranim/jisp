import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jdft from './jisp_deno_fs_test.mjs'
import * as jrt from './jisp_root_test.mjs'
import * as jm from '../js/jisp_misc.mjs'
import * as jr from '../js/jisp_root.mjs'
import * as jnm from '../js/jisp_node_module.mjs'

await t.test(async function test_Import_as_statement() {
  await jrt.testModuleCompile(`
[use "jisp:prelude.mjs" "*"]

[import "some_import_path"]
[import "some_import_path" mod0]

[import "one://two/three.four"]
[import "one://two/three.four" mod1]
`,
`
import "some_import_path";
import * as mod0 from "some_import_path";
import "one://two/three.four";
import * as mod1 from "one://two/three.four";
`)
})

await t.test(async function test_Import_as_expression() {
  await jrt.testModuleCompile(`
[use "jisp:prelude.mjs" "*"]

[const someVal0 [import "some_import_path"]]
[const someVal1 [import "one://two/three.four"]]
`,
`
const someVal0 = import("some_import_path");
const someVal1 = import("one://two/three.four");
`)
})

/*
Incomplete. See the comment on `ImportBase` for various other cases we need to
test.
*/
await t.test(async function test_Import_rewriting_non_jisp() {
  async function test(src, exp) {
    const mod = new jnm.Module()
      .setParent(new jr.Root())
      .setSrcUrlStr(new jm.Url(`../test_files/test.jisp`, import.meta.url).href)
      .setTarUrlStr(new jm.Url(`../.tmp/test.mjs`, import.meta.url).href)

    mod.parse(src)
    await mod.macro()
    tu.testCompiled(mod.compile(), exp)
  }

  await test(`
[use "jisp:prelude.mjs" "*"]
[import "./some_other_module"]
`,
`
import "./../test_files/some_other_module";
`)

  await test(`
[use "jisp:prelude.mjs" "*"]
[import "./some_other_module.mjs"]
`,
`
import "./../test_files/some_other_module.mjs";
`)

  await test(`
[use "jisp:prelude.mjs" "*"]
[import "../some_other_module.mjs"]
`,
`
import "./../some_other_module.mjs";
`)
})

/*

FIXME verify behaviors:

  * Implicitly relative import paths:

    `one`
    `one/two`
    `one.mjs`
    `one.jisp`
    `one/two.mjs`
    `one/two.jisp`

  * Always rewriting explicitly relative paths relative to target.

  * Always rewriting `.jisp` paths into `.mjs` relative to target.

*/

/*
This test should compile and JS-import Jisp file A which Jisp-imports Jisp file
B. Attempting to JS-import the compiled file A should fail if B hasn't been
compiled to disk. The test should succeed if our request to resolve / compile A
waits until its dependency B is also resolved / compiled to disk, and fail if
it doesn't wait for dependencies.
*/
await t.test(async function test_Import_transitive() {
  /*

  Pick two Jisp source files which are not used by any other tests, where A
  imports B.

  Ensure that there's a way to resolve A and when that's done, both A and B are
  written to disk and importable.

  Ensure that there's a way to resolve A and B that begins their processing, but
  doesn't wait until the files are written to disk.

  Either at module level or root level, there should be at least two ways of
  resolving Jisp modules, one completely non-waiting, one that waits only for
  the given module, and one that also waits for all its dependencies.

  */

  const fs = jdft.makeTestFs()
  const root = new jr.Root().setFs(fs)

  await import(
    await root.reqModuleReadyTarUrlStr(
      new URL(`../test_files/test_import_one.jisp`, import.meta.url).href
    )
  )
})

/*

FIXME missing tests.

In expression mode, arbitrary expression should be allowed in address position.

Clear target folder, have two modules where one imports another, ensure that
both are compiled, test different types of import promises available from
modules.

*/

if (import.meta.main) ti.flush()

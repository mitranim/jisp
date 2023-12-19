import * as ti from './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as tu from './test_util.mjs'
import * as jdft from './jisp_deno_fs_test.mjs'
import * as jr from '../js/jisp_root.mjs'
import * as jnm from '../js/jisp_node_module.mjs'

await t.test(async function test_compilation_with_prelude_star() {
  await testSingleFileCompilation(`test_prelude_star.jisp`, `test_prelude_star_or_named.mjs`)
})

await t.test(async function test_compilation_with_prelude_named() {
  await testSingleFileCompilation(`test_prelude_named.jisp`, `test_prelude_star_or_named.mjs`)
})

async function testSingleFileCompilation(src, exp) {
  const fs = jdft.makeTestFs()
  const srcText = a.trim(await fs.readSrc(src))
  const expText = a.trim(await fs.readSrc(exp))
  const root = new jr.Root().setFs(fs)
  const mod = new jnm.Module()

  mod.setParent(root)
  mod.parse(srcText)
  await mod.macro()

  const outText = a.trim(mod.compile())

  if (outText !== expText) {
    throw new t.AssertError(`
mismatch of compiled text and expected text

expected:
---
${expText}
---

compiled:
---
${outText}
---
`)
  }
}

// FIXME convert to something more useful.
// For example, convert to root test that verifies module caching.
await t.test(async function test_Module() {
  return
  const fs = jdft.makeTestFs()
  const root = new jr.Root().setFs(fs)

  /*
  root -> ask for tar module -> compile to FS -> load from FS -> RAM cached
  root -> ask for tar module ->               -> load from FS -> RAM cached
  root -> ask for tar module ->                               -> RAM cached
  */

  const mod = new jnm.Module().setParent(root).parse(tu.SRC_TEXT).setUrl(tu.SRC_FILE_URL.href)
  // const mod = await root.initModule(`test_code.jisp`)

  await mod.macro()
  console.log(mod.compile())
})

if (import.meta.main) ti.flush()

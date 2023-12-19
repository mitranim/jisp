import * as ti from './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as tu from './test_util.mjs'
import * as jdft from './jisp_deno_fs_test.mjs'
import * as je from '../js/jisp_err.mjs'
import * as jr from '../js/jisp_root.mjs'
import * as jnm from '../js/jisp_node_module.mjs'

await t.test(async function test_compilation_with_prelude_star() {
  await testSingleFileCompilation(`test_use_prelude_star.jisp`, `test_use_prelude_star_or_named.mjs`)
})

await t.test(async function test_compilation_with_prelude_named() {
  await testSingleFileCompilation(`test_use_prelude_named.jisp`, `test_use_prelude_star_or_named.mjs`)
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

  tu.testCompiled(mod.compile(), expText)
}

await t.test(async function test_Use_import_resolution() {
  function makeMod() {return new jnm.Module().setParent(new jr.Root())}

  await t.test(async function test_fail_without_module_url() {
    async function fail(src, err, msg) {
      const mod = makeMod().parse(src)
      await t.throws(async () => mod.macro(), err, msg)
    }

    await fail(`[use "blah"]`,         je.CodeErr, `missing module URL at [object Module]`)
    await fail(`[use "./blah"]`,       je.CodeErr, `missing module URL at [object Module]`)
    await fail(`[use "../blah"]`,      je.CodeErr, `missing module URL at [object Module]`)
    await fail(`[use "/blah"]`,        je.CodeErr, `Module not found "file:///blah"`)
    await fail(`[use "file:///blah"]`, je.CodeErr, `Module not found "file:///blah"`)
  })

  await t.test(async function test_fail_with_module_url() {
    async function fail(src, err, msg) {
      const mod = makeMod().setUrl(`file:///one/two/three`).parse(src)
      await t.throws(async () => mod.macro(), err, msg)
    }

    await fail(`[use "blah"]`,         je.CodeErr, `Module not found "file:///one/two/blah"`)
    await fail(`[use "./blah"]`,       je.CodeErr, `Module not found "file:///one/two/blah"`)
    await fail(`[use "../blah"]`,      je.CodeErr, `Module not found "file:///one/blah"`)
    await fail(`[use "/blah"]`,        je.CodeErr, `Module not found "file:///blah"`)
    await fail(`[use "file:///blah"]`, je.CodeErr, `Module not found "file:///blah"`)
  })

  await t.test(async function test_success_with_module_url() {
    async function test(src, exp) {
      const mod = makeMod().setUrl(import.meta.url).parse(src)
      await mod.macro()
      tu.testCompiled(mod.compile(), exp)
    }

    await test(
      `
[use "../js/prelude.mjs" "*"]
global
`,
      `globalThis;`
    )

    await test(
      `
[use "../js/prelude.mjs" jp]
jp.global
`,
      `globalThis;`
    )
  })
})

await t.test(async function test_Root_jisp_file_conversion() {
  async function fail(src, msg) {
    const root = new jr.Root()
    await t.throws(async () => root.resolveLangFile(src), Error, msg)
  }

  await fail(undefined,             `expected instance of URL, got undefined`)
  await fail(10,                    `expected instance of URL, got 10`)
  await fail(`https://example.com`, `expected instance of URL, got "https://example.com"`)
  await fail(`https://example.com`, `expected instance of URL, got "https://example.com"`)

  const srcUrl = new URL(`../test_files/test_simple_runnable.jisp`, import.meta.url)
  await fail(srcUrl, `missing FS at [object Root]`)

  const fs = jdft.makeTestFs()
  const root = new jr.Root().setFs(fs)
  const out = await root.resolveLangFile(srcUrl)

  // const mod = await import(out)
  // console.log(`mod:`, mod)

  /*
  Output is meant to be passed to the native pseudo-function `import`.
  We don't care if it's a string or URL, but it must be stringable.
  */
  t.is(
    a.render(out),
    a.render(new URL(`../.tmp/test_simple_runnable.mjs`, import.meta.url)),
  )
})

if (import.meta.main) ti.flush()

import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jdft from './jisp_deno_fs_test.mjs'
import * as jm from '../js/jisp_misc.mjs'
import * as je from '../js/jisp_err.mjs'
import * as jr from '../js/jisp_root.mjs'
import * as jnm from '../js/jisp_node_module.mjs'

export async function testModuleFail(src, msg) {
  const mod = new jnm.Module().setParent(new jr.Root()).parse(src)
  await t.throws(async () => mod.macro(), Error, msg)
}

export async function testModuleCompile(src, exp) {
  const mod = new jnm.Module().setParent(new jr.Root()).parse(src)
  await mod.macro()
  tu.testCompiled(mod.compile(), exp)
}

export function makeModule() {return new jnm.Module().setParent(new jr.Root())}

await t.test(async function test_compilation_with_prelude_star() {
  await testSingleFileCompilation(
    new jm.Url(`../test_files/test_use_prelude_star.jisp`,         import.meta.url),
    new jm.Url(`../test_files/test_use_prelude_star_or_named.mjs`, import.meta.url),
  )
})

await t.test(async function test_compilation_with_prelude_named() {
  await testSingleFileCompilation(
    new jm.Url(`../test_files/test_use_prelude_named.jisp`,        import.meta.url),
    new jm.Url(`../test_files/test_use_prelude_star_or_named.mjs`, import.meta.url),
  )
})

async function testSingleFileCompilation(src, exp) {
  const fs = jdft.makeTestFs()
  const srcText = a.trim(await fs.read(src))
  const expText = a.trim(await fs.read(exp))
  const root = new jr.Root().setFs(fs)
  const mod = new jnm.Module()

  mod.setParent(root)
  mod.parse(srcText)
  await mod.macro()

  tu.testCompiled(mod.compile(), expText)
}

await t.test(async function test_Use_import_resolution() {
  await t.test(async function test_fail_without_module_url() {
    await testModuleFail(`[use "blah"]`,         `Relative import path "blah" not prefixed with / or ./ or ../`)
    await testModuleFail(`[use "./blah"]`,       `missing module source URL at [object Module]`)
    await testModuleFail(`[use "../blah"]`,      `missing module source URL at [object Module]`)
    await testModuleFail(`[use "/blah"]`,        `Module not found "file:///blah"`)
    await testModuleFail(`[use "file:///blah"]`, `Module not found "file:///blah"`)
  })

  await t.test(async function test_fail_with_module_url() {
    async function fail(src, msg) {
      const mod = makeModule().setSrcUrlStr(`file:///one/two/three`).parse(src)
      await t.throws(async () => mod.macro(), je.CodeErr, msg)
    }

    await fail(`[use "blah"]`,         `Relative import path "blah" not prefixed with / or ./ or ../`)
    await fail(`[use "./blah"]`,       `Module not found "file:///one/two/blah"`)
    await fail(`[use "../blah"]`,      `Module not found "file:///one/blah"`)
    await fail(`[use "/blah"]`,        `Module not found "file:///blah"`)
    await fail(`[use "file:///blah"]`, `Module not found "file:///blah"`)
  })

  await t.test(async function test_success_with_module_url() {
    async function test(src, exp) {
      const mod = makeModule().setSrcUrlStr(import.meta.url).parse(src)
      await mod.macro()
      tu.testCompiled(mod.compile(), exp)
    }

    await test(`
[use "../js/prelude.mjs" "*"]
global
`,
`globalThis;`)

    await test(`
[use "../js/prelude.mjs" jp]
jp.global
`,
`globalThis;`)
  })
})

/*
TODO: also test that compilation is performed idempotently. For each Jisp file
requested from `Root`, it must normalize the resulting file URL to a canonical
form and cache the promise the represents the compilation process. Whenever a
file is requested repeatedly from the same `Root`, compilation must be
performed only once.
*/
await t.test(async function test_Root_resolution_and_compilation() {
  async function fail(src, msg) {
    const root = new jr.Root()
    await t.throws(async () => root.reqModuleReadyTarUrlStr(src), Error, msg)
  }

  // await t.test(async function test_invalid() {
  //   await fail(undefined,             `expected variant of isCanonicalModuleUrlStr, got undefined`)
  //   await fail(10,                    `expected variant of isCanonicalModuleUrlStr, got 10`)
  //   await fail(`https://example.com`, `expected variant of isCanonicalModuleUrlStr, got "https://example.com"`)
  // })

  await t.test(async function test_invalid() {
    await fail(undefined,             `expected variant of isCanonicalModuleUrlStr, got undefined`)
    await fail(10,                    `expected variant of isCanonicalModuleUrlStr, got 10`)
    await fail(`https://example.com`, `missing FS at [object Root]`)
  })

  // await t.test(async function test_invalid() {
  //   await fail(undefined,             `Invalid URL`)
  //   await fail(10,                    `Invalid URL`)
  //   await fail(`https://example.com`, `missing FS at [object Root]`)
  // })

  await t.test(async function test_valid() {
    const srcUrlStr = new jm.Url(`../test_files/test_simple.jisp`, import.meta.url).href
    await fail(srcUrlStr, `missing FS at [object Root]`)

    const fs = jdft.makeTestFs()
    const root = new jr.Root().setFs(fs)

    /*
    Despite "resolve" in the name, this involves reading, parsing, macroing,
    compiling, and writing the compiled file. The return value must be a valid
    file URL to the compiled file, suitable for FS access and use with the
    native pseudo-function `import`.
    */
    const tarStr = await root.reqModuleReadyTarUrlStr(srcUrlStr)
    a.reqValidStr(tarStr)

    const tarUrl = new jm.Url(tarStr)
    const tarText = await fs.read(tarUrl)

    tu.testCompiled(tarText, `
const someConst = \`some_const_value\`;
function someFunc() {
\`some_func_value\`;
};
`)

    /*
    The output path must include a hash based on the relative path between the
    directory of the source file and the target directory.
    */
    const hash = await jm.strToHash(`../test_files`)

    t.is(
      io.paths.relTo(tarUrl.pathname, io.cwd()),
      io.paths.join(tu.TEST_TAR_NAME, hash, `test_simple.mjs`),
    )
  })
})

if (import.meta.main) ti.flush()

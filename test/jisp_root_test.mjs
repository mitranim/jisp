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
import * as jmo from '../js/jisp_module.mjs'

/*
This function could be written as follows:

  await mod.macro()
  await t.throws(async () => (await mod.parse(src).macro()).compile(), Error, msg)

However, `t.throws` would report the return string in "code" form, with quotes
and escape sequences, instead of including it into the error message as-is.
In this function, we prefer to print the compiled output as-is. This needs
to be fixed by making `t.throws` more extensible. Perhaps testing utils should
be subclassable, like in Python.
*/
export async function testModuleFail(mod, src, msg) {
  a.reqInst(mod, jmo.Module)
  a.reqStr(src)
  a.reqValidStr(msg)

  let out
  try {
    mod.parse(src)
    await mod.macro()
    out = mod.compile()
  }
  catch (err) {
    if (err?.message.includes(msg)) return

    throw new t.AssertError(`
${throwsMacroMsg(msg)}
${t.throwsGotErr(err)}
  `)
  }

  throw new t.AssertError(`
${throwsMacroMsg(msg)}
instead, module compiled to:
${out}
`)
}

function throwsMacroMsg(msg) {
  return `expected module to produce exception with message:

  ${msg}
`
}

export async function testModuleCompile(mod, src, exp) {
  mod.parse(src)
  await mod.macro()
  tu.testCompiled(mod.compile(), exp)
}

export function makeModule() {return new jr.Root().makeModule()}

export function makeModuleAddressed() {
  return makeModule()
    .setSrcPathAbs(new URL(`test.jisp`, tu.TEST_SRC_URL).href)
    .setTarPathAbs(new URL(`test.mjs`, tu.TEST_TAR_URL).href)
}

await t.test(async function test_compilation_with_prelude_star() {
  await testSingleFileCompilation(
    new URL(`test_use_prelude_star.jisp`,         tu.TEST_SRC_URL),
    new URL(`test_use_prelude_star_or_named.mjs`, tu.TEST_SRC_URL),
  )
})

await t.test(async function test_compilation_with_prelude_named() {
  await testSingleFileCompilation(
    new URL(`test_use_prelude_named.jisp`,        tu.TEST_SRC_URL),
    new URL(`test_use_prelude_star_or_named.mjs`, tu.TEST_SRC_URL),
  )
})

export async function testSingleFileCompilation(src, exp) {
  const fs = jdft.makeTestFs()
  const root = new jr.Root().setFs(fs)

  const mod = root.reqModule(src.href)
  await mod.ready()

  const tarText = a.trim(await fs.read(mod.reqTarUrl()))
  const expText = a.trim(await fs.read(exp))

  tu.testCompiled(tarText, expText)
}

await t.test(async function test_Use_import_resolution() {
  await t.test(async function test_fail_without_module_url() {
    await testModuleFail(makeModule(), `[.use "blah"]`,         `Relative import path "blah" not prefixed with / or ./ or ../`)
    await testModuleFail(makeModule(), `[.use "./blah"]`,       `missing source URL in [object Module]`)
    await testModuleFail(makeModule(), `[.use "../blah"]`,      `missing source URL in [object Module]`)
    await testModuleFail(makeModule(), `[.use "/blah"]`,        `Module not found "file:///blah"`)
    await testModuleFail(makeModule(), `[.use "file:///blah"]`, `Module not found "file:///blah"`)
  })

  await t.test(async function test_fail_with_module_url() {
    async function fail(src, msg) {
      const mod = makeModule().setSrcPathAbs(`file:///one/two/three.jisp`).parse(src)
      await t.throws(async () => mod.macro(), Error, msg)
    }

    await fail(`[.use "blah"]`,         `Relative import path "blah" not prefixed with / or ./ or ../`)
    await fail(`[.use "./blah"]`,       `Module not found "file:///one/two/blah"`)
    await fail(`[.use "../blah"]`,      `Module not found "file:///one/blah"`)
    await fail(`[.use "/blah"]`,        `Module not found "file:///blah"`)
    await fail(`[.use "file:///blah"]`, `Module not found "file:///blah"`)
  })

  await t.test(async function test_success_with_module_url() {
    async function test(src, exp) {
      const mod = makeModuleAddressed().parse(src)
      await mod.macro()
      tu.testCompiled(mod.compile(), exp)
    }

    await test(`
[.use "../js/prelude.mjs" *]
[declare "../js/global.mjs"]

undefined
null
globalThis
`,
`
undefined;
null;
globalThis;
`)

    await test(`
[.use "../js/prelude.mjs" jp]
[jp.declare "../js/global.mjs"]

undefined
null
globalThis
`,
`
undefined;
null;
globalThis;
`)
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
    await t.throws(async () => root.reqModuleReadyPath(src), Error, msg)
  }

  await t.test(async function test_invalid() {
    await fail(undefined,                    `expected variant of isCanonicalModulePath, got undefined`)
    await fail(10,                           `expected variant of isCanonicalModulePath, got 10`)
    await fail(`file://one/two/three.mjs`,   `expected variant of isCanonicalModulePath, got "file://one/two/three.mjs"`)
    await fail(`file://one/two/three.jisp`,  `expected variant of isCanonicalModulePath, got "file://one/two/three.jisp"`)
    await fail(`file:///one/two/three.jisp`, `missing FS at [object Root]`)
  })

  await t.test(async function test_valid() {
    const srcUrlStr = new URL(`test_simple.jisp`, tu.TEST_SRC_URL).href
    await fail(srcUrlStr, `missing FS at [object Root]`)

    const fs = jdft.makeTestFs()
    const root = new jr.Root().setFs(fs)

    /*
    Despite "resolve" in the name, this involves reading, parsing, macroing,
    compiling, and writing the compiled file. The return value must be a valid
    file URL to the compiled file, suitable for FS access and use with the
    native pseudo-function `import`.
    */
    const tarStr = await root.reqModuleReadyPath(srcUrlStr)
    a.reqValidStr(tarStr)

    const tarUrl = new URL(tarStr)
    const tarText = await fs.read(tarUrl)

    tu.testCompiled(tarText, `
const someConst = \`some_const_value\`;
function someFunc () {
return \`some_func_value\`;
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

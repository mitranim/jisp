import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jdft from './jisp_deno_fs_test.mjs'
import * as jrt from './jisp_root_test.mjs'
import * as jdfs from '../js/jisp_deno_fs.mjs'
import * as jr from '../js/jisp_root.mjs'
import * as jmo from '../js/jisp_module.mjs'
import * as jnmnl from '../js/jisp_node_module_node_list.mjs'

class DenoFsReadOnly extends jdfs.DenoFs {
  write() {throw Error(`unexpected forbidden write operation`)}
}

/*
Incomplete. Non-exhaustive list of missing tests:

  * Each module must be read, macroed, compiled, and written 0 or 1 times.
    Performing any of these operations more than 1 time during a single
    compilation pass is forbidden. The deduplication of these operations
    must be concurrency-safe, in the sense that it should work regardless
    of the order of calls when async/await is involved.

  * Module readiness must correctly wait for all runtime dependencies.

  * Dependency cycles should cause immediate compile-time errors reporting the
    cyclic path.

Also note that for any compiled file imported during this test, the JS engine
caches it, and any repeated import during the subsequent compilation passes
will use the cached version of that file, not a recompiled version. For this
test that's fine because we modify only timestamps, not contents.
*/
await t.test(async function test_compilation_caching_reuse() {
  if (ti.WATCH) return
  tu.clearTar()

  await t.test(async function test_from_scratch() {
    const root = new jr.Root().setFs(new jdfs.DenoFs().setTar(tu.TEST_TAR_NAME))
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = getModules(root)

    await testModuleOutdated(modMain)
    await testModuleUpToDate(modPrelude)
    await testModuleOutdated(modUsed)
    await testModuleUpToDate(modUsedMjs)
    await testModuleOutdated(modUsedUsed)
    await testModuleOutdated(modUsedImported)
    await testModuleOutdated(modImported)
    await testModuleUpToDate(modImportedMjs)
    await testModuleOutdated(modImportedUsed)
    await testModuleOutdated(modImportedImported)

    await modMain.ready()
    testAllModuleDeps(root)

    await testModuleRecompiled(modMain, root)
    await testModuleNotRecompiled(modPrelude, root)
    await testModuleRecompiled(modUsed, root)
    await testModuleNotRecompiled(modUsedMjs, root)
    await testModuleRecompiled(modUsedUsed, root)
    await testModuleRecompiled(modUsedImported, root)
    await testModuleRecompiled(modImported, root)
    await testModuleNotRecompiled(modImportedMjs, root)
    await testModuleRecompiled(modImportedUsed, root)
    await testModuleRecompiled(modImportedImported, root)
  })

  await t.test(async function test_unchanged() {
    const root = new jr.Root().setFs(new DenoFsReadOnly().setTar(tu.TEST_TAR_NAME))
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = getModules(root)

    await testModuleUpToDate(modMain)
    await testModuleUpToDate(modPrelude)
    await testModuleUpToDate(modUsed)
    await testModuleUpToDate(modUsedMjs)
    await testModuleUpToDate(modUsedUsed)
    await testModuleUpToDate(modUsedImported)
    await testModuleUpToDate(modImported)
    await testModuleUpToDate(modImportedMjs)
    await testModuleUpToDate(modImportedUsed)
    await testModuleUpToDate(modImportedImported)

    await modMain.ready()

    await testModuleNotRecompiled(modMain, root)
    await testModuleNotRecompiled(modPrelude, root)
    await testModuleNotRecompiled(modUsed, root)
    await testModuleNotRecompiled(modUsedMjs, root)
    await testModuleNotRecompiled(modUsedUsed, root)
    await testModuleNotRecompiled(modUsedImported, root)
    await testModuleNotRecompiled(modImported, root)
    await testModuleNotRecompiled(modImportedMjs, root)
    await testModuleNotRecompiled(modImportedUsed, root)
    await testModuleNotRecompiled(modImportedImported, root)
  })

  await t.test(async function test_touch_main() {
    const root = new jr.Root().setFs(new jdfs.DenoFs().setTar(tu.TEST_TAR_NAME))
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = getModules(root)

    await moduleTouch(modMain, root)

    await testModuleOutdated(modMain)
    await testModuleUpToDate(modPrelude)
    await testModuleUpToDate(modUsed)
    await testModuleUpToDate(modUsedMjs)
    await testModuleUpToDate(modUsedUsed)
    await testModuleUpToDate(modUsedImported)
    await testModuleUpToDate(modImported)
    await testModuleUpToDate(modImportedMjs)
    await testModuleUpToDate(modImportedUsed)
    await testModuleUpToDate(modImportedImported)

    await modMain.ready()

    await testModuleRecompiled(modMain, root)
    await testModuleNotRecompiled(modPrelude, root)
    await testModuleNotRecompiled(modUsed, root)
    await testModuleNotRecompiled(modUsedMjs, root)
    await testModuleNotRecompiled(modUsedUsed, root)
    await testModuleNotRecompiled(modUsedImported, root)
    await testModuleNotRecompiled(modImported, root)
    await testModuleNotRecompiled(modImportedMjs, root)
    await testModuleNotRecompiled(modImportedUsed, root)
    await testModuleNotRecompiled(modImportedImported, root)
  })

  await t.test(async function test_touch_used() {
    const root = new jr.Root().setFs(new jdfs.DenoFs().setTar(tu.TEST_TAR_NAME))
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = getModules(root)

    await moduleTouch(modUsed, root)

    await testModuleOutdated(modMain)
    await testModuleUpToDate(modPrelude)
    await testModuleOutdated(modUsed)
    await testModuleUpToDate(modUsedMjs)
    await testModuleUpToDate(modUsedUsed)
    await testModuleUpToDate(modUsedImported)
    await testModuleUpToDate(modImported)
    await testModuleUpToDate(modImportedMjs)
    await testModuleUpToDate(modImportedUsed)
    await testModuleUpToDate(modImportedImported)

    await modMain.ready()

    await testModuleRecompiled(modMain, root)
    await testModuleNotRecompiled(modPrelude, root)
    await testModuleRecompiled(modUsed, root)
    await testModuleNotRecompiled(modUsedMjs, root)
    await testModuleNotRecompiled(modUsedUsed, root)
    await testModuleNotRecompiled(modUsedImported, root)
    await testModuleNotRecompiled(modImported, root)
    await testModuleNotRecompiled(modImportedMjs, root)
    await testModuleNotRecompiled(modImportedUsed, root)
    await testModuleNotRecompiled(modImportedImported, root)
  })

  await t.test(async function test_touch_used_mjs() {
    const root = new jr.Root().setFs(new jdfs.DenoFs().setTar(tu.TEST_TAR_NAME))
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = getModules(root)

    await moduleTouch(modUsedMjs, root)

    await testModuleOutdated(modMain)
    await testModuleUpToDate(modPrelude)
    await testModuleUpToDate(modUsed)
    await testModuleUpToDate(modUsedMjs)
    await testModuleUpToDate(modUsedUsed)
    await testModuleUpToDate(modUsedImported)
    await testModuleUpToDate(modImported)
    await testModuleUpToDate(modImportedMjs)
    await testModuleUpToDate(modImportedUsed)
    await testModuleUpToDate(modImportedImported)

    await modMain.ready()

    await testModuleRecompiled(modMain, root)
    await testModuleNotRecompiled(modPrelude, root)
    await testModuleNotRecompiled(modUsed, root)
    await testModuleNotRecompiled(modUsedMjs, root)
    await testModuleNotRecompiled(modUsedUsed, root)
    await testModuleNotRecompiled(modUsedImported, root)
    await testModuleNotRecompiled(modImported, root)
    await testModuleNotRecompiled(modImportedMjs, root)
    await testModuleNotRecompiled(modImportedUsed, root)
    await testModuleNotRecompiled(modImportedImported, root)
  })

  await t.test(async function test_touch_used_used() {
    const root = new jr.Root().setFs(new jdfs.DenoFs().setTar(tu.TEST_TAR_NAME))
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = getModules(root)

    await moduleTouch(modUsedUsed, root)

    await testModuleOutdated(modMain)
    await testModuleUpToDate(modPrelude)
    await testModuleOutdated(modUsed)
    await testModuleUpToDate(modUsedMjs)
    await testModuleOutdated(modUsedUsed)
    await testModuleUpToDate(modUsedImported)
    await testModuleUpToDate(modImported)
    await testModuleUpToDate(modImportedMjs)
    await testModuleUpToDate(modImportedUsed)
    await testModuleUpToDate(modImportedImported)

    await modMain.ready()

    await testModuleRecompiled(modMain, root)
    await testModuleNotRecompiled(modPrelude, root)
    await testModuleRecompiled(modUsed, root)
    await testModuleNotRecompiled(modUsedMjs, root)
    await testModuleRecompiled(modUsedUsed, root)
    await testModuleNotRecompiled(modUsedImported, root)
    await testModuleNotRecompiled(modImported, root)
    await testModuleNotRecompiled(modImportedMjs, root)
    await testModuleNotRecompiled(modImportedUsed, root)
    await testModuleNotRecompiled(modImportedImported, root)
  })

  await t.test(async function test_touch_used_imported() {
    const root = new jr.Root().setFs(new jdfs.DenoFs().setTar(tu.TEST_TAR_NAME))
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = getModules(root)

    await moduleTouch(modUsedImported, root)

    await testModuleOutdated(modMain)
    await testModuleUpToDate(modPrelude)
    await testModuleUpToDate(modUsed)
    await testModuleUpToDate(modUsedMjs)
    await testModuleUpToDate(modUsedUsed)
    await testModuleOutdated(modUsedImported)
    await testModuleUpToDate(modImported)
    await testModuleUpToDate(modImportedMjs)
    await testModuleUpToDate(modImportedUsed)
    await testModuleUpToDate(modImportedImported)

    await modMain.ready()

    await testModuleRecompiled(modMain, root)
    await testModuleNotRecompiled(modPrelude, root)
    await testModuleNotRecompiled(modUsed, root)
    await testModuleNotRecompiled(modUsedMjs, root)
    await testModuleNotRecompiled(modUsedUsed, root)
    await testModuleRecompiled(modUsedImported, root)
    await testModuleNotRecompiled(modImported, root)
    await testModuleNotRecompiled(modImportedMjs, root)
    await testModuleNotRecompiled(modImportedUsed, root)
    await testModuleNotRecompiled(modImportedImported, root)
  })

  await t.test(async function test_touch_imported() {
    const root = new jr.Root().setFs(new jdfs.DenoFs().setTar(tu.TEST_TAR_NAME))
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = getModules(root)

    await moduleTouch(modImported, root)

    await testModuleUpToDate(modMain)
    await testModuleUpToDate(modPrelude)
    await testModuleUpToDate(modUsed)
    await testModuleUpToDate(modUsedMjs)
    await testModuleUpToDate(modUsedUsed)
    await testModuleUpToDate(modUsedImported)
    await testModuleOutdated(modImported)
    await testModuleUpToDate(modImportedMjs)
    await testModuleUpToDate(modImportedUsed)
    await testModuleUpToDate(modImportedImported)

    await modMain.ready()

    await testModuleNotRecompiled(modMain, root)
    await testModuleNotRecompiled(modPrelude, root)
    await testModuleNotRecompiled(modUsed, root)
    await testModuleNotRecompiled(modUsedMjs, root)
    await testModuleNotRecompiled(modUsedUsed, root)
    await testModuleNotRecompiled(modUsedImported, root)
    await testModuleRecompiled(modImported, root)
    await testModuleNotRecompiled(modImportedMjs, root)
    await testModuleNotRecompiled(modImportedUsed, root)
    await testModuleNotRecompiled(modImportedImported, root)
  })

  await t.test(async function test_touch_imported() {
    const root = new jr.Root().setFs(new jdfs.DenoFs().setTar(tu.TEST_TAR_NAME))
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = getModules(root)

    await moduleTouch(modImportedMjs, root)

    await testModuleUpToDate(modMain)
    await testModuleUpToDate(modPrelude)
    await testModuleUpToDate(modUsed)
    await testModuleUpToDate(modUsedMjs)
    await testModuleUpToDate(modUsedUsed)
    await testModuleUpToDate(modUsedImported)
    await testModuleUpToDate(modImported)
    await testModuleUpToDate(modImportedMjs)
    await testModuleUpToDate(modImportedUsed)
    await testModuleUpToDate(modImportedImported)

    await modMain.ready()

    await testModuleNotRecompiled(modMain, root)
    await testModuleNotRecompiled(modPrelude, root)
    await testModuleNotRecompiled(modUsed, root)
    await testModuleNotRecompiled(modUsedMjs, root)
    await testModuleNotRecompiled(modUsedUsed, root)
    await testModuleNotRecompiled(modUsedImported, root)
    await testModuleNotRecompiled(modImported, root)
    await testModuleNotRecompiled(modImportedMjs, root)
    await testModuleNotRecompiled(modImportedUsed, root)
    await testModuleNotRecompiled(modImportedImported, root)
  })

  await t.test(async function test_touch_imported_used() {
    const root = new jr.Root().setFs(new jdfs.DenoFs().setTar(tu.TEST_TAR_NAME))
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = getModules(root)

    await moduleTouch(modImportedUsed, root)

    await testModuleUpToDate(modMain)
    await testModuleUpToDate(modPrelude)
    await testModuleUpToDate(modUsed)
    await testModuleUpToDate(modUsedMjs)
    await testModuleUpToDate(modUsedUsed)
    await testModuleUpToDate(modUsedImported)
    await testModuleOutdated(modImported)
    await testModuleUpToDate(modImportedMjs)
    await testModuleOutdated(modImportedUsed)
    await testModuleUpToDate(modImportedImported)

    await modMain.ready()

    await testModuleNotRecompiled(modMain, root)
    await testModuleNotRecompiled(modPrelude, root)
    await testModuleNotRecompiled(modUsed, root)
    await testModuleNotRecompiled(modUsedMjs, root)
    await testModuleNotRecompiled(modUsedUsed, root)
    await testModuleNotRecompiled(modUsedImported, root)
    await testModuleRecompiled(modImported, root)
    await testModuleNotRecompiled(modImportedMjs, root)
    await testModuleRecompiled(modImportedUsed, root)
    await testModuleNotRecompiled(modImportedImported, root)
  })

  await t.test(async function test_touch_imported_imported() {
    const root = new jr.Root().setFs(new jdfs.DenoFs().setTar(tu.TEST_TAR_NAME))
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = getModules(root)

    await moduleTouch(modImportedImported, root)

    await testModuleUpToDate(modMain)
    await testModuleUpToDate(modPrelude)
    await testModuleUpToDate(modUsed)
    await testModuleUpToDate(modUsedMjs)
    await testModuleUpToDate(modUsedUsed)
    await testModuleUpToDate(modUsedImported)
    await testModuleUpToDate(modImported)
    await testModuleUpToDate(modImportedMjs)
    await testModuleUpToDate(modImportedUsed)
    await testModuleOutdated(modImportedImported)

    await modMain.ready()

    await testModuleNotRecompiled(modMain, root)
    await testModuleNotRecompiled(modPrelude, root)
    await testModuleNotRecompiled(modUsed, root)
    await testModuleNotRecompiled(modUsedMjs, root)
    await testModuleNotRecompiled(modUsedUsed, root)
    await testModuleNotRecompiled(modUsedImported, root)
    await testModuleNotRecompiled(modImported, root)
    await testModuleNotRecompiled(modImportedMjs, root)
    await testModuleNotRecompiled(modImportedUsed, root)
    await testModuleRecompiled(modImportedImported, root)
  })
})

function getModules(root) {
  return {
    modMain:             root.reqModule(new URL(`test_caching_main.jisp`, tu.TEST_SRC_URL).href),
    modPrelude:          root.reqModule(new URL(`../js/prelude.mjs`, import.meta.url).href),
    modUsed:             root.reqModule(new URL(`test_caching_used.jisp`, tu.TEST_SRC_URL).href),
    modUsedMjs:          root.reqModule(new URL(`test_caching_used.mjs`, tu.TEST_SRC_URL).href),
    modUsedUsed:         root.reqModule(new URL(`test_caching_used_used.jisp`, tu.TEST_SRC_URL).href),
    modUsedImported:     root.reqModule(new URL(`test_caching_used_imported.jisp`, tu.TEST_SRC_URL).href),
    modImported:         root.reqModule(new URL(`test_caching_imported.jisp`, tu.TEST_SRC_URL).href),
    modImportedMjs:      root.reqModule(new URL(`test_caching_imported.mjs`, tu.TEST_SRC_URL).href),
    modImportedUsed:     root.reqModule(new URL(`test_caching_imported_used.jisp`, tu.TEST_SRC_URL).href),
    modImportedImported: root.reqModule(new URL(`test_caching_imported_imported.jisp`, tu.TEST_SRC_URL).href),
  }
}

async function testModuleOutdated(mod) {
  if (!(await mod.isUpToDate())) return
  throw new t.AssertError(`module unexpectedly up to date: ${tu.insp(mod)}`)
}

async function testModuleUpToDate(mod) {
  if (await mod.isUpToDate()) return
  throw new t.AssertError(`module unexpectedly outdated: ${tu.insp(mod)}`)
}

function testModuleDeps(mod, src, tar) {
  t.eq(mod.optSrcDeps(), src && new jmo.ModuleSet(src), `source dependencies`)
  t.eq(mod.optTarDeps(), tar && new jmo.ModuleSet(tar), `target dependencies`)
}

function testAllModuleDeps(root) {
  const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = getModules(root)

  testModuleDeps(modMain, [modPrelude, modUsed, modUsedMjs], [modImported, modImportedMjs])
  testModuleDeps(modUsed, [modPrelude, modUsedUsed], [modUsedImported])
  testModuleDeps(modUsedUsed, undefined, undefined)
  testModuleDeps(modImported, [modPrelude, modImportedUsed], [modImportedImported])
  testModuleDeps(modImportedImported, undefined, undefined)

  // Tracking dependencies of pure-JS modules is out of scope for now.
  testModuleDeps(modPrelude, undefined, undefined)
}

async function testModuleRecompiled(mod, root) {
  t.inst(mod.optNodeList(), jnmnl.ModuleNodeList, tu.insp(mod))
  await testModuleCode(mod, root)
}

async function testModuleNotRecompiled(mod, root) {
  t.is(mod.optNodeList(), undefined, tu.insp(mod))

  /*
  We're not comparing with `mod.compile()` because a module that hasn't been
  read would compile to an empty string.
  */
  await root.reqFs().reqRead(mod.reqTarUrl())
}

async function testModuleCode(mod, root) {
  t.is(
    (await root.reqFs().reqRead(mod.reqTarUrl())),
    (mod.compile()),
    tu.insp(mod),
  )
}

async function moduleTouch(mod, root) {
  await root.reqFs().reqTouch(mod.reqSrcUrl())
}

// TODO add tests for other failure cases.
await t.test(async function test_Module_readiness_missing_file_jisp() {
  const root = new jr.Root().setFs(jdft.makeTestFs())
  const src = new URL(`some_missing_file.jisp`, tu.TEST_SRC_URL)
  const mod = root.reqModule(src.href)

  t.is(mod.reqSrcPathAbs(), src.href)
  t.throws(() => mod.reqTarPathAbs(), Error, `missing target path at [object Module]`)
  await t.throws(async () => mod.ready(), Error, `No such file or directory (os error 2), stat '${src.pathname}'`)

  t.is(
    mod.reqTarPathAbs(),
    new URL(`b20863e2e17a6c7fa45bc7bb6ee19f4b7e7359a7bf2f05b704d82d2987acf10a/some_missing_file.mjs`, tu.TEST_TAR_URL).href,
  )
})

if (import.meta.main) ti.flush()

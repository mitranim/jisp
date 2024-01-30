import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

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
will use the cached version of that file, even when we recompile that file.
For this test that's fine because we modify only timestamps, not contents.
*/

const ctx = c.ctxGlobal
const fs = c.ctxReqFs(ctx)

// Restored at the end of this test.
const modsPrev = ctx[c.symModules]

class TestModule extends c.Module {
  async testInit() {
    this.init(ctx)
    this.testTarTimestamp = ti.optFinPos(await fs.timestampOpt(new URL(this.tarPath)))
    return this
  }

  testReadSrc() {return fs.read(new URL(this.srcPath))}
  testReadTar() {return fs.read(new URL(this.tarPath))}

  async testTouch() {
    /*
    Would prefer `Deno.writeFile` or `Deno.writeTextFile` with `{append: true}`
    with an empty input. However, when the input is empty, these functions seem
    to skip the FS operation entirely.
    */
    const path = new URL(this.srcPath)
    await fs.write(path, await fs.read(path))
  }

  testTarNone() {
    if (this.testTarTimestamp) {
      throw Error(`module has unexpected initial target timestamp ${this.testTarTimestamp}: ${ti.inspect(this)}`)
    }
  }

  testTarSome() {
    if (!this.testTarTimestamp) {
      throw Error(`module lacks initial target timestamp: ${ti.inspect(this)}`)
    }
  }

  async testOutdated() {
    if (!(await this.isUpToDate(ctx))) return
    throw Error(`module unexpectedly up to date: ${ti.inspect(this)}`)
  }

  async testUpToDate() {
    if (await this.isUpToDate(ctx)) return
    throw Error(`module unexpectedly outdated: ${ti.inspect(this)}`)
  }

  testMade = false

  async make(...src) {
    if (this.testMade) {
      throw Error(`redundant attempt to remake module: ${ti.inspect(this)}`)
    }
    this.testMade = true
    return super.make(...src)
  }

  async testRemade() {
    this.testUpToDate()

    if (!this.testMade) {
      throw Error(`expected module to be remade: ${ti.inspect(this)}`)
    }

    const timeInit = ti.optFinPos(this.testTarTimestamp)
    const timeCurrent = ti.reqFinPos(await fs.timestamp(new URL(this.tarPath)))

    t.ok(
      (!timeInit || (timeInit < timeCurrent)),
      c.joinParagraphs(
        `module: ` + ti.inspect(this),
        `initial time: ` + timeInit,
        `current time: ` + timeCurrent,
      ),
    )

    await this.testCode()
  }

  async testNotRemade() {
    this.testUpToDate()

    if (this.testMade) {
      throw Error(`expected module to be not remade: ${ti.inspect(this)}`)
    }

    await this.testCode()
  }

  async testCode() {
    if (!this.isJispModule()) return
    const src = c.reqStr(await this.testReadSrc(this))
    const tar = c.reqStr(await this.testReadTar(this))
    t.is(tar, (await this.compile(ctx, src)), ti.inspect(this))
  }
}

class TestModules extends c.Modules {
  get Module() {return TestModule}

  async testInit() {
    this.modMain             = await (await this.getOrMake(new URL(`test_caching_main.jisp`, ti.TEST_SRC_URL).href)).testInit()
    this.modPrelude          = await (await this.getOrMake(new URL(`../js/prelude.mjs`, import.meta.url).href)).testInit()
    this.modUsed             = await (await this.getOrMake(new URL(`test_caching_used.jisp`, ti.TEST_SRC_URL).href)).testInit()
    this.modUsedMjs          = await (await this.getOrMake(new URL(`test_caching_used.mjs`, ti.TEST_SRC_URL).href)).testInit()
    this.modUsedUsed         = await (await this.getOrMake(new URL(`test_caching_used_used.jisp`, ti.TEST_SRC_URL).href)).testInit()
    this.modUsedImported     = await (await this.getOrMake(new URL(`test_caching_used_imported.jisp`, ti.TEST_SRC_URL).href)).testInit()
    this.modImported         = await (await this.getOrMake(new URL(`test_caching_imported.jisp`, ti.TEST_SRC_URL).href)).testInit()
    this.modImportedMjs      = await (await this.getOrMake(new URL(`test_caching_imported.mjs`, ti.TEST_SRC_URL).href)).testInit()
    this.modImportedUsed     = await (await this.getOrMake(new URL(`test_caching_imported_used.jisp`, ti.TEST_SRC_URL).href)).testInit()
    this.modImportedImported = await (await this.getOrMake(new URL(`test_caching_imported_imported.jisp`, ti.TEST_SRC_URL).href)).testInit()
    return this
  }
}

function reinitModules() {return ctx[c.symModules] = new TestModules()}

function testModuleDeps(mod, src, tar) {
  t.eq(c.optToArr(mod.srcDeps), src?.map(toPk), `source dependencies`)
  t.eq(c.optToArr(mod.tarDeps), tar?.map(toPk), `target dependencies`)
}

function toPk(val) {return c.reqValidStr(val.pk())}

function testAllModuleDeps(mods) {
  const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = mods

  testModuleDeps(modMain, [modPrelude, modUsed, modUsedMjs], [modImported, modImportedMjs])
  testModuleDeps(modUsed, [modPrelude, modUsedUsed], [modUsedImported])
  testModuleDeps(modUsedUsed, undefined, undefined)
  testModuleDeps(modImported, [modPrelude, modImportedUsed], [modImportedImported])
  testModuleDeps(modImportedImported, undefined, undefined)

  // Tracking dependencies of pure-JS modules is out of scope for now.
  testModuleDeps(modPrelude, undefined, undefined)
}

await t.test(async function test_compilation_caching_and_reuse() {
  if (ti.WATCH) return
  await ti.clearTar()

  await t.test(async function test_module_graph_from_scratch() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = mods

    await modMain.testTarNone()
    await modPrelude.testTarSome()
    await modUsed.testTarNone()
    await modUsedMjs.testTarSome()
    await modUsedUsed.testTarNone()
    await modUsedImported.testTarNone()
    await modImported.testTarNone()
    await modImportedMjs.testTarSome()
    await modImportedUsed.testTarNone()
    await modImportedImported.testTarNone()

    await modMain.testOutdated()
    await modPrelude.testUpToDate()
    await modUsed.testOutdated()
    await modUsedMjs.testUpToDate()
    await modUsedUsed.testOutdated()
    await modUsedImported.testOutdated()
    await modImported.testOutdated()
    await modImportedMjs.testUpToDate()
    await modImportedUsed.testOutdated()
    await modImportedImported.testOutdated()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testRemade()
    await modPrelude.testNotRemade()
    await modUsed.testRemade()
    await modUsedMjs.testNotRemade()
    await modUsedUsed.testRemade()
    await modUsedImported.testRemade()
    await modImported.testRemade()
    await modImportedMjs.testNotRemade()
    await modImportedUsed.testRemade()
    await modImportedImported.testRemade()
  })

  await t.test(async function test_unchanged() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = mods

    await modMain.testUpToDate()
    await modPrelude.testUpToDate()
    await modUsed.testUpToDate()
    await modUsedMjs.testUpToDate()
    await modUsedUsed.testUpToDate()
    await modUsedImported.testUpToDate()
    await modImported.testUpToDate()
    await modImportedMjs.testUpToDate()
    await modImportedUsed.testUpToDate()
    await modImportedImported.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testNotRemade()
    await modPrelude.testNotRemade()
    await modUsed.testNotRemade()
    await modUsedMjs.testNotRemade()
    await modUsedUsed.testNotRemade()
    await modUsedImported.testNotRemade()
    await modImported.testNotRemade()
    await modImportedMjs.testNotRemade()
    await modImportedUsed.testNotRemade()
    await modImportedImported.testNotRemade()
  })

  await t.test(async function test_touch_main() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = mods

    await modMain.testTouch()

    await modMain.testOutdated()
    await modPrelude.testUpToDate()
    await modUsed.testUpToDate()
    await modUsedMjs.testUpToDate()
    await modUsedUsed.testUpToDate()
    await modUsedImported.testUpToDate()
    await modImported.testUpToDate()
    await modImportedMjs.testUpToDate()
    await modImportedUsed.testUpToDate()
    await modImportedImported.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testRemade()
    await modPrelude.testNotRemade()
    await modUsed.testNotRemade()
    await modUsedMjs.testNotRemade()
    await modUsedUsed.testNotRemade()
    await modUsedImported.testNotRemade()
    await modImported.testNotRemade()
    await modImportedMjs.testNotRemade()
    await modImportedUsed.testNotRemade()
    await modImportedImported.testNotRemade()
  })

  await t.test(async function test_touch_used() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = mods

    await modUsed.testTouch()

    await modMain.testOutdated()
    await modPrelude.testUpToDate()
    await modUsed.testOutdated()
    await modUsedMjs.testUpToDate()
    await modUsedUsed.testUpToDate()
    await modUsedImported.testUpToDate()
    await modImported.testUpToDate()
    await modImportedMjs.testUpToDate()
    await modImportedUsed.testUpToDate()
    await modImportedImported.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testRemade()
    await modPrelude.testNotRemade()
    await modUsed.testRemade()
    await modUsedMjs.testNotRemade()
    await modUsedUsed.testNotRemade()
    await modUsedImported.testNotRemade()
    await modImported.testNotRemade()
    await modImportedMjs.testNotRemade()
    await modImportedUsed.testNotRemade()
    await modImportedImported.testNotRemade()
  })

  await t.test(async function test_touch_used_mjs() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = mods

    await modUsedMjs.testTouch()

    await modMain.testOutdated()
    await modPrelude.testUpToDate()
    await modUsed.testUpToDate()
    await modUsedMjs.testUpToDate()
    await modUsedUsed.testUpToDate()
    await modUsedImported.testUpToDate()
    await modImported.testUpToDate()
    await modImportedMjs.testUpToDate()
    await modImportedUsed.testUpToDate()
    await modImportedImported.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testRemade()
    await modPrelude.testNotRemade()
    await modUsed.testNotRemade()
    await modUsedMjs.testNotRemade()
    await modUsedUsed.testNotRemade()
    await modUsedImported.testNotRemade()
    await modImported.testNotRemade()
    await modImportedMjs.testNotRemade()
    await modImportedUsed.testNotRemade()
    await modImportedImported.testNotRemade()
  })

  await t.test(async function test_touch_used_used() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = mods

    await modUsedUsed.testTouch()

    await modMain.testOutdated()
    await modPrelude.testUpToDate()
    await modUsed.testOutdated()
    await modUsedMjs.testUpToDate()
    await modUsedUsed.testOutdated()
    await modUsedImported.testUpToDate()
    await modImported.testUpToDate()
    await modImportedMjs.testUpToDate()
    await modImportedUsed.testUpToDate()
    await modImportedImported.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testRemade()
    await modPrelude.testNotRemade()
    await modUsed.testRemade()
    await modUsedMjs.testNotRemade()
    await modUsedUsed.testRemade()
    await modUsedImported.testNotRemade()
    await modImported.testNotRemade()
    await modImportedMjs.testNotRemade()
    await modImportedUsed.testNotRemade()
    await modImportedImported.testNotRemade()
  })

  await t.test(async function test_touch_used_imported() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = mods

    await modUsedImported.testTouch()

    await modMain.testOutdated()
    await modPrelude.testUpToDate()
    await modUsed.testUpToDate()
    await modUsedMjs.testUpToDate()
    await modUsedUsed.testUpToDate()
    await modUsedImported.testOutdated()
    await modImported.testUpToDate()
    await modImportedMjs.testUpToDate()
    await modImportedUsed.testUpToDate()
    await modImportedImported.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testRemade()
    await modPrelude.testNotRemade()
    await modUsed.testNotRemade()
    await modUsedMjs.testNotRemade()
    await modUsedUsed.testNotRemade()
    await modUsedImported.testRemade()
    await modImported.testNotRemade()
    await modImportedMjs.testNotRemade()
    await modImportedUsed.testNotRemade()
    await modImportedImported.testNotRemade()
  })

  await t.test(async function test_touch_imported() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = mods

    await modImported.testTouch()

    await modMain.testUpToDate()
    await modPrelude.testUpToDate()
    await modUsed.testUpToDate()
    await modUsedMjs.testUpToDate()
    await modUsedUsed.testUpToDate()
    await modUsedImported.testUpToDate()
    await modImported.testOutdated()
    await modImportedMjs.testUpToDate()
    await modImportedUsed.testUpToDate()
    await modImportedImported.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testNotRemade()
    await modPrelude.testNotRemade()
    await modUsed.testNotRemade()
    await modUsedMjs.testNotRemade()
    await modUsedUsed.testNotRemade()
    await modUsedImported.testNotRemade()
    await modImported.testRemade()
    await modImportedMjs.testNotRemade()
    await modImportedUsed.testNotRemade()
    await modImportedImported.testNotRemade()
  })

  await t.test(async function test_touch_imported() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = mods

    await modImportedMjs.testTouch()

    await modMain.testUpToDate()
    await modPrelude.testUpToDate()
    await modUsed.testUpToDate()
    await modUsedMjs.testUpToDate()
    await modUsedUsed.testUpToDate()
    await modUsedImported.testUpToDate()
    await modImported.testUpToDate()
    await modImportedMjs.testUpToDate()
    await modImportedUsed.testUpToDate()
    await modImportedImported.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testNotRemade()
    await modPrelude.testNotRemade()
    await modUsed.testNotRemade()
    await modUsedMjs.testNotRemade()
    await modUsedUsed.testNotRemade()
    await modUsedImported.testNotRemade()
    await modImported.testNotRemade()
    await modImportedMjs.testNotRemade()
    await modImportedUsed.testNotRemade()
    await modImportedImported.testNotRemade()
  })

  await t.test(async function test_touch_imported_used() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = mods

    await modImportedUsed.testTouch()

    await modMain.testUpToDate()
    await modPrelude.testUpToDate()
    await modUsed.testUpToDate()
    await modUsedMjs.testUpToDate()
    await modUsedUsed.testUpToDate()
    await modUsedImported.testUpToDate()
    await modImported.testOutdated()
    await modImportedMjs.testUpToDate()
    await modImportedUsed.testOutdated()
    await modImportedImported.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testNotRemade()
    await modPrelude.testNotRemade()
    await modUsed.testNotRemade()
    await modUsedMjs.testNotRemade()
    await modUsedUsed.testNotRemade()
    await modUsedImported.testNotRemade()
    await modImported.testRemade()
    await modImportedMjs.testNotRemade()
    await modImportedUsed.testRemade()
    await modImportedImported.testNotRemade()
  })

  await t.test(async function test_touch_imported_imported() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsed, modUsedMjs, modUsedUsed, modUsedImported, modImported, modImportedMjs, modImportedUsed, modImportedImported} = mods

    await modImportedImported.testTouch()

    await modMain.testUpToDate()
    await modPrelude.testUpToDate()
    await modUsed.testUpToDate()
    await modUsedMjs.testUpToDate()
    await modUsedUsed.testUpToDate()
    await modUsedImported.testUpToDate()
    await modImported.testUpToDate()
    await modImportedMjs.testUpToDate()
    await modImportedUsed.testUpToDate()
    await modImportedImported.testOutdated()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testNotRemade()
    await modPrelude.testNotRemade()
    await modUsed.testNotRemade()
    await modUsedMjs.testNotRemade()
    await modUsedUsed.testNotRemade()
    await modUsedImported.testNotRemade()
    await modImported.testNotRemade()
    await modImportedMjs.testNotRemade()
    await modImportedUsed.testNotRemade()
    await modImportedImported.testRemade()
  })
})

ctx[c.symModules] = modsPrev

if (import.meta.main) ti.flush()

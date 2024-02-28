import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'
import * as p from '../js/prelude.mjs'

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

const ctx = ti.testRootCtx()
const fs = c.ctxReqFs(ctx)
ctx.use = p.use

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
    t.is(tar, (await this.compiled(ctx, src)), ti.inspect(this))
  }
}

class TestModules extends c.Modules {
  get Module() {return TestModule}

  async testInit() {
    this.modMain         = await (await this.getOrMake(new URL(`test_caching_main.jisp`, ti.TEST_SRC_URL).href)).testInit()
    this.modPrelude      = await (await this.getOrMake(new URL(`../js/prelude.mjs`, import.meta.url).href)).testInit()
    this.modUsemac       = await (await this.getOrMake(new URL(`test_caching_usemac.jisp`, ti.TEST_SRC_URL).href)).testInit()
    this.modUsemacMjs    = await (await this.getOrMake(new URL(`test_caching_usemac.mjs`, ti.TEST_SRC_URL).href)).testInit()
    this.modUsemacUsemac = await (await this.getOrMake(new URL(`test_caching_usemac_usemac.jisp`, ti.TEST_SRC_URL).href)).testInit()
    this.modUsemacUse    = await (await this.getOrMake(new URL(`test_caching_usemac_use.jisp`, ti.TEST_SRC_URL).href)).testInit()
    this.modUse          = await (await this.getOrMake(new URL(`test_caching_use.jisp`, ti.TEST_SRC_URL).href)).testInit()
    this.modUseMjs       = await (await this.getOrMake(new URL(`test_caching_use.mjs`, ti.TEST_SRC_URL).href)).testInit()
    this.modUseUsemac    = await (await this.getOrMake(new URL(`test_caching_use_usemac.jisp`, ti.TEST_SRC_URL).href)).testInit()
    this.modUseUse       = await (await this.getOrMake(new URL(`test_caching_use_use.jisp`, ti.TEST_SRC_URL).href)).testInit()
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
  const {modMain, modPrelude, modUsemac, modUsemacMjs, modUsemacUsemac, modUsemacUse, modUse, modUseMjs, modUseUsemac, modUseUse} = mods

  testModuleDeps(modMain, [modPrelude, modUsemac, modUsemacMjs], [modUse, modUseMjs])
  testModuleDeps(modUsemac, [modUsemacUsemac], [modUsemacUse])
  testModuleDeps(modUsemacUsemac, undefined, undefined)
  testModuleDeps(modUse, [modUseUsemac], [modUseUse])
  testModuleDeps(modUseUse, undefined, undefined)

  // Tracking dependencies of pure-JS modules is out of scope for now.
  testModuleDeps(modPrelude, undefined, undefined)
}

await t.test(async function test_compilation_caching_and_reuse() {
  if (ti.WATCH) return
  await ti.clearTar()

  await t.test(async function test_module_graph_from_scratch() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsemac, modUsemacMjs, modUsemacUsemac, modUsemacUse, modUse, modUseMjs, modUseUsemac, modUseUse} = mods

    await modMain.testTarNone()
    await modPrelude.testTarSome()
    await modUsemac.testTarNone()
    await modUsemacMjs.testTarSome()
    await modUsemacUsemac.testTarNone()
    await modUsemacUse.testTarNone()
    await modUse.testTarNone()
    await modUseMjs.testTarSome()
    await modUseUsemac.testTarNone()
    await modUseUse.testTarNone()

    await modMain.testOutdated()
    await modPrelude.testUpToDate()
    await modUsemac.testOutdated()
    await modUsemacMjs.testUpToDate()
    await modUsemacUsemac.testOutdated()
    await modUsemacUse.testOutdated()
    await modUse.testOutdated()
    await modUseMjs.testUpToDate()
    await modUseUsemac.testOutdated()
    await modUseUse.testOutdated()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testRemade()
    await modPrelude.testNotRemade()
    await modUsemac.testRemade()
    await modUsemacMjs.testNotRemade()
    await modUsemacUsemac.testRemade()
    await modUsemacUse.testRemade()
    await modUse.testRemade()
    await modUseMjs.testNotRemade()
    await modUseUsemac.testRemade()
    await modUseUse.testRemade()
  })

  await t.test(async function test_unchanged() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsemac, modUsemacMjs, modUsemacUsemac, modUsemacUse, modUse, modUseMjs, modUseUsemac, modUseUse} = mods

    await modMain.testUpToDate()
    await modPrelude.testUpToDate()
    await modUsemac.testUpToDate()
    await modUsemacMjs.testUpToDate()
    await modUsemacUsemac.testUpToDate()
    await modUsemacUse.testUpToDate()
    await modUse.testUpToDate()
    await modUseMjs.testUpToDate()
    await modUseUsemac.testUpToDate()
    await modUseUse.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testNotRemade()
    await modPrelude.testNotRemade()
    await modUsemac.testNotRemade()
    await modUsemacMjs.testNotRemade()
    await modUsemacUsemac.testNotRemade()
    await modUsemacUse.testNotRemade()
    await modUse.testNotRemade()
    await modUseMjs.testNotRemade()
    await modUseUsemac.testNotRemade()
    await modUseUse.testNotRemade()
  })

  await t.test(async function test_touch_main() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsemac, modUsemacMjs, modUsemacUsemac, modUsemacUse, modUse, modUseMjs, modUseUsemac, modUseUse} = mods

    await modMain.testTouch()

    await modMain.testOutdated()
    await modPrelude.testUpToDate()
    await modUsemac.testUpToDate()
    await modUsemacMjs.testUpToDate()
    await modUsemacUsemac.testUpToDate()
    await modUsemacUse.testUpToDate()
    await modUse.testUpToDate()
    await modUseMjs.testUpToDate()
    await modUseUsemac.testUpToDate()
    await modUseUse.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testRemade()
    await modPrelude.testNotRemade()
    await modUsemac.testNotRemade()
    await modUsemacMjs.testNotRemade()
    await modUsemacUsemac.testNotRemade()
    await modUsemacUse.testNotRemade()
    await modUse.testNotRemade()
    await modUseMjs.testNotRemade()
    await modUseUsemac.testNotRemade()
    await modUseUse.testNotRemade()
  })

  await t.test(async function test_touch_usemac() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsemac, modUsemacMjs, modUsemacUsemac, modUsemacUse, modUse, modUseMjs, modUseUsemac, modUseUse} = mods

    await modUsemac.testTouch()

    await modMain.testOutdated()
    await modPrelude.testUpToDate()
    await modUsemac.testOutdated()
    await modUsemacMjs.testUpToDate()
    await modUsemacUsemac.testUpToDate()
    await modUsemacUse.testUpToDate()
    await modUse.testUpToDate()
    await modUseMjs.testUpToDate()
    await modUseUsemac.testUpToDate()
    await modUseUse.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testRemade()
    await modPrelude.testNotRemade()
    await modUsemac.testRemade()
    await modUsemacMjs.testNotRemade()
    await modUsemacUsemac.testNotRemade()
    await modUsemacUse.testNotRemade()
    await modUse.testNotRemade()
    await modUseMjs.testNotRemade()
    await modUseUsemac.testNotRemade()
    await modUseUse.testNotRemade()
  })

  await t.test(async function test_touch_usemac_mjs() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsemac, modUsemacMjs, modUsemacUsemac, modUsemacUse, modUse, modUseMjs, modUseUsemac, modUseUse} = mods

    await modUsemacMjs.testTouch()

    await modMain.testOutdated()
    await modPrelude.testUpToDate()
    await modUsemac.testUpToDate()
    await modUsemacMjs.testUpToDate()
    await modUsemacUsemac.testUpToDate()
    await modUsemacUse.testUpToDate()
    await modUse.testUpToDate()
    await modUseMjs.testUpToDate()
    await modUseUsemac.testUpToDate()
    await modUseUse.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testRemade()
    await modPrelude.testNotRemade()
    await modUsemac.testNotRemade()
    await modUsemacMjs.testNotRemade()
    await modUsemacUsemac.testNotRemade()
    await modUsemacUse.testNotRemade()
    await modUse.testNotRemade()
    await modUseMjs.testNotRemade()
    await modUseUsemac.testNotRemade()
    await modUseUse.testNotRemade()
  })

  await t.test(async function test_touch_usemac_usemac() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsemac, modUsemacMjs, modUsemacUsemac, modUsemacUse, modUse, modUseMjs, modUseUsemac, modUseUse} = mods

    await modUsemacUsemac.testTouch()

    await modMain.testOutdated()
    await modPrelude.testUpToDate()
    await modUsemac.testOutdated()
    await modUsemacMjs.testUpToDate()
    await modUsemacUsemac.testOutdated()
    await modUsemacUse.testUpToDate()
    await modUse.testUpToDate()
    await modUseMjs.testUpToDate()
    await modUseUsemac.testUpToDate()
    await modUseUse.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testRemade()
    await modPrelude.testNotRemade()
    await modUsemac.testRemade()
    await modUsemacMjs.testNotRemade()
    await modUsemacUsemac.testRemade()
    await modUsemacUse.testNotRemade()
    await modUse.testNotRemade()
    await modUseMjs.testNotRemade()
    await modUseUsemac.testNotRemade()
    await modUseUse.testNotRemade()
  })

  await t.test(async function test_touch_usemac_use() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsemac, modUsemacMjs, modUsemacUsemac, modUsemacUse, modUse, modUseMjs, modUseUsemac, modUseUse} = mods

    await modUsemacUse.testTouch()

    await modMain.testOutdated()
    await modPrelude.testUpToDate()
    await modUsemac.testUpToDate()
    await modUsemacMjs.testUpToDate()
    await modUsemacUsemac.testUpToDate()
    await modUsemacUse.testOutdated()
    await modUse.testUpToDate()
    await modUseMjs.testUpToDate()
    await modUseUsemac.testUpToDate()
    await modUseUse.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testRemade()
    await modPrelude.testNotRemade()
    await modUsemac.testNotRemade()
    await modUsemacMjs.testNotRemade()
    await modUsemacUsemac.testNotRemade()
    await modUsemacUse.testRemade()
    await modUse.testNotRemade()
    await modUseMjs.testNotRemade()
    await modUseUsemac.testNotRemade()
    await modUseUse.testNotRemade()
  })

  await t.test(async function test_touch_use() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsemac, modUsemacMjs, modUsemacUsemac, modUsemacUse, modUse, modUseMjs, modUseUsemac, modUseUse} = mods

    await modUse.testTouch()

    await modMain.testUpToDate()
    await modPrelude.testUpToDate()
    await modUsemac.testUpToDate()
    await modUsemacMjs.testUpToDate()
    await modUsemacUsemac.testUpToDate()
    await modUsemacUse.testUpToDate()
    await modUse.testOutdated()
    await modUseMjs.testUpToDate()
    await modUseUsemac.testUpToDate()
    await modUseUse.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testNotRemade()
    await modPrelude.testNotRemade()
    await modUsemac.testNotRemade()
    await modUsemacMjs.testNotRemade()
    await modUsemacUsemac.testNotRemade()
    await modUsemacUse.testNotRemade()
    await modUse.testRemade()
    await modUseMjs.testNotRemade()
    await modUseUsemac.testNotRemade()
    await modUseUse.testNotRemade()
  })

  await t.test(async function test_touch_use() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsemac, modUsemacMjs, modUsemacUsemac, modUsemacUse, modUse, modUseMjs, modUseUsemac, modUseUse} = mods

    await modUseMjs.testTouch()

    await modMain.testUpToDate()
    await modPrelude.testUpToDate()
    await modUsemac.testUpToDate()
    await modUsemacMjs.testUpToDate()
    await modUsemacUsemac.testUpToDate()
    await modUsemacUse.testUpToDate()
    await modUse.testUpToDate()
    await modUseMjs.testUpToDate()
    await modUseUsemac.testUpToDate()
    await modUseUse.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testNotRemade()
    await modPrelude.testNotRemade()
    await modUsemac.testNotRemade()
    await modUsemacMjs.testNotRemade()
    await modUsemacUsemac.testNotRemade()
    await modUsemacUse.testNotRemade()
    await modUse.testNotRemade()
    await modUseMjs.testNotRemade()
    await modUseUsemac.testNotRemade()
    await modUseUse.testNotRemade()
  })

  await t.test(async function test_touch_use_usemac() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsemac, modUsemacMjs, modUsemacUsemac, modUsemacUse, modUse, modUseMjs, modUseUsemac, modUseUse} = mods

    await modUseUsemac.testTouch()

    await modMain.testUpToDate()
    await modPrelude.testUpToDate()
    await modUsemac.testUpToDate()
    await modUsemacMjs.testUpToDate()
    await modUsemacUsemac.testUpToDate()
    await modUsemacUse.testUpToDate()
    await modUse.testOutdated()
    await modUseMjs.testUpToDate()
    await modUseUsemac.testOutdated()
    await modUseUse.testUpToDate()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testNotRemade()
    await modPrelude.testNotRemade()
    await modUsemac.testNotRemade()
    await modUsemacMjs.testNotRemade()
    await modUsemacUsemac.testNotRemade()
    await modUsemacUse.testNotRemade()
    await modUse.testRemade()
    await modUseMjs.testNotRemade()
    await modUseUsemac.testRemade()
    await modUseUse.testNotRemade()
  })

  await t.test(async function test_touch_use_use() {
    const mods = await reinitModules().testInit()
    const {modMain, modPrelude, modUsemac, modUsemacMjs, modUsemacUsemac, modUsemacUse, modUse, modUseMjs, modUseUsemac, modUseUse} = mods

    await modUseUse.testTouch()

    await modMain.testUpToDate()
    await modPrelude.testUpToDate()
    await modUsemac.testUpToDate()
    await modUsemacMjs.testUpToDate()
    await modUsemacUsemac.testUpToDate()
    await modUsemacUse.testUpToDate()
    await modUse.testUpToDate()
    await modUseMjs.testUpToDate()
    await modUseUsemac.testUpToDate()
    await modUseUse.testOutdated()

    await modMain.ready(ctx)
    testAllModuleDeps(mods)

    await modMain.testNotRemade()
    await modPrelude.testNotRemade()
    await modUsemac.testNotRemade()
    await modUsemacMjs.testNotRemade()
    await modUsemacUsemac.testNotRemade()
    await modUsemacUse.testNotRemade()
    await modUse.testNotRemade()
    await modUseMjs.testNotRemade()
    await modUseUsemac.testNotRemade()
    await modUseUse.testRemade()
  })
})

ctx[c.symModules] = modsPrev

if (import.meta.main) ti.flush()

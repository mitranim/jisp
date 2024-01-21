import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

const fs = c.ctxReqFs(c.ctxGlobal)
const tarBase = c.ctxReqTar(c.ctxGlobal)
const mods = c.ctxReqModules(c.ctxGlobal)

t.test(function test_modules_invalid() {
  function fail(src, msg) {return ti.fail(() => mods.getInit(src), msg)}

  fail(`./`,              `expected canonical module path, got "./"`)
  fail(`./one`,           `expected canonical module path, got "./one"`)
  fail(`./one/`,          `expected canonical module path, got "./one/"`)
  fail(`./one/two`,       `expected canonical module path, got "./one/two"`)
  fail(`./one/two.mjs`,   `expected canonical module path, got "./one/two.mjs"`)
  fail(`./one/two.jisp`,  `expected canonical module path, got "./one/two.jisp"`)
  fail(`/one`,            `expected canonical module path, got "/one"`)
  fail(`one/`,            `expected canonical module path, got "one/"`)
  fail(`/one/`,           `expected canonical module path, got "/one/"`)
  fail(`one/two/`,        `expected canonical module path, got "one/two/"`)
  fail(`/one/two/`,       `expected canonical module path, got "/one/two/"`)
  fail(`/one/two.mjs`,    `expected canonical module path, got "/one/two.mjs"`)
  fail(`/one/two.jisp`,   `expected canonical module path, got "/one/two.jisp"`)
  fail(`one?`,            `expected canonical module path, got "one?"`)
  fail(`?one`,            `expected canonical module path, got "?one"`)
  fail(`one?two`,         `expected canonical module path, got "one?two"`)
  fail(`one#`,            `expected canonical module path, got "one#"`)
  fail(`#one`,            `expected canonical module path, got "#one"`)
  fail(`one#two`,         `expected canonical module path, got "one#two"`)
  fail(`file:///one?two`, `expected canonical module path, got "file:///one?two"`)
  fail(`https://one?two`, `expected canonical module path, got "https://one?two"`)
})

t.test(function test_module_implicit_relative() {
  const path = `one/two`
  const mod = mods.getInit(path)

  t.is(mod,         mods.getInit(path))
  t.is(mod.pk(),    path)
  t.is(mod.srcPath, path)
  t.is(mod.tarPath, path)
  t.no(mod.isJispModule())
})

await t.test(async function test_module_non_jisp_unreachable() {
  const path = `one://two/three.four`
  const mod = mods.getInit(path)

  t.is(mod,         mods.getInit(path))
  t.is(mod.pk(),    path)
  t.is(mod.srcPath, path)
  t.is(mod.tarPath, path)
  t.no(mod.isJispModule())

  t.is((await mod.timeMax()), 0)
  await mod.ready()
  t.is((await mod.timeMax()), 0)
})

await t.test(async function test_module_non_jisp_reachable_missing() {
  const path = new URL(`missing_file.mjs`, import.meta.url).href
  const mod = mods.getInit(path)

  t.is(mod,         mods.getInit(path))
  t.is(mod.pk(),    path)
  t.is(mod.srcPath, path)
  t.is(mod.tarPath, path)
  t.no(mod.isJispModule())

  t.is((await mod.timeMax()), undefined)
  await mod.ready()
  t.is((await mod.timeMax()), undefined)
})

await t.test(async function test_module_non_jisp_reachable_existing() {
  const path = import.meta.url
  const mod = mods.getInit(path)

  t.is(mod,         mods.getInit(path))
  t.is(mod.pk(),    path)
  t.is(mod.srcPath, path)
  t.is(mod.tarPath, path)
  t.no(mod.isJispModule())

  const time = await mod.timeMax()
  t.is(time, await fs.timestamp(new URL(path)))
  ti.reqFinPos(time)
})

await t.test(async function test_module_jisp_reachable_missing() {
  const url = new URL(`missing_file.jisp`, import.meta.url)
  const path = url.href
  const mod = await mods.getInit(path)

  t.is(mod.pk(), path)
  t.is(mod.srcPath, path)
  t.ok(mod.isJispModule())

  await ti.fail(async () => mod.ready(), `No such file or directory (os error 2), stat '${url.pathname}'`)
})

ti.clearTar()

await t.test(async function test_module_jisp_without_dependencies() {
  const path = new URL(`../test_files/test_builtins.jisp`, import.meta.url).href
  const mod = await mods.getInit(path)
  const hash = await c.strHash(`test_files:.tmp_test`)
  const tar = c.pathJoin(tarBase, hash, `test_builtins.mjs`)

  t.is(mod,         mods.getInit(path))
  t.is(mod.pk(),    path)
  t.is(mod.srcPath, path)
  t.is(mod.tarPath, tar)
  t.ok(mod.isJispModule())

  t.no((await mod.isUpToDate()))
  ti.reqFinPos(await mod.optSrcTime())
  t.is((await mod.optTarTime()), undefined)
  t.is((await mod.timeMax()), undefined)

  await mod.ready()

  t.ok((await mod.isUpToDate()))
  ti.reqFinPos(await mod.optSrcTime())
  ti.reqFinPos(await mod.optTarTime())
  ti.reqFinPos(await mod.timeMax())
  t.is((await mod.timeMax()), (await mod.optTarTime()))

  t.is(
    (await fs.read(new URL(tar))),
    `123n;
123.456;
"string_backtick";
"string_double";
10(20(30, 40(50, 60)))`,
  )

  t.eq(
    JSON.parse(await fs.read(c.toMetaUrl(mod.tarPath))),
    {
      srcPath: mod.srcPath,
      tarPath: mod.tarPath,
    },
  )
})

await t.test(async function test_module_init_from_meta() {
  const srcPath = new URL(`missing_file.jisp`, import.meta.url).href
  const tarPath = new URL(`missing_file.mjs`, ti.TEST_TAR_URL).href
  const metaUrl = c.toMetaUrl(tarPath)

  await fs.write(metaUrl, JSON.stringify({
    srcPath,
    tarPath,
    srcDeps: [`10`, `20`, `30`],
    tarDeps: [`40`, `50`, `60`],
    srcTime: 123, // Should be ignored when initing module.
    tarTime: 456, // Should be ignored when initing module.
  }))

  const mod = new c.Module()
  mod.srcPath = srcPath
  mod.tarPath = tarPath

  t.ok(mod.isJispModule())
  await mod.init()

  t.is(mod.srcPath, srcPath)
  t.is(mod.tarPath, tarPath)
  t.eq(mod.srcDeps, new Set([`10`, `20`, `30`])),
  t.eq(mod.tarDeps, new Set([`40`, `50`, `60`])),
  t.is(mod.srcTime, undefined)
  t.is(mod.tarTime, undefined)
})

if (import.meta.main) ti.flush()

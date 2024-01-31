import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'
import * as p from '../js/prelude.mjs'

function makeCtx() {
  const ctx = c.rootCtx()
  ctx[c.symFs] = ti.fsReadOnly
  ctx[c.symTar] = ti.TEST_TAR_URL.href
  return ctx
}

t.test(function test_modules_invalid() {
  const ctx = makeCtx()
  const mods = c.ctxReqModules(ctx)

  function fail(src, msg) {return ti.fail(() => mods.getOrMake(src), msg)}

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
  const ctx = makeCtx()
  const mods = c.ctxReqModules(ctx)
  const path = `one/two`
  const mod = mods.getOrMake(path)

  t.is(mod,         mods.getOrMake(path))
  t.is(mod.pk(),    path)
  t.is(mod.srcPath, path)
  t.is(mod.tarPath, undefined)
  mod.init(ctx)
  t.is(mod.tarPath, path)
  t.no(mod.isJispModule())
})

await t.test(async function test_module_non_jisp_unreachable() {
  const ctx = makeCtx()
  const mods = c.ctxReqModules(ctx)
  const path = `one://two/three.four`
  const mod = mods.getOrMake(path)

  t.is(mod,         mods.getOrMake(path))
  t.is(mod.pk(),    path)
  t.is(mod.srcPath, path)
  t.is(mod.tarPath, undefined)
  mod.init(ctx)
  t.is(mod.tarPath, path)
  t.no(mod.isJispModule())

  t.is((await mod.timeMax(ctx)), 0)
  await mod.ready(ctx)
  t.is((await mod.timeMax(ctx)), 0)
})

await t.test(async function test_module_non_jisp_reachable_missing() {
  const ctx = makeCtx()
  const mods = c.ctxReqModules(ctx)
  const path = new URL(`missing_file.mjs`, import.meta.url).href
  const mod = mods.getOrMake(path)

  t.is(mod,         mods.getOrMake(path))
  t.is(mod.pk(),    path)
  t.is(mod.srcPath, path)
  t.is(mod.tarPath, undefined)
  mod.init(ctx)
  t.is(mod.tarPath, path)
  t.no(mod.isJispModule())

  t.is((await mod.timeMax(ctx)), 0)
  await mod.ready(ctx)
  t.is((await mod.timeMax(ctx)), 0)
})

await t.test(async function test_module_non_jisp_reachable_existing() {
  const ctx = makeCtx()
  const mods = c.ctxReqModules(ctx)
  const path = import.meta.url
  const mod = mods.getOrMake(path)

  t.is(mod,         mods.getOrMake(path))
  t.is(mod.pk(),    path)
  t.is(mod.srcPath, path)
  t.is(mod.tarPath, undefined)
  mod.init(ctx)
  t.is(mod.tarPath, path)
  t.no(mod.isJispModule())

  const time = await mod.timeMax(ctx)
  t.is(time, await ti.fsReadOnly.timestamp(new URL(path)))
  ti.reqFinPos(time)
})

await t.test(async function test_module_jisp_reachable_missing() {
  const ctx = makeCtx()
  const mods = c.ctxReqModules(ctx)
  const url = new URL(`missing_file.jisp`, import.meta.url)
  const path = url.href
  const mod = await mods.getOrMake(path)

  t.is(mod.pk(), path)
  t.is(mod.srcPath, path)
  t.ok(mod.isJispModule())

  await ti.fail(async () => mod.ready(ctx), `No such file or directory (os error 2), stat '${url.pathname}'`)
})

await t.test(async function test_module_jisp_without_dependencies() {
  await ti.clearTar()

  const ctx = makeCtx()
  ctx[c.symFs] = ti.fsReadWrite

  const mods = c.ctxReqModules(ctx)
  const path = new URL(`../test_files/test_builtins.jisp`, import.meta.url).href
  const mod = await mods.getOrMake(path)
  const tar = new URL(`1/test_files/test_builtins.mjs`, ti.TEST_TAR_URL).href

  t.is(mod,         mods.getOrMake(path))
  t.is(mod.pk(),    path)
  t.is(mod.srcPath, path)
  t.is(mod.tarPath, undefined)
  mod.init(ctx)
  t.is(mod.tarPath, tar)
  t.ok(mod.isJispModule())

  t.no((await mod.isUpToDate(ctx)))
  ti.reqFinPos(await mod.optSrcTime(ctx))
  t.is((await mod.optTarTime(ctx)), undefined)
  t.is((await mod.timeMax(ctx)), undefined)

  await mod.ready(ctx)

  t.ok((await mod.isUpToDate(ctx)))
  ti.reqFinPos(await mod.optSrcTime(ctx))
  ti.reqFinPos(await mod.optTarTime(ctx))
  ti.reqFinPos(await mod.timeMax(ctx))
  t.is((await mod.timeMax(ctx)), (await mod.optTarTime(ctx)))

  t.is(
    (await ti.fsReadOnly.read(new URL(tar))),
    `123n;
123.456;
"string_backtick";
"string_double";
10(20(30, 40(50, 60)))`,
  )

  t.eq(
    JSON.parse(await ti.fsReadOnly.read(c.toMetaUrl(mod.tarPath))),
    {
      srcPath: mod.srcPath,
      tarPath: mod.tarPath,
    },
  )
})

await t.test(async function test_module_init_from_meta() {
  const ctx = makeCtx()
  const mods = c.ctxReqModules(ctx)
  const srcPath = new URL(`missing_file.jisp`, import.meta.url).href
  const tarPath = new URL(`missing_file.mjs`, ti.TEST_TAR_URL).href
  const metaUrl = c.toMetaUrl(tarPath)

  await ti.fsReadWrite.write(metaUrl, JSON.stringify({
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
  await mod.initAsync(ctx)

  t.is(mod.srcPath, srcPath)
  t.is(mod.tarPath, tarPath)
  t.eq(mod.srcDeps, new Set([`10`, `20`, `30`])),
  t.eq(mod.tarDeps, new Set([`40`, `50`, `60`])),
  t.is(mod.srcTime, undefined)
  t.is(mod.tarTime, undefined)
})

await t.test(async function test_module_context_inheritance() {
  const fs = new ti.PseudoFs()

  fs.set(`blob:/one.jisp`, c.joinLines(
    `[use "jisp:prelude.mjs" *]`,
    `[const someName 10]`,
    `[use "./two.jisp"]`,
  ))

  fs.set(`blob:/two.jisp`, `someName`)

  const ctx = c.rootCtx()
  ctx[c.symFs] = fs
  ctx.use = p.use

  const mods = c.ctxReqModules(ctx)
  const one = mods.getOrMake(`blob:/one.jisp`).init(ctx)

  /*
  This failure indicates that the module "two" either does not receive the
  context used by the module "one", or does not directly inherit from that
  context for the purpose of its own macroing and compilation. If we would
  directly inherit from the context of module "one" and use that for macroing
  the module "two", then the name `someName` would incorrectly appear to be in
  scope and the module would compile, but it would fail at JS runtime,
  producing an exception with a different error message. There would be a
  failure either way, but we want to avoid this during compilation, because
  this way the user receives better error messages.
  */
  await ti.fail(
    async () => one.ready(ctx),
    `missing declaration of "someName"

source node:

someName

module path:

blob:/two.jisp

source node context:

blob:/one.jisp:3:1

…
[use "./two.jisp"]
`)
})

if (import.meta.main) ti.flush()

import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'
import * as p from '../js/prelude.mjs'

function sym(val) {return Symbol.for(c.reqStr(val))}
function testNone(val) {t.eq(val, [])}

function makeCtx() {
  const ctx = c.rootCtx()
  ctx[c.symFs] = ti.fsReadWrite
  ctx[c.symTar] = ti.TEST_TAR_URL.href
  return ctx
}

const preludeUrl = new URL(`../js/prelude.mjs`, import.meta.url).href
const missingJsFileUrl = new URL(`missing.mjs`, import.meta.url).href
const missingJispFileSrcUrl = new URL(`missing.jisp`, ti.TEST_SRC_URL).href
const missingJispFileTarUrl = new URL(`missing.mjs`, ti.TEST_TAR_SUB_URL).href
const existingJsFileUrl = new URL(`test_simple_export.mjs`, ti.TEST_SRC_URL).href
const existingJispFileSrcUrl = new URL(`test_simple_export.jisp`, ti.TEST_SRC_URL).href
const existingJispFileTarUrl = new URL(`test_simple_export.mjs`, ti.TEST_TAR_SUB_URL).href
const missingJsUrl = `one://two.three/four.mjs`

await t.test(async function test_use_mixin() {
  const ctx = c.ctxWithModule(c.ctxWithMixin(makeCtx()))

  /*
  The "mixin" form of the `use` macro performs both a compile-time import
  and a runtime import. This particular failure is expected because an
  implicitly relative path requires an importmap entry, which is not present
  here.
  */
  await ti.fail(
    async () => p.use.call(ctx, `some_path`, sym(`*`)),
    `Relative import path "some_path" not prefixed with / or ./ or ../`,
  )

  const mix = c.ctxReqParentMixin(ctx)
  t.own(mix, {[c.symMixin]: undefined})
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined})

  const out = await p.use.call(ctx, existingJsFileUrl, sym(`*`))
  t.own(mix, {[c.symMixin]: undefined, one: mix.one, two: mix.two})
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined})

  t.is(out.compile(), `import ${JSON.stringify(existingJsFileUrl)}`)

  function ref(src) {
    t.is(c.compileNode(c.macroNode(ctx, sym(src))), src)
  }

  ref(`one`)
  t.is(out.compile(), `import {one} from ${JSON.stringify(existingJsFileUrl)}`)

  ref(`two`)
  t.is(out.compile(), `import {one, two} from ${JSON.stringify(existingJsFileUrl)}`)

  ref(`one`)
  ref(`two`)
  t.is(out.compile(), `import {one, two} from ${JSON.stringify(existingJsFileUrl)}`)
})

function compileUseAsync(src) {return `import(${JSON.stringify(src)})`}
function compileUseAnon(src) {return `import ` + JSON.stringify(src)}

function testUse(ctx, fun, compile) {
  /*
  We preserve these paths as-is because in the JS module system, paths which
  are implicitly relative (no scheme, no leading `.`, no leading `/`) are
  resolved by using an importmap. At the time of writing, our compiler does
  not support interacting with importmaps, so we treat such paths as absolute
  and reachable only at the runtime of the program.
  */
  t.is(fun.call(ctx, `some_name`).compile(),      compile(`some_name`))
  t.is(fun.call(ctx, `some_name.mjs`).compile(),  compile(`some_name.mjs`))
  t.is(fun.call(ctx, `some_name.jisp`).compile(), compile(`some_name.jisp`))

  t.is(ctx[c.symModule], undefined)

  /*
  When the import path is explicitly relative or explicitly absolute
  (Posix-style), we resolve it relatively to the source file. Once the
  current file is compiled and written to disk (if at all), the target file
  is typically in a different directory. This means the original relative
  path wouldn't work. This means such paths always need to be rewritten,
  which requires the context to have a current module with its own source and
  target paths.
  */

  function failMod(src) {
    return ti.fail(() => fun.call(ctx, src), `missing module in context`)
  }

  failMod(`/missing`)
  failMod(`/missing.mjs`)
  failMod(`/missing.jisp`)
  failMod(`./missing`)
  failMod(`./missing.mjs`)
  failMod(`./missing.jisp`)
  failMod(`../missing`)
  failMod(`../missing.mjs`)
  failMod(`../missing.jisp`)

  /*
  When we don't have a current module, we can still compile imports where the
  address is already a URL or can be resolved to a URL without consulting a
  current module. For non-Jisp files, we use the import address as-is. For Jisp
  modules, we convert the source URL into the target file URL by consulting the
  target directory specified in the context (which must be present). See the
  function `srcToTar`. For Jisp files, this is only meaningful when the URL has
  the same protocol as the target directory.
  */

  t.is(
    fun.call(ctx, `jisp:prelude.mjs`).compile(),
    compile(preludeUrl),
  )

  t.is(
    fun.call(ctx, `jisp:missing.mjs`).compile(),
    compile(new URL(`../js/missing.mjs`, import.meta.url).href),
  )

  t.is(
    fun.call(ctx, missingJsFileUrl).compile(),
    compile(missingJsFileUrl),
  )

  t.is(
    fun.call(ctx, existingJsFileUrl).compile(),
    compile(existingJsFileUrl),
  )

  t.is(
    fun.call(ctx, missingJispFileSrcUrl).compile(),
    compile(missingJispFileTarUrl),
  )

  t.is(
    fun.call(ctx, existingJispFileSrcUrl).compile(),
    compile(existingJispFileTarUrl),
  )

  t.is(fun.call(ctx, missingJsUrl).compile(), compile(missingJsUrl))

  /*
  When we don't have a current module, we can still compile imports where the
  address is already a URL or can be resolved to a URL without consulting a
  current module. For non-Jisp files, we use the import address as-is. For
  Jisp files, we must rewrite the source URL with a target URL based on the
  target directory configuration in the context (which must be present).
  */

  /*
  When we do have a current module, then we prefer to convert the import path
  to relative. More specifically, it's relative between the current module's
  target path and the imported module's target path.
  */

  ctx[c.symModule] = makeTestModule()

  t.is(
    fun.call(ctx, `./missing`).compile(),
    compile(`../../../test_files/missing`),
  )

  t.is(
    fun.call(ctx, `../missing`).compile(),
    compile(`../../../missing`),
  )

  t.is(
    fun.call(ctx, `./missing.mjs`).compile(),
    compile(`../../../test_files/missing.mjs`),
  )

  t.is(
    fun.call(ctx, `../missing.mjs`).compile(),
    compile(`../../../missing.mjs`),
  )

  t.is(
    fun.call(ctx, `./missing.jisp`).compile(),
    compile(`./missing.mjs`),
  )

  t.is(
    fun.call(ctx, `../missing.jisp`).compile(),
    compile(`../missing.mjs`),
  )

  t.is(
    fun.call(ctx, `jisp:prelude.mjs`).compile(),
    compile(`../../../js/prelude.mjs`),
  )

  t.is(
    fun.call(ctx, `jisp:missing.mjs`).compile(),
    compile(`../../../js/missing.mjs`),
  )

  t.is(
    fun.call(ctx, missingJsFileUrl).compile(),
    compile(`../../../test/missing.mjs`),
  )

  t.is(
    fun.call(ctx, existingJsFileUrl).compile(),
    compile(`../../../test_files/test_simple_export.mjs`),
  )

  t.is(
    fun.call(ctx, missingJispFileSrcUrl).compile(),
    compile(`./missing.mjs`),
  )

  t.is(
    fun.call(ctx, existingJispFileSrcUrl).compile(),
    compile(`./test_simple_export.mjs`),
  )

  t.is(fun.call(ctx, missingJsUrl).compile(), compile(missingJsUrl))
}

t.test(function test_use_anon() {
  let ctx = c.ctxWithStatement(makeCtx())
  t.own(ctx, {[c.symStatement]: undefined})

  ti.fail(() => p.use.call(ctx, undefined), `expected module context`)

  ctx = c.ctxWithModule(ctx)
  ti.fail(() => p.use.call(ctx), `expected between 1 and 2 inputs, got 0 inputs`)
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined})

  ti.fail(() => p.use.call(ctx, undefined), `expected variant of isStr, got undefined`)
  ti.fail(() => p.use.call(ctx, 10), `expected variant of isStr, got 10`)

  testUse(ctx, p.use, compileUseAnon)
})

t.test(function test_use_named() {
  const ctx = c.ctxWithModule(makeCtx())

  t.is(
    p.use.call(ctx, `some_path`, sym(`one`)).compile(),
    `import * as one from "some_path"`,
  )
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined, one: undefined})

  ti.fail(
    () => p.use.call(ctx, `some_path`, sym(`one`)),
    `redundant declaration of "one"`,
  )

  t.is(
    p.use.call(ctx, `jisp:prelude.mjs`, sym(`two`)).compile(),
    `import * as two from ${JSON.stringify(preludeUrl)}`,
  )
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined, one: undefined, two: undefined})

  const mod = makeTestModule()
  ctx[c.symModule] = mod

  t.is(
    p.use.call(ctx, `jisp:prelude.mjs`, sym(`three`)).compile(),
    `import * as three from "../../../js/prelude.mjs"`,
  )
  t.own(ctx, {[c.symModule]: undefined, [c.symModule]: mod, [c.symStatement]: undefined, [c.symExport]: undefined, one: undefined, two: undefined, three: undefined})

  t.is(
    p.use.call(ctx, `./missing.jisp`, sym(`four`)).compile(),
    `import * as four from "./missing.mjs"`,
  )
  t.own(ctx, {[c.symModule]: undefined, [c.symModule]: mod, [c.symStatement]: undefined, [c.symExport]: undefined, one: undefined, two: undefined, three: undefined, four: undefined})
})

t.test(function test_use_async() {
  ti.fail(() => p.use.async.call(null), `expected 1 inputs, got 0 inputs`)

  ti.fail(
    () => p.use.async.call(null, ti.macReqStatement),
    `expected statement context, got expression context null

source node:

{macro: [function reqStatement]}`,
  )

  const ctx = makeCtx()
  t.is(p.use.async.call(ctx, undefined).compile(),           `import(undefined)`)
  t.is(p.use.async.call(ctx, null).compile(),                `import(null)`)
  t.is(p.use.async.call(ctx, 10).compile(),                  `import(10)`)
  t.is(p.use.async.call(ctx, ti.macReqExpression).compile(), `import("expression_value")`)
  t.is(p.use.async.call(ctx, []).compile(),                  `import()`)

  ti.fail(async () => p.use.async.call(ctx, sym(`one`)), `missing declaration of "one"`)
  testUse(ctx, p.use.async, compileUseAsync)
})

await t.test(async function test_use_mac() {
  if (ti.WATCH) return

  let ctx = Object.create(null)
  await ti.fail(async () => p.use.mac.call(ctx), `expected statement context, got expression context`)

  ctx = c.ctxWithStatement(ctx)
  await ti.fail(async () => p.use.mac.call(ctx),        `expected between 1 and 2 inputs, got 0 inputs`)
  await ti.fail(async () => p.use.mac.call(ctx, 10),    `expected variant of isStr, got 10`)
  await ti.fail(async () => p.use.mac.call(ctx, ``),    `Relative import path "" not prefixed with / or ./ or ../`)
  await ti.fail(async () => p.use.mac.call(ctx, `one`), `Relative import path "one" not prefixed with / or ./ or ../`)

  await ti.fail(
    async () => p.use.mac.call(ctx, missingJsFileUrl),
    `Module not found ${c.show(missingJsFileUrl)}`,
  )

  await ti.fail(
    async () => p.use.mac.call(ctx, missingJispFileSrcUrl),
    `missing modules in context {[Symbol(jisp.statement)]: undefined}`,
  )

  ctx = c.ctxWithStatement(c.rootCtx())

  await ti.fail(
    async () => p.use.mac.call(ctx, missingJispFileSrcUrl),
    `missing filesystem in context {[Symbol(jisp.statement)]: undefined}`,
  )

  ctx = makeCtx()

  // Expected by the code in some files we're about to import.
  ctx.use = p.use

  ctx = c.ctxWithStatement(ctx)

  await ti.fail(
    async () => p.use.mac.call(ctx, missingJispFileSrcUrl),
    `No such file or directory (os error 2), stat '${new URL(missingJispFileSrcUrl).pathname}'`,
  )

  await testUseMac(ctx, existingJsFileUrl, existingJsFileUrl)
  await testUseMac(ctx, `jisp:prelude.mjs`, preludeUrl)
  await testUseMac(ctx, existingJispFileSrcUrl, existingJispFileTarUrl)
})

async function testUseMac(ctx, src, tar) {
  await testUseMacNamed(ctx, src, tar)
  await testUseMacMixin(ctx, src, tar)
}

async function testUseMacNamed(ctx, src, tar) {
  ctx = c.ctxWithStatement(ctx)

  await ti.fail(async () => p.use.mac.call(ctx, src, sym(`await`)), `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)
  await ti.fail(async () => p.use.mac.call(ctx, src, sym(`eval`)), `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)

  testNone(await p.use.mac.call(ctx, src, sym(`imported`)))
  t.own(ctx, {[c.symStatement]: undefined, imported: await import(tar)})
}

async function testUseMacMixin(ctx, src, tar) {
  ctx = c.ctxWithStatement(ctx)

  await ti.fail(
    async () => p.use.mac.call(ctx, src, sym(`*`)),
    `missing mixin namespace in context`,
  )

  ctx = c.ctxWithStatement(c.ctxWithMixin(ctx))
  testNone(await p.use.mac.call(ctx, src, sym(`*`)))

  t.own(ctx, {[c.symStatement]: undefined})

  const exp = {[c.symMixin]: undefined, ...await import(tar)}

  // We assign this property to the context earlier in this test.
  // More precisely, to the context that became the prototype of
  // the current context here. The mixin form of `use.mac` is expected
  // to skip inherited properties when assigning to the mixin context.
  delete exp.use

  t.own(c.ctxReqParentMixin(ctx), exp)
}

t.test(function test_use_meta() {
  const ctx = Object.create(null)

  function run(src) {return c.compileNode(c.macroNode(ctx, src))}
  ti.fail(() => run(sym(`use.meta`)), `missing declaration of "use"`)

  ctx.use = p.use
  t.is(run(sym(`use.meta`)), `import.meta`)

  /*
  Unfortunate current limitation. We'd like to fix this eventually. For now, use
  code can assign `use.meta` to a variable to read its properties.
  */
  ti.fail(() => run(sym(`use.meta.url`)), `missing property "url" in [object Raw]`)
})

function makeTestModule() {
  const mod = new c.Module()
  mod.srcPath = new URL(`test.jisp`, ti.TEST_SRC_URL).href
  mod.tarPath = new URL(`test.mjs`, ti.TEST_TAR_SUB_URL).href
  return mod
}

t.test(function test_declare_invalid() {
  ti.fail(() => p.declare.call(null), `expected statement context, got expression context`)

  const ctx = c.ctxWithStatement(null)
  ti.fail(() => p.declare.call(ctx),            `expected 1 inputs, got 0 inputs`)
  ti.fail(() => p.declare.call(ctx, undefined), `expected either symbol or string, got undefined`)
  ti.fail(() => p.declare.call(ctx, 10),        `expected either symbol or string, got 10`)
  ti.fail(() => p.declare.call(ctx, []),        `expected either symbol or string, got []`)
})

t.test(function test_declare_sym() {
  ti.fail(
    () => p.declare.call(c.ctxWithStatement(null), sym(`one`)),
    `missing declaration of "one"`,
  )

  ti.fail(
    () => p.declare.call(c.ctxWithStatement(null), sym(`one.two`)),
    `missing declaration of "one"`,
  )

  let ctx = c.ctxWithStatement(null)
  ctx.one = undefined

  ti.fail(
    () => p.declare.call(ctx, sym(`one`)),
    `expected to resolve "one" to plain object, got undefined`,
  )

  ti.fail(
    () => p.declare.call(ctx, sym(`one.two`)),
    `missing property "two" in undefined`,
  )

  ctx.one = 123

  ti.fail(
    () => p.declare.call(ctx, sym(`one`)),
    `expected to resolve "one" to plain object, got 123`,
  )

  ti.fail(
    () => p.declare.call(ctx, sym(`one.two`)),
    `missing property "two" in 123`,
  )

  ctx = c.ctxWithStatement(null)
  ctx.one = false

  ti.fail(
    () => p.declare.call(ctx, sym(`one`)),
    `expected to resolve "one" to plain object, got false`,
  )

  ti.fail(
    () => p.declare.call(ctx, sym(`one.two`)),
    `missing property "two" in false`,
  )

  ctx = c.ctxWithStatement(null)
  ctx.one = {two: 10}

  ti.fail(
    () => p.declare.call(ctx, sym(`one`)),
    `missing mixin namespace in context {[Symbol(jisp.statement)]: undefined, one: {two: 10}}`,
  )

  ctx = Object.create(null)
  ctx.three = undefined
  ctx = c.ctxWithStatement(c.ctxWithMixin(ctx))
  ctx.one = {one: 10, two: 20, three: 30, four: 40}

  testNone(p.declare.call(ctx, sym(`one`)))

  t.eq(ti.objFlat(ctx), [
    {[c.symStatement]: undefined, one: {one: 10, two: 20, three: 30, four: 40}},
    {[c.symMixin]: undefined, one: undefined, two: undefined, four: undefined},
    {three: undefined},
  ])

  ctx = Object.create(null)
  ctx.three = undefined
  ctx = c.ctxWithStatement(c.ctxWithMixin(ctx))
  ctx.one = {two: {one: 10, two: 20, three: 30, four: 40}}

  testNone(p.declare.call(ctx, sym(`one.two`)))

  t.eq(ti.objFlat(ctx), [
    {[c.symStatement]: undefined, one: {two: {one: 10, two: 20, three: 30, four: 40}}},
    {[c.symMixin]: undefined, one: undefined, two: undefined, four: undefined},
    {three: undefined},
  ])
})

await t.test(async function test_declare_str() {
  let ctx = Object.create(makeCtx())
  await ti.fail(async () => p.declare.call(ctx), `expected statement context, got expression context`)

  ctx = c.ctxWithStatement(ctx)
  await ti.fail(async () => p.declare.call(ctx),     `expected 1 inputs, got 0 inputs`)
  await ti.fail(async () => p.declare.call(ctx, ``), `missing mixin namespace in context {[Symbol(jisp.statement)]: undefined}`)

  ctx = c.ctxWithStatement(c.ctxWithMixin(ctx))
  await ti.fail(async () => p.declare.call(ctx, 10),    `expected either symbol or string, got 10`)
  await ti.fail(async () => p.declare.call(ctx, ``),    `Relative import path "" not prefixed with / or ./ or ../`)
  await ti.fail(async () => p.declare.call(ctx, `one`), `Relative import path "one" not prefixed with / or ./ or ../`)

  let mix = c.ctxReqParentMixin(ctx)
  t.own(mix, {[c.symMixin]: undefined})
  t.own(ctx, {[c.symStatement]: undefined})

  testNone(await p.declare.call(ctx, existingJsFileUrl))
  t.own(mix, {[c.symMixin]: undefined, one: undefined, two: undefined})
  t.own(ctx, {[c.symStatement]: undefined})

  ctx = c.ctxWithStatement(c.ctxWithMixin(makeCtx()))
  mix = c.ctxReqParentMixin(ctx)
  mix.one = 123
  testNone(await p.declare.call(ctx, existingJsFileUrl))
  t.own(c.ctxReqParentMixin(ctx), {[c.symMixin]: undefined, one: 123, two: undefined})
})

if (import.meta.main) ti.flush()

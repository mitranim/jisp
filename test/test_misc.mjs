import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

t.test(function test_optUrlRel() {
  function test(src, tar, exp) {t.is(c.optUrlRel(src, tar), exp)}

  test(undefined,         undefined,          undefined)
  test(`one:`,            undefined,          undefined)
  test(undefined,         `one:`,             undefined)
  test(`one:two`,         `three:four`,       undefined)
  test(`one:two`,         `three:four/five`,  undefined)
  test(`one:two/three`,   `four:five`,        undefined)
  test(`one:two/three`,   `one://two/three`,  undefined)
  test(`one://two/three`, `one:two/three`,    undefined)
  test(`one://two`,       `three://two`,      undefined)
  test(`one://two/three`, `four://two/three`, undefined)

  test(`one:`,                    `one:`,               `.`)
  test(`one:two`,                 `one:two`,            `.`)
  test(`one:two/three`,           `one:two/three`,      `.`)
  test(`one:`,                    `one:two`,            `./two`)
  test(`one:`,                    `one:two/three/four`, `./two/three/four`)
  test(`one:two`,                 `one:`,               `.`)
  test(`one:two/three`,           `one:`,               `..`)
  test(`one:two/three/four`,      `one:`,               `../..`)
  test(`one:two`,                 `one:two/three`,      `./three`)
  test(`one:two`,                 `one:two/three/four`, `./three/four`)
  test(`one:two/three`,           `one:four/five/six`,  `../four/five/six`)
  test(`one:two/three`,           `one:two`,            `.`)
  test(`one:two/three/four/five`, `one:two`,            `../..`)
  test(`one:two/three/four/five`, `one:two/five`,       `../../five`)
  test(`one:two/three/four/five`, `one:two/five/six`,   `../../five/six`)
})

t.test(function test_isCanonicalModulePath() {
  t.no(c.isCanonicalModulePath())
  t.no(c.isCanonicalModulePath(``))

  t.ok(c.isCanonicalModulePath(`one`))
  t.no(c.isCanonicalModulePath(`one?`))
  t.no(c.isCanonicalModulePath(`one?two`))
  t.no(c.isCanonicalModulePath(`one#`))
  t.no(c.isCanonicalModulePath(`one#two`))
  t.no(c.isCanonicalModulePath(`one?two#three`))

  t.ok(c.isCanonicalModulePath(`one/two`))
  t.no(c.isCanonicalModulePath(`one/two?`))
  t.no(c.isCanonicalModulePath(`one/two?three`))

  t.no(c.isCanonicalModulePath(`one/`))
  t.no(c.isCanonicalModulePath(`one/?`))
  t.no(c.isCanonicalModulePath(`one/?two`))

  t.no(c.isCanonicalModulePath(`one/two/`))
  t.no(c.isCanonicalModulePath(`one/two/?`))
  t.no(c.isCanonicalModulePath(`one/two/?three`))

  t.ok(c.isCanonicalModulePath(`one/two.mjs`))
  t.no(c.isCanonicalModulePath(`one/two.mjs?`))
  t.no(c.isCanonicalModulePath(`one/two.mjs?three`))

  t.ok(c.isCanonicalModulePath(`one/two.jisp`))
  t.no(c.isCanonicalModulePath(`one/two.jisp?`))
  t.no(c.isCanonicalModulePath(`one/two.jisp?three`))

  t.no(c.isCanonicalModulePath(`/one/two`))
  t.no(c.isCanonicalModulePath(`/one/two.mjs`))
  t.no(c.isCanonicalModulePath(`/one/two.jisp`))

  t.ok(c.isCanonicalModulePath(import.meta.url))
  t.no(c.isCanonicalModulePath(new URL(import.meta.url)))

  t.ok(c.isCanonicalModulePath(`one://two`))
  t.no(c.isCanonicalModulePath(`one://two?`))
  t.no(c.isCanonicalModulePath(`one://two?three`))

  t.ok(c.isCanonicalModulePath(`one://two/three`))
  t.no(c.isCanonicalModulePath(`one://two/three?`))
  t.no(c.isCanonicalModulePath(`one://two/three?four`))

  t.ok(c.isCanonicalModulePath(`one://two/three.mjs`))
  t.no(c.isCanonicalModulePath(`one://two/three.mjs?`))
  t.no(c.isCanonicalModulePath(`one://two/three.mjs?four`))

  t.ok(c.isCanonicalModulePath(`one://two/three.jisp`))
  t.no(c.isCanonicalModulePath(`one://two/three.jisp?`))
  t.no(c.isCanonicalModulePath(`one://two/three.jisp?four`))
})

await t.test(async function test_strToHash() {
  await ti.fail(async () => c.strHash(),   `expected variant of isStr, got undefined`)
  await ti.fail(async () => c.strHash(10), `expected variant of isStr, got 10`)

  const one = `7692c3ad3540bb803c020b3aee66cd8887123234ea0c6e7143c0add73ff431ed`
  t.is(await c.strHash(`one`), one)
  t.is(await c.strHash(`one`), one)

  const two = `3fc4ccfe745870e2c0d99f71f30ff0656c8dedd41cc1d7d3d376b0dbe685e2f3`
  t.is(await c.strHash(`two`), two)
  t.is(await c.strHash(`two`), two)
})

await t.test(async function test_srcToTarAsync() {
  const ctx = Object.create(c.ctxGlobal)
  const src0 = new URL(`src_0/file_0.jisp`, import.meta.url).href
  const src1 = new URL(`src_1/file_1.jisp`, import.meta.url).href

  const hash0 = await c.strHash(`test/src_0:` + c.reqValidStr(ti.TEST_TAR_NAME))
  const hash1 = await c.strHash(`test/src_1:` + c.reqValidStr(ti.TEST_TAR_NAME))

  // t.is(hash0, `1fff0a191264737c7ab1058e5442c2cfdee95b16169ec136d18807b4a2a22c19`)
  // t.is(hash1, `9bdc4494d0ae99bd24f3545c16d2f2e6485260b12ae1771fad76557e4f6f9af3`)

  const tar0 = new URL(c.pathJoin(hash0, `file_0.mjs`), ti.TEST_TAR_URL).href
  const tar1 = new URL(c.pathJoin(hash1, `file_1.mjs`), ti.TEST_TAR_URL).href

  t.is(await c.srcToTarAsync(ctx, src0), tar0)
  t.is(await c.srcToTarAsync(ctx, src1), tar1)

  ctx[c.symMain] = new URL(`src_0`, import.meta.url).href

  t.is(
    await c.srcToTarAsync(ctx, src0),
    new URL(`file_0.mjs`, ti.TEST_TAR_URL).href,
    `
    for a file located in the source directory specified as "main",
    the target path must not include a hash
    `,
  )

  t.is(
    await c.srcToTarAsync(ctx, src1),
    tar1,
    `
    for a file located in any directory not specified as "main",
    the target path must still include a hash
    `,
  )
})

t.test(function test_ctxReqGet() {
  function fail(src, path, msg) {return ti.fail(() => c.ctxReqGet(src, path), msg)}
  function test(src, path, exp) {t.is(c.ctxReqGet(src, path), exp)}

  fail(undefined, undefined,       `expected variant of isStr, got undefined`)
  fail(undefined, undefined,       `expected variant of isStr, got undefined`)
  fail(undefined, 123,             `expected variant of isStr, got 123`)

  fail(undefined, ``,              `missing declaration of ""`)
  fail({},        ``,              `missing declaration of ""`)

  fail(undefined, `one`,           `missing declaration of "one"`)
  fail({},        `one`,           `missing declaration of "one"`)

  fail(undefined, `one.two`,       `missing declaration of "one"`)
  fail({},        `one.two`,       `missing declaration of "one"`)

  fail(undefined, `one.two.three`, `missing declaration of "one"`)
  fail({},        `one.two.three`, `missing declaration of "one"`)

  test({one: undefined}, `one`,           undefined)
  test({one: undefined}, `one.two`,       undefined)
  test({one: undefined}, `one.two.three`, undefined)

  test({one: 123}, `one`,           123)
  fail({one: 123}, `one.two`,       `missing property "two" in 123`)
  fail({one: 123}, `one.two.three`, `missing property "two" in 123`)

  const one = {two: 123}
  test({one}, `one`,           one)
  test({one}, `one.two`,       123)
  fail({one}, `one.two.three`, `missing property "three" in 123`)
})

t.test(function test_ownVals() {
  const symOne = Symbol.for(`one`)
  const symTwo = Symbol.for(`two`)

  t.eq(ti.ownVals(Object.create(null)), {})
  t.eq(ti.ownVals({}), {})
  t.eq(ti.ownVals({one: 10}), {one: 10})
  t.eq(ti.ownVals({one: 10, two: 20}), {one: 10, two: 20})
  t.eq(ti.ownVals({[symOne]: 10}), {[symOne]: 10})
  t.eq(ti.ownVals({[symOne]: 10, [symTwo]: 20}), {[symOne]: 10, [symTwo]: 20})

  t.eq(
    ti.ownVals({one: 10, two: 20, [symOne]: 10, [symTwo]: 20}),
    {one: 10, two: 20, [symOne]: 10, [symTwo]: 20},
  )

  t.eq(ti.ownVals(Object.create({})), {})

  t.eq(
    ti.ownVals(Object.create({one: 10, two: 20, [symOne]: 10, [symTwo]: 20})),
    {},
  )
})

t.test(function test_objFlat() {
  t.eq(ti.objFlat(null), [])
  t.eq(ti.objFlat(Object.create(null)), [{}])

  const symOne = Symbol.for(`one`)
  const symTwo = Symbol.for(`two`)

  const root = Object.create(null)
  root.one = 10
  root[symOne] = 20

  const mid = Object.create(root)
  mid.one = 30
  mid.two = 40

  const top = Object.create(mid)
  top[symTwo] = 50

  t.eq(ti.objFlat(top), [
    {[symTwo]: 50},
    {one: 30, two: 40},
    {[symOne]: 20, one: 10},
  ])
})

t.bench(function bench_reqArity() {c.reqArity(arguments.length, 0)})
t.bench(function bench_Raw_overhead_0() {new c.Raw()})
t.bench(function bench_Raw_overhead_1() {`` + new c.Raw()})
t.bench(function bench_Raw_overhead_2() {`` + new c.Raw().toString()})
t.bench(function bench_Raw_overhead_3() {`` + new c.Raw().valueOf()})
t.bench(function bench_Raw_overhead_4() {`` + new c.Raw().compile()})
t.bench(function bench_Raw_overhead_5() {new c.Raw(new c.Raw())})
t.bench(function bench_Raw_overhead_6() {new c.Raw(new c.Raw().valueOf())})
t.bench(function bench_Raw_overhead_7() {new c.Raw(new c.Raw().toString())})
t.bench(function bench_Raw_overhead_8() {c.compileNode(new c.Raw())})
t.bench(function bench_Raw_overhead_9() {new c.Raw(c.laxStr(undefined))})

if (import.meta.main) ti.flush()

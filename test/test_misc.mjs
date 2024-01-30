import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

t.test(function test_optUrlRel() {
  function test(src, tar, exp) {
    t.is(
      c.reqToUrl(exp, src).href,
      tar,
      `relative: ` + exp,
      `source:   ` + src,
    )

    t.is(
      c.optUrlRel(src, tar),
      exp,
      `source: ` + src,
      `target: ` + tar,
    )
  }

  test(`file:///one/two/three.four`, `file:///one/two/three.four`, `./three.four`)
  test(`file:///one/two/three.four`, `file:///one/two/`,           `.`)
  test(`file:///one/two/three.four`, `file:///one/two`,            `../two`)
  test(`file:///one/two/three.four`, `file:///one/`,               `..`)
  test(`file:///one/two/three.four`, `file:///one`,                `../../one`)
  test(`file:///one/two/three.four`, `file:///`,                   `../..`)

  test(`file:///one/two/`, `file:///one/two/three.four`, `./three.four`)
  test(`file:///one/two/`, `file:///one/two/`,           `.`)
  test(`file:///one/two/`, `file:///one/two`,            `../two`)
  test(`file:///one/two/`, `file:///one/`,               `..`)
  test(`file:///one/two/`, `file:///one`,                `../../one`)
  test(`file:///one/two/`, `file:///`,                   `../..`)

  test(`file:///one/two`, `file:///one/two/three.four`, `./two/three.four`)
  test(`file:///one/two`, `file:///one/two/`,           `./two/`)
  test(`file:///one/two`, `file:///one/two`,            `./two`)
  test(`file:///one/two`, `file:///one/`,               `.`)
  test(`file:///one/two`, `file:///one`,                `../one`)
  test(`file:///one/two`, `file:///`,                   `..`)

  test(`file:///one`, `file:///one/two/three.four`, `./one/two/three.four`)
  test(`file:///one`, `file:///one/two/`,           `./one/two/`)
  test(`file:///one`, `file:///one/two`,            `./one/two`)
  test(`file:///one`, `file:///one/`,               `./one/`)
  test(`file:///one`, `file:///one`,                `./one`)
  test(`file:///one`, `file:///`,                   `.`)

  test(`file:///`, `file:///one/two/three.four`, `./one/two/three.four`)
  test(`file:///`, `file:///one/two/`,           `./one/two/`)
  test(`file:///`, `file:///one/two`,            `./one/two`)
  test(`file:///`, `file:///one/`,               `./one/`)
  test(`file:///`, `file:///one`,                `./one`)
  test(`file:///`, `file:///`,                   `.`)

  test(`file:///one/two.three`, `file:///four/five.six`, `../four/five.six`)
  test(`file:///one/two.three`, `file:///four/`,         `../four/`)
  test(`file:///one/two.three`, `file:///four`,          `../four`)
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

t.test(function test_srcToTar() {
  const tar = ti.TEST_TAR_URL.href
  const src0 = new URL(`src_0/file_0.jisp`, import.meta.url).href
  const src1 = new URL(`src_1/file_1.jisp`, import.meta.url).href

  t.is(
    c.srcToTar(src0, tar),
    new URL(`1/test/src_0/file_0.mjs`, ti.TEST_TAR_URL).href,
  )

  t.is(
    c.srcToTar(src1, tar),
    new URL(`1/test/src_1/file_1.mjs`, ti.TEST_TAR_URL).href,
  )

  const main = new URL(`src_0`, import.meta.url).href

  t.is(
    c.srcToTar(src0, tar, main),
    new URL(`file_0.mjs`, ti.TEST_TAR_URL).href,
  )

  t.is(
    c.srcToTar(src1, tar, main),
    new URL(`1/src_1/file_1.mjs`, ti.TEST_TAR_URL).href,
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
  fail({one: undefined}, `one.two`,       `missing property "two" in undefined`)
  fail({one: undefined}, `one.two.three`, `missing property "two" in undefined`)

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

/*
These were written out of curiosity. Our actual bottlenecks are in parsing and
macroing.
*/
t.bench(function bench_reqArity() {c.reqArity(arguments.length, 0)})
t.bench(function bench_raw_overhead_Raw_0() {new c.Raw()})
t.bench(function bench_raw_overhead_raw_0() {c.raw()})
t.bench(function bench_raw_overhead_Raw_1() {`` + new c.Raw()})
t.bench(function bench_raw_overhead_raw_1() {`` + c.raw()})
t.bench(function bench_raw_overhead_Raw_2() {`` + new c.Raw().toString()})
t.bench(function bench_raw_overhead_Raw_3() {`` + new c.Raw().valueOf()})
t.bench(function bench_raw_overhead_Raw_4() {`` + new c.Raw().compile()})
t.bench(function bench_raw_overhead_Raw_5() {new c.Raw(new c.Raw())})
t.bench(function bench_raw_overhead_Raw_6() {new c.Raw(new c.Raw().valueOf())})
t.bench(function bench_raw_overhead_Raw_7() {new c.Raw(new c.Raw().toString())})
t.bench(function bench_raw_overhead_Raw_8() {c.compileNode(new c.Raw())})
t.bench(function bench_raw_overhead_Raw_9() {new c.Raw(c.laxStr(undefined))})

if (import.meta.main) ti.flush()

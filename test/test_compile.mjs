import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

t.test(function test_compile() {
  function test(src, exp) {t.is(c.compileNode(src), exp)}
  function fail(src, msg) {return ti.fail(() => c.compileNode(src), msg)}

  test(undefined, `undefined`)
  test(null, `null`)
  test(false, `false`)
  test(true, `true`)
  test(0n, `0n`)
  test(123n, `123n`)
  test(-123n, `-123n`)
  test(0, `0`)

  /*
  This case in particular can be a gotcha. When we decode a source string "-0",
  we must produce the float value `-0`, which is distinct from the value `0`.
  When we encode it, we must produce `-0`. However, in JS, `-0` tends to encode
  as "0" when using various built-in number stringification features.
  */
  {
    t.is(-0, -0)
    t.isnt(0, -0)

    // All of these produce the wrong result.
    t.is(String(-0), `0`)
    t.is((-0).toString(), `0`)
    t.is(`` + -0, `0`)

    // And yet we must produce the right result.
    test(-0, `-0`)
  }

  test(123, `123`)
  test(-123, `-123`)
  test(123.456, `123.456`)
  test(-123.456, `-123.456`)

  // We don't support decoding these values, but we do support encoding them.
  test(NaN, `NaN`)
  test(Infinity, `Infinity`)
  test(-Infinity, `-Infinity`)

  /*
  This behavior naturally follows from encoding symbols as-is. Our internals
  don't rely on this particular case, but this may be useful in the future.
  */
  test(Symbol(``), ``)
  test(Symbol.for(``), ``)

  test(Symbol(`sym`), `sym`)
  test(Symbol.for(`sym`), `sym`)

  test(Symbol(`some code`), `some code`)
  test(Symbol.for(`some code`), `some code`)

  test(``,         `""`)
  test(`one`,      `"one"`)
  test(`one\ntwo`, `"one\\ntwo"`)

  test([],                               ``)
  test([[]],                             ``)
  test([[[]]],                           ``)
  test([[[], []]],                       ``)
  test([[[], []], []],                   ``)
  test([[[], [10]], []],                 `10()()()`)
  test([[[10]]],                         `10()()()`)
  test([undefined],                      `undefined()`)
  test([undefined, []],                  `undefined()`)
  test([undefined, [[]]],                `undefined()`)
  test([null],                           `null()`)
  test([null, []],                       `null()`)
  test([null, [[]]],                     `null()`)
  test([undefined, null],                `undefined(null)`)
  test([10],                             `10()`)
  test([10, []],                         `10()`)
  test([10, [[]]],                       `10()`)
  test([10, [[[]]]],                     `10()`)
  test([10, undefined, null],            `10(undefined, null)`)
  test([undefined, 10, null, []],        `undefined(10, null)`)
  test([undefined, null, 10, [[]]],      `undefined(null, 10)`)
  test([10, 20],                         `10(20)`)
  test([10, undefined, 20, null],        `10(undefined, 20, null)`)
  test([10, 20, 30],                     `10(20, 30)`)
  test([10, undefined, 20, null, 30],    `10(undefined, 20, null, 30)`)

  fail(Object(false),             `unable to compile unrecognized object [object Boolean]`)
  fail(Object(true),              `unable to compile unrecognized object [object Boolean]`)
  fail(Object(0n),                `unable to compile unrecognized object [object BigInt]`)
  fail(Object(123n),              `unable to compile unrecognized object [object BigInt]`)
  fail(Object(0),                 `unable to compile unrecognized object [object Number]`)
  fail(Object(123.456),           `unable to compile unrecognized object [object Number]`)
  fail(Object(Symbol(`sym`)),     `unable to compile unrecognized object [object Symbol]`)
  fail(Object(Symbol.for(`sym`)), `unable to compile unrecognized object [object Symbol]`)
  fail(Object(`str`),             `unable to compile unrecognized object [object String]`)

  test(Object.create(null), `({})`)
  fail(Object.create(Object.create(null)), `unable to compile unrecognized object {}`)
  fail(Object.create(Object.create(Object.create(null))), `unable to compile unrecognized object {}`)
  fail(Object.create({}), `unable to compile unrecognized object {}`)

  test({}, `({})`)
  test({one: 10}, `({"one": 10})`)
  test({one: 10, two: 20}, `({"one": 10, "two": 20})`)
  test({10: 20}, `({"10": 20})`)
  test({10: 20, 30: 40}, `({"10": 20, "30": 40})`)
  test({one: []}, `({"one": undefined})`)
  test({one: 10, two: []}, `({"one": 10, "two": undefined})`)
  test({one: 10, two: [], three: 20}, `({"one": 10, "two": undefined, "three": 20})`)
  test({10: []}, `({"10": undefined})`)
  test({10: 20, 30: []}, `({"10": 20, "30": undefined})`)
  test({10: 20, 30: [], 40: 50}, `({"10": 20, "30": undefined, "40": 50})`)

  test([10, {one: 20}, [30, {two: 40}]], `10(({"one": 20}), 30(({"two": 40})))`)

  fail(Promise.resolve(), `unable to compile unrecognized object [object Promise]`)

  test(new c.Raw(`some_code`), `some_code`)
  test(new c.Raw(`"some_code"`), `"some_code"`)

  function unreachable() {throw Error(`some_error`)}
  fail(unreachable, `unable to usefully compile function node [function unreachable]`)

  fail({unreachable}, `unable to usefully compile function node [function unreachable]

source node:

{unreachable: [function unreachable]}`)

  unreachable.compile = function compile() {return `some_code`}
  fail(unreachable, `unable to usefully compile function node [function unreachable]`)
})

t.test(function test_compile_error_context_without_spans() {
  function fail(src, msg) {return ti.fail(() => c.compileNode(src), msg)}
  function unreachable() {throw Error(`some_error`)}

  const src = [[[10, 20, unreachable, 30, 40]]]

  fail(src, `unable to usefully compile function node [function unreachable]

source node:

[10, 20, [function unreachable], 30, 40]

source node:

[[10, 20, [function unreachable], 30, 40]]

source node:

[[[10, 20, [function unreachable], 30, 40]]]`)
})

t.test(function test_compile_error_context_with_spans() {
  const src = [...new c.Reader(`
10
[[[20 30 40 50 60]]]
70

f170f9ac8ac4452da3459f04eecc2a0e
f256285e7c1e44b6ab1ace0e2660f4e3
fc15bdb2fa3e4f9eb030f4ff54f9c25e
f15b26f753b346968149e9b934df3253
fad0e077c8344f7685c6ef859e3d3343
f6c214786802449392bda446b51ddf83
f8af2a6003834b31b82f12b77129ab3a
f734e33ba3da405cadae84842c28cee4
f388a68c22544962b27a2e117934dce1
`)][1]
  src[0][0][2] = unreachable

  t.eq(src, [[[20, 30, unreachable, 50, 60]]])
  t.is(c.nodeSpan(src).view(), `[[[20 30 40 50 60]]]`)
  t.is(c.nodeSpan(src[0]).view(), `[[20 30 40 50 60]]`)
  t.is(c.nodeSpan(src[0][0]).view(), `[20 30 40 50 60]`)

  function fail(src, msg) {return ti.fail(() => c.compileNode(src), msg)}
  function unreachable() {throw Error(`some_error`)}

  fail(src, `unable to usefully compile function node [function unreachable]

source node context:

:3:3

…
…[20 30 40 50 60]]]
70

f170f9ac8ac4452da3459f04eecc2a0e
f256285e7c1e44b6ab1ace0e2660f4e3
fc15bdb2fa3e4f9eb030f4ff54f9c25e
f15b2…

source node context:

:3:2

…
…[[20 30 40 50 60]]]
70

f170f9ac8ac4452da3459f04eecc2a0e
f256285e7c1e44b6ab1ace0e2660f4e3
fc15bdb2fa3e4f9eb030f4ff54f9c25e
f15b…

source node context:

:3:1

…
[[[20 30 40 50 60]]]
70

f170f9ac8ac4452da3459f04eecc2a0e
f256285e7c1e44b6ab1ace0e2660f4e3
fc15bdb2fa3e4f9eb030f4ff54f9c25e
f15…`)
})

if (import.meta.main) ti.flush()

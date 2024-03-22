import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

function test(src, exp) {t.is(c.compileNode(src), exp)}
function fail(src, msg) {return ti.fail(() => c.compileNode(src), msg)}

t.test(function test_compile_nil() {
  test(undefined, `(void 0)`)
  test(null, `null`)
})

t.test(function test_compile_bool() {
  test(false, `false`)
  test(true, `true`)
})

t.test(function test_compile_bigint() {
  test(0n, `0n`)
  test(123n, `123n`)
  test(-123n, `-123n`)
})

t.test(function test_compile_num() {
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

    // We must produce the right result.
    test(-0, `-0`)
  }

  test(123, `123`)
  test(-123, `-123`)
  test(123.456, `123.456`)
  test(-123.456, `-123.456`)

  /*
  The compiled representations avoid mentioning `NaN` and `Infinity`
  because these are predeclared, not reserved, and may be redeclared.
  */
  test(NaN, `(0/0)`)
  test(Infinity, `(1/0)`)
  test(-Infinity, `(-1/0)`)
})

t.test(function test_compile_sym() {
  fail(Symbol(`some code`), `"some code" does not represent a valid JS identifier`)
  fail(Symbol.for(`some code`), `"some code" does not represent a valid JS identifier`)

  fail(Symbol.for(`.`), `unexpected leading accessor in "."`)
  fail(Symbol.for(`..`), `unexpected leading accessor in ".."`)
  fail(Symbol.for(`...`), `unexpected leading accessor in "..."`)
  fail(Symbol.for(`.one`), `unexpected leading accessor in ".one"`)
  fail(Symbol.for(`.one.two`), `unexpected leading accessor in ".one.two"`)

  test(Symbol(``), ``)
  test(Symbol.for(``), ``)

  test(Symbol(`one`), `one`)
  test(Symbol.for(`one`), `one`)
  test(Symbol.for(`await`), `await`)
  test(Symbol.for(`eval`), `eval`)
  test(Symbol.for(`one.two`), `one.two`)
  test(Symbol.for(`one.two.three`), `one.two.three`)
  test(Symbol.for(`#one`), `#one`)
  test(Symbol.for(`#one.two`), `#one.two`)
  test(Symbol.for(`one.#two`), `one.#two`)
  test(Symbol.for(`#one.#two`), `#one.#two`)

  test(Symbol.for(`one.`), `one[""]`)
  test(Symbol.for(`one..`), `one[""][""]`)
  test(Symbol.for(`one.two.`), `one.two[""]`)
  test(Symbol.for(`one.two..`), `one.two[""][""]`)
  test(Symbol.for(`one..two`), `one[""].two`)
  test(Symbol.for(`one..two.`), `one[""].two[""]`)
  test(Symbol.for(`one..two..`), `one[""].two[""][""]`)

  fail(Symbol.for(`10`), `"10" does not represent a valid JS identifier`)
  fail(Symbol.for(`10.20`), `"10" does not represent a valid JS identifier`)
  fail(Symbol.for(`10.20.30`), `"10" does not represent a valid JS identifier`)

  test(Symbol.for(`one.0`), `one[0]`)
  test(Symbol.for(`one.1`), `one[1]`)
  test(Symbol.for(`one.10`), `one[10]`)
  test(Symbol.for(`one.10.20`), `one[10][20]`)
  test(Symbol.for(`one.10.20.two`), `one[10][20].two`)
})

t.test(function test_compile_str() {
  test(``,         `""`)
  test(`one`,      `"one"`)
  test(`one\ntwo`, `"one\\ntwo"`)
})

t.test(function test_compile_list() {
  test([],                               ``)
  test([[]],                             ``)
  test([[[]]],                           ``)
  test([[[], []]],                       ``)
  test([[[], []], []],                   ``)
  test([[[], [10]], []],                 `10()()()`)
  test([[[10]]],                         `10()()()`)
  test([undefined],                      `(void 0)()`)
  test([undefined, []],                  `(void 0)()`)
  test([undefined, [[]]],                `(void 0)()`)
  test([null],                           `null()`)
  test([null, []],                       `null()`)
  test([null, [[]]],                     `null()`)
  test([undefined, null],                `(void 0)(null)`)
  test([10],                             `10()`)
  test([10, []],                         `10()`)
  test([10, [[]]],                       `10()`)
  test([10, [[[]]]],                     `10()`)
  test([10, undefined, null],            `10((void 0), null)`)
  test([undefined, 10, null, []],        `(void 0)(10, null)`)
  test([undefined, null, 10, [[]]],      `(void 0)(null, 10)`)
  test([10, 20],                         `10(20)`)
  test([10, undefined, 20, null],        `10((void 0), 20, null)`)
  test([10, 20, 30],                     `10(20, 30)`)
  test([10, undefined, 20, null, 30],    `10((void 0), 20, null, 30)`)
})

t.test(function test_compile_fun() {
  function fun() {throw Error(`some_error`)}
  fail(fun, `unable to usefully compile function [function fun]`)

  fail({fun}, `unable to usefully compile function [function fun]; hint: arbitrary nodes can compile by implementing the method ".compile"

source function:

[function fun]`)

  fun.compile = function compile() {return `some_code`}
  test(fun, `some_code`)
  test({fun}, `({"fun": some_code})`)
})

t.test(function test_compile_compilable() {
  test(new c.Raw(`some_code`), `some_code`)
  test(new c.Raw(`"some_code"`), `"some_code"`)

  test({compile: undefined}, `({"compile": (void 0)})`)
  test({compile: 123}, `({"compile": 123})`)
  fail({compile() {}}, `expected variant of isStr, got undefined`)
  fail({compile() {return 123}}, `expected variant of isStr, got 123`)
  test({compile() {return `some_code`}}, `some_code`)
  test(Object.create(null, {compile: {value() {return `some_code`}}}), `some_code`)
  test(new class SomeNode {compile() {return `some_code`}}(), `some_code`)
})

t.test(function test_compile_regexp() {
  test(/(?:)/, `/(?:)/`)
  test(/(?:)/g, `/(?:)/g`)
  test(/(?:)/gi, `/(?:)/gi`)
  test(/one/, `/one/`)
  test(/one/g, `/one/g`)
  test(/one/gi, `/one/gi`)
})

t.test(function test_compile_unknown_object() {
  fail(Object(false),             `unable to usefully compile object [Boolean: false]`)
  fail(Object(true),              `unable to usefully compile object [Boolean: true]`)
  fail(Object(0n),                `unable to usefully compile object [BigInt: 0n]`)
  fail(Object(123n),              `unable to usefully compile object [BigInt: 123n]`)
  fail(Object(0),                 `unable to usefully compile object [Number: 0]`)
  fail(Object(123.456),           `unable to usefully compile object [Number: 123.456]`)
  fail(Object(Symbol(`sym`)),     `unable to usefully compile object [Symbol: sym]`)
  fail(Object(Symbol.for(`sym`)), `unable to usefully compile object [Symbol: sym]`)
  fail(Object(`str`),             `unable to usefully compile object [String: "str"]`)

  test(Object.create(null), `({})`)
  fail(Object.create(Object.create(null)), `unable to usefully compile object {}`)
  fail(Object.create(Object.create(Object.create(null))), `unable to usefully compile object {}`)
  fail(Object.create({}), `unable to usefully compile object {}`)
  fail(Promise.resolve(), `unable to usefully compile object [object Promise]`)
})

t.test(function test_compile_dict() {
  test({}, `({})`)
  test({one: 10}, `({"one": 10})`)
  test({one: 10, two: 20}, `({"one": 10, "two": 20})`)
  test({10: 20}, `({"10": 20})`)
  test({10: 20, 30: 40}, `({"10": 20, "30": 40})`)
  test({one: []}, `({"one": (void 0)})`)
  test({one: 10, two: []}, `({"one": 10, "two": (void 0)})`)
  test({one: 10, two: [], three: 20}, `({"one": 10, "two": (void 0), "three": 20})`)
  test({10: []}, `({"10": (void 0)})`)
  test({10: 20, 30: []}, `({"10": 20, "30": (void 0)})`)
  test({10: 20, 30: [], 40: 50}, `({"10": 20, "30": (void 0), "40": 50})`)
  test([10, {one: 20}, [30, {two: 40}]], `10(({"one": 20}), 30(({"two": 40})))`)
})

t.test(function test_compile_error_context_without_spans() {
  function fail(src, msg) {return ti.fail(() => c.compileNode(src), msg)}
  function unreachable() {throw Error(`some_error`)}

  const src = [[[10, 20, unreachable, 30, 40]]]

  fail(src, `unable to usefully compile function [function unreachable]; hint: arbitrary nodes can compile by implementing the method ".compile"

source function:

[function unreachable]

source node:

[10, 20, [function unreachable], 30, 40]

source node:

[[10, 20, [function unreachable], 30, 40]]

source node:

[[[10, 20, [function unreachable], 30, 40]]]`)
})

t.test(function test_compile_error_context_with_spans() {
  const src = [...new c.DelimReader(`
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

  fail(src, `unable to usefully compile function [function unreachable]; hint: arbitrary nodes can compile by implementing the method ".compile"

source function:

[function unreachable]

source node context:

:3:3

…
…[20 30 40 50 60]]]
70

f170f9ac8ac4452da3459f04eecc2a0e
f256285e7c1e44b6ab1ace0e2660f4e3
fc15bdb2fa3e4f9eb030f4ff54f9c25e
f15b2…`)
})

if (import.meta.main) ti.flush()

import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

function sym(val) {return Symbol.for(c.reqStr(val))}
function mockSpan() {return new c.Span(`some_source_code`)}

const mockContext = `source node context:

:1:1

some_source_code`

t.test(function test_macro_primitive() {
  function test(src) {t.is(c.macroNode(undefined, src), src)}

  test(undefined)
  test(null)

  test(false)
  test(true)

  test(0n)
  test(123n)
  test(-123n)

  test(0)
  test(123.456)
  test(-123.456)

  test(NaN)
  test(Infinity)
  test(-Infinity)

  test(``)
  test(`str`)
})

t.test(function test_macro_fun_sync_exception_context() {
  const msg = `unexpected function node [function fun] in non-call position; hint: macro functions may be used in arbitrary positions by implementing the method ".macro" and/or the method ".compile"`
  function fun() {throw Error(`unreachable`)}

  ti.fail(
    () => c.macroNode(null, fun),
    c.joinParagraphs(msg, `source function:`, `[function fun]`),
  )

  c.nodeSpanSet(fun, mockSpan())
  t.is(c.nodeContext(fun), mockContext)

  ti.fail(
    () => c.macroNode(null, fun),
    c.joinParagraphs(msg, mockContext),
  )

  fun.macro = function mac() {throw Error(`some_error`)}

  ti.fail(
    () => c.macroNode(null, fun),
    c.joinParagraphs(`some_error`, mockContext),
  )
})

await t.test(async function test_macro_fun_async_exception_context() {
  const msg = `unexpected function node [function fun] in non-call position; hint: macro functions may be used in arbitrary positions by implementing the method ".macro" and/or the method ".compile"`
  async function fun() {throw Error(`unreachable`)}

  await ti.fail(
    async () => c.macroNode(null, fun),
    c.joinParagraphs(msg, `source function:`, `[function fun]`),
  )

  c.nodeSpanSet(fun, mockSpan())
  t.is(c.nodeContext(fun), mockContext)

  await ti.fail(
    async () => c.macroNode(null, fun),
    c.joinParagraphs(msg, mockContext),
  )

  fun.macro = function mac() {throw Error(`some_error`)}

  await ti.fail(
    async () => c.macroNode(null, fun),
    c.joinParagraphs(`some_error`, mockContext),
  )
})

t.test(function test_macro_fun_sync() {
  const calls = []
  function macro(...args) {
    calls.push({this: this, args})
    return `some_value`
  }

  function uncallable() {throw Error(`unreachable`)}

  function macroable() {throw Error(`unreachable`)}
  macroable.macro = macro

  function compilable() {throw Error(`unreachable`)}
  compilable.compile = uncallable

  function macroableCompilable() {throw Error(`unreachable`)}
  macroableCompilable.macro = macro
  macroableCompilable.compile = uncallable

  ti.fail(
    () => c.macroNode(null, uncallable),
    `unexpected function node [function uncallable] in non-call position`,
  )
  t.eq(calls.splice(0), [])

  t.is(c.macroNode(`ctx_0`, macroable), `some_value`)
  t.eq(calls.splice(0), [{this: macroable, args: [`ctx_0`]}])

  t.is(c.macroNode(`ctx_1`, compilable), compilable)
  t.eq(calls.splice(0), [])

  t.is(c.macroNode(`ctx_1`, macroableCompilable), `some_value`)
  t.eq(calls.splice(0), [{this: macroableCompilable, args: [`ctx_1`]}])
})

await t.test(async function test_macro_fun_async() {
  const calls = []
  async function macro(...args) {
    calls.push({this: this, args})
    return `some_value`
  }

  async function uncallable() {throw Error(`unreachable`)}
  function uncallableSync() {throw Error(`unreachable`)}

  async function macroable() {throw Error(`unreachable`)}
  macroable.macro = macro

  async function compilable() {throw Error(`unreachable`)}
  compilable.compile = uncallableSync

  async function macroableCompilable() {throw Error(`unreachable`)}
  macroableCompilable.macro = macro
  macroableCompilable.compile = uncallableSync

  await ti.fail(
    async () => c.macroNode(null, uncallable),
    `unexpected function node [function uncallable] in non-call position`,
  )
  t.eq(calls.splice(0), [])

  t.is(await c.macroNode(`ctx_0`, macroable), `some_value`)
  t.eq(calls.splice(0), [{this: macroable, args: [`ctx_0`]}])

  t.is(await c.macroNode(`ctx_1`, compilable), compilable)
  t.eq(calls.splice(0), [])

  t.is(await c.macroNode(`ctx_2`, macroableCompilable), `some_value`)
  t.eq(calls.splice(0), [{this: macroableCompilable, args: [`ctx_2`]}])
})

// Also see `test_macro_object_recursive`.
t.test(function test_macro_fun_sync_recursive() {
  const ctx = `some_context`
  const calls = []

  function one() {throw Error(`unreachable`)}
  one.macro = function oneMac(...args) {
    calls.push({this: this, args, fun: one})
    return two
  }

  function two() {throw Error(`unreachable`)}
  two.macro = function twoMac(...args) {
    calls.push({this: this, args, fun: two})
    return three
  }

  function three() {throw Error(`unreachable`)}
  three.macro = function threeMac(...args) {
    calls.push({this: this, args, fun: three})
    return `some_node`
  }

  t.is(c.macroNode(ctx, one), `some_node`)

  t.eq(calls, [
    {this: one,   args: [ctx], fun: one},
    {this: two,   args: [ctx], fun: two},
    {this: three, args: [ctx], fun: three},
  ])
})

// Also see `test_macro_object_recursive`.
await t.test(async function test_macro_fun_async_recursive() {
  const ctx = `some_context`
  const calls = []

  async function one() {throw Error(`unreachable`)}
  one.macro = async function oneMac(...args) {
    calls.push({this: this, args, fun: one})
    return two
  }

  async function two() {throw Error(`unreachable`)}
  two.macro = async function twoMac(...args) {
    calls.push({this: this, args, fun: two})
    return three
  }

  async function three() {throw Error(`unreachable`)}
  three.macro = async function threeMac(...args) {
    calls.push({this: this, args, fun: three})
    return `some_node`
  }

  t.is((await c.macroNode(ctx, one)), `some_node`)

  t.eq(calls, [
    {this: one,   args: [ctx], fun: one},
    {this: two,   args: [ctx], fun: two},
    {this: three, args: [ctx], fun: three},
  ])
})

const funRecContext = `some_error

source function:

[function three]

source function:

[function two]

source function:

[function one]`

t.test(function test_macro_fun_sync_recursive_exception_context() {
  function one() {throw Error(`unreachable`)}
  one.macro = function oneMac() {return two}

  function two() {throw Error(`unreachable`)}
  two.macro = function twoMac() {return three}

  function three() {throw Error(`unreachable`)}
  three.macro = function threeMac() {throw Error(`some_error`)}

  ti.fail(() => c.macroNode(undefined, one), funRecContext)
})

await t.test(async function test_macro_fun_async_recursive_exception_context() {
  async function one() {throw Error(`unreachable`)}
  one.macro = async function oneMac() {return two}

  async function two() {throw Error(`unreachable`)}
  two.macro = async function twoMac() {return three}

  async function three() {throw Error(`unreachable`)}
  three.macro = async function threeMac() {throw Error(`some_error`)}

  await ti.fail(async () => c.macroNode(undefined, one), funRecContext)
})

t.test(function test_macro_fun_sync_terminate_on_identical_result() {
  const ctx = `some_context`
  const calls = []

  function mac() {throw Error(`unreachable`)}

  mac.macro = function macMac(...args) {
    calls.push({this: this, args})
    return mac
  }

  /*
  As a result, the function stays in the AST. Typically, macroing is followed by
  compilation; see `test_compile.mjs` for how we handle function nodes during
  compilation.
  */
  t.is(c.macroNode(ctx, mac), mac)
  t.eq(calls, [{this: mac, args: [ctx]}])
})

await t.test(async function test_macro_fun_async_terminate_on_identical_result() {
  const ctx = `some_context`
  const calls = []

  async function mac() {throw Error(`unreachable`)}

  mac.macro = async function macMac(...args) {
    calls.push({this: this, args})
    return mac
  }

  t.is((await c.macroNode(ctx, mac)), mac)
  t.eq(calls, [{this: mac, args: [ctx]}])
})

await t.test(async function test_macro_promise() {
  async function test(src, exp) {
    t.is(
      await c.macroNode(undefined, Promise.resolve(src)),
      exp,
    )
  }

  function same(src) {return test(src, src)}

  await same(undefined)
  await same(null)
  await same(false)
  await same(true)
  await same(123)
  await same(Object.create(null))

  await test(Promise.resolve(123), 123)

  const obj = Object.create(null)
  obj.macro = function mac() {return `some_value`}
  await test(obj, `some_value`)

  function mac() {throw Error(`unreachable`)}
  mac.macro = function mac() {return `some_value`}
  await test(mac, `some_value`)
})

t.test(function test_macro_unknown_object() {
  function mac(src) {return c.macroNode(undefined, c.reqObj(src))}
  function same(src) {t.is(mac(src), src)}

  same(Object(false))
  same(Object(true))

  same(Object(0n))
  same(Object(123n))
  same(Object(-123n))

  same(Object(0))
  same(Object(123.456))
  same(Object(-123.456))

  same(Object(``))
  same(Object(`str`))

  same(Object.create(null))
  same(Object.create(Object.create(null)))
  same({})
  same({one: 10})
  same(Object.create({one: 10}))

  same({macro() {return this}})
  t.is(mac({macro() {return 10}}), 10)
  t.is(mac({macro() {return ti.macSomeValue}}), `some_value`)
})

t.test(function test_macro_object_recursive() {
  const ctx = `some_context`
  const calls = []

  const one = Object.create(null)
  one.macro = function one(...args) {
    calls.push({this: this, args, ind: 0})
    return two
  }

  const two = {macro(...args) {
    calls.push({this: this, args, ind: 1})
    return three
  }}

  const three = new class Three {
    macro(...args) {
      calls.push({this: this, args, ind: 2})
      return `some_node`
    }
  }()

  t.is(c.macroNode(ctx, one), `some_node`)

  t.eq(calls, [
    {this: one,   args: [ctx], ind: 0},
    {this: two,   args: [ctx], ind: 1},
    {this: three, args: [ctx], ind: 2},
  ])
})

/*
TODO: add symbol async test.

TODO: consolidate with tests for functions, objects, and all other types too.
The intended behavior is that any symbol that references a non-nil value should
be exactly equivalent to whatever it's referencing, in terms of macroing and
compilation.
*/
t.test(function test_macro_symbol_sync() {
  testMacroSymSync(c.macroNode)
  testMacroSymSync(c.macroSym)
})

function testMacroSymSync(fun) {
  let ctx = null
  function mac(src) {return fun(ctx, sym(src))}
  function same(src) {t.is(mac(src), sym(src))}
  function test(src, exp) {t.is(mac(src), exp)}

  ti.fail(() => mac(`one`),           `missing declaration of "one"`)
  ti.fail(() => mac(`one.two`),       `missing declaration of "one"`)
  ti.fail(() => mac(`one.two.three`), `missing declaration of "one"`)

  ti.fail(() => mac(`!@#`),           `missing declaration of "!@#"`)
  ti.fail(() => mac(`!@#.two`),       `missing declaration of "!@#"`)
  ti.fail(() => mac(`!@#.two.three`), `missing declaration of "!@#"`)

  ctx = Object.create(null)
  ctx.one = undefined
  same(`one`)
  same(`one.two`)
  same(`one.two.three`)

  ctx = Object.create(ctx)
  same(`one`)
  same(`one.two`)
  same(`one.two.three`)

  ctx = Object.create(null)
  ctx[`!@#`] = undefined
  same(`!@#`)
  same(`!@#.two`)
  same(`!@#.two.three`)

  ctx = Object.create(ctx)
  same(`!@#`)
  same(`!@#.two`)
  same(`!@#.two.three`)

  ctx = Object.create(null)
  ctx.one = 10
  test(`one`, 10)
  ti.fail(() => mac(`one.two`), `missing property "two" in 10`)
  ti.fail(() => mac(`one.two.three`), `missing property "two" in 10`)

  ctx.one = sym(`two`)
  ti.fail(() => mac(`one`), `missing declaration of "two"`)
  ti.fail(() => mac(`one.two`), `missing property "two" in two`)
  ti.fail(() => mac(`one.three`), `missing property "three" in two`)
  ti.fail(() => mac(`one.two.three`), `missing property "two" in two`)

  ctx.one = {val: 10}
  test(`one`, ctx.one)
  ti.fail(() => mac(`one.two`), `missing property "two" in {val: 10}`)
  ti.fail(() => mac(`one.two.three`), `missing property "two" in {val: 10}`)

  ctx.one = {two: undefined}
  test(`one`, ctx.one)
  test(`one.two`, undefined)
  ti.fail(() => mac(`one.two.three`), `missing property "three" in undefined`)

  ctx.one = {two: 123}
  test(`one`, ctx.one)
  test(`one.two`, 123)
  ti.fail(() => mac(`one.two.three`), `missing property "three" in 123`)

  ctx.one = {macro: undefined}
  test(`one`, ctx.one)

  ctx.one = {macro: 123}
  test(`one`, ctx.one)

  ctx.one = {macro() {return `some_node`}}
  test(`one`, `some_node`)
  ti.fail(() => mac(`one.two`), `missing property "two" in {macro: [function macro]}`)
  ti.fail(() => mac(`one.two.three`), `missing property "two" in {macro: [function macro]}`)

  ctx.one = {macro() {return `some_node`}, two: 123}
  test(`one`, `some_node`)
  test(`one.two`, 123)
  ti.fail(() => mac(`one.two.three`), `missing property "three" in 123`)

  ctx.one = function one() {throw Error(`unreachable`)}
  ti.fail(() => mac(`one`), `unexpected function node [function one] in non-call position`)

  ctx.one.macro = function two() {return `some_node`}
  test(`one`, `some_node`)
  ti.fail(() => mac(`one.two`), `missing property "two" in [function one]`)
  ti.fail(() => mac(`one.two.three`), `missing property "two" in [function one]`)
  ti.fail(() => mac(`one.macro`), `unexpected function node [function two] in non-call position`)
}

t.test(function test_macro_symbol_sync_recursive() {
  const ctx = Object.create(null)

  const calls = []
  function one(...args) {
    calls.push({this: this, args, fun: one})
    return two
  }

  const ref = Object.create(null)
  ref.macro = one
  ctx.one = ref

  function two() {throw Error(`unreachable`)}
  two.macro = function twoMac(...args) {
    calls.push({this: this, args, fun: two})
    return `three`
  }

  t.is(c.macroNode(ctx, sym(`one`)), `three`)

  t.eq(calls, [
    {this: ref, args: [ctx], fun: one},
    {this: two, args: [ctx], fun: two},
  ])
})

/*
List macroing supports invoking functions in the call position, either when the
list head is already a function, or when it's a symbol referencing a function.
Only functions can be called this way, and functions can ONLY be called this
way. In other positions, arbitrary nodes can implement their own macroing by
implementing the `.macro` method. Functions in non-list-head positions without
a `.macro` method cause an immediate exception.
*/
t.test(function test_macro_list_sync() {
  const ctx = Object.create(null)
  function mac(src) {return c.macroNode(ctx, c.reqArr(src))}
  function test(src, exp) {t.eq(mac(src), exp)}

  test([],           [])
  test([10],         [10])
  test([10, 20],     [10, 20])
  test([10, 20, 30], [10, 20, 30])

  const calls = []

  function head(...args) {
    calls.push({this: this, args, fun: head})
    return 10
  }

  function one() {throw Error(`unreachable`)}
  one.macro = function oneMac(...args) {
    calls.push({this: this, args, fun: one})
    return 20
  }

  function two() {throw Error(`unreachable`)}
  two.macro = function twoMac(...args) {
    calls.push({this: this, args, fun: two})
    return 30
  }

  /*
  When a list's head is a function, it should be invoked with the rest of the
  list as its arguments, and its output should replace the entire list. This is
  consistent with the behavior of symbols that reference macro functions in the
  list head position.
  */
  test([head, 40, two, 50], 10)
  t.eq(calls, [{this: ctx, args: [40, two, 50], fun: head}])

  calls.length = 0
  test(
    [40, 50, one, two],
    [40, 50, 20, 30],
  )
  t.eq(calls, [
    {this: one, args: [ctx], fun: one},
    {this: two, args: [ctx], fun: two},
  ])

  ti.fail(() => mac([sym(`one`)]), `missing declaration of "one"

source node:

one

source node:

[one]`)

  ti.fail(() => mac([sym(`one`), 10, sym(`two`), 20]), `missing declaration of "one"

source node:

one

source node:

[one, 10, two, 20]`)

  ti.fail(() => mac([10, sym(`one`)]), `missing declaration of "one"

source node:

one

source node:

[10, one]`)

  ctx.one = undefined
  test([sym(`one`)], [sym(`one`)])

  ti.fail(() => mac([sym(`one`), sym(`two`)]), `missing declaration of "two"

source node:

two

source node:

[one, two]`)

  ctx.two = undefined
  test([sym(`one`), sym(`two`)], [sym(`one`), sym(`two`)])
})

await t.test(async function test_macro_list_async() {
  async function test(src, exp) {
    t.eq((await c.macroNode(undefined, src)), exp)
  }

  test([Promise.resolve(10), 20],                  [10, 20])
  test([10,                  Promise.resolve(20)], [10, 20])
  test([Promise.resolve(10), Promise.resolve(20)], [10, 20])

  async function head() {return 10}

  async function body() {throw Error(`unreachable`)}
  body.macro = function bodyMac() {return 20}

  await test([head], 10)
  await test([30, body], [30, 20])
})

t.test(function test_macro_list_with_macro_symbols() {
  const ctx = Object.create(null)
  function mac(src) {return c.macroNode(ctx, c.reqArr(src))}
  function test(src, exp) {t.eq(mac(src), exp)}

  ti.fail(() => mac([sym(`one`)]), `missing declaration of "one"`)

  const calls = []

  function one(...args) {
    calls.push({this: this, args, fun: one})
    return sym(`two`)
  }

  ctx.one = one

  ti.fail(() => mac([10, sym(`one`)]), `unexpected function node [function one] in non-call position; hint: macro functions may be used in arbitrary positions by implementing the method ".macro" and/or the method ".compile"

source function:

[function one]

source node:

one

source node:

[10, one]`)

  ti.fail(() => mac([sym(`one`), 10, 20]), `missing declaration of "two"`)
  t.eq(calls, [{this: ctx, args: [10, 20], fun: one}])

  function two() {throw Error(`unreachable`)}
  ctx.two = two
  calls.length = 0

  ti.fail(() => mac([sym(`one`), 10, 20]), `unexpected function node [function two] in non-call position`)
  t.eq(calls, [{this: ctx, args: [10, 20], fun: one}])

  two.macro = function twoMac(...args) {
    calls.push({this: this, args, fun: two})
    return 30
  }
  calls.length = 0

  test([sym(`one`), 10, 20], 30)
  t.eq(calls, [
    {this: ctx, args: [10, 20], fun: one},
    {this: two, args: [ctx],    fun: two},
  ])
})

t.test(function test_macro_list_expression_vs_statement_context() {
  const ctxExpr = Object.create(null)
  testListExpressionVsStatementCommon(ctxExpr)
  testListExpressionContext(ctxExpr)

  const ctxStat = c.ctxWithStatement(ctxExpr)
  testListExpressionVsStatementCommon(ctxStat)
  testListStatementContext(ctxStat)
})

function testListExpressionVsStatementCommon(ctx) {
  t.eq(c.macroNode(ctx, []), [])

  t.eq(
    c.macroNode(ctx, [10, ti.macReqExpressionOne]),
    [10, `one`],
  )

  t.eq(
    c.macroNode(ctx, [10, ti.macReqExpressionOne, ti.macReqExpressionTwo]),
    [10, `one`, `two`],
  )

  t.eq(
    c.macroNode(ctx, [10, ti.macReqExpressionOne, ti.macReqExpressionTwo, ti.macReqExpressionThree]),
    [10, `one`, `two`, `three`],
  )
}

function testListExpressionContext(ctx) {
  function mac() {
    t.is(this, ctx)
    return ti.macReqExpression.macro(this)
  }

  t.is(
    c.macroNode(ctx, [mac]),
    `expression_value`,
  )

  t.is(
    c.macroNode(ctx, [mac, ti.unreachable]),
    `expression_value`,
  )

  t.is(
    c.macroNode(ctx, [mac, ti.unreachable, ti.unreachable]),
    `expression_value`,
  )

  ctx.someFun = mac

  t.is(
    c.macroNode(ctx, [sym(`someFun`)]),
    `expression_value`,
  )

  t.is(
    c.macroNode(ctx, [sym(`someFun`), ti.unreachable]),
    `expression_value`,
  )

  t.is(
    c.macroNode(ctx, [sym(`someFun`), ti.unreachable, ti.unreachable]),
    `expression_value`,
  )
}

function testListStatementContext(ctx) {
  function mac() {
    t.is(this, ctx)
    return ti.macReqStatement.macro(this)
  }

  t.is(
    c.macroNode(ctx, [mac]),
    `statement_value`,
  )

  t.is(
    c.macroNode(ctx, [mac, ti.unreachable]),
    `statement_value`,
  )

  t.is(
    c.macroNode(ctx, [mac, ti.unreachable, ti.unreachable]),
    `statement_value`,
  )

  ctx.someFun = mac

  t.is(
    c.macroNode(ctx, [sym(`someFun`)]),
    `statement_value`,
  )

  t.is(
    c.macroNode(ctx, [sym(`someFun`), ti.unreachable]),
    `statement_value`,
  )

  t.is(
    c.macroNode(ctx, [sym(`someFun`), ti.unreachable, ti.unreachable]),
    `statement_value`,
  )
}

t.test(function test_macro_error_context_without_spans() {
  const node = [20, [30, [sym(`one`), 40]]]

  ti.fail(
    () => c.macroNode(c.ctxGlobal, node),
    `missing declaration of "one"

source node:

one

source node:

[one, 40]

source node:

[30, [one, 40]]

source node:

[20, [30, [one, 40]]]`,
  )
})

t.test(function test_macro_error_context_with_spans() {
  const node = [...new c.Reader(`
10
[20 [30 [one 40]]]
50

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

  t.eq(node, [20, [30, [sym(`one`), 40]]])
  t.is(c.nodeSpan(node).view(), `[20 [30 [one 40]]]`)
  t.is(c.nodeSpan(node[1]).view(), `[30 [one 40]]`)
  t.is(c.nodeSpan(node[1][1]).view(), `[one 40]`)

  ti.fail(
    () => c.macroNode(c.ctxGlobal, node),
    `missing declaration of "one"

source node:

one

source node context:

:3:9

…
…[one 40]]]
50

f170f9ac8ac4452da3459f04eecc2a0e
f256285e7c1e44b6ab1ace0e2660f4e3
fc15bdb2fa3e4f9eb030f4ff54f9c25e
f15b26f753b34…

source node context:

:3:5

…
…[30 [one 40]]]
50

f170f9ac8ac4452da3459f04eecc2a0e
f256285e7c1e44b6ab1ace0e2660f4e3
fc15bdb2fa3e4f9eb030f4ff54f9c25e
f15b26f75…

source node context:

:3:1

…
[20 [30 [one 40]]]
50

f170f9ac8ac4452da3459f04eecc2a0e
f256285e7c1e44b6ab1ace0e2660f4e3
fc15bdb2fa3e4f9eb030f4ff54f9c25e
f15b2…`)
})

if (import.meta.main) ti.flush()

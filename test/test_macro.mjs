import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

function sym(val) {return Symbol.for(val)}

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

/*
This tests the edge case where an AST node is a function. Don't confuse this
with the regular case where a symbol references a function. This is when the
AST contains a function DIRECTLY.
*/
t.test(function test_macro_fun_sync_single() {
  const calls = []

  function mac(...args) {
    return Math.pow(3, calls.push({this: this, args}))
  }

  t.is(c.macroNode(10, mac), 3)
  t.eq(calls, [{this: 10, args: []}])

  t.is(c.macroNode(20, mac), 9)
  t.eq(calls, [{this: 10, args: []}, {this: 20, args: []}])
})

t.test(function test_macro_fun_sync_single_exception() {
  const ctx = `some_context`
  function mac() {throw Error(`some_error`)}

  ti.fail(() => c.macroNode(ctx, mac), `some_error

source function:

[function mac]`)

  c.nodeSpanSet(mac, mockSpan())
  t.is(c.nodeContext(mac), mockContext)
  ti.fail(() => c.macroNode(ctx, mac), c.joinParagraphs(`some_error`, mockContext))
})

await t.test(async function test_macro_fun_async_single() {
  const ctx = `some_context`
  async function mac() {throw Error(`some_error`)}

  await ti.fail(
    async () => c.macroNode(ctx, mac),
    `some_error

source function:

[function mac]`,
  )

  c.nodeSpanSet(mac, mockSpan())
  t.is(c.nodeContext(mac), mockContext)
  await ti.fail(async () => c.macroNode(ctx, mac), c.joinParagraphs(`some_error`, mockContext))
})

t.test(function test_macro_fun_sync_recursive() {
  const ctx = `some_context`
  const calls = []

  function one(...args) {
    calls.push({this: this, args, fun: one})
    return two
  }

  function two(...args) {
    calls.push({this: this, args, fun: two})
    return three
  }

  function three(...args) {
    calls.push({this: this, args, fun: three})
    return `some_node`
  }

  t.is(c.macroNode(ctx, one), `some_node`)

  t.eq(calls, [
    {this: ctx, args: [], fun: one},
    {this: ctx, args: [], fun: two},
    {this: ctx, args: [], fun: three},
  ])
})

await t.test(async function test_macro_fun_async_recursive() {
  const ctx = `some_context`
  const calls = []

  async function one(...args) {
    calls.push({this: this, args, fun: one})
    return two
  }

  async function two(...args) {
    calls.push({this: this, args, fun: two})
    return three
  }

  async function three(...args) {
    calls.push({this: this, args, fun: three})
    return `some_node`
  }

  t.is((await c.macroNode(ctx, one)), `some_node`)

  t.eq(calls, [
    {this: ctx, args: [], fun: one},
    {this: ctx, args: [], fun: two},
    {this: ctx, args: [], fun: three},
  ])
})

const funRecContext = `some_error

source function:

[function three]

source function:

[function two]

source function:

[function one]`

t.test(function test_macro_fun_sync_recursive_exception() {
  function one() {return two}
  function two() {return three}
  function three() {throw Error(`some_error`)}
  ti.fail(() => c.macroNode(undefined, one), funRecContext)
})

await t.test(async function test_macro_fun_async_recursive_exception() {
  async function one() {return two}
  async function two() {return three}
  async function three() {throw Error(`some_error`)}
  await ti.fail(async () => c.macroNode(undefined, one), funRecContext)
})

t.test(function test_macro_fun_sync_terminate_on_identical_result() {
  const ctx = `some_context`
  const calls = []

  function mac(...args) {
    calls.push({this: this, args})
    return mac
  }

  /*
  As a result, the function stays in the AST. If the AST is then compiled, the
  function will be invoked again. At that point, it must return a string. None
  of the code that ships with the language relies on this behavior. This comes
  out naturally from other principles. It's unclear if this is ever useful.
  */
  t.is(c.macroNode(ctx, mac), mac)
  t.eq(calls, [{this: ctx, args: []}])
})

await t.test(async function test_macro_fun_async_terminate_on_identical_result() {
  const ctx = `some_context`
  const calls = []

  async function mac(...args) {
    calls.push({this: this, args})
    return mac
  }

  t.is((await c.macroNode(ctx, mac)), mac)
  t.eq(calls, [{this: ctx, args: []}])
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
  await test(function mac() {return `some_value`}, `some_value`)
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

t.test(function test_macro_symbol_sync() {
  testMacroSymSync(c.macroNode)
  testMacroSymSync(c.macroSym)
})

function testMacroSymSync(fun) {
  let ctx = c.ctxGlobal
  function mac(src) {return fun(ctx, c.reqSym(src))}
  function same(src) {t.is(mac(src), src)}

  ti.fail(() => mac(sym(`one`)),           `missing declaration of "one"`)
  ti.fail(() => mac(sym(`one.two`)),       `missing declaration of "one"`)
  ti.fail(() => mac(sym(`one.two.three`)), `missing declaration of "one"`)

  ti.fail(() => mac(sym(`!@#`)),           `missing declaration of "!@#"`)
  ti.fail(() => mac(sym(`!@#.two`)),       `missing declaration of "!@#"`)
  ti.fail(() => mac(sym(`!@#.two.three`)), `missing declaration of "!@#"`)

  ctx = Object.create(ctx)
  ctx.one = undefined
  same(sym(`one`))
  same(sym(`one.two`))
  same(sym(`one.two.three`))

  ctx = Object.create(ctx)
  same(sym(`one`))
  same(sym(`one.two`))
  same(sym(`one.two.three`))

  ctx[`!@#`] = undefined
  same(sym(`!@#`))
  same(sym(`!@#.two`))
  same(sym(`!@#.two.three`))

  ctx.one = {}
  ti.fail(() => mac(sym(`one`)), `unexpected reference "one" to value {}`)
  ti.fail(() => mac(sym(`one.two`)), `missing property "two"`)
  ti.fail(() => mac(sym(`one.two.three`)), `missing property "two"`)

  ctx.one = {two: undefined}
  ti.fail(() => mac(sym(`one`)), `unexpected reference "one" to value {two: undefined}`)
  same(sym(`one.two`))

  ctx.one = {two: 123}
  ti.fail(() => mac(sym(`one`)), `unexpected reference "one" to value {two: 123}`)
  ti.fail(() => mac(sym(`one.two`)), `unexpected reference "one.two" to value 123`)
  ti.fail(() => mac(sym(`one.two.three`)), `missing property "three" in 123`)

  ctx.one = {default: undefined}
  ti.fail(() => mac(sym(`one`)), `unexpected reference "one" to value {default: undefined}`)

  ctx.one = {default: 123}
  ti.fail(() => mac(sym(`one`)), `unexpected reference "one" to value {default: 123}`)

  ctx.one = {default() {return `some_node`}}
  t.is(mac(sym(`one`)), `some_node`)
  ti.fail(() => mac(sym(`one.two`)), `missing property "two" in {default: [function default]}`)
  ti.fail(() => mac(sym(`one.two.three`)), `missing property "two" in {default: [function default]}`)

  ctx.one = {default() {return `some_node`}, two: 123}
  t.is(mac(sym(`one`)), `some_node`)
  ti.fail(() => mac(sym(`one.two`)), `unexpected reference "one.two" to value 123`)
  ti.fail(() => mac(sym(`one.two.three`)), `missing property "three" in 123`)

  ctx.one = function one() {throw Error(`unreachable`)}
  ctx.one.default = function two() {return `some_node`}
  t.is(mac(sym(`one`)), `some_node`)
  ti.fail(() => mac(sym(`one.two`)), `missing property "two" in [function one]`)
  ti.fail(() => mac(sym(`one.two.three`)), `missing property "two" in [function one]`)
}

t.test(function test_macro_symbol_sync_recursive() {
  const ctx = Object.create(null)
  ctx.one = Object.create(null)
  ctx.one.default = one

  function mac(src) {return c.macroNode(ctx, c.reqSym(src))}
  const calls = []

  function one(...args) {
    calls.push({this: this, args, fun: one})
    return two
  }

  function two(...args) {
    calls.push({this: this, args, fun: two})
    return `three`
  }

  t.is(c.macroNode(ctx, sym(`one`)), `three`)

  t.eq(calls, [
    {this: ctx, args: [sym(`one`)], fun: one},
    {this: ctx, args: [],           fun: two},
  ])
})

t.test(function test_macro_list_sync() {
  const ctx = Object.create(null)
  function mac(src) {return c.macroNode(ctx, c.reqArr(src))}
  function test(src, exp) {t.eq(mac(src), exp)}

  test([],           [])
  test([10],         [10])
  test([10, 20],     [10, 20])
  test([10, 20, 30], [10, 20, 30])

  const calls = []

  function one(...args) {
    calls.push({this: this, args, fun: one})
    return 10
  }

  function two(...args) {
    calls.push({this: this, args, fun: two})
    return 20
  }

  /*
  When a list's head is a function, it should be invoked with the rest of the
  list as its arguments, and its output should replace the entire list. This is
  consistent with the behavior of symbols that reference macro functions in the
  list head position.
  */
  test([one, 30, two, 40], 10)
  t.eq(calls, [{this: ctx, args: [30, two, 40], fun: one}])

  calls.length = 0
  test(
    [30, 40, one, two],
    [30, 40, 10, 20],
  )
  t.eq(calls, [
    {this: ctx, args: [], fun: one},
    {this: ctx, args: [], fun: two},
  ])

  ti.fail(() => mac([sym(`one`)]), `missing declaration of "one"

source node:

[one]`)

  ti.fail(() => mac([sym(`one`), 10, sym(`two`), 20]), `missing declaration of "one"

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

  async function one() {return 10}

  await test([one], 10)
  await test([20, one], [20, 10])
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

  ti.fail(() => mac([10, sym(`one`)]), `unexpected reference "one" to value [function one]

source node:

one

source node:

[10, one]`)

  ti.fail(() => mac([sym(`one`), 10, 20]), `missing declaration of "two"`)
  t.eq(calls, [{this: ctx, args: [10, 20], fun: one}])

  function two() {throw Error(`unreachable`)}

  ctx.two = two
  calls.length = 0

  ti.fail(() => mac([sym(`one`), 10, 20]), `unexpected reference "two" to value [function two]`)
  t.eq(calls, [{this: ctx, args: [10, 20], fun: one}])

  function three(...args) {
    calls.push({this: this, args, fun: three})
    return 30
  }

  two.default = three
  calls.length = 0

  test([sym(`one`), 10, 20], 30)
  t.eq(calls, [
    {this: ctx, args: [10, 20],     fun: one},
    {this: ctx, args: [sym(`two`)], fun: three},
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
    return ti.macReqExpression.apply(this, arguments)
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
    return ti.macReqStatement.apply(this, arguments)
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

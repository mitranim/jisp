import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'
import * as p from '../js/prelude.mjs'
import * as m from '../js/mac.mjs'

function sym(val) {return Symbol.for(c.reqStr(val))}
function id(val) {return val}

t.test(function test_export() {
  ti.fail(() => p.export.call(null), `expected module context`)

  let ctx = c.ctxWithModule(null)
  ti.fail(() => p.export.call(ctx), `expected between 1 and 2 inputs, got 0 inputs`)
  ti.fail(() => p.export.call(ctx, 10, 20, 30), `expected between 1 and 2 inputs, got 3 inputs`)
  ti.fail(() => p.export.call(ctx, sym(`one`)), `missing declaration of "one"`)
  ti.fail(() => p.export.call(ctx, sym(`one.two`)), `missing declaration of "one"`)
  ti.fail(() => p.export.call(ctx, sym(`one`), sym(`two.three`)), `missing declaration of "one"`)
  ti.fail(() => p.export.call(ctx, sym(`one.two`), sym(`two.three`)), `missing declaration of "one"`)

  ti.fail(() => p.export.call(ctx, sym(`!@#`)), `missing declaration of "!@#"`)
  ctx[`!@#`] = undefined
  ti.fail(() => p.export.call(ctx, sym(`!@#`)), `export source must be unqualified identifier, got undefined`)
  ctx[`!@#`] = 123
  ti.fail(() => p.export.call(ctx, sym(`!@#`)), `export source must be unqualified identifier, got 123`)
  ctx[`!@#`] = sym(`!@#`)
  ti.fail(() => p.export.call(ctx, sym(`!@#`)), `"!@#" does not represent a valid JS identifier`)

  ti.fail(() => p.export.call(ctx, sym(`await`)), `missing declaration of "await"`)
  ctx.await = sym(`await`)
  ti.fail(() => p.export.call(ctx, sym(`await`)), `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)

  ti.fail(() => p.export.call(ctx, sym(`eval`)), `missing declaration of "eval"`)
  ctx.eval = sym(`eval`)
  ti.fail(() => p.export.call(ctx, sym(`eval`)), `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)

  ctx.one = undefined
  ti.fail(() => p.export.call(ctx, sym(`one.two`)), `export source must be unqualified identifier, got [object KeyRef: {src: undefined, key: "two"}]`)
  ti.fail(() => p.export.call(ctx, sym(`one`)), `export source must be unqualified identifier, got undefined`)

  ctx.one = 123
  ti.fail(() => p.export.call(ctx, sym(`one`)), `export source must be unqualified identifier, got 123`)

  ctx.one = sym(`one`)
  t.is(p.export.call(ctx, sym(`one`)).compile(), `export {one}`)

  ti.fail(() => p.export.call(ctx, sym(`one`), 10), `export alias must be unqualified identifier or string, got 10`)
  ti.fail(() => p.export.call(ctx, sym(`one`), sym(`two.three`)), `export alias must be unqualified identifier or string, got two.three`)
  ti.fail(() => p.export.call(ctx, sym(`one`), sym(`two.!@#`)), `export alias must be unqualified identifier or string, got two.!@#`)

  ti.fail(() => p.export.call(ctx, sym(`one.two`)), `export source must be unqualified identifier, got one.two`)
  ti.fail(() => p.export.call(ctx, sym(`one`), 10), `export alias must be unqualified identifier or string, got 10`)
  ti.fail(() => p.export.call(ctx, sym(`one`), sym(`two.three`)), `export alias must be unqualified identifier or string, got two.three`)
  ti.fail(() => p.export.call(ctx, sym(`one`), sym(`two.!@#`)), `export alias must be unqualified identifier or string, got two.!@#`)

  t.is(p.export.call(ctx, sym(`one`)).compile(), `export {one}`)
  t.is(p.export.call(ctx, sym(`one`), sym(`!@#`)).compile(), `export {one as "!@#"}`)
})

t.test(function test_const() {
  ti.fail(() => p.const.call(null), `expected statement context, got expression context`)

  let ctx = c.ctxWithStatement(null)
  ti.fail(() => p.const.call(ctx), `expected 2 inputs, got 0 inputs`)
  ti.fail(() => p.const.call(ctx, 10), `expected 2 inputs, got 1 inputs`)
  ti.fail(() => p.const.call(ctx, sym(`one.two`), 10), `"one.two" does not represent a valid JS identifier`)
  ti.fail(() => p.const.call(ctx, sym(`!@#`), 10), `"!@#" does not represent a valid JS identifier`)
  ti.fail(() => p.const.call(ctx, sym(`await`), 10), `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)
  ti.fail(() => p.const.call(ctx, sym(`eval`), 10), `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)

  // The RHS should be macroed first, without access to the to-be-declared names.
  ti.fail(
    () => p.const.call(ctx, sym(`one`), sym(`one`)),
    `missing declaration of "one"`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(p.const.call(ctx, sym(`one`), 10).compile(), `const one = 10`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  ti.fail(() => p.const.call(ctx, sym(`one`), 20), `redundant declaration of "one"`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  t.is(p.const.call(ctx, sym(`two`), ti.macReqExpression).compile(), `const two = "expression_value"`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`)})

  ti.fail(() => p.const.call(ctx, sym(`two`), 30), `redundant declaration of "two"`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`)})

  ti.fail(
    () => p.const.call(ctx, sym(`three`), ti.macReqStatement),
    `expected statement context, got expression context`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`)})

  ctx = c.ctxWithStatement(ctx)
  t.is(p.const.call(ctx, sym(`one`), 40).compile(), `const one = 40`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  t.is(p.const.call(ctx, sym(`two`), []).compile(), `const two = undefined`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`)})

  ctx = c.ctxWithModule(ctx)
  t.is(p.const.call(ctx, sym(`one`), 50).compile(), `export const one = 50`)
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined, one: sym(`one`)})
})

// Also see `test_func_param_deconstruction` which covers more cases.
t.test(function test_const_deconstruction() {
  function mac(ctx, src) {return p.const.call(ctx, src, ti.macReqExpression)}

  ti.fail(
    () => mac(c.ctxWithStatement(null), [sym(`one`), sym(`one`)]),
    `redundant declaration of "one"`,
  )

  ti.fail(
    () => mac(c.ctxWithStatement(null), [sym(`one`), [sym(`one`)]]),
    `redundant declaration of "one"`,
  )

  ti.fail(
    () => mac(c.ctxWithStatement(null), undefined),
    `in a list deconstruction, every element must be a symbol or a list, got undefined`,
  )

  ti.fail(
    () => mac(c.ctxWithStatement(null), 10),
    `in a list deconstruction, every element must be a symbol or a list, got 10`,
  )

  const ctx = c.ctxWithStatement(null)

  t.is(mac(ctx, []).compile(), `const [] = "expression_value"`)
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(mac(ctx, [[[]]]).compile(), `const [[[]]] = "expression_value"`)
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(mac(ctx, [sym(`one`)]).compile(), `const [one] = "expression_value"`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  t.is(mac(ctx, [m.symRest, sym(`two`)]).compile(), `const [...two] = "expression_value"`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`)})

  t.is(mac(ctx, [sym(`three`), [sym(`four`), m.symRest, sym(`five`)]]).compile(), `const [three, [four, ...five]] = "expression_value"`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`), three: sym(`three`), four: sym(`four`), five: sym(`five`)})
})

t.test(function test_const_mac() {
  ti.fail(
    () => p.const.mac.call(null),
    `expected statement context, got expression context`,
  )

  const ctx = c.ctxWithStatement(null)

  ti.fail(
    () => p.const.mac.call(ctx),
    `expected 2 inputs, got 0 inputs`,
  )

  ti.fail(
    () => p.const.mac.call(ctx, 10, 20),
    `expected variant of isSym, got 10`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  ti.fail(
    () => p.const.mac.call(ctx, sym(`one`), undefined),
    `expected variant of isSome, got undefined`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  ti.fail(
    () => p.const.mac.call(ctx, sym(`one`), null),
    `expected variant of isSome, got null`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  t.eq(p.const.mac.call(ctx, sym(`one`), 10), [])
  t.own(ctx, {[c.symStatement]: undefined, one: 10})

  ti.fail(
    () => p.const.mac.call(ctx, sym(`one`), 20),
    `redundant declaration of "one"`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: 10})

  t.eq(p.const.mac.call(ctx, sym(`two`), sym(`one`)), [])
  t.own(ctx, {[c.symStatement]: undefined, one: 10, two: 10})

  t.eq(p.const.mac.call(ctx, sym(`three`), ti.macSomeValue), [])
  t.own(ctx, {[c.symStatement]: undefined, one: 10, two: 10, three: `some_value`})

  ctx.four = Object.create(null)
  ctx.four.five = function five(...src) {return src}

  t.eq(p.const.mac.call(ctx, sym(`six`), [sym(`four.five`), 30, 40]), [])

  t.own(ctx, {
    [c.symStatement]: undefined,
    one: 10,
    two: 10,
    three: `some_value`,
    four: ctx.four,
    six: [30, 40],
  })
})

t.test(function test_let() {
  ti.fail(() => p.let.call(null), `expected statement context, got expression context`)

  let ctx = c.ctxWithStatement(null)
  ti.fail(() => p.let.call(ctx), `expected between 1 and 2 inputs, got 0 inputs`)
  ti.fail(() => p.let.call(ctx, sym(`one.two`), 10), `"one.two" does not represent a valid JS identifier`)
  ti.fail(() => p.let.call(ctx, sym(`!@#`), 10), `"!@#" does not represent a valid JS identifier`)

  // The RHS should be macroed first, without access to the to-be-declared names.
  ti.fail(
    () => p.let.call(ctx, sym(`one`), sym(`one`)),
    `missing declaration of "one"`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(p.let.call(ctx, sym(`one`), 10).compile(), `let one = 10`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  ti.fail(
    () => p.let.call(ctx, sym(`one`), 20),
    `redundant declaration of "one"`,
  )

  t.is(p.let.call(ctx, sym(`two`), ti.macReqExpression).compile(), `let two = "expression_value"`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`)})

  ti.fail(
    () => p.let.call(ctx, sym(`two`), 30),
    `redundant declaration of "two"`,
  )

  ti.fail(
    () => p.let.call(ctx, sym(`three`), ti.macReqStatement),
    `expected statement context, got expression context`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`)})

  // This verifies that when a variable is already declared in a super context,
  // re-declaring it in a sub-context creates a new declaration rather than an
  // assignment.
  ctx = c.ctxWithStatement(ctx)
  t.is(p.let.call(ctx, sym(`one`)).compile(), `let one`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  t.is(p.let.call(ctx, sym(`two`), undefined).compile(), `let two = undefined`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`)})

  t.is(p.let.call(ctx, sym(`three`), null).compile(), `let three = null`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`), three: sym(`three`)})

  t.is(p.let.call(ctx, sym(`four`), []).compile(), `let four`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`), three: sym(`three`), four: sym(`four`)})

  ctx = c.ctxWithModule(ctx)
  t.is(p.let.call(ctx, sym(`one`)).compile(), `export let one`)
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined, one: sym(`one`)})

  t.is(p.let.call(ctx, sym(`two`), 50).compile(), `export let two = 50`)
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined, one: sym(`one`), two: sym(`two`)})
})

t.test(function test_if_expression() {
  const ctx = null

  ti.fail(
    () => p.if.call(ctx, 10, 20, 30, 40),
    `expected no more than 3 inputs, got 4 inputs`,
  )

  t.is(p.if.call(ctx), undefined)
  t.eq(p.if.call(ctx, []), [])
  t.is(p.if.call(ctx, [], []).compile(), `(undefined ? undefined : undefined)`)
  t.is(p.if.call(ctx, [], [], []).compile(), `(undefined ? undefined : undefined)`)

  t.is(p.if.call(ctx, undefined), undefined)
  t.is(p.if.call(ctx, null), null)
  t.is(p.if.call(ctx, 10), 10)
  t.is(p.if.call(ctx, `str`), `str`)
  t.is(p.if.call(ctx, ti.macSomeValue), `some_value`)

  ti.fail(() => p.if.call(ctx, ti.macReqStatement), `expected statement context, got expression context null

source node:

{macro: [function reqStatement]}`)

  t.is(p.if.call(ctx, 10, 20).compile(), `(10 ? 20 : undefined)`)
  t.is(p.if.call(ctx, 10, 20, 30).compile(), `(10 ? 20 : 30)`)

  t.is(p.if.call(ctx, ti.macOne, ti.macTwo).compile(), `("one" ? "two" : undefined)`)
  t.is(p.if.call(ctx, ti.macOne, ti.macTwo, ti.macThree).compile(), `("one" ? "two" : "three")`)
})

t.test(function test_if_statement() {
  let ctx = c.ctxWithStatement(null)

  ti.fail(
    () => p.if.call(ctx, 10, 20, 30, 40),
    `expected no more than 3 inputs, got 4 inputs`,
  )

  t.eq(p.if.call(ctx), [])
  t.eq(p.if.call(ctx, []), [])
  t.eq(p.if.call(ctx, [], []), [])
  t.eq(p.if.call(ctx, [], [], []), [])

  t.is(p.if.call(ctx, 10).compile(), `if (10) {}`)
  t.is(p.if.call(ctx, 10, []).compile(), `if (10) {}`)
  t.is(p.if.call(ctx, 10, [], []).compile(), `if (10) {}`)

  t.is(p.if.call(ctx, [], 10).compile(), `if (undefined) 10`)

  t.is(p.if.call(ctx, [], 10, 20).compile(), `if (undefined) 10
else 20`)

  t.is(p.if.call(ctx, 10, [], 20).compile(), `if (10) {}
else 20`)

  t.is(p.if.call(ctx, 10, 20, 30).compile(), `if (10) 20
else 30`)

  t.is(
    p.if.call(
      ctx,
      ti.macReqExpressionOne,
      ti.macReqStatementTwo,
      ti.macReqStatementThree,
    ).compile(),
    `if ("one") "two"
else "three"`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  ctx = c.ctxWithModule(null)
  t.is(p.const.call(ctx, sym(`one`), 10).compile(), `export const one = 10`)
  ctx = c.ctxWithModule(null)

  /*
  This verifies that the branches are macroed in sub-contexts or a sub-context.
  The resulting code in this example is actually invalid syntax in JS because
  the branch statements are declarations which are supposed to be block-scoped
  in strict mode. The same happens with `let`, `function`, and `class`, but not
  with `var`. We're not especially concerned with preventing this at the level
  of our compiler because having a branch consisting of just one declaration
  statement is pretty useless.
  */
  t.is(
    p.if.call(
      ctx,
      ti.macReqExpressionOne,
      [p.const, sym(`two`), 10],
      [p.const, sym(`three`), 20],
    ).compile(),
    `if ("one") const two = 10
else const three = 20`,
  )

  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined})
})

t.test(function test_when() {
  function mac(ctx, ...src) {return c.macroNode(ctx, [m.when, ...src])}

  const expr = Object.create(null)
  const stat = c.ctxWithStatement(expr)

  t.is(mac(expr), undefined)
  t.eq(mac(stat), [])

  t.is(mac(expr, []), undefined)
  t.eq(mac(stat, []), [])

  t.is(mac(expr, [], [[]]).compile(), `(undefined ? undefined : undefined)`)
  t.eq(mac(stat, [], [[]]), [])

  t.is(mac(expr, [], [[]], [[[]]]).compile(), `(undefined ? undefined : undefined)`)
  t.eq(mac(stat, [], [[]], [[[]]]), [])

  t.is(mac(expr, 10).compile(), `(void 10)`)
  t.is(mac(stat, 10).compile(), `void 10`)

  t.is(mac(expr, 10, 20).compile(), `(10 ? 20 : undefined)`)
  t.is(mac(stat, 10, 20).compile(), `if (10) {
20
}`)

  t.is(mac(expr, 10, 20, 30).compile(), `(10 ? (20, 30) : undefined)`)
  t.is(mac(stat, 10, 20, 30).compile(), `if (10) {
20;
30
}`)

  t.is(mac(expr, 10, 20, 30, 40).compile(), `(10 ? (20, 30, 40) : undefined)`)
  t.is(mac(stat, 10, 20, 30, 40).compile(), `if (10) {
20;
30;
40
}`)

  t.is(mac(expr, [], 10, 20, 30, 40).compile(), `(undefined ? (10, 20, 30, 40) : undefined)`)
  t.is(mac(stat, [], 10, 20, 30, 40).compile(), `if (undefined) {
10;
20;
30;
40
}`)

  t.is(mac(expr, ti.macReqExpressionOne, ti.macReqExpressionTwo).compile(), `("one" ? "two" : undefined)`)
  t.is(mac(stat, ti.macReqExpressionOne, ti.macReqStatementTwo).compile(), `if ("one") {
"two"
}`)

  t.is(mac(expr, ti.macReqExpressionOne, ti.macReqExpressionTwo, ti.macReqExpressionThree).compile(), `("one" ? ("two", "three") : undefined)`)
  t.is(mac(stat, ti.macReqExpressionOne, ti.macReqStatementTwo, ti.macReqStatementThree).compile(), `if ("one") {
"two";
"three"
}`)
})

t.test(function test_do_expression() {
  const ctx = null

  t.is(p.do.call(ctx), undefined)
  t.is(p.do.call(ctx, []), undefined)
  t.is(p.do.call(ctx, [], []), undefined)

  t.is(p.do.call(ctx, [], [undefined], [[[]]]).compile(), `undefined()`)
  t.is(p.do.call(ctx, 10).compile(), `10`)
  t.eq(p.do.call(ctx, [10]).compile(), `10()`)
  t.eq(p.do.call(ctx, [[10]]).compile(), `10()()`)
  t.eq(p.do.call(ctx, [undefined]).compile(), `undefined()`)
  t.eq(p.do.call(ctx, [[undefined]]).compile(), `undefined()()`)
  t.is(p.do.call(ctx, 10, []).compile(), `10`)
  t.is(p.do.call(ctx, [], 10, []).compile(), `10`)
  t.is(p.do.call(ctx, 10, 20).compile(), `(10, 20)`)
  t.is(p.do.call(ctx, 10, 20, 30).compile(), `(10, 20, 30)`)
  t.is(p.do.call(ctx, 10, [], 20, [[]], 30).compile(), `(10, 20, 30)`)
  t.is(p.do.call(ctx, 10, [undefined], 20, [[null]], 30).compile(), `(10, undefined(), 20, null()(), 30)`)

  t.is(p.do.call(ctx, ti.macReqExpressionOne).compile(), `"one"`)
  t.is(p.do.call(ctx, [], ti.macReqExpressionOne, []).compile(), `"one"`)
  t.is(p.do.call(ctx, ti.macReqExpressionOne, ti.macReqExpressionTwo).compile(), `("one", "two")`)
})

t.test(function test_do_statement() {
  testBlockStatement(c.ctxWithStatement(null), p.do, id)
})

function testBlockStatement(ctx, fun, comp) {
  const prev = {...ctx}

  t.eq(fun.call(ctx), [])
  t.eq(fun.call(ctx, []), [])
  t.eq(fun.call(ctx, [], []), [])
  t.eq(fun.call(ctx, [], [[[]]]), [])

  t.is(fun.call(ctx, undefined).compile(), comp(`{
undefined
}`))

  t.is(fun.call(ctx, [undefined]).compile(), comp(`{
undefined()
}`))

  t.is(fun.call(ctx, 10).compile(), comp(`{
10
}`))

  t.is(fun.call(ctx, 10, 20).compile(), comp(`{
10;
20
}`))

  t.is(fun.call(ctx, 10, 20, 30).compile(), comp(`{
10;
20;
30
}`))

  t.is(fun.call(ctx, 10, [], 20, [], 30).compile(), comp(`{
10;
20;
30
}`))

  t.is(fun.call(ctx, ti.macReqStatementOne).compile(), comp(`{
"one"
}`))

  t.is(fun.call(ctx, ti.macReqStatementOne, ti.macReqStatementTwo).compile(), comp(`{
"one";
"two"
}`))

  t.is(
    fun.call(ctx, ti.macReqStatementOne, ti.macReqStatementTwo, ti.macReqStatementThree).compile(),
    comp(`{
"one";
"two";
"three"
}`))

  t.is(
    fun.call(
      ctx,
      [p.const, sym(`one`), 10],
      [p.const, sym(`two`), 20],
    ).compile(),
    comp(`{
const one = 10;
const two = 20
}`))

  t.own(ctx, {...prev})
}

t.test(function test_try() {
  ti.fail(
    () => p.try.call(null),
    `expected statement context, got expression context`,
  )

  const ctx = c.ctxWithStatement(null)
  t.eq(p.try.call(ctx), [])
  t.eq(p.try.call(ctx, []), [])
  t.eq(p.try.call(ctx, [], [[]]), [])

  t.is(
    p.try.call(ctx, 10).compile(),
    `{
10
}`)

  t.is(
    p.try.call(ctx, 10, 20).compile(),
    `{
10;
20
}`)

  t.is(
    p.try.call(ctx, [], 10, [[]], 20, [[[]]]).compile(),
    `{
10;
20
}`)

  t.is(
    p.try.call(ctx, ti.macReqStatementOne).compile(),
    `{
"one"
}`)

  t.is(
    p.try.call(ctx, ti.macReqStatementOne, ti.macReqStatementTwo).compile(),
    `{
"one";
"two"
}`)

  ti.fail(
    () => p.try.call(ctx, m.catch),
    `unable to usefully compile function [function $catch]`,
  )

  ti.fail(
    () => p.try.call(ctx, sym(`catch`)),
    `unable to usefully compile function [function $catch]`,
  )

  ti.fail(
    () => p.try.call(ctx, [[m.catch]]),
    `unexpected non-try context {}`,
  )

  t.is(
    p.try.call(ctx, [m.catch]).compile(),
    `try {}
catch {}`)

  t.is(
    p.try.call(ctx, [sym(`catch`)]).compile(),
    `try {}
catch {}`)

  ti.fail(
    () => p.try.call(ctx, [m.catch, undefined]),
    `expected variant of isSym, got undefined`,
  )

  ti.fail(
    () => p.try.call(ctx, [m.catch, 10]),
    `expected variant of isSym, got 10`,
  )

  ti.fail(
    () => p.try.call(ctx, [m.catch, undefined, 10]),
    `expected variant of isSym, got undefined`,
  )

  ti.fail(
    () => p.try.call(ctx, [m.catch, 10, 20]),
    `expected variant of isSym, got 10`,
  )

  ti.fail(
    () => p.try.call(ctx, [m.catch, sym(`!@#`)]),
    `"!@#" does not represent a valid JS identifier`,
  )

  ti.fail(
    () => p.try.call(ctx, [m.catch, sym(`one.two`)]),
    `"one.two" does not represent a valid JS identifier`,
  )

  ti.fail(
    () => p.try.call(ctx, [m.catch, sym(`await`)]),
    `"await" is a keyword in JS`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.try.call(ctx, [m.catch, sym(`one`)]).compile(),
    `try {}
catch (one) {}`)
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.try.call(ctx, [m.catch, sym(`one`), 10]).compile(),
    `try {}
catch (one) {
10
}`)
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.try.call(ctx, [m.catch, sym(`one`), 10, 20]).compile(),
    `try {}
catch (one) {
10;
20
}`)
  t.own(ctx, {[c.symStatement]: undefined})

  ti.fail(
    () => p.try.call(ctx, m.finally),
    `unable to usefully compile function [function $finally]`,
  )

  ti.fail(
    () => p.try.call(ctx, sym(`finally`)),
    `unable to usefully compile function [function $finally]`,
  )

  ti.fail(
    () => p.try.call(ctx, [[m.finally]]),
    `unexpected non-try context {}`,
  )

  t.eq(p.try.call(ctx, [m.finally]), [])
  t.eq(p.try.call(ctx, [sym(`finally`)]), [])

  t.is(
    p.try.call(ctx, [m.finally, 10]).compile(),
    `try {}
finally {
10
}`)

  t.is(
    p.try.call(ctx, [sym(`finally`), 10]).compile(),
    `try {}
finally {
10
}`)

  t.is(
    p.try.call(ctx, [m.finally, ti.macReqStatementOne]).compile(),
    `try {}
finally {
"one"
}`)

  t.is(
    p.try.call(ctx, [m.finally, ti.macReqStatementOne, ti.macReqStatementTwo]).compile(),
    `try {}
finally {
"one";
"two"
}`)

  t.is(
    p.try.call(ctx, [m.catch], [m.finally]).compile(),
    `try {}
catch {}`,
  )

  t.is(
    p.try.call(
      ctx,
      [m.catch, sym(`two`)],
      [m.finally, ti.macReqStatementOne],
    ).compile(),
    `try {}
catch (two) {}
finally {
"one"
}`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.try.call(
      ctx,
      ti.macReqStatementOne,
      [m.catch, sym(`two`)],
      [m.finally, ti.macReqStatementThree],
    ).compile(),
    `try {
"one"
}
catch (two) {}
finally {
"three"
}`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.try.call(
      ctx,
      [m.finally, ti.macReqStatementOne],
      ti.macReqStatementTwo,
      [m.catch, sym(`three`), ti.macReqStatement],
    ).compile(),
    `try {
"two"
}
catch (three) {
"statement_value"
}
finally {
"one"
}`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.try.call(
      ctx,
      [m.catch, sym(`one`),
        [p.const, sym(`two`), 10],
      ],
      [m.finally,
        [p.const, sym(`two`), 20],
      ],
      [p.const, sym(`two`), 30],
    ).compile(),
    `try {
const two = 30
}
catch (one) {
const two = 10
}
finally {
const two = 20
}`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  ti.fail(
    () => p.try.call(
      ctx,
      [m.catch, sym(`one`), [p.const, sym(`one`), 10]],
    ),
    `redundant declaration of "one"`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  ti.fail(
    () => p.try.call(ctx, [m.catch], [m.catch]),
    `unexpected redundant "catch"`,
  )

  ti.fail(
    () => p.try.call(ctx, [m.finally], [m.finally]),
    `unexpected redundant "finally"`,
  )
})

t.test(function test_loop() {
  ti.fail(() => p.loop.call(null), `expected statement context, got expression context`)

  const ctx = c.ctxWithStatement(null)

  t.is(p.loop.call(ctx).compile(), `for (;;) {}`)

  t.is(p.loop.call(ctx, ti.macReqStatementOne).compile(), `for (;;) {
"one"
}`)

  t.is(p.loop.call(ctx, ti.macReqStatementOne, ti.macReqStatementTwo).compile(), `for (;;) {
"one";
"two"
}`)

  t.is(
    p.loop.call(ctx, [p.const, sym(`one`), 10]).compile(), `for (;;) {
const one = 10
}`)
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.loop.call(ctx, sym(`break`), sym(`continue`)).compile(),
    `for (;;) {
break;
continue
}`)
})

t.test(function test_loop_while() {
  ti.fail(() => p.loop.while.call(null), `expected statement context, got expression context`)

  const ctx = c.ctxWithStatement(null)
  ti.fail(() => p.loop.while.call(ctx), `expected at least 1 inputs, got 0 inputs`)

  t.is(p.loop.while.call(ctx, []).compile(), `while (undefined) {}`)
  t.is(p.loop.while.call(ctx, false).compile(), `while (false) {}`)
  t.is(p.loop.while.call(ctx, ti.macReqExpressionOne).compile(), `while ("one") {}`)

  t.is(
    p.loop.while.call(ctx, [], 10).compile(),
    `while (undefined) {
10
}`)

  t.is(
    p.loop.while.call(ctx, 10, 20).compile(),
    `while (10) {
20
}`)

  t.is(
    p.loop.while.call(ctx, 10, 20, 30).compile(),
    `while (10) {
20;
30
}`)

  t.is(
    p.loop.while.call(ctx, ti.macReqExpressionOne, ti.macReqStatementTwo, ti.macReqStatementThree).compile(),
    `while ("one") {
"two";
"three"
}`)

  t.is(
    p.loop.while.call(
      ctx,
      ti.macReqExpressionOne,
      [p.const, sym(`two`), ti.macReqExpressionThree],
    ).compile(),
    `while ("one") {
const two = "three"
}`)
  t.own(ctx, {[c.symStatement]: undefined})

  ti.fail(
    () => p.loop.while.call(ctx, sym(`break`)),
    `missing declaration of "break"`,
  )

  ti.fail(
    () => p.loop.while.call(ctx, sym(`continue`)),
    `missing declaration of "continue"`,
  )

  ti.fail(
    () => p.loop.while.call(ctx, [], [sym(`break`)]),
    `"break" must be mentioned, not called; loop labels are not currently supported`,
  )

  ti.fail(
    () => p.loop.while.call(ctx, [], [sym(`continue`)]),
    `"continue" must be mentioned, not called; loop labels are not currently supported`,
  )

  t.is(
    p.loop.while.call(ctx, [], sym(`break`)).compile(),
    `while (undefined) {
break
}`)

  t.is(
    p.loop.while.call(ctx, [], sym(`continue`)).compile(),
    `while (undefined) {
continue
}`)

  t.is(
    p.loop.while.call(ctx, 10, 20, sym(`break`), 30).compile(),
    `while (10) {
20;
break;
30
}`)

  t.is(
    p.loop.while.call(ctx, 10, 20, sym(`continue`), 30).compile(),
    `while (10) {
20;
continue;
30
}`)

  {
    let tar
    t.is(
      p.loop.while.call(ctx, 10, {macro(val) {tar = val; return []}}).compile(),
      `while (10) {}`,
    )
    t.eq(ti.objFlat(tar), [
      {[c.symStatement]: undefined},
      {[c.symMixin]: undefined, ...m.loopMixin},
      ...ti.objFlat(ctx),
    ])
  }

  {
    const sub = c.ctxWithStatement(ctx)
    sub.break = 123

    let tar
    t.is(
      p.loop.while.call(
        sub,
        10,
        sym(`break`),
        sym(`continue`),
        {macro(val) {tar = val; return []}},
      ).compile(),
      `while (10) {
123;
continue
}`)

    t.eq(ti.objFlat(tar), [
      {[c.symStatement]: undefined},
      {[c.symMixin]: undefined, continue: m.continue},
      ...ti.objFlat(sub),
    ])
  }
})

t.test(function test_loop_iter() {
  ti.fail(
    () => p.loop.iter.call(null),
    `expected statement context, got expression context`,
  )

  const ctx = c.ctxWithStatement(null)

  ti.fail(
    () => p.loop.iter.call(ctx),
    `expected at least 1 inputs, got 0 inputs`,
  )

  ti.fail(
    () => p.loop.iter.call(ctx, 10),
    `expected list that begins with one of: const, let, set; got 10`,
  )

  ti.fail(() => p.loop.iter.call(ctx, [sym(`const`)]), `expected 2 inputs, got 0 inputs`)
  ti.fail(() => p.loop.iter.call(ctx, [sym(`let`)]), `expected 2 inputs, got 0 inputs`)
  ti.fail(() => p.loop.iter.call(ctx, [sym(`set`)]), `expected 2 inputs, got 0 inputs`)

  ti.fail(
    () => p.loop.iter.call(ctx, [sym(`const`), 10, []]),
    `in a list deconstruction, every element must be a symbol or a list, got 10`,
  )

  ti.fail(
    () => p.loop.iter.call(ctx, [sym(`let`), 10, []]),
    `in a list deconstruction, every element must be a symbol or a list, got 10`,
  )

  // Side effect of allowing arbitrary expressions such as property paths.
  t.is(
    p.loop.iter.call(ctx, [sym(`set`), 10, []]).compile(),
    `for (10 of []) {}`,
  )

  t.is(
    p.loop.iter.call(ctx, [sym(`set`), [p.get, 10, 20, 30], []]).compile(),
    `for (10[20][30] of []) {}`,
  )

  t.is(
    p.loop.iter.call(ctx, [sym(`const`), [], []]).compile(),
    `for (const [] of []) {}`,
  )

  t.is(
    p.loop.iter.call(ctx, [sym(`let`), [], []]).compile(),
    `for (let [] of []) {}`,
  )

  t.is(
    p.loop.iter.call(ctx, [sym(`set`), [], []]).compile(),
    `for ([] of []) {}`,
  )

  t.is(
    p.loop.iter.call(ctx, [sym(`const`), sym(`one`), []]).compile(),
    `for (const one of []) {}`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  ti.fail(
    () => p.loop.iter.call(
      ctx,
      [sym(`const`), sym(`one`), []],
      [p.const, sym(`one`), []],
    ),
    `redundant declaration of "one"`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.loop.iter.call(ctx, [sym(`let`), sym(`one`), []]).compile(),
    `for (let one of []) {}`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  ti.fail(
    () => p.loop.iter.call(
      ctx,
      [sym(`let`), sym(`one`), []],
      [p.let, sym(`one`), []],
    ),
    `redundant declaration of "one"`,
  )
  t.own(ctx, {[c.symStatement]: undefined})

  ti.fail(
    () => p.loop.iter.call(ctx, [sym(`set`), sym(`one`), []]),
    `missing declaration of "one"`,
  )

  {
    const ctx = c.ctxWithStatement(null)
    ctx.one = sym(`one`)

    t.is(
      p.loop.iter.call(ctx, [sym(`set`), sym(`one`), []]).compile(),
      `for (one of []) {}`,
    )
    t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

    /*
    In this example, `one` in outer scope is distinct from `one` in inner
    scope. Each iteration of the loop updates the outer `one`. The inner
    declaration of `one` actually makes the outer `one` inaccessible within
    the body of the loop.
    */
    t.is(
      p.loop.iter.call(
        ctx,
        [sym(`set`), sym(`one`), []],
        [p.const, sym(`one`), 10],
        [p.const, sym(`two`), 20],
      ).compile(),
      `for (one of []) {
const one = 10;
const two = 20
}`)
    t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})
  }

  t.is(
    p.loop.iter.call(
      ctx,
      [sym(`const`), sym(`one`), ti.macReqExpressionOne],
      ti.macReqStatementTwo,
      ti.macReqStatementThree,
    ).compile(),
    `for (const one of "one" ?? []) {
"two";
"three"
}`)
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.loop.iter.call(
      ctx,
      [sym(`let`), sym(`one`), ti.macReqExpressionOne],
      ti.macReqStatementTwo,
      ti.macReqStatementThree,
    ).compile(),
    `for (let one of "one" ?? []) {
"two";
"three"
}`)
  t.own(ctx, {[c.symStatement]: undefined})

  {
    const ctx = c.ctxWithStatement(null)
    ctx.one = sym(`one`)

    t.is(
      p.loop.iter.call(
        ctx,
        [sym(`set`), sym(`one`), ti.macReqExpressionOne],
        ti.macReqStatementTwo,
        ti.macReqStatementThree,
      ).compile(),
      `for (one of "one" ?? []) {
"two";
"three"
}`)
    t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})
  }

  t.is(
    p.loop.iter.call(
      ctx,
      [sym(`const`), [sym(`one`), [sym(`two`)]], ti.macReqExpressionOne],
      ti.macReqStatementTwo,
      ti.macReqStatementThree,
    ).compile(),
    `for (const [one, [two]] of "one" ?? []) {
"two";
"three"
}`)
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.loop.iter.call(
      ctx,
      [sym(`let`), [sym(`one`), [sym(`two`)]], ti.macReqExpressionOne],
      ti.macReqStatementTwo,
      ti.macReqStatementThree,
    ).compile(),
    `for (let [one, [two]] of "one" ?? []) {
"two";
"three"
}`)
  t.own(ctx, {[c.symStatement]: undefined})
})

// The implementation is shared with the sync version.
// This needs only a basic sanity check.
t.test(function test_loop_iter_await() {
  t.is(
    p.loop.iter.await.call(
      c.ctxWithStatement(null),
      [sym(`const`), [], ti.macReqExpressionOne],
      ti.macReqStatementTwo,
    ).compile(),
    `for await (const [] of "one" ?? []) {
"two"
}`)
})

t.test(function test_void_bare() {
  let ctx = null
  t.is(p.void.macro(ctx),                    undefined)
  t.is(p.void.macro(ctx, ti.macUnreachable), undefined)

  ctx = c.ctxWithStatement(null)
  t.eq(p.void.macro(ctx),                    undefined)
  t.eq(p.void.macro(ctx, ti.macUnreachable), undefined)
})

t.test(function test_void_expression() {
  const ctx = null

  t.is(p.void.call(ctx), undefined)
  t.is(p.void.call(ctx, []), undefined)
  t.is(p.void.call(ctx, [], []), undefined)
  t.is(p.void.call(ctx, [], [[]]), undefined)

  t.is(p.void.call(ctx, undefined).compile(), `(void undefined)`)
  t.is(p.void.call(ctx, null).compile(), `(void null)`)
  t.is(p.void.call(ctx, 10).compile(), `(void 10)`)
  t.is(p.void.call(ctx, 10, 20).compile(), `(void (10, 20))`)
  t.is(p.void.call(ctx, 10, 20, 30).compile(), `(void (10, 20, 30))`)
  t.is(p.void.call(ctx, 10, [], 20, [], 30).compile(), `(void (10, 20, 30))`)
  t.is(p.void.call(ctx, [[undefined]], [[[null]]]).compile(), `(void (undefined()(), null()()()))`)

  t.is(
    p.void.call(ctx, ti.macReqExpressionOne).compile(),
    `(void "one")`,
  )

  t.is(
    p.void.call(ctx, ti.macReqExpressionOne, ti.macReqExpressionTwo).compile(),
    `(void ("one", "two"))`,
  )
})

t.test(function test_void_statement() {
  const ctx = c.ctxWithStatement(null)

  t.eq(p.void.call(ctx), [])
  t.eq(p.void.call(ctx, []), [])
  t.eq(p.void.call(ctx, [], []), [])
  t.eq(p.void.call(ctx, [], [[]]), [])

  t.is(p.void.call(ctx, undefined).compile(), `void undefined`)
  t.is(p.void.call(ctx, null).compile(), `void null`)
  t.is(p.void.call(ctx, 10).compile(), `void 10`)
  t.is(p.void.call(ctx, 10, 20).compile(), `void (10, 20)`)
  t.is(p.void.call(ctx, 10, 20, 30).compile(), `void (10, 20, 30)`)
  t.is(p.void.call(ctx, 10, [], 20, [], 30).compile(), `void (10, 20, 30)`)
  t.is(p.void.call(ctx, [[undefined]], [[[null]]]).compile(), `void (undefined()(), null()()())`)

  t.is(
    p.void.call(ctx, ti.macReqExpressionOne).compile(),
    `void "one"`,
  )

  t.is(
    p.void.call(ctx, ti.macReqExpressionOne, ti.macReqExpressionTwo).compile(),
    `void ("one", "two")`,
  )
})

t.test(function test_ret_bare() {
  ti.fail(() => m.ret.macro(null), `expected statement context, got expression context`)
  ti.fail(() => m.ret.macro(null, ti.macUnreachable), `expected statement context, got expression context`)

  const ctx = c.ctxWithStatement(null)
  t.is(m.ret.macro(ctx).compile(), `return`)
  t.is(m.ret.macro(ctx, ti.macUnreachable).compile(), `return`)
})

t.test(function test_ret_statement() {
  ti.fail(() => m.ret.call(null), `expected statement context, got expression context`)
  ti.fail(() => m.ret.call(null, 10), `expected statement context, got expression context`)

  const ctx = c.ctxWithStatement(null)
  ti.fail(() => m.ret.call(ctx, sym(`one`)), `missing declaration of "one"`)
  ti.fail(() => m.ret.call(ctx, ti.macUnreachable), `unreachable`)

  t.is(m.ret.call(ctx).compile(), `return`)
  t.is(m.ret.call(ctx, []).compile(), `return`)
  t.is(m.ret.call(ctx, [[]]).compile(), `return`)
  t.is(m.ret.call(ctx, undefined).compile(), `return undefined`)
  t.is(m.ret.call(ctx, null).compile(), `return null`)
  t.is(m.ret.call(ctx, 10).compile(), `return 10`)
  t.is(m.ret.call(ctx, ti.macReqExpression).compile(), `return "expression_value"`)

  t.is(
    m.ret.call(ctx, 10, 20).compile(),
    `{
10;
return 20
}`)

  t.is(
    m.ret.call(ctx, ti.macReqStatementOne, ti.macReqExpressionTwo).compile(),
    `{
"one";
return "two"
}`)

  t.is(
    m.ret.call(ctx, 10, 20, 30).compile(),
    `{
10;
20;
return 30
}`)

  t.is(
    m.ret.call(ctx, ti.macReqStatementOne, ti.macReqStatementTwo, ti.macReqExpressionThree).compile(),
    `{
"one";
"two";
return "three"
}`)

  t.is(
    m.ret.call(ctx, [], ti.macReqStatementOne, [[]], ti.macReqStatementTwo, [[[]]], ti.macReqStatementThree, []).compile(),
    `{
"one";
"two";
"three";
return
}`)

  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    m.ret.call(ctx, [m.const, sym(`one`), 10], []).compile(),
    `{
const one = 10;
return
}`)

  t.own(ctx, {[c.symStatement]: undefined})
})

t.test(function test_guard() {
  function mac(ctx, ...src) {return c.macroNode(ctx, [m.guard, ...src])}

  ti.fail(() => mac(null), `expected statement context, got expression context`)
  const ctx = c.ctxWithStatement(null)

  t.is(mac(ctx).compile(), `if (undefined) return`)
  t.is(mac(ctx, 10).compile(), `if (10) return`)
  t.is(mac(ctx, 10, 20).compile(), `if (10) return 20`)

  t.is(mac(ctx, 10, 20, 30).compile(), `if (10) {
20;
return 30
}`)

  t.is(mac(ctx, 10, 20, 30, 40).compile(), `if (10) {
20;
30;
return 40
}`)

  t.is(
    mac(
      ctx,
      ti.macReqExpressionOne,
      ti.macReqStatementTwo,
      ti.macReqStatementThree,
      ti.macReqExpression,
    ).compile(), `if ("one") {
"two";
"three";
return "expression_value"
}`)

  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    mac(ctx, 10, [p.const, sym(`one`), 20], 30).compile(),
    `if (10) {
const one = 20;
return 30
}`)

  t.own(ctx, {[c.symStatement]: undefined})
})

function testFuncInvalid(ctx) {
  ti.fail(() => p.func.call(ctx),                 `expected at least 1 inputs, got 0 inputs`)
  ti.fail(() => p.func.call(ctx, 10),             `expected variant of isSym, got 10`)
  ti.fail(() => p.func.call(ctx, sym(`one.two`)), `"one.two" does not represent a valid JS identifier`)
  ti.fail(() => p.func.call(ctx, sym(`!@#`)),     `"!@#" does not represent a valid JS identifier`)
  ti.fail(() => p.func.call(ctx, sym(`await`)),   `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)
  ti.fail(() => p.func.call(ctx, sym(`eval`)),    `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)
}

t.test(function test_func_expression() {
  const ctx = Object.create(null)
  testFuncInvalid(ctx)

  /*
  Most of the behaviors below are also common between expression and statement
  modes, but testing them in both modes would be inconvenient because between
  expression and statement mode, there is a difference in which context layer
  we declare the function, which messes with some parts of the test. All other
  behaviors should be identical between the two modes.
  */

  ti.fail(
    () => p.func.call(null, sym(`one`), 10),
    `function parameters must be either nil, a symbol, or a list deconstruction, got 10`,
  )

  ti.fail(
    () => p.func.call(null, sym(`one`), [10]),
    `in a list deconstruction, every element must be a symbol or a list, got 10`,
  )

  ti.fail(
    () => p.func.call(ctx, sym(`one`), [], sym(`two`)),
    `missing declaration of "two"`,
  )
  t.own(ctx, {})

  ti.fail(
    () => p.func.call(ctx, sym(`one`), [sym(`one`)], sym(`two`)),
    `missing declaration of "two"`,
  )
  t.own(ctx, {})

  t.is(
    p.func.call(ctx, sym(`one`)).compile(),
    `function one () {}`,
  )
  t.own(ctx, {})

  t.is(
    p.func.call(ctx, sym(`one`), []).compile(),
    `function one () {}`,
  )
  t.own(ctx, {})

  // Function name should be in scope in function body.
  t.is(
    p.func.call(ctx, sym(`one`), [], sym(`one`)).compile(),
    `function one () {
return one
}`)
  t.own(ctx, {})

  // Should be able to redeclare function name in parameters.
  t.is(
    p.func.call(ctx, sym(`one`), [sym(`one`)], sym(`one`)).compile(),
    `function one (one) {
return one
}`)
  t.own(ctx, {})

  // Should be able to redeclare function name in function body.
  t.is(
    p.func.call(ctx, sym(`one`), [], [p.const, sym(`one`), 10], []).compile(),
    `function one () {
const one = 10;
return
}`)
  t.own(ctx, {})

  // Function parameters and body should have the same scope.
  ti.fail(
    () => p.func.call(ctx, sym(`one`), [sym(`one`)], [p.const, sym(`one`), 10], []),
    `redundant declaration of "one"`,
  )
  t.own(ctx, {})

  // Function parameters and body should have the same scope.
  ti.fail(
    () => p.func.call(ctx, sym(`one`), [sym(`two`)], [p.const, sym(`two`), 10], []),
    `redundant declaration of "two"`,
  )
  t.own(ctx, {})

  t.is(
    p.func.call(ctx, sym(`one`), [sym(`two`)], sym(`two`)).compile(),
    `function one (two) {
return two
}`)
  t.own(ctx, {})

  ti.fail(
    () => p.func.call(ctx, sym(`one`), [sym(`two`), sym(`two`)]),
    `redundant declaration of "two"`,
  )

  t.is(
    p.func.call(ctx, sym(`one`), [sym(`two`), sym(`three`)], 10).compile(),
    `function one (two, three) {
return 10
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [sym(`two`), sym(`three`)], 10, 20).compile(),
    `function one (two, three) {
10;
return 20
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [sym(`two`), sym(`three`)], 10, 20, 30).compile(),
    `function one (two, three) {
10;
20;
return 30
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [], ti.macReqExpressionOne).compile(),
    `function one () {
return "one"
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [], ti.macReqStatementOne, ti.macReqExpressionTwo).compile(),
    `function one () {
"one";
return "two"
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [], ti.macReqStatementOne, ti.macReqStatementTwo, ti.macReqExpressionThree).compile(),
    `function one () {
"one";
"two";
return "three"
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [], [[[]]]).compile(),
    `function one () {
return
}`)

  t.is(
    p.func.call(ctx, sym(`one`), [], [[[]]], 10, [[[]]]).compile(),
    `function one () {
10;
return
}`)
})

t.test(function test_func_statement() {
  const ctx = c.ctxWithStatement(null)
  testFuncInvalid(ctx)
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.func.call(ctx, sym(`one`), []).compile(),
    `function one () {}`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  ti.fail(
    () => p.func.call(ctx, sym(`one`), []),
    `redundant declaration of "one"`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  // Function name should be in scope in function body.
  t.is(
    p.func.call(ctx, sym(`two`), [], sym(`two`)).compile(),
    `function two () {
return two
}`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`)})

  // Should be able to redeclare function name in parameters.
  t.is(
    p.func.call(ctx, sym(`three`), [sym(`three`)], sym(`three`)).compile(),
    `function three (three) {
return three
}`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`), three: sym(`three`)})

  // Should be able to redeclare function name in function body.
t.is(
  p.func.call(ctx, sym(`four`), [], [p.const, sym(`four`), 10], []).compile(),
  `function four () {
const four = 10;
return
}`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`), three: sym(`three`), four: sym(`four`)})

  // Function parameters and body should have the same scope.
  ti.fail(
    () => p.func.call(ctx, sym(`five`), [sym(`five`)], [p.const, sym(`five`), 10], []),
    `redundant declaration of "five"`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`), three: sym(`three`), four: sym(`four`), five: sym(`five`)})

  t.is(
    p.func.call(ctx, sym(`six`), [], ti.macReqStatementOne, ti.macReqStatementTwo, ti.macReqExpressionThree).compile(),
    `function six () {
"one";
"two";
return "three"
}`
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`), three: sym(`three`), four: sym(`four`), five: sym(`five`), six: sym(`six`)})
})

t.test(function test_func_export() {
  let ctx = c.ctxWithModule(null)

  t.is(
    p.func.call(ctx, sym(`one`), []).compile(),
    `export function one () {}`,
  )
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined, one: sym(`one`)})

  ctx = c.ctxWithStatement(ctx)

  t.is(
    p.func.call(ctx, sym(`one`), []).compile(),
    `function one () {}`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})
})

t.test(function test_func_mixin() {
  function test(ctx) {
    t.is(
      p.func.call(ctx, sym(`one`), [], {macro(val) {ctx = val}}, []).compile(),
      `function one () {
undefined;
return
}`)
    return ctx
  }

  // In expression mode, the declaration is made in the mixin scope.
  t.eq(ti.objFlat(test(null)), [
    {[c.symStatement]: undefined},
    {[c.symMixin]: undefined, ...m.funcMixin, one: sym(`one`)},
  ])

  // In statement mode, the declaration is made in the outer scope.
  t.eq(ti.objFlat(test(c.ctxWithStatement(null))), [
    {[c.symStatement]: undefined},
    {[c.symMixin]: undefined, ...m.funcMixin},
    {[c.symStatement]: undefined, one: sym(`one`)},
  ])

  {
    const ctx = Object.create(null)
    ctx.ret = 10

    t.eq(ti.objFlat(test(ctx)), [
      {[c.symStatement]: undefined},
      {[c.symMixin]: undefined, guard: m.guard, arguments: sym(`arguments`), this: sym(`this`), one: sym(`one`)},
      {ret: 10},
    ])
  }

  {
    const ctx = Object.create(null)
    ctx.ret = 10
    ctx.arguments = 20
    ctx.this = 30

    t.eq(ti.objFlat(test(ctx)), [
      {[c.symStatement]: undefined},
      {[c.symMixin]: undefined, guard: m.guard, one: sym(`one`)},
      {ret: 10, arguments: 20, this: 30},
    ])
  }

  {
    const ctx = Object.create(null)
    ctx.ret = 10
    ctx.arguments = 20
    ctx.this = 30
    ctx.one = 40

    t.eq(ti.objFlat(test(ctx)), [
      {[c.symStatement]: undefined},
      // Unlike the other "mixin" properties, the function's name is added to
      // its mixin scope unconditionally.
      {[c.symMixin]: undefined, guard: m.guard, one: sym(`one`)},
      {ret: 10, arguments: 20, this: 30, one: 40},
    ])
  }

  {
    let ctx = null
    t.is(
      p.func.call(ctx, sym(`ret`), [], {macro(val) {ctx = val}}, []).compile(),
      `function ret () {
undefined;
return
}`)

    t.eq(ti.objFlat(ctx), [
      {[c.symStatement]: undefined},
      // Function name takes priority over mixin properties.
      {[c.symMixin]: undefined, guard: m.guard, arguments: sym(`arguments`), this: sym(`this`), ret: sym(`ret`)},
    ])
  }
})

t.test(function test_func_param_deconstruction() {
  function mac(src) {return p.func.call(null, sym(`one`), src)}
  function test(src, exp) {t.is(mac(src).compile(), exp)}

  test(undefined, `function one () {}`)

  test(sym(`one`), `function one (...one) {}`)
  test(sym(`two`), `function one (...two) {}`)

  test([], `function one () {}`)
  test([[]], `function one ([]) {}`)
  test([[[]]], `function one ([[]]) {}`)

  test([sym(`two`)], `function one (two) {}`)
  test([[sym(`two`)]], `function one ([two]) {}`)
  test([[[sym(`two`)]]], `function one ([[two]]) {}`)

  test([[], sym(`two`)], `function one ([], two) {}`)
  test([[], [sym(`two`)]], `function one ([], [two]) {}`)
  test([[], [[sym(`two`)]]], `function one ([], [[two]]) {}`)

  test([[], sym(`two`), [[]]], `function one ([], two, [[]]) {}`)
  test([[], [sym(`two`)], [[]]], `function one ([], [two], [[]]) {}`)
  test([[], [[sym(`two`)]], [[]]], `function one ([], [[two]], [[]]) {}`)

  test([sym(`two`), sym(`three`)], `function one (two, three) {}`)
  test([[sym(`two`), sym(`three`)]], `function one ([two, three]) {}`)
  test([[[sym(`two`), sym(`three`)]]], `function one ([[two, three]]) {}`)

  test([sym(`two`), sym(`three`)], `function one (two, three) {}`)
  test([[sym(`two`), [sym(`three`)]]], `function one ([two, [three]]) {}`)
  test([[[sym(`two`), [[sym(`three`)]]]]], `function one ([[two, [[three]]]]) {}`)
  test([[[sym(`two`), [sym(`three`), sym(`four`)]]]], `function one ([[two, [three, four]]]) {}`)

  ti.fail(
    () => mac([m.symRest]),
    `rest symbol ${c.show(m.symRest.description)} must be followed by exactly one node, found 0 nodes`,
  )

  ti.fail(
    () => mac([[m.symRest]]),
    `rest symbol ${c.show(m.symRest.description)} must be followed by exactly one node, found 0 nodes`,
  )

  ti.fail(
    () => mac([sym(`one`), [m.symRest]]),
    `rest symbol ${c.show(m.symRest.description)} must be followed by exactly one node, found 0 nodes`,
  )

  ti.fail(
    () => mac([m.symRest, [], []]),
    `rest symbol ${c.show(m.symRest.description)} must be followed by exactly one node, found 2 nodes`,
  )

  ti.fail(
    () => mac([m.symRest, sym(`one`), sym(`two`)]),
    `rest symbol ${c.show(m.symRest.description)} must be followed by exactly one node, found 2 nodes`,
  )

  ti.fail(
    () => mac([m.symRest, []]),
    `expected variant of isSym, got []`,
  )

  ti.fail(
    () => mac([m.symRest, 10]),
    `expected variant of isSym, got 10`,
  )

  ti.fail(
    () => mac([m.symRest, [sym(`two`)]]),
    `expected variant of isSym, got [two]`,
  )

  ti.fail(
    () => mac([m.symRest, m.symRest]),
    c.show(m.symRest.description) + ` does not represent a valid JS identifier`,
  )

  ti.fail(
    () => mac([m.symRest, sym(`one.two`)]),
    `"one.two" does not represent a valid JS identifier`,
  )

  test([m.symRest, sym(`two`)], `function one (...two) {}`)

  test(
    [sym(`two`), m.symRest, sym(`three`)],
    `function one (two, ...three) {}`,
  )

  test(
    [sym(`two`), [m.symRest, sym(`three`)]],
    `function one (two, [...three]) {}`,
  )

  test(
    [sym(`two`), [sym(`three`), m.symRest, sym(`four`)]],
    `function one (two, [three, ...four]) {}`,
  )

  ti.fail(
    () => mac([sym(`one`), m.symRest, sym(`one`)]),
    `redundant declaration of "one"`,
  )

  ti.fail(
    () => mac([sym(`one`), [sym(`one`)]]),
    `redundant declaration of "one"`,
  )

  ti.fail(
    () => mac([sym(`one`), [m.symRest, sym(`one`)]]),
    `redundant declaration of "one"`,
  )

  let ctx
  t.is(
    p.func.call(null,
      sym(`one`),
      [sym(`two`), [sym(`three`), m.symRest, sym(`four`)]],
      {macro(val) {ctx = val; return sym(`one`)}},
      [],
    ).compile(),
    `function one (two, [three, ...four]) {
one;
return
}`)

  t.eq(ti.objFlat(ctx), [
    {[c.symStatement]: undefined, two: sym(`two`), three: sym(`three`), four: sym(`four`)},
    {[c.symMixin]: undefined, ...m.funcMixin, one: sym(`one`)},
  ])
})

t.test(function test_class_invalid() {
  ti.fail(() => p.class.call(null),                 `expected at least 1 inputs, got 0 inputs`)
  ti.fail(() => p.class.call(null, 10),             `expected variant of isSym, got 10`)
  ti.fail(() => p.class.call(null, sym(`one.two`)), `"one.two" does not represent a valid JS identifier`)
  ti.fail(() => p.class.call(null, sym(`!@#`)),     `"!@#" does not represent a valid JS identifier`)
  ti.fail(() => p.class.call(null, sym(`await`)),   `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)
  ti.fail(() => p.class.call(null, sym(`eval`)),    `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)
})

t.test(function test_fn_empty() {
  function test(ctx) {
    t.is(p.fn.call(ctx).compile(), `(() => {})`)
  }

  test(null)
  test(c.ctxWithStatement(null))
})

t.test(function test_fn_expr() {
  function test(ctx) {
    t.is(p.fn.call(ctx, []).compile(), `(() => {})`)
    t.is(p.fn.call(ctx, 10).compile(), `(() => 10)`)
    t.is(p.fn.call(ctx, ti.macReqExpression).compile(), `(() => "expression_value")`)

    ti.fail(() => p.fn.call(ctx, sym(`ret`)), `missing declaration of "ret"`)
    ti.fail(() => p.fn.call(ctx, sym(`guard`)), `missing declaration of "guard"`)

    t.is(p.fn.call(ctx, sym(`$0`)).compile(), `(($0) => $0)`)
    t.is(p.fn.call(ctx, sym(`$1`)).compile(), `(($0, $1) => $1)`)
    t.is(p.fn.call(ctx, sym(`$2`)).compile(), `(($0, $1, $2) => $2)`)
    t.is(p.fn.call(ctx, sym(`$6`)).compile(), `(($0, $1, $2, $3, $4, $5, $6) => $6)`)
    t.is(p.fn.call(ctx, [p.add, sym(`$0`), sym(`$0`)]).compile(), `(($0) => ($0 + $0))`)
    t.is(p.fn.call(ctx, [p.add, sym(`$0`), sym(`$6`)]).compile(), `(($0, $1, $2, $3, $4, $5, $6) => ($0 + $6))`)
    t.is(p.fn.call(ctx, [p.add, sym(`$6`), sym(`$0`)]).compile(), `(($0, $1, $2, $3, $4, $5, $6) => ($6 + $0))`)
    t.is(p.fn.call(ctx, [p.add, sym(`$3`), sym(`$6`)]).compile(), `(($0, $1, $2, $3, $4, $5, $6) => ($3 + $6))`)
    t.is(p.fn.call(ctx, [p.add, sym(`$6`), sym(`$3`)]).compile(), `(($0, $1, $2, $3, $4, $5, $6) => ($6 + $3))`)
    t.is(p.fn.call(ctx, [p.add, sym(`$6`), sym(`$6`)]).compile(), `(($0, $1, $2, $3, $4, $5, $6) => ($6 + $6))`)
    t.is(p.fn.call(ctx, [[[sym(`$0`)]]]).compile(), `(($0) => $0()()())`)
  }

  test(null)
  test(c.ctxWithStatement(null))
})

t.test(function test_fn_block() {
  function test(ctx) {
    t.is(p.fn.call(ctx, [], [[]]).compile(), `(() => {
return
})`)

    t.is(p.fn.call(ctx, 10, []).compile(), `(() => {
10;
return
})`)

    t.is(p.fn.call(ctx, 10, 20).compile(), `(() => {
10;
return 20
})`)

    t.is(p.fn.call(ctx, [], 10, [[]], 20, [[[]]]).compile(), `(() => {
10;
20;
return
})`)

    t.is(p.fn.call(ctx, ti.macReqStatementOne, ti.macReqStatementTwo, ti.macReqExpressionThree).compile(), `(() => {
"one";
"two";
return "three"
})`)

    t.is(p.fn.call(ctx, [], sym(`$0`)).compile(), `(($0) => {
return $0
})`)

    t.is(p.fn.call(ctx, [], sym(`$1`)).compile(), `(($0, $1) => {
return $1
})`)

    t.is(p.fn.call(ctx, [], sym(`$0`), sym(`$1`)).compile(), `(($0, $1) => {
$0;
return $1
})`)

    t.is(p.fn.call(ctx, [], sym(`$2`)).compile(), `(($0, $1, $2) => {
return $2
})`)

    t.is(p.fn.call(ctx, [], sym(`$0`), sym(`$1`), sym(`$2`)).compile(), `(($0, $1, $2) => {
$0;
$1;
return $2
})`)

    t.is(p.fn.call(ctx, [], sym(`$6`)).compile(), `(($0, $1, $2, $3, $4, $5, $6) => {
return $6
})`)

    t.is(p.fn.call(ctx, [], [p.add, sym(`$0`), sym(`$0`)]).compile(), `(($0) => {
return ($0 + $0)
})`)

    t.is(p.fn.call(ctx, [], [p.add, sym(`$0`), sym(`$6`)]).compile(), `(($0, $1, $2, $3, $4, $5, $6) => {
return ($0 + $6)
})`)

    t.is(p.fn.call(ctx, [], [p.add, sym(`$6`), sym(`$0`)]).compile(), `(($0, $1, $2, $3, $4, $5, $6) => {
return ($6 + $0)
})`)

    t.is(p.fn.call(ctx, [], [p.add, sym(`$3`), sym(`$6`)]).compile(), `(($0, $1, $2, $3, $4, $5, $6) => {
return ($3 + $6)
})`)

    t.is(p.fn.call(ctx, [], [p.add, sym(`$6`), sym(`$3`)]).compile(), `(($0, $1, $2, $3, $4, $5, $6) => {
return ($6 + $3)
})`)

    t.is(p.fn.call(ctx, [], [p.add, sym(`$6`), sym(`$6`)]).compile(), `(($0, $1, $2, $3, $4, $5, $6) => {
return ($6 + $6)
})`)

    t.is(p.fn.call(ctx, [p.subtract, sym(`$0`)], [p.add, sym(`$6`), sym(`$6`)]).compile(), `(($0, $1, $2, $3, $4, $5, $6) => {
(- $0);
return ($6 + $6)
})`)

    t.is(p.fn.call(ctx, [sym(`$0`)], [[sym(`$1`)]], [[[sym(`$2`)]]]).compile(), `(($0, $1, $2) => {
$0();
$1()();
return $2()()()
})`)

    t.is(
      p.fn.call(ctx,
        [p.set, sym(`$1`), sym(`$0`)],
        [p.set, sym(`$0`), sym(`$1`)],
        [],
      ).compile(), `(($0, $1) => {
$1 = $0;
$0 = $1;
return
})`)

    t.is(
      p.fn.call(ctx,
        sym(`ret`),
        [sym(`ret`), 10],
        [sym(`ret`), 20, 30],
        [sym(`guard`)],
        [sym(`guard`), 40],
        [sym(`guard`), 50, 60],
        [],
      ).compile(), `(() => {
return;
return 10;
{
20;
return 30
};
if (undefined) return;
if (40) return;
if (50) return 60;
return
})`)
  }

  test(null)
  test(c.ctxWithStatement(null))

  {
    const ctx = c.ctxWithStatement(null)

    t.is(
      p.fn.call(ctx,
        [p.const, sym(`one`), sym(`$0`)],
        [p.let, sym(`two`), sym(`$1`)],
        sym(`$2`),
      ).compile(), `(($0, $1, $2) => {
const one = $0;
let two = $1;
return $2
})`)

    t.own(ctx, {[c.symStatement]: undefined})
  }
})

t.test(function test_class_declaration_and_export() {
  function run(ctx) {
    return [
      p.class.call(ctx, sym(`one`), {macro(val) {ctx = val; return []}}),
      ctx,
    ]
  }

  {
    const ctx = Object.create(null)
    const [out, sub] = run(ctx)

    t.is(out.compile(), `class one {}`)

    t.own(ctx, {})

    t.eq(ti.objFlat(sub), [
      {[m.symClass]: undefined},
      // In expression mode, the declaration is made in the mixin scope.
      {[c.symMixin]: undefined, ...m.classMixin, one: sym(`one`)},
      ctx,
    ])
  }

  {
    const ctx = c.ctxWithStatement(null)
    const [out, sub] = run(ctx)

    t.is(out.compile(), `class one {}`)

    // In statement mode, the declaration is made in the outer scope.
    t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

    t.eq(ti.objFlat(sub), [
      {[m.symClass]: undefined},
      {[c.symMixin]: undefined, ...m.classMixin},
      ctx,
    ])
  }

  {
    const ctx = c.ctxWithModule(null)
    const [out, sub] = run(ctx)

    t.is(out.compile(), `export class one {}`)

    t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined, one: sym(`one`)})

    t.eq(ti.objFlat(sub), [
      {[m.symClass]: undefined},
      {[c.symMixin]: undefined, ...m.classMixin},
      ctx,
    ])
  }
})

t.test(function test_extend() {
  ti.fail(
    () => m.extend.call(null),
    `unexpected non-class context null`,
  )

  function test(src, exp) {
    t.is(
      p.class.call(null, sym(`one`), src).compile(),
      exp,
    )
  }

  test([m.extend], `class one {}`)
  test([sym(`extend`)], `class one {}`)

  test([m.extend, []], `class one {}`)
  test([sym(`extend`), []], `class one {}`)

  test([m.extend, [], [[]]], `class one {}`)
  test([sym(`extend`), [], [[]]], `class one {}`)

  test([m.extend, 10], `class one extends 10 {}`)
  test([m.extend, 10, 20], `class one extends 20(10) {}`)
  test([m.extend, 10, 20, 30], `class one extends 30(20(10)) {}`)

  ti.fail(
    () => test([m.extend, sym(`two`)]),
    `missing declaration of "two"`,
  )

  ti.fail(
    () => test([m.extend, 10, sym(`two`)]),
    `missing declaration of "two"`,
  )

  test(
    [m.extend, ti.macReqExpressionOne],
    `class one extends "one" {}`
  )

  test(
    [m.extend, ti.macReqExpressionOne, ti.macReqExpressionTwo],
    `class one extends "two"("one") {}`
  )
})

t.test(function test_meth() {
  ti.fail(
    () => m.meth.call(null),
    `expected at least 1 inputs, got 0 inputs`,
  )

  ti.fail(
    () => m.meth.call(null, 10),
    `field name must be a symbol representing an identifier, or a string; got 10`,
  )

  ti.fail(
    () => m.meth.call(null, sym(`one`), 10),
    `function parameters must be either nil, a symbol, or a list deconstruction, got 10`,
  )

  ti.fail(
    () => m.meth.call(null, sym(`one`), [10]),
    `in a list deconstruction, every element must be a symbol or a list, got 10`,
  )

  {
    const ctx = Object.create(null)

    t.is(m.meth.call(ctx, sym(`one`)).compile(), `one () {}`)
    t.own(ctx, {})

    t.is(m.meth.call(ctx, sym(`one`), []).compile(), `one () {}`)
    t.own(ctx, {})
  }

  {
    const ctx = c.ctxWithStatement(null)

    t.is(m.meth.call(ctx, sym(`one`)).compile(), `one () {}`)
    t.own(ctx, {[c.symStatement]: undefined})

    t.is(m.meth.call(ctx, sym(`one`), []).compile(), `one () {}`)
    t.own(ctx, {[c.symStatement]: undefined})
  }

  /*
  Unlike function names, method names may be keywords or reserved names.
  They can also be strings. However, they must be otherwise valid identifiers.
  This means that using a symbol to define a method and access a method is a
  reversible roundtrip.
  */
  {
    ti.fail(() => m.meth.call(null, sym(`one.two`)), `"one.two" does not represent a valid JS identifier`)
    ti.fail(() => m.meth.call(null, sym(`!@#`)),     `"!@#" does not represent a valid JS identifier`)

    testMethBasic(sym(`await`), `await () {}`)
    testMethBasic(sym(`eval`),  `eval () {}`)
    testMethBasic(``,           `"" () {}`)
    testMethBasic(`one`,        `"one" () {}`)
  }

  t.is(
    m.meth.call(null, sym(`one`), [], 10).compile(),
    `one () {
return 10
}`)

  t.is(
    m.meth.call(null, sym(`one`), [], 10, 20).compile(),
    `one () {
10;
return 20
}`)

  t.is(
    m.meth.call(null, sym(`one`), [], 10, 20, 30).compile(),
    `one () {
10;
20;
return 30
}`)

  {
    let ctx

    t.is(
      m.meth.call(null, sym(`one`), [sym(`two`), sym(`three`)],
        ti.macReqStatementOne,
        ti.macReqStatementTwo,
        {macro(val) {
          ti.macReqExpression.macro(val)
          ctx = val
          return 10
        }},
      ).compile(),
      `one (two, three) {
"one";
"two";
return 10
}`)

    t.eq(ti.objFlat(ctx), [
      {},
      {[c.symStatement]: undefined, two: sym(`two`), three: sym(`three`)},
      {[c.symMixin]: undefined, ...m.funcMixin, ...m.methMixin},
    ])
  }
})

function testMethBasic(src, exp) {
  t.is(
    m.meth.call(null, src, []).compile(),
    exp,
  )
}

t.test(function test_field() {
  ti.fail(() => m.field.call(null),                 `expected between 1 and 2 inputs, got 0 inputs`)
  ti.fail(() => m.field.call(null, 10),             `field name must be a symbol representing an identifier, or a string; got 10`)
  ti.fail(() => m.field.call(null, sym(`one.two`)), `"one.two" does not represent a valid JS identifier`)
  ti.fail(() => m.field.call(null, sym(`!@#`)),     `"!@#" does not represent a valid JS identifier`)

  t.is(
    m.field.call(null, sym(`one`)).compile(),
    `one`,
  )

  t.is(
    m.field.call(null, sym(`one`), undefined).compile(),
    `one = undefined`,
  )

  t.is(
    m.field.call(null, sym(`one`), null).compile(),
    `one = null`,
  )

  t.is(
    m.field.call(null, sym(`one`), 10).compile(),
    `one = 10`,
  )

  t.is(
    m.field.call(null, sym(`one`), ti.macReqExpression).compile(),
    `one = "expression_value"`,
  )

  t.is(
    m.field.call(null, `one`, ti.macReqExpression).compile(),
    `"one" = "expression_value"`,
  )

  {
    const ctx = c.ctxWithStatement(null)

    t.is(
      m.field.call(ctx, sym(`one`), ti.macReqExpression).compile(),
      `one = "expression_value"`,
    )

    t.own(ctx, {[c.symStatement]: undefined})
  }

  {
    const ctx = c.ctxWithStatement(null)

    t.is(
      m.class.call(ctx, sym(`one`),
        [m.field, sym(`two`), ti.macReqExpression],
      ).compile(),
      `class one {
two = "expression_value"
}`)

    t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})
  }
})

t.test(function test_static() {
  const ctx = Object.create(null)
  ctx[m.symClass] = undefined
  testBlockStatement(ctx, m.static, compileStatic)
})

function compileStatic(val) {return `static ` + val}

// The implementation reuses `meth` which is tested earlier.
t.test(function test_static_meth() {
  t.is(
    m.static.meth.call(null, sym(`one`), []).compile(),
    `static one () {}`,
  )
})

// The implementation reuses `field` which is tested earlier.
t.test(function test_static_field() {
  t.is(
    m.static.field.call(null, sym(`one`), 10).compile(),
    `static one = 10`,
  )
})

t.test(function test_class_misc() {
  const ctx = c.ctxWithStatement(null)

  t.is(
    p.class.call(ctx, sym(`one`),
      [sym(`extend`), 10, 20],

      [sym(`meth`), sym(`two`), [sym(`three`)], 30, 40],

      [sym(`field`), sym(`four`), 50],

      [sym(`static`), 60, 70],

      [sym(`static.meth`), sym(`five`), [sym(`six`)], 80],

      [sym(`static.field`), sym(`seven`), 90],
    ).compile(),

    `class one extends 20(10) {
two (three) {
30;
return 40
};
four = 50;
static {
60;
70
};
static five (six) {
return 80
};
static seven = 90
}`)

  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  t.is(
    c.macroNode(
      null,
      [p.class, sym(`one`), [m.extend, 10],
        [m.static, [p.class, sym(`two`)]]
      ],
    ).compile(),
    `class one extends 10 {
static {
class two {}
}
}`)
})

t.test(function test_throw_expression() {
  ti.fail(() => p.throw.call(null), `expected 1 inputs, got 0 inputs`)
  ti.fail(() => p.throw.call(null, []), `unexpected empty input`)

  t.is(p.throw.call(null, undefined).compile(), `(err => {throw err})(undefined)`)
  t.is(p.throw.call(null, null).compile(), `(err => {throw err})(null)`)
  t.is(p.throw.call(null, 10).compile(), `(err => {throw err})(10)`)
  t.is(p.throw.call(null, ti.macReqExpression).compile(), `(err => {throw err})("expression_value")`)
})

t.test(function test_throw_statement() {
  const ctx = c.ctxWithStatement(null)
  ti.fail(() => p.throw.call(ctx), `expected 1 inputs, got 0 inputs`)
  ti.fail(() => p.throw.call(ctx, []), `unexpected empty input`)

  t.is(p.throw.call(ctx, undefined).compile(), `throw undefined`)
  t.is(p.throw.call(ctx, null).compile(), `throw null`)
  t.is(p.throw.call(ctx, 10).compile(), `throw 10`)
  t.is(p.throw.call(ctx, ti.macReqExpression).compile(), `throw "expression_value"`)
})

t.test(function test_new() {
  testNew(Object.create(null))
  testNew(c.ctxWithStatement(null))
})

function testNew(ctx) {
  ti.fail(() => p.new.call(ctx), `expected at least 1 inputs, got 0 inputs`)
  ti.fail(() => p.new.call(ctx, []), `unexpected empty input`)
  ti.fail(() => p.new.call(ctx, [], [[]]), `unexpected empty input`)

  t.is(p.new.call(ctx, 10).compile(), `new 10()`)
  t.is(p.new.call(ctx, 10, 20).compile(), `new 10(20)`)
  t.is(p.new.call(ctx, 10, 20, 30).compile(), `new 10(20, 30)`)
  t.is(p.new.call(ctx, [], 10, [], 20, [], 30).compile(), `new 10(20, 30)`)

  ti.fail(() => p.new.call(ctx, sym(`one`)), `missing declaration of "one"`)
  ti.fail(() => p.new.call(ctx, [], sym(`one`)), `missing declaration of "one"`)
  ti.fail(() => p.new.call(ctx, 10, sym(`one`)), `missing declaration of "one"`)

  class SomeNode {constructor(...src) {this.src = src}}
  ctx.one = SomeNode

  ti.fail(
    () => p.new.call(ctx, [], SomeNode),
    `unable to usefully compile function [function SomeNode]`,
  )

  ti.fail(
    () => p.new.call(ctx, [], sym(`one`)),
    `unable to usefully compile function [function SomeNode]`,
  )

  t.is(
    p.new.call(ctx, [], ti.macReqExpressionOne).compile(),
    `new "one"()`,
  )

  t.is(
    p.new.call(ctx, 10, ti.macReqExpressionOne).compile(),
    `new 10("one")`,
  )

  t.is(
    p.new.call(ctx, 10, ti.macReqExpressionOne, ti.macReqExpressionTwo).compile(),
    `new 10("one", "two")`,
  )

  t.is(
    p.new.call(ctx, 10, ti.macReqExpressionOne, ti.macReqExpressionTwo, ti.macReqExpressionThree).compile(),
    `new 10("one", "two", "three")`,
  )

  t.eq(p.new.call(ctx, SomeNode), new SomeNode())
  t.eq(p.new.call(ctx, sym(`one`)), new SomeNode())

  t.eq(p.new.call(ctx, SomeNode, 10), new SomeNode(10))
  t.eq(p.new.call(ctx, sym(`one`), 10), new SomeNode(10))

  t.eq(p.new.call(ctx, SomeNode, 10, 20), new SomeNode(10, 20))
  t.eq(p.new.call(ctx, sym(`one`), 10, 20), new SomeNode(10, 20))

  t.eq(p.new.call(ctx, SomeNode, 10, 20, 30), new SomeNode(10, 20, 30))
  t.eq(p.new.call(ctx, sym(`one`), 10, 20, 30), new SomeNode(10, 20, 30))

  t.own(p.new.call(ctx, SomeNode, 10, 20, 30), {src: [10, 20, 30]})
  t.own(p.new.call(ctx, sym(`one`), 10, 20, 30), {src: [10, 20, 30]})

  ti.fail(
    () => p.new.call(ctx, sym(`one.two`)),
    `missing property "two" in [function SomeNode]`,
  )

  ctx.one = 123
  t.is(p.new.call(ctx, sym(`one`)).compile(), `new 123()`)
  t.is(p.new.call(ctx, sym(`one.two`)).compile(), `new 123.two()`)

  ctx.one = sym(`one`)
  t.is(p.new.call(ctx, sym(`one`)).compile(), `new one()`)
  t.is(p.new.call(ctx, sym(`one.two`)).compile(), `new one.two()`)

  t.is(p.new.call(ctx, sym(`one`), ti.macReqExpressionOne).compile(), `new one("one")`)
  t.is(p.new.call(ctx, sym(`one.two`), ti.macReqExpressionOne).compile(), `new one.two("one")`)
}

t.test(function test_new_target() {
  const ctx = Object.create(null)

  function run(src) {return c.compileNode(c.macroNode(ctx, src))}
  ti.fail(() => run(sym(`new.target`)), `missing declaration of "new"`)

  ctx.new = p.new
  t.is(run(sym(`new.target`)), `new.target`)
  t.is(run(sym(`new.target.name`)), `new.target.name`)
})

t.test(function test_typeof() {testUnary(p.typeof, `typeof`)})

function testUnary(fun, pre) {
  function test(ctx) {
    ti.fail(() => fun.call(ctx), `expected 1 inputs, got 0 inputs`)

    t.is(fun.call(ctx, []).compile(), `(${pre} undefined)`)
    t.is(fun.call(ctx, 10).compile(), `(${pre} 10)`)

    t.is(
      fun.call(ctx, ti.macReqExpression).compile(),
      `(${pre} "expression_value")`,
    )
  }

  test(null)
  test(c.ctxWithStatement(null))
}

t.test(function test_oftype() {
  function test(ctx) {
    ti.fail(() => p.oftype.call(ctx), `expected 2 inputs, got 0 inputs`)

    ti.fail(
      () => p.oftype.call(ctx, 10, 20),
      `the first input must be a hardcoded string, got 10`,
    )

    t.is(p.oftype.call(ctx, `string`,    []), undefined)
    t.is(p.oftype.call(ctx, `number`,    []), undefined)
    t.is(p.oftype.call(ctx, `object`,    []), undefined)
    t.is(p.oftype.call(ctx, `undefined`, []), undefined)

    t.is(
      p.oftype.call(ctx, `string`, 10).compile(),
      `("string" === typeof 10)`,
    )

    t.is(
      p.oftype.call(ctx, `string`, ti.macReqExpression).compile(),
      `("string" === typeof "expression_value")`,
    )
  }

  test(null)
  test(c.ctxWithStatement(null))
})

t.test(function test_await() {testUnary(p.await, `await`)})

t.test(function test_instof() {
  testBinary(p.instof, `instanceof`)
  testCompilable(p.instof, `((a, b) => a instanceof b)`)
})

function testBinary(fun, inf) {
  function test(ctx) {
    ti.fail(() => fun.call(ctx), `expected 2 inputs, got 0 inputs`)

    t.is(
      fun.call(ctx, [], []).compile(),
      `(undefined ${inf} undefined)`,
    )

    t.is(
      fun.call(ctx, 10, []).compile(),
      `(10 ${inf} undefined)`,
    )

    t.is(
      fun.call(ctx, [], 10).compile(),
      `(undefined ${inf} 10)`,
    )

    t.is(
      fun.call(ctx, 10, 20).compile(),
      `(10 ${inf} 20)`,
    )

    t.is(
      fun.call(ctx, ti.macReqExpressionOne, ti.macReqExpressionTwo).compile(),
      `("one" ${inf} "two")`,
    )
  }

  test(null)
  test(c.ctxWithStatement(null))
}

t.test(function test_in() {
  // Inverse copy of `testBinary`.
  function test(ctx) {
    ti.fail(() => p.in.call(ctx), `expected 2 inputs, got 0 inputs`)

    t.is(
      p.in.call(ctx, [], []).compile(),
      `(undefined in undefined)`,
    )

    t.is(
      p.in.call(ctx, 10, []).compile(),
      `(undefined in 10)`,
    )

    t.is(
      p.in.call(ctx, [], 10).compile(),
      `(10 in undefined)`,
    )

    t.is(
      p.in.call(ctx, 10, 20).compile(),
      `(20 in 10)`,
    )

    t.is(
      p.in.call(ctx, ti.macReqExpressionOne, ti.macReqExpressionTwo).compile(),
      `("two" in "one")`,
    )
  }

  test(null)
  test(c.ctxWithStatement(null))

  testCompilable(p.in, `((a, b) => b in a)`)
})

/*
Most of these checks are redundant with more fundamental tests for symbol
macroing and compilation, and list macroing and compilation. Ultimately,
just verifying that `is` is a symbol with `Object.is` tells you the rest
of this behavior.
*/
t.test(function test_is() {
  t.is(p.is, sym(`Object.is`))

  ti.fail(() => c.macroNode(null, sym(`is`)), `missing declaration of "is"`)
  ti.fail(() => c.macroNode(null, p.is), `missing declaration of "Object"`)

  const ctx = Object.create(null)
  ctx.is = p.is
  ti.fail(() => c.macroNode(ctx, sym(`is`)), `missing declaration of "Object"`)
  ti.fail(() => c.macroNode(ctx, p.is), `missing declaration of "Object"`)

  ctx.Object = sym(`Object`)
  t.is(c.macroNode(ctx, sym(`is`)), sym(`Object.is`))
  t.is(c.macroNode(ctx, p.is), sym(`Object.is`))
  t.is(c.compileNode(sym(`Object.is`)), `Object.is`)

  t.eq(c.macroNode(ctx, [sym(`is`), 10, 20]), [p.is, 10, 20])
  t.eq(c.macroNode(ctx, [p.is, 10, 20]), [p.is, 10, 20])
  t.is(c.compileNode([p.is, 10, 20]), `Object.is(10, 20)`)

  t.eq(c.macroNode(ctx, [10, sym(`is`), 20]), [10, p.is, 20])
  t.eq(c.macroNode(ctx, [10, p.is, 20]), [10, p.is, 20])
  t.is(c.compileNode([10, p.is, 20]), `10(Object.is, 20)`)
})

t.test(function test_isNil() {
  testUnary(p.isNil, `null ==`)
  testCompilable(p.isNil, `(a => a == null)`)
})

t.test(function test_isSome() {
  testUnary(p.isSome, `null !=`)
  testCompilable(p.isSome, `(a => a != null)`)
})

function testCompilable(src, exp) {
  function test(ctx) {
    t.is(src.compile(), exp)

    t.is(c.compileNode(                 src),  exp)
    t.is(c.compileNode(c.macroNode(ctx, src)), exp)

    t.is(c.compileNode([src]),         exp + `()`)
    t.is(c.compileNode([src, 10]),     exp + `(10)`)
    t.is(c.compileNode([src, 10, 20]), exp + `(10, 20)`)

    t.is(c.compileNode(                 [10, src]),      `10(${exp})`)
    t.is(c.compileNode(c.macroNode(ctx, [10, src])),     `10(${exp})`)
    t.is(c.compileNode(                 [10, src, 20]),  `10(${exp}, 20)`)
    t.is(c.compileNode(c.macroNode(ctx, [10, src, 20])), `10(${exp}, 20)`)
    t.is(c.compileNode(                 [10, 20, src]),  `10(20, ${exp})`)
    t.is(c.compileNode(c.macroNode(ctx, [10, 20, src])), `10(20, ${exp})`)
  }

  test(null)
  test(c.ctxWithStatement(null))
}

t.test(function test_list() {
  testList(null)
  testList(c.ctxWithStatement(null))
  testCompilable(p.list, `((...a) => a)`)
})

function testList(ctx) {
  t.is(p.list.call(ctx).compile(), `[]`)
  t.is(p.list.call(ctx, []).compile(), `[]`)
  t.is(p.list.call(ctx, [], [[]]).compile(), `[]`)
  t.is(p.list.call(ctx, 10).compile(), `[10]`)
  t.is(p.list.call(ctx, 10, 20).compile(), `[10, 20]`)
  t.is(p.list.call(ctx, 10, 20, 30).compile(), `[10, 20, 30]`)
  t.is(p.list.call(ctx, 10, [], 20, [[]], 30).compile(), `[10, 20, 30]`)

  t.is(
    p.list.call(ctx, ti.macReqExpressionOne).compile(),
    `["one"]`,
  )

  t.is(
    p.list.call(ctx, ti.macReqExpressionOne, ti.macReqExpressionTwo).compile(),
    `["one", "two"]`,
  )

  t.is(
    p.list.call(ctx, ti.macReqExpressionOne, ti.macReqExpressionTwo, ti.macReqExpressionThree).compile(),
    `["one", "two", "three"]`,
  )
}

t.test(function test_dict() {
  const expr = null
  const stat = c.ctxWithStatement(null)

  function fail(ctx) {
    ti.fail(
      () => p.dict.call(ctx, 10),
      `expected an even number of inputs, got 1 inputs`,
    )

    ti.fail(
      () => p.dict.call(ctx, []),
      `expected an even number of inputs, got 1 inputs`,
    )

    ti.fail(
      () => p.dict.call(ctx, 10, 20, 30),
      `expected an even number of inputs, got 3 inputs`,
    )

    ti.fail(
      () => p.dict.call(ctx, 10, [], 30),
      `expected an even number of inputs, got 3 inputs`,
    )

    ti.fail(
      () => p.dict.call(ctx, undefined, 10),
      `dict keys must be strings, numbers, or unqualified key symbols starting with "."; got undefined`,
    )

    ti.fail(
      () => p.dict.call(ctx, [], 10),
      `dict keys must be strings, numbers, or unqualified key symbols starting with "."; got []`,
    )

    ti.fail(
      () => p.dict.call(ctx, NaN, 10),
      `dict keys must be strings, numbers, or unqualified key symbols starting with "."; got NaN`,
    )

    ti.fail(
      () => p.dict.call(ctx, Infinity, 10),
      `dict keys must be strings, numbers, or unqualified key symbols starting with "."; got Infinity`,
    )

    ti.fail(
      () => p.dict.call(ctx, -Infinity, 10),
      `dict keys must be strings, numbers, or unqualified key symbols starting with "."; got -Infinity`,
    )

    ti.fail(
      () => p.dict.call(ctx, sym(`one`), 10),
      `dict keys must be strings, numbers, or unqualified key symbols starting with "."; got one`,
    )

    ti.fail(
      () => p.dict.call(ctx, sym(`one.two`), 10),
      `dict keys must be strings, numbers, or unqualified key symbols starting with "."; got one.two`,
    )

    ti.fail(
      () => p.dict.call(ctx, sym(`.one.two`), 10),
      `dict keys must be strings, numbers, or unqualified key symbols starting with "."; got .one.two`,
    )
  }

  fail(expr)
  fail(stat)

  t.is(p.dict.call(expr).compile(), `{}`)
  t.is(p.dict.call(stat).compile(), `({})`)

  t.is(p.dict.call(expr, -0, -0).compile(), `{0: -0}`)
  t.is(p.dict.call(stat, -0, -0).compile(), `({0: -0})`)

  t.is(p.dict.call(expr, 10, 20).compile(), `{10: 20}`)
  t.is(p.dict.call(stat, 10, 20).compile(), `({10: 20})`)

  t.is(p.dict.call(expr, 10, 20, 30, 40).compile(), `{10: 20, 30: 40}`)
  t.is(p.dict.call(stat, 10, 20, 30, 40).compile(), `({10: 20, 30: 40})`)

  t.is(p.dict.call(expr, 10.20, 30, 40.50, 60).compile(), `{"10.2": 30, "40.5": 60}`)
  t.is(p.dict.call(stat, 10.20, 30, 40.50, 60).compile(), `({"10.2": 30, "40.5": 60})`)

  t.is(p.dict.call(expr, 10, []).compile(), `{10: undefined}`)
  t.is(p.dict.call(stat, 10, []).compile(), `({10: undefined})`)

  t.is(p.dict.call(expr, 10, [], 20, 30).compile(), `{10: undefined, 20: 30}`)
  t.is(p.dict.call(stat, 10, [], 20, 30).compile(), `({10: undefined, 20: 30})`)

  t.is(p.dict.call(expr, 10, [], 20, 30, 40, [[]]).compile(), `{10: undefined, 20: 30, 40: undefined}`)
  t.is(p.dict.call(stat, 10, [], 20, 30, 40, [[]]).compile(), `({10: undefined, 20: 30, 40: undefined})`)

  t.is(p.dict.call(expr, 10n, 20n).compile(), `{10: 20n}`)
  t.is(p.dict.call(stat, 10n, 20n).compile(), `({10: 20n})`)

  t.is(p.dict.call(expr, 10n, 20n, 30n, 40n).compile(), `{10: 20n, 30: 40n}`)
  t.is(p.dict.call(stat, 10n, 20n, 30n, 40n).compile(), `({10: 20n, 30: 40n})`)

  t.is(p.dict.call(expr, `one`, `two`).compile(), `{"one": "two"}`)
  t.is(p.dict.call(stat, `one`, `two`).compile(), `({"one": "two"})`)

  t.is(p.dict.call(expr, `one`, `two`, `three`, `four`).compile(), `{"one": "two", "three": "four"}`)
  t.is(p.dict.call(stat, `one`, `two`, `three`, `four`).compile(), `({"one": "two", "three": "four"})`)

  t.is(p.dict.call(expr, `one`, 10, `two`, 20).compile(), `{"one": 10, "two": 20}`)
  t.is(p.dict.call(stat, `one`, 10, `two`, 20).compile(), `({"one": 10, "two": 20})`)

  t.is(p.dict.call(expr, sym(`.one`), `two`, sym(`.three`), `four`).compile(), `{one: "two", three: "four"}`)
  t.is(p.dict.call(stat, sym(`.one`), `two`, sym(`.three`), `four`).compile(), `({one: "two", three: "four"})`)

  t.is(p.dict.call(expr, sym(`.one`), 10, sym(`.two`), 20).compile(), `{one: 10, two: 20}`)
  t.is(p.dict.call(stat, sym(`.one`), 10, sym(`.two`), 20).compile(), `({one: 10, two: 20})`)

  t.is(p.dict.call(expr, sym(`.!@#`), 10).compile(), `{"!@#": 10}`)
  t.is(p.dict.call(stat, sym(`.!@#`), 10).compile(), `({"!@#": 10})`)

  t.is(
    p.dict.call(expr, 10, ti.macReqExpressionOne).compile(),
    `{10: "one"}`,
  )

  t.is(
    p.dict.call(stat, 10, ti.macReqExpressionOne).compile(),
    `({10: "one"})`,
  )

  t.is(
    p.dict.call(expr, 10, ti.macReqExpressionOne, 20, ti.macReqExpressionTwo).compile(),
    `{10: "one", 20: "two"}`,
  )

  t.is(
    p.dict.call(stat, 10, ti.macReqExpressionOne, 20, ti.macReqExpressionTwo).compile(),
    `({10: "one", 20: "two"})`,
  )
})

t.bench(function bench_dict_compile_core() {
  c.compileDict({one: 10, two: 20, three: 30, four: 40})
})

t.bench(function bench_dict_compile_macro() {
  p.dict.call(null, `one`, 10, `two`, 20, `three`, 30, `four`, 40).compile()
})

t.test(function test_get() {
  function test(ctx) {
    ti.fail(
      () => p.get.call(ctx),
      `expected at least 1 inputs, got 0 inputs`,
    )

    t.is(p.get.call(ctx, []), undefined)
    t.is(p.get.call(ctx, [], [[]]), undefined)

    t.is(p.get.call(ctx, 10).compile(), `10`)
    t.is(p.get.call(ctx, 10, 20).compile(), `10[20]`)
    t.is(p.get.call(ctx, 10, 20, 30).compile(), `10[20][30]`)

    t.is(
      p.get.call(ctx, [], 10, [[]], 20, [[[]]], 30).compile(),
      `[10][20][30]`,
    )

    t.is(
      p.get.call(ctx, ti.macReqExpressionOne, ti.macReqExpressionTwo, ti.macReqExpressionThree).compile(),
      `"one"["two"]["three"]`,
    )
  }

  test(null)
  test(c.ctxWithStatement(null))
})

t.test(function test_getOpt() {
  function test(ctx) {
    ti.fail(
      () => p.getOpt.call(ctx),
      `expected at least 1 inputs, got 0 inputs`,
    )

    t.is(p.getOpt.call(ctx, []), undefined)
    t.is(p.getOpt.call(ctx, [], [[]]), undefined)

    t.is(p.getOpt.call(ctx, 10).compile(), `10`)
    t.is(p.getOpt.call(ctx, 10, 20).compile(), `10?.[20]`)
    t.is(p.getOpt.call(ctx, 10, 20, 30).compile(), `10?.[20]?.[30]`)

    t.is(
      p.getOpt.call(ctx, [], 10, [[]], 20, [[[]]], 30).compile(),
      `?.[10]?.[20]?.[30]`,
    )

    t.is(
      p.getOpt.call(ctx, ti.macReqExpressionOne, ti.macReqExpressionTwo, ti.macReqExpressionThree).compile(),
      `"one"?.["two"]?.["three"]`,
    )
  }

  test(null)
  test(c.ctxWithStatement(null))
})

t.test(function test_set() {
  function fail(ctx) {
    ti.fail(() => p.set.call(ctx),                     `expected 2 inputs, got 0 inputs`)
    ti.fail(() => p.set.call(ctx, sym(`one`), 10),     `missing declaration of "one"`)
    ti.fail(() => p.set.call(ctx, sym(`one.two`), 10), `missing declaration of "one"`)
  }

  const ctx = Object.create(null)
  fail(null)
  fail(ctx)

  ctx.one = 123
  t.is(p.set.call(ctx, sym(`one`), []).compile(), `(123 = undefined)`)

  ctx.one = sym(`one`)
  t.is(p.set.call(ctx, sym(`one`), []).compile(), `(one = undefined)`)

  t.is(
    p.set.call(c.ctxWithStatement(ctx), sym(`one`), []).compile(),
    `one = undefined`,
  )

  t.is(
    p.set.call(ctx, sym(`one`), 10).compile(),
    `(one = 10)`,
  )

  t.is(
    p.set.call(c.ctxWithStatement(ctx), sym(`one`), 10).compile(),
    `one = 10`,
  )

  t.is(
    p.set.call(ctx, sym(`one`), ti.macReqExpression).compile(),
    `(one = "expression_value")`,
  )

  t.is(
    p.set.call(c.ctxWithStatement(ctx), sym(`one`), ti.macReqExpression).compile(),
    `one = "expression_value"`,
  )

  t.is(
    p.set.call(ctx, sym(`one.two`), 10).compile(),
    `(one.two = 10)`,
  )

  t.is(
    p.set.call(c.ctxWithStatement(ctx), sym(`one.two`), 10).compile(),
    `one.two = 10`,
  )

  ti.fail(() => p.set.call(ctx, sym(`await`), 10), `missing declaration of "await"`)
  ctx.await = sym(`await`)
  // Invalid syntax in most JS contexts. Maybe we should detect and throw.
  t.is(p.set.call(ctx, sym(`await`), 10).compile(), `(await = 10)`)

  ti.fail(() => p.set.call(ctx, sym(`eval`), 10), `missing declaration of "eval"`)
  ctx.eval = sym(`eval`)
  // Invalid syntax in most JS contexts. Maybe we should detect and throw.
  t.is(p.set.call(ctx, sym(`eval`), 10).compile(), `(eval = 10)`)

  ti.fail(() => p.set.call(ctx, sym(`!@#`), 10), `missing declaration of "!@#"`)
  ctx[`!@#`] = sym(`!@#`)
  ti.fail(
    () => p.set.call(ctx, sym(`!@#`), 10),
    `"!@#" does not represent a valid JS identifier`,
  )

  // Generates valid JS syntax. This is why we don't restrict the expression in
  // the LHS position to being a symbol.
  t.is(
    p.set.call(ctx, [p.get, sym(`one`), `two`], 10).compile(),
    `(one["two"] = 10)`,
  )
})

t.test(function test_and() {
  testVariadic(p.and, ``, ` && `, ``)
  testCompilable(p.and, `((a, b) => a && b)`)
})

t.test(function test_or() {
  testVariadic(p.or, ``, ` || `, ``)
  testCompilable(p.or, `((a, b) => a || b)`)
})

t.test(function test_coalesce() {
  testVariadic(p.coalesce, ``, ` ?? `, ``)
  testCompilable(p.coalesce, `((a, b) => a ?? b)`)
})

function testVariadic(fun, pre, inf, suf, fallback) {
  c.reqFun(fun)
  c.reqStr(pre)
  c.reqStr(inf)
  c.reqStr(suf)

  function test(ctx) {
    t.is(fun.call(ctx), fallback)
    t.is(fun.call(ctx, []), fallback)
    t.is(fun.call(ctx, [], [[]]), fallback)

    if (pre || suf) {
      t.is(fun.call(ctx, 10).compile(), c.wrapParens(pre + `10` + suf))
      t.is(fun.call(ctx, ti.macReqExpressionOne).compile(), c.wrapParens(pre + `"one"` + suf))
    }
    else {
      t.is(fun.call(ctx, 10).compile(), `10`)
      t.is(fun.call(ctx, ti.macReqExpressionOne).compile(), pre + `"one"` + suf)
    }

    t.is(fun.call(ctx, 10, 20).compile(), c.wrapParens([`10`, `20`].join(inf)))
    t.is(fun.call(ctx, ti.macReqExpressionOne, ti.macReqExpressionTwo).compile(), c.wrapParens([`"one"`, `"two"`].join(inf)))
    t.is(fun.call(ctx, 10, 20, 30).compile(), c.wrapParens([`10`, `20`, `30`].join(inf)))
    t.is(fun.call(ctx, [], 10, [[]], 20, [[[]]], 30).compile(), c.wrapParens([`10`, `20`, `30`].join(inf)))
    t.is(fun.call(ctx, ti.macReqExpressionOne, ti.macReqExpressionTwo, ti.macReqExpressionThree).compile(), c.wrapParens([`"one"`, `"two"`, `"three"`].join(inf)))
  }

  test(null)
  test(c.ctxWithStatement(null))
}

t.test(function test_not() {
  testUnary(p.not, `!`)
  testCompilable(p.not, `(a => !a)`)
})

t.test(function test_yes() {
  testUnary(p.yes, `!!`)
  testCompilable(p.yes, `(a => !!a)`)
})

t.test(function test_eq()  {
  testBinary(p.eq, `===`)
  testCompilable(p.eq, `((a, b) => a === b)`)
})

t.test(function test_neq() {
  testBinary(p.neq, `!==`)
  testCompilable(p.neq, `((a, b) => a !== b)`)
})

t.test(function test_gt()  {
  testBinary(p.gt, `>`)
  testCompilable(p.gt, `((a, b) => a > b)`)
})

t.test(function test_lt()  {
  testBinary(p.lt, `<`)
  testCompilable(p.lt, `((a, b) => a < b)`)
})

t.test(function test_gte() {
  testBinary(p.gte, `>=`)
  testCompilable(p.gte, `((a, b) => a >= b)`)
})

t.test(function test_lte() {
  testBinary(p.lte, `<=`)
  testCompilable(p.lte, `((a, b) => a <= b)`)
})

t.test(function test_add() {
  testVariadic(p.add, `+ `, ` + `, ``)
  testCompilable(p.add, `((a, b) => a + b)`)
})

t.test(function test_subtract() {
  testVariadic(p.subtract, `- `, ` - `, ``)
  testCompilable(p.subtract, `((a, b) => a - b)`)
})

t.test(function test_divide() {
  testVariadic(p.divide, ``, ` / `, ``)
  testCompilable(p.divide, `((a, b) => a / b)`)
})

t.test(function test_multiply() {
  testVariadic(p.multiply, `1 * `, ` * `, ``)
  testCompilable(p.multiply, `((a, b) => a * b)`)
})

t.test(function test_exponentiate() {
  testVariadic(p.exponentiate, ``, ` ** `,` ** 1`)
  testCompilable(p.exponentiate, `((a, b) => a ** b)`)
})

t.test(function test_remainder() {
  testVariadic(p.remainder, ``, ` % `, ``)
  testCompilable(p.remainder, `((a, b) => a % b)`)
})

t.test(function test_bitAnd() {
  testVariadic(p.bitAnd, ``, ` & `, ` & 0`, 0)
  testCompilable(p.bitAnd, `((a, b) => a & b)`)
})

t.test(function test_bitOr() {
  testVariadic(p.bitOr, ``, ` | `, ` | 0`, 0)
  testCompilable(p.bitOr, `((a, b) => a | b)`)
})

t.test(function test_bitXor() {
  testVariadic(p.bitXor, ``, ` ^ `, ` ^ 0`, 0)
  testCompilable(p.bitXor, `((a, b) => a ^ b)`)
})

t.test(function test_bitShiftLeft() {
  testVariadic(p.bitShiftLeft, ``, ` << `, ` << 0`,0)
  testCompilable(p.bitShiftLeft, `((a, b) => a << b)`)
})

t.test(function test_bitShiftRight() {
  testVariadic(p.bitShiftRight, ``, ` >> `, ` >> 0`, 0)
  testCompilable(p.bitShiftRight, `((a, b) => a >> b)`)
})

t.test(function test_bitShiftRightUnsigned() {
  testVariadic(p.bitShiftRightUnsigned, ``, ` >>> `, ` >>> 0`, 0)
  testCompilable(p.bitShiftRightUnsigned, `((a, b) => a >>> b)`)
})

t.test(function test_assignIncrement() {testUnary(p.assignIncrement, `++`)})
t.test(function test_assignDecrement() {testUnary(p.assignDecrement, `--`)})

t.test(function test_regexp() {
  ti.fail(() => p.regexp.call(null), `expected between 1 and 2 inputs, got 0 inputs`)
  ti.fail(() => p.regexp.call(null, 10), `expected variant of isStr, got 10`)
  ti.fail(() => p.regexp.call(null, ``, 20), `expected variant of isStr, got 20`)
  ti.fail(() => p.regexp.call(null, `?`), `Invalid regular expression: /?/: Nothing to repeat`)
  ti.fail(() => p.regexp.call(null, ``, `blah`), `Invalid flags supplied to RegExp constructor 'blah'`)

  t.inst(p.regexp.call(null, ``), RegExp)

  t.is(p.regexp.call(null, ``        ).toString(), /(?:)/  .toString())
  t.is(p.regexp.call(null, ``,    `g`).toString(), /(?:)/g .toString())
  t.is(p.regexp.call(null, `one`     ).toString(), /one/   .toString())
  t.is(p.regexp.call(null, `one`, `g`).toString(), /one/g  .toString())
})

t.test(function test_pipe() {
  function mac(ctx, ...src) {return c.macroNode(ctx, [m.pipe, ...src])}

  function fail(ctx) {
    ti.fail(() => mac(ctx), `expected unqualified symbol, got undefined`)
    ti.fail(() => mac(ctx, 10), `expected unqualified symbol, got 10`)
    ti.fail(() => mac(ctx, sym(`one.two`)), `expected unqualified symbol, got one.two`)
    ti.fail(() => mac(ctx, sym(`one`)), `missing declaration of "one"`)
  }

  const expr = Object.create(null)
  const stat = c.ctxWithStatement(expr)

  fail(expr)
  fail(stat)

  expr.one = sym(`one`)

  t.is(mac(expr, sym(`one`)), sym(`one`))
  t.is(mac(stat, sym(`one`)), sym(`one`))

  t.is(
    mac(expr, sym(`one`), 10).compile(),
    `((one = 10), one)`,
  )

  t.is(
    mac(stat, sym(`one`), 10).compile(),
    `{
one = 10;
one
}`)

  t.is(
    mac(expr, sym(`one`), 10, 20).compile(),
    `((one = 10), (one = 20), one)`,
  )

  t.is(
    mac(stat, sym(`one`), 10, 20).compile(),
    `{
one = 10;
one = 20;
one
}`)

  t.is(
    mac(expr, sym(`one`), ti.macReqExpressionTwo, ti.macReqExpressionThree).compile(),
    `((one = "two"), (one = "three"), one)`,
  )

  t.is(
    mac(stat, sym(`one`), ti.macReqExpressionTwo, ti.macReqExpressionThree).compile(),
    `{
one = "two";
one = "three";
one
}`)

  t.is(
    mac(stat, sym(`one`), ti.macReqExpressionTwo, ti.macReqExpressionThree).compile(),
    `{
one = "two";
one = "three";
one
}`)
})

if (import.meta.main) ti.flush()

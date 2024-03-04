import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'
import * as p from '../js/prelude.mjs'
import * as m from '../js/mac.mjs'

function sym(val) {return Symbol.for(c.reqStr(val))}
function id(val) {return val}

/*
We could deduplicate "mixin" definitions between macro code and test code by
using object-style definitions in macro code. It used to be implemented that
way. But that approach involves measurable overheads. Test convenience has no
business affecting the main code.
*/

// SYNC[func_mixin].
const funcMixin = Object.create(null)
funcMixin.ret = m.ret
funcMixin.guard = m.guard
funcMixin.arguments = Symbol.for(`arguments`)

// SYNC[class_mixin].
const classMixin = Object.create(null)
classMixin.prototype = m.classPrototype
classMixin.super = Symbol.for(`super`)

// SYNC[class_static_override].
const classOverrideStatic = Object.create(null)
classOverrideStatic[m.symDo] = m.doForClassStatic
classOverrideStatic[m.symSet] = m.setForClassStatic
classOverrideStatic[m.symLet] = m.letForClassStatic
classOverrideStatic[m.symFunc] = m.funcForClassStatic
classOverrideStatic[m.symFuncAsync] = m.funcAsyncForClassStatic
classOverrideStatic[m.symFuncGet] = m.funcGetForClassStatic

// SYNC[class_proto_override].
const classOverrideProto = Object.create(null)
classOverrideProto[m.symSet] = m.setForClassProto
classOverrideProto[m.symLet] = m.letForClassProto
classOverrideProto[m.symFunc] = m.funcForClassProto
classOverrideProto[m.symFuncAsync] = m.funcAsyncForClassProto
classOverrideProto[m.symFuncGet] = m.funcGetForClassProto

// SYNC[obj_override].
const objOverride = Object.create(null)
objOverride[m.symSet] = m.setForObj
objOverride[m.symLet] = m.letForObj
objOverride[m.symFunc] = m.funcForObj
objOverride[m.symFuncAsync] = m.funcAsyncForObj
objOverride[m.symFuncGet] = m.funcGetForObj

// SYNC[loop_mixin].
const loopMixin = Object.create(null)
loopMixin.break = m.break
loopMixin.continue = m.continue

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

  ti.fail(
    () => p.const.call(ctx, undefined, 10),
    `every parameter must be a symbol or a list, got undefined`,
  )

  ti.fail(
    () => p.const.call(ctx, 10, 20),
    `every parameter must be a symbol or a list, got 10`,
  )

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
    () => mac(c.ctxWithStatement(null), [sym(`one`)]),
    `missing declaration of "one"`,
  )

  ti.fail(
    () => mac(c.ctxWithStatement(null), [sym(`one`), sym(`two`)]),
    `missing declaration of "one"`,
  )

  ti.fail(
    () => mac(c.ctxWithStatement(null), [sym(`@`)]),
    `missing declaration of "@"`,
  )

  ti.fail(
    () => mac(c.ctxWithStatement(null), [sym(`@`), sym(`one`)]),
    `missing declaration of "@"`,
  )

  ti.fail(
    () => mac(c.ctxWithStatement(null), 10),
    `every parameter must be a symbol or a list, got 10`,
  )

  ti.fail(
    () => mac(c.ctxWithStatement(null), []),
    `missing LHS in declaration or assignment`,
  )

  /*
  Also produces invalid syntax. This is a side effect of interpreting lists in
  parameters as regular macro calls, which allows users to implement and use
  arbitrary macros in parameter positions. Note that we support list
  deconstructions via a special override for the list macro. See below.
  */
  t.is(
    mac(c.ctxWithStatement(null), [10]).compile(),
    `const 10() = "expression_value"`,
  )

  t.is(
    mac(c.ctxWithStatement(null), [10, 20]).compile(),
    `const 10(20) = "expression_value"`,
  )

  const ctx = c.ctxWithStatement(null)
  t.own(ctx, {[c.symStatement]: undefined})

  ti.fail(
    () => mac(ctx, [p.list, [sym(`one`)]]),
    `missing declaration of "one"`,
  )

  t.is(
    mac(ctx, [p.list, sym(`one`)]).compile(),
    `const [one] = "expression_value"`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  // Also invalid syntax. See above.
  t.is(
    mac(ctx, [p.list, [sym(`one`)]]).compile(),
    `const [one()] = "expression_value"`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  t.is(
    mac(ctx, [p.list, m.symRest, sym(`two`)]).compile(),
    `const [...two] = "expression_value"`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`)})

  t.is(
    mac(ctx, [p.list, sym(`three`), [p.list, sym(`four`), m.symRest, sym(`five`)]]).compile(),
    `const [three, [four, ...five]] = "expression_value"`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`), three: sym(`three`), four: sym(`four`), five: sym(`five`)})
})

t.test(function test_const_mac() {
  ti.fail(
    () => p.const.mac.call(null),
    `expected 2 inputs, got 0 inputs`,
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

  t.eq(p.const.mac.call(ctx, sym(`one`), undefined), [])
  t.own(ctx, {[c.symStatement]: undefined, one: undefined})

  ti.fail(
    () => p.const.mac.call(ctx, sym(`one`), 10),
    `redundant declaration of "one"`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: undefined})

  delete ctx.one
  t.eq(p.const.mac.call(ctx, sym(`one`), 10), [])
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

  t.is(
    p.loop.while.call(ctx, [], sym(`break`)).compile(),
    `while (undefined) {
break
}`)

  t.is(
    p.loop.while.call(ctx, [], [sym(`break`)]).compile(),
    `while (undefined) {
break
}`)

  ti.fail(
    () => p.loop.while.call(ctx, [], [sym(`break`), 10]),
    `expected no inputs, got 1 inputs`,
  )

  ti.fail(
    () => p.loop.while.call(ctx, sym(`continue`)),
    `missing declaration of "continue"`,
  )

  t.is(
    p.loop.while.call(ctx, [], sym(`continue`)).compile(),
    `while (undefined) {
continue
}`)

  t.is(
    p.loop.while.call(ctx, [], [sym(`continue`)]).compile(),
    `while (undefined) {
continue
}`)

  ti.fail(
    () => p.loop.while.call(ctx, [], [sym(`continue`), 10]),
    `expected no inputs, got 1 inputs`,
  )

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
      {[c.symMixin]: undefined, ...loopMixin},
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
    `every parameter must be a symbol or a list, got 10`,
  )

  ti.fail(
    () => p.loop.iter.call(ctx, [sym(`let`), 10, []]),
    `every parameter must be a symbol or a list, got 10`,
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

  ti.fail(
    () => p.loop.iter.call(ctx, [sym(`const`), [], 10]),
    `missing LHS in declaration or assignment`,
  )

  ti.fail(
    () => p.loop.iter.call(ctx, [sym(`let`), [], 10]),
    `missing LHS in declaration or assignment`,
  )

  ti.fail(
    () => p.loop.iter.call(ctx, [sym(`set`), [], 10]),
    `missing LHS in declaration or assignment`,
  )

  t.is(
    p.loop.iter.call(ctx, [sym(`const`), [p.list], []]).compile(),
    `for (const [] of []) {}`,
  )

  t.is(
    p.loop.iter.call(ctx, [sym(`let`), [p.list], []]).compile(),
    `for (let [] of []) {}`,
  )

  t.is(
    p.loop.iter.call(ctx, [sym(`set`), [p.list], []]).compile(),
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
      [sym(`const`), [p.list, sym(`one`), [p.list, sym(`two`)]], ti.macReqExpressionOne],
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
      [sym(`let`), [p.list, sym(`one`), [p.list, sym(`two`)]], ti.macReqExpressionOne],
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
      [sym(`const`), sym(`one`), ti.macReqExpressionTwo],
      ti.macReqStatementThree,
    ).compile(),
    `for await (const one of "two" ?? []) {
"three"
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
  ti.fail(() => p.func.call(ctx),                   `expected at least 1 inputs, got 0 inputs`)
  ti.fail(() => p.func.call(ctx, 10),               `expected an unqualified symbol or a list that begins with an unqualified symbol`)
  ti.fail(() => p.func.call(ctx, [10]),             `expected an unqualified symbol or a list that begins with an unqualified symbol`)
  ti.fail(() => p.func.call(ctx, sym(`one.two`)),   `expected an unqualified symbol or a list that begins with an unqualified symbol`)
  ti.fail(() => p.func.call(ctx, [sym(`one.two`)]), `expected an unqualified symbol or a list that begins with an unqualified symbol`)
  ti.fail(() => p.func.call(ctx, sym(`!@#`)),       `"!@#" does not represent a valid JS identifier`)
  ti.fail(() => p.func.call(ctx, sym(`await`)),     `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)
  ti.fail(() => p.func.call(ctx, sym(`eval`)),      `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)
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
    () => p.func.call(null),
    `expected at least 1 inputs, got 0 inputs`,
  )

  ti.fail(
    () => p.func.call(null, []),
    `expected an unqualified symbol or a list that begins with an unqualified symbol`,
  )

  ti.fail(
    () => p.func.call(null, 10),
    `expected an unqualified symbol or a list that begins with an unqualified symbol`,
  )

  ti.fail(
    () => p.func.call(null, [10]),
    `expected an unqualified symbol or a list that begins with an unqualified symbol`,
  )

  ti.fail(
    () => p.func.call(null, sym(`one.two`)),
    `expected an unqualified symbol or a list that begins with an unqualified symbol`,
  )

  ti.fail(
    () => p.func.call(null, [sym(`one.two`)]),
    `expected an unqualified symbol or a list that begins with an unqualified symbol`,
  )

  ti.fail(
    () => p.func.call(null, sym(`await`)),
    `"await" is a keyword in JS`,
  )

  ti.fail(
    () => p.func.call(null, sym(`eval`)),
    `"eval" is a reserved name in JS`,
  )

  t.is(
    p.func.call(ctx, sym(`one`)).compile(),
    `function one () {}`,
  )
  t.own(ctx, {})

  t.is(
    p.func.call(ctx, [sym(`one`)]).compile(),
    `function one () {}`,
  )
  t.own(ctx, {})

  t.is(
    p.func.call(ctx, [sym(`one`), [[]], [[[]]], sym(`two`)]).compile(),
    `function one (two) {}`,
  )
  t.own(ctx, {})

  t.is(
    p.func.call(ctx, sym(`one`), []).compile(),
    `function one () {
return
}`,
  )
  t.own(ctx, {})

  t.is(
    p.func.call(ctx, sym(`one`), 10).compile(),
    `function one () {
return 10
}`,
  )
  t.own(ctx, {})

  ti.fail(
    () => p.func.call(ctx, sym(`one`), sym(`two`)),
    `missing declaration of "two"`,
  )
  t.own(ctx, {})

  ti.fail(
    () => p.func.call(ctx, sym(`one`), [sym(`two`)]),
    `missing declaration of "two"`,
  )
  t.own(ctx, {})

  ti.fail(
    () => p.func.call(ctx, [sym(`one`)], sym(`two`)),
    `missing declaration of "two"`,
  )
  t.own(ctx, {})

  ti.fail(
    () => p.func.call(ctx, [sym(`one`)], [sym(`two`)]),
    `missing declaration of "two"`,
  )
  t.own(ctx, {})

  // Function name should be in scope in function body.
  t.is(
    p.func.call(ctx, sym(`one`), sym(`one`)).compile(),
    `function one () {
return one
}`)
  t.own(ctx, {})

  t.is(
    p.func.call(ctx, [sym(`one`)], sym(`one`)).compile(),
    `function one () {
return one
}`)
  t.own(ctx, {})

  ti.fail(
    () => p.func.call(ctx, [sym(`one`), sym(`two`), sym(`two`)]),
    `redundant declaration of "two"`,
  )

  ti.fail(
    () => p.func.call(ctx, [sym(`one`), sym(`await`)]),
    `"await" is a keyword in JS`,
  )

  ti.fail(
    () => p.func.call(ctx, [sym(`one`), sym(`eval`)]),
    `"eval" is a reserved name in JS`,
  )

  /*
  In JS, it's possible to redeclare the function name in the parameters. This
  works for both function statements and function expressions. In our system,
  it makes no sense syntactically since we place the function's name in the
  parameter list. Nevertheless, we endeavor to match the JS scoping behaviors
  as best we can.
  */
  t.is(
    p.func.call(ctx, [sym(`one`), sym(`one`)]).compile(),
    `function one (one) {}`,
  )
  t.own(ctx, {})

  // Should be able to redeclare function name in function body.
  t.is(
    p.func.call(ctx, sym(`one`), [p.const, sym(`one`), 10], []).compile(),
    `function one () {
const one = 10;
return
}`)
  t.own(ctx, {})

  ti.fail(
    () => p.func.call(ctx, [sym(`one`), sym(`one`), sym(`one`)]),
    `redundant declaration of "one"`,
  )

  /*
  Unlike the function name, function parameters can't be redeclared
  immediately as variables in the function body. This is a standard
  JS behavior that we're replicating.
  */
  ti.fail(
    () => p.func.call(ctx, [sym(`one`), sym(`one`)], [p.const, sym(`one`), 10], []),
    `redundant declaration of "one"`,
  )
  t.own(ctx, {})

  ti.fail(
    () => p.func.call(ctx, [sym(`one`), sym(`two`)], [p.const, sym(`two`), 10], []),
    `redundant declaration of "two"`,
  )
  t.own(ctx, {})

  t.is(
    p.func.call(ctx, [sym(`one`), sym(`two`)], sym(`two`)).compile(),
    `function one (two) {
return two
}`)
  t.own(ctx, {})

  t.is(
    p.func.call(ctx, [sym(`one`), sym(`two`), sym(`three`)], 10).compile(),
    `function one (two, three) {
return 10
}`
  )

  t.is(
    p.func.call(ctx, [sym(`one`), sym(`two`), sym(`three`)], 10, 20).compile(),
    `function one (two, three) {
10;
return 20
}`
  )

  t.is(
    p.func.call(ctx, [sym(`one`), sym(`two`), sym(`three`)], 10, 20, 30).compile(),
    `function one (two, three) {
10;
20;
return 30
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), ti.macReqExpressionOne).compile(),
    `function one () {
return "one"
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), ti.macReqStatementOne, ti.macReqExpressionTwo).compile(),
    `function one () {
"one";
return "two"
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), ti.macReqStatementOne, ti.macReqStatementTwo, ti.macReqExpressionThree).compile(),
    `function one () {
"one";
"two";
return "three"
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [[[]]]).compile(),
    `function one () {
return
}`)

  t.is(
    p.func.call(ctx, sym(`one`), [[[]]], 10, [[[]]]).compile(),
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
    p.func.call(ctx, sym(`one`)).compile(),
    `function one () {}`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  ti.fail(
    () => p.func.call(ctx, sym(`one`)),
    `redundant declaration of "one"`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  // Function name should be in scope in function body.
  t.is(
    p.func.call(ctx, sym(`two`), sym(`two`)).compile(),
    `function two () {
return two
}`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`)})

  // Should be able to redeclare function name in parameters.
  t.is(
    p.func.call(ctx, [sym(`three`), sym(`three`)], sym(`three`)).compile(),
    `function three (three) {
return three
}`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`), three: sym(`three`)})

  // Should be able to redeclare function name in function body.
t.is(
  p.func.call(ctx, sym(`four`), [p.const, sym(`four`), 10], []).compile(),
  `function four () {
const four = 10;
return
}`)
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`), three: sym(`three`), four: sym(`four`)})

  // Function parameters and body should have the same scope.
  ti.fail(
    () => p.func.call(ctx, [sym(`five`), sym(`five`)], [p.const, sym(`five`), 10], []),
    `redundant declaration of "five"`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`), two: sym(`two`), three: sym(`three`), four: sym(`four`), five: sym(`five`)})

  t.is(
    p.func.call(ctx, sym(`six`), ti.macReqStatementOne, ti.macReqStatementTwo, ti.macReqExpressionThree).compile(),
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
    p.func.call(ctx, sym(`one`)).compile(),
    `export function one () {}`,
  )
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined, one: sym(`one`)})

  ctx = c.ctxWithStatement(ctx)

  t.is(
    p.func.call(ctx, sym(`one`)).compile(),
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

  {
    const ctx = test(null)
    ti.reqSymUniqWith(ctx.this, `this`)

    // In expression mode, the declaration is made in the mixin scope.
    t.eq(ti.objFlat(ctx), [
      {[c.symStatement]: undefined, this: ctx.this},
      {[c.symMixin]: undefined, ...funcMixin, one: sym(`one`)},
    ])
  }

  {
    const ctx = test(c.ctxWithStatement(null))

    // In statement mode, the declaration is made in the outer scope.
    t.eq(ti.objFlat(ctx), [
      {[c.symStatement]: undefined, this: ctx.this},
      {[c.symMixin]: undefined, ...funcMixin},
      {[c.symStatement]: undefined, one: sym(`one`)},
    ])
  }

  {
    let ctx = Object.create(null)
    ctx.ret = 10
    ctx = test(ctx)

    t.eq(ti.objFlat(ctx), [
      {[c.symStatement]: undefined, this: ctx.this},
      {[c.symMixin]: undefined, guard: m.guard, arguments: sym(`arguments`), one: sym(`one`)},
      {ret: 10},
    ])
  }

  {
    let ctx = Object.create(null)
    ctx.ret = 10
    ctx.arguments = 20
    ctx.this = 30
    ctx = test(ctx)

    t.eq(ti.objFlat(ctx), [
      {[c.symStatement]: undefined, this: ctx.this},
      {[c.symMixin]: undefined, guard: m.guard, one: sym(`one`)},
      {ret: 10, arguments: 20, this: 30},
    ])
  }

  {
    let ctx = Object.create(null)
    ctx.ret = 10
    ctx.arguments = 20
    ctx.this = 30
    ctx.one = 40
    ctx = test(ctx)

    t.eq(ti.objFlat(ctx), [
      {[c.symStatement]: undefined, this: ctx.this},
      // Unlike most other "mixin" properties, the function's name is added to
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
      {[c.symStatement]: undefined, this: ctx.this},
      // Function name takes priority over mixin properties.
      {[c.symMixin]: undefined, guard: m.guard, arguments: sym(`arguments`), ret: sym(`ret`)},
    ])
  }
})

/*
JS has list and dict deconstructions in function parameters, variable
declarations, and assignments. We implement support for deconstructions by
providing a contextual override for the equivalent construction macros (at the
time of writing only the list variant is supported), and by interpreting any
lists in function parameters the same way as anywhere else. We expect them to
be list deconstructions or other similar macros, but users are free to use
arbitrary forms.
*/
t.test(function test_func_param_deconstruction() {
  function mac(src) {return p.func.call(null, src)}
  function test(src, exp) {t.is(mac(src).compile(), exp)}

  test(sym(`one`), `function one () {}`)
  test([sym(`one`)], `function one () {}`)

  ti.fail(
    () => mac([sym(`one`), [sym(`two`)]]),
    `missing declaration of "two"`,
  )

  test([sym(`one`), []], `function one () {}`)
  test([sym(`one`), [], [[]]], `function one () {}`)
  test([sym(`one`), [p.list]], `function one ([]) {}`)
  test([sym(`one`), [p.list, [p.list]]], `function one ([[]]) {}`)

  test([sym(`one`), sym(`two`)], `function one (two) {}`)
  test([sym(`one`), [p.list, sym(`two`)]], `function one ([two]) {}`)
  test([sym(`one`), [p.list, [p.list, sym(`two`)]]], `function one ([[two]]) {}`)

  test([sym(`one`), [p.list], sym(`two`)], `function one ([], two) {}`)
  test([sym(`one`), [p.list], [p.list, sym(`two`)]], `function one ([], [two]) {}`)
  test([sym(`one`), [p.list], [p.list, [p.list, sym(`two`)]]], `function one ([], [[two]]) {}`)

  test([sym(`one`), [p.list], sym(`two`), [p.list, [p.list]]], `function one ([], two, [[]]) {}`)
  test([sym(`one`), [p.list], [p.list, sym(`two`)], [p.list, [p.list]]], `function one ([], [two], [[]]) {}`)
  test([sym(`one`), [p.list], [p.list, [p.list, sym(`two`)]], [p.list, [p.list]]], `function one ([], [[two]], [[]]) {}`)

  test([sym(`one`), sym(`two`), sym(`three`)], `function one (two, three) {}`)
  test([sym(`one`), [p.list, sym(`two`), sym(`three`)]], `function one ([two, three]) {}`)
  test([sym(`one`), [p.list, [p.list, sym(`two`), sym(`three`)]]], `function one ([[two, three]]) {}`)

  test([sym(`one`), sym(`two`), sym(`three`)], `function one (two, three) {}`)
  test([sym(`one`), [p.list, sym(`two`), [p.list, sym(`three`)]]], `function one ([two, [three]]) {}`)
  test([sym(`one`), [p.list, [p.list, sym(`two`), [p.list, [p.list, sym(`three`)]]]]], `function one ([[two, [[three]]]]) {}`)
  test([sym(`one`), [p.list, [p.list, sym(`two`), [p.list, sym(`three`), sym(`four`)]]]], `function one ([[two, [three, four]]]) {}`)

  ti.fail(
    () => mac([m.symRest]),
    `expected an unqualified symbol or a list that begins with an unqualified symbol`,
  )

  ti.fail(
    () => mac([sym(`one`), m.symRest]),
    `rest symbol ${c.show(m.symRest.description)} must be followed by exactly one node, found 0 nodes`,
  )

  ti.fail(
    () => mac([sym(`one`), [m.symRest]]),
    `missing declaration of ""`,
  )

  ti.fail(
    () => mac([sym(`one`), [p.list, m.symRest]]),
    `rest symbol ${c.show(m.symRest.description)} must be followed by exactly one node, found 0 nodes`,
  )

  ti.fail(
    () => mac([sym(`one`), [p.list, m.symRest]]),
    `rest symbol ${c.show(m.symRest.description)} must be followed by exactly one node, found 0 nodes`,
  )

  ti.fail(
    () => mac([sym(`one`), m.symRest, [], []]),
    `rest symbol ${c.show(m.symRest.description)} must be followed by exactly one node, found 2 nodes`,
  )

  ti.fail(
    () => mac([sym(`one`), m.symRest, sym(`one`), sym(`two`)]),
    `rest symbol ${c.show(m.symRest.description)} must be followed by exactly one node, found 2 nodes`,
  )

  ti.fail(
    () => mac([sym(`one`), m.symRest, []]),
    `expected variant of isSym, got []`,
  )

  ti.fail(
    () => mac([sym(`one`), m.symRest, 10]),
    `expected variant of isSym, got 10`,
  )

  ti.fail(
    () => mac([sym(`one`), m.symRest, [sym(`two`)]]),
    `expected variant of isSym, got [two]`,
  )

  ti.fail(
    () => mac([sym(`one`), m.symRest, m.symRest]),
    c.show(m.symRest.description) + ` does not represent a valid JS identifier`,
  )

  ti.fail(
    () => mac([sym(`one`), m.symRest, sym(`one.two`)]),
    `"one.two" does not represent a valid JS identifier`,
  )

  test([sym(`one`), m.symRest, sym(`one`)], `function one (...one) {}`)
  test([sym(`one`), m.symRest, sym(`two`)], `function one (...two) {}`)

  test(
    [sym(`one`), sym(`two`), m.symRest, sym(`three`)],
    `function one (two, ...three) {}`,
  )

  test(
    [sym(`one`), sym(`two`), [p.list, m.symRest, sym(`three`)]],
    `function one (two, [...three]) {}`,
  )

  test(
    [sym(`one`), sym(`two`), [p.list, sym(`three`), m.symRest, sym(`four`)]],
    `function one (two, [three, ...four]) {}`,
  )

  ti.fail(
    () => mac([sym(`one`), sym(`two`), m.symRest, sym(`two`)]),
    `redundant declaration of "two"`,
  )

  ti.fail(
    () => mac([sym(`one`), sym(`two`), [p.list, sym(`two`)]]),
    `redundant declaration of "two"`,
  )

  ti.fail(
    () => mac([sym(`one`), sym(`two`), [p.list, m.symRest, sym(`two`)]]),
    `redundant declaration of "two"`,
  )

  let ctx
  t.is(
    p.func.call(
      null,
      [sym(`one`), sym(`two`), [p.list, sym(`three`), m.symRest, sym(`four`)]],
      {macro(val) {ctx = val; return sym(`one`)}},
      [],
    ).compile(),
    `function one (two, [three, ...four]) {
one;
return
}`)

  t.eq(ti.objFlat(ctx), [
    {[c.symStatement]: undefined, this: ctx.this, two: sym(`two`), three: sym(`three`), four: sym(`four`)},
    {[c.symMixin]: undefined, ...funcMixin, one: sym(`one`)},
  ])
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

t.test(function test_class_invalid() {
  ti.fail(() => p.class.call(null),                 `expected at least 1 inputs, got 0 inputs`)
  ti.fail(() => p.class.call(null, 10),             `expected an unqualified symbol or a list that begins with an unqualified symbol`)
  ti.fail(() => p.class.call(null, sym(`one.two`)), `expected an unqualified symbol or a list that begins with an unqualified symbol`)
  ti.fail(() => p.class.call(null, sym(`!@#`)),     `"!@#" does not represent a valid JS identifier`)
  ti.fail(() => p.class.call(null, sym(`await`)),   `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)
  ti.fail(() => p.class.call(null, sym(`eval`)),    `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)
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

    t.is(out.compile(), `(class one {})`)
    t.own(ctx, {})
    ti.reqSymUniqWith(sub.this, `this`)

    t.eq(ti.objFlat(sub), [
      {...classOverrideStatic, [m.symClassStatic]: sub.this, this: sub.this},
      // In expression mode, the declaration is made in the mixin scope.
      {[c.symMixin]: undefined, ...classMixin, one: sym(`one`)},
      ctx,
    ])
  }

  {
    const ctx = c.ctxWithStatement(null)
    const [out, sub] = run(ctx)

    t.is(out.compile(), `class one {}`)

    // In statement mode, the declaration is made in the outer scope.
    t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})
    ti.reqSymUniqWith(sub.this, `this`)

    t.eq(ti.objFlat(sub), [
      {...classOverrideStatic, [m.symClassStatic]: sub.this, this: sub.this},
      {[c.symMixin]: undefined, ...classMixin},
      ctx,
    ])
  }

  {
    const ctx = c.ctxWithModule(null)
    const [out, sub] = run(ctx)

    t.is(out.compile(), `export class one {}`)
    t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, [c.symExport]: undefined, one: sym(`one`)})
    ti.reqSymUniqWith(sub.this, `this`)

    t.eq(ti.objFlat(sub), [
      {...classOverrideStatic, [m.symClassStatic]: sub.this, this: sub.this},
      {[c.symMixin]: undefined, ...classMixin},
      ctx,
    ])
  }
})

t.test(function test_class_prototype() {
  ti.fail(() => m.classPrototype.call(null), `expected class static context, got null`)

  function run(src) {return p.class.call(null, sym(`one`), src)}
  function test(src, exp) {t.is(run(src).compile(), exp)}

  test([sym(`prototype`)], `(class one {})`)
  test([sym(`prototype`), [], [[]]], `(class one {})`)

  let ctx
  test([sym(`prototype`), {macro(val) {ctx = val; return []}}], `(class one {})`)

  ti.reqSymUniqWith(ctx.this, `this`)
  t.own(ctx, {...classOverrideProto, [m.symClassProto]: ctx.this, this: ctx.this})
})

t.test(function test_class_extends() {
  function test(src, exp) {t.is(p.class.call(null, src).compile(), exp)}

  test(sym(`one`), `(class one {})`)
  test([sym(`one`)], `(class one {})`)

  test([sym(`one`), []], `(class one {})`)
  test([sym(`one`), [], [[]]], `(class one {})`)

  test([sym(`one`), 10], `(class one extends 10 {})`)
  test([sym(`one`), 10, 20], `(class one extends 20(10) {})`)
  test([sym(`one`), 10, 20, 30], `(class one extends 30(20(10)) {})`)

  ti.fail(
    () => p.class.call(null, [sym(`one`), sym(`two`)]),
    `missing declaration of "two"`,
  )

  ti.fail(
    () => p.class.call(null, [sym(`one`), 10, sym(`two`)]),
    `missing declaration of "two"`,
  )

  test(
    [sym(`one`), ti.macReqExpressionOne],
    `(class one extends "one" {})`
  )

  test(
    [sym(`one`), ti.macReqExpressionOne, ti.macReqExpressionTwo],
    `(class one extends "two"("one") {})`
  )
})

t.test(function test_class_set_static() {
  const fun = m.setForClassStatic

  ti.fail(() => fun.call(null), `expected class static context, got null`)

  function run(src) {return p.class.call(null, sym(`one`), src)}
  function fail(src, msg) {return ti.fail(() => run(src), msg)}
  function test(src, exp) {t.is(run(src).compile(), exp)}

  fail(fun, `unable to usefully compile function [function setForClassStatic]`)
  fail([fun], `expected 2 inputs, got 0 inputs`)

  test([fun, [], []], `(class one {})`)
  fail([fun, [], 10], `unable to compile entry with empty left-hand side and value "10"`)

  test([fun, 0, []], `(class one {
static 0
})`)

  // Inconsistent with how we compile numbers, but consistent with the behavior
  // of computed field names in JS. We have the same behavior in dict literals.
  test([fun, -0, []], `(class one {
static 0
})`)

  test([fun, 10, []], `(class one {
static 10
})`)

  test([fun, -10, []], `(class one {
static "-10"
})`)

  test([fun, 10, 20], `(class one {
static 10 = 20
})`)

  test([fun, 12.34, 56.78], `(class one {
static "12.34" = 56.78
})`)

  test([fun, -12.34, 56.78], `(class one {
static "-12.34" = 56.78
})`)

  test([fun, 10n, 20n], `(class one {
static 10 = 20n
})`)

  test([fun, `one`, `two`], `(class one {
static "one" = "two"
})`)

  fail([fun, 10, sym(`two`)], `missing declaration of "two"`)
  fail([fun, 10, sym(`.one`)], `missing declaration of ""`)
  fail([fun, 10, sym(`.two`)], `missing declaration of ""`)
  fail([fun, 10, sym(`.one.two`)], `missing declaration of ""`)

  // Syntatically valid but would fail to run.
  // That's fine for our purposes.
  test([fun, sym(`one`), 10], `(class one {
static [one] = 10
})`)

  test([fun, sym(`.`), 10], `(class one {
static "" = 10
})`)

  test([fun, sym(`.one`), 10], `(class one {
static one = 10
})`)

  test([fun, sym(`.!@#`), 10], `(class one {
static "!@#" = 10
})`)

  test([fun, sym(`.await`), 10], `(class one {
static await = 10
})`)

  test([fun, sym(`.eval`), 10], `(class one {
static eval = 10
})`)

  test([fun, sym(`.123ident`), 10], `(class one {
static "123ident" = 10
})`)

  test([fun, ti.macReqExpressionOne, ti.macReqExpressionTwo], `(class one {
static ["one"] = "two"
})`)

  {
    const ctx = c.ctxWithStatement(null)
    t.own(ctx, {[c.symStatement]: undefined})

    let sub
    t.is(
      p.class.call(
        ctx,
        sym(`one`),
        [fun, sym(`.two`), 10],
        {macro(val) {sub = val; return []}},
      ).compile(),
      `class one {
static two = 10
}`)

    t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})
    t.own(sub, {...classOverrideStatic, [m.symClassStatic]: sub.this, this: sub.this}, `no additional declarations`)
  }
})

// Shares most of the implementation with the static version.
// This test is a sanity check.
t.test(function test_class_set_proto() {
  const fun = m.setForClassProto

  ti.fail(() => fun.call(null), `expected class prototype context, got null`)

  function run(src) {return p.class.call(null, sym(`one`), [sym(`prototype`), src])}
  function fail(src, msg) {return ti.fail(() => run(src), msg)}
  function test(src, exp) {t.is(run(src).compile(), exp)}

  fail([fun], `expected 2 inputs, got 0 inputs`)
  test([fun, [], []], `(class one {})`)
  fail([fun, [], 10], `unable to compile entry with empty left-hand side and value "10"`)

  test([fun, 10, 20], `(class one {
10 = 20
})`)

  test([fun, sym(`.two`), 10], `(class one {
two = 10
})`)

  test([fun, ti.macReqExpressionOne, ti.macReqExpressionTwo], `(class one {
["one"] = "two"
})`)
})

function testClassLetInvalid(fun, run, fail) {
  fail([fun], `expected between 1 and 2 inputs, got 0 inputs`)
  fail([fun, 10], `expected unqualified symbol, got 10`)
  fail([fun, 10, 20], `expected unqualified symbol, got 10`)
  fail([fun, sym(``)], `expected unqualified symbol, got`)
  fail([fun, sym(``), 10], `expected unqualified symbol, got`)
  fail([fun, sym(`.two`)], `expected unqualified symbol, got .two`)
  fail([fun, sym(`.two`), 10], `expected unqualified symbol, got .two`)
  fail([fun, sym(`one.two`)], `expected unqualified symbol, got one.two`)
  fail([fun, sym(`one.two`), 10], `expected unqualified symbol, got one.two`)
  fail([fun, sym(`one`), sym(`two`)], `missing declaration of "two"`)

  ti.fail(() => run([fun, sym(`two`)], [fun, sym(`two`)]), `redundant declaration of "two"`)
  ti.fail(() => run([fun, sym(`two`), 10], [fun, sym(`two`)]), `redundant declaration of "two"`)
  ti.fail(() => run([fun, sym(`two`)], [fun, sym(`two`), 10]), `redundant declaration of "two"`)
  ti.fail(() => run([fun, sym(`two`), 10], [fun, sym(`two`), 20]), `redundant declaration of "two"`)
}

t.test(function test_class_let_static() {
  const fun = m.letForClassStatic

  function run(...src) {return p.class.call(null, sym(`one`), ...src)}
  function fail(src, msg) {return ti.fail(() => run(src), msg)}
  function test(src, exp) {t.is(run(src).compile(), exp)}

  testClassLetInvalid(fun, run, fail)
  ti.fail(() => fun.call(null), `expected class static context, got null`)
  fail(fun, `unable to usefully compile function [function letForClassStatic]`)

  test([fun, sym(`one`)], `(class one {})`)

  test([fun, sym(`one`), []], `(class one {
static one
})`)

  test([fun, sym(`one`), 10], `(class one {
static one = 10
})`)

  /*
  This happens because we declare the field `one` before macroing the value.
  This example is useless, but this behavior can be useful in other cases, for
  example if the value is an arrow function that may be invoked later and read
  the updated value of the field. If we didn't declare the field `one` before
  macroing the value, the assignment would be `static one = one`, referring
  to the class name, which is already in scope. The resulting JS would parse
  but fail to run.
  */
  t.is(
    run([fun, sym(`one`), sym(`one`)]).compile(),
    `(class one {
static one = this.one
})`)

  test([fun, sym(`two`)], `(class one {})`)

  test([fun, sym(`two`), []], `(class one {
static two
})`)

  test([fun, sym(`two`), 10], `(class one {
static two = 10
})`)

  t.is(
    run(
      [fun, sym(`one`)],
      [fun, sym(`two`), sym(`one`)],
    ).compile(),
    `(class one {
static two = this.one
})`)

  t.is(
    run(
      [fun, sym(`one`), []],
      [fun, sym(`two`), sym(`one`)],
    ).compile(),
    `(class one {
static one;
static two = this.one
})`)

  t.is(
    run(
      [fun, sym(`one`), 10],
      [fun, sym(`two`), sym(`one`)],
    ).compile(),
    `(class one {
static one = 10;
static two = this.one
})`)

  test([fun, sym(`await`)], `(class one {})`)

  // Perfectly valid.
  test([fun, sym(`await`), []], `(class one {
static await
})`)

  test([fun, sym(`await`), 10], `(class one {
static await = 10
})`)

  test([fun, sym(`eval`)], `(class one {})`)

  test([fun, sym(`eval`), []], `(class one {
static eval
})`)

  test([fun, sym(`eval`), 10], `(class one {
static eval = 10
})`)

  test([fun, sym(`!@#`)], `(class one {})`)

  test([fun, sym(`!@#`), []], `(class one {
static "!@#"
})`)

  test([fun, sym(`!@#`), 10], `(class one {
static "!@#" = 10
})`)

  test([fun, sym(`123ident`)], `(class one {})`)

  test([fun, sym(`123ident`), []], `(class one {
static "123ident"
})`)

  test([fun, sym(`123ident`), 10], `(class one {
static "123ident" = 10
})`)

  test([fun, sym(`two`), ti.macReqExpressionOne], `(class one {
static two = "one"
})`)

  t.is(
    run(
      [fun, sym(`!@#`)],
      [fun, sym(`%^&`), sym(`!@#`)],
    ).compile(),
    `(class one {
static "%^&" = this["!@#"]
})`)

  t.is(
    run(
      [fun, sym(`!@#`), []],
      [fun, sym(`%^&`), sym(`!@#`)],
    ).compile(),
    `(class one {
static "!@#";
static "%^&" = this["!@#"]
})`)

  t.is(
    run(
      [fun, sym(`!@#`), 10],
      [fun, sym(`%^&`), sym(`!@#`)],
    ).compile(),
    `(class one {
static "!@#" = 10;
static "%^&" = this["!@#"]
})`)

  test([fun, sym(`two`), [p.fn, sym(`two`)]], `(class one {
static two = (() => this.two)
})`)

  fail(
    [fun, sym(`two`), [p.func, sym(`three`), sym(`two`)]],
    `property "two" unavailable in current context`,
  )

  t.is(
    run(
      [fun, sym(`two`)],
      [p.func, sym(`three`), sym(`two`)],
    ).compile(),
    `(class one {
static three () {
return this.two
}
})`)

  t.is(
    run(
      [fun, sym(`two`), 10],
      [p.func, sym(`three`), sym(`two`)],
    ).compile(),
    `(class one {
static two = 10;
static three () {
return this.two
}
})`)

  test(
    [fun, sym(`two`), [p.func, sym(`two`), sym(`two`)]],
    `(class one {
static two = function two () {
return two
}
})`)

  test(
    [fun, sym(`two`), [p.func, sym(`two`),
      [p.func, sym(`two`), sym(`two`)],
    ]],
    `(class one {
static two = function two () {
return function two () {
return two
}
}
})`)

  test(
    [fun, sym(`two`), [p.func, sym(`two`),
      [p.func, sym(`three`), sym(`two`)],
    ]],
    `(class one {
static two = function two () {
return function three () {
return two
}
}
})`)

  // Invalid JS. We're more concerned with context handling here.
  t.is(
    run(
      [fun, sym(`two`)],
      [sym(`prototype`), sym(`two`)],
    ).compile(),
    `(class one {
this.constructor.two
})`)

  // Invalid JS. We're more concerned with context handling here.
  t.is(
    run(
      [fun, sym(`two`), []],
      [sym(`prototype`), sym(`two`)],
    ).compile(),
    `(class one {
static two;
this.constructor.two
})`)

  // Invalid JS. We're more concerned with context handling here.
  t.is(
    run(
      [fun, sym(`two`), 10],
      [sym(`prototype`), sym(`two`)],
    ).compile(),
    `(class one {
static two = 10;
this.constructor.two
})`)

  // Invalid JS. We're more concerned with context handling here.
  t.is(
    run(
      [fun, sym(`two`), 10],
      [sym(`prototype`), [p.fn, sym(`two`)]],
    ).compile(),
    `(class one {
static two = 10;
(() => this.constructor.two)
})`)

  ti.fail(
    () => run(
      [fun, sym(`two`)],
      [sym(`prototype`), [p.fn,
        [p.func, sym(`three`), sym(`two`)],
      ]],
    ),
    `property "two" unavailable in current context`,
  )

  ti.fail(
    () => p.class.call(null, sym(`one`),
      [fun, sym(`two`),
        [p.class, sym(`three`),
          [fun, sym(`four`), sym(`two`)],
        ],
      ],
    ),
    `property "two" unavailable in current context`,
  )

  t.is(
    p.class.call(null, sym(`one`),
      [fun, sym(`two`),
        [p.class, sym(`three`),
          [fun, sym(`two`)],
          [fun, sym(`four`), sym(`two`)],
        ],
      ],
    ).compile(),
    `(class one {
static two = (class three {
static four = this.two
})
})`)
})

t.test(function test_class_let_proto() {
  const fun = m.letForClassProto

  function run(...src) {
    return p.class.call(null, sym(`one`), [sym(`prototype`), ...src])
  }

  function fail(src, msg) {return ti.fail(() => run(src), msg)}
  function test(src, exp) {t.is(run(src).compile(), exp)}

  testClassLetInvalid(fun, run, fail)
  ti.fail(() => fun.call(null), `expected class prototype context, got null`)

  fail(fun, `unable to usefully compile function [function letForClassProto]`)

  test([fun, sym(`one`)], `(class one {})`)

  test([fun, sym(`one`), []], `(class one {
one
})`)

  test([fun, sym(`one`), 10], `(class one {
one = 10
})`)

  t.is(
    run([fun, sym(`one`), sym(`one`)]).compile(),
    `(class one {
one = this.one
})`)

  test([fun, sym(`two`)], `(class one {})`)

  test([fun, sym(`two`), []], `(class one {
two
})`)

  test([fun, sym(`two`), 10], `(class one {
two = 10
})`)

  t.is(
    run(
      [fun, sym(`one`)],
      [fun, sym(`two`), sym(`one`)],
    ).compile(),
    `(class one {
two = this.one
})`)

  t.is(
    run(
      [fun, sym(`one`), []],
      [fun, sym(`two`), sym(`one`)],
    ).compile(),
    `(class one {
one;
two = this.one
})`)

  t.is(
    run(
      [fun, sym(`one`), 10],
      [fun, sym(`two`), sym(`one`)],
    ).compile(),
    `(class one {
one = 10;
two = this.one
})`)

  test([fun, sym(`await`)], `(class one {})`)

  // Perfectly valid.
  test([fun, sym(`await`), []], `(class one {
await
})`)

  test([fun, sym(`await`), 10], `(class one {
await = 10
})`)

  test([fun, sym(`eval`)], `(class one {})`)

  test([fun, sym(`eval`), []], `(class one {
eval
})`)

  test([fun, sym(`eval`), 10], `(class one {
eval = 10
})`)

  test([fun, sym(`!@#`)], `(class one {})`)

  test([fun, sym(`!@#`), []], `(class one {
"!@#"
})`)

  test([fun, sym(`!@#`), 10], `(class one {
"!@#" = 10
})`)

  test([fun, sym(`123ident`)], `(class one {})`)

  test([fun, sym(`123ident`), []], `(class one {
"123ident"
})`)

  test([fun, sym(`123ident`), 10], `(class one {
"123ident" = 10
})`)

  test([fun, sym(`two`), ti.macReqExpressionOne], `(class one {
two = "one"
})`)

  t.is(
    run(
      [fun, sym(`!@#`)],
      [fun, sym(`%^&`), sym(`!@#`)],
    ).compile(),
    `(class one {
"%^&" = this["!@#"]
})`)

  t.is(
    run(
      [fun, sym(`!@#`), []],
      [fun, sym(`%^&`), sym(`!@#`)],
    ).compile(),
    `(class one {
"!@#";
"%^&" = this["!@#"]
})`)

  t.is(
    run(
      [fun, sym(`!@#`), 10],
      [fun, sym(`%^&`), sym(`!@#`)],
    ).compile(),
    `(class one {
"!@#" = 10;
"%^&" = this["!@#"]
})`)

  test([fun, sym(`two`), [p.fn, sym(`two`)]], `(class one {
two = (() => this.two)
})`)

  fail(
    [fun, sym(`two`), [p.func, sym(`three`), sym(`two`)]],
    `property "two" unavailable in current context`,
  )

  test(
    [fun, sym(`two`), [p.func, sym(`two`), sym(`two`)]],
    `(class one {
two = function two () {
return two
}
})`)

  test(
    [fun, sym(`two`), [p.func, sym(`two`),
      [p.func, sym(`two`), sym(`two`)],
    ]],
    `(class one {
two = function two () {
return function two () {
return two
}
}
})`)

  test(
    [fun, sym(`two`), [p.func, sym(`two`),
      [p.func, sym(`three`), sym(`two`)],
    ]],
    `(class one {
two = function two () {
return function three () {
return two
}
}
})`)

  ti.fail(
    () => p.class.call(null, sym(`one`),
      [sym(`prototype`),
        [fun, sym(`two`),
          [p.class, sym(`three`),
            [sym(`prototype`),
              [fun, sym(`four`), sym(`two`)],
            ],
          ],
        ],
      ],
    ),
    `property "two" unavailable in current context`,
  )

  t.is(
    p.class.call(null, sym(`one`),
      [sym(`prototype`),
        [fun, sym(`two`),
          [p.class, sym(`three`),
            [sym(`prototype`),
              [fun, sym(`two`)],
              [fun, sym(`four`), sym(`two`)],
            ],
          ],
        ],
      ],
    ).compile(),
    `(class one {
two = (class three {
four = this.two
})
})`)
})

t.test(function test_class_let_mixed() {
  t.is(
    p.class.call(null, sym(`one`),
      [p.let, sym(`two`), 10],
      [sym(`prototype`),
        [p.let, sym(`three`), sym(`two`)],
      ],
    ).compile(),
    `(class one {
static two = 10;
three = this.constructor.two
})`)

  t.is(
    p.class.call(null, sym(`one`),
      [p.let, sym(`two`), 10],
      [sym(`prototype`),
        [p.let, sym(`two`), sym(`two`)],
      ],
    ).compile(),
    `(class one {
static two = 10;
two = this.two
})`)

  t.is(
    p.class.call(null, sym(`one`),
      [sym(`prototype`),
        [p.let, sym(`two`), 10],
      ],
      [p.let, sym(`two`), sym(`two`)],
    ).compile(),
    `(class one {
two = 10;
static two = this.two
})`)

  ti.fail(
    () => p.class.call(null, sym(`one`),
      [p.let, sym(`two`),
        [p.class, sym(`three`),
          [sym(`prototype`),
            [p.let, sym(`four`), sym(`two`)],
          ],
        ],
      ],
    ),
    `property "two" unavailable in current context`,
  )

  ti.fail(
    () => p.class.call(null, sym(`one`),
      [sym(`prototype`),
        [p.let, sym(`two`),
          [p.class, sym(`three`),
            [p.let, sym(`four`), sym(`two`)],
          ],
        ],
      ],
    ),
    `property "two" unavailable in current context`,
  )
})

function testClassFuncInvalid(fail) {
  fail([p.func], `expected at least 1 inputs, got 0 inputs`)
  fail([p.func, 10], `expected an unqualified symbol or a list that begins with an unqualified symbol`)
  fail([p.func, sym(``)], `expected an unqualified symbol or a list that begins with an unqualified symbol`)
  fail([p.func, sym(`.one`)], `expected an unqualified symbol or a list that begins with an unqualified symbol`)
  fail([p.func, sym(`.two`)], `expected an unqualified symbol or a list that begins with an unqualified symbol`)
  fail([p.func, sym(`one.two`)], `expected an unqualified symbol or a list that begins with an unqualified symbol`)
}

t.test(function test_class_func_static() {
  function run(...src) {return p.class.call(null, sym(`one`), ...src)}
  function fail(src, msg) {return ti.fail(() => run(src), msg)}
  function test(src, exp) {t.is(run(src).compile(), exp)}

  testClassFuncInvalid(fail)

  test(
    [p.func, sym(`one`)],
    `(class one {
static one () {}
})`)

  test(
    [p.func, [sym(`one`)]],
    `(class one {
static one () {}
})`)

  test(
    [p.func, sym(`two`)],
    `(class one {
static two () {}
})`)

  test(
    [p.func, [sym(`two`)]],
    `(class one {
static two () {}
})`)

  test(
    [p.func, sym(`await`)],
    `(class one {
static await () {}
})`)

  test(
    [p.func, sym(`eval`)],
    `(class one {
static eval () {}
})`)

  test(
    [p.func, sym(`!@#`)],
    `(class one {
static "!@#" () {}
})`)

  test(
    [p.func, sym(`123ident`)],
    `(class one {
static "123ident" () {}
})`)

  test(
    [p.func, sym(`two`), sym(`one`)],
    `(class one {
static two () {
return one
}
})`)

  test(
    [p.func, sym(`two`), sym(`two`)],
    `(class one {
static two () {
return this.two
}
})`)

  t.is(
    run(
      [p.func, sym(`one`)],
      [p.func, sym(`two`), sym(`one`)],
    ).compile(),
    `(class one {
static one () {};
static two () {
return this.one
}
})`)

  t.is(
    run(
      [p.func, sym(`!@#`)],
      [p.func, sym(`%^&`), sym(`!@#`)],
    ).compile(),
    `(class one {
static "!@#" () {};
static "%^&" () {
return this["!@#"]
}
})`)

  ti.fail(
    () => p.class.call(null, sym(`one`),
      [p.func, sym(`two`),
        [p.class, sym(`three`),
          [p.func, sym(`four`), sym(`two`)],
        ],
      ],
    ),
    `property "two" unavailable in current context`,
  )

  t.is(
    p.class.call(null, sym(`one`),
      [p.func, sym(`two`),
        [p.class, sym(`three`),
          [p.func, sym(`two`)],
          [p.func, sym(`four`), sym(`two`)],
        ],
      ],
    ).compile(),
    `(class one {
static two () {
return (class three {
static two () {};
static four () {
return this.two
}
})
}
})`)

  test(
    [p.func, [sym(`one`), sym(`one`)]],
    `(class one {
static one (one) {}
})`)

  test(
    [p.func, [sym(`one`), m.symRest, sym(`one`)]],
    `(class one {
static one (...one) {}
})`)

  test(
    [p.func, [sym(`one`), sym(`one`), sym(`two`)]],
    `(class one {
static one (one, two) {}
})`)

  test(
    [p.func, [sym(`one`), m.symRest, sym(`one`)], sym(`one`)],
    `(class one {
static one (...one) {
return one
}
})`)
})

t.test(function test_class_func_proto() {
  function run(...src) {
    return p.class.call(null, sym(`one`), [sym(`prototype`), ...src])
  }
  function fail(src, msg) {return ti.fail(() => run(src), msg)}
  function test(src, exp) {t.is(run(src).compile(), exp)}

  testClassFuncInvalid(fail)

  test(
    [p.func, sym(`one`)],
    `(class one {
one () {}
})`)

  test(
    [p.func, sym(`two`)],
    `(class one {
two () {}
})`)

  test(
    [p.func, sym(`await`)],
    `(class one {
await () {}
})`)

  test(
    [p.func, sym(`eval`)],
    `(class one {
eval () {}
})`)

  test(
    [p.func, sym(`!@#`)],
    `(class one {
"!@#" () {}
})`)

  test(
    [p.func, sym(`123ident`)],
    `(class one {
"123ident" () {}
})`)

  test(
    [p.func, sym(`two`), sym(`one`)],
    `(class one {
two () {
return one
}
})`)

  test(
    [p.func, sym(`two`), sym(`two`)],
    `(class one {
two () {
return this.two
}
})`)

  t.is(
    run(
      [p.func, sym(`one`)],
      [p.func, sym(`two`), sym(`one`)],
    ).compile(),
    `(class one {
one () {};
two () {
return this.one
}
})`)

  t.is(
    run(
      [p.func, sym(`!@#`)],
      [p.func, sym(`%^&`), sym(`!@#`)],
    ).compile(),
    `(class one {
"!@#" () {};
"%^&" () {
return this["!@#"]
}
})`)

  ti.fail(
    () => p.class.call(null, sym(`one`),
      [sym(`prototype`),
        [p.func, sym(`two`),
          [p.class, sym(`three`),
            [sym(`prototype`),
              [p.func, sym(`four`), sym(`two`)],
            ],
          ],
        ],
      ],
    ),
    `property "two" unavailable in current context`,
  )

  t.is(
    p.class.call(null, sym(`one`),
      [sym(`prototype`),
        [p.func, sym(`two`),
          [p.class, sym(`three`),
            [sym(`prototype`),
              [p.func, sym(`two`)],
              [p.func, sym(`four`), sym(`two`)],
            ],
          ],
        ],
      ],
    ).compile(),
    `(class one {
two () {
return (class three {
two () {};
four () {
return this.two
}
})
}
})`)

  test(
    [p.func, [sym(`one`), sym(`one`)]],
    `(class one {
one (one) {}
})`)

  test(
    [p.func, [sym(`one`), sym(`two`)]],
    `(class one {
one (two) {}
})`)

  test(
    [p.func, [sym(`one`), m.symRest, sym(`one`)]],
    `(class one {
one (...one) {}
})`)

  test(
    [p.func, [sym(`one`), sym(`one`), sym(`two`)]],
    `(class one {
one (one, two) {}
})`)

  test(
    [p.func, [sym(`one`), m.symRest, sym(`one`)], sym(`one`)],
    `(class one {
one (...one) {
return one
}
})`)
})

t.test(function test_class_func_mixed() {
  t.is(
    p.class.call(null, sym(`one`),
      [p.func, sym(`two`)],
      [sym(`prototype`),
        [p.func, sym(`three`), sym(`two`)],
      ],
    ).compile(),
    `(class one {
static two () {};
three () {
return this.constructor.two
}
})`)

  ti.fail(
    () => p.class.call(null, sym(`one`),
      [sym(`prototype`),
        [p.func, sym(`three`), sym(`two`)],
      ],
      [p.func, sym(`two`)],
    ),
    `missing declaration of "two"`,
  )

  ti.fail(
    () => p.class.call(null, sym(`one`),
      [sym(`prototype`),
        [p.func, sym(`three`)],
      ],
      [p.func, sym(`two`), sym(`three`)],
    ),
    `missing declaration of "three"`,
  )

  t.is(
    p.class.call(null, sym(`one`),
      [p.func, sym(`two`)],
      [sym(`prototype`),
        [p.func, sym(`two`), sym(`two`)],
      ],
    ).compile(),
    `(class one {
static two () {};
two () {
return this.two
}
})`)

  t.is(
    p.class.call(null, sym(`one`),
      [sym(`prototype`),
        [p.func, sym(`two`), sym(`two`)],
      ],
      [p.func, sym(`two`)],
    ).compile(),
    `(class one {
two () {
return this.two
};
static two () {}
})`)

  ti.fail(
    () => p.class.call(null, sym(`one`),
      [sym(`prototype`),
        [p.func, sym(`two`),
          [p.class, sym(`three`),
            [p.func, sym(`four`), sym(`two`)],
          ],
        ],
      ],
    ),
    `property "two" unavailable in current context`,
  )

  ti.fail(
    () => p.class.call(null, sym(`one`),
      [p.func, sym(`two`),
        [p.class, sym(`three`),
          [sym(`prototype`),
            [p.func, sym(`four`), sym(`two`)],
          ],
        ],
      ],
    ),
    `property "two" unavailable in current context`,
  )

  t.is(
    p.class.call(null, sym(`one`),
      [sym(`prototype`),
        [p.func, sym(`two`),
          [p.class, sym(`three`),
            [p.func, sym(`two`)],
            [p.func, sym(`four`), sym(`two`)],
          ],
        ],
      ],
    ).compile(),
    `(class one {
two () {
return (class three {
static two () {};
static four () {
return this.two
}
})
}
})`)

  t.is(
    p.class.call(null, sym(`one`),
      [p.func, sym(`two`),
        [p.class, sym(`three`),
          [sym(`prototype`),
            [p.func, sym(`two`)],
            [p.func, sym(`four`), sym(`two`)],
          ],
        ],
      ],
    ).compile(),
    `(class one {
static two () {
return (class three {
two () {};
four () {
return this.two
}
})
}
})`)
})

/*
Most of the implementation is shared with regular methods.
We only need basic sanity checks.
*/
t.test(function test_class_func_get_static() {
  t.is(
    p.class.call(null, sym(`one`),
      [p.func.get, sym(`two`)],
    ).compile(),
    `(class one {
static get two () {}
})`)

  t.is(
    p.class.call(null, sym(`one`),
      [p.func.get, sym(`two`)],
      [p.func.get, sym(`!@#`), sym(`two`)],
    ).compile(),
    `(class one {
static get two () {};
static get "!@#" () {
return this.two
}
})`)
})

/*
Most of the implementation is shared with regular methods.
We only need basic sanity checks.
*/
t.test(function test_class_func_get_proto() {
  t.is(
    p.class.call(null, sym(`one`),
      [m.classPrototype,
        [p.func.get, sym(`two`)],
      ],
    ).compile(),
    `(class one {
get two () {}
})`)

  t.is(
    p.class.call(null, sym(`one`),
      [m.classPrototype,
        [p.func.get, sym(`two`)],
        [p.func.get, sym(`!@#`), sym(`two`)],
      ],
    ).compile(),
    `(class one {
get two () {};
get "!@#" () {
return this.two
}
})`)

  t.is(
    p.class.call(null, sym(`one`),
      [p.func.get, sym(`two`)],
      [m.classPrototype,
        [p.func.get, sym(`!@#`), sym(`two`)],
      ],
    ).compile(),
    `(class one {
static get two () {};
get "!@#" () {
return this.constructor.two
}
})`)
})

t.test(function test_class_do_static() {
  t.is(
    p.class.call(null, sym(`one`), [p.do]).compile(),
    `(class one {})`,
  )

  t.is(
    p.class.call(null, sym(`one`), [p.do, [], [[]]]).compile(),
    `(class one {})`,
  )

  t.is(
    p.class.call(null, sym(`one`), [p.do, ti.macReqStatementOne]).compile(),
    `(class one {
static {
"one"
}
})`)

  const ctx = Object.assign(Object.create(null), classOverrideStatic)
  ctx[m.symClassStatic] = undefined
  testBlockStatement(ctx, p.do, compileStatic)
})

function compileStatic(val) {return `static ` + val}

t.test(function test_class_misc() {
  const ctx = c.ctxWithStatement(null)

  t.is(
    p.class.call(ctx, [sym(`one`), 10, 20],
      [p.do, 60, 70],

      [p.func, [sym(`five`), sym(`six`)], 80],

      [p.let, sym(`seven`), 90],

      [sym(`prototype`),
        [p.func, [sym(`two`), sym(`three`)], 30, 40],

        [p.let, sym(`four`), 50],
      ]
    ).compile(),

    `class one extends 20(10) {
static {
60;
70
};
static five (six) {
return 80
};
static seven = 90;
two (three) {
30;
return 40
};
four = 50
}`)

  t.own(ctx, {[c.symStatement]: undefined, one: sym(`one`)})

  t.is(
    c.macroNode(
      null,
      [p.class, [sym(`one`), 10],
        [p.do, [p.class, sym(`two`)]]
      ],
    ).compile(),
    `(class one extends 10 {
static {
class two {}
}
})`)
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
      `unable to compile entry with empty left-hand side and value "10"`,
    )

    ti.fail(
      () => p.dict.call(ctx, [], 10),
      `unable to compile entry with empty left-hand side and value "10"`,
    )

    ti.fail(
      () => p.dict.call(ctx, sym(`one`), 10),
      `missing declaration of "one"`,
    )

    ti.fail(
      () => p.dict.call(ctx, sym(`one.two`), 10),
      `missing declaration of "one"`,
    )

    ti.fail(
      () => p.dict.call(ctx, sym(`.one.two`), 10),
      `missing declaration of ""`,
    )

    ti.fail(
      () => p.dict.call(ctx, 10, sym(`.`)),
      `missing declaration of ""`,
    )

    ti.fail(
      () => p.dict.call(ctx, 10, sym(`..`)),
      `missing declaration of ""`,
    )

    ti.fail(
      () => p.dict.call(ctx, 10, sym(`...`)),
      `missing declaration of ""`,
    )

    ti.fail(
      () => p.dict.call(ctx, sym(`..`), 10),
      `missing declaration of ""`,
    )

    ti.fail(
      () => p.dict.call(ctx, sym(`....`), 10),
      `missing declaration of ""`,
    )
  }

  fail(expr)
  fail(stat)

  t.is(p.dict.call(expr).compile(), `{}`)
  t.is(p.dict.call(stat).compile(), `({})`)

  t.is(p.dict.call(expr, NaN, 10).compile(), `{"NaN": 10}`)
  t.is(p.dict.call(stat, NaN, 10).compile(), `({"NaN": 10})`)

  t.is(p.dict.call(expr, Infinity, 10).compile(), `{"Infinity": 10}`)
  t.is(p.dict.call(stat, Infinity, 10).compile(), `({"Infinity": 10})`)

  t.is(p.dict.call(expr, -Infinity, 10).compile(), `{"-Infinity": 10}`)
  t.is(p.dict.call(stat, -Infinity, 10).compile(), `({"-Infinity": 10})`)

  t.is(p.dict.call(expr, -0, -0).compile(), `{0: -0}`)
  t.is(p.dict.call(stat, -0, -0).compile(), `({0: -0})`)

  t.is(p.dict.call(expr, -0, 10).compile(), `{0: 10}`)
  t.is(p.dict.call(stat, -0, 10).compile(), `({0: 10})`)

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

  // Works by accident. We have no motive to avoid this.
  t.is(p.dict.call(expr, sym(`.`), 10).compile(), `{"": 10}`)
  t.is(p.dict.call(stat, sym(`.`), 10).compile(), `({"": 10})`)

  // Spread support.
  t.is(p.dict.call(expr, sym(`...`), 10).compile(), `{...10}`)
  t.is(p.dict.call(stat, sym(`...`), 10).compile(), `({...10})`)
})

t.bench(function bench_dict_compile_core() {
  c.compileDict({one: 10, two: 20, three: 30, four: 40})
})

t.bench(function bench_dict_compile_macro() {
  p.dict.call(null, `one`, 10, `two`, 20, `three`, 30, `four`, 40).compile()
})

t.test(function test_obj() {
  t.test(function test_basic() {
    let ctx = null
    function mac(...src) {return c.macroNode(ctx, [p.obj, ...src])}

    t.is(mac().compile(), `{}`)
    t.is(mac([]).compile(), `{}`)
    t.is(mac([], [[]]).compile(), `{}`)

    // Invalid JS.
    t.is(mac(10).compile(), `{10}`)
    t.is(mac(10, 20).compile(), `{10, 20}`)
    t.is(mac(10, 20, 30).compile(), `{10, 20, 30}`)
    t.is(mac(10, [], 20, [[]], 30).compile(), `{10, 20, 30}`)

    // Invalid JS.
    t.is(mac(ti.macReqExpressionOne).compile(), `{"one"}`)
    t.is(mac(ti.macReqExpressionOne, ti.macReqExpressionTwo).compile(), `{"one", "two"}`)

    ti.fail(() => mac(sym(`one`)), `missing declaration of "one"`)

    ctx = Object.create(null)
    ctx.one = sym(`one`)
    ctx.two = sym(`two`)

    t.is(mac(sym(`one`)).compile(), `{one}`)
    t.is(mac(sym(`one`), sym(`two`)).compile(), `{one, two}`)
  })

  t.test(function test_spread() {
    function mac(...src) {return c.macroNode(null, [p.obj, ...src])}

    t.is(mac([p.spread, []]).compile(), `{}`)

    // `?? []` is added by the `spread` macro for list contexts, and is useless
    // in dict contexts. May avoid later.
    t.is(mac([p.spread, 10]).compile(), `{...(10 ?? [])}`)

    t.is(
      mac(10, [p.spread, 20], 30, [p.spread, 40]).compile(),
      `{10, ...(20 ?? []), 30, ...(40 ?? [])}`,
    )
  })

  t.test(function test_set() {
    const ctx = Object.create(null)
    function mac(...src) {return c.macroNode(ctx, [p.obj, ...src])}

    ti.fail(() => mac([p.set]), `expected 2 inputs, got 0 inputs`)

    t.is(mac([p.set, [], []]).compile(), `{}`)

    ti.fail(
      () => mac([p.set, [], 10]),
      `unable to compile entry with empty left-hand side and value "10"`,
    )

    t.is(
      mac([p.set, 10, []]).compile(),
      `{10: undefined}`,
    )

    t.is(
      mac([p.set, 10, 20]).compile(),
      `{10: 20}`,
    )

    t.is(
      mac([p.set, `one`, 10]).compile(),
      `{"one": 10}`,
    )

    ti.fail(
      () => mac([p.set, sym(`one`), 10]),
      `missing declaration of "one"`,
    )

    ctx.one = sym(`one`)

    t.is(
      mac([p.set, sym(`one`), 10]).compile(),
      `{[one]: 10}`,
    )

    t.is(
      mac([p.set, ti.macReqExpressionOne, ti.macReqExpressionTwo]).compile(),
      `{["one"]: "two"}`,
    )

    t.is(
      mac([p.set, [10, 20], [30, 40]]).compile(),
      `{[10(20)]: 30(40)}`,
    )
  })

  t.test(function test_let() {
    const ctx = Object.create(null)
    function mac(...src) {return c.macroNode(ctx, [p.obj, ...src])}

    ti.fail(() => mac([p.let]), `expected between 1 and 2 inputs, got 0 inputs`)
    ti.fail(() => mac([p.let, 10]), `expected unqualified symbol, got 10`)
    ti.fail(() => mac([p.let, 10, 20]), `expected unqualified symbol, got 10`)

    /*
    This behavior is consistent with class fields.
    This declaration should still add `one` to scope.
    See other tests below.
    */
    t.is(mac([p.let, sym(`one`)]).compile(), `{}`)

    t.is(mac([p.let, sym(`one`), []]).compile(), `{one: undefined}`)
    t.is(mac([p.let, sym(`one`), 10]).compile(), `{one: 10}`)
    t.is(mac([p.let, sym(`await`), 10]).compile(), `{await: 10}`)
    t.is(mac([p.let, sym(`eval`), 10]).compile(), `{eval: 10}`)
    t.is(mac([p.let, sym(`!@#`), 10]).compile(), `{"!@#": 10}`)
    t.is(mac([p.let, sym(`one-two`), 10]).compile(), `{"one-two": 10}`)

    // Outer context should be unaffected.
    t.own(ctx, {})

    /*
    This variant of `let` should declare names in the inner context created by
    the object literal macro, and the resulting declarations should be usable
    only in contexts where `this` is the object we're creating. When the name
    is visible in the context but `this` doesn't match, attempting to use the
    name should cause a compile-time exception. The correct `this` should be
    available in methods; see other tests below.
    */
    ti.fail(
      () => mac([p.let, sym(`one`), sym(`one`)]),
      `property "one" unavailable in current context`,
    )

    ti.fail(
      () => mac(
        [p.let, sym(`one`), 10],
        [p.let, sym(`two`), sym(`one`)],
      ),
      `property "one" unavailable in current context`,
    )

    t.is(
      mac(
        [p.let, sym(`one`), 10],
        [p.let, sym(`two`), 20],
      ).compile(),
      `{one: 10, two: 20}`,
    )

    ti.fail(
      () => mac(
        [p.let, sym(`one`), 10],
        [p.let, sym(`two`), 20],
        [p.let, sym(`three`), sym(`two`)],
      ),
      `property "two" unavailable in current context`,
    )

    ti.fail(
      () => mac([p.let, sym(`one`), sym(`!@#`)]),
      `missing declaration of "!@#"`,
    )

    ti.fail(
      () => mac([p.let, sym(`!@#`), sym(`!@#`)]),
      `property "!@#" unavailable in current context`,
    )
  })

  t.test(function test_func() {
    const ctx = Object.create(null)
    function mac(...src) {return c.macroNode(ctx, [p.obj, ...src])}

    t.is(
      mac([p.func, sym(`one`)]).compile(),
      `{one () {}}`,
    )

    // Outer context should be unaffected.
    t.own(ctx, {})

    t.is(
      mac([p.func, sym(`one`), 10]).compile(),
      `{one () {
return 10
}}`)

    t.is(
      mac(
        [p.func, sym(`one`)],
        [p.func, sym(`two`)],
      ).compile(),
      `{one () {}, two () {}}`,
    )

    t.is(
      mac(
        10,
        [p.func, sym(`one`)],
        20,
        [p.func, sym(`two`)],
        30,
      ).compile(),
      `{10, one () {}, 20, two () {}, 30}`,
    )

    /*
    Just like names declared with object `let`, names declared with object
    `func` must be visible in the object's context, but attempting to use
    them in this context must cause a compile exception. At runtime, these
    properties become available only in methods.
    */
    ti.fail(
      () => mac(
        [p.func, sym(`one`)],
        [p.let, sym(`two`), sym(`one`)],
      ),
      `property "one" unavailable in current context`,
    )

    /*
    At runtime, properties declared with specific `let` and `func` are available
    inside of methods (accessible on `this`), and we must mirror that.
    */
    t.is(
      mac(
        [p.let, sym(`one`)],
        [p.func, sym(`two`), sym(`one`)],
      ).compile(),
      `{two () {
return this.one
}}`)

    t.is(
      mac(
        [p.let, sym(`one`), 10],
        [p.func, sym(`two`), sym(`one`)],
      ).compile(),
      `{one: 10, two () {
return this.one
}}`)

    t.is(
      mac(
        [p.func, sym(`one`)],
        [p.func, sym(`two`), sym(`one`)],
      ).compile(),
      `{one () {}, two () {
return this.one
}}`)

    /*
    Inside of methods, entering another context that changes `this` should make
    properties of the current object unavailable again.
    */
    ti.fail(
      () => mac(
        [p.let, sym(`one`), 10],
        [p.func, sym(`two`), [p.func, sym(`three`), sym(`one`)]],
      ),
      `property "one" unavailable in current context`,
    )

    let sub
    t.is(
      mac(
        [p.func, sym(`one`), {macro(val) {
          sub = val
          return []
        }}],
      ).compile(),
      `{one () {
return
}}`)

    ti.reqSymUniqWith(sub.this, `this`)

    t.eq(ti.objFlat(sub), [
      {},
      {[c.symStatement]: undefined, this: c.reqSym(sub.this)},
      {[c.symMixin]: undefined, ...funcMixin},
      {
        [m.symObjThis]: c.reqSym(sub.this),
        ...objOverride,
        one: sub.one,
      },
      ...ti.objFlat(ctx),
    ])
  })

  // Implementation is shared with normal methods.
  // We need only basic sanity checks.
  t.test(function test_func_async() {
    function mac(...src) {return c.macroNode(null, [p.obj, ...src])}

    t.is(
      mac(
        [p.func.async, sym(`one`)],
        [p.func.async, sym(`two`), sym(`one`)],
      ).compile(),
      `{async one () {}, async two () {
return this.one
}}`)
  })

  // Implementation is shared with normal methods.
  // We need only basic sanity checks.
  t.test(function test_func_get() {
    function mac(...src) {return c.macroNode(null, [p.obj, ...src])}

    t.is(
      mac(
        [p.func.get, sym(`one`)],
        [p.func.get, sym(`two`), sym(`one`)],
      ).compile(),
      `{get one () {}, get two () {
return this.one
}}`)
  })

  t.test(function test_mixed() {
    function mac(...src) {return c.macroNode(null, [p.obj, ...src])}

    t.is(
      mac(
        [p.set, 10, 20],
        [p.let, sym(`one`)],
        [p.let, sym(`two`), 30],
        [p.func, sym(`three`), sym(`one`)],
        [p.func.async, sym(`four`), sym(`two`)],
        [p.func.get, sym(`five`), sym(`three`)],
        [p.spread, []],
        [p.spread, 40],
      ).compile(),
      `{10: 20, two: 30, three () {
return this.one
}, async four () {
return this.two
}, get five () {
return this.three
}, ...(40 ?? [])}`,
    )
  })
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

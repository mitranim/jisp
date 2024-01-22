import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'
import * as p from '../js/prelude.mjs'
import * as m from '../js/mac.mjs'

function sym(val) {return Symbol.for(val)}
function id(val) {return val}

t.test(function test_export() {
  ti.fail(() => p.export.call(null), `expected between 1 and 2 inputs, got 0 inputs`)
  ti.fail(() => p.export.call(null, 10, 20, 30), `expected between 1 and 2 inputs, got 3 inputs`)
  ti.fail(() => p.export.call(null, sym(`one`), sym(`two`)), `expected statement context, got expression context`)

  let ctx = c.ctxWithStatement(null)
  ti.fail(() => p.export.call(ctx, sym(`one`)), `missing declaration of "one"`)
  ti.fail(() => p.export.call(ctx, sym(`one.two`)), `missing declaration of "one"`)
  ti.fail(() => p.export.call(ctx, sym(`one`), sym(`two.three`)), `missing declaration of "one"`)
  ti.fail(() => p.export.call(ctx, sym(`one.two`), sym(`two.three`)), `missing declaration of "one"`)

  ti.fail(() => p.export.call(ctx, sym(`!@#`)), `missing declaration of "!@#"`)
  ctx[`!@#`] = undefined
  ti.fail(() => p.export.call(ctx, sym(`!@#`)), `"!@#" does not represent a valid JS identifier`)

  ti.fail(() => p.export.call(ctx, sym(`await`)), `missing declaration of "await"`)
  ctx.await = undefined
  ti.fail(() => p.export.call(ctx, sym(`await`)), `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)

  ti.fail(() => p.export.call(ctx, sym(`eval`)), `missing declaration of "eval"`)
  ctx.eval = undefined
  ti.fail(() => p.export.call(ctx, sym(`eval`)), `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)

  ctx.one = undefined
  ti.fail(() => p.export.call(ctx, sym(`one.two`)), `"one.two" does not represent a valid JS identifier`)
  ti.fail(() => p.export.call(ctx, sym(`one`), 10), `export alias must be unqualified identifier or string, got 10`)
  ti.fail(() => p.export.call(ctx, sym(`one`), sym(`two.three`)), `export alias must be unqualified identifier or string, got two.three`)
  ti.fail(() => p.export.call(ctx, sym(`one`), sym(`two.!@#`)), `export alias must be unqualified identifier or string, got two.!@#`)

  t.is(p.export.call(ctx, sym(`one`)).compile(), `export {one}`)
  t.is(p.export.call(ctx, sym(`one`), sym(`!@#`)).compile(), `export {one as "!@#"}`)
})

t.test(function test_const() {
  ti.fail(() => p.const.call(null), `expected 2 inputs, got 0 inputs`)
  ti.fail(() => p.const.call(null, 10), `expected 2 inputs, got 1 inputs`)
  ti.fail(() => p.const.call(null, sym(`one`), 10), `expected statement context, got expression context`)

  let ctx = c.ctxWithStatement(null)
  ti.fail(() => p.const.call(ctx, sym(`one.two`), 10), `"one.two" does not represent a valid JS identifier`)
  ti.fail(() => p.const.call(ctx, sym(`!@#`), 10), `"!@#" does not represent a valid JS identifier`)
  ti.fail(() => p.const.call(ctx, sym(`await`), 10), `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)
  ti.fail(() => p.const.call(ctx, sym(`eval`), 10), `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)

  t.is(p.const.call(ctx, sym(`one`), 10).compile(), `const one = 10`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined})
  ti.fail(() => p.const.call(ctx, sym(`one`), 20), `redundant declaration of "one"`)

  t.is(p.const.call(ctx, sym(`two`), ti.macReqExpression).compile(), `const two = "expression_value"`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined})
  ti.fail(() => p.const.call(ctx, sym(`two`), 30), `redundant declaration of "two"`)

  ti.fail(
    () => p.const.call(ctx, sym(`three`), ti.macReqStatement),
    `expected statement context, got expression context`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined})

  ctx = c.ctxWithStatement(ctx)
  t.is(p.const.call(ctx, sym(`one`), 40).compile(), `const one = 40`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined})

  t.is(p.const.call(ctx, sym(`two`), []).compile(), `const two = undefined`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined})

  ctx = c.ctxWithModule(ctx)
  t.is(p.const.call(ctx, sym(`one`), 50).compile(), `export const one = 50`)
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, one: undefined})
})

t.test(function test_let() {
  ti.fail(() => p.let.call(null), `expected between 1 and 2 inputs, got 0 inputs`)
  ti.fail(() => p.let.call(null, sym(`one`), 10), `expected statement context, got expression context`)

  let ctx = c.ctxWithStatement(null)
  ti.fail(() => p.let.call(ctx, sym(`one.two`), 10), `"one.two" does not represent a valid JS identifier`)
  ti.fail(() => p.let.call(ctx, sym(`!@#`), 10), `"!@#" does not represent a valid JS identifier`)

  t.is(p.let.call(ctx, sym(`one`), 10).compile(), `let one = 10`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined})
  ti.fail(() => p.let.call(ctx, sym(`one`), 20), `redundant declaration of "one"`)

  t.is(p.let.call(ctx, sym(`two`), ti.macReqExpression).compile(), `let two = "expression_value"`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined})
  ti.fail(() => p.let.call(ctx, sym(`two`), 30), `redundant declaration of "two"`)

  ti.fail(
    () => p.let.call(ctx, sym(`three`), ti.macReqStatement),
    `expected statement context, got expression context`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined})

  ctx = c.ctxWithStatement(ctx)
  t.is(p.let.call(ctx, sym(`one`)).compile(), `let one`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined})

  t.is(p.let.call(ctx, sym(`two`), undefined).compile(), `let two = undefined`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined})

  t.is(p.let.call(ctx, sym(`three`), null).compile(), `let three = null`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined, three: undefined})

  t.is(p.let.call(ctx, sym(`four`), []).compile(), `let four`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined, three: undefined, four: undefined})

  ctx = c.ctxWithModule(ctx)
  t.is(p.let.call(ctx, sym(`one`)).compile(), `export let one`)
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, one: undefined})

  t.is(p.let.call(ctx, sym(`two`), 50).compile(), `export let two = 50`)
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, one: undefined, two: undefined})
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

source function:

[function macReqStatement]`)

  t.is(p.if.call(ctx, 10, 20).compile(), `(10 ? 20 : undefined)`)
  t.is(p.if.call(ctx, 10, 20, 30).compile(), `(10 ? 20 : 30)`)

  t.is(p.if.call(ctx, ti.macOne, ti.macTwo).compile(), `("one" ? "two" : undefined)`)
  t.is(p.if.call(ctx, ti.macOne, ti.macTwo, ti.macThree).compile(), `("one" ? "two" : "three")`)
})

t.test(function test_if_statement() {
  const ctx = c.ctxWithStatement(null)

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

  t.is(p.if.call(ctx, [], 10).compile(), `if (undefined) {
10
}`)

  t.is(p.if.call(ctx, [], 10, 20).compile(), `if (undefined) {
10
} else {
20
}`)

  t.is(p.if.call(ctx, 10, [], 20).compile(), `if (10) {} else {
20
}`)

  t.is(p.if.call(ctx, 10, 20, 30).compile(), `if (10) {
20
} else {
30
}`)

  t.is(
    p.if.call(
      ctx,
      ti.macReqExpressionOne,
      ti.macReqStatementTwo,
      ti.macReqStatementThree,
    ).compile(),
    `if ("one") {
"two"
} else {
"three"
}`,
  )

  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.if.call(
      ctx,
      false,
      [p.const, sym(`one`), 10],
      [p.const, sym(`one`), 20],
    ).compile(),
    `if (false) {
const one = 10
} else {
const one = 20
}`,
  )

  t.own(ctx, {[c.symStatement]: undefined})
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

t.test(function test_void_bare() {
  let ctx = null
  t.is(p.void.default.call(ctx),                    undefined)
  t.is(p.void.default.call(ctx, ti.macUnreachable), undefined)

  ctx = c.ctxWithStatement(null)
  t.eq(p.void.default.call(ctx),                    [])
  t.eq(p.void.default.call(ctx, ti.macUnreachable), [])
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

  t.eq(p.void.call(ctx), undefined)
  t.eq(p.void.call(ctx, []), undefined)
  t.eq(p.void.call(ctx, [], []), undefined)
  t.eq(p.void.call(ctx, [], [[]]), undefined)

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
  ti.fail(() => m.ret.default.call(null), `expected statement context, got expression context`)
  ti.fail(() => m.ret.default.call(null, ti.macUnreachable), `expected statement context, got expression context`)

  const ctx = c.ctxWithStatement(null)
  t.is(m.ret.default.call(ctx).compile(), `return`)
  t.is(m.ret.default.call(ctx, ti.macUnreachable).compile(), `return`)
})

t.test(function test_ret_statement() {
  let ctx = null
  ti.fail(() => m.ret.call(ctx, 10, 20), `expected no more than 1 inputs, got 2 inputs`)
  ti.fail(() => m.ret.call(ctx, 10), `expected statement context, got expression context`)
  ti.fail(() => m.ret.call(ctx), `expected statement context, got expression context`)

  ctx = c.ctxWithStatement(null)
  ti.fail(() => m.ret.call(ctx, sym(`one`)), `missing declaration of "one"`)
  ti.fail(() => m.ret.call(ctx, ti.macUnreachable), `unreachable`)

  t.is(m.ret.call(ctx).compile(), `return`)
  t.is(m.ret.call(ctx, []).compile(), `return`)
  t.is(m.ret.call(ctx, [[]]).compile(), `return`)
  t.is(m.ret.call(ctx, undefined).compile(), `return undefined`)
  t.is(m.ret.call(ctx, null).compile(), `return null`)
  t.is(m.ret.call(ctx, 10).compile(), `return 10`)
  t.is(m.ret.call(ctx, ti.macReqExpression).compile(), `return "expression_value"`)
})

function testFuncCommon(ctx) {
  ti.fail(() => p.func.call(ctx),                 `expected at least 1 inputs, got 0 inputs`)
  ti.fail(() => p.func.call(ctx, 10),             `expected variant of isSym, got 10`)
  ti.fail(() => p.func.call(ctx, sym(`one.two`)), `"one.two" does not represent a valid JS identifier`)
  ti.fail(() => p.func.call(ctx, sym(`!@#`)),     `"!@#" does not represent a valid JS identifier`)
  ti.fail(() => p.func.call(ctx, sym(`await`)),   `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)
  ti.fail(() => p.func.call(ctx, sym(`eval`)),    `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)
}

t.test(function test_func_expression() {
  const ctx = Object.create(null)
  testFuncCommon(ctx)

  /*
  Some of the behaviors below are also common between expression and statement
  modes, but testing them in both modes would be inconvenient because in
  statement mode, the function is declared before macroing params and body.
  We simply assume that everything after the function declaration is consistent
  between both modes.
  */

  ti.fail(() => p.func.call(ctx, sym(`one`)),     `expected variant of isArr, got undefined`)
  ti.fail(() => p.func.call(ctx, sym(`one`), 10), `expected variant of isArr, got 10`)

  ti.fail(
    () => p.func.call(ctx, sym(`one`), [10]),
    `expected variant of isSym, got 10`,
  )
  t.own(ctx, {})

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
    p.func.call(ctx, sym(`one`), []).compile(),
    `function one(){}`,
  )
  t.own(ctx, {})

  // Function name should be in scope in function body.
  t.is(
    p.func.call(ctx, sym(`one`), [], sym(`one`)).compile(),
    `function one(){
return one
}`)
  t.own(ctx, {})

  // Should be able to redeclare function name in parameters.
  t.is(
    p.func.call(ctx, sym(`one`), [sym(`one`)], sym(`one`)).compile(),
    `function one(one){
return one
}`)
  t.own(ctx, {})

  // Should be able to redeclare function name in function body.
  t.is(
    p.func.call(ctx, sym(`one`), [], [p.const, sym(`one`), 10], []).compile(),
    `function one(){
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
    `function one(two){
return two
}`)
  t.own(ctx, {})

  ti.fail(
    () => p.func.call(ctx, sym(`one`), [sym(`two`), sym(`two`)]),
    `redundant declaration of "two"`,
  )

  t.is(
    p.func.call(ctx, sym(`one`), [sym(`two`), sym(`three`)], 10).compile(),
    `function one(two, three){
return 10
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [sym(`two`), sym(`three`)], 10, 20).compile(),
    `function one(two, three){
10;
return 20
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [sym(`two`), sym(`three`)], 10, 20, 30).compile(),
    `function one(two, three){
10;
20;
return 30
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [], ti.macReqExpressionOne).compile(),
    `function one(){
return "one"
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [], ti.macReqStatementOne, ti.macReqExpressionTwo).compile(),
    `function one(){
"one";
return "two"
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [], ti.macReqStatementOne, ti.macReqStatementTwo, ti.macReqExpressionThree).compile(),
    `function one(){
"one";
"two";
return "three"
}`
  )

  t.is(
    p.func.call(ctx, sym(`one`), [], [[[]]]).compile(),
    `function one(){
return
}`)

  t.is(
    p.func.call(ctx, sym(`one`), [], [[[]]], 10, [[[]]]).compile(),
    `function one(){
10;
return
}`)
})

t.test(function test_func_statement() {
  const ctx = c.ctxWithStatement(null)
  testFuncCommon(ctx)
  t.own(ctx, {[c.symStatement]: undefined})

  t.is(
    p.func.call(ctx, sym(`one`), []).compile(),
    `function one(){}`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: undefined})

  ti.fail(
    () => p.func.call(ctx, sym(`one`), []),
    `redundant declaration of "one"`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: undefined})

  // Function name should be in scope in function body.
  t.is(
    p.func.call(ctx, sym(`two`), [], sym(`two`)).compile(),
    `function two(){
return two
}`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined})

  // Should be able to redeclare function name in parameters.
  t.is(
    p.func.call(ctx, sym(`three`), [sym(`three`)], sym(`three`)).compile(),
    `function three(three){
return three
}`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined, three: undefined})

  // Should be able to redeclare function name in function body.
t.is(
  p.func.call(ctx, sym(`four`), [], [p.const, sym(`four`), 10], []).compile(),
  `function four(){
const four = 10;
return
}`)
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined, three: undefined, four: undefined})

  // Function parameters and body should have the same scope.
  ti.fail(
    () => p.func.call(ctx, sym(`five`), [sym(`five`)], [p.const, sym(`five`), 10], []),
    `redundant declaration of "five"`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined, three: undefined, four: undefined, five: undefined})

  t.is(
    p.func.call(ctx, sym(`six`), [], ti.macReqStatementOne, ti.macReqStatementTwo, ti.macReqExpressionThree).compile(),
    `function six(){
"one";
"two";
return "three"
}`
  )
  t.own(ctx, {[c.symStatement]: undefined, one: undefined, two: undefined, three: undefined, four: undefined, five: undefined, six: undefined})
})

t.test(function test_func_export() {
  let ctx = c.ctxWithModule(null)

  t.is(
    p.func.call(ctx, sym(`one`), []).compile(),
    `export function one(){}`,
  )
  t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, one: undefined})

  ctx = c.ctxWithStatement(ctx)

  t.is(
    p.func.call(ctx, sym(`one`), []).compile(),
    `function one(){}`,
  )
  t.own(ctx, {[c.symStatement]: undefined, one: undefined})
})

t.test(function test_func_mixin() {
  function test(ctx) {
    t.is(
      p.func.call(ctx, sym(`one`), [], function mac() {ctx = this}, []).compile(),
      `function one(){
undefined;
return
}`)
    return ctx
  }

  // In expression mode, the declaration is made in the mixin scope.
  t.eq(ti.objFlat(test(null)), [
    {[c.symStatement]: undefined},
    {[c.symMixin]: undefined, ...m.funcMixin, one: undefined},
  ])

  // In statement mode, the declaration is made in the outer scope.
  t.eq(ti.objFlat(test(c.ctxWithStatement(null))), [
    {[c.symStatement]: undefined},
    {[c.symMixin]: undefined, ...m.funcMixin},
    {[c.symStatement]: undefined, one: undefined},
  ])

  {
    const ctx = Object.create(null)
    ctx.ret = 10

    t.eq(ti.objFlat(test(ctx)), [
      {[c.symStatement]: undefined},
      {[c.symMixin]: undefined, arguments: undefined, this: undefined, one: undefined},
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
      {[c.symMixin]: undefined, one: undefined},
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
      {[c.symMixin]: undefined, one: undefined},
      {ret: 10, arguments: 20, this: 30, one: 40},
    ])
  }

  {
    let ctx = null
    t.is(
      p.func.call(ctx, sym(`ret`), [], function mac() {ctx = this}, []).compile(),
      `function ret(){
undefined;
return
}`)

    t.eq(ti.objFlat(ctx), [
      {[c.symStatement]: undefined},
      // Function name takes priority over mixin properties.
      {[c.symMixin]: undefined, arguments: undefined, this: undefined, ret: undefined},
    ])
  }
})

t.test(function test_class_invalid() {
  ti.fail(() => p.class.call(null),                 `expected at least 1 inputs, got 0 inputs`)
  ti.fail(() => p.class.call(null, 10),             `expected variant of isSym, got 10`)
  ti.fail(() => p.class.call(null, sym(`one.two`)), `"one.two" does not represent a valid JS identifier`)
  ti.fail(() => p.class.call(null, sym(`!@#`)),     `"!@#" does not represent a valid JS identifier`)
  ti.fail(() => p.class.call(null, sym(`await`)),   `"await" is a keyword in JS; attempting to use it as a regular identifier would generate invalid JS with a syntax error; please rename`)
  ti.fail(() => p.class.call(null, sym(`eval`)),    `"eval" is a reserved name in JS; attempting to redeclare it would generate invalid JS with a syntax error; please rename`)
})

t.test(function test_class_declaration_and_export() {
  function run(ctx) {
    return [
      p.class.call(ctx, sym(`one`), function mac() {ctx = this; return []}),
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
      {[c.symMixin]: undefined, ...m.classMixin, one: undefined},
      ctx,
    ])
  }

  {
    const ctx = c.ctxWithStatement(null)
    const [out, sub] = run(ctx)

    t.is(out.compile(), `class one {}`)

    // In statement mode, the declaration is made in the outer scope.
    t.own(ctx, {[c.symStatement]: undefined, one: undefined})

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

    t.own(ctx, {[c.symModule]: undefined, [c.symStatement]: undefined, one: undefined})

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
    () => m.meth.call(null, sym(`one`)),
    `expected variant of isArr, got undefined`,
  )

  ti.fail(
    () => m.meth.call(null, sym(`one`), [10]),
    `expected variant of isSym, got 10`,
  )

  {
    const ctx = Object.create(null)
    t.is(m.meth.call(ctx, sym(`one`), []).compile(), `one(){}`)
    t.own(ctx, {})
  }

  {
    const ctx = c.ctxWithStatement(null)
    t.is(m.meth.call(ctx, sym(`one`), []).compile(), `one(){}`)
    t.own(ctx, {[c.symStatement]: undefined})
  }

  /*
  Unlike function names, method names may be keywords or reserved names.
  They can also be strings. However, they must be otherwise valid identifiers.
  */
  {
    ti.fail(() => m.meth.call(null, sym(`one.two`)), `"one.two" does not represent a valid JS identifier`)
    ti.fail(() => m.meth.call(null, sym(`!@#`)),     `"!@#" does not represent a valid JS identifier`)

    function name(src, exp) {
      t.is(
        m.meth.call(null, src, []).compile(),
        exp,
      )
    }

    name(sym(`await`), `await(){}`)
    name(sym(`eval`),  `eval(){}`)
    name(``,           `""(){}`)
    name(`one`,        `"one"(){}`)
  }

  t.is(
    m.meth.call(null, sym(`one`), [], 10).compile(),
    `one(){
return 10
}`)

  t.is(
    m.meth.call(null, sym(`one`), [], 10, 20).compile(),
    `one(){
10;
return 20
}`)

  t.is(
    m.meth.call(null, sym(`one`), [], 10, 20, 30).compile(),
    `one(){
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
        function mac() {
          ti.macReqExpression.call(this)
          ctx = this
          return 10
        },
      ).compile(),
      `one(two, three){
"one";
"two";
return 10
}`)

    t.eq(ti.objFlat(ctx), [
      {},
      {[c.symStatement]: undefined, two: undefined, three: undefined},
      {[c.symMixin]: undefined, ...m.funcMixin, ...m.methMixin},
    ])
  }
})

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

    t.own(ctx, {[c.symStatement]: undefined, one: undefined})
  }
})

t.test(function test_static() {
  const ctx = Object.create(null)
  ctx[m.symClass] = undefined
  testBlockStatement(ctx, m.$static, compileStatic)
})

function compileStatic(val) {return `static ` + val}

// The implementation reuses `meth` which is tested earlier.
t.test(function test_static_meth() {
  t.is(
    m.$static.meth.call(null, sym(`one`), []).compile(),
    `static one(){}`,
  )
})

// The implementation reuses `field` which is tested earlier.
t.test(function test_static_field() {
  t.is(
    m.$static.field.call(null, sym(`one`), 10).compile(),
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
two(three){
30;
return 40
};
four = 50;
static {
60;
70
};
static five(six){
return 80
};
static seven = 90
}`)

  t.own(ctx, {[c.symStatement]: undefined, one: undefined})
})

t.test(function test_throw() {
  ti.fail(
    () => p.throw.call(null),
    `expected 1 inputs, got 0 inputs`,
  )

  ti.fail(
    () => p.throw.call(null, 10),
    `expected statement context, got expression context`,
  )

  const ctx = c.ctxWithStatement(null)
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
    `Class constructor SomeNode cannot be invoked without 'new'`,
  )

  ti.fail(
    () => p.new.call(ctx, [], sym(`one`)),
    `unexpected reference "one" to value [function SomeNode]`,
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
}

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
t.test(function test_instof() {testBinary(p.instof, `instanceof`)})

function testBinary(fun, inf) {
  function test(ctx) {
    ti.fail(() => fun.call(ctx),         `expected 2 inputs, got 0 inputs`)

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

t.test(function test_in() {testBinary(p.in, `in`)})

t.test(function test_isNil() {testUnary(p.isNil, `null ==`)})
t.test(function test_isSome() {testUnary(p.isSome, `null !=`)})

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
      `dict keys must be identifiers, strings, or numbers; got undefined`,
    )

    ti.fail(
      () => p.dict.call(ctx, [], 10),
      `dict keys must be identifiers, strings, or numbers; got []`,
    )

    ti.fail(
      () => p.dict.call(ctx, NaN, 10),
      `dict keys must be identifiers, strings, or numbers; got NaN`,
    )

    ti.fail(
      () => p.dict.call(ctx, Infinity, 10),
      `dict keys must be identifiers, strings, or numbers; got Infinity`,
    )

    ti.fail(
      () => p.dict.call(ctx, -Infinity, 10),
      `dict keys must be identifiers, strings, or numbers; got -Infinity`,
    )
  }

  fail(expr)
  fail(stat)

  t.is(p.dict.call(expr).compile(), `{}`)
  t.is(p.dict.call(stat).compile(), `({})`)

  t.is(p.dict.call(expr, -0, -0).compile(), `{"0": -0}`)
  t.is(p.dict.call(stat, -0, -0).compile(), `({"0": -0})`)

  t.is(p.dict.call(expr, 10, 20).compile(), `{"10": 20}`)
  t.is(p.dict.call(stat, 10, 20).compile(), `({"10": 20})`)

  t.is(p.dict.call(expr, 10, 20, 30, 40).compile(), `{"10": 20, "30": 40}`)
  t.is(p.dict.call(stat, 10, 20, 30, 40).compile(), `({"10": 20, "30": 40})`)

  t.is(p.dict.call(expr, 10, []).compile(), `{"10": undefined}`)
  t.is(p.dict.call(stat, 10, []).compile(), `({"10": undefined})`)

  t.is(p.dict.call(expr, 10, [], 20, 30).compile(), `{"10": undefined, "20": 30}`)
  t.is(p.dict.call(stat, 10, [], 20, 30).compile(), `({"10": undefined, "20": 30})`)

  t.is(p.dict.call(expr, 10, [], 20, 30, 40, [[]]).compile(), `{"10": undefined, "20": 30, "40": undefined}`)
  t.is(p.dict.call(stat, 10, [], 20, 30, 40, [[]]).compile(), `({"10": undefined, "20": 30, "40": undefined})`)

  t.is(p.dict.call(expr, 10n, 20n).compile(), `{"10": 20n}`)
  t.is(p.dict.call(stat, 10n, 20n).compile(), `({"10": 20n})`)

  t.is(p.dict.call(expr, 10n, 20n, 30n, 40n).compile(), `{"10": 20n, "30": 40n}`)
  t.is(p.dict.call(stat, 10n, 20n, 30n, 40n).compile(), `({"10": 20n, "30": 40n})`)

  t.is(p.dict.call(expr, `one`, `two`).compile(), `{"one": "two"}`)
  t.is(p.dict.call(stat, `one`, `two`).compile(), `({"one": "two"})`)

  t.is(p.dict.call(expr, `one`, `two`, `three`, `four`).compile(), `{"one": "two", "three": "four"}`)
  t.is(p.dict.call(stat, `one`, `two`, `three`, `four`).compile(), `({"one": "two", "three": "four"})`)

  t.is(p.dict.call(expr, `one`, 10, `two`, 20).compile(), `{"one": 10, "two": 20}`)
  t.is(p.dict.call(stat, `one`, 10, `two`, 20).compile(), `({"one": 10, "two": 20})`)

  t.is(p.dict.call(expr, sym(`one`), `two`, sym(`three`), `four`).compile(), `{one: "two", three: "four"}`)
  t.is(p.dict.call(stat, sym(`one`), `two`, sym(`three`), `four`).compile(), `({one: "two", three: "four"})`)

  t.is(p.dict.call(expr, sym(`one`), 10, sym(`two`), 20).compile(), `{one: 10, two: 20}`)
  t.is(p.dict.call(stat, sym(`one`), 10, sym(`two`), 20).compile(), `({one: 10, two: 20})`)

  t.is(p.dict.call(expr, sym(`one.two`), 10).compile(), `{"one.two": 10}`)
  t.is(p.dict.call(stat, sym(`one.two`), 10).compile(), `({"one.two": 10})`)

  t.is(p.dict.call(expr, sym(`!@#`), 10).compile(), `{"!@#": 10}`)
  t.is(p.dict.call(stat, sym(`!@#`), 10).compile(), `({"!@#": 10})`)

  t.is(
    p.dict.call(expr, 10, ti.macReqExpressionOne).compile(),
    `{"10": "one"}`,
  )

  t.is(
    p.dict.call(stat, 10, ti.macReqExpressionOne).compile(),
    `({"10": "one"})`,
  )

  t.is(
    p.dict.call(expr, 10, ti.macReqExpressionOne, 20, ti.macReqExpressionTwo).compile(),
    `{"10": "one", "20": "two"}`,
  )

  t.is(
    p.dict.call(stat, 10, ti.macReqExpressionOne, 20, ti.macReqExpressionTwo).compile(),
    `({"10": "one", "20": "two"})`,
  )
})

/*
t.test(function test_dict1() {
  function fail(ctx) {
    ti.fail(
      () => m.dict1.call(ctx, 10),
      `expected an even number of inputs, got 1 inputs`,
    )

    ti.fail(
      () => m.dict1.call(ctx, []),
      `expected an even number of inputs, got 1 inputs`,
    )

    ti.fail(
      () => m.dict1.call(ctx, 10, 20, 30),
      `expected an even number of inputs, got 3 inputs`,
    )

    ti.fail(
      () => m.dict1.call(ctx, 10, [], 30),
      `expected an even number of inputs, got 3 inputs`,
    )

    ti.fail(
      () => m.dict1.call(ctx, undefined, 10),
      `dict keys must be identifiers, strings, or numbers; got undefined`,
    )

    ti.fail(
      () => m.dict1.call(ctx, [], 10),
      `dict keys must be identifiers, strings, or numbers; got []`,
    )

    ti.fail(
      () => m.dict1.call(ctx, NaN, 10),
      `dict keys must be identifiers, strings, or numbers; got NaN`,
    )

    ti.fail(
      () => m.dict1.call(ctx, Infinity, 10),
      `dict keys must be identifiers, strings, or numbers; got Infinity`,
    )

    ti.fail(
      () => m.dict1.call(ctx, -Infinity, 10),
      `dict keys must be identifiers, strings, or numbers; got -Infinity`,
    )

    ti.fail(
      () => m.dict1.call(ctx, sym(`one.two`), 10),
      `dict keys must be identifiers, strings, or numbers; got one.two`,
    )

    ti.fail(
      () => m.dict1.call(ctx, sym(`!@#`), 10),
      `dict keys must be identifiers, strings, or numbers; got !@#`,
    )
  }

  fail(null)
  fail(c.ctxWithStatement(null))

  function test(ctx) {
    t.eq(m.dict1.call(ctx), {})
    t.eq(m.dict1.call(ctx, -0, -0), {0: -0})
    t.eq(m.dict1.call(ctx, 10, 20), {10: 20})
    t.eq(m.dict1.call(ctx, 10, 20, 30, 40), {10: 20, 30: 40})
    t.eq(m.dict1.call(ctx, 10, []), {10: []})
    t.eq(m.dict1.call(ctx, 10, [], 20, 30), {10: [], 20: 30})
    t.eq(m.dict1.call(ctx, 10, [], 20, 30, 40, [[]]), {10: [], 20: 30, 40: [[]]})
    t.eq(m.dict1.call(ctx, 10n, 20n), {10: 20n})
    t.eq(m.dict1.call(ctx, 10n, 20n, 30n, 40n), {10: 20n, 30: 40n})
    t.eq(m.dict1.call(ctx, `one`, `two`), {one: `two`})
    t.eq(m.dict1.call(ctx, `one`, `two`, `three`, `four`), {one: `two`, three: `four`})
    t.eq(m.dict1.call(ctx, `one`, 10, `two`, 20), {one: 10, two: 20})
    t.eq(m.dict1.call(ctx, sym(`one`), `two`, sym(`three`), `four`), {one: `two`, three: `four`})
    t.eq(m.dict1.call(ctx, sym(`one`), 10, sym(`two`), 20), {one: 10, two: 20})
  }

  test(null)
  test(c.ctxWithStatement(null))
})
*/

t.bench(function bench_dict_compile_core() {
  c.compileDict({one: 10, two: 20, three: 30, four: 40})
})

t.bench(function bench_dict_compile_macro() {
  p.dict.call(null, `one`, 10, `two`, 20, `three`, 30, `four`, 40).compile()
})

/*
t.bench(function bench_dict_compile_macro_1() {
  c.compileDict(m.dict1.call(null, `one`, 10, `two`, 20, `three`, 30, `four`, 40))
})
*/

t.test(function test_get() {
  function test(ctx) {
    t.is(p.get.call(ctx), undefined)
    t.is(p.get.call(ctx, []), undefined)
    t.is(p.get.call(ctx, [], [[]]), undefined)

    t.is(p.get.call(ctx, 10).compile(), `10`)
    t.is(p.get.call(ctx, 10, 20).compile(), `10?.[20]`)
    t.is(p.get.call(ctx, 10, 20, 30).compile(), `10?.[20]?.[30]`)

    t.is(
      p.get.call(ctx, [], 10, [[]], 20, [[[]]], 30).compile(),
      `10?.[20]?.[30]`,
    )

    t.is(
      p.get.call(ctx, ti.macReqExpressionOne, ti.macReqExpressionTwo, ti.macReqExpressionThree).compile(),
      `"one"?.["two"]?.["three"]`,
    )
  }

  test(null)
  test(c.ctxWithStatement(null))
})

t.test(function test_set() {
  function fail(ctx) {
    ti.fail(() => p.set.call(ctx), `expected 3 inputs, got 0 inputs`)
    ti.fail(() => p.set.call(ctx, 10, [], 20), `unexpected empty key`)

    ti.fail(
      () => p.set.call(ctx, sym(`one`), 10, 20),
      `missing declaration of "one"`,
    )

    ti.fail(
      () => p.set.call(ctx, sym(`one.two`), 10, 20),
      `missing declaration of "one"`,
    )

    ti.fail(
      () => p.set.call(ctx, 10, sym(`one`), 20),
      `missing declaration of "one"`,
    )

    ti.fail(
      () => p.set.call(ctx, 10, sym(`one.two`), 20),
      `missing declaration of "one"`,
    )

    ti.fail(
      () => p.set.call(ctx, 10, 20, sym(`one`)),
      `missing declaration of "one"`,
    )

    ti.fail(
      () => p.set.call(ctx, 10, 20, sym(`one.two`)),
      `missing declaration of "one"`,
    )
  }

  fail(null)
  fail(c.ctxWithStatement(null))

  let expr = null
  let stat = c.ctxWithStatement(null)

  t.is(
    p.set.call(expr, [], undefined, []).compile(),
    `([undefined] = undefined)`,
  )

  t.is(
    p.set.call(stat, [], undefined, []).compile(),
    `[undefined] = undefined`,
  )

  t.is(
    p.set.call(expr, undefined, undefined, undefined).compile(),
    `(undefined[undefined] = undefined)`,
  )

  t.is(
    p.set.call(stat, undefined, undefined, undefined).compile(),
    `undefined[undefined] = undefined`,
  )

  t.is(
    p.set.call(expr, null, null, null).compile(),
    `(null[null] = null)`,
  )

  t.is(
    p.set.call(stat, null, null, null).compile(),
    `null[null] = null`,
  )

  t.is(
    p.set.call(expr, [], 10, []).compile(),
    `([10] = undefined)`,
  )

  t.is(
    p.set.call(stat, [], 10, []).compile(),
    `[10] = undefined`,
  )

  t.is(
    p.set.call(expr, 10, 20, 30).compile(),
    `(10[20] = 30)`,
  )

  t.is(
    p.set.call(stat, 10, 20, 30).compile(),
    `10[20] = 30`,
  )

  t.is(
    p.set.call(expr, ti.macReqExpressionOne, ti.macReqExpressionTwo, ti.macReqExpressionThree).compile(),
    `("one"["two"] = "three")`,
  )

  t.is(
    p.set.call(stat, ti.macReqExpressionOne, ti.macReqExpressionTwo, ti.macReqExpressionThree).compile(),
    `"one"["two"] = "three"`,
  )

  expr = Object.create(null)
  expr.one = undefined
  stat = c.ctxWithStatement(expr)

  t.is(
    p.set.call(expr, sym(`one.two`), sym(`one.three`), sym(`one.four`)).compile(),
    `(one.two[one.three] = one.four)`,
  )

  t.is(
    p.set.call(stat, sym(`one.two`), sym(`one.three`), sym(`one.four`)).compile(),
    `one.two[one.three] = one.four`,
  )
})

t.test(function test_assign() {
  function fail(ctx) {
    ti.fail(() => p.assign.call(ctx),                     `expected 2 inputs, got 0 inputs`)
    ti.fail(() => p.assign.call(ctx, 10, 20),             `expected variant of isSym, got 10`)
    ti.fail(() => p.assign.call(ctx, sym(`one`), 10),     `missing declaration of "one"`)
    ti.fail(() => p.assign.call(ctx, sym(`one.two`), 10), `missing declaration of "one"`)
  }

  const ctx = Object.create(null)
  fail(null)
  fail(ctx)

  ctx.one = undefined

  t.is(
    p.assign.call(ctx, sym(`one`), []).compile(),
    `(one = undefined)`,
  )

  t.is(
    p.assign.call(c.ctxWithStatement(ctx), sym(`one`), []).compile(),
    `one = undefined`,
  )

  t.is(
    p.assign.call(ctx, sym(`one`), 10).compile(),
    `(one = 10)`,
  )

  t.is(
    p.assign.call(c.ctxWithStatement(ctx), sym(`one`), 10).compile(),
    `one = 10`,
  )

  t.is(
    p.assign.call(ctx, sym(`one`), ti.macReqExpression).compile(),
    `(one = "expression_value")`,
  )

  t.is(
    p.assign.call(c.ctxWithStatement(ctx), sym(`one`), ti.macReqExpression).compile(),
    `one = "expression_value"`,
  )

  t.is(
    p.assign.call(ctx, sym(`one.two`), 10).compile(),
    `(one.two = 10)`,
  )

  t.is(
    p.assign.call(c.ctxWithStatement(ctx), sym(`one.two`), 10).compile(),
    `one.two = 10`,
  )

  ti.fail(() => p.assign.call(ctx, sym(`await`), 10), `missing declaration of "await"`)
  ctx.await = undefined
  // Invalid syntax in most JS contexts. Maybe we should detect and throw.
  t.is(p.assign.call(ctx, sym(`await`), 10).compile(), `(await = 10)`)

  ti.fail(() => p.assign.call(ctx, sym(`eval`), 10), `missing declaration of "eval"`)
  ctx.eval = undefined
  // Invalid syntax in most JS contexts. Maybe we should detect and throw.
  t.is(p.assign.call(ctx, sym(`eval`), 10).compile(), `(eval = 10)`)

  ti.fail(() => p.assign.call(ctx, sym(`!@#`), 10), `missing declaration of "!@#"`)
  ctx[`!@#`] = undefined
  // Invalid syntax in ALL JS contexts. Maybe we should detect and throw.
  t.is(p.assign.call(ctx, sym(`!@#`), 10).compile(), `(!@# = 10)`)
})

t.test(function test_and()      {testVariadic(p.and,      ``, ` && `, ``)})
t.test(function test_or()       {testVariadic(p.or,       ``, ` || `, ``)})
t.test(function test_coalesce() {testVariadic(p.coalesce, ``, ` ?? `, ``)})

function testVariadic(fun, pre, inf, suf) {
  c.reqFun(fun)
  c.reqStr(pre)
  c.reqStr(inf)
  c.reqStr(suf)

  function test(ctx) {
    t.is(fun.call(ctx), undefined)
    t.is(fun.call(ctx, []), undefined)
    t.is(fun.call(ctx, [], [[]]), undefined)

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

t.test(function test_not() {testUnary(p.not,    `!`)})
t.test(function test_yes() {testUnary(p.yes, `!!`)})

t.test(function test_eq()  {testBinary(p.eq,  `===`)})
t.test(function test_neq() {testBinary(p.neq, `!==`)})
t.test(function test_gt()  {testBinary(p.gt,  `>`)})
t.test(function test_lt()  {testBinary(p.lt,  `<`)})
t.test(function test_gte() {testBinary(p.gte, `>=`)})
t.test(function test_lte() {testBinary(p.lte, `<=`)})

t.test(function test_add()                   {testVariadic(p.add,                   `+ `,   ` + `,   ``)})
t.test(function test_subtract()              {testVariadic(p.subtract,              `- `,   ` - `,   ``)})
t.test(function test_divide()                {testVariadic(p.divide,                ``,     ` / `,   ``)})
t.test(function test_multiply()              {testVariadic(p.multiply,              `1 * `, ` * `,   ``)})
t.test(function test_exponentiate()          {testVariadic(p.exponentiate,          ``,     ` ** `,  ` ** 1`)})
t.test(function test_remainder()             {testVariadic(p.remainder,             ``,     ` % `,   ``)})
t.test(function test_bitAnd()                {testVariadic(p.bitAnd,                ``,     ` & `,   ` & 0`)})
t.test(function test_bitOr()                 {testVariadic(p.bitOr,                 ``,     ` | `,   ` | 0`)})
t.test(function test_bitXor()                {testVariadic(p.bitXor,                ``,     ` ^ `,   ` ^ 0`)})
t.test(function test_bitShiftLeft()          {testVariadic(p.bitShiftLeft,          ``,     ` << `,  ` << 0`)})
t.test(function test_bitShiftRight()         {testVariadic(p.bitShiftRight,         ``,     ` >> `,  ` >> 0`)})
t.test(function test_bitShiftRightUnsigned() {testVariadic(p.bitShiftRightUnsigned, ``,     ` >>> `, ` >>> 0`)})

if (import.meta.main) ti.flush()

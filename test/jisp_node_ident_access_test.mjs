import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'
import * as je from '../js/jisp_err.mjs'
import * as jnia from '../js/jisp_node_ident_access.mjs'
import * as jniu from '../js/jisp_node_ident_unqual.mjs'
import * as jnbrk from '../js/jisp_node_brackets.mjs'

t.test(function test_IdentAccess_parse_invalid() {
  function test(src) {tu.testParseFail(jnia.IdentAccess, src)}

  test(``)
  test(` `)
  test(`12`)
  test(`12a`)
  test(`12ab`)
  test(`12abc`)
  test(`12n`)

  test(`_`)
  test(`$`)
  test(`a`)
  test(`ab`)
  test(`abc`)
  test(`_abc`)
  test(`$abc`)
  test(`_12`)
  test(`$12`)
  test(`a12`)
  test(`abc12`)
})

t.test(function test_IdentAccess_parse_complete() {
  function test(src, exp) {
    t.is(tu.testParseComplete(jnia.IdentAccess, src).reqName(), exp)
  }

  test(`._`,     `_`)
  test(`.$`,     `$`)
  test(`.a`,     `a`)
  test(`.ab`,    `ab`)
  test(`.abc`,   `abc`)
  test(`._abc`,  `_abc`)
  test(`.$abc`,  `$abc`)
  test(`._12`,   `_12`)
  test(`.$12`,   `$12`)
  test(`.a12`,   `a12`)
  test(`.abc12`, `abc12`)
})

t.test(function test_IdentAccess_parse_partial() {
  const cls = jnia.IdentAccess

  tu.testParsePartial({cls, src: `.one[`,          dec: `.one`, rem: `[`})
  tu.testParsePartial({cls, src: `.one]`,          dec: `.one`, rem: `]`})
  tu.testParsePartial({cls, src: `.one"two"`,      dec: `.one`, rem: `"two"`})
  tu.testParsePartial({cls, src: `.one "two"`,     dec: `.one`, rem: ` "two"`})
  tu.testParsePartial({cls, src: `.one 10`,        dec: `.one`, rem: ` 10`})
  tu.testParsePartial({cls, src: `.one two`,       dec: `.one`, rem: ` two`})
  tu.testParsePartial({cls, src: `.one.two`,       dec: `.one`, rem: `.two`})
  tu.testParsePartial({cls, src: `.one.two.three`, dec: `.one`, rem: `.two.three`})
})

t.test(function test_IdentAccess_child_node_and_source_node() {
  const expr = new jniu.IdentUnqual().initSpanWith(`one`)

  t.is(expr.decompile(), `one`)
  t.is(expr.reqName(), `one`)

  const access = new jnia.IdentAccess().initSpanWith(`.two`)

  t.is(access.reqName(), `two`)
  t.is(access.decompile(), `.two`)

  t.throws(() => access.compile(), Error, `missing first child in parent [object IdentAccess]

:1:1

.two`)

  access.setChild(expr)

  // Child node's behavior should be unaffected by this relation.
  t.is(expr.decompile(), `one`)
  t.is(expr.reqName(), `one`)
  t.is(expr.compile(), `one`)

  /*
  Child node must be used in compilation and decompilation, but must not affect
  the name of the `IdentAccess`.
  */
  t.is(access.reqName(), `two`)
  t.is(access.decompile(), `one.two`)
  t.is(access.compile(), `one.two`)

  const other = new jnbrk.Brackets().initSpanWith(`[otherIdent "some_input"]`)
  t.is(other.decompile(), `[otherIdent "some_input"]`)

  // See comments in `test_IdentUnqual_from_source_node` for explanations.
  access.setSrcNode(other)

  // Own span takes priority for name.
  t.is(access.reqName(), `two`)

  // Source node takes priority for decompilation.
  t.is(access.decompile(), `[otherIdent "some_input"]`)

  // Source node does not affect compilation.
  t.is(access.compile(), `one.two`)
})

await t.test(async function test_IdentAccess_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
    `.someIdent`,
    `unable to find ancestral live value with property "someIdent" at descendant [object IdentAccess]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
    `[.someIdent]`,
    `unable to find ancestral live value with property "someIdent" at descendant [object IdentAccess]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
    `[.someIdent 10]`,
    `unable to find ancestral live value with property "someIdent" at descendant [object IdentAccess]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
    `[.someIdent 10 20]`,
    `unable to find ancestral live value with property "someIdent" at descendant [object IdentAccess]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" jp]

jp.someName
`,
    `missing property "someName" in live value`,
  )
})

if (import.meta.main) ti.flush()

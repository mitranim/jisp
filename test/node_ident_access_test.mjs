import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './root_test.mjs'
import * as je from '../js/err.mjs'
import * as jnia from '../js/node_ident_access.mjs'
import * as jniu from '../js/node_ident_unqual.mjs'
import * as jnbrk from '../js/node_brackets.mjs'

t.test(function test_IdentAccess_parse_invalid() {
  function test(src) {tu.testParseNone(jnia.IdentAccess, src)}

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

// See `test_IdentUnqual_from_source_node` for explanations.
t.test(function test_IdentAccess_child_node_and_source_node() {
  const expr = new jniu.IdentUnqual()
    .setName(`name_one`)
    .initSpanWith(`source_code_one`)

  t.is(expr.reqName(), `name_one`)
  t.is(expr.decompile(), `source_code_one`)
  t.is(expr.compile(), `name_one`)

  const access = new jnia.IdentAccess()
    .setName(`name_two`)
    .initSpanWith(`.source_code_two`)

  t.is(access.reqName(), `name_two`)
  t.is(access.decompile(), `.source_code_two`)

  t.throws(() => access.compile(), Error, `missing first child in parent [object IdentAccess]

:1:1

.source_code_two`)

  access.setChild(expr)

  // Child node's behavior should be unaffected by this relation.
  t.is(expr.reqName(), `name_one`)
  t.is(expr.decompile(), `source_code_one`)
  t.is(expr.compile(), `name_one`)

  // Child node has no effect on other properties of `IdentAccess`.
  t.is(access.reqName(), `name_two`)
  t.is(access.decompile(), `.source_code_two`)
  t.is(access.compile(), `name_one.name_two`)

  /*
  This emulates how an ident's span may be replaced with a completely unrelated
  span during macroing.
  */
  access.initSpanWith(`unrelated_source_code`)

  // Source does not affect name.
  t.is(access.reqName(), `name_two`)

  // Source takes priority for decompilation.
  t.is(access.decompile(), `unrelated_source_code`)

  // Source does not affect compilation.
  t.is(access.compile(), `name_one.name_two`)
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

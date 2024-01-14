import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'
import * as je from '../js/jisp_err.mjs'
import * as jniu from '../js/jisp_node_ident_unqual.mjs'
import * as jnbrk from '../js/jisp_node_brackets.mjs'

t.test(function test_IdentUnqual_isValid() {
  const cls = jniu.IdentUnqual

  t.no(cls.isValid(``))
  t.no(cls.isValid(` `))
  t.no(cls.isValid(`12`))
  t.no(cls.isValid(`12a`))
  t.no(cls.isValid(`12ab`))
  t.no(cls.isValid(`12abc`))
  t.no(cls.isValid(`12n`)) // JS bigint syntax.
  t.no(cls.isValid(`one.two`))

  t.ok(cls.isValid(`_`))
  t.ok(cls.isValid(`$`))
  t.ok(cls.isValid(`a`))
  t.ok(cls.isValid(`ab`))
  t.ok(cls.isValid(`abc`))
  t.ok(cls.isValid(`_abc`))
  t.ok(cls.isValid(`$abc`))
  t.ok(cls.isValid(`_12`))
  t.ok(cls.isValid(`$12`))
  t.ok(cls.isValid(`a12`))
  t.ok(cls.isValid(`abc12`))
})

t.test(function test_IdentUnqual_parse_invalid() {
  function test(src) {tu.testParseNone(jniu.IdentUnqual, src)}

  test(``)
  test(` `)
  test(`12`)
  test(`12a`)
  test(`12ab`)
  test(`12abc`)
  test(`12n`)
})

t.test(function test_IdentUnqual_parse_complete() {
  function test(src) {
    t.is(tu.testParseComplete(jniu.IdentUnqual, src).reqName(), src)
  }

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

t.test(function test_IdentUnqual_parse_partial() {
  const cls = jniu.IdentUnqual

  tu.testParsePartial({cls, src: `one[`,          dec: `one`, rem: `[`})
  tu.testParsePartial({cls, src: `one]`,          dec: `one`, rem: `]`})
  tu.testParsePartial({cls, src: `one"two"`,      dec: `one`, rem: `"two"`})
  tu.testParsePartial({cls, src: `one "two"`,     dec: `one`, rem: ` "two"`})
  tu.testParsePartial({cls, src: `one 10`,        dec: `one`, rem: ` 10`})
  tu.testParsePartial({cls, src: `one two`,       dec: `one`, rem: ` two`})
  tu.testParsePartial({cls, src: `one.two`,       dec: `one`, rem: `.two`})
  tu.testParsePartial({cls, src: `one.two.three`, dec: `one`, rem: `.two.three`})
})

await t.test(async function test_IdentUnqual_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
    `someIdent`,
    `unable to find declaration of "someIdent" at [object IdentUnqual]

:1:1

someIdent`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
    `[someIdent]`,
    `unable to find declaration of "someIdent" at [object IdentUnqual]

:1:2

someIdent]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
    `[someIdent 10]`,
    `unable to find declaration of "someIdent" at [object IdentUnqual]

:1:2

someIdent 10]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
    `[someIdent 10 20]`,
    `unable to find declaration of "someIdent" at [object IdentUnqual]

:1:2

someIdent 10 20]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
    `[10 someIdent 20]`,
    `unable to find declaration of "someIdent" at [object IdentUnqual]

:1:5

someIdent 20]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[10 someIdent 20]
`,
    `unable to find declaration of "someIdent" at [object IdentUnqual]

:4:5

someIdent 20]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" jp]

jp
`,
    `unexpected reference "jp" to live value`,
  )
})

await t.test(async function test_IdentUnqual_valid() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[const someConst 10]
someConst
`,
`
export const someConst = 10;
someConst;
`,
  )

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" jp]

[jp.const someConst 10]
someConst
`,
`
export const someConst = 10;
someConst;
`,
  )
})

/*
This test verifies that an ident's name and span are independent.

When we parse an ident from source code, we derive the ident's name from the
source code. However, we also construct idents programmatically without an
associated span.

When macroing replaces one node with another, we also copy the span from the
source node to the replacement node. This means that in the general case, for
any given node class, its span represents arbitrary source code that doesn't
necessarily match the node's type.
*/
t.test(function test_IdentUnqual_from_source_node() {
  const ident = new jniu.IdentUnqual()
    .setName(`some_name`)
    .initSpanWith(`some_source_code`)

  t.is(ident.reqName(), `some_name`)
  t.is(ident.decompile(), `some_source_code`)
  t.is(ident.compile(), `some_name`)

  /*
  This emulates how an ident's span may be replaced with a completely unrelated
  span during macroing.
  */
  ident.initSpanWith(`unrelated_source_code`)

  // Source does not affect name.
  t.is(ident.reqName(), `some_name`)

  // Source takes priority for decompilation.
  t.is(ident.decompile(), `unrelated_source_code`)

  // Source does not affect compilation.
  t.is(ident.compile(), `some_name`)
})

if (import.meta.main) ti.flush()

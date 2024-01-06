import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'
import * as je from '../js/jisp_err.mjs'
import * as jsp from '../js/jisp_span.mjs'
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
  function test(src) {tu.testParseFail(jniu.IdentUnqual, src)}

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
    `unable to find declaration of "someIdent" at [object IdentUnqual]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
    `[someIdent]`,
    `unable to find declaration of "someIdent" at [object IdentUnqual]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
    `[someIdent 10]`,
    `unable to find declaration of "someIdent" at [object IdentUnqual]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
    `[someIdent 10 20]`,
    `unable to find declaration of "someIdent" at [object IdentUnqual]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[someIdent 10 20]
`,
    `unable to find declaration of "someIdent" at [object IdentUnqual]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" jp]

jp
`,
    `unexpected non-call reference "jp" to live value`,
  )
})

await t.test(async function test_IdentUnqual_valid() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

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
[.use "jisp:prelude.mjs" jp]

[jp.const someConst 10]
someConst
`,
`
export const someConst = 10;
someConst;
`,
  )
})

t.test(function test_IdentUnqual_from_source_node() {
  const ident = new jniu.IdentUnqual()
    .setSpan(new jsp.StrSpan().init(`someIdent`))

  t.is(ident.decompile(), `someIdent`)
  t.is(ident.reqName(), `someIdent`)

  const other = new jnbrk.Brackets()
    .setSpan(new jsp.StrSpan().init(`[otherIdent "some_input"]`))

  t.is(other.decompile(), `[otherIdent "some_input"]`)

  /*
  This situation may occur when `otherIdent` refers to a macro, which, when
  executed, returns the ident node we're testing. The output of a macro is
  always linked into its new place in the AST by setting the node it's
  replacing as its "source node", and here we're verifying how some of the
  behaviors of `IdentUnqual` are affected by that.

  Macros may return anything, including new nodes or existing nodes found
  somewhere in the AST. There are no hard rules for what nodes they return.
  */
  ident.setSrcNode(other)

  // Other span takes priority for decompilation.
  t.is(ident.decompile(), `[otherIdent "some_input"]`)

  // Own span takes priority for name.
  t.is(ident.reqName(), `someIdent`)
})

if (import.meta.main) ti.flush()

/* eslint-disable no-unused-vars */

import * as ti from './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as c from '/Users/m/code/m/js/cli.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'
import * as j from '../js/jisp_2.mjs'

/* Util */

const inspectOpt = {
  depth: Infinity,
  colors: true,
  compact: true,
  trailingComma: true,
  showHidden: true,
  getters: true,
}

function prn(desc, val) {
  console.log(desc, Deno.inspect(val, inspectOpt))
}

const SRC_REL = `test_2_use.jisp`
const SRC_URL = new URL(SRC_REL, p.posix.dirLike(p.posix.dir(import.meta.url)))
const SRC = Deno.readTextFileSync(SRC_URL).trim()

/* Tests */

t.test(function test_parsing() {
  t.test(function test_Tokenizer() {
//     const src = `
// 10 20
// | comment
// "double quoted"
// \`grave quoted\`
// $long_Ident_$123
// one.two.three
// [({30})]
// `.trim()

    const src = SRC

    const tok = j.Tokenizer.fromStr(src)
    // prn(`tok:`, tok)
    // prn(`tokens:`, tok.toArray())

    t.test(function test_Lexer() {
      const lex = j.Lexer.fromStr(src)
      // prn(`lex:`, lex)
      // prn(`nodes:`, lex.toArray())
    })
  })
})

// Incomplete. TODO test termination.
t.test(function test_Num_parse() {
  t.is(
    testParseFull(j.Num, `-12_345.6_7_8`).ownVal(),
    -12_345.6_7_8,
  )
})

// t.test(function test_Path() {
//   t.test(function test_Path_parse() {
//     // TODO more cases.
//     testParsePath(`one.two`, [`one`, `two`])
//     testParsePath(`one.two.three`, [`one`, `two`, `three`])
//   })
// })

// function testParsePath(src, names) {
//   const cls = j.Path
//   const tar = testParseFull(cls, src)
//   t.eq(tar.getNodes().map(j.decompile), names)
// }

function testParseFull(cls, src) {
  const srcSpan = new j.StrSpan().init(src)
  t.is(srcSpan.ownPos(), 0)
  t.is(srcSpan.ownLen(), src.length)

  const node = cls.parse(srcSpan)
  t.is(node.reqSpan().decompile(), src)
  t.is(srcSpan.ownPos(), src.length)
  t.is(srcSpan.ownLen(), src.length)

  return node
}

t.test(function test_UnqualName() {
  const cls = j.UnqualName

  // TODO more cases.
  t.test(function test_parse() {
    testParseFull(cls, `one`)
  })

  t.test(function test_isValid() {
    t.ok(cls.isValid(`_`))
    t.ok(cls.isValid(`$`))
    t.ok(cls.isValid(`a`))
    t.ok(cls.isValid(`abc`))
    t.ok(cls.isValid(`_abc`))
    t.ok(cls.isValid(`$abc`))
    t.ok(cls.isValid(`_12`))
    t.ok(cls.isValid(`$12`))
    t.ok(cls.isValid(`a12`))
    t.ok(cls.isValid(`abc12`))

    t.no(cls.isValid(``))
    t.no(cls.isValid(`12`))
    t.no(cls.isValid(` `))
    t.no(cls.isValid(`one.two`))
  })
})

t.test(function test_ValNode() {
  function make(val) {return new j.ValNode().setVal(val)}
  function test(src, exp) {t.eq(make(src).compile(), exp)}

  test(undefined, `undefined`)
  test(null, `null`)
  test(false, `false`)
  test(true, `true`)
  test(10, `10`)
  test(20.30, `20.3`)
  test(`str`, `"str"`)
  test([], `[]`)
  test([undefined, null, true, 10.20, `str`], `[undefined, null, true, 10.2, "str"]`)
  test([[]], `[[]]`)
  test([[[]]], `[[[]]]`)
  test([{}], `[{}]`)
  test({}, `{}`)
  test({one: 10}, `{one: 10}`)
  test({one: 10, two: 20}, `{one: 10, two: 20}`)
  test({one: `two`}, `{one: "two"}`)
  test({one: `two`, three: `four`}, `{one: "two", three: "four"}`)
  test({12.34: 56}, `{12.34: 56}`)
  test({'one.two': `three.four`}, `{"one.two": "three.four"}`)
})

await t.test(async function test_Module() {
  const src = SRC
  const root = new j.Root().setFs(new j.DenoFs())

  // FIXME perhaps module requires path and registers in root immediately.
  // Allows self-import.
  const mod = new j.Module().setParent(root).fromStr(src).setUrl(SRC_URL.href)

  await mod.macro()
  console.log(mod.compile())
})

/* Main */

if (ti.cli.boolOpt(`bench`)) t.deopt(), t.benches()

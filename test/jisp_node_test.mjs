import * as ti from './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as tu from './test_util.mjs'
import * as jsp from '../js/jisp_span.mjs'
import * as jnv from '../js/jisp_node_val.mjs'
import * as jnnu from '../js/jisp_node_num.mjs'
import * as jnun from '../js/jisp_node_unqual_name.mjs'

/* FIXME split into smaller test files. */

// Incomplete. TODO test termination.
t.test(function test_Num_parse() {
  t.is(
    testParseFull(jnnu.Num, `-12_345.6_7_8`).ownVal(),
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
  const srcSpan = new jsp.StrSpan().init(src)
  t.is(srcSpan.ownPos(), 0)
  t.is(srcSpan.ownLen(), src.length)

  const node = cls.parse(srcSpan)
  t.is(node.reqSpan().decompile(), src)
  t.is(srcSpan.ownPos(), src.length)
  t.is(srcSpan.ownLen(), src.length)

  return node
}

t.test(function test_UnqualName() {
  const cls = jnun.UnqualName

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

t.test(function test_Val() {
  function make(val) {return new jnv.Val().setVal(val)}
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
  test({'-10': 20}, `{"-10": 20}`)
  test({'one.two': `three.four`}, `{"one.two": "three.four"}`)
})

if (import.meta.main) ti.flush()

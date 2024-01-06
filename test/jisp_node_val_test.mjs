import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jnv from '../js/jisp_node_val.mjs'

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

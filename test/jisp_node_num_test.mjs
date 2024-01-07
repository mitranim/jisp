import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jnnu from '../js/jisp_node_num.mjs'

// Incomplete. TODO more test cases, including partial parsing.
t.test(function test_Num_parse() {
  const cls = jnnu.Num

  t.is(tu.testParseComplete(cls, `0`).ownVal(), 0)
  t.is(tu.testParseComplete(cls, `-0`).ownVal(), -0)
  t.is(tu.testParseComplete(cls, `1`).ownVal(), 1)
  t.is(tu.testParseComplete(cls, `-1`).ownVal(), -1)
  t.is(tu.testParseComplete(cls, `12`).ownVal(), 12)
  t.is(tu.testParseComplete(cls, `-12`).ownVal(), -12)
  t.is(tu.testParseComplete(cls, `12_345`).ownVal(), 12_345)
  t.is(tu.testParseComplete(cls, `-12_345`).ownVal(), -12_345)
  t.is(tu.testParseComplete(cls, `0.6_7_8`).ownVal(), 0.6_7_8)
  t.is(tu.testParseComplete(cls, `-0.6_7_8`).ownVal(), -0.6_7_8)
  t.is(tu.testParseComplete(cls, `12_345.6_7_8`).ownVal(), 12_345.6_7_8)
  t.is(tu.testParseComplete(cls, `-12_345.6_7_8`).ownVal(), -12_345.6_7_8)
})

if (import.meta.main) ti.flush()

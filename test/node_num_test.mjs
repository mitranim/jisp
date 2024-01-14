import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jnnu from '../js/node_num.mjs'

// Incomplete. TODO more test cases, including partial parsing.
t.test(function test_Num_parse() {
  const cls = jnnu.Num

  t.is(tu.testParseComplete(cls, `0`).reqVal(), 0)
  t.is(tu.testParseComplete(cls, `-0`).reqVal(), -0)
  t.is(tu.testParseComplete(cls, `1`).reqVal(), 1)
  t.is(tu.testParseComplete(cls, `-1`).reqVal(), -1)
  t.is(tu.testParseComplete(cls, `12`).reqVal(), 12)
  t.is(tu.testParseComplete(cls, `-12`).reqVal(), -12)
  t.is(tu.testParseComplete(cls, `12_345`).reqVal(), 12_345)
  t.is(tu.testParseComplete(cls, `-12_345`).reqVal(), -12_345)
  t.is(tu.testParseComplete(cls, `0.6_7_8`).reqVal(), 0.6_7_8)
  t.is(tu.testParseComplete(cls, `-0.6_7_8`).reqVal(), -0.6_7_8)
  t.is(tu.testParseComplete(cls, `12_345.6_7_8`).reqVal(), 12_345.6_7_8)
  t.is(tu.testParseComplete(cls, `-12_345.6_7_8`).reqVal(), -12_345.6_7_8)
})

t.test(function test_Num_compile() {
  const cls = jnnu.Num

  {
    const node = new cls()
    t.throws(() => node.compile(), Error, `unable to compile [object Num]: missing string representation and missing numeric value`)
  }

  t.is(new cls().setVal(12.34)                   .compile(), `12.34`)
  t.is(new cls().setStrVal(`12.34`)              .compile(), `12.34`)
  t.is(new cls().setVal(12.34).setStrVal(`56.78`).compile(), `56.78`)
  t.is(new cls().setStrVal(`56.78`).setVal(12.34).compile(), `56.78`)
})

if (import.meta.main) ti.flush()

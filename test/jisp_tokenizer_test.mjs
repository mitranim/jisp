import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jt from '../js/jisp_tokenizer.mjs'

t.test(function test_Tokenizer() {
  function test(src) {
    const tokens = new jt.Tokenizer().init(src).toArray()
    // tu.prn(`tokens:`, tokens)
  }

  test(tu.SRC_TEXT_SHORT)
  test(tu.SRC_TEXT)
})

if (import.meta.main) ti.flush()

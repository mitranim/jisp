import * as ti from './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as tu from './test_util.mjs'
import * as jl from '../js/jisp_lexer.mjs'

t.test(function test_Lexer() {
  function test(src) {
    const nodes = jl.Lexer.nodesFromStr(src)
    // tu.prn(`nodes:`, nodes)
  }

  test(tu.SRC_TEXT_SHORT)
  test(tu.SRC_TEXT)
})

if (import.meta.main) ti.flush()

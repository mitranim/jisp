import {a} from '../js/dep.mjs'
import {t} from './test_dep.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jl from '../js/lexer.mjs'

t.test(function test_Lexer() {
  function test(src) {
    const nodes = new jl.Lexer().initFromStr(src).toArray()
    // tu.prn(`nodes:`, nodes)
  }

  test(tu.SRC_TEXT_SHORT)
})

if (import.meta.main) ti.flush()

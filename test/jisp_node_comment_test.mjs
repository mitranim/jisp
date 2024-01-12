import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jnco from '../js/jisp_node_comment.mjs'

t.test(function test_CommentFenced() {
  const cls = jnco.CommentFenced

  tu.testParseFail(cls, `;`)
  tu.testParseFail(cls, `;;`)
  tu.testParseFail(cls, `;; ;;;`)
  tu.testParseFail(cls, `;;; ;;`)

  t.is(tu.testParseComplete(cls, `;; ;;`).optBody(), ` `)
  t.is(tu.testParseComplete(cls, `;;; ;;;`).optBody(), ` `)
  t.is(tu.testParseComplete(cls, `;;;; ;;;;`).optBody(), ` `)

  t.is(tu.testParseComplete(cls, `;;_;;`).optBody(), `_`)
  t.is(tu.testParseComplete(cls, `;;;_;;;`).optBody(), `_`)
  t.is(tu.testParseComplete(cls, `;;;;_;;;;`).optBody(), `_`)

  t.is(tu.testParseComplete(cls, `;;
one
two three
four five six
;;`).optBody(), `
one
two three
four five six
`)

  t.is(tu.testParseComplete(cls, `;;
one
;;;
two three
;;;
four five six
;;`).optBody(), `
one
;;;
two three
;;;
four five six
`)

  t.is(tu.testParseComplete(cls, `;;;
one
;;
two three
;;
four five six
;;;`).optBody(), `
one
;;
two three
;;
four five six
`)

  t.is(
    tu.testParseComplete(cls, `;; some_text ;;`).compile(),
    `/* some_text */`,
  )

  t.is(
    tu.testParseComplete(cls, `;;
one
two
three
;;`).compile(),
    `/*
one
two
three
*/`,
  )

  t.is(
    tu.testParseComplete(cls, `;;
one
/* two */
three
;;`).compile(),
    `/*
one
/* two \\*/
three
*/`,
  )
})

if (import.meta.main) ti.flush()

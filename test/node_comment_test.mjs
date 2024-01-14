import {a} from '../js/dep.mjs'
import {t} from './test_dep.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jm from '../js/misc.mjs'
import * as jnco from '../js/node_comment.mjs'

t.test(function test_CommentFenced() {
  const cls = jnco.CommentFenced

  tu.testParseNone(cls, `;`)
  tu.testParseNone(cls, `;;`)
  tu.testParseThrows(cls, `;; ;;;`, jm.joinParagraphs(`unexpected ";"`, `:1:6`))
  tu.testParseNone(cls, `;;; ;;`)

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

  tu.testParseThrows(cls, `;;
one
;;;
two three
;;;
four five six
;;`, jm.joinParagraphs(`unexpected ";"`, `:3:3`))

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

import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'
import * as ts from './test_span.mjs'

function sym(val) {return Symbol.for(c.reqStr(val))}

t.test(function test_DelimReader() {
  // Used below to test parsing of larger text.
  const srcs = []
  const exps = []

  function fail(src, msg) {
    const read = new c.DelimReader(src)
    return ti.fail(() => [...read], msg)
  }

  function only(src, exp) {
    const read = new c.DelimReader(src)
    const val = read.read()

    t.eq(val, exp, `source: ` + src)
    t.is(read.read(), undefined, `must be empty after parsing source: ` + src)

    srcs.push(src)
    exps.push(exp)
  }

  fail(`;`, `unrecognized syntax`)
  fail(`; ;`, `unrecognized syntax`)
  fail(`;;`, `unrecognized syntax`)
  fail(`;; ;`, `unrecognized syntax`)
  fail(`;;;`, `unrecognized syntax`)
  fail(`;;; ;;`, `unrecognized syntax`)
  fail(`;; ;;;`, `unrecognized syntax`)

  fail(`;; ;;; 123`, `unrecognized syntax; expected whitespace, delimiter, or EOF

:1:6

…; 123`)

  fail(`;;; ;;;;;; 123`, `unrecognized syntax; expected whitespace, delimiter, or EOF

:1:8

…;;; 123`)

  fail(`123;`, `unrecognized syntax`)
  fail(`123;;`, `unrecognized syntax`)
  fail(`123;; ;;`, `unrecognized syntax`)

  fail(`123... 456`, `unrecognized syntax; expected whitespace, delimiter, or EOF

:1:4

…... 456`)

  fail(`}`, `unexpected "}"`)
  fail(`{`, `expected closing "}", found EOF`)
  fail(`{{}`, `expected closing "}", found EOF`)
  fail(`{}}`, `unexpected "}"`)
  only(`{}`, [])
  only(`{ }`, [])
  only(` { } `, [])
  only(`{{}}`, [[]])
  only(`{{ }}`, [[]])
  only(`{ {} }`, [[]])
  only(` { {} } `, [[]])
  only(` { { } } `, [[]])
  only(`{{{}}}`, [[[]]])
  only(`{{{ }}}`, [[[]]])
  only(`{{ { } }}`, [[[]]])
  only(` {{ { } }} `, [[[]]])
  only(` { { { } } } `, [[[]]])
  only(`{10}`, [10])
  only(`{10 {20}}`, [10, [20]])

  fail(`]`, `unexpected "]"`)
  fail(`[`, `expected closing "]", found EOF`)
  fail(`[[]`, `expected closing "]", found EOF`)
  fail(`[]]`, `unexpected "]"`)
  only(`[]`, [])
  only(`[[]]`, [[]])
  only(`[[[]]]`, [[[]]])
  only(`[10]`, [10])
  only(`[10 [20]]`, [10, [20]])

  fail(`)`, `unexpected ")"`)
  fail(`(`, `expected closing ")", found EOF`)
  fail(`(()`, `expected closing ")", found EOF`)
  fail(`())`, `unexpected ")"`)
  only(`()`, [])
  only(`(())`, [[]])
  only(`((()))`, [[[]]])
  only(`(10)`, [10])
  only(`(10 (20))`, [10, [20]])

  fail(`0na`, `unrecognized syntax`)
  fail(`-0na`, `unrecognized syntax`)
  only(`0n`, 0n)
  only(`0n`, -0n)
  only(`-0n`, 0n)
  only(`-0n`, -0n)

  fail(`1na`, `unrecognized syntax`)
  fail(`-1na`, `unrecognized syntax`)
  only(`1n`, 1n)
  only(`-1n`, -1n)

  fail(`12na`, `unrecognized syntax`)
  fail(`-12na`, `unrecognized syntax`)
  only(`12n`, 12n)
  only(`-12n`, -12n)

  fail(`0.`, `unrecognized syntax`)
  fail(`-0.`, `unrecognized syntax`)
  fail(`1.`, `unrecognized syntax`)
  fail(`-1.`, `unrecognized syntax`)
  fail(`12.`, `unrecognized syntax`)
  fail(`-12.`, `unrecognized syntax`)
  fail(`123.ident`, `unrecognized syntax`)
  fail(`-123.ident`, `unrecognized syntax`)

  fail(`123.456ident`, `unrecognized syntax; expected whitespace, delimiter, or EOF

:1:8

…ident`)

  fail(`-123.456ident`, `unrecognized syntax; expected whitespace, delimiter, or EOF

:1:9

…ident`)

  fail(`123-`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`123--`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`123+`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`123++`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`123+-`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`123-+`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`-123-`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`-123--`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`-123+`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`-123++`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`-123+-`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`-123-+`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)

  only(`0`, 0)
  only(`-0`, -0)
  only(`1`, 1)
  only(`-1`, -1)
  only(`12`, 12)
  only(`-12`, -12)
  only(`0.0`, 0)
  only(`-0.0`, -0)
  only(`0.1`, 0.1)
  only(`-0.1`, -0.1)
  only(`0.12`, 0.12)
  only(`-0.12`, -0.12)
  only(`12.34`, 12.34)
  only(`-12.34`, -12.34)

  fail("`",            `unrecognized syntax`)
  only("``",           ``)
  only("`text`",       `text`)
  fail("`text``",      `unrecognized syntax`)
  fail("`text```",     `unrecognized syntax`)
  fail("```",          `unrecognized syntax`)
  fail("````",         `unrecognized syntax`)
  fail("```text",      `unrecognized syntax`)
  fail("```text`",     `unrecognized syntax`)
  fail("```text``",    `unrecognized syntax`)
  only("```text```",   `text`)
  fail("```text````",  `unrecognized syntax`)
  fail("```text`````", `unrecognized syntax`)
  only("`\\n`",        `\\n`)

  fail(`"`,              `unrecognized syntax`)
  only(`""`,             ``)
  only(`"text"`,         `text`)
  fail(`"text""`,        `unrecognized syntax`)
  fail(`"text"""`,       `unrecognized syntax`)
  fail(`"""`,            `unrecognized syntax`)
  fail(`""""`,           `unrecognized syntax`)
  fail(`"""text`,        `unrecognized syntax`)
  fail(`"""text"`,       `unrecognized syntax`)
  fail(`"""text""`,      `unrecognized syntax`)
  only(`"""text"""`,     `text`)
  fail(`"""text""""`,    `unrecognized syntax`)
  fail(`"""text"""""`,   `unrecognized syntax`)

  only(`"\\n"`,                   `\n`)
  only(`"\\""`,                   `"`)
  only(`"\\/"`,                   `/`)
  only(`" \\/ "`,                 ` / `)
  only(`"\\b"`,                   `\b`)
  only(`" \\b "`,                 ` \b `)
  only(`""" " """`,               ` " `)
  only(`""" \\\\" """`,           ` \\" `)
  only(`""" "" """`,              ` "" `)
  only(`""" \\"\\" """`,          ` "" `)
  only(`""" \\"" """`,            ` "" `)
  only(`""" "\\" """`,            ` "" `)
  only(`""" \\\\ """`,            ` \\ `)
  only(`""" one \\\\ two """`,    ` one \\ two `)
  only(`""" \\" """`,             ` " `)
  only(`""" one \\" two """`,     ` one " two `)
  only(`""" \\n """`,             ` \n `)
  only(`""" one \\n two """`,     ` one \n two `)
  only(`""" \\r """`,             ` \r `)
  only(`""" one \\r two """`,     ` one \r two `)
  only(`""" \\t """`,             ` \t `)
  only(`""" one \\t two """`,     ` one \t two `)
  only(`""" \\u1234 """`,         ` \u1234 `)
  only(`""" one \\u1234 two """`, ` one \u1234 two `)

  fail(`"\\"`,         `Unterminated string in JSON at position 3`)
  fail(`"\\u"`,        `Bad Unicode escape in JSON at position 3`)
  fail(`"\\u1"`,       `Bad Unicode escape in JSON at position 4`)
  fail(`"\\u12"`,      `Bad Unicode escape in JSON at position 5`)
  fail(`"\\u123"`,     `Bad Unicode escape in JSON at position 6`)
  fail(`"\\u_1234"`,   `Bad Unicode escape in JSON at position 3`)
  fail(`" \\u_1234 "`, `Bad Unicode escape in JSON at position 4`)

  only(`.`, sym(`.`))
  only(`..`, sym(`..`))
  only(`...`, sym(`...`))
  only(`....`, sym(`....`))
  only(`.one`, sym(`.one`))
  only(`..one`, sym(`..one`))
  only(`one.`, sym(`one.`))
  only(`one..`, sym(`one..`))
  only(`one.two.`, sym(`one.two.`))
  only(`.one.two`, sym(`.one.two`))
  only(`.one.two.`, sym(`.one.two.`))

  only(`one`, sym(`one`))
  only(`one.two`, sym(`one.two`))
  only(`one.two.three`, sym(`one.two.three`))

  only(`-`, sym(`-`))
  only(`+`, sym(`+`))
  only(`!`, sym(`!`))
  only(`!@`, sym(`!@`))
  only(`!@#`, sym(`!@#`))
  only(`!@#.%^&`, sym(`!@#.%^&`))
  only(`!@#.%^&.*-+`, sym(`!@#.%^&.*-+`))

  only(`!@#ident`, sym(`!@#ident`))
  only(`!@#123`, sym(`!@#123`))
  only(`--123`, sym(`--123`))
  only(`+-123`, sym(`+-123`))
  only(`-+123`, sym(`-+123`))
  only(`++123`, sym(`++123`))
  only(`ident!@#`, sym(`ident!@#`))

  only(`one.!@#`, sym(`one.!@#`))
  only(`one.!@#.%^&`, sym(`one.!@#.%^&`))
  only(`!@#.one`, sym(`!@#.one`))
  only(`!@#.one.two`, sym(`!@#.one.two`))
  only(`!@#.one.%^&`, sym(`!@#.one.%^&`))
  only(`one.!@#.two`, sym(`one.!@#.two`))

  only(`.0`, sym(`.0`))
  only(`-.0`, sym(`-.0`))
  only(`.1`, sym(`.1`))
  only(`-.1`, sym(`-.1`))
  only(`.2`, sym(`.2`))
  only(`-.2`, sym(`-.2`))
  only(`.12`, sym(`.12`))
  only(`-.12`, sym(`-.12`))
  only(`.456ident`, sym(`.456ident`))
  only(`-.456ident`, sym(`-.456ident`))

  fail(`;; ;;123`, `unrecognized syntax`)
  fail(`;;comment;;123`, `unrecognized syntax`)
  fail(`;; comment ;;123`, `unrecognized syntax`)

  only(`;; ;; 123`, 123)
  only(`;;comment;; 123`, 123)
  only(`;;comment;; 123`, 123)
  only(`;; comment ;; 123`, 123)
  only(`;;; comment ;;; 123`, 123)
  only(`;;;; comment ;;;; 123`, 123)
  only(`;;;; comment ;;;; 123 ;; comment ;;`, 123)
  only(`;;;; comment ;;;; 123 ;;; comment ;;;`, 123)
  only(`;;;; comment ;;;; 123 ;;;; comment ;;;;`, 123)
  only(`123 ;; ;;`, 123)
  only(`123 ;; comment ;;`, 123)
  only(`123 ;;; comment ;;;`, 123)
  only(`123 ;;;; comment ;;;;`, 123)

  function many(src, exp) {
    t.eq([...new c.DelimReader(src)], exp, c.joinParagraphs(`source:`, src))
  }

  many(``, [])
  many(srcs.join(` `), exps)
  many(srcs.join(`\n`), exps)
  many(srcs.join(` ;; some comment ;; `), exps)
})

t.test(function test_node_context() {
  t.test(function test_node_context_without_span() {
    t.is(c.nodeContext(), c.joinParagraphs(`source node:`, `undefined`))
    t.is(c.nodeContext(null), c.joinParagraphs(`source node:`, `null`))
    t.is(c.nodeContext(123), c.joinParagraphs(`source node:`, `123`))
    t.is(c.nodeContext(`str`), c.joinParagraphs(`source node:`, `"str"`))
    t.is(c.nodeContext([]), c.joinParagraphs(`source node:`, `[]`))
    t.is(c.nodeContext([10]), c.joinParagraphs(`source node:`, `[10]`))
    t.is(c.nodeContext([10, [20]]), c.joinParagraphs(`source node:`, `[10, [20]]`))
    t.is(c.nodeContext({one: 10}), c.joinParagraphs(`source node:`, `{one: 10}`))
    t.is(c.nodeContext(c.nodeContext), c.joinParagraphs(`source function:`, `[function nodeContext]`))
    t.is(c.nodeContext(Promise.resolve()), c.joinParagraphs(`source node:`, `[object Promise]`))
  })

  t.test(function test_node_context_with_span() {
    const src = new c.DelimReader(ts.srcLong)
    src.read()
    src.read()

    const node = src.read()
    t.eq(node, [30, 40])
    t.is(c.nodeSpan(node).view(), `[30 40]`)
    t.is(c.nodeContext(node), c.joinParagraphs(`source node context:`, ts.contextLong))
  })
})

t.test(function test_node_repr() {
  const src = [...new c.DelimReader(`
10
[
  [20       ;; one ;;]
  [30 40    ;; two ;;]
  [50 60 70 ;; three ;;]
]
80`)][1]
  t.eq(src, [[20], [30, 40], [50, 60, 70]])

  t.is(c.reprNode(src), `[
  [20       ;; one ;;]
  [30 40    ;; two ;;]
  [50 60 70 ;; three ;;]
]`)

  t.is(c.reprNode(src[0]), `[20       ;; one ;;]`)
  t.is(c.reprNode(src[1]), `[30 40    ;; two ;;]`)
  t.is(c.reprNode(src[2]), `[50 60 70 ;; three ;;]`)

  t.eq([...src], [[20], [30, 40], [50, 60, 70]])

  /*
  A shallow copy of the original list doesn't have access to its span,
  and falls back on representing JS values.
  */
  t.is(c.reprNode([...src]), `[[20], [30, 40], [50, 60, 70]]`)

  t.is(c.reprNode(undefined), `undefined`)
  t.is(c.reprNode(null), `null`)
  t.is(c.reprNode(10), `10`)
  t.is(c.reprNode(sym(`one`)), `one`)
  t.is(c.reprNode(sym(`one.two`)), `one.two`)
  t.is(c.reprNode(`one`), `"one"`)
  t.is(c.reprNode(`one.two`), `"one.two"`)

  t.is(c.reprNode(sym), `[function sym]`)

  t.is(c.reprNode([]), `[]`)
  t.is(c.reprNode([10]), `[10]`)
  t.is(c.reprNode([10, 20]), `[10, 20]`)
  t.is(c.reprNode([10, 20, 30]), `[10, 20, 30]`)
  t.is(c.reprNode([sym(`one`)]), `[one]`)
  t.is(c.reprNode([sym(`one`), sym(`two`)]), `[one, two]`)
  t.is(c.reprNode([sym(`one`), sym(`two`), sym(`three`)]), `[one, two, three]`)
  t.is(c.reprNode([sym]), `[[function sym]]`)

  t.is(c.reprNode({}), `{}`)
  t.is(c.reprNode({one: 10}), `{one: 10}`)
  t.is(c.reprNode({one: 10, two: 20}), `{one: 10, two: 20}`)
  t.is(c.reprNode({one: sym}), `{one: [function sym]}`)

  t.is(
    c.reprNode([
      {one: [10]},
      {two: [sym(`three`), {four: sym}]},
    ]),
    `[{one: [10]}, {two: [three, {four: [function sym]}]}]`,
  )
})

if (import.meta.main) ti.flush()

import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

function sym(val) {return Symbol.for(c.reqStr(val))}

t.test(function test_Span() {
  const span = new c.Span()

  t.is(span.src, ``)
  t.is(span.pos, 0)
  t.is(span.end, 0)
  t.no(span.hasMore())
  t.is(span.view(), ``)
  t.is(span.context(), ``)

  const src = `one
two
three`

  span.init(src)
  t.is(span.src, src)
  t.is(span.pos, 0)
  t.is(span.end, src.length)
  t.ok(span.hasMore())
  t.is(span.view(), src)
  t.is(span.context(), c.joinParagraphs(`:1:1`, src))

  span.skip(4)
  t.is(span.src, src)
  t.is(span.pos, 4)
  t.is(span.end, src.length)
  t.ok(span.hasMore())
  t.is(span.view(), `two
three`)
  t.is(span.context(), `:2:1

…
two
three`)

  span.skip(2)
  t.is(span.src, src)
  t.is(span.pos, 6)
  t.is(span.end, src.length)
  t.ok(span.hasMore())
  t.is(span.view(), `o
three`)
  t.is(span.context(), `:2:3

…
…o
three`)

  span.skip(123)
  t.is(span.src, src)
  t.is(span.pos, 129)
  t.is(span.end, src.length)
  t.no(span.hasMore())
  t.is(span.view(), ``)
  t.is(span.context(), ``)

  span.init(src, 0, 4)
  t.is(span.src, src)
  t.is(span.pos, 0)
  t.is(span.end, 4)
  t.ok(span.hasMore())
  t.is(span.view(), `one
`)
  t.is(span.context(), `:1:1

one
two
three`)

  span.init(src, 3, 4)
  t.is(span.src, src)
  t.is(span.pos, 3)
  t.is(span.end, 4)
  t.ok(span.hasMore())
  t.is(span.view(), `\n`)
  t.is(span.context(), `:1:4

…
two
three`)

  span.init(src, 4, 4)
  t.is(span.src, src)
  t.is(span.pos, 4)
  t.is(span.end, 4)
  t.no(span.hasMore())
  t.is(span.view(), ``)
  t.is(span.context(), `:2:1

…
two
three`)

  span.init(src, 9, 4)
  t.is(span.src, src)
  t.is(span.pos, 9)
  t.is(span.end, 4)
  t.no(span.hasMore())
  t.is(span.view(), ``)
  t.is(span.context(), `:3:2

…
…hree`)
})

t.test(function test_Reader() {
  // Used below to test parsing of larger text.
  const srcs = []
  const exps = []

  function fail(src, msg) {
    const read = new c.Reader(src)
    return ti.fail(() => [...read], msg)
  }

  function only(src, exp) {
    const read = new c.Reader(src)
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

  fail(`...`, `unrecognized syntax

:1:1

...`)

  fail(`10 20 30 ... 40 50 60`, `unrecognized syntax

:1:10

…... 40 50 60`)

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

  fail(`]`, `unexpected "]"`)
  fail(`[`, `expected closing "]", found EOF`)
  fail(`[[]`, `expected closing "]", found EOF`)
  fail(`[]]`, `unexpected "]"`)
  only(`[]`, [])
  only(`[[]]`, [[]])
  only(`[[[]]]`, [[[]]])

  fail(`)`, `unexpected ")"`)
  fail(`(`, `expected closing ")", found EOF`)
  fail(`(()`, `expected closing ")", found EOF`)
  fail(`())`, `unexpected ")"`)
  only(`()`, [])
  only(`(())`, [[]])
  only(`((()))`, [[[]]])

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

  fail(`.0`, `unrecognized syntax`)
  fail(`-.0`, `unrecognized syntax`)
  fail(`.1`, `unrecognized syntax`)
  fail(`-.1`, `unrecognized syntax`)
  fail(`.2`, `unrecognized syntax`)
  fail(`-.2`, `unrecognized syntax`)
  fail(`.12`, `unrecognized syntax`)
  fail(`-.12`, `unrecognized syntax`)
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

  fail(`.456ident`, `unrecognized syntax`)
  fail(`-.456ident`, `unrecognized syntax`)

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

  fail(`"`,            `unrecognized syntax`)
  only(`""`,           ``)
  only(`"text"`,       `text`)
  fail(`"text""`,      `unrecognized syntax`)
  fail(`"text"""`,     `unrecognized syntax`)
  fail(`"""`,          `unrecognized syntax`)
  fail(`""""`,         `unrecognized syntax`)
  fail(`"""text`,      `unrecognized syntax`)
  fail(`"""text"`,     `unrecognized syntax`)
  fail(`"""text""`,    `unrecognized syntax`)
  only(`"""text"""`,   `text`)
  fail(`"""text""""`,  `unrecognized syntax`)
  fail(`"""text"""""`, `unrecognized syntax`)
  only(`"\\n"`,        `\n`)
  only(`"\\""`,        `"`)

  fail(`!@#ident`, `unrecognized syntax; expected whitespace, delimiter, or EOF

:1:4

…ident`)

  fail(`!@#123`, `unrecognized syntax; expected whitespace, delimiter, or EOF

:1:4

…123`)

  /*
  Technical note. We overload `-`, allowing it at the beginning of numeric
  literals, and otherwise treating it as one of the operator characters.
  Our parsing is left-associative and greedy, with minimal lookahead. When
  we find multiple operator characters, we combine them into one operator
  symbol, without bothering to check if one of them could be "given up"
  to a subsequent numeric literal, and without giving `-` special treatment
  in cases like this.
  */
  fail(`--123`, `unrecognized syntax; expected whitespace, delimiter, or EOF

:1:3

…123`)

  fail(`+-123`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`-+123`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)
  fail(`++123`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)

  fail(`ident!@#`, `unrecognized syntax; expected whitespace, delimiter, or EOF

:1:6

…!@#`)

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

  fail(`.one`, `unrecognized syntax`)
  fail(`..one`, `unrecognized syntax`)
  fail(`one.`, `unrecognized syntax`)
  fail(`one..`, `unrecognized syntax`)
  fail(`one.two.`, `unrecognized syntax`)
  fail(`one. two`, `unrecognized syntax`)
  fail(`one .two`, `unrecognized syntax`)
  fail(`one . two`, `unrecognized syntax`)
  fail(`.one.two`, `unrecognized syntax`)
  fail(`.one.two.`, `unrecognized syntax`)

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

  only(`one.!@#`, sym(`one.!@#`))
  only(`one.!@#.%^&`, sym(`one.!@#.%^&`))
  only(`!@#.one`, sym(`!@#.one`))
  only(`!@#.one.two`, sym(`!@#.one.two`))
  only(`!@#.one.%^&`, sym(`!@#.one.%^&`))
  only(`one.!@#.two`, sym(`one.!@#.two`))

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
    t.eq([...new c.Reader(src)], exp, c.joinParagraphs(`source:`, src))
  }

  many(``, [])
  many(srcs.join(` `), exps)
  many(srcs.join(`\n`), exps)
  many(srcs.join(` ;; some comment ;; `), exps)
})

const srcLong = `
10
20 [30 40] 50
b170f9ac8ac4452da3459f04eecc2a0e
8256285e7c1e44b6ab1ace0e2660f4e3
8c15bdb2fa3e4f9eb030f4ff54f9c25e
415b26f753b346968149e9b934df3253
bad0e077c8344f7685c6ef859e3d3343
96c214786802449392bda446b51ddf83
b8af2a6003834b31b82f12b77129ab3a
9734e33ba3da405cadae84842c28cee4
8388a68c22544962b27a2e117934dce1
`

const contextLong = `:3:4

…
…[30 40] 50
b170f9ac8ac4452da3459f04eecc2a0e
8256285e7c1e44b6ab1ace0e2660f4e3
8c15bdb2fa3e4f9eb030f4ff54f9c25e
415b26f753b346968…`

t.test(function test_span_context() {
  t.test(function test_from_start() {
    const span = new c.Span(srcLong, 0, 14)

    t.is(span.view(), `
10
20 [30 40]`)

    t.is(span.context(), `:1:1


10
20 [30 40] 50
b170f9ac8ac4452da3459f04eecc2a0e
8256285e7c1e44b6ab1ace0e2660f4e3
8c15bdb2fa3e4f9eb030f4ff54f9c25e
415b26f753…`)
  })

  t.test(function test_from_middle() {
    const span = new c.Span(srcLong, 7, 14)
    t.is(span.view(), `[30 40]`)
    t.is(span.context(), contextLong)
  })

  t.test(function test_with_path() {
    const path = c.reqValidStr(import.meta.url)
    const span = new c.Span(srcLong, 7, 14, path)
    t.is(span.view(), `[30 40]`)
    t.is(span.context(), path + contextLong)
  })
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
    const src = new c.Reader(srcLong)
    src.read()
    src.read()

    const node = src.read()
    t.eq(node, [30, 40])
    t.is(c.nodeSpan(node).view(), `[30 40]`)
    t.is(c.nodeContext(node), c.joinParagraphs(`source node context:`, contextLong))
  })
})

t.test(function test_node_repr() {
  const src = [...new c.Reader(`
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

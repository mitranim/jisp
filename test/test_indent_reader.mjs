import {t} from './test_init.mjs'
import * as ti from './test_init.mjs'
import * as c from '../js/core.mjs'

function sym(val) {return Symbol.for(c.reqStr(val))}
function read(src) {return [...new c.IndentReader(src)]}
function test(src, exp) {t.eq(read(src), exp)}
function fail(src, msg) {ti.fail(() => read(src), msg)}

t.test(function test_IndentReader_tokens() {
  // Used below to test parsing of larger text.
  const srcs = []
  const exps = []

  function only(src, exp) {
    const read = new c.IndentReader(src)
    const val = read.readToken()

    t.eq(val, exp, `source: ` + src)
    t.is(read.readToken(), undefined, `must be empty after parsing source: ` + src)

    srcs.push(src)
    exps.push(exp)
  }

  fail(`}`, `unrecognized syntax`)
  fail(`{`, `unrecognized syntax`)
  fail(`{}`, `unrecognized syntax`)

  fail(`]`, `unrecognized syntax`)
  fail(`[`, `unrecognized syntax`)
  fail(`[]`, `unrecognized syntax`)

  fail(`)`, `unrecognized syntax`)
  fail(`(`, `unrecognized syntax`)
  fail(`()`, `unrecognized syntax`)

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

  fail(`123;`, `unrecognized syntax`)
  fail(`123;;`, `unrecognized syntax`)
  fail(`123;; ;;`, `unrecognized syntax`)

  fail(`123... 456`, `unrecognized syntax; expected whitespace, delimiter, or EOF

:1:4

…... 456`)

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

  function many(src, exp) {
    t.eq([...new c.IndentReader(src)], exp, c.joinParagraphs(`source:`, src))
  }

  many(``, [])
  many(srcs.join(` `), [exps])
})

t.test(function test_IndentReader_lists() {
  fail(` 10`, `indentation not divisible by "  "`)
  fail(`   10`, `indentation not divisible by "  "`)
  fail(`\t10`, `unexpected tab character`)
  fail(`\t\t10`, `unexpected tab character`)
  fail(`  \t10`, `unexpected tab character`)
  fail(`  \t\t10`, `unexpected tab character`)
  fail(`\v10`, `unexpected tab character`)
  fail(`\v\v10`, `unexpected tab character`)
  fail(`  \v10`, `unexpected tab character`)
  fail(`  \v\v10`, `unexpected tab character`)
  fail(`  10`, `unexpected indentation increase`)

  fail(`
  10
`, `unexpected indentation increase`)

  fail(`
10
    20
`, `unexpected indentation increase`)

  fail(`
10
  20
      30
`, `unexpected indentation increase`)

  fail(`
10
 20
`, `indentation not divisible by "  "`)

  fail(`
10
   20
`, `indentation not divisible by "  "`)

  test(``, [])

  // Internally, the same-line list tail is called a "row".
  test(`10`, [[10]])
  test(`10 20`, [[10, 20]])
  test(`10 20 30`, [[10, 20, 30]])

  // Internally, the indented list tail is called a "col".
  test(`
10
  20
`, [[10, [20]]])

  test(`
10
  20
  30
`, [[10, [20], [30]]])

  test(`
10 20
  30
`, [[10, 20, [30]]])

  test(`
10
  20 30
`, [[10, [20, 30]]])

  test(`
10 20
  30 40
`, [[10, 20, [30, 40]]])

  test(`
10 20
  30
  40
`, [[10, 20, [30], [40]]])

  test(`"one"`, [[`one`]])
  test(`"one" "two"`, [[`one`, `two`]])
  test(`"one" "two" "three"`, [[`one`, `two`, `three`]])

  test(`
"one"
  "two"
`, [[`one`, [`two`]]])

  test(`
"one"
  "two"
  "three"
`, [[`one`, [`two`], [`three`]]])

  test(`
"one" "two"
  "three"
`, [[`one`, `two`, [`three`]]])

  test(`
"one"
  "two" "three"
`, [[`one`, [`two`, `three`]]])

  test(`
"one" "two"
  "three" "four"
`, [[`one`, `two`, [`three`, `four`]]])

  test(`
"one" "two"
  "three"
  "four"
`, [[`one`, `two`, [`three`], [`four`]]])

  test(`one`, [[sym(`one`)]])
  test(`one two`, [[sym(`one`), sym(`two`)]])
  test(`one two three`, [[sym(`one`), sym(`two`), sym(`three`)]])

  test(`
one
  two
`, [[sym(`one`), [sym(`two`)]]])

  test(`
one
  two
  three
`, [[sym(`one`), [sym(`two`)], [sym(`three`)]]])

  test(`
one two
  three
`, [[sym(`one`), sym(`two`), [sym(`three`)]]])

  test(`
one
  two three
`, [[sym(`one`), [sym(`two`), sym(`three`)]]])

  test(`
one two
  three four
`, [[sym(`one`), sym(`two`), [sym(`three`), sym(`four`)]]])

  test(`
one two
  three
  four
`, [[sym(`one`), sym(`two`), [sym(`three`)], [sym(`four`)]]])

  test(`
10
  20
    30
`, [
    [10,
      [20,
        [30],
      ],
    ],
  ])

  test(`
10
  20
    30
  40
`, [
    [10,
      [20,
        [30],
      ],
      [40],
    ],
  ])

  test(`
10
  20
    30
  40
50
`, [
    [10,
      [20,
        [30],
      ],
      [40],
    ],
    [50],
  ])

  test(`
10
  20
    30
40
`, [
    [10,
      [20,
        [30],
      ],
    ],
    [40],
  ])

  t.test(function test_lister() {
    fail(`::`, `unrecognized syntax`)
    fail(`: ::`, `unrecognized syntax`)
    fail(`:: :`, `unrecognized syntax`)
    fail(`10:`, `unrecognized syntax`)
    fail(`:10`, `unrecognized syntax`)
    fail(`10 ::`, `unrecognized syntax`)
    fail(`:: 10`, `unrecognized syntax`)

    test(`:`, [[]])
    test(`: :`, [[[]]])
    test(`: : :`, [[[[]]]])

    test(`
:
:
`, [[], []])

    test(`
:
:
:
`, [[], [], []])

    test(`
:
: :
: : :
`, [[], [[]], [[[]]]])

    test(`
:
  :
`, [[[]]])

    test(`
:
  :
  :
`, [[[], []]])

    test(`
:
  :
    :
`, [[[[]]]])

    fail(`
  :
`, `unexpected indentation increase`)

    fail(`
:
    :
`, `unexpected indentation increase`)

    test(`10`, [[10]])
    test(`: 10`, [[10]])
    test(`: : 10`, [[[10]]])
    test(`: : : 10`, [[[[10]]]])
    test(`10 :`, [[10, []]])
    test(`10 : :`, [[10, [[]]]])
    test(`10 20`, [[10, 20]])
    test(`10 20 :`, [[10, 20, []]])
    test(`10 20 : :`, [[10, 20, [[]]]])
    test(`: 10 20`, [[10, 20]])
    test(`: : 10 20`, [[[10, 20]]])
    test(`: : : 10 20`, [[[[10, 20]]]])
    test(`10 : 20`,   [[10, [20]]])
    test(`: 10 : 20`, [[10, [20]]])
    test(`: 10 : : 20`, [[10, [[20]]]])
    test(`: 10 : 20 30`, [[10, [20, 30]]])
    test(`: 10 : 20 : 30`, [[10, [20, [30]]]])

    test(`
10 :
20
`, [
  [10, []],
  [20],
])

    test(`
10
:
20
`, [
  [10],
  [],
  [20],
])

    test(`
10 :
20 :
`, [
  [10, []],
  [20, []],
])

    test(`
10 :
  20
`, [
  [10, [
    [20],
  ]],
])

    test(`
10
  :
  20
`, [
  [10,
    [],
    [20],
  ],
])

    test(`
10 : 20
  30
`, [
  [10, [20,
    [30],
  ]],
])

    test(`
10 : 20 :
  30
`, [
  [10, [20, [
    [30],
  ]]],
])

    test(`
10 : 20 :
  30 :
`, [
  [10, [20, [
    [30, []],
  ]]],
])

    test(`
10 : 20 :
  30 : 40
`, [
  [10, [20, [
    [30, [40]],
  ]]],
])
  })

  t.test(function test_splicer() {
    fail(`''`, `unrecognized syntax`)
    fail(`10'`, `unrecognized syntax`)
    fail(`'10`, `unrecognized syntax`)
    fail(`':`, `unrecognized syntax`)
    fail(`:'`, `unrecognized syntax`)
    fail(` '`, `indentation not divisible by "  "`)
    fail(`  '`, `unexpected indentation increase`)

    // Useless behavior that automatically comes from the splicer definition.
    test(`'`, [])
    test(`' '`, [])
    test(`' ' '`, [])

    /*
    The splicer character prevents the reader from implicitly starting a list at
    the start of a row.
    */
    test(`10`, [[10]])
    test(`' 10`, [10])
    test(`' ' 10`, [10])
    test(`' ' ' 10`, [10])
    test(`' 10 '`, [10])
    test(`' 10 ' '`, [10])
    test(`' ' 10 ' '`, [10])

    test(`10 '`, [[10]])
    test(`10 ' '`, [[10]])
    test(`10 ' ' '`, [[10]])

    /*
    The splicer character only prevents the reader from implicitly starting a
    list at the start of a row. It does not prevent the reader from explicitly
    starting a list at the subsequent lister character, whether this occurs at
    the start of a row or in the middle of a row.
    */
    test(`:`, [[]])
    test(`' :`, [[]])
    test(`' ' :`, [[]])
    test(`' ' ' :`, [[]])
    test(`' : 10`, [[10]])
    test(`' ' : 10`, [[10]])
    test(`' ' ' : 10`, [[10]])
    test(`' 10 :`, [10, []])
    test(`' ' 10 :`, [10, []])
    test(`' ' ' 10 :`, [10, []])

    test(`: '`, [[]])
    test(`: ' '`, [[]])
    test(`: ' ' '`, [[]])

    /*
    The splicer character does not prevent the reader from adding tokens to the
    current list.
    */
    test(`: 10`, [[10]])
    test(`: ' 10`, [[10]])
    test(`: ' ' 10`, [[10]])
    test(`: ' ' ' 10`, [[10]])
    test(`10 ' 20`, [[10, 20]])
    test(`10 ' ' 20`, [[10, 20]])
    test(`10 ' ' ' 20`, [[10, 20]])

    test(`
' 10
`, [10])

    test(`
' 10
  20
`, [10, [20]])

    test(`
' 10
  ' 20
`, [10, 20])

    fail(`
' 10
    ' 20
`, `unexpected indentation increase`)

    test(`
' 10
' 20
`, [10, 20])

    test(`
10
  ' 20
`, [[10, 20]])

    test(`
10
  ' 20
  ' 30
`, [[10, 20, 30]])

    test(`
10
  ' 20
    ' 30
`, [[10, 20, 30]])

    // Useless behavior. Would prefer if this was forbidden, but not at the cost
    // of adding code.
    test(`
' 10
  '
    '
      '
    '
  '
'
`, [10])

    test(`
10
  ' 20 30
  ' 40 50
`, [[
  10,
  20, 30,
  40, 50,
]])
  })
})

t.test(function test_IndentReader_comments() {
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

  fail(`;; ;;123`, `unrecognized syntax`)
  fail(`;;comment;;123`, `unrecognized syntax`)
  fail(`;; comment ;;123`, `unrecognized syntax`)

  const tar = new c.IndentReader(`
;; one ;;
;; two ;;
  ;; three ;;
`)

  t.no(tar.skippedComment())
  t.is(tar.view(), `
;; one ;;
;; two ;;
  ;; three ;;
`)

  t.no(tar.readIndent(0))
  t.is(tar.view(), `;; one ;;
;; two ;;
  ;; three ;;
`)

  t.ok(tar.skippedComment())
  t.is(tar.view(), `
;; two ;;
  ;; three ;;
`)

  t.no(tar.skippedComment())
  t.is(tar.view(), `
;; two ;;
  ;; three ;;
`)

  t.no(tar.skippedComment())
  t.no(tar.readIndent(0))
  t.is(tar.view(), `;; two ;;
  ;; three ;;
`)

  t.ok(tar.skippedComment())
  t.is(tar.view(), `
  ;; three ;;
`)

  t.no(tar.readIndent(1))
  t.is(tar.view(), `;; three ;;
`)

  t.ok(tar.skippedComment())
  t.is(tar.view(), `
`)

  fail(`
10
    ;; one ;;
`, `unexpected indentation increase`)

  test(`
10
  ;; one ;;
  20
  ;; two ;;
`, [
  [10,
    [20],
  ],
])

  fail(`
10
  ;; one ;;20
`, `unrecognized syntax; expected whitespace, delimiter, or EOF`)

  test(`
10
  ;; one ;; 20
`, [
  [10,
    [20],
  ],
])

  test(`
10
  ;; one ;;  20
`, [
  [10,
    [20],
  ],
])

  test(`
10
  ;; one ;;   20
`, [
  [10,
    [20],
  ],
])

  test(`
10
  ;; one ;; 20
  ;; two ;; 30
`, [
  [10,
    [20],
    [30],
  ],
])

  test(`
10
  ;; one ;; ' 20
  ;; two ;; 30
`, [
  [10,
    20,
    [30],
  ],
])

  test(`
10
  ;; one ;; 20
  ;; two ;; ' 30
`, [
  [10,
    [20],
    30,
  ],
])

  test(`
10
  ;; one ;; ' 20
  ;; two ;; ' 30
`, [
  [10,
    20,
    30,
  ],
])

  test(`
10
  ;; one ;; 20 ;; two ;; 30
  ;; three ;; 40 ;; four ;; 50
`, [
  [10,
    [20, 30],
    [40, 50],
  ],
])
})

if (import.meta.main) ti.flush()

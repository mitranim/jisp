import './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as c from '/Users/m/code/m/js/cli.mjs'
import * as j from '../js/jisp_0.mjs'

/* Util */

const inspectOpt = {
  depth: Infinity,
  colors: true,
  compact: true,
  trailingComma: true,
  // showHidden: true,
}

function prn(desc, val) {
  console.log(desc, Deno.inspect(val, inspectOpt))
}

/* Tests */

t.test(function test_parsing() {
  t.test(function test_Tokenizer() {
    const src = `
10 20
; comment
"double quoted"
\`grave quoted\`
$long_Ident_$123
one.two.three
[({30})]
`.trim()

    const tok = new j.Tokenizer().init(src)
    // prn(`tok:`, tok)
    // prn(`tokens:`, tok.toArray())

    t.test(function test_Lexer() {
      const lex = new j.Lexer().init(new j.Tokenizer().init(src))
      // prn(`lex:`, lex)
      // prn(`nodes:`, lex.toArray())
    })
  })
})

t.test(function test_Ident() {
  t.test(function test_Ident_isValidLocal() {
    t.ok(j.Ident.isValidLocal(`_`))
    t.ok(j.Ident.isValidLocal(`$`))
    t.ok(j.Ident.isValidLocal(`a`))
    t.ok(j.Ident.isValidLocal(`abc`))
    t.ok(j.Ident.isValidLocal(`_abc`))
    t.ok(j.Ident.isValidLocal(`$abc`))
    t.ok(j.Ident.isValidLocal(`_12`))
    t.ok(j.Ident.isValidLocal(`$12`))
    t.ok(j.Ident.isValidLocal(`a12`))
    t.ok(j.Ident.isValidLocal(`abc12`))

    t.no(j.Ident.isValidLocal(``))
    t.no(j.Ident.isValidLocal(`12`))
    t.no(j.Ident.isValidLocal(` `))
    t.no(j.Ident.isValidLocal(`one.two`))
  })
})

t.test(function test_ValNode() {
  function make(val) {return new j.ValNode().setVal(val)}
  function test(src, exp) {t.eq(make(src).toJs(), exp)}

  test(undefined, `undefined`)
  test(null, `null`)
  test(false, `false`)
  test(true, `true`)
  test(10, `10`)
  test(20.30, `20.3`)
  test(`str`, `"str"`)
  test([], `[]`)
  test([undefined, null, true, 10.20, `str`], `[undefined, null, true, 10.2, "str"]`)
  test([[]], `[[]]`)
  test([[[]]], `[[[]]]`)
  test([{}], `[{}]`)
  test({}, `{}`)
  test({one: 10}, `{one: 10}`)
  test({one: 10, two: 20}, `{one: 10, two: 20}`)
  test({one: `two`}, `{one: "two"}`)
  test({one: `two`, three: `four`}, `{one: "two", three: "four"}`)
  test({12.34: 56}, `{12.34: 56}`)
  test({'one.two': `three.four`}, `{"one.two": "three.four"}`)
})

t.test(function test_Module() {
  const root = new j.Root().default()

  const mod = new j.Module().setParent(root).init(
    new j.Lexer().init(new j.Tokenizer().init(`
[use ":lang" l]
[use \`:compiler\` c]

; Compile error.
; [use ":redundant" c]

; Compile error.
; [const _ unknownIdent]

; Generates a syntactically valid call that panics at runtime.
[nil false true]

[const someVal 10]

; OK.
someVal

; Compile error.
; [fn someFunc0 [] someArg]

; OK.
[fn someFunc1 [someArg] someArg]

; Must generate a runtime call without "new".
[someFunc1 10 20 30]

; OK.
[fn someFunc2 [] someVal]

[setCallStyle someFunc2 "runtimeNew"]

; Must generate a runtime call with "new".
[someFunc2 10 20 30]

; "globalThis" must be predefined.
[const g globalThis]

; FIXME implement.
; FIXME exclude from compiled code, unless used by non-macros.
[fn astMacro []
  ; Shadowing must work.
  [const g globalThis]
  [g.console.log "executing AST macro"]

  ; FIXME implement.
  ; FIXME compile error for unknown identifier "one" and others.
  ; [quote [one two three]]
]

; TODO consider: get "Def" and call its method.
[setCallStyle astMacro "macroAst"]

; Compile error.
; astMacro

[astMacro 10 20 30]

[fn valMacro []
  ; Shadowing must work.
  [const g globalThis]
  [g.console.log "executing val macro"]
  [g.Array.of
    10
    [g.Object.fromEntries
      [g.Array.of
        [g.Array.of "one" 20]
        [g.Array.of "🙂😛😞" 30]
      ]
    ]
  ]
]

; TODO consider: get "Def" and call its method.
[setCallStyle valMacro "macroAst"]

; Compile error.
; valMacro

[valMacro 10 20 30]
`.trim())),
  ).macro()

  // prn(`mod:`, mod)

  console.log()
  console.log(mod.toJs())
})

/* Main */

if (cli.boolOpt(`bench`)) t.deopt(), t.benches()

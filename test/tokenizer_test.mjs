import {a} from '../js/dep.mjs'
import {t} from './test_dep.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jm from '../js/misc.mjs'
import * as je from '../js/err.mjs'
import * as jt from '../js/tokenizer.mjs'
import * as jnbrc from '../js/node_braces.mjs'
import * as jnbrk from '../js/node_brackets.mjs'
import * as jnpar from '../js/node_parens.mjs'
import * as jnsp from '../js/node_space.mjs'
import * as jnco from '../js/node_comment.mjs'
import * as jnnu from '../js/node_num.mjs'
import * as jnst from '../js/node_str.mjs'
import * as jnio from '../js/node_ident_oper.mjs'
import * as jniu from '../js/node_ident_unqual.mjs'
import * as jnia from '../js/node_ident_access.mjs'

t.test(function test_Tokenizer() {
  testTok(tu.SRC_TEXT_SHORT, [
    tok => a.isInst(tok, jnnu.Num)         && tok.decompile() === `10`,
    tok => a.isInst(tok, jnnu.Num)         && tok.decompile() === `20`,
    tok => a.isInst(tok, jnst.StrDouble)   && tok.decompile() === `"double quoted"`,
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "`grave quoted`",
    tok => a.isInst(tok, jnio.IdentOper)   && tok.decompile() === `*`,
    tok => a.isInst(tok, jnio.IdentOper)   && tok.decompile() === `&&`,
    tok => a.isInst(tok, jnio.IdentOper)   && tok.decompile() === `>>>`,
    tok => a.isInst(tok, jniu.IdentUnqual) && tok.decompile() === `$long_Ident_$123`,
    tok => a.isInst(tok, jniu.IdentUnqual) && tok.decompile() === `one`,
    tok => a.isInst(tok, jnia.IdentAccess) && tok.decompile() === `.two`,
    tok => a.isInst(tok, jnia.IdentAccess) && tok.decompile() === `.three`,
    tok => a.isInst(tok, jnbrk.BracketPre) && tok.decompile() === `[`,
    tok => a.isInst(tok, jnpar.ParenPre)   && tok.decompile() === `(`,
    tok => a.isInst(tok, jnbrc.BracePre)   && tok.decompile() === `{`,
    tok => a.isInst(tok, jnnu.Num)         && tok.decompile() === `30`,
    tok => a.isInst(tok, jnbrc.BraceSuf)   && tok.decompile() === `}`,
    tok => a.isInst(tok, jnpar.ParenSuf)   && tok.decompile() === `)`,
    tok => a.isInst(tok, jnbrk.BracketSuf) && tok.decompile() === `]`,
  ])
})

t.test(function test_Tokenizer_strings() {
  testTok(``, [])

  /*
  In all these cases, we have an opening fence without an appropriate closing
  fence. This should cause parsing to fail.
  */
  testTokFail("```",                    `unrecognized syntax`)
  testTokFail("```some_text",           `unrecognized syntax`)
  testTokFail("```some_text`",          `unrecognized syntax`)
  testTokFail("```some_text``",         `unrecognized syntax`)
  testTokFail("```some_text````",       jm.joinParagraphs(`unexpected "\`"`, `:1:16`))
  testTokFail("````",                   `unrecognized syntax`)
  testTokFail("````some_text",          `unrecognized syntax`)
  testTokFail("````some_text`",         `unrecognized syntax`)
  testTokFail("````some_text``",        `unrecognized syntax`)
  testTokFail("````some_text```",       `unrecognized syntax`)
  testTokFail("````some_text`````",     jm.joinParagraphs(`unexpected "\`"`, `:1:18`))
  testTokFail("`````",                  `unrecognized syntax`)
  testTokFail("`````some_text",         `unrecognized syntax`)
  testTokFail("`````some_text`",        `unrecognized syntax`)
  testTokFail("`````some_text``",       `unrecognized syntax`)
  testTokFail("`````some_text```",      `unrecognized syntax`)
  testTokFail("`````some_text````",     `unrecognized syntax`)
  testTokFail("`````some_text``````",   jm.joinParagraphs(`unexpected "\`"`, `:1:20`))
  testTokFail("``````",                 `unrecognized syntax`)
  testTokFail("``````some_text",        `unrecognized syntax`)
  testTokFail("``````some_text`",       `unrecognized syntax`)
  testTokFail("``````some_text``",      `unrecognized syntax`)
  testTokFail("``````some_text```",     `unrecognized syntax`)
  testTokFail("``````some_text````",    `unrecognized syntax`)
  testTokFail("``````some_text`````",   `unrecognized syntax`)

  testTok("``", [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "``" && tok.ownVal() === ``,
  ])

  /*
  This may look like a single string delimited by a fence consisting of two
  delimiter characters. However, we treat two delimiter characters as a
  complete string literal. Fences must start at three delimiter characters.
  */
  testTok("``some_text``", [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "``" && tok.ownVal() === ``,
    tok => a.isInst(tok, jniu.IdentUnqual) && tok.decompile() === `some_text`,
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "``" && tok.ownVal() === ``,
  ])

  testTok("```some_text```", [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "```some_text```" && tok.ownVal() === `some_text`,
  ])

  testTok("````some_text````", [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "````some_text````" && tok.ownVal() === `some_text`,
  ])

  testTok("`````some_text`````", [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "`````some_text`````" && tok.ownVal() === `some_text`,
  ])

  testTok("``````some_text``````", [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "``````some_text``````" && tok.ownVal() === `some_text`,
  ])

  testTok(`\`some
multiline
string\``, [
    tok => (
      true
      && a.isInst(tok, jnst.StrBacktick)
      && tok.decompile() === `\`some
multiline
string\``
      && tok.ownVal() === `some` + `\n` + `multiline` + `\n` + `string`
    ),
  ])

  testTok(`\`
some
multiline
string
\``, [
    tok => (
      true
      && a.isInst(tok, jnst.StrBacktick)
      && tok.decompile() === `\`
some
multiline
string
\``
      && tok.ownVal() === `\n` + `some` + `\n` + `multiline` + `\n` + `string` + `\n`
    ),
  ])

  /*
  The input represents a backtick string literal with shorter outer fences
  (single character in this case) and longer inner fences. At some point we had
  support for parsing this as a single string. However, it required a complex
  regex or other complications. In addition, it doesn't seem like a desirable
  use case. Now, this test verifies that in order to avoid syntactic ambiguity,
  we treat this as invalid syntax.
  */
  testTokFail(`\`
some
\`\`\`
multiline
\`\`\`
string
\``, `unexpected "\`"

:3:2`)

  testTokFail(`\`\`\`
some
\`\`\`\`\`
multiline
\`\`\`\`\`
string
\`\`\``, `unexpected "\`"

:3:4`)

  testTok(`\`\`\`some
multiline
string\`\`\``, [
    tok => (
      true
      && a.isInst(tok, jnst.StrBacktick)
      && tok.decompile() === `\`\`\`some
multiline
string\`\`\``
      && tok.ownVal() === `some` + `\n` + `multiline` + `\n` + `string`
    ),
  ])

  testTok(`\`\`\`
some
multiline
string
\`\`\``, [
    tok => (
      true
      && a.isInst(tok, jnst.StrBacktick)
      && tok.decompile() === `\`\`\`
some
multiline
string
\`\`\``
      && tok.ownVal() === `\n` + `some` + `\n` + `multiline` + `\n` + `string` + `\n`
    ),
  ])

  testTok(`\`\`\`
some
\`
multiline
\`
string
\`\`\``, [
    tok => (
      true
      && a.isInst(tok, jnst.StrBacktick)
      && tok.decompile() === `\`\`\`
some
\`
multiline
\`
string
\`\`\``
      && tok.ownVal() === `\n` + `some` + `\n` + "`" + `\n` + `multiline` + `\n` + "`" + `\n` + `string` + `\n`
    ),
  ])

  // This particular case can be easily violated with an incorrect lookbehind.
  // TODO move to a specialized string-related test and add more similar test
  // cases.
  testTok(`"\\""`, [
    tok => (
      true
      && a.isInst(tok, jnst.StrDouble)
      && tok.decompile() === `"\\""`
      && tok.ownVal() === `"`
    ),
  ])
})

t.test(function test_Tokenizer_strings_subsequent() {
  testTok(`
\`\`

\`\`

\`some_text_0\`

\`some_text_1\`

\`\`\`some_text_2\`\`\`

\`\`\`some_text_3\`\`\`
`, [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "``"                && tok.ownVal() === ``,
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "``"                && tok.ownVal() === ``,
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "`some_text_0`"     && tok.ownVal() === `some_text_0`,
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "`some_text_1`"     && tok.ownVal() === `some_text_1`,
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "```some_text_2```" && tok.ownVal() === `some_text_2`,
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "```some_text_3```" && tok.ownVal() === `some_text_3`,
  ])
})

t.test(function test_Tokenizer_strings_followed_by_other_tokens() {
  testTok("`some_text`other_text", [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "`some_text`" && tok.ownVal() === `some_text`,
    tok => a.isInst(tok, jniu.IdentUnqual) && tok.decompile() === `other_text`,
  ])

  testTok("`some_text`10", [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "`some_text`" && tok.ownVal() === `some_text`,
    tok => a.isInst(tok, jnnu.Num)         && tok.decompile() === `10`,
  ])

  testTok("```some_text```other_text", [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "```some_text```" && tok.ownVal() === `some_text`,
    tok => a.isInst(tok, jniu.IdentUnqual) && tok.decompile() === `other_text`,
  ])

  testTok("```some_text```10", [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "```some_text```" && tok.ownVal() === `some_text`,
    tok => a.isInst(tok, jnnu.Num)         && tok.decompile() === `10`,
  ])

  testTok("`some_text`*", [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "`some_text`" && tok.ownVal() === `some_text`,
    tok => a.isInst(tok, jnio.IdentOper)   && tok.decompile() === `*`,
  ])

  testTok("```some_text```*", [
    tok => a.isInst(tok, jnst.StrBacktick) && tok.decompile() === "```some_text```" && tok.ownVal() === `some_text`,
    tok => a.isInst(tok, jnio.IdentOper)   && tok.decompile() === `*`,
  ])
})

function testTokFail(src, msg) {
  const tok = new jt.Tokenizer().init(src)
  t.throws(() => tok.toArray(), je.TokenizerErr, msg)
}

function testTok(src, funs) {
  src = a.trim(src)
  a.reqArr(funs)

  const tokens = new jt.Tokenizer().init(src).toArray()

  if (a.len(tokens) !== a.len(funs)) {
throw new t.AssertError(`
expected tokenizer to produce ${a.len(funs)} tokens, got ${a.len(tokens)} tokens

source text:

${src}

generated tokens:

${tu.insp(tokens)}

test functions for expected tokens:

${a.map(funs, String).join(`\n\n`)}
`)
  }

  for (const [ind, fun] of funs.entries()) {
    const token = tokens[ind]
    if (fun(token)) continue

throw new t.AssertError(`
token mismatch at index ${ind}

source text:

${src}

actual token:

${tu.insp(token)}

expected token pattern:

${fun}
`)
  }
}

if (import.meta.main) ti.flush()

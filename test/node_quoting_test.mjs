import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './root_test.mjs'
import * as jdft from './deno_fs_test.mjs'
import * as jr from '../js/root.mjs'
import * as jnnu from '../js/node_num.mjs'
import * as jnst from '../js/node_str.mjs'
import * as jnio from '../js/node_ident_oper.mjs'
import * as jniu from '../js/node_ident_unqual.mjs'
import * as jnia from '../js/node_ident_access.mjs'
import * as jnbrk from '../js/node_brackets.mjs'

/*
TODO: add tests that actually import the compiled code and verifies that the
quoted nodes are constructed properly.
*/

function rel(path) {return new URL(path, import.meta.url)}

await t.test(async function test_Quote_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[quote]
`,
    `[object Quote] expected exactly 1 children, got 0 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[quote 10 20 30]
`,
    `[object Quote] expected exactly 1 children, got 3 children`,
  )
})

// Also see `test_Quote_Unquote_execution` for a more complete test.
await t.test(async function test_Quote_valid_inline() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[quote 10]
[quote 20]
[quote "some_text_0"]
[quote "some_text_1"]
`,
`
new $_gen_3.Num().setSpan(new $_gen_2.ReprStrSpan().setSrc($_gen_1).setPos(36).setLen(2)).setStrVal("10").setVal(10);
new $_gen_3.Num().setSpan(new $_gen_2.ReprStrSpan().setSrc($_gen_1).setPos(47).setLen(2)).setStrVal("20").setVal(20);
new $_gen_4.StrDouble().setSpan(new $_gen_2.ReprStrSpan().setSrc($_gen_1).setPos(58).setLen(13)).setVal("some_text_0");
new $_gen_4.StrDouble().setSpan(new $_gen_2.ReprStrSpan().setSrc($_gen_1).setPos(80).setLen(13)).setVal("some_text_1");
const $_gen_1 = "\\n[use \\"jisp:prelude.mjs\\" *]\\n\\n[quote 10]\\n[quote 20]\\n[quote \\"some_text_0\\"]\\n[quote \\"some_text_1\\"]\\n";
import * as $_gen_2 from "${rel(`../js/span.mjs`)}";
import * as $_gen_3 from "${rel(`../js/node_num.mjs`)}";
import * as $_gen_4 from "${rel(`../js/node_str.mjs`)}";
`)

  await jrt.testModuleCompile(
    jrt.makeModuleAddressed(),
`
[use "jisp:prelude.mjs" *]

[quote 10]
[quote 20]
[quote "some_text_0"]
[quote "some_text_1"]
`,
`
new $_gen_4.Num().setSpan(new $_gen_3.ReprStrSpan().setPath($_gen_2).setSrc($_gen_1).setPos(36).setLen(2)).setStrVal("10").setVal(10);
new $_gen_4.Num().setSpan(new $_gen_3.ReprStrSpan().setPath($_gen_2).setSrc($_gen_1).setPos(47).setLen(2)).setStrVal("20").setVal(20);
new $_gen_5.StrDouble().setSpan(new $_gen_3.ReprStrSpan().setPath($_gen_2).setSrc($_gen_1).setPos(58).setLen(13)).setVal("some_text_0");
new $_gen_5.StrDouble().setSpan(new $_gen_3.ReprStrSpan().setPath($_gen_2).setSrc($_gen_1).setPos(80).setLen(13)).setVal("some_text_1");
const $_gen_1 = "\\n[use \\"jisp:prelude.mjs\\" *]\\n\\n[quote 10]\\n[quote 20]\\n[quote \\"some_text_0\\"]\\n[quote \\"some_text_1\\"]\\n";
const $_gen_2 = "${rel(`../test_files/test.jisp`)}";
import * as $_gen_3 from "../js/span.mjs";
import * as $_gen_4 from "../js/node_num.mjs";
import * as $_gen_5 from "../js/node_str.mjs";
`)
})

await t.test(async function test_Unquote_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[unquote]
`,
    `[object Unquote] expected exactly 1 children, got 0 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[unquote 10 20]
`,
    `[object Unquote] expected exactly 1 children, got 2 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[unquote someName]
`,
    `unable to find declaration of "someName" at [object IdentUnqual]`,
  )
})

// Also see `test_Quote_Unquote_execution` for a more complete test.
await t.test(async function test_Unquote_valid_inline() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[unquote 10]
[unquote [unquote 20]]
[unquote [unquote [unquote 30]]]
[unquote "10"]
[unquote [unquote "20"]]
[unquote [unquote [unquote "30"]]]
`,
`
10;
20;
30;
"10";
"20";
"30";
`)
})

await t.test(async function test_Quote_Unquote_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[quote [unquote one]]
`,
    `unable to find declaration of "one" at [object IdentUnqual]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[quote [one [unquote two] three]]
`,
    `unable to find declaration of "two" at [object IdentUnqual]`,
  )
})

// Also see `test_Quote_Unquote_execution` for a more complete test.
await t.test(async function test_Quote_Unquote_valid_inline() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [two]
  [quote [one [unquote two] three]]
]
`,
`
export function someFunc (two) {
return new $_gen_4.Brackets().setSpan(new $_gen_2.ReprStrSpan().setSrc($_gen_1).setPos(59).setLen(25)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_2.ReprStrSpan().setSrc($_gen_1).setPos(60).setLen(3)).setName("one"), two, new $_gen_3.IdentUnqual().setSpan(new $_gen_2.ReprStrSpan().setSrc($_gen_1).setPos(78).setLen(5)).setName("three"));
};
const $_gen_1 = "\\n[use \\"jisp:prelude.mjs\\" *]\\n\\n[func someFunc [two]\\n  [quote [one [unquote two] three]]\\n]\\n";
import * as $_gen_2 from "${rel(`../js/span.mjs`)}";
import * as $_gen_3 from "${rel(`../js/node_ident_unqual.mjs`)}";
import * as $_gen_4 from "${rel(`../js/node_brackets.mjs`)}";
`)

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[func someFunc [two]
  [quote [one [unquote two] three]]
]
`,
`
export function someFunc (two) {
return new $_gen_4.Brackets().setSpan(new $_gen_2.ReprStrSpan().setSrc($_gen_1).setPos(59).setLen(25)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_2.ReprStrSpan().setSrc($_gen_1).setPos(60).setLen(3)).setName("one"), two, new $_gen_3.IdentUnqual().setSpan(new $_gen_2.ReprStrSpan().setSrc($_gen_1).setPos(78).setLen(5)).setName("three"));
};
const $_gen_1 = "\\n[use \\"jisp:prelude.mjs\\" *]\\n\\n[func someFunc [two]\\n  [quote [one [unquote two] three]]\\n]\\n";
import * as $_gen_2 from "${rel(`../js/span.mjs`)}";
import * as $_gen_3 from "${rel(`../js/node_ident_unqual.mjs`)}";
import * as $_gen_4 from "${rel(`../js/node_brackets.mjs`)}";
`)
})

await t.test(async function test_Quote_Unquote_execution() {
  const root = new jr.Root().setFs(jdft.makeTestFs())
  const src = new URL(`test_quoting.jisp`, tu.TEST_SRC_URL).href
  const mod = await import(await root.reqModuleReadyPath(src))

  {
    const node = mod.quotedNum()
    t.inst(node, jnnu.Num)

    t.is(node.reqVal(), 123.456)
    t.is(node.reqStrVal(), `123.456`)
    t.is(node.compile(), `123.456`)
    t.is(node.decompile(), `123.456`)

    t.is(node.context(), `${src}:7:27

123.456]]
[func quotedStrBacktickSimple [] [quote \`some_text\`]]
[func quotedStrBacktickFenced [] [quote \`\`\`some_text\`\`\`]]
[func…`)
  }

  {
    const node = mod.quotedStrBacktickSimple()
    t.inst(node, jnst.StrBacktick)
    t.is(node.reqVal(), `some_text`)
    t.is(node.compile(), "`some_text`")
    t.is(node.decompile(), "`some_text`")
  }

  {
    const node = mod.quotedStrBacktickFenced()
    t.inst(node, jnst.StrBacktick)
    t.is(node.reqVal(), `some_text`)
    t.is(node.compile(), "`some_text`")
    t.is(node.decompile(), "```some_text```")
  }

  {
    const node = mod.quotedStrDoubleSimple()
    t.inst(node, jnst.StrDouble)
    t.is(node.reqVal(), `some_text`)
    t.is(node.compile(), `"some_text"`)
    t.is(node.decompile(), `"some_text"`)
  }

  {
    const node = mod.quotedStrDoubleFenced()
    t.inst(node, jnst.StrDouble)
    t.is(node.reqVal(), `some_text`)
    t.is(node.compile(), `"some_text"`)
    t.is(node.decompile(), `"""some_text"""`)
  }

  {
    const node = mod.quotedIdentUnqual()
    t.inst(node, jniu.IdentUnqual)
    t.is(node.reqName(), `someName`)
    t.is(node.compile(), `someName`)
    t.is(node.decompile(), `someName`)
  }

  {
    const node = mod.quotedIdentAccess()
    t.inst(node, jnia.IdentAccess)
    t.is(node.reqName(), `nameTwo`)
    t.is(node.compile(), `nameOne.nameTwo`)
    t.is(node.decompile(), `nameOne.nameTwo`)
  }

  {
    const node = mod.quotedIdentOper()
    t.inst(node, jnio.IdentOper)
    t.is(node.reqName(), `!@#`)
    t.throws(() => node.compile(), Error, `unable to compile operator [object IdentOper]`)
    t.is(node.decompile(), `!@#`)
  }

  {
    const node = mod.quotedBrackets()
    t.inst(node, jnbrk.Brackets)
    t.is(node.childCount(), 3)
    t.is(node.decompile(), `[10 20 30]`)
  }

  function testSame(fun) {
    function test(val) {t.is(fun(val), val)}

    test(10)
    test(`str`)
    test(Symbol.for(``))
    test([])
    test({})
  }

  testSame(mod.unquote1)
  testSame(mod.unquote2)
  testSame(mod.unquote3)
  testSame(mod.quoteUnquote)

  {
    t.throws(() => mod.quoteUnquoteBrackets(), Error, `expected instance of Node, got undefined

${src}:20:41

[10 [unquote val] \`str\`]]]
`)

    t.throws(() => mod.quoteUnquoteBrackets(10), Error, `expected instance of Node, got 10

${src}:20:41

[10 [unquote val] \`str\`]]]
`)

    const inner = new jniu.IdentUnqual().setName(`someName`)
    const outer = mod.quoteUnquoteBrackets(inner)

    t.is(outer.decompile(), `[10 [unquote val] \`str\`]`)
    t.inst(outer, jnbrk.Brackets)
    t.is(outer.childCount(), 3)

    t.inst(outer.reqChildAt(0), jnnu.Num)
    t.is(outer.reqChildAt(0).reqVal(), 10)

    t.is(outer.reqChildAt(1), inner)
    t.is(outer.reqChildAt(1).reqName(), `someName`)

    t.inst(outer.reqChildAt(2), jnst.Str)
    t.is(outer.reqChildAt(2).reqVal(), `str`)
  }
})

if (import.meta.main) ti.flush()

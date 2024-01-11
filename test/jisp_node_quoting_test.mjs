import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

function rel(path) {return new URL(path, import.meta.url)}

await t.test(async function test_Quote_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[quote]
`,
    `[object Quote] expected exactly 2 children, got 1 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[quote 10 20 30]
`,
    `[object Quote] expected exactly 2 children, got 4 children`,
  )
})

await t.test(async function test_Quote_valid_without_path() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[quote 10]
[quote "one"]
[quote one]
[quote [one]]
[quote [one two]]
[quote [one [two]]]
[quote [one [two [three]]]]
[quote [one [two [three four]]]]
`,
`
new $_gen_4.Num().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(36).setLen(2));
new $_gen_6.StrDouble().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(47).setLen(5));
new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(61).setLen(3));
new $_gen_7.Brackets().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(73).setLen(5)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(74).setLen(3)));
new $_gen_7.Brackets().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(87).setLen(9)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(88).setLen(3)), new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(92).setLen(3)));
new $_gen_7.Brackets().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(105).setLen(11)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(106).setLen(3)), new $_gen_7.Brackets().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(110).setLen(5)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(111).setLen(3))));
new $_gen_7.Brackets().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(125).setLen(19)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(126).setLen(3)), new $_gen_7.Brackets().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(130).setLen(13)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(131).setLen(3)), new $_gen_7.Brackets().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(135).setLen(7)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(136).setLen(5)))));
new $_gen_7.Brackets().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(153).setLen(24)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(154).setLen(3)), new $_gen_7.Brackets().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(158).setLen(18)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(159).setLen(3)), new $_gen_7.Brackets().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(163).setLen(12)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(164).setLen(5)), new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(170).setLen(4)))));
import * as $_gen_1 from "${rel(`../js/jisp_span.mjs`)}";
const $_gen_2 = "\\n[use \\"jisp:prelude.mjs\\" *]\\n\\n[quote 10]\\n[quote \\"one\\"]\\n[quote one]\\n[quote [one]]\\n[quote [one two]]\\n[quote [one [two]]]\\n[quote [one [two [three]]]]\\n[quote [one [two [three four]]]]\\n";
import * as $_gen_3 from "${rel(`../js/jisp_node_ident_unqual.mjs`)}";
import * as $_gen_4 from "${rel(`../js/jisp_node_num.mjs`)}";
import * as $_gen_5 from "${rel(`../js/jisp_node_quoting.mjs`)}";
import * as $_gen_6 from "${rel(`../js/jisp_node_str.mjs`)}";
import * as $_gen_7 from "${rel(`../js/jisp_node_brackets.mjs`)}";
`,
  )
})

await t.test(async function test_Quote_valid_with_path() {
  await jrt.testModuleCompile(
    jrt.makeModuleAddressed(),
`
[use "jisp:prelude.mjs" *]

[quote 10]
[quote "one"]
[quote one]
[quote [one]]
[quote [one two]]
[quote [one [two]]]
[quote [one [two [three]]]]
[quote [one [two [three four]]]]
`,
`
new $_gen_5.Num().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(36).setLen(2));
new $_gen_7.StrDouble().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(47).setLen(5));
new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(61).setLen(3));
new $_gen_8.Brackets().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(73).setLen(5)).setChildren(new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(74).setLen(3)));
new $_gen_8.Brackets().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(87).setLen(9)).setChildren(new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(88).setLen(3)), new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(92).setLen(3)));
new $_gen_8.Brackets().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(105).setLen(11)).setChildren(new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(106).setLen(3)), new $_gen_8.Brackets().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(110).setLen(5)).setChildren(new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(111).setLen(3))));
new $_gen_8.Brackets().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(125).setLen(19)).setChildren(new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(126).setLen(3)), new $_gen_8.Brackets().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(130).setLen(13)).setChildren(new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(131).setLen(3)), new $_gen_8.Brackets().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(135).setLen(7)).setChildren(new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(136).setLen(5)))));
new $_gen_8.Brackets().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(153).setLen(24)).setChildren(new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(154).setLen(3)), new $_gen_8.Brackets().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(158).setLen(18)).setChildren(new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(159).setLen(3)), new $_gen_8.Brackets().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(163).setLen(12)).setChildren(new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(164).setLen(5)), new $_gen_4.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setPath($_gen_2).setSrc($_gen_3).setPos(170).setLen(4)))));
import * as $_gen_1 from "../js/jisp_span.mjs";
const $_gen_2 = "${rel(`../test_files/test.jisp`)}";
const $_gen_3 = "\\n[use \\"jisp:prelude.mjs\\" *]\\n\\n[quote 10]\\n[quote \\"one\\"]\\n[quote one]\\n[quote [one]]\\n[quote [one two]]\\n[quote [one [two]]]\\n[quote [one [two [three]]]]\\n[quote [one [two [three four]]]]\\n";
import * as $_gen_4 from "../js/jisp_node_ident_unqual.mjs";
import * as $_gen_5 from "../js/jisp_node_num.mjs";
import * as $_gen_6 from "../js/jisp_node_quoting.mjs";
import * as $_gen_7 from "../js/jisp_node_str.mjs";
import * as $_gen_8 from "../js/jisp_node_brackets.mjs";
`,
  )
})

await t.test(async function test_Unquote_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[unquote]
`,
    `[object Unquote] expected exactly 2 children, got 1 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

[unquote 10 20]
`,
    `[object Unquote] expected exactly 2 children, got 3 children`,
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

await t.test(async function test_Unquote_valid() {
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

await t.test(async function test_Quote_Unquote_valid_without_path() {
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
return new $_gen_4.Brackets().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(59).setLen(25)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(60).setLen(3)), two, new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(78).setLen(5)));
};
import * as $_gen_1 from "${rel(`../js/jisp_span.mjs`)}";
const $_gen_2 = "\\n[use \\"jisp:prelude.mjs\\" *]\\n\\n[func someFunc [two]\\n  [quote [one [unquote two] three]]\\n]\\n";
import * as $_gen_3 from "${rel(`../js/jisp_node_ident_unqual.mjs`)}";
import * as $_gen_4 from "${rel(`../js/jisp_node_brackets.mjs`)}";
import * as $_gen_5 from "${rel(`../js/jisp_node_quoting.mjs`)}";
`)
})

await t.test(async function test_Quote_Unquote_valid_with_path() {
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
return new $_gen_4.Brackets().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(59).setLen(25)).setChildren(new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(60).setLen(3)), two, new $_gen_3.IdentUnqual().setSpan(new $_gen_1.ReprStrSpan().setSrc($_gen_2).setPos(78).setLen(5)));
};
import * as $_gen_1 from "${rel(`../js/jisp_span.mjs`)}";
const $_gen_2 = "\\n[use \\"jisp:prelude.mjs\\" *]\\n\\n[func someFunc [two]\\n  [quote [one [unquote two] three]]\\n]\\n";
import * as $_gen_3 from "${rel(`../js/jisp_node_ident_unqual.mjs`)}";
import * as $_gen_4 from "${rel(`../js/jisp_node_brackets.mjs`)}";
import * as $_gen_5 from "${rel(`../js/jisp_node_quoting.mjs`)}";
`)
})

if (import.meta.main) ti.flush()

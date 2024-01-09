import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './jisp_root_test.mjs'

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

await t.test(async function test_Quote_valid() {
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
new $_gen_3.Num().initSpanWith($_gen_2, 36, 2);
new $_gen_5.StrDouble().initSpanWith($_gen_2, 47, 5);
new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 61, 3);
new $_gen_6.Brackets().initSpanWith($_gen_2, 73, 5).setChildren(new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 74, 3));
new $_gen_6.Brackets().initSpanWith($_gen_2, 87, 9).setChildren(new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 88, 3), new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 92, 3));
new $_gen_6.Brackets().initSpanWith($_gen_2, 105, 11).setChildren(new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 106, 3), new $_gen_6.Brackets().initSpanWith($_gen_2, 110, 5).setChildren(new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 111, 3)));
new $_gen_6.Brackets().initSpanWith($_gen_2, 125, 19).setChildren(new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 126, 3), new $_gen_6.Brackets().initSpanWith($_gen_2, 130, 13).setChildren(new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 131, 3), new $_gen_6.Brackets().initSpanWith($_gen_2, 135, 7).setChildren(new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 136, 5))));
new $_gen_6.Brackets().initSpanWith($_gen_2, 153, 24).setChildren(new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 154, 3), new $_gen_6.Brackets().initSpanWith($_gen_2, 158, 18).setChildren(new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 159, 3), new $_gen_6.Brackets().initSpanWith($_gen_2, 163, 12).setChildren(new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 164, 5), new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 170, 4))));
import * as $_gen_1 from "${new URL(`../js/jisp_node_ident_unqual.mjs`, import.meta.url)}";
export const $_gen_2 = "\\n[use \\"jisp:prelude.mjs\\" *]\\n\\n[quote 10]\\n[quote \\"one\\"]\\n[quote one]\\n[quote [one]]\\n[quote [one two]]\\n[quote [one [two]]]\\n[quote [one [two [three]]]]\\n[quote [one [two [three four]]]]\\n";
import * as $_gen_3 from "${new URL(`../js/jisp_node_num.mjs`, import.meta.url)}";
import * as $_gen_4 from "${new URL(`../js/jisp_node_quoting.mjs`, import.meta.url)}";
import * as $_gen_5 from "${new URL(`../js/jisp_node_str.mjs`, import.meta.url)}";
import * as $_gen_6 from "${new URL(`../js/jisp_node_brackets.mjs`, import.meta.url)}";
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

await t.test(async function test_Quote_Unquote_valid() {
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
return new $_gen_3.Brackets().initSpanWith($_gen_2, 59, 25).setChildren(new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 60, 3), two, new $_gen_1.IdentUnqual().initSpanWith($_gen_2, 78, 5));
};
import * as $_gen_1 from "${new URL(`../js/jisp_node_ident_unqual.mjs`, import.meta.url)}";
export const $_gen_2 = "\\n[use \\"jisp:prelude.mjs\\" *]\\n\\n[func someFunc [two]\\n  [quote [one [unquote two] three]]\\n]\\n";
import * as $_gen_3 from "${new URL(`../js/jisp_node_brackets.mjs`, import.meta.url)}";
import * as $_gen_4 from "${new URL(`../js/jisp_node_quoting.mjs`, import.meta.url)}";
`)
})

if (import.meta.main) ti.flush()

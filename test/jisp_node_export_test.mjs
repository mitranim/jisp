import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jdft from './jisp_deno_fs_test.mjs'
import * as jrt from './jisp_root_test.mjs'
import * as jm from '../js/jisp_misc.mjs'
import * as jr from '../js/jisp_root.mjs'

await t.test(async function test_Export_invalid() {
  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[export]
`,
    `[object Export] expected between 2 and 3 children, got 1 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[export 10]
`,
    `[object Export] expected the child node at index 1 to be an instance of [function IdentUnqual], found [object Num]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[export 10 20 30]
`,
    `[object Export] expected between 2 and 3 children, got 4 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[export one]
`,
    `unable to find declaration of "one" at [object IdentUnqual]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[export one two three]
`,
    `[object Export] expected between 2 and 3 children, got 4 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[let one]
[export one two three]
`,
    `[object Export] expected between 2 and 3 children, got 4 children`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[let one]
[export one 10]
`,
    `[object Export] requires the target name to be either an unqualified identifier or a literal string, got [object Num]`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[let one]
[do [export one]]
`,
    `[object Export] can be used only in module root`,
  )

  await jrt.testModuleFail(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[let one]
[const two [export one]]
`,
    `[object Export] can only be used as a statement`,
  )
})

await t.test(async function test_Export_valid() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[.use "jisp:prelude.mjs" *]

[let one]
[export one]
[export one two]
[export one eval]
[export one arguments]
[export one throw]
[export one function]
[export one default]
[export one "quoted name"]
[export one \`quoted name\`]
[export one \`\`\`quoted name\`\`\`]
`,
`
export let one;
export {one};
export {one as two};
export {one as eval};
export {one as arguments};
export {one as throw};
export {one as function};
export {one as default};
export {one as "quoted name"};
export {one as "quoted name"};
export {one as "quoted name"};
`)
})

if (import.meta.main) ti.flush()

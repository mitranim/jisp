import {a} from '../js/dep.mjs'
import {t} from './test_dep.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jrt from './root_test.mjs'

await t.test(async function test_predecl_Nil() {
  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

nil
nil.one
nil.one.two
[nil]
[nil nil]
[[nil]]
[[nil nil]]
[[nil] nil]
[[nil nil] nil]
`,
`
undefined;
undefined.one;
undefined.one.two;
undefined();
undefined(undefined);
undefined()();
undefined(undefined)();
undefined()(undefined);
undefined(undefined)(undefined);
`,
  )
})

await t.test(async function test_predecl_Global() {
  return

  await jrt.testModuleCompile(
    jrt.makeModule(),
`
[use "jisp:prelude.mjs" *]

global
global.document
`,
`
globalThis;
globalThis.document;
`)
})

if (import.meta.main) ti.flush()

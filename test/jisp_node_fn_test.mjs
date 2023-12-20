import * as ti from './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as tu from './test_util.mjs'
import * as jnm from '../js/jisp_node_module.mjs'
import * as jr from '../js/jisp_root.mjs'

await t.test(async function test_Fn() {
  await t.test(async function test_with_ret_predeclared() {
    const mod = new jnm.Module().setParent(new jr.Root())

    mod.parse(`
[use "jisp:prelude" "*"]

[fn someFunc []
  [ret 10]
]
`)

    await mod.macro()

    tu.testCompiled(mod.compile(), `
function someFunc() {
return 10;
};
`)
  })

  await t.test(async function test_with_ret_shadowed() {
    const mod = new jnm.Module().setParent(new jr.Root())

    mod.parse(`
[use "jisp:prelude" "*"]

[fn someFunc []
  [const ret 10]
  [ret 20]
]
`)

    await mod.macro()

    tu.testCompiled(mod.compile(), `
function someFunc() {
const ret = 10;
ret(20);
};
`)
  })
})

if (import.meta.main) ti.flush()

import * as ti from './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as tu from './test_util.mjs'
import * as je from '../js/jisp_err.mjs'
import * as jnm from '../js/jisp_node_module.mjs'
import * as jr from '../js/jisp_root.mjs'

await t.test(async function test_If() {
  await t.test(async function test_invalid() {
    async function fail(src) {
      const mod = new jnm.Module().setParent(new jr.Root()).parse(src)

      await t.throws(
        async () => mod.macro(),
        je.CodeErr,
        `[object If] expected between 2 and 4 children, got 1 children`,
      )
    }

    await fail(`
[use "jisp:prelude" "*"]
[if]
`)

    await fail(`
[use "jisp:prelude" "*"]
[const someConst [if]]
`)
  })

  await t.test(async function test_as_statement() {
    const mod = new jnm.Module().setParent(new jr.Root())

    mod.parse(`
[use "jisp:prelude" "*"]

[if 10]

[if 10 20]

[if 10 20 30]
`)

    await mod.macro()

    tu.testCompiled(mod.compile(), `
if (10);
if (10) 20;;
if (10) 20;
else 30;;
`)
  })

  await t.test(async function test_as_expression() {
    const mod = new jnm.Module().setParent(new jr.Root())

    mod.parse(`
[use "jisp:prelude" "*"]

[const someConst1 [if 10]]

[const someConst2 [if 10 20]]

[const someConst3 [if 10 20 30]]
`)

    await mod.macro()

    tu.testCompiled(mod.compile(), `
const someConst1 = 10 ? undefined : undefined;
const someConst2 = 10 ? 20 : undefined;
const someConst3 = 10 ? 20 : 30;
`)
  })
})

if (import.meta.main) ti.flush()

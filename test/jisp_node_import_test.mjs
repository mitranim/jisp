import * as ti from './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as tu from './test_util.mjs'
import * as jnm from '../js/jisp_node_module.mjs'
import * as jr from '../js/jisp_root.mjs'

await t.test(async function test_Import_as_statement() {
  const mod = new jnm.Module().setParent(new jr.Root()).parse(`
[use "jisp:prelude" "*"]
[import "./some_other_module"]
[import "./some_other_module" mod]
`)

  await mod.macro()

  tu.testCompiled(mod.compile(), `
import "./some_other_module";
import * as mod from "./some_other_module";
`)
})

await t.test(async function test_Import_as_expression() {
  const mod = new jnm.Module().setParent(new jr.Root()).parse(`
[use "jisp:prelude" "*"]

[const someVal [import "./some_other_module"]]
`)

  await mod.macro()

  tu.testCompiled(mod.compile(), `
const someVal = import("./some_other_module");
`)
})

if (import.meta.main) ti.flush()

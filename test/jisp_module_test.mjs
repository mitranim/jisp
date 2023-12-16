import * as ti from './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'
import * as tu from './test_util.mjs'
import * as jdft from './jisp_deno_fs_test.mjs'
import * as jm from '../js/jisp_misc.mjs'
import * as jsp from '../js/jisp_span.mjs'
import * as jt from '../js/jisp_tokenizer.mjs'
import * as jl from '../js/jisp_lexer.mjs'
import * as jnv from '../js/jisp_node_val.mjs'
import * as jdfs from '../js/jisp_deno_fs.mjs'
import * as jr from '../js/jisp_root.mjs'
import * as jmo from '../js/jisp_module.mjs'
import * as jnst from '../js/jisp_node_str.mjs'
import * as jnnu from '../js/jisp_node_num.mjs'
import * as jnun from '../js/jisp_node_unqual_name.mjs'
import * as jna from '../js/jisp_node_access.mjs'
import * as jnk from '../js/jisp_node_key.mjs'
import * as jnbrk from '../js/jisp_node_brackets.mjs'

await t.test(async function test_Module_parsing_and_compiling_builtins() {
  const fs = jdft.makeTestFs()
  const mod = new jmo.Module()
  const src = await fs.readSrc(`test_builtins.jisp`)

  mod.parse(src)

  // The root provides `CodePrinter`, which is used by `.compile` calls below.
  mod.setParent(new jr.Root())

  const nodes = mod.optNodes()
  t.inst(nodes, Array)
  t.is(nodes.length, 7)

  {
    const node = nodes[0]
    t.inst(node, jnnu.Num)
    t.is(node.decompile(), `10`)
    t.is(node.ownVal(), 10)
    t.is(node.compile(), `10`)
  }

  {
    const node = nodes[1]
    t.inst(node, jnnu.Num)
    t.is(node.decompile(), `20.30`)
    t.is(node.ownVal(), 20.30)
    t.is(node.compile(), `20.30`)
  }

  {
    const node = nodes[2]
    t.inst(node, jnst.StrBacktick)
    t.is(node.decompile(), "`string_backtick`")
    t.is(node.ownVal(), `string_backtick`)
    t.is(node.compile(), "`string_backtick`")
  }

  {
    const node = nodes[3]
    t.inst(node, jnst.StrDouble)
    t.is(node.decompile(), `"string_double"`)
    t.is(node.ownVal(), `string_double`)
    t.is(node.compile(), `"string_double"`)
  }

  {
    const node = nodes[4]
    t.inst(node, jnun.UnqualName)
    t.is(node.decompile(), `identUnqualified`)
    t.is(node.compile(), `identUnqualified`)
  }

  {
    const node = nodes[5]
    t.inst(node, jna.Access)
    t.is(node.decompile(), `identNamespace.identQualified`)
    t.is(node.compile(), `identNamespace.identQualified`)

    {
      const expr = node.ownExpr()
      t.inst(expr, jnun.UnqualName)
      t.is(expr.decompile(), `identNamespace`)
      t.is(expr.compile(), `identNamespace`)
    }

    {
      const key = node.ownKey()
      t.inst(key, jnk.Key)
      t.is(key.decompile(), `.identQualified`)
      t.is(key.compile(), `.identQualified`)
    }
  }

  {
    const node = nodes[6]
    t.inst(node, jnbrk.Brackets)
    t.is(node.decompile(), `[40 50 60]`)
    t.is(node.compile(), `40(
50,
60
)`)
  }

  t.is(mod.compile().trim(), `
10;
20.30;
\`string_backtick\`;
"string_double";
identUnqualified;
identNamespace.identQualified;
40(
50,
60
);
`.trim())
})

await t.test(async function test_using_prelude() {
  const fs = jdft.makeTestFs()

  const root = new jr.Root()
  root.setFs(fs)

  // FIXME: tell root to load file.
  const src = await fs.readSrc(`test_using_prelude.jisp`)

  const mod = new jmo.Module()
  // Required for importing prelude.
  mod.setParent(root)

  mod.parse(src)
  await mod.macro()

  // const mod = new jmo.Module().setParent(root)
  // const root = new jr.Root().setFs(fs)
  // console.log(`root:`, root)
  // console.log(`src:`, src)
})

await t.test(async function test_Module() {
  return
  const fs = jdft.makeTestFs()
  const root = new jr.Root().setFs(fs)

  /*
  root -> ask for tar module -> compile to FS -> load from FS -> RAM cached
  root -> ask for tar module ->               -> load from FS -> RAM cached
  root -> ask for tar module ->                               -> RAM cached
  */

  const mod = new jmo.Module().setParent(root).fromStr(tu.SRC_TEXT).setUrl(tu.SRC_FILE_URL.href)
  // const mod = await root.initModule(`test_code.jisp`)

  await mod.macro()
  console.log(mod.compile())
})

if (import.meta.main) ti.flush()

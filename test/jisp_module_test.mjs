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
import * as jnm from '../js/jisp_node_module.mjs'
import * as jnst from '../js/jisp_node_str.mjs'
import * as jnnu from '../js/jisp_node_num.mjs'
import * as jniu from '../js/jisp_node_ident_unqual.mjs'
import * as jnia from '../js/jisp_node_ident_access.mjs'
import * as jnbrk from '../js/jisp_node_brackets.mjs'

await t.test(async function test_Module_parsing_and_compiling_builtins() {
  const fs = jdft.makeTestFs()
  const mod = new jnm.Module()
  const src = await fs.readSrc(`test_builtins.jisp`)

  mod.parse(src)

  // The root provides `CodePrinter`, which is used by `.compile` calls below.
  mod.setParent(new jr.Root())

  t.is(mod.childCount(), 7)

  {
    const node = mod.reqChildAt(0)
    t.inst(node, jnnu.Num)
    t.is(node.decompile(), `10`)
    t.is(node.ownVal(), 10)
    t.is(node.compile(), `10`)
  }

  {
    const node = mod.reqChildAt(1)
    t.inst(node, jnnu.Num)
    t.is(node.decompile(), `20.30`)
    t.is(node.ownVal(), 20.30)
    t.is(node.compile(), `20.30`)
  }

  {
    const node = mod.reqChildAt(2)
    t.inst(node, jnst.StrBacktick)
    t.is(node.decompile(), "`string_backtick`")
    t.is(node.ownVal(), `string_backtick`)
    t.is(node.compile(), "`string_backtick`")
  }

  {
    const node = mod.reqChildAt(3)
    t.inst(node, jnst.StrDouble)
    t.is(node.decompile(), `"string_double"`)
    t.is(node.ownVal(), `string_double`)
    t.is(node.compile(), `"string_double"`)
  }

  {
    const node = mod.reqChildAt(4)
    t.inst(node, jniu.IdentUnqual)
    t.is(node.decompile(), `identUnqualified`)
    t.is(node.compile(), `identUnqualified`)
  }

  {
    const node = mod.reqChildAt(5)
    t.inst(node, jnia.IdentAccess)

    t.is(a.pk(node), `identQualified`)
    t.is(node.ownName(), `identQualified`)

    {
      const src = node.reqFirstChild()
      t.inst(src, jniu.IdentUnqual)
      t.is(src.decompile(), `identNamespace`)
      t.is(src.compile(), `identNamespace`)
    }

    t.is(node.decompileOwn(), `.identQualified`)
    t.is(node.decompile(), `identNamespace.identQualified`)
    t.is(node.compile(), `identNamespace.identQualified`)
  }

  {
    const node = mod.reqChildAt(6)
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
  const root = new jr.Root().setFs(fs)

  // FIXME: tell root to load file.
  const src = await fs.readSrc(`test_using_prelude.jisp`)

  const mod = new jnm.Module()

  // Required for predeclared names and support for imports.
  mod.setParent(root)
  mod.parse(src)
  await mod.macro()

  // const mod = new jnm.Module().setParent(root)
  // const root = new jr.Root().setFs(fs)
  // console.log(`root:`, root)
  // console.log(`src:`, src)
})

// FIXME convert to something more useful.
// For example, convert to root test that verifies module caching.
await t.test(async function test_Module() {
  return
  const fs = jdft.makeTestFs()
  const root = new jr.Root().setFs(fs)

  /*
  root -> ask for tar module -> compile to FS -> load from FS -> RAM cached
  root -> ask for tar module ->               -> load from FS -> RAM cached
  root -> ask for tar module ->                               -> RAM cached
  */

  const mod = new jnm.Module().setParent(root).parse(tu.SRC_TEXT).setUrl(tu.SRC_FILE_URL.href)
  // const mod = await root.initModule(`test_code.jisp`)

  await mod.macro()
  console.log(mod.compile())
})

if (import.meta.main) ti.flush()

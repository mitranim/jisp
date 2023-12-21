import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jdft from './jisp_deno_fs_test.mjs'
import * as jm from '../js/jisp_misc.mjs'
import * as jcpd from '../js/jisp_code_printed.mjs'
import * as jnm from '../js/jisp_node_module.mjs'
import * as jnst from '../js/jisp_node_str.mjs'
import * as jnnu from '../js/jisp_node_num.mjs'
import * as jniu from '../js/jisp_node_ident_unqual.mjs'
import * as jnia from '../js/jisp_node_ident_access.mjs'
import * as jnbrk from '../js/jisp_node_brackets.mjs'

/*
Normally, a code printer is only available at `Root`.
Here we just want to test `Module` without involving `Root`.
*/
class PrintableModule extends jcpd.MixOwnCodePrinted.goc(jnm.Module) {}

await t.test(async function test_Module_parsing_and_compiling_builtins() {
  const fs = jdft.makeTestFs()
  const mod = new PrintableModule()
  const src = await fs.read(new jm.Url(`../test_files/test_builtins.jisp`, import.meta.url))

  mod.parse(src)

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
    t.is(node.compile(), `40(50, 60)`)
  }

  t.is(mod.compile().trim(), `
10;
20.30;
\`string_backtick\`;
"string_double";
identUnqualified;
identNamespace.identQualified;
40(50, 60);
`.trim())

  // tu.prn(`mod:`, mod)
  // console.log(`mod:`, mod)
})

if (import.meta.main) ti.flush()

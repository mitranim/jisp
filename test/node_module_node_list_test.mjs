import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as ti from './test_init.mjs'
import * as tu from './test_util.mjs'
import * as jdft from './deno_fs_test.mjs'
import * as jcpd from '../js/code_printed.mjs'
import * as jnmnl from '../js/node_module_node_list.mjs'
import * as jnst from '../js/node_str.mjs'
import * as jnnu from '../js/node_num.mjs'
import * as jniu from '../js/node_ident_unqual.mjs'
import * as jnia from '../js/node_ident_access.mjs'
import * as jnbrk from '../js/node_brackets.mjs'

/*
This file should test only parsing and compiling, without macroing, and should
be executed before any tests that involve macroing.
*/

/*
We add the code printer here because `DelimNodeList` requires it,
and normally it comes from `Root` which we don't want to involve here.
*/
class PrintableModuleNodeList extends jcpd.MixOwnCodePrinted.goc(jnmnl.ModuleNodeList) {}

await t.test(async function test_Module_parsing_and_compiling_builtins() {
  const fs = jdft.makeTestFs()
  const tar = new PrintableModuleNodeList()
  const src = await fs.reqRead(new URL(`test_builtins.jisp`, tu.TEST_SRC_URL))

  tar.parse(src)

  t.is(tar.childCount(), 7)

  {
    const node = tar.reqChildAt(0)
    t.inst(node, jnnu.Num)
    t.is(node.decompile(), `10`)
    t.is(node.ownVal(), 10)
    t.is(node.compile(), `10`)
  }

  {
    const node = tar.reqChildAt(1)
    t.inst(node, jnnu.Num)
    t.is(node.decompile(), `20.30`)
    t.is(node.ownVal(), 20.30)
    t.is(node.compile(), `20.30`)
  }

  {
    const node = tar.reqChildAt(2)
    t.inst(node, jnst.StrBacktick)
    t.is(node.decompile(), "`string_backtick`")
    t.is(node.ownVal(), `string_backtick`)
    t.is(node.compile(), "`string_backtick`")
  }

  {
    const node = tar.reqChildAt(3)
    t.inst(node, jnst.StrDouble)
    t.is(node.decompile(), `"string_double"`)
    t.is(node.ownVal(), `string_double`)
    t.is(node.compile(), `"string_double"`)
  }

  {
    const node = tar.reqChildAt(4)
    t.inst(node, jniu.IdentUnqual)
    t.is(node.decompile(), `identUnqualified`)
    t.is(node.compile(), `identUnqualified`)
  }

  {
    const node = tar.reqChildAt(5)
    t.inst(node, jnia.IdentAccess)

    t.is(a.pk(node), `identQualified`)
    t.is(node.reqName(), `identQualified`)

    {
      const src = node.reqFirstChild()
      t.inst(src, jniu.IdentUnqual)
      t.is(src.decompile(), `identNamespace`)
      t.is(src.compile(), `identNamespace`)
    }

    t.is(node.decompile(), `identNamespace.identQualified`)
    t.is(node.compile(), `identNamespace.identQualified`)
  }

  {
    const node = tar.reqChildAt(6)
    t.inst(node, jnbrk.Brackets)
    t.is(node.decompile(), `[40 50 60]`)
    t.is(node.compile(), `40(50, 60)`)
  }

  t.is(tar.compile().trim(), `
10;
20.30;
\`string_backtick\`;
"string_double";
identUnqualified;
identNamespace.identQualified;
40(50, 60);
`.trim())

  // tu.prn(`tar:`, tar)
  // console.log(`tar:`, tar)
})

if (import.meta.main) ti.flush()

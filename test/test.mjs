import * as ti from './test_init.mjs'
import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'
import * as tu from './test_util.mjs'
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

await t.test(async function test_DenoFs() {
  const fs = new jdfs.DenoFs()

  await t.test(async function test_src() {
    t.is(fs.ownSrc(), undefined)
    t.is(fs.resolveSrc(`.`), ``)
    t.is(fs.resolveSrc(`one`), `one`)
    t.is(fs.resolveSrc(`./one`), `one`)
    t.is(fs.resolveSrc(`one/two`), `one/two`)
    t.is(fs.resolveSrc(`./one/two`), `one/two`)

    fs.setSrc(`one`)
    t.is(fs.ownSrc(), `one`)
    t.is(fs.resolveSrc(`.`), `one`)
    t.is(fs.resolveSrc(`two`), `one/two`)
    t.is(fs.resolveSrc(`./two`), `one/two`)
    t.is(fs.resolveSrc(`two/three`), `one/two/three`)
    t.is(fs.resolveSrc(`./two/three`), `one/two/three`)

    fs.setSrc(`./one`)
    t.is(fs.ownSrc(), `./one`)
    t.is(fs.resolveSrc(`.`), `one`)
    t.is(fs.resolveSrc(`two`), `one/two`)
    t.is(fs.resolveSrc(`./two`), `one/two`)
    t.is(fs.resolveSrc(`two/three`), `one/two/three`)
    t.is(fs.resolveSrc(`./two/three`), `one/two/three`)

    fs.setSrc(`.`)
    const src = await fs.readSrc(`test_files/test_src.txt`)
    t.is(src, `This is a source file for FS testing.`)
  })

  await t.test(async function test_tar() {
    t.is(fs.ownTar(), undefined)
    t.is(fs.resolveTar(`.`), ``)
    t.is(fs.resolveTar(`one`), `one`)
    t.is(fs.resolveTar(`./one`), `one`)
    t.is(fs.resolveTar(`one/two`), `one/two`)
    t.is(fs.resolveTar(`./one/two`), `one/two`)

    fs.setTar(`one`)
    t.is(fs.ownTar(), `one`)
    t.is(fs.resolveTar(`.`), `one`)
    t.is(fs.resolveTar(`two`), `one/two`)
    t.is(fs.resolveTar(`./two`), `one/two`)
    t.is(fs.resolveTar(`two/three`), `one/two/three`)
    t.is(fs.resolveTar(`./two/three`), `one/two/three`)

    fs.setTar(`.tmp`)
    t.is(fs.ownSrc(), `.`)
    t.is(fs.ownTar(), `.tmp`)

    await fs.writeTar(`test_tar.txt`, await fs.readSrc(`test_files/test_src.txt`))
    const tar = await fs.readTar(`test_tar.txt`)
    t.is(tar, `This is a source file for FS testing.`)
  })
})

function makeTestFs() {
  return new jdfs.DenoFs().setSrc(`test_files`).setTar(`.tmp`)
}

t.test(function test_Tokenizer() {
  function test(src) {
    const tokens = jt.Tokenizer.tokensFromStr(src)
    // tu.prn(`tokens:`, tokens)
  }

  test(tu.SRC_TEXT_SHORT)
  test(tu.SRC_TEXT)
})

t.test(function test_Lexer() {
  function test(src) {
    const nodes = jl.Lexer.nodesFromStr(src)
    // tu.prn(`nodes:`, nodes)
  }

  test(tu.SRC_TEXT_SHORT)
  test(tu.SRC_TEXT)
})

// Incomplete. TODO test termination.
t.test(function test_Num_parse() {
  t.is(
    testParseFull(jnnu.Num, `-12_345.6_7_8`).ownVal(),
    -12_345.6_7_8,
  )
})

// t.test(function test_Path() {
//   t.test(function test_Path_parse() {
//     // TODO more cases.
//     testParsePath(`one.two`, [`one`, `two`])
//     testParsePath(`one.two.three`, [`one`, `two`, `three`])
//   })
// })

// function testParsePath(src, names) {
//   const cls = j.Path
//   const tar = testParseFull(cls, src)
//   t.eq(tar.getNodes().map(j.decompile), names)
// }

function testParseFull(cls, src) {
  const srcSpan = new jsp.StrSpan().init(src)
  t.is(srcSpan.ownPos(), 0)
  t.is(srcSpan.ownLen(), src.length)

  const node = cls.parse(srcSpan)
  t.is(node.reqSpan().decompile(), src)
  t.is(srcSpan.ownPos(), src.length)
  t.is(srcSpan.ownLen(), src.length)

  return node
}

t.test(function test_UnqualName() {
  const cls = jnun.UnqualName

  // TODO more cases.
  t.test(function test_parse() {
    testParseFull(cls, `one`)
  })

  t.test(function test_isValid() {
    t.ok(cls.isValid(`_`))
    t.ok(cls.isValid(`$`))
    t.ok(cls.isValid(`a`))
    t.ok(cls.isValid(`abc`))
    t.ok(cls.isValid(`_abc`))
    t.ok(cls.isValid(`$abc`))
    t.ok(cls.isValid(`_12`))
    t.ok(cls.isValid(`$12`))
    t.ok(cls.isValid(`a12`))
    t.ok(cls.isValid(`abc12`))

    t.no(cls.isValid(``))
    t.no(cls.isValid(`12`))
    t.no(cls.isValid(` `))
    t.no(cls.isValid(`one.two`))
  })
})

t.test(function test_Val() {
  function make(val) {return new jnv.Val().setVal(val)}
  function test(src, exp) {t.eq(make(src).compile(), exp)}

  test(undefined, `undefined`)
  test(null, `null`)
  test(false, `false`)
  test(true, `true`)
  test(10, `10`)
  test(20.30, `20.3`)
  test(`str`, `"str"`)
  test([], `[]`)
  test([undefined, null, true, 10.20, `str`], `[undefined, null, true, 10.2, "str"]`)
  test([[]], `[[]]`)
  test([[[]]], `[[[]]]`)
  test([{}], `[{}]`)
  test({}, `{}`)
  test({one: 10}, `{one: 10}`)
  test({one: 10, two: 20}, `{one: 10, two: 20}`)
  test({one: `two`}, `{one: "two"}`)
  test({one: `two`, three: `four`}, `{one: "two", three: "four"}`)
  test({12.34: 56}, `{12.34: 56}`)
  test({'-10': 20}, `{"-10": 20}`)
  test({'one.two': `three.four`}, `{"one.two": "three.four"}`)
})

await t.test(async function test_Module_parsing_and_compiling_builtins() {
  const fs = makeTestFs()
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
  const fs = makeTestFs()

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
  const fs = makeTestFs()
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

if (ti.cli.boolOpt(`bench`)) t.deopt(), t.benches()

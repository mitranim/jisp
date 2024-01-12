import * as a from '/Users/m/code/m/js/all.mjs'
import * as t from '/Users/m/code/m/js/test.mjs'
import * as p from '/Users/m/code/m/js/path.mjs'
import * as io from '/Users/m/code/m/js/io_deno.mjs'
import * as je from '../js/jisp_err.mjs'
import * as jsp from '../js/jisp_span.mjs'

export const TEST_SRC_URL = new URL(`../test_files/`, import.meta.url)
export const TEST_TAR_NAME = `.tmp`
export const TEST_TAR_URL = new URL(`../.tmp/`, import.meta.url)
export const SRC_TEXT = Deno.readTextFileSync(new URL(`test_code.jisp`, TEST_SRC_URL)).trim()

export const SRC_TEXT_SHORT = `
10 20
;; comment ;;
"double quoted"
\`grave quoted\`
* && >>>
$long_Ident_$123
one.two.three
[({30})]
`.trim()

/*
Useful for inspection printing with a description, especially for structures
that don't use `MixInsp` or for deep structures (because this sets an infinite
depth).
*/
export function prn(desc, val) {console.log(desc, insp(val))}

export function insp(val) {return Deno.inspect(val, inspectOpt)}

export const inspectOpt = {
  depth: Infinity,
  colors: true,
  compact: true,
  trailingComma: true,
  showHidden: true,
  getters: true,
}

export function clearTar() {
  try {
    Deno.removeSync(TEST_TAR_URL, {recursive: true})
  }
  catch (err) {
    if (a.isInst(err, Deno.errors.NotFound)) return
    throw err
  }
}

export function testCompiled(act, exp) {
  act = a.trim(act)
  exp = a.trim(exp)

  if (act !== exp) {
    throw new t.AssertError(`
mismatch of compiled text and expected text

actual:

${act}

expected:

${exp}
`)
  }
}

function testSpan(src) {
  const tar = new jsp.StrSpan().init(src)
  t.is(tar.ownPos(), 0)
  t.is(tar.ownLen(), src.length)
  return tar
}

export function testParseFail(cls, src) {
  const span = testSpan(src)

  const tar = cls.parse(span)
  if (a.isNil(tar)) return undefined

  throw new t.AssertError(`
node class: ${a.show(cls)}

source code:

${src}

expected \`${a.show(cls)}.parse\` to return nil

got node: ${a.show(tar)}

decompiled representation:

${tar.decompile()}
`)
}

export function testParseComplete(cls, src) {
  const srcSpan = new jsp.StrSpan().init(src)
  t.is(srcSpan.ownPos(), 0)
  t.is(srcSpan.ownLen(), src.length)

  const node = cls.parse(srcSpan)
  t.inst(node, cls)

  t.is(node.reqSpan().decompile(), src)
  t.is(srcSpan.ownPos(), src.length)
  t.is(srcSpan.ownLen(), src.length)

  return node
}

export function testParsePartial({cls, src, dec, rem}) {
  const srcSpan = new jsp.StrSpan().init(src)
  t.is(srcSpan.ownPos(), 0)
  t.is(srcSpan.ownLen(), src.length)

  const node = cls.parse(srcSpan)
  t.inst(node, cls)

  t.is(node.reqSpan().decompile(), dec)
  t.is(srcSpan.decompile(), rem)

  /*
  The parsing method of the given node class, typically `Text.parse`, should
  modify the original span's position but not length.
  */
  t.is(srcSpan.ownPos(), dec.length)
  t.is(srcSpan.ownLen(), src.length)

  return node
}

export function testErrWithCode(err) {
  t.inst(err, je.Err)
  t.ok(err.optHasCode(), `expecting error ${a.show(err)} to have source code context`)
}

export function testErrWithoutCode(err) {
  t.inst(err, je.Err)
  t.no(err.optHasCode(), `expecting error ${a.show(err)} to not have source code context`)
}
